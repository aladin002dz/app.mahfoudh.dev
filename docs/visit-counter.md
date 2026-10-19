# Public visit counter

The footer shows an approximate total of site visits since **19 October 2026**
in English, French and Arabic. It starts at zero, without importing past traffic.

Apply `supabase/migrations/20261019000001_site_visits.sql` in the production
Supabase SQL Editor before deploying. No new environment variables are needed.
The endpoint only records visits when `VERCEL_ENV=production`; previews and local
development hide the counter. Database outages also hide it rather than showing
a fabricated number.

A random UUID is stored in `sessionStorage` for a fixed 30-minute window per tab.
Refreshes, page navigation, language changes and request retries reuse that ID.
The database atomically increments only for new IDs. There are no cookies,
fingerprints, stored IP addresses or browsing histories. If storage is blocked,
an in-memory fallback deduplicates within the loaded document only.

Deduplication IDs older than 24 hours are removed on the next recorded visit;
the aggregate total remains. Tables use RLS and deny direct access to `anon`
and `authenticated`. Only the counting RPC is granted to `anon`, matching the
existing server-only publishable-key setup.

This is a lightweight visit counter, not an exact count of unique people or an
audited metric: new tabs, cleared storage and bots can affect it. The same-origin
API guard prevents casual cross-site requests but is not bot protection.

To verify without changing production totals, use a database transaction that
calls the RPC twice with the same UUID and once with a new UUID, checks that only
two increments occur, tests table access as `anon`, and rolls back the transaction.
