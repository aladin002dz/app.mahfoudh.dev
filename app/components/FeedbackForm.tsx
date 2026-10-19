"use client";

import { useId, useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import {
    FEEDBACK_CATEGORIES,
    MESSAGE_MAX,
    NICKNAME_MAX,
    EMAIL_MAX,
    validateFeedback,
    type FeedbackCategory,
    type FeedbackInput,
    type FieldError,
    type SubmitStatus,
} from "../../lib/feedback";
import type { Dictionary } from "../../lib/dictionary";

type Labels = Dictionary["guestbook"]["form"];

type State =
    | { kind: "idle" | "submitting" }
    | { kind: "invalid"; fields: FieldError[] }
    | { kind: "rate_limited" | "unavailable" }
    | { kind: "success"; published: boolean };

/** Generous: a paused Supabase project can take a while to answer before failing. */
const REQUEST_TIMEOUT_MS = 15000;

const inputClass = "w-full rounded-btn border border-line-strong bg-surface px-3.5 py-2.5 text-base text-ink placeholder:text-subtle focus:border-accent focus:outline-none aria-[invalid=true]:border-clay";

export default function FeedbackForm({ lang, labels, contactEmail }: { lang: string; labels: Labels; contactEmail: string }) {
    const id = useId();
    // One id per message: the server stores a given id at most once, so a
    // retry after a lost response can't create a duplicate.
    const [submissionId, setSubmissionId] = useState(() => crypto.randomUUID());
    const [category, setCategory] = useState<FeedbackCategory>("suggestion");
    const [message, setMessage] = useState("");
    const [nickname, setNickname] = useState("");
    const [email, setEmail] = useState("");
    const [publicationAllowed, setPublicationAllowed] = useState(false);
    const [website, setWebsite] = useState("");
    const [state, setState] = useState<State>({ kind: "idle" });

    const invalid = (field: FieldError) => state.kind === "invalid" && state.fields.includes(field);
    const describedBy = (field: FieldError) => `${id}-${field}-hint${invalid(field) ? ` ${id}-${field}-error` : ""}`;

    async function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (state.kind === "submitting") return;

        const payload: FeedbackInput = {
            submissionId, message, category, nickname, email, publicationAllowed, website,
            locale: lang as FeedbackInput["locale"],
        };
        const checked = validateFeedback(payload);
        if (checked && !checked.ok) {
            setState({ kind: "invalid", fields: checked.fields });
            return;
        }

        setState({ kind: "submitting" });
        try {
            const response = await fetch("/api/feedback", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(payload),
                signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
            });
            const data = (await response.json().catch(() => ({}))) as { status?: SubmitStatus; fields?: FieldError[] };

            if (response.ok && data.status === "created") {
                // Only now, after the server confirmed the write, is the text cleared.
                setState({ kind: "success", published: publicationAllowed });
                setMessage("");
                setNickname("");
                setEmail("");
                setPublicationAllowed(false);
                setSubmissionId(crypto.randomUUID());
            } else if (data.status === "invalid" && data.fields?.length) {
                setState({ kind: "invalid", fields: data.fields });
            } else if (data.status === "rate_limited") {
                setState({ kind: "rate_limited" });
            } else {
                setState({ kind: "unavailable" });
            }
        } catch {
            setState({ kind: "unavailable" });
        }
    }

    if (state.kind === "success") {
        return (
            <div role="status" className="flex flex-col items-start gap-4 rounded-panel border border-accent bg-surface p-6">
                <p className="text-lg font-semibold">{labels.success}</p>
                {state.published && <p className="text-muted">{labels.successPublic}</p>}
                <button type="button" onClick={() => setState({ kind: "idle" })}
                    className="text-sm font-medium text-accent-ink underline underline-offset-4 hover:text-accent">
                    {labels.another}
                </button>
            </div>
        );
    }

    const submitting = state.kind === "submitting";
    const errorText = (field: FieldError) =>
        invalid(field) && <p id={`${id}-${field}-error`} className="text-sm font-medium text-clay">{labels.errors[field]}</p>;

    return (
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6 rounded-panel border border-line bg-surface p-6">
            <fieldset className="flex flex-col gap-2.5" aria-describedby={invalid("category") ? `${id}-category-error` : undefined}>
                <legend className="mb-2.5 font-medium">{labels.category}</legend>
                <div className="flex flex-wrap gap-2">
                    {FEEDBACK_CATEGORIES.map((c) => (
                        <label key={c} className="cursor-pointer">
                            <input type="radio" name="category" value={c} checked={category === c}
                                onChange={() => setCategory(c)} className="peer sr-only" />
                            <span className="inline-flex h-9 items-center rounded-btn border border-line-strong px-3.5 text-sm font-medium text-muted transition-colors duration-150 peer-checked:border-transparent peer-checked:bg-inverse peer-checked:text-on-inverse peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent">
                                {labels.categories[c]}
                            </span>
                        </label>
                    ))}
                </div>
                {errorText("category")}
            </fieldset>

            <div className="flex flex-col gap-2">
                <label htmlFor={`${id}-message`} className="font-medium">{labels.message}</label>
                <textarea id={`${id}-message`} value={message} onChange={(e) => setMessage(e.target.value)}
                    required rows={6} maxLength={MESSAGE_MAX} dir="auto"
                    aria-invalid={invalid("message")} aria-describedby={describedBy("message")}
                    className={`${inputClass} resize-y`} />
                <div className="flex justify-between gap-4 text-sm text-subtle">
                    <p id={`${id}-message-hint`}>{labels.messageHint}</p>
                    <span dir="ltr" aria-hidden="true">{message.length}/{MESSAGE_MAX}</span>
                </div>
                {errorText("message")}
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                    <label htmlFor={`${id}-nickname`} className="font-medium">{labels.nickname}</label>
                    <input id={`${id}-nickname`} value={nickname} onChange={(e) => setNickname(e.target.value)}
                        maxLength={NICKNAME_MAX} autoComplete="nickname" dir="auto"
                        aria-invalid={invalid("nickname")} aria-describedby={describedBy("nickname")}
                        className={inputClass} />
                    <p id={`${id}-nickname-hint`} className="text-sm text-subtle">{labels.nicknameHint}</p>
                    {errorText("nickname")}
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor={`${id}-email`} className="font-medium">{labels.email}</label>
                    <input id={`${id}-email`} type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                        maxLength={EMAIL_MAX} autoComplete="email" dir="ltr"
                        aria-invalid={invalid("email")} aria-describedby={describedBy("email")}
                        className={inputClass} />
                    <p id={`${id}-email-hint`} className="text-sm text-subtle">{labels.emailHint}</p>
                    {errorText("email")}
                </div>
            </div>

            {/* Honeypot: clipped to nothing and skipped by keyboard and screen readers, so only bots fill it.
                Clipped in place rather than pushed off-screen: a far-left offset widens RTL pages. */}
            <div aria-hidden="true" className="sr-only">
                <label htmlFor={`${id}-website`}>{labels.honeypot}</label>
                <input id={`${id}-website`} name="website" tabIndex={-1} autoComplete="off"
                    value={website} onChange={(e) => setWebsite(e.target.value)} />
            </div>

            <div className="flex items-start gap-3">
                <input id={`${id}-publish`} type="checkbox" checked={publicationAllowed}
                    onChange={(e) => setPublicationAllowed(e.target.checked)}
                    aria-describedby={`${id}-publish-hint`}
                    className="mt-1 h-4 w-4 shrink-0 accent-accent" />
                <div className="flex flex-col gap-1">
                    <label htmlFor={`${id}-publish`} className="font-medium">{labels.publish}</label>
                    <p id={`${id}-publish-hint`} className="text-sm text-subtle">{labels.publishHint}</p>
                </div>
            </div>

            <div aria-live="polite" className="empty:hidden">
                {state.kind === "invalid" && <p className="font-medium text-clay">{labels.invalid}</p>}
                {state.kind === "rate_limited" && <p className="font-medium text-clay">{labels.rateLimited}</p>}
                {state.kind === "unavailable" && (
                    <p className="font-medium text-clay">
                        {labels.unavailable}{" "}
                        <a href={`mailto:${contactEmail}`} dir="ltr" className="underline underline-offset-4">{contactEmail}</a>
                    </p>
                )}
            </div>

            <button type="submit" disabled={submitting}
                className="inline-flex h-[52px] items-center justify-center gap-2.5 self-start rounded-btn border border-transparent bg-accent px-6 text-[17px] font-medium text-on-accent transition-[background-color,transform] duration-150 hover:bg-accent-hover active:translate-y-px disabled:cursor-wait disabled:opacity-70">
                <Send className="h-[18px] w-[18px] rtl:-scale-x-100" />
                <span>{submitting ? labels.submitting : labels.submit}</span>
            </button>
        </form>
    );
}
