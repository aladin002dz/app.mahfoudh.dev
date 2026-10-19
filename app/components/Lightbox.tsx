"use client";

import { useEffect, useRef, useState } from "react";
import Image, { getImageProps } from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export interface LightboxPhoto { src: string; width: number; height: number; alt: string }
export interface LightboxLabels { close: string; prev: string; next: string }

interface LightboxProps {
    photos: LightboxPhoto[];
    startIndex: number;
    event: string;
    year: number;
    role: string;
    labels: LightboxLabels;
    onClose: () => void;
}

const SWIPE_THRESHOLD = 50;
const PHOTO_SIZES = "92vw";

const navButton = "grid h-11 w-11 place-items-center rounded-full bg-black/50 text-white transition-colors duration-150 hover:bg-black/70";

export default function Lightbox({ photos, startIndex, event, year, role, labels, onClose }: LightboxProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const swipeX = useRef<number | null>(null);
    const swiped = useRef(false);
    const [index, setIndex] = useState(startIndex);
    const count = photos.length;
    const photo = photos[index];

    // A native modal <dialog> gives us the top layer, focus trapping, an inert page and Esc-to-close.
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (!dialog.open) dialog.showModal();
        const { overflow } = document.body.style;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = overflow; };
    }, []);

    // Warm the same responsive, optimized variants used by the visible photo.
    useEffect(() => {
        if (count < 2) return;
        const neighbours = new Set([(index - 1 + count) % count, (index + 1) % count]);
        for (const neighbourIndex of neighbours) {
            const neighbour = photos[neighbourIndex];
            const { props } = getImageProps({ ...neighbour, sizes: PHOTO_SIZES });
            const preload = new window.Image();
            preload.sizes = props.sizes ?? PHOTO_SIZES;
            preload.srcset = props.srcSet ?? "";
            preload.src = props.src;
        }
    }, [index, count, photos]);

    const go = (step: number) => setIndex((i) => (i + step + count) % count);
    const isRtl = () => !!dialogRef.current && getComputedStyle(dialogRef.current).direction === "rtl";

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (count < 2 || (e.key !== "ArrowLeft" && e.key !== "ArrowRight")) return;
        e.preventDefault();
        // "next" sits on the right in LTR and on the left in RTL.
        go((e.key === "ArrowRight") !== isRtl() ? 1 : -1);
    };

    const onPointerUp = (e: React.PointerEvent) => {
        if (swipeX.current === null) return;
        const dx = e.clientX - swipeX.current;
        swipeX.current = null;
        if (count < 2 || Math.abs(dx) < SWIPE_THRESHOLD) return;
        swiped.current = true;
        go((dx < 0) !== isRtl() ? 1 : -1);
    };

    const onBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
        if (swiped.current) { swiped.current = false; return; }
        if (e.target === e.currentTarget) e.currentTarget.close();
    };

    return (
        <dialog
            ref={dialogRef}
            aria-label={event}
            onClose={onClose}
            onClick={onBackdropClick}
            onKeyDown={onKeyDown}
            className="lightbox fixed inset-0 m-0 h-full max-h-none w-full max-w-none items-center justify-center border-0 bg-black/90 p-0 text-white open:flex"
        >
            {count > 1 && (
                <span aria-live="polite" className="absolute start-4 top-4 rounded-full bg-black/50 px-3 py-1.5 font-mono text-xs">
                    <bdi dir="ltr">{index + 1} / {count}</bdi>
                </span>
            )}
            <button type="button" aria-label={labels.close} onClick={() => dialogRef.current?.close()}
                className={`${navButton} absolute end-4 top-4`}>
                <X className="h-5 w-5" />
            </button>

            {count > 1 && (
                <button type="button" aria-label={labels.prev} onClick={() => go(-1)}
                    className={`${navButton} absolute start-3 top-1/2 z-10 -translate-y-1/2 md:start-6`}>
                    <ChevronLeft className="h-6 w-6 rtl:-scale-x-100" />
                </button>
            )}

            <figure
                className="relative m-0 touch-pan-y select-none"
                onPointerDown={(e) => { swipeX.current = e.clientX; }}
                onPointerUp={onPointerUp}
                onPointerCancel={() => { swipeX.current = null; }}
            >
                <Image key={photo.src} src={photo.src} alt={photo.alt} width={photo.width} height={photo.height}
                    sizes={PHOTO_SIZES} draggable={false}
                    className="block h-auto max-h-[85dvh] w-auto max-w-[92vw] rounded-panel object-contain" />
                <figcaption className="absolute inset-x-0 bottom-0 flex flex-col gap-1 rounded-b-panel bg-gradient-to-t from-black/80 to-transparent px-5 pb-4 pt-14">
                    <span dir="ltr" className="text-start font-sans text-lg font-semibold leading-tight md:text-xl">{event}</span>
                    <span className="flex items-center gap-1.5 font-mono text-xs text-white/80 rtl:font-arabic">
                        <bdi dir="ltr">{year}</bdi>
                        <span aria-hidden="true">·</span>
                        <span>{role}</span>
                    </span>
                </figcaption>
            </figure>

            {count > 1 && (
                <button type="button" aria-label={labels.next} onClick={() => go(1)}
                    className={`${navButton} absolute end-3 top-1/2 z-10 -translate-y-1/2 md:end-6`}>
                    <ChevronRight className="h-6 w-6 rtl:-scale-x-100" />
                </button>
            )}
        </dialog>
    );
}
