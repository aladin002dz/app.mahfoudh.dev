import type { MetadataRoute } from "next";
import { GUESTBOOK_ALTERNATES } from "../lib/site";

export const dynamic = "force-static";

// Explicit content-change date; do not replace with the build timestamp.
const GUESTBOOK_LAST_MODIFIED = new Date("2026-10-29T00:00:00.000Z");
const languages = {
    en: GUESTBOOK_ALTERNATES.en,
    fr: GUESTBOOK_ALTERNATES.fr,
    ar: GUESTBOOK_ALTERNATES.ar,
};

export default function sitemap(): MetadataRoute.Sitemap {
    // Portfolio copies canonicalise to mahfoudh.dev and belong in its sitemap.
    // /en/guestbook canonicalises to /guestbook and is also excluded here.
    return (["en", "fr", "ar"] as const).map(lang => ({
        url: GUESTBOOK_ALTERNATES[lang],
        lastModified: GUESTBOOK_LAST_MODIFIED,
        changeFrequency: "weekly" as const,
        priority: 0.5,
        alternates: { languages },
    }));
}
