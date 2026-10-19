-- Public approximate visit total, starting 19 October 2026. No historical seed.
begin;
create table public.site_visit_total (
    singleton boolean primary key default true check (singleton),
    total bigint not null default 0 check (total >= 0),
    started_on date not null default '2026-10-19'
);
insert into public.site_visit_total (singleton) values (true);
create table public.site_visit_sessions (
    id uuid primary key,
    created_at timestamptz not null default now()
);
create index site_visit_sessions_created_at on public.site_visit_sessions (created_at);
alter table public.site_visit_total enable row level security;
alter table public.site_visit_sessions enable row level security;
revoke all on public.site_visit_total, public.site_visit_sessions from public, anon, authenticated;

create function public.record_site_visit(p_visit_id uuid)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
    inserted integer;
    result bigint;
begin
    if p_visit_id is null then raise exception 'visit ID required'; end if;
    -- Serialize increments and retries, including simultaneous requests for one ID.
    select total into result from public.site_visit_total where singleton for update;
    delete from public.site_visit_sessions where created_at < now() - interval '24 hours';
    insert into public.site_visit_sessions (id) values (p_visit_id) on conflict do nothing;
    get diagnostics inserted = row_count;
    if inserted = 1 then
        update public.site_visit_total set total = total + 1 where singleton returning total into result;
    end if;
    return result;
end;
$$;
revoke all on function public.record_site_visit(uuid) from public, anon, authenticated;
grant execute on function public.record_site_visit(uuid) to anon;
commit;
