import { getDictionary } from "../../lib/dictionary";

const PORTFOLIO_URL = "https://mahfoudh.dev";

export default async function ProfileStructuredData({ lang }: { lang: string }) {
    const dict = await getDictionary(lang);
    const url = lang === "fr" || lang === "ar" ? `${PORTFOLIO_URL}/${lang}` : PORTFOLIO_URL;
    const data = {
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        "@id": `${url}#profile`,
        url,
        inLanguage: lang,
        name: dict.home.name,
        mainEntity: {
            "@type": "Person",
            "@id": `${PORTFOLIO_URL}/#person`,
            name: "Mahfoudh Arous",
            url: PORTFOLIO_URL,
            image: `${PORTFOLIO_URL}/me.webp`,
            description: dict.home.role,
            sameAs: [
                "https://github.com/aladin002dz",
                "https://www.linkedin.com/in/mahfoudh-arous/",
                "https://www.youtube.com/@mahfoudh-tech-fr",
                "https://www.youtube.com/@mahfoudh-tech-ar",
                "https://www.youtube.com/@mahfoudh-tech-en",
            ],
        },
    };
    return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
