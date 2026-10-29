import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { connection } from "next/server";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import SectionLabel from "./SectionLabel";
import FeedbackForm from "./FeedbackForm";
import { getDictionary, type Dictionary } from "../../lib/dictionary";
import { getSupabase } from "../../lib/supabase";
import type { FeedbackCategory } from "../../lib/feedback";
import { CONTACT_EMAIL, GUESTBOOK_ALTERNATES, GUESTBOOK_PATH, OG_IMAGE, SITE_URL, localePath } from "../../lib/site";

const PAGE_SIZE = 20;

type Entry = {
    id: string;
    created_at: string;
    published_at: string;
    message: string;
    category: FeedbackCategory;
    nickname: string | null;
};

export async function guestbookMetadata(lang: string): Promise<Metadata> {
    const dict = await getDictionary(lang);
    const title = `${dict.guestbook.title} | ${dict.home.name}`;
    const url = `${SITE_URL}${localePath(lang, GUESTBOOK_PATH)}`;
    return {
        title: { absolute: title },
        description: dict.guestbook.metaDescription,
        alternates: { canonical: url, languages: GUESTBOOK_ALTERNATES },
        openGraph: { title, description: dict.guestbook.metaDescription, url, type: "website", images: [OG_IMAGE] },
        twitter: { card: "summary_large_image", title, description: dict.guestbook.metaDescription, images: [OG_IMAGE.url] },
    };
}

/** `?before=` is the published_at of the last entry on the previous page. Anything unparseable means "newest". */
function parseBefore(value: string | string[] | undefined): string | null {
    if (typeof value !== "string") return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

async function GuestbookEntries({ lang, dict, before }: { lang: string; dict: Dictionary; before: string | null }) {
    // Entries are read when someone visits, never at build time: a paused
    // project can't break a deploy, and moderation shows up on the next load.
    await connection();

    const t = dict.guestbook;
    const supabase = getSupabase();
    let entries: Entry[] | null = null;
    if (supabase) {
        try {
            const { data, error } = await supabase.rpc("list_guestbook", { p_limit: PAGE_SIZE + 1, p_before: before });
            if (error) console.error("guestbook: list_guestbook failed", error.code);
            else entries = data as Entry[];
        } catch (e) {
            console.error("guestbook: Supabase unreachable", e instanceof Error ? e.name : "unknown");
        }
    }

    if (!entries) return <p className="text-muted">{t.entries.unavailable}</p>;
    if (!entries.length && !before) return <p className="text-muted">{t.entries.empty}</p>;

    const hasMore = entries.length > PAGE_SIZE;
    const shown = entries.slice(0, PAGE_SIZE);
    const date = new Intl.DateTimeFormat(lang, { dateStyle: "long", numberingSystem: "latn" });
    const path = localePath(lang, GUESTBOOK_PATH);

    return (
        <div className="flex flex-col gap-6">
            <ol className="flex flex-col gap-4">
                {shown.map((entry) => (
                    <li key={entry.id}>
                        <article className="flex flex-col gap-3 rounded-panel border border-line bg-surface p-5">
                            {/* Visitor text is rendered as text, never HTML, in whatever direction it was written. */}
                            <p dir="auto" className="whitespace-pre-line break-words text-pretty">{entry.message}</p>
                            <footer className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-subtle">
                                {entry.nickname && <bdi dir="auto" className="font-medium text-muted">{entry.nickname}</bdi>}
                                <span className="rounded-tag bg-sunken px-1.5 py-0.5 font-mono text-xs uppercase tracking-[0.06em] rtl:font-arabic rtl:tracking-normal">
                                    {t.form.categories[entry.category]}
                                </span>
                                <time dateTime={entry.created_at}>{date.format(new Date(entry.created_at))}</time>
                            </footer>
                        </article>
                    </li>
                ))}
            </ol>
            {(hasMore || before) && (
                <nav className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium">
                    {before && <Link href={`${path}#entries`} className="text-accent-ink underline underline-offset-4 hover:text-accent">{t.entries.newest}</Link>}
                    {hasMore && (
                        <Link href={`${path}?before=${encodeURIComponent(shown[shown.length - 1].published_at)}#entries`}
                            className="text-accent-ink underline underline-offset-4 hover:text-accent">
                            {t.entries.older}
                        </Link>
                    )}
                </nav>
            )}
        </div>
    );
}

export default async function GuestbookContent({ lang, before }: { lang: string; before?: string | string[] }) {
    const dict = await getDictionary(lang);
    const t = dict.guestbook;
    const isArabic = lang === "ar";

    return (
        <div className={`min-h-screen bg-bg text-ink ${isArabic ? "font-arabic" : "font-sans"}`}>
            <SiteHeader lang={lang} />

            <main className="mx-auto flex max-w-[1120px] flex-col gap-16 px-6 py-16 md:py-22">
                <section className="motion-intro flex flex-col gap-6">
                    <SectionLabel>{t.title}</SectionLabel>
                    <h1 className={`max-w-[22ch] text-[clamp(32px,5vw,52px)] font-semibold leading-[1.1] text-balance ${isArabic ? "" : "tracking-[-0.03em]"}`}>
                        {t.prompt}
                    </h1>
                    <p className="max-w-[60ch] text-[clamp(18px,2vw,20px)] text-muted text-pretty">{t.intro}</p>
                    <div className="max-w-[720px]">
                        <FeedbackForm lang={lang} labels={t.form} contactEmail={CONTACT_EMAIL} />
                    </div>
                </section>

                <section id="entries" className="flex max-w-[720px] scroll-mt-24 flex-col gap-6">
                    <h2 className="text-2xl font-semibold">{t.entries.title}</h2>
                    <Suspense fallback={<div className="h-24 animate-pulse rounded-panel bg-sunken" />}>
                        <GuestbookEntries lang={lang} dict={dict} before={parseBefore(before)} />
                    </Suspense>
                </section>

                <section id="privacy" className="flex max-w-[720px] scroll-mt-24 flex-col gap-4 border-t border-line pt-10">
                    <h2 className="text-xl font-semibold">{t.privacy.title}</h2>
                    <ul className="flex list-disc flex-col gap-2.5 ps-5 text-muted">
                        {t.privacy.items.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                    <p className="text-muted">
                        {t.privacy.deleteRequest}{" "}
                        <a href={`mailto:${CONTACT_EMAIL}`} dir="ltr" className="text-accent-ink underline underline-offset-4 hover:text-accent">{CONTACT_EMAIL}</a>
                    </p>
                </section>
            </main>

            <SiteFooter lang={lang} dict={dict} />
        </div>
    );
}
