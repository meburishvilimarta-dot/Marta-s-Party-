import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * Server-only Supabase client using the service_role key. It bypasses RLS,
 * so it must never be imported from a client component ("server-only"
 * makes the build fail if that ever happens).
 */
export function getDb(): SupabaseClient | null {
  if (!isDatabaseConfigured()) return null;
  if (!client) {
    client = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: { headers: { "x-application-name": "martas-halloween-night" } },
    });
  }
  return client;
}

export const NOT_CONFIGURED_MESSAGE =
  "The guestbook isn't connected to its database yet, so RSVPs can't be saved. Please message Marta on WhatsApp instead.";
