# Guestbook, feedback and analytics: operations

How the pieces fit, how to set them up, and how to run them day to day.

## How it works

```
browser form ──POST /api/feedback──▶ Next.js route (validation, honeypot, origin check)
                                        │  publishable key, server-only env var
                                        ▼
                               Supabase: submit_feedback()  ──▶ feedback table (pending)
guestbook page ──on each visit──▶ Supabase: list_guestbook() ──▶ approved + publishable rows, no email
Vercel Cron (daily) ──▶ /api/keep-alive ──▶ Supabase: keep_alive()
```

- The site only ever holds the **publishable** key. In the database that key (role
  `anon`) has **no table privileges at all**: it can only execute
  `submit_feedback`, `list_guestbook` and `keep_alive`. Even if the key leaked, it
  could not read emails, read private or pending entries, or approve, edit or
  delete anything. The secret key stays in the Supabase dashboard and is not
  needed on Vercel.
- Rate limits live in the database: 5 messages per visitor per hour, 200 per hour
  for everyone. A visitor is a daily-rotating HMAC of their IP; raw IPs are never
  stored, and the hashes are deleted after 24 hours.
- Every submission starts `pending`. An entry appears publicly only when it is
  `approved` **and** its author ticked the publication box.
- The guestbook page reads entries on every visit, so approving, rejecting or
  deleting an entry shows on the next page load. There is no cache to purge.
- Analytics: Vercel Web Analytics, pageviews only, rendered only when
  `VERCEL_ENV=production`, with query strings stripped. No cookies.

All schema lives in `supabase/migrations/`. The access rules were tested against
Postgres with Supabase's default grants recreated (31 checks: direct table access
denied for `anon` and `authenticated`, pending/private/rejected rows never listed,
email never returned, duplicates and rate limits enforced).

## One-time setup

### 1. Vercel project
1. Import the GitHub repository in Vercel. It detects Next.js; no build settings needed.
2. Check the first preview deployment works before touching the domain.
3. **Analytics → Enable** Web Analytics for the project.
4. Add `mahfoudh.dev` under **Settings → Domains** and update DNS at the registrar
   to what Vercel shows. Keep any existing MX/TXT email records.
5. After the domain serves from Vercel, disable GitHub Pages under the repository's
   **Settings → Pages**. Rollback: re-enable Pages and point DNS back to GitHub
   (`185.199.108.153`–`185.199.111.153` A records), then redeploy `main` from
   before the migration.

### 2. Two Supabase projects
Create **two** projects: `mahfoudh-dev` for production and
`mahfoudh-dev-preview` for preview deployments, so test messages never mix
with real ones and previews can't read production data. Free plans allow two
active projects. Choose a region close to Vercel's default (`iad1`, US East)
or to your visitors.

In each project, open **SQL Editor**, paste
`supabase/migrations/20261019000000_feedback.sql` and run it. (Or with the
Supabase CLI: `supabase link` then `supabase db push`.)

### 3. Environment variables (Vercel → Settings → Environment Variables)

| Name | Production | Preview |
| --- | --- | --- |
| `SUPABASE_URL` | production project URL | preview project URL |
| `SUPABASE_PUBLISHABLE_KEY` | production publishable key | preview publishable key |
| `FEEDBACK_RATE_LIMIT_SECRET` | random 64-hex string | a different random string |
| `CRON_SECRET` | random 64-hex string | (not needed; crons run on production only) |

Generate random values with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

For local development, copy `.env.example` to `.env.local` with the preview values.
Without these variables the site still builds and runs; the form and guestbook
show their "unavailable" state.

### 4. Verify permissions with the public key
In a terminal, with the production URL and publishable key:

```bash
curl "$SUPABASE_URL/rest/v1/feedback?select=email" -H "apikey: $SUPABASE_PUBLISHABLE_KEY"
```

It must answer `permission denied for table feedback` (HTTP 401/403), never rows.

## Moderation

New messages are in **Table Editor → feedback**, filtered on
`moderation_status = pending`. Rows with `publication_allowed = false` are private
feedback: read them, reply if there is an email, and leave or reject them. They can
never be shown publicly, even if approved.

| To… | Do this |
| --- | --- |
| Publish an entry | Set `moderation_status` to `approved` (only works if `publication_allowed` is true) |
| Unpublish | Set `moderation_status` to `rejected` (or back to `pending`) |
| Delete | Delete the row |
| Reply | Email the address in `email` from your own mail client |

`published_at` is maintained by a trigger; don't edit it by hand. Changes show on
the next page load.

## Retention (proposed, not automated)

Nothing is deleted automatically except rate-limit hashes (24 hours). Before launch,
confirm a policy and run it on a schedule, for example monthly in the SQL Editor.
The plan's proposed starting point:

```sql
-- Remove reply addresses after 90 days.
update public.feedback set email = null
where email is not null and created_at < now() - interval '90 days';

-- Remove rejected entries after 30 days.
delete from public.feedback
where moderation_status = 'rejected' and created_at < now() - interval '30 days';
```

Still to decide: how long to keep private (non-publishable) messages. If you
publish a retention period, add it to the privacy text in `dictionaries/` and bump
`PRIVACY_NOTICE_VERSION` in `lib/feedback.ts`.

## If the project pauses

The daily cron should prevent free-plan pauses. If the project pauses anyway, the
form shows "unavailable" with the contact email, nothing is lost or queued, and the
guestbook shows "can't be loaded". Restore it from the Supabase dashboard
(**Project → Restore**). To export data at any time: **Table Editor → feedback →
Export to CSV**, or `supabase db dump --data-only`.

## Changing the privacy text

The privacy section is `guestbook.privacy` in each file in `dictionaries/`. When
its meaning changes, bump `PRIVACY_NOTICE_VERSION` in `lib/feedback.ts`; each entry
stores the version its author saw.
