import type { Metadata } from "next";
import "../globals.css";
import InlineScript from "../components/InlineScript";
import SiteAnalytics from "../components/SiteAnalytics";
import { fontVariables, themeInitScript } from "../fonts";
import { IS_PRODUCTION, SITE_URL, LANGUAGE_ALTERNATES, OG_IMAGE } from "../../lib/site";

const title = "Mahfoudh Arous | Senior Software Engineer & Full-stack Developer";
const description =
    "Portfolio of Mahfoudh Arous, a Senior Software Engineer & Full-stack Developer specializing in React, Next.js, and modern web technologies.";

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: title,
        template: "%s | Mahfoudh Arous",
    },
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
        "Frontend Engineer",
    ],
    authors: [{ name: "Mahfoudh Arous", url: "https://github.com/aladin002dz" }],
    creator: "Mahfoudh Arous",
    publisher: "Mahfoudh Arous",
    alternates: {
        canonical: SITE_URL,
        languages: LANGUAGE_ALTERNATES,
    },
    openGraph: {
        title,
        description,
        url: SITE_URL,
        siteName: "Mahfoudh Arous Portfolio",
        locale: "en_US",
        type: "website",
        images: [OG_IMAGE],
    },
    twitter: {
        card: "summary_large_image",
        title,
        description,
        creator: "@aladin002dz",
        images: [OG_IMAGE.url],
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
    verification: {
        google: "bhjLeUKzdYIiFHKUo6x8-2aVZJKnqgb2UklehgxsWfU",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" dir="ltr" suppressHydrationWarning>
            <head>
                <InlineScript html={themeInitScript} />
            </head>
            <body className={`${fontVariables} font-sans antialiased`}>
                {children}
                {IS_PRODUCTION && <SiteAnalytics />}
            </body>
        </html>
    );
}
