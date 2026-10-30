// Shared (client + server) RSVP rules. The server re-validates everything.

export const RSVP_STATUSES = ["yes", "no", "maybe"] as const;
export type RsvpStatus = (typeof RSVP_STATUSES)[number];

export const NAME_MAX = 80;
export const NOTE_MAX = 500;

export const STATUS_LABEL: Record<RsvpStatus, string> = {
  yes: "Attending",
  no: "Not attending",
  maybe: "Maybe",
};

export const CONFIRMATION: Record<RsvpStatus, string> = {
  yes: "Your name has been written into the Book of the Night. See you after dark!",
  no: "The night will miss you. Until another haunting!",
  maybe: "Your fate is not yet sealed. We'll keep your place in the book!",
};

export type Rsvp = {
  id: string;
  name: string;
  status: RsvpStatus;
  note: string | null;
  created_at: string;
  updated_at: string;
};

// Control characters except tab/newline, zero-width & bidi overrides.
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F​-‏‪-‮⁦-⁩﻿]/g;
const TAGS = /<\/?[a-z!][^>]*>/gi;
const URLISH = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|ru|io|xyz|info|top|biz)\b)/i;

export function cleanName(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw.normalize("NFC").replace(CONTROL, "").replace(TAGS, "").replace(/[<>]/g, "").replace(/\s+/g, " ").trim();
}

export function cleanNote(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw
    .normalize("NFC")
    .replace(/\r\n?/g, "\n")
    .replace(CONTROL, "")
    .replace(TAGS, "")
    .replace(/[<>]/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function nameKey(name: string): string {
  return name.normalize("NFKC").toLocaleLowerCase("en").replace(/\s+/g, " ").trim();
}

export function isStatus(v: unknown): v is RsvpStatus {
  return typeof v === "string" && (RSVP_STATUSES as readonly string[]).includes(v);
}

export type RsvpInput = { name: string; status: RsvpStatus; note: string | null };

export function validateRsvp(body: {
  name?: unknown;
  status?: unknown;
  note?: unknown;
}): { ok: true; value: RsvpInput } | { ok: false; error: string } {
  const name = cleanName(body.name);
  const note = cleanNote(body.note ?? "");
  if (!name) return { ok: false, error: "Please tell us your name." };
  if (name.length > NAME_MAX) return { ok: false, error: `Names are limited to ${NAME_MAX} characters.` };
  if (!/\p{L}/u.test(name)) return { ok: false, error: "That doesn't look like a name." };
  if (URLISH.test(name)) return { ok: false, error: "Links aren't allowed in names." };
  if (!isStatus(body.status)) return { ok: false, error: "Please choose whether you're joining us." };
  if (note.length > NOTE_MAX) return { ok: false, error: `Notes are limited to ${NOTE_MAX} characters.` };
  if ((note.match(/https?:\/\//gi) ?? []).length > 2) return { ok: false, error: "Too many links in your note." };
  return { ok: true, value: { name, status: body.status, note: note || null } };
}
