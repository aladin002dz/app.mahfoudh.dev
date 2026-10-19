import { getSupabase } from "../../../lib/supabase";

/**
 * Called once a day by Vercel Cron (see vercel.json). The query keeps a free
 * Supabase project from pausing for inactivity, and keep_alive() also deletes
 * rate-limit identifiers older than 24 hours.
 *
 * Vercel sends `Authorization: Bearer $CRON_SECRET` when CRON_SECRET is set.
 */
export async function GET(request: Request) {
    const secret = process.env.CRON_SECRET;
    if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
        return new Response("Unauthorized", { status: 401 });
    }

    const supabase = getSupabase();
    if (!supabase) return Response.json({ ok: false, reason: "not configured" }, { status: 503 });

    try {
        const { data, error } = await supabase.rpc("keep_alive");
        if (error) {
            console.error("keep-alive: keep_alive failed", error.code);
            return Response.json({ ok: false }, { status: 503 });
        }
        return Response.json({ ok: true, expiredRateLimitRows: data });
    } catch (e) {
        console.error("keep-alive: Supabase unreachable", e instanceof Error ? e.name : "unknown");
        return Response.json({ ok: false }, { status: 503 });
    }
}
