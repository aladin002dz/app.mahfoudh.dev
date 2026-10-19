import "server-only";
import { CONTACT_EMAIL } from "./site";
import type { FeedbackInput } from "./feedback";

/** Resend's send-email endpoint. https://resend.com/docs/api-reference/emails/send-email */
const RESEND_API_URL = "https://api.resend.com/emails";

/** The visitor already has their answer; this only bounds how long the background task runs. */
const TIMEOUT_MS = 5000;

type NewFeedback = Pick<FeedbackInput, "category" | "locale" | "publicationAllowed" | "message">;

/** Table editor of the project in SUPABASE_URL (https://<ref>.supabase.co), or the dashboard home. */
function moderationUrl(): string {
    const url = process.env.SUPABASE_URL ?? "";
    const host = URL.canParse(url) ? new URL(url).hostname : "";
    const ref = host.endsWith(".supabase.co") ? host.split(".")[0] : "";
    return ref ? `https://supabase.com/dashboard/project/${ref}/editor` : "https://supabase.com/dashboard";
}

/**
 * Emails the site owner that a new entry is waiting for moderation. By default
 * the email holds no personal data: no message, nickname or reply address.
 * FEEDBACK_NOTIFY_INCLUDE_MESSAGE=true adds the message text (see
 * docs/guestbook.md before enabling it).
 *
 * FEEDBACK_NOTIFY_API_URL replaces the Resend endpoint, for testing against
 * a local mock.
 *
 * Does nothing when RESEND_API_KEY or FEEDBACK_NOTIFY_FROM is unset, so
 * previews and local builds don't send mail. Never throws; failures are
 * logged by status and error name only.
 */
export async function notifyNewFeedback(entry: NewFeedback): Promise<void> {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.FEEDBACK_NOTIFY_FROM;
    if (!apiKey || !from) return;

    const lines = [
        "A new guestbook entry is waiting for moderation.",
        "",
        `Category: ${entry.category}`,
        `Locale: ${entry.locale}`,
        `Publication allowed: ${entry.publicationAllowed ? "yes" : "no (private feedback)"}`,
        "",
        `Moderate (Table Editor → feedback, moderation_status = pending):`,
        moderationUrl(),
    ];
    if (process.env.FEEDBACK_NOTIFY_INCLUDE_MESSAGE === "true") {
        lines.push("", "Message:", entry.message);
    }

    try {
        const res = await fetch(process.env.FEEDBACK_NOTIFY_API_URL || RESEND_API_URL, {
            method: "POST",
            headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
            body: JSON.stringify({
                from,
                to: [process.env.FEEDBACK_NOTIFY_TO || CONTACT_EMAIL],
                subject: `New guestbook entry (${entry.category}, ${entry.locale})`,
                text: lines.join("\n"),
            }),
            signal: AbortSignal.timeout(TIMEOUT_MS),
        });
        if (!res.ok) {
            // Resend answers errors as { name, message }; the name is the error code.
            const name = await res.json().then((b: { name?: unknown }) => b?.name, () => undefined);
            console.error("feedback: notification failed", res.status, typeof name === "string" ? name : "");
        }
    } catch (e) {
        console.error("feedback: notification unreachable", e instanceof Error ? e.name : "unknown");
    }
}
