import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

// Pasted values often carry stray whitespace, quotes, a trailing slash or the
// REST path; normalise them so the client always gets what it expects.
function supabaseUrl(): string {
  return (process.env.SUPABASE_URL ?? "")
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\/+$/, "")
    .replace(/\/rest\/v1$/, "");
}

function serviceKey(): string {
  return (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim().replace(/^["']|["']$/g, "");
}

export function isDatabaseConfigured(): boolean {
  return Boolean(supabaseUrl() && serviceKey());
}

/**
 * Server-only Supabase client using the service_role key. It bypasses RLS,
 * so it must never be imported from a client component ("server-only"
 * makes the build fail if that ever happens).
 */
export function getDb(): SupabaseClient | null {
  if (!isDatabaseConfigured()) return null;
  if (!client) {
    client = createClient(supabaseUrl(), serviceKey(), {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: { headers: { "x-application-name": "martas-halloween-night" } },
    });
  }
  return client;
}

export const NOT_CONFIGURED_MESSAGE =
  "The guestbook isn't connected to its database yet, so RSVPs can't be saved. Please message Marta on WhatsApp instead.";

type KeyKind = "missing" | "service_role" | "secret" | "anon" | "publishable" | "unknown";

function keyKind(key: string): KeyKind {
  if (!key) return "missing";
  if (key.startsWith("sb_secret_")) return "secret";
  if (key.startsWith("sb_publishable_")) return "publishable";
  try {
    const payload = JSON.parse(Buffer.from(key.split(".")[1] ?? "", "base64url").toString());
    if (payload.role === "service_role") return "service_role";
    if (payload.role === "anon") return "anon";
  } catch {}
  return "unknown";
}

/** Plain-language health check of the database connection. Never returns secrets. */
export async function diagnoseDatabase(): Promise<{ ok: boolean; problems: string[]; details: Record<string, unknown> }> {
  const url = supabaseUrl();
  const kind = keyKind(serviceKey());
  const problems: string[] = [];
  const details: Record<string, unknown> = { urlSet: Boolean(url), keyType: kind };

  if (!url) problems.push("SUPABASE_URL is missing in Vercel → Settings → Environment Variables (then Redeploy).");
  else if (!/^https:\/\/[a-z0-9-]+\.supabase\.(co|in)$/i.test(url))
    problems.push(`SUPABASE_URL doesn't look like a Supabase Project URL (expected https://<ref>.supabase.co, got ${url.slice(0, 60)}).`);
  if (kind === "missing") problems.push("SUPABASE_SERVICE_ROLE_KEY is missing in Vercel → Settings → Environment Variables (then Redeploy).");
  if (kind === "anon" || kind === "publishable")
    problems.push("SUPABASE_SERVICE_ROLE_KEY contains the public anon/publishable key. Use the service_role (or sb_secret_…) key instead, then Redeploy.");

  const db = getDb();
  if (db) {
    for (const table of ["rsvps", "rate_limit_events"]) {
      // A plain GET (not HEAD) so Supabase's error body comes back intact.
      const { data, error } = await db.from(table).select("id").limit(1);
      if (error) {
        details[table] = { code: error.code, message: error.message };
        const text = `${error.code} ${error.message}`;
        if (/PGRST205|42P01|does not exist|schema cache|Could not find/i.test(text))
          problems.push(`Table "${table}" not found — run the SQL migration in Supabase → SQL Editor.`);
        else if (/42501|permission denied/i.test(text))
          problems.push(`Permission denied on "${table}" — the key isn't the service_role/secret key.`);
        else if (/Invalid API key|JWT|401|unauthori[sz]ed|^\s*$/i.test(text))
          problems.push("Supabase rejected the key — re-copy SUPABASE_SERVICE_ROLE_KEY from the same project as SUPABASE_URL.");
        else problems.push(`Database error on "${table}": ${error.message || error.code}`);
      } else details[table] = { reachable: true, empty: !data?.length };
    }
  }
  return { ok: problems.length === 0, problems: [...new Set(problems)], details };
}
