import { getDb } from "@/lib/server/supabase";
import { json } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Public, anonymous figure only: how many guests said yes. Never names or notes. */
export async function GET() {
  const db = getDb();
  if (!db) return json({ configured: false, attending: null });
  const { count, error } = await db
    .from("rsvps")
    .select("id", { count: "exact", head: true })
    .eq("status", "yes");
  if (error) return json({ configured: true, attending: null });
  return json({ configured: true, attending: count ?? 0 });
}
