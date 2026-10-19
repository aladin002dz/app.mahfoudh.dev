# Portfolio analytics and guestbook plan

Date: 19 October 2026  
Site: https://mahfoudh.dev  
Status: Planning only. This document does not confirm deployment or provision services.

## Objective

Host the portfolio on Vercel, add cookieless Vercel Web Analytics, and use Supabase for a small moderated guestbook and private feedback form. Keep the existing portfolio fast and usable in English, French, and Arabic.

## Agreed direction

- Vercel for hosting and Web Analytics; no Google Analytics or additional analytics provider.
- Supabase for feedback storage. Accept the possibility of free-project inactivity pauses; verify current plan behavior during setup.
- Minimize personal data. Email is personal data: make it optional, private, and use it only to reply.
- No visitor accounts or newsletter in the first release.
- No analytics cookies. Avoid introducing cookies through optional features without reviewing their behavior.

## Proposed first-release defaults

These details are recommendations to implement unless adjusted during review:

- A compact homepage invitation and a dedicated guestbook page in each language.
- Prompt: “What should I build, teach, or write about next?”
- Required plain-text message, 10–2,000 characters.
- Category: suggestion, feedback, or greeting.
- Optional nickname, maximum 80 characters.
- Optional email, labelled “Only if you’d like a reply.”
- Private by default. A separate unchecked option permits public publication after review.
- Public publication permission is independent of providing an email.
- Manual moderation through the Supabase dashboard; no custom admin interface yet.
- No attachments, rich HTML, reactions, replies, or public email addresses.

## Current repository baseline

At planning time, the working tree already contains migration edits: static export settings were removed from `next.config.ts`, the GitHub Pages deployment workflow and `public/CNAME` are marked deleted, and the README describes Vercel hosting. Locale layout changes also exist.

Preserve and review these edits. The README is not evidence that the live Vercel deployment, Git integration, domain, or DNS has been verified.

Before writing application code, read the applicable guides in `node_modules/next/dist/docs/`, as required by `AGENTS.md`.

## Phase 1 — Verify hosting and migration

- [ ] Review the existing migration diff and confirm the intended Vercel account, project, repository, and production branch.
- [ ] Verify the appropriate hosting plan for the site's actual use and review usage limits.
- [ ] Verify Node.js and pnpm compatibility and run lint and production build.
- [ ] Test a preview deployment before changing the live domain.
- [ ] Preserve `/`, `/en`, `/fr`, `/ar`, canonical URLs, language alternates, metadata, sitemap, robots, favicon, and social preview.
- [ ] Check unsupported language URLs return 404 and Arabic remains RTL.
- [ ] Verify the custom domain, HTTPS, and preferred host redirect. Preserve email DNS records.
- [ ] Confirm GitHub Pages is disabled when Vercel takes over; document the previous DNS target and rollback procedure.
- [ ] Confirm the live site after domain cutover. Do not equate local configuration with a completed migration.

## Phase 2 — Add Vercel Web Analytics

- [ ] Enable Web Analytics for the verified Vercel project and integrate the official Next.js component into both root layout trees without duplicate pageview tracking.
- [ ] Keep tracking limited to production; exclude local development and previews.
- [ ] Verify pageviews, client-side navigation, referrers, and language paths in the dashboard.
- [ ] Keep names, emails, message content, and sensitive query parameters out of analytics.
- [ ] Add a short privacy disclosure explaining aggregated analytics and feedback storage.

Planning reference: Vercel currently lists 50,000 monthly events shared across Hobby projects, a one-month reporting window, and no custom events on Hobby. Recheck at setup. Collection limits are separate from hosting limits.

The first release will use pageview analytics only. Feedback counts come from Supabase; do not build a substitute click-tracking system or upgrade for custom events at this stage.

## Phase 3 — Create Supabase storage and permissions

- [ ] Create or select the intended Supabase project and choose a region appropriate for visitors and the Vercel backend.
- [ ] Save schema changes as versioned SQL migrations in the repository.
- [ ] Enable Row Level Security and explicitly restrict table privileges.
- [ ] Keep all feedback submission writes behind a Next.js server endpoint. Do not grant anonymous direct inserts that bypass spam checks.
- [ ] Give public readers access only to approved entries whose authors permitted publication, through a deliberately limited projection containing no email.
- [ ] Keep private fields and pending/rejected entries inaccessible to anonymous and ordinary authenticated visitors.
- [ ] Prevent visitors from updating, deleting, approving, or publishing entries.
- [ ] Keep secret/service credentials in server-only environment variables; never use a `NEXT_PUBLIC_` prefix for them.
- [ ] Test permissions with public credentials, rather than relying only on the privileged dashboard.

### Suggested record

