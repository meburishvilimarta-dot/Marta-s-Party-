import "server-only";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
import { getDb } from "./supabase";

export const ADMIN_COOKIE = "mh_admin";
const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 hours

function secret(): string | null {
  const s = process.env.ADMIN_SESSION_SECRET;
  return s && s.length >= 32 ? s : null;
}

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD && secret());
}

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function newToken(): string {
  return randomBytes(32).toString("base64url");
}

export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) {
    // still burn comparable time
    timingSafeEqual(ab, ab);
    return false;
  }
  return timingSafeEqual(ab, bb);
}

export function checkAdminPassword(candidate: unknown): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || typeof candidate !== "string") return false;
  // Compare digests so lengths always match.
  return safeEqual(sha256(candidate), sha256(expected));
}

function sign(payload: string, key: string): string {
  return createHmac("sha256", key).update(payload).digest("base64url");
}

export function createSessionValue(): { value: string; maxAge: number } {
  const key = secret();
  if (!key) throw new Error("ADMIN_SESSION_SECRET is missing or shorter than 32 characters");
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = `admin.${exp}.${randomBytes(9).toString("base64url")}`;
  return { value: `${payload}.${sign(payload, key)}`, maxAge: SESSION_TTL_SECONDS };
}

export function verifySessionValue(value: string | undefined | null): boolean {
  const key = secret();
  if (!key || !value) return false;
  const idx = value.lastIndexOf(".");
  if (idx <= 0) return false;
  const payload = value.slice(0, idx);
  const sig = value.slice(idx + 1);
  if (!safeEqual(sig, sign(payload, key))) return false;
  const [role, expStr] = payload.split(".");
  const exp = Number(expStr);
  return role === "admin" && Number.isFinite(exp) && exp > Date.now() / 1000;
}

export function isAdminRequest(req: NextRequest): boolean {
  return verifySessionValue(req.cookies.get(ADMIN_COOKIE)?.value);
}

/** Reject cross-site state-changing requests (defence in depth on top of SameSite=strict). */
export function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return req.headers.get("sec-fetch-site") !== "cross-site";
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function clientIpHash(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  const ip = (fwd?.split(",")[0] ?? req.headers.get("x-real-ip") ?? "unknown").trim();
  return sha256(`${secret() ?? "martas-halloween"}:${ip}`).slice(0, 40);
}

// ── Rate limiting ───────────────────────────────────────────────────────────
// Backed by the `rate_limit_events` table so limits hold across serverless
// instances. Falls back to per-instance memory if the database is down.

const memory = new Map<string, number[]>();

function memoryHit(key: string, windowMs: number, limit: number): boolean {
  const now = Date.now();
  const hits = (memory.get(key) ?? []).filter((t) => now - t < windowMs);
  hits.push(now);
  memory.set(key, hits);
  if (memory.size > 5000) memory.clear();
  return hits.length <= limit;
}

export type Limit = { windowSeconds: number; max: number };

/** Records an attempt and returns true if it is still within every limit. */
export async function rateLimit(bucket: string, keyHash: string, limits: Limit[]): Promise<boolean> {
  const longest = Math.max(...limits.map((l) => l.windowSeconds));
  const db = getDb();
  if (db) {
    const since = new Date(Date.now() - longest * 1000).toISOString();
    const { data, error } = await db
      .from("rate_limit_events")
      .select("created_at")
      .eq("bucket", bucket)
      .eq("key_hash", keyHash)
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(500);
    if (!error) {
      const now = Date.now();
      const times = (data ?? []).map((r) => new Date(r.created_at as string).getTime());
      const allowed = limits.every(
        (l) => times.filter((t) => now - t < l.windowSeconds * 1000).length < l.max,
      );
      if (allowed) await db.from("rate_limit_events").insert({ bucket, key_hash: keyHash });
      return allowed;
    }
  }
  return limits.every((l) => memoryHit(`${bucket}:${l.windowSeconds}:${keyHash}`, l.windowSeconds * 1000, l.max));
}
