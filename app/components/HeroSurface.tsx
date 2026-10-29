"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

const labels = {
    en: ["Pause background animation", "Resume background animation"],
    fr: ["Mettre l’animation en pause", "Reprendre l’animation"],
    ar: ["إيقاف حركة الخلفية", "استئناف الحركة"],
};

/** Decorative point field. Content and the static dotted fallback render on the server. */
export default function HeroSurface({ children, lang = "en" }: { children: ReactNode; lang?: string }) {
    const surface = useRef<HTMLElement>(null);
    const canvas = useRef<HTMLCanvasElement>(null);
    const [paused, setPaused] = useState(false);
    const clock = useRef(0);
    const text = labels[lang as keyof typeof labels] ?? labels.en;

    useEffect(() => {
        const section = surface.current;
        const field = canvas.current;
        const ctx = field?.getContext("2d");
        if (!section || !field || !ctx) return;

        const reduced = matchMedia("(prefers-reduced-motion: reduce)");
        const mouse = matchMedia("(hover: hover) and (pointer: fine)");
        let width = 0, height = 0, frame = 0, last = 0, time = clock.current;
        let visible = false;
        let accent = "", muted = "";
        const pointer = { x: 0, y: 0, targetX: 0, targetY: 0, strength: 0, inside: false };

        const draw = () => {
            ctx.clearRect(0, 0, width, height);
            const spacing = width < 600 ? 30 : 28;
            // A wandering elliptical wave, independent of the pointer.
            const cx = width * (0.54 + 0.23 * Math.sin(time * 0.18));
            const cy = height * (0.48 + 0.2 * Math.cos(time * 0.23));
            for (let y = 14; y < height; y += spacing) {
                for (let x = 14; x < width; x += spacing) {
                    const dx = x - cx, dy = (y - cy) * 1.3;
                    const distance = Math.hypot(dx, dy);
                    const envelope = Math.exp(-distance * distance / 95000);
                    const wave = Math.sin(distance * 0.022 - time * 0.9) * envelope;
                    const px = x - pointer.x, py = y - pointer.y;
                    const pd = Math.hypot(px, py);
                    const influence = Math.exp(-pd * pd / 24000) * pointer.strength;
                    const ripple = Math.sin(pd * 0.035 - time * 2) * influence;
                    const brightness = Math.min(1, Math.max(0, wave) * 0.65 + influence * 0.7);
                    const displacement = wave * 7 + ripple * 9;
                    const ox = dx / Math.max(distance, 1) * displacement + px / Math.max(pd, 1) * influence * 10;
                    const oy = dy / Math.max(distance, 1) * displacement + py / Math.max(pd, 1) * influence * 10;
                    ctx.globalAlpha = 0.28 + brightness * 0.55;
                    ctx.fillStyle = brightness > 0.15 ? accent : muted;
                    ctx.beginPath();
                    ctx.arc(x + ox, y + oy, 0.85 + brightness * 0.65, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            ctx.globalAlpha = 1;
        };
        const canRun = () => visible && !document.hidden && !reduced.matches && !paused;
        const tick = (now: number) => {
            if (!canRun()) { frame = 0; return; }
            frame = requestAnimationFrame(tick);
            if (now - last < 1000 / 30) return;
            const dt = Math.min((now - last) / 1000, 0.05);
            last = now;
            time += dt;
            clock.current = time;
            const ease = 1 - Math.exp(-dt * 6);
            pointer.x += (pointer.targetX - pointer.x) * ease;
            pointer.y += (pointer.targetY - pointer.y) * ease;
            pointer.strength += ((pointer.inside ? 1 : 0) - pointer.strength) * ease;
            draw();
        };
        const sync = () => {
            cancelAnimationFrame(frame);
            frame = 0;
            if (reduced.matches) {
                section.removeAttribute("data-field-ready");
                return;
            }
            draw();
            section.setAttribute("data-field-ready", "");
            if (canRun()) { last = performance.now(); frame = requestAnimationFrame(tick); }
        };
        const resize = () => {
            const bounds = section.getBoundingClientRect();
            width = bounds.width;
            height = bounds.height;
            const ratio = Math.min(devicePixelRatio || 1, 2);
            field.width = Math.round(width * ratio);
            field.height = Math.round(height * ratio);
            ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
            sync();
        };
        const theme = () => {
            const styles = getComputedStyle(section);
            accent = styles.getPropertyValue("--accent").trim();
            muted = styles.getPropertyValue("--subtle").trim();
            sync();
        };
        const move = (event: PointerEvent) => {
            if (!mouse.matches || reduced.matches || paused || event.pointerType !== "mouse") return;
            const bounds = section.getBoundingClientRect();
            pointer.targetX = event.clientX - bounds.left;
            pointer.targetY = event.clientY - bounds.top;
            if (!pointer.inside && pointer.strength < 0.01) {
                pointer.x = pointer.targetX;
                pointer.y = pointer.targetY;
            }
            pointer.inside = true;
        };
        const leave = () => { pointer.inside = false; };
        const onVisibility = () => { leave(); sync(); };
        const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
        const sizing = new ResizeObserver(resize);
        const themeObserver = new MutationObserver(theme);
        theme();
        sizing.observe(section);
        observer.observe(section);
        themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
        section.addEventListener("pointermove", move);
        section.addEventListener("pointerleave", leave);
        section.addEventListener("pointercancel", leave);
        window.addEventListener("blur", leave);
        window.addEventListener("scroll", leave, { passive: true });
        document.addEventListener("visibilitychange", onVisibility);
        reduced.addEventListener("change", sync);
        return () => {
            cancelAnimationFrame(frame);
            observer.disconnect(); sizing.disconnect(); themeObserver.disconnect();
            section.removeAttribute("data-field-ready");
            section.removeEventListener("pointermove", move);
            section.removeEventListener("pointerleave", leave);
            section.removeEventListener("pointercancel", leave);
            window.removeEventListener("blur", leave);
            window.removeEventListener("scroll", leave);
            document.removeEventListener("visibilitychange", onVisibility);
            reduced.removeEventListener("change", sync);
        };
    }, [paused]);

    return (
        <section ref={surface} className="hero-surface border-b border-line">
            <canvas ref={canvas} className="hero-point-field" aria-hidden="true" />
            {children}
            <button type="button" className="hero-motion-toggle" onClick={() => setPaused(!paused)}
                aria-label={paused ? text[1] : text[0]} title={paused ? text[1] : text[0]}>
                <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                    {paused ? <path d="M3 1.5 10 6l-7 4.5Z" /> : <path d="M3 2h2v8H3zm4 0h2v8H7z" />}
                </svg>
            </button>
        </section>
    );
}
