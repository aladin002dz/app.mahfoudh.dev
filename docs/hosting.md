# Hosting split — 21 October 2026

| Site | Repository | Hosting |
| --- | --- | --- |
| https://mahfoudh.dev | aladin002dz/aladin002dz.github.io | GitHub Pages, static Next.js export |
| https://app.mahfoudh.dev | aladin002dz/app.mahfoudh.dev | Vercel, dynamic Next.js |
| https://mahfoudh.dev/777-ai-in-practice-slides/ | aladin002dz/777-ai-in-practice-slides | GitHub Pages, project base path |

The static portfolio preserves the pre-vercel-2026-10-19 design and content. The dynamic version retains the guestbook, server APIs, visit counter and existing design system: https://github.com/aladin002dz/my-design-system. No redesign was introduced for this split.

Push static portfolio changes to aladin002dz.github.io/main; its Actions workflow exports to out/ and deploys Pages. Push dynamic changes to app.mahfoudh.dev/main; Vercel deploys them to app.mahfoudh.dev. These are independent sources: changes do not synchronize automatically.

Cloudflare DNS-only CNAME records:
- @ -> aladin002dz.github.io (Cloudflare flattens the apex record)
- www -> aladin002dz.github.io
- app -> e9674616b7ed7a41.vercel-dns-017.com

GitHub Pages custom domain: mahfoudh.dev on aladin002dz.github.io only. The slides have no separate custom domain and retain /777-ai-in-practice-slides as their build base path. Vercel keeps app.mahfoudh.dev; apex and www were detached after the cutover. Email and unrelated subdomain records were preserved.

Local working copies prepared for this split:
- C:/work/workshops/workshop-2026-10-10/portfolio-static
- C:/work/workshops/workshop-2026-10-10/portfolio-dynamic
- C:/work/workshops/workshop-2026-10-10/online-session-15-10-2026/workshop-practical-ai-slides-ii

Do not rename the repositories again as part of routine deployment. The repository named app.mahfoudh.dev contains the dynamic app; the domain assignment is controlled by hosting settings and DNS, not that repository name.