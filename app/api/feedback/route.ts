import { createHmac } from "node:crypto";
import { getSupabase } from "../../../lib/supabase";
import { PRIVACY_NOTICE_VERSION, validateFeedback, type FieldError, type SubmitStatus } from "../../../lib/feedback";

/** Comfortably above the largest valid payload (2,000-character message plus short fields). */
const MAX_BODY_BYTES = 16 * 1024;

const reply = (status: SubmitStatus, httpStatus: number, fields?: FieldError[]) =>
    Response.json(fields ? { status, fields } : { status }, { status: httpStatus });

/** Same-origin check. A secondary guard only; rate limits and validation do the real work. */
function isSameOrigin(request: Request): boolean {
    const origin = request.headers.get("origin");
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    if (!origin || !host) return false;
    try {
        return new URL(origin).host === host;
    } catch {
        return false;
    }
}

/**
 * A keyed hash of the visitor's IP, rotated daily. The raw IP is never stored,
 * and without the secret the hash can't be matched back to an address. The
 * database deletes these after 24 hours.
 */
function rateKey(request: Request, secret: string): string {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
        || request.headers.get("x-real-ip")
        || "unknown";
    const day = new Date().toISOString().slice(0, 10);
    return createHmac("sha256", secret).update(`${day}:${ip}`).digest("hex");
}

export async function POST(request: Request) {
    if (!isSameOrigin(request)) return reply("invalid", 403);
    if (!request.headers.get("content-type")?.includes("application/json")) return reply("invalid", 415);
    if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) return reply("invalid", 413);

    const body = await request.text();
    if (body.length > MAX_BODY_BYTES) return reply("invalid", 413);

    let raw: unknown;
    try {
        raw = JSON.parse(body);
    } catch {
        return reply("invalid", 400);
    }

    const result = validateFeedback(raw);
    if (!result) return reply("invalid", 400);
    if (!result.ok) return reply("invalid", 422, result.fields);
    const input = result.value;

    // Bots that fill the hidden field get the same answer as people, and nothing is stored.
    if (input.website) return reply("created", 201);

    const supabase = getSupabase();
    const secret = process.env.FEEDBACK_RATE_LIMIT_SECRET;
    if (!supabase || !secret) return reply("unavailable", 503);

    try {
        const { data, error } = await supabase.rpc("submit_feedback", {
            p_submission_id: input.submissionId,
            p_message: input.message,
            p_category: input.category,
            p_nickname: input.nickname,
            p_email: input.email,
            p_locale: input.locale,
            p_publication_allowed: input.publicationAllowed,
            p_privacy_notice_version: PRIVACY_NOTICE_VERSION,
            p_rate_key: rateKey(request, secret),
        });
        if (error) {
            // Log the database error code only; never the request body or email.
            console.error("feedback: submit_feedback failed", error.code);
            return reply("unavailable", 503);
        }
        if (data === "rate_limited") return reply("rate_limited", 429);
        // "duplicate" means this exact submission is already stored: a success for the visitor.
        return reply("created", data === "created" ? 201 : 200);
    } catch (e) {
        console.error("feedback: Supabase unreachable", e instanceof Error ? e.name : "unknown");
        return reply("unavailable", 503);
    }
}
