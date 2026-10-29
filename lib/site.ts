export const SITE_URL = "https://app.mahfoudh.dev";

/** Preferred origin for the duplicated portfolio; app pages keep SITE_URL. */
export const PORTFOLIO_URL = "https://mahfoudh.dev";

export const CONTACT_EMAIL = "hello@mahfoudh.dev";

export const YT_FR = "https://www.youtube.com/@mahfoudh-tech-fr";
export const YT_AR = "https://www.youtube.com/@mahfoudh-tech-ar";
export const YT_EN = "https://www.youtube.com/@mahfoudh-tech-en";

/**
 * True only for Vercel's production deployment, never for previews or local
 * builds. Vercel sets `VERCEL_ENV` at build time, so static pages bake it in.
 */
export const IS_PRODUCTION = process.env.VERCEL_ENV === "production";

export const LOCALES = ["en", "fr", "ar"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: string): value is Locale {
    return (LOCALES as readonly string[]).includes(value);
}

/**
 * English is served from the bare domain (https://mahfoudh.dev); the other
 * locales live under /<lang>. `/en` still builds so old inbound links keep
 * working, but it declares the bare domain as its canonical URL.
 */
export function localeUrl(lang: string): string {
    return lang === DEFAULT_LOCALE ? PORTFOLIO_URL : `${PORTFOLIO_URL}/${lang}`;
}

/** Site-relative path of a page in a locale: English at the bare path, others under /<lang>. */
export function localePath(lang: string, page = ""): string {
    const prefix = lang === DEFAULT_LOCALE || !isLocale(lang) ? "" : `/${lang}`;
    return `${prefix}${page}` || "/";
}

export const GUESTBOOK_PATH = "/guestbook";

export const GUESTBOOK_ALTERNATES: Record<string, string> = {
    en: `${SITE_URL}${GUESTBOOK_PATH}`,
    fr: `${SITE_URL}/fr${GUESTBOOK_PATH}`,
    ar: `${SITE_URL}/ar${GUESTBOOK_PATH}`,
    "x-default": `${SITE_URL}${GUESTBOOK_PATH}`,
};

export const LANGUAGE_ALTERNATES: Record<string, string> = {
    en: PORTFOLIO_URL,
    fr: `${PORTFOLIO_URL}/fr`,
    ar: `${PORTFOLIO_URL}/ar`,
    "x-default": PORTFOLIO_URL,
};

export const OG_IMAGE = {
    url: "/og.png",
    width: 1200,
    height: 630,
    alt: "Mahfoudh Arous - Senior Software Engineer & Full-stack Developer",
};
