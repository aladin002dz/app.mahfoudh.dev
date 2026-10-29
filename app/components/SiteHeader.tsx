"use client";

import { useEffect, useRef, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";

const copy = {
    en: { nav: "Page sections", menu: "Menu", youtube: "YouTube", speaking: "Speaking & Community", projects: "Projects", guestbook: "Message" },
    fr: { nav: "Sections de la page", menu: "Menu", youtube: "YouTube", speaking: "Conférences & communauté", projects: "Projets", guestbook: "Message" },
    ar: { nav: "أقسام الصفحة", menu: "القائمة", youtube: "يوتيوب", speaking: "المحاضرات والمجتمع", projects: "المشاريع", guestbook: "رسالة" },
};
const sections = ["youtube", "speaking", "projects", "guestbook"] as const;

export default function SiteHeader({ lang, home = false }: { lang: string; home?: boolean }) {
    const t = copy[lang as keyof typeof copy] ?? copy.en;
    const path = lang === "fr" ? "/fr" : lang === "ar" ? "/ar" : "/";
    const header = useRef<HTMLElement>(null);
    const progress = useRef<HTMLDivElement>(null);
    const menu = useRef<HTMLDetailsElement>(null);
    const [active, setActive] = useState("");

    useEffect(() => {
        const bar = progress.current;
        const top = header.current;
        if (!bar || !top) return;
        let frame = 0;
        const update = () => {
            frame = 0;
            const height = top.getBoundingClientRect().height;
            const max = document.documentElement.scrollHeight - innerHeight;
            const ratio = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
            bar.style.transform = `scaleX(${ratio})`;
            if (home) {
                let current = "";
                for (const id of sections) {
                    const section = document.getElementById(id);
                    if (section && section.getBoundingClientRect().top <= height + 80) current = id;
                }
                if (ratio > 0.995 && scrollY > 0) current = "guestbook";
                setActive(current);
            }
        };
        const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
        const sizing = new ResizeObserver(() => {
            document.documentElement.style.setProperty("--site-header-height", `${top.getBoundingClientRect().height}px`);
            schedule();
        });
        sizing.observe(top);
        sizing.observe(document.body);
        window.addEventListener("scroll", schedule, { passive: true });
        window.addEventListener("resize", schedule);
        update();
        return () => {
            cancelAnimationFrame(frame);
            sizing.disconnect();
            window.removeEventListener("scroll", schedule);
            window.removeEventListener("resize", schedule);
            document.documentElement.style.removeProperty("--site-header-height");
        };
    }, [home]);

    const links = sections.map(id => (
        <a key={id} href={`${home ? "" : path}#${id}`} aria-current={active === id ? "location" : undefined}
            className="section-nav-link" onClick={() => { if (menu.current) menu.current.open = false; }}>
            {t[id]}
        </a>
    ));

    return (
        <header ref={header} className="site-header sticky top-0 z-50 border-b border-line bg-bg/85 backdrop-blur-md">
            <div className="header-row mx-auto flex max-w-[1120px] items-center gap-4 px-6 py-3.5">
                <a href={path} dir="ltr" className="font-sans text-[22px] font-semibold leading-none tracking-[-0.03em] text-ink">
                    Mahfoudh<span className="text-accent">.</span>
                </a>
                <nav className="desktop-section-nav" aria-label={t.nav}>{links}</nav>
                <div className="ms-auto flex items-center gap-2.5">
                    <LanguageSwitcher currentLang={lang} />
                    <ThemeToggle />
                </div>
                <details ref={menu} className="mobile-section-menu" onKeyDown={event => {
                    if (event.key === "Escape" && menu.current) {
                        menu.current.open = false;
                        menu.current.querySelector("summary")?.focus();
                    }
                }}>
                    <summary aria-label={t.menu} className="mobile-menu-trigger">
                        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M3 5h12M3 9h12M3 13h12" />
                        </svg>
                    </summary>
                    <nav className="mobile-section-nav" aria-label={t.nav}>{links}</nav>
                </details>
            </div>
            <div className="scroll-progress-track" aria-hidden="true"><div ref={progress} className="scroll-progress-fill" /></div>
        </header>
    );
}
