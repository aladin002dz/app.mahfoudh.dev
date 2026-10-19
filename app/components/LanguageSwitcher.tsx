"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { localePath } from "../../lib/site";

const languages = [
    { code: "en", label: "EN" },
    { code: "fr", label: "FR" },
    { code: "ar", label: "ع" },
];

export default function LanguageSwitcher({ currentLang }: { currentLang: string }) {
    const pathname = usePathname();

    // Same page in another locale: strip the current locale prefix, then let
    // localePath add the new one (none for English, which lives at the bare path).
    const page = (pathname ?? "").replace(/^\/(en|fr|ar)(?=\/|$)/, "").replace(/\/$/, "");
    const redirectedPathName = (locale: string) => localePath(locale, page);

    return (
        <div dir="ltr" className="inline-flex gap-0.5 rounded-btn border border-line p-0.5">
            {languages.map((lang) => {
                const on = currentLang === lang.code;
                return (
                    <Link key={lang.code} href={redirectedPathName(lang.code)} aria-current={on ? "true" : undefined}
                        className={`grid h-7 min-w-9 place-items-center rounded px-2 text-xs font-medium transition-colors duration-150 ${lang.code === "ar" ? "font-arabic text-[13px]" : "font-mono"} ${on ? "bg-inverse text-on-inverse" : "text-muted hover:bg-sunken"}`}>
                        {lang.label}
                    </Link>
                );
            })}
        </div>
    );
}
