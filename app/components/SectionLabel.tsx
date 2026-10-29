import { ReactNode } from "react";

export default function SectionLabel({ index, tone = "accent", children, as: Tag = "div" }: { index?: string; tone?: "accent" | "clay"; children: ReactNode; as?: "div" | "h2" }) {
    return (
        <Tag className={`flex items-center gap-3 font-mono text-xs font-medium uppercase tracking-[0.08em] ${tone === "clay" ? "text-clay" : "text-accent-ink"}`}>
            {index && <span dir="ltr" aria-hidden="true">{index}</span>}
            {index && <span aria-hidden="true" className="h-px w-6 bg-current" />}
            {/* Plex Mono has no Arabic glyphs, and tracking breaks Arabic letter joining. */}
            <span className="rtl:font-arabic rtl:tracking-normal">{children}</span>
        </Tag>
    );
}
