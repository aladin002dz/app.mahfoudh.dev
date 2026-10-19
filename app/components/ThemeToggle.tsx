"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun, Laptop } from "lucide-react";

type Theme = "light" | "dark" | "system";

// `themeInitScript` applies the saved theme before hydration; this component
// only reads it back and cycles it.
const THEME_EVENT = "themechange";

function subscribe(onChange: () => void) {
    window.addEventListener("storage", onChange);
    window.addEventListener(THEME_EVENT, onChange);
    return () => {
        window.removeEventListener("storage", onChange);
        window.removeEventListener(THEME_EVENT, onChange);
    };
}

const getSnapshot = (): Theme => (localStorage.getItem("theme") as Theme | null) ?? "system";
// The server can't know the saved theme, so it renders a placeholder.
const getServerSnapshot = (): Theme | null => null;

function applyTheme(t: Theme) {
    const isDark = t === "dark" || (t === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", isDark);
}

export default function ThemeToggle() {
    const theme = useSyncExternalStore<Theme | null>(subscribe, getSnapshot, getServerSnapshot);

    if (!theme) return <div className="h-[34px] w-[34px]" />;

    const toggleTheme = () => {
        const next: Theme = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
        localStorage.setItem("theme", next);
        applyTheme(next);
        window.dispatchEvent(new Event(THEME_EVENT));
    };

    const Icon = theme === "light" ? Sun : theme === "dark" ? Moon : Laptop;
    return (
        <button onClick={toggleTheme} aria-label="Toggle theme" title={`Theme: ${theme}`}
            className="grid h-[34px] w-[34px] place-items-center rounded-btn border border-line text-ink transition-colors duration-150 hover:bg-sunken">
            <Icon className="h-4 w-4" />
        </button>
    );
}
