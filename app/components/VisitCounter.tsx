"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "site-visit-v1";
const VISIT_WINDOW = 30 * 60 * 1000;
let memoryVisit: { id: string; started: number } | undefined;

function visitId() {
    try {
        const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "null");
        if (saved && typeof saved.id === "string" && typeof saved.started === "number"
            && Date.now() - saved.started >= 0 && Date.now() - saved.started < VISIT_WINDOW) {
            memoryVisit = saved;
        }
    } catch { /* Storage may be blocked; keep a tab-local fallback. */ }
    if (!memoryVisit || Date.now() - memoryVisit.started >= VISIT_WINDOW) {
        memoryVisit = { id: crypto.randomUUID(), started: Date.now() };
    }
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(memoryVisit)); } catch { /* Optional. */ }
    return memoryVisit.id;
}

export default function VisitCounter({ lang, label, since }: { lang: string; label: string; since: string }) {
    const [total, setTotal] = useState<number | null>(null);
    useEffect(() => {
        const controller = new AbortController();
        async function load() {
            try {
                const response = await fetch("/api/visits", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ visitId: visitId() }),
                    signal: controller.signal,
                });
                if (!response.ok) return;
                const data = await response.json();
                if (Number.isSafeInteger(data.total) && data.total >= 0) setTotal(data.total);
            } catch { /* A counter outage must not interrupt the page. */ }
        }
        void load();
        return () => controller.abort();
    }, []);

    if (total === null) return null;
    return (
        <p className="text-xs leading-relaxed text-subtle">
            <bdi>{new Intl.NumberFormat(lang).format(total)}</bdi> {label}
            <span aria-hidden="true"> · </span>
            <span>{since}</span>
        </p>
    );
}
