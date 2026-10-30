import type { NextRequest } from "next/server";
import { nameKey, validateRsvp } from "@/lib/rsvp";
import { requireAdmin } from "@/lib/server/admin";
import { fail, json, readJson, RSVP_COLUMNS } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const gate = requireAdmin(req, { mutating: true });
  if ("res" in gate) return gate.res;
  const { id } = await params;
  if (!UUID.test(id)) return fail("Not found.", 404);
  const body = await readJson(req);
  if (!body) return fail("Invalid request.", 400);
  const v = validateRsvp(body);
  if (!v.ok) return fail(v.error, 400);

  const { data, error } = await gate.db
    .from("rsvps")
    .update({ name: v.value.name, name_key: nameKey(v.value.name), status: v.value.status, note: v.value.note })
    .eq("id", id)
    .select(RSVP_COLUMNS);
  if (error) {
    if (error.code === "23505") return fail("Another guest already has that name.", 409);
    console.error("[admin] update failed", error.message);
    return fail("Could not update this RSVP.", 500);
  }
  if (!data?.length) return fail("Not found.", 404);
  return json({ rsvp: data[0] });
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const gate = requireAdmin(req, { mutating: true });
  if ("res" in gate) return gate.res;
  const { id } = await params;
  if (!UUID.test(id)) return fail("Not found.", 404);
  const { data, error } = await gate.db.from("rsvps").delete().eq("id", id).select("id");
  if (error) {
    console.error("[admin] delete failed", error.message);
    return fail("Could not delete this RSVP.", 500);
  }
  if (!data?.length) return fail("Not found.", 404);
  return json({ ok: true });
}
