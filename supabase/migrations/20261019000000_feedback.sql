-- Guestbook and private feedback.
--
-- Access model: the site's server uses the publishable (anon) key, and that
-- role has NO privileges on the tables. It can only execute the three
-- SECURITY DEFINER functions at the bottom of this file:
--   submit_feedback  inserts one pending row (validated, deduplicated, rate-limited)
--   list_guestbook   returns approved, publication-permitted rows, never email
--   keep_alive       purges expired rate-limit rows; the daily cron calls it
-- Moderation happens in the Supabase dashboard, which uses a privileged role.

create type public.feedback_category as enum ('suggestion', 'feedback', 'greeting');
create type public.moderation_status as enum ('pending', 'approved', 'rejected');

create table public.feedback (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz not null default now(),
    -- Generated once per form load, so a double-click or retry can't store the same message twice.
    submission_id uuid not null unique,
    message text not null check (char_length(message) between 2 and 2000),
    category public.feedback_category not null,
    nickname text check (nickname is null or char_length(nickname) between 1 and 80),
    email text check (
        email is null
        or (char_length(email) <= 254 and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$')
    ),
    locale text not null check (locale in ('en', 'fr', 'ar')),
    publication_allowed boolean not null default false,
    moderation_status public.moderation_status not null default 'pending',
    published_at timestamptz,
    privacy_notice_version text not null check (char_length(privacy_notice_version) between 1 and 32)
);

comment on column public.feedback.email is 'Private. Only for replying; never returned by any public function.';
comment on column public.feedback.published_at is 'Maintained by trigger: set while approved and publication_allowed, null otherwise.';

create index feedback_public_idx on public.feedback (published_at desc, id desc)
    where moderation_status = 'approved' and publication_allowed;

-- Short-lived, hashed visitor identifiers for rate limiting. Rows older than
-- 24 hours are deleted by submit_feedback and keep_alive.
create table public.feedback_rate_limits (
    key text not null check (char_length(key) between 16 and 128),
    created_at timestamptz not null default now()
);

create index feedback_rate_limits_key_idx on public.feedback_rate_limits (key, created_at);
create index feedback_rate_limits_created_idx on public.feedback_rate_limits (created_at);

alter table public.feedback enable row level security;
alter table public.feedback_rate_limits enable row level security;

-- Supabase grants table privileges to these roles by default; take them all back.
-- With RLS on and no policies, any grant re-added by mistake still exposes nothing.
revoke all on table public.feedback from public, anon, authenticated;
revoke all on table public.feedback_rate_limits from public, anon, authenticated;

-- published_at follows moderation: approving a publishable entry stamps it once,
-- and rejecting or un-approving it clears the stamp so it drops off the page.
create function public.feedback_sync_published_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    if new.moderation_status = 'approved' and new.publication_allowed then
        new.published_at := coalesce(new.published_at, now());
    else
        new.published_at := null;
    end if;
    return new;
end;
$$;

create trigger feedback_sync_published_at
    before insert or update on public.feedback
    for each row execute function public.feedback_sync_published_at();

create function public.submit_feedback(
    p_submission_id uuid,
    p_message text,
    p_category text,
    p_nickname text,
    p_email text,
    p_locale text,
    p_publication_allowed boolean,
    p_privacy_notice_version text,
    p_rate_key text
)
returns text -- 'created' | 'duplicate' | 'rate_limited'
language plpgsql
security definer
set search_path = ''
as $$
declare
    per_visitor_per_hour constant integer := 5;
    everyone_per_hour constant integer := 200;
begin
    if p_submission_id is null then
        raise exception 'submission id is required' using errcode = '22023';
    end if;
    if p_rate_key is null or char_length(p_rate_key) not between 16 and 128 then
        raise exception 'invalid rate key' using errcode = '22023';
    end if;

    if exists (select 1 from public.feedback where submission_id = p_submission_id) then
        return 'duplicate';
    end if;

    delete from public.feedback_rate_limits where created_at < now() - interval '24 hours';

    if (select count(*) from public.feedback_rate_limits
            where key = p_rate_key and created_at > now() - interval '1 hour') >= per_visitor_per_hour
        or (select count(*) from public.feedback_rate_limits
            where created_at > now() - interval '1 hour') >= everyone_per_hour
    then
        return 'rate_limited';
    end if;

    -- moderation_status and published_at are deliberately not parameters:
    -- every submission starts pending and unpublished.
    insert into public.feedback (
        submission_id, message, category, nickname, email, locale,
        publication_allowed, privacy_notice_version
    )
    values (
        p_submission_id,
        btrim(p_message),
        p_category::public.feedback_category,
        nullif(btrim(p_nickname), ''),
        nullif(lower(btrim(p_email)), ''),
        p_locale,
        coalesce(p_publication_allowed, false),
        p_privacy_notice_version
    )
    on conflict (submission_id) do nothing;

    if not found then
        return 'duplicate';
    end if;

    insert into public.feedback_rate_limits (key) values (p_rate_key);
    return 'created';
end;
$$;

create function public.list_guestbook(
    p_limit integer default 20,
    p_before timestamptz default null
)
returns table (
    id uuid,
    created_at timestamptz,
    published_at timestamptz,
    message text,
    category public.feedback_category,
    nickname text
)
language sql
stable
security definer
set search_path = ''
as $$
    select f.id, f.created_at, f.published_at, f.message, f.category, f.nickname
    from public.feedback f
    where f.moderation_status = 'approved'
        and f.publication_allowed
        and f.published_at is not null
        and (p_before is null or f.published_at < p_before)
    order by f.published_at desc, f.id desc
    limit least(greatest(coalesce(p_limit, 20), 1), 50);
$$;

create function public.keep_alive()
returns integer -- number of expired rate-limit rows removed
language plpgsql
security definer
set search_path = ''
as $$
declare
    removed integer;
begin
    delete from public.feedback_rate_limits where created_at < now() - interval '24 hours';
    get diagnostics removed = row_count;
    return removed;
end;
$$;

-- New functions are executable by PUBLIC by default; grant only what the site needs.
revoke all on function public.feedback_sync_published_at() from public, anon, authenticated;
revoke all on function public.submit_feedback(uuid, text, text, text, text, text, boolean, text, text) from public, anon, authenticated;
revoke all on function public.list_guestbook(integer, timestamptz) from public, anon, authenticated;
revoke all on function public.keep_alive() from public, anon, authenticated;

grant execute on function public.submit_feedback(uuid, text, text, text, text, text, boolean, text, text) to anon;
grant execute on function public.list_guestbook(integer, timestamptz) to anon;
grant execute on function public.keep_alive() to anon;
