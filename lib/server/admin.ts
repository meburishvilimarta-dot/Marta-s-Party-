import "server-only";
import type { NextRequest } from "next/server";
import { getDb, NOT_CONFIGURED_MESSAGE } from "./supabase";
import { isAdminRequest, isSameOrigin } from "./security";
import { fail } from "./http";

/** Server-side authorisation gate shared by every admin API route. */
export function requireAdmin(req: NextRequest, { mutating = false } = {}) {
  if (!isAdminRequest(req)) return { res: fail("Unauthorised.", 401) } as const;
  if (mutating && !isSameOrigin(req)) return { res: fail("Forbidden.", 403) } as const;
  const db = getDb();
  if (!db) return { res: fail(NOT_CONFIGURED_MESSAGE, 503, { code: "not_configured" }) } as const;
  return { db } as const;
}
