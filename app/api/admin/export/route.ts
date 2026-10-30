import type { NextRequest } from "next/server";
import { STATUS_LABEL, type Rsvp } from "@/lib/rsvp";
import { requireAdmin } from "@/lib/server/admin";
import { fail } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Quote every cell and neutralise spreadsheet formula injection (=, +, -, @).
function cell(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

export async function GET(req: NextRequest) {
  const gate = requireAdmin(req);
  if ("res" in gate) return gate.res;
  const { data, error } = await gate.db
    .from("rsvps")
    .select("id,name,status,note,created_at,updated_at")
    .order("created_at", { ascending: true });
  if (error) return fail("Could not export the guestbook.", 500);

  const rows = (data as Rsvp[]).map((r) =>
    [r.name, STATUS_LABEL[r.status] ?? r.status, r.note ?? "", r.created_at, r.updated_at].map(cell).join(","),
  );
  const csv = "﻿" + [["Name", "Status", "Note", "Submitted", "Last updated"].map(cell).join(","), ...rows].join("\r\n");
  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="martas-halloween-guestbook-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
