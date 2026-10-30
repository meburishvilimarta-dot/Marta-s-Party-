import type { NextRequest } from "next/server";
import { ADMIN_COOKIE, isSameOrigin } from "@/lib/server/security";
import { fail, json } from "@/lib/server/http";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return fail("Forbidden.", 403);
  const res = json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { httpOnly: true, sameSite: "strict", path: "/", maxAge: 0 });
  return res;
}
