import type { NextRequest } from "next/server";
import { validateRsvp, nameKey } from "@/lib/rsvp";
import { getDb, NOT_CONFIGURED_MESSAGE } from "@/lib/server/supabase";
import { clientIpHash, isSameOrigin, newToken, rateLimit, safeEqual, sha256 } from "@/lib/server/security";
import { fail, json, readJson, RSVP_COLUMNS } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIN_FILL_MS = 2500;
const WRITE_LIMITS = [
  // Generous enough for friends sharing one Wi-Fi, tight enough to stop floods.
  { windowSeconds: 10 * 60, max: 12 },
  { windowSeconds: 24 * 60 * 60, max: 60 },
];

const DUPLICATE_MESSAGE =
  "A guest with this name has already signed the book. If that's you, open the invitation on the device you used to sign and choose “Change my answer”, or add your surname to tell yourselves apart.";

async function guard(req: NextRequest, body: Record<string, unknown> | null) {
  if (!isSameOrigin(req)) return { res: fail("Forbidden.", 403) };
  if (!body) return { res: fail("The ink smudged — please try again.", 400) };
  // Honeypot: real guests never see this field. Pretend all is well to bots
  // but write nothing.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return { res: json({ ok: true, ignored: true }, 202) };
  }
  const startedAt = Number(body.startedAt);
  if (!Number.isFinite(startedAt) || Date.now() - startedAt < MIN_FILL_MS) {
    return { res: fail("That was faster than a ghost — please take a moment and try again.", 400) };
  }
  const db = getDb();
  if (!db) return { res: fail(NOT_CONFIGURED_MESSAGE, 503, { code: "not_configured" }) };
  const ipHash = clientIpHash(req);
  if (!(await rateLimit("rsvp", ipHash, WRITE_LIMITS))) {
    return { res: fail("Too many signatures from this device. Please wait a few minutes and try again.", 429) };
  }
  return { db, ipHash };
}

/** Sign the guestbook. */
export async function POST(req: NextRequest) {
  const body = await readJson(req);
  const g = await guard(req, body);
  if ("res" in g) return g.res;
  const v = validateRsvp(body!);
  if (!v.ok) return fail(v.error, 400);

  const token = newToken();
  const { data, error } = await g.db
    .from("rsvps")
    .insert({
      name: v.value.name,
      name_key: nameKey(v.value.name),
      status: v.value.status,
      note: v.value.note,
      edit_token_hash: sha256(token),
      ip_hash: g.ipHash,
    })
    .select(RSVP_COLUMNS)
    .single();

  if (error) {
    if (error.code === "23505") return fail(DUPLICATE_MESSAGE, 409, { code: "duplicate" });
    console.error("[rsvp] insert failed", error.message);
    return fail("The book refused the ink. Please try again in a moment.", 500);
  }
  return json({ ok: true, rsvp: data, token }, 201);
}

/** Change an existing RSVP using the private edit token kept by the guest's browser. */
export async function PATCH(req: NextRequest) {
  const body = await readJson(req);
  const g = await guard(req, body);
  if ("res" in g) return g.res;
  const id = typeof body!.id === "string" ? body!.id : "";
  const token = typeof body!.token === "string" ? body!.token : "";
  if (!/^[0-9a-f-]{36}$/i.test(id) || token.length < 20 || token.length > 100) {
    return fail("We couldn't find your signature.", 404, { code: "not_found" });
  }
  const v = validateRsvp(body!);
  if (!v.ok) return fail(v.error, 400);

  const { data: existing, error: findError } = await g.db
    .from("rsvps")
    .select("id, edit_token_hash")
    .eq("id", id)
    .maybeSingle();
  if (findError) {
    console.error("[rsvp] lookup failed", findError.message);
    return fail("The book refused the ink. Please try again in a moment.", 500);
  }
  if (!existing || !safeEqual(existing.edit_token_hash as string, sha256(token))) {
    return fail("We couldn't find your signature — it may have been removed by Marta.", 404, { code: "not_found" });
  }

  const { data, error } = await g.db
    .from("rsvps")
    .update({
      name: v.value.name,
      name_key: nameKey(v.value.name),
      status: v.value.status,
      note: v.value.note,
    })
    .eq("id", id)
    .select(RSVP_COLUMNS)
    .single();
  if (error) {
    if (error.code === "23505") return fail(DUPLICATE_MESSAGE, 409, { code: "duplicate" });
    if (error.code === "PGRST116") return fail("We couldn't find your signature.", 404, { code: "not_found" });
    console.error("[rsvp] update failed", error.message);
    return fail("The book refused the ink. Please try again in a moment.", 500);
  }
  return json({ ok: true, rsvp: data, token });
}