| Field | Purpose |
| --- | --- |
| `id` | Generated identifier |
| `created_at` | Submission timestamp |
| `message` | Validated plain-text feedback |
| `category` | Suggestion, feedback, or greeting |
| `nickname` | Optional public display name |
| `email` | Optional private reply address |
| `locale` | Validated `en`, `fr`, or `ar` |
| `publication_allowed` | Explicit permission to display the entry publicly |
| `moderation_status` | Pending, approved, or rejected; server-controlled |
| `published_at` | Publication timestamp, when applicable |
| `privacy_notice_version` | Version of the notice shown on submission |

Email must never be included in a public API response. RLS filters rows, so also use column privileges or a safe projection to protect private fields. Any public view must be reviewed for its RLS and execution behavior.

## Phase 4 — Build the submission flow

- [ ] Add translated labels, validation errors, publication permission text, and success/unavailable states.
- [ ] Validate all fields on the server; reject unexpected values and enforce request-size limits.
- [ ] Treat messages as text and render without executing HTML.
- [ ] Add a honeypot and enforce rate limits in shared storage or a managed service, not process-local memory.
- [ ] Verify request origin as an additional check; do not treat it as the primary defense against abuse.
- [ ] Avoid storing raw IP addresses in feedback records. If rate limiting uses a short-lived hashed identifier, document its retention and treat it as potentially personal data.
- [ ] Review spam protection for cookie behavior. Add a challenge only if needed and after checking its privacy implications.
- [ ] Prevent accidental duplicate submissions and preserve the visitor's text after a failed request without persisting it in browser storage.
- [ ] Show success only after Supabase confirms the write.
- [ ] On timeout or a paused project, show a useful unavailable state and contact link. Do not promise automatic recovery or queue messages silently.

Suggested request path: browser → Next.js endpoint → validation and spam controls → Supabase → confirmed response.

## Phase 5 — Public guestbook and moderation

- [ ] Show approved, publication-permitted messages only, newest first, with bounded pagination.
- [ ] Include a welcoming empty state and a graceful unavailable state.
- [ ] Support mixed Arabic, French, and English messages with appropriate text direction.
- [ ] Separate private feedback from publishable entries in the moderation workflow.
- [ ] Document approving, rejecting, unpublishing, deleting, and replying to feedback using the dashboard and existing email tools.
- [ ] Ensure unpublishing or deleting an entry removes it from the public page promptly, including any caches.
- [ ] Keep preview submissions separate from production using a separate project or isolated environment. Preview deployments must not expose production feedback.

## Phase 6 — Privacy and retention

- [ ] Explain required and optional fields, purpose, public visibility, service providers, and the deletion contact.
- [ ] State that emails are for feedback replies only and never for newsletter enrollment.
- [ ] Confirm a retention policy before launch. Proposed starting policy: remove reply addresses after 90 days, remove rejected/spam submissions within 30 days, and retain approved public messages until withdrawal or removal.
- [ ] Define retention for other private messages and rate-limit identifiers.
- [ ] Choose manual scheduled reviews or a documented cleanup mechanism; do not imply deletion is automatic unless implemented and verified.
- [ ] Avoid logging request bodies or email addresses; review deployment and database logs for unintended exposure.
- [ ] Document free-project pause recovery, export/recovery options, and who performs moderation and maintenance.

## Acceptance checks

- [ ] Lint and production build pass.
- [ ] English, French, and Arabic work on mobile and desktop with keyboard-accessible forms and readable errors.
- [ ] Public submission succeeds; private feedback stays private; publishable feedback remains pending until approval.
- [ ] Public requests cannot retrieve emails or private/pending entries or change moderation fields.
- [ ] Invalid, oversized, spam, rate-limited, and duplicate requests are handled correctly.
- [ ] Timeout/database-unavailable states preserve input and never display false success.
- [ ] Approving, unpublishing, and deleting entries produce the expected public result.
- [ ] Preview data and credentials are isolated from production.
- [ ] Analytics records production navigation without duplicates or sensitive data, and browser inspection confirms no analytics cookies are introduced.
- [ ] Production domain, HTTPS, SEO metadata, language routes, and contact email still work.

## Release order

1. Review existing migration changes and verify Vercel hosting.
2. Add and verify Web Analytics.
3. Configure Supabase schema, permissions, and isolated preview environment.
4. Build and verify feedback submission and public guestbook.
5. Review translated UI, privacy notice, retention, and moderation workflow.
6. Deploy the reviewed release and verify the live flow.

This request authorizes creation of this plan. Deployment, domain changes, and external service configuration are subsequent implementation steps, not actions performed by this document.

## Official references

- Vercel Web Analytics pricing: https://vercel.com/docs/analytics/limits-and-pricing
- Vercel Web Analytics privacy: https://vercel.com/docs/analytics/privacy-policy
- Vercel Hobby plan: https://vercel.com/docs/plans/hobby
- Supabase database security: https://supabase.com/docs/guides/database/secure-data
- Supabase Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
