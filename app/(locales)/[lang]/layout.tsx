import type { Metadata } from "next";
import "../../globals.css";
import InlineScript from "../../components/InlineScript";
import SiteAnalytics from "../../components/SiteAnalytics";
import { fontVariables, themeInitScript } from "../../fonts";
import {
    IS_PRODUCTION,
    SITE_URL,
    LOCALES,
    LANGUAGE_ALTERNATES,
    OG_IMAGE,
    localeUrl,
} from "../../../lib/site";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ lang: string }>;
}): Promise<Metadata> {
    const { lang } = await params;

    const titles: Record<string, string> = {
        en: "Mahfoudh Arous | Senior Software Engineer & Full-stack Developer",
        fr: "Mahfoudh Arous | Ingénieur Logiciel Senior & Développeur Full-stack",
        ar: "محفوظ عروس | مهندس برمجيات سينيور ومطور شامل",
    };

    const descriptions: Record<string, string> = {
        en: "Portfolio of Mahfoudh Arous, a Senior Software Engineer & Full-stack Developer specializing in React, Next.js, and modern web technologies.",
        fr: "Portfolio de Mahfoudh Arous, Ingénieur Logiciel Senior & Développeur Full-stack spécialisé en React, Next.js et technologies web modernes.",
        ar: "الموقع الشخصي لمحفوظ عروس، مهندس برمجيات سينيور ومطور شامل متخصص في React و Next.js وتقنيات الويب الحديثة.",
    };

    const ogLocales: Record<string, string> = {
        en: "en_US",
        fr: "fr_FR",
        ar: "ar_AR",
    };

    const title = titles[lang] || titles.en;
    const description = descriptions[lang] || descriptions.en;
    const ogLocale = ogLocales[lang] || "en_US";

    // English is served from the bare domain, so /en points its canonical there
    // instead of competing with it.
    const canonicalUrl = localeUrl(lang);

    return {
        title,
        description,
        keywords: [
            "Software Engineer",
            "Full-stack Developer",
            "React",
            "Next.js",
            "Portfolio",
            "Mahfoudh Arous",
            "Web Development",
            "TypeScript",
            "Frontend",
            "Backend",
        ],
        authors: [{ name: "Mahfoudh Arous", url: "https://github.com/aladin002dz" }],
        creator: "Mahfoudh Arous",
        publisher: "Mahfoudh Arous",
        metadataBase: new URL(SITE_URL),
        alternates: {
            canonical: canonicalUrl,
            languages: LANGUAGE_ALTERNATES,
        },
        openGraph: {
            title,
            description,
            url: canonicalUrl,
            siteName: "Mahfoudh Arous Portfolio",
            locale: ogLocale,
            type: "website",
            images: [OG_IMAGE],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [OG_IMAGE.url],
            creator: "@aladin002dz",
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                "max-video-preview": -1,
                "max-image-preview": "large",
                "max-snippet": -1,
            },
        },
    };
}

// Any segment other than a known locale is a 404, not a page rendered on demand.
export const dynamicParams = false;

export async function generateStaticParams() {
    return LOCALES.map((lang) => ({ lang }));
}

export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;
    const isArabic = lang === "ar";

    return (
        <html lang={lang} dir={isArabic ? "rtl" : "ltr"} suppressHydrationWarning>
            <head>
                <InlineScript html={themeInitScript} />
            </head>
            <body
                className={`${fontVariables} ${isArabic ? "font-arabic" : "font-sans"} antialiased`}
            >
                {children}
                {IS_PRODUCTION && <SiteAnalytics />}
            </body>
        </html>
    );
}
