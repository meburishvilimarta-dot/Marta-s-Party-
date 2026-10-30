import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/server/admin";
import { fail, json, RSVP_COLUMNS } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const gate = requireAdmin(req);
  if ("res" in gate) return gate.res;
  const { data, error } = await gate.db
    .from("rsvps")
    .select(RSVP_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(2000);
  if (error) {
    console.error("[admin] list failed", error.message);
    return fail("Could not read the guestbook.", 500);
  }
  return json({ rsvps: data });
}
