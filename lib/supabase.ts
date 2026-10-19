import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** A paused or unreachable project fails fast instead of hanging the request. */
const TIMEOUT_MS = 8000;

let client: SupabaseClient | null | undefined;

/**
 * Supabase client for server code only, using the publishable key. That key
 * can't read or write tables; it can only call the functions granted to
 * `anon` in supabase/migrations. Returns null when the project isn't
 * configured, which callers treat as "feedback unavailable".
 */
export function getSupabase(): SupabaseClient | null {
    if (client !== undefined) return client;

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY;
    client = url && key
        ? createClient(url, key, {
            auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
            global: {
                fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) }),
            },
        })
        : null;
    return client;
}
