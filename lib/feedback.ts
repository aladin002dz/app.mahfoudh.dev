// Shared by the feedback form (client) and the /api/feedback route (server).
// The database enforces the same limits in supabase/migrations.

export const FEEDBACK_CATEGORIES = ["suggestion", "feedback", "greeting"] as const;
export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];

export const FEEDBACK_LOCALES = ["en", "fr", "ar"] as const;

export const MESSAGE_MIN = 2;
export const MESSAGE_MAX = 2000;
export const NICKNAME_MAX = 80;
export const EMAIL_MAX = 254;

/** Bump when the privacy text on the guestbook page changes; stored with each entry. */
export const PRIVACY_NOTICE_VERSION = "2026-10-19";

export type FeedbackInput = {
    submissionId: string;
    message: string;
    category: FeedbackCategory;
    nickname: string;
    email: string;
    locale: (typeof FEEDBACK_LOCALES)[number];
    publicationAllowed: boolean;
    /** Honeypot: hidden from people, so anything in it came from a bot. */
    website: string;
};

export type FieldError = "message" | "category" | "nickname" | "email";

/** What /api/feedback answers with, in its JSON `status` field. */
export type SubmitStatus = "created" | "invalid" | "rate_limited" | "unavailable";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const isString = (v: unknown): v is string => typeof v === "string";

/**
 * Validates an untrusted payload. Returns the cleaned input, or the fields
 * a visitor can fix. Malformed requests that a visitor couldn't have produced
 * through the form come back as `null`.
 */
export function validateFeedback(raw: unknown):
    | { ok: true; value: FeedbackInput }
    | { ok: false; fields: FieldError[] }
    | null {
    if (typeof raw !== "object" || raw === null) return null;
    const r = raw as Record<string, unknown>;

    if (!isString(r.submissionId) || !UUID.test(r.submissionId)) return null;
    if (!isString(r.locale) || !(FEEDBACK_LOCALES as readonly string[]).includes(r.locale)) return null;
    if (typeof r.publicationAllowed !== "boolean") return null;
    for (const key of ["message", "category", "nickname", "email", "website"] as const) {
        if (r[key] !== undefined && !isString(r[key])) return null;
    }

    const message = ((r.message as string) ?? "").trim();
    const category = (r.category as string) ?? "";
    const nickname = ((r.nickname as string) ?? "").trim();
    const email = ((r.email as string) ?? "").trim();

    const fields: FieldError[] = [];
    if (message.length < MESSAGE_MIN || message.length > MESSAGE_MAX) fields.push("message");
    if (!(FEEDBACK_CATEGORIES as readonly string[]).includes(category)) fields.push("category");
    if (nickname.length > NICKNAME_MAX) fields.push("nickname");
    if (email && (email.length > EMAIL_MAX || !EMAIL.test(email))) fields.push("email");
    if (fields.length) return { ok: false, fields };

    return {
        ok: true,
        value: {
            submissionId: r.submissionId,
            message,
            category: category as FeedbackCategory,
            nickname,
            email,
            locale: r.locale as FeedbackInput["locale"],
            publicationAllowed: r.publicationAllowed,
            website: ((r.website as string) ?? "").trim(),
        },
    };
}
