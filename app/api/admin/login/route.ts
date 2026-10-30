import type { NextRequest } from "next/server";
import {
  ADMIN_COOKIE,
  checkAdminPassword,
  clientIpHash,
  createSessionValue,
  isAdminConfigured,
  isSameOrigin,
  rateLimit,
} from "@/lib/server/security";
import { fail, json, readJson } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return fail("Forbidden.", 403);
  if (!isAdminConfigured()) {
    return fail("Admin access isn't configured. Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET.", 503, {
      code: "not_configured",
    });
  }
  const allowed = await rateLimit("admin-login", clientIpHash(req), [{ windowSeconds: 15 * 60, max: 8 }]);
  if (!allowed) return fail("Too many attempts. Wait 15 minutes and try again.", 429);

  const body = await readJson(req, 1024);
  if (!checkAdminPassword(body?.password)) {
    await new Promise((r) => setTimeout(r, 600));
    return fail("That is not the word that opens this door.", 401);
  }
  const { value, maxAge } = createSessionValue();
  const res = json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge,
  });
  return res;
}
