import { diagnoseDatabase } from "@/lib/server/supabase";
import { json } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Open /api/health to see why the guestbook can't reach its database. */
export async function GET() {
  return json(await diagnoseDatabase());
}
