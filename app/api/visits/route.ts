import { getSupabase } from "../../../lib/supabase";

const headers = { "Cache-Control": "no-store" };
const unavailable = () => Response.json({ error: "unavailable" }, { status: 503, headers });

export async function POST(request: Request) {
    // Preview and local traffic must never increment the public total.
    if (process.env.VERCEL_ENV !== "production") return unavailable();
    if (request.headers.get("origin") !== new URL(request.url).origin) {
        return new Response(null, { status: 403 });
    }
    if (!request.headers.get("content-type")?.includes("application/json")) {
        return new Response(null, { status: 415 });
    }
    // Bound the body even when Content-Length is absent or untrusted.
    const reader = request.body?.getReader();
    if (!reader) return new Response(null, { status: 400 });
    let body = "";
    let bytes = 0;
    const decoder = new TextDecoder();
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.byteLength;
        if (bytes > 256) {
            await reader.cancel();
            return new Response(null, { status: 413 });
        }
        body += decoder.decode(value, { stream: true });
    }
    let id: unknown;
    try { id = JSON.parse(body).visitId; } catch { return new Response(null, { status: 400 }); }
    if (typeof id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
        return new Response(null, { status: 400 });
    }
    const supabase = getSupabase();
    if (!supabase) return unavailable();
    try {
        const { data, error } = await supabase.rpc("record_site_visit", { p_visit_id: id });
        const total = Number(data);
        if (error || data === null || !Number.isSafeInteger(total) || total < 0) return unavailable();
        return Response.json({ total }, { headers });
    } catch { return unavailable(); }
}
