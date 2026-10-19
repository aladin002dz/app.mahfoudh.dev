# mahfoudh.dev

Personal portfolio of Mahfoudh Arous — [mahfoudh.dev](https://mahfoudh.dev).

Built with Next.js (App Router), React, TypeScript and Tailwind CSS, with a
Supabase-backed guestbook and Vercel Web Analytics.
Hosted on Vercel, which builds and deploys every push to `main` and gives each
pull request its own preview URL.

## Local development

```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm build    # production build into ./.next
pnpm start    # serve the production build on :3000
pnpm lint
```

## Structure

| Path | What it holds |
| --- | --- |
| `app/(root)/` | The bare domain (`/`), which serves the English page directly |
| `app/(locales)/[lang]/` | `/en`, `/fr`, `/ar` |
| `app/components/HomeContent.tsx` | The page itself, shared by both routes |
| `app/components/SiteHeader.tsx`, `SiteFooter.tsx` | Header and footer shared by every page |
| `app/(root)/guestbook/`, `app/(locales)/[lang]/guestbook/` | `/guestbook`, `/fr/guestbook`, `/ar/guestbook` |
| `app/components/GuestbookContent.tsx`, `FeedbackForm.tsx` | Guestbook page, entry list and form |
| `app/api/feedback/route.ts` | Receives form submissions |
| `app/api/keep-alive/route.ts`, `vercel.json` | Daily cron that keeps Supabase awake |
| `lib/feedback.ts` | Feedback limits and validation, shared by form and server |
| `supabase/migrations/` | Database schema and access rules |
| `docs/guestbook.md` | Setup, moderation, retention and recovery |
| `dictionaries/` | UI copy per locale (`en`, `fr`, `ar`) |
| `public/me.webp` | Hero photo (shown in a 4:5 frame with `object-cover`) |
| `lib/site.ts` | Canonical site URL, contact address, YouTube links, locale list |
| `app/robots.ts`, `app/sitemap.ts` | Generated `robots.txt` and `sitemap.xml` |
| `app/icon.png` | Favicon (32×32) |
| `public/og.png` | Social preview image (1200×630) |

## Content notes

- The YouTube section links to three channels (`@mahfoudh-tech-fr`, `-ar`, `-en`).
  The URLs are the `YT_FR`, `YT_AR` and `YT_EN` constants in `lib/site.ts`; the
  channel labels live in `dictionaries/`.
- The guestbook's text, including its privacy notice, is under `guestbook` in each
  file in `dictionaries/`.

## URL and SEO conventions

- **English lives at the bare domain.** `https://mahfoudh.dev` renders the English
  page; `/en` still builds so older inbound links keep working, but it declares
  `https://mahfoudh.dev` as its canonical URL rather than competing with it.
- All canonical, `hreflang` and Open Graph URLs come from `SITE_URL` in
  `lib/site.ts`. Change the domain there and nowhere else.
- The social preview is a static `public/og.png` and the favicon a static
  `app/icon.png`. They date from the GitHub Pages era, when generated image
  routes shipped as extensionless files with the wrong content type; on Vercel
  `app/opengraph-image.tsx` / `app/icon.tsx` would work if you want them back.
- Only `en`, `fr` and `ar` exist under `[lang]`: `dynamicParams = false` in its
  layout makes any other segment a 404 instead of rendering on demand.
- `sitemap.ts` pins `lastModified` to a constant rather than `new Date()`, so a
  redeploy doesn't re-stamp every URL as changed. Bump it when the page content
  actually changes.
- `robots.ts` deliberately omits the `host` directive: only Yandex ever read it,
  and it takes a bare hostname rather than the full URL.

## Guestbook and analytics

See [docs/guestbook.md](docs/guestbook.md) for how the guestbook works, the
Supabase and Vercel setup, environment variables (`.env.example`), moderation and
data retention. Without the Supabase variables the site still builds; the form
shows an "unavailable" message.

## Deployment notes

- Vercel detects Next.js and needs no `vercel.json`. The project is linked to this
  repository in the Vercel dashboard, with `main` as the production branch.
- `mahfoudh.dev` is configured under **Project → Settings → Domains** in Vercel,
  with DNS at the registrar pointing there. HTTPS certificates are automatic.
- GitHub Pages is no longer used. Its source must stay disabled under
  **Settings → Pages**, or it would claim the custom domain again.
