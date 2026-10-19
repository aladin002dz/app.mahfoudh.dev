import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";
import { localePath } from "../../lib/site";

export default function SiteHeader({ lang }: { lang: string }) {
    return (
        <header className="sticky top-0 z-50 border-b border-line bg-bg/85 backdrop-blur-md">
            <div className="mx-auto flex max-w-[1120px] items-center gap-4 px-6 py-3.5">
                <a href={localePath(lang)} dir="ltr" className="font-sans text-[22px] font-semibold leading-none tracking-[-0.03em] text-ink">
                    Mahfoudh<span className="text-accent">.</span>
                </a>
                <div className="ms-auto flex items-center gap-2.5">
                    <LanguageSwitcher currentLang={lang} />
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}
