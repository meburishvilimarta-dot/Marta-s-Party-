"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { NAME_MAX, NOTE_MAX, RSVP_STATUSES, STATUS_LABEL, type Rsvp, type RsvpStatus } from "@/lib/rsvp";

type Filter = "all" | RsvpStatus;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All guests" },
  { value: "yes", label: "Attending" },
  { value: "no", label: "Not attending" },
  { value: "maybe", label: "Maybe" },
];

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Tbilisi",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export default function AdminDashboard({ databaseConfigured, canSignOut }: { databaseConfigured: boolean; canSignOut: boolean }) {
  const router = useRouter();
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Rsvp | null>(null);
  const [deleting, setDeleting] = useState<Rsvp | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2600);
  };

  const handleAuth = useCallback(
    (res: Response) => {
      if (res.status === 401) {
        router.refresh();
        return true;
      }
      return false;
    },
    [router],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/rsvps", { cache: "no-store" });
      if (handleAuth(res)) return;
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not load RSVPs");
      setRsvps(data.rsvps);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load RSVPs");
    } finally {
      setLoading(false);
    }
  }, [handleAuth]);

  useEffect(() => {
    if (databaseConfigured) void load();
    else setLoading(false);
  }, [databaseConfigured, load]);

  const counts = useMemo(() => {
    const c = { total: rsvps.length, yes: 0, no: 0, maybe: 0 };
    rsvps.forEach((r) => c[r.status]++);
    return c;
  }, [rsvps]);

  const visible = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    return rsvps.filter((r) => (filter === "all" || r.status === filter) && (!q || r.name.toLocaleLowerCase().includes(q)));
  }, [rsvps, filter, query]);

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
    router.refresh();
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    const target = deleting;
    const res = await fetch(`/api/admin/rsvps/${target.id}`, { method: "DELETE" });
    if (handleAuth(res)) return;
    if (res.ok || res.status === 404) {
      setRsvps((all) => all.filter((r) => r.id !== target.id));
      flash(`Removed ${target.name}`);
    } else {
      const data = await res.json().catch(() => ({}));
      flash(data.error ?? "Delete failed");
    }
    setDeleting(null);
  };

  return (
    <main className="dash">
      <header className="dash__header">
        <div>
          <p className="admin-eyebrow">Marta&rsquo;s private chamber</p>
          <h1 className="dash__title">The Book of the Night</h1>
        </div>
        <div className="dash__header-actions">
          <a href="/" className="admin-btn admin-btn--ghost">
            View invitation
          </a>
          {canSignOut && (
            <button type="button" className="admin-btn admin-btn--ghost" onClick={logout}>
              Sign out
            </button>
          )}
        </div>
      </header>

      {!databaseConfigured && (
        <p className="admin-alert">
          The database isn&rsquo;t connected. Set <code>SUPABASE_URL</code> and <code>SUPABASE_SERVICE_ROLE_KEY</code> in your environment
          variables and run the SQL migration — see the README.
        </p>
      )}

      <section className="stats" aria-label="Summary">
        <Stat label="Total responses" value={counts.total} />
        <Stat label="Attending" value={counts.yes} tone="yes" />
        <Stat label="Not attending" value={counts.no} tone="no" />
        <Stat label="Undecided" value={counts.maybe} tone="maybe" />
      </section>

      <section className="toolbar" aria-label="Filters">
        <div className="tabs" role="tablist" aria-label="Filter by status">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              role="tab"
              aria-selected={filter === f.value}
              className={`tab ${filter === f.value ? "is-active" : ""}`}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
              <span className="tab__count">{f.value === "all" ? counts.total : counts[f.value]}</span>
            </button>
          ))}
        </div>
        <div className="toolbar__right">
          <label className="search">
            <span className="sr-only">Search guests by name</span>
            <input
              type="search"
              className="admin-input"
              placeholder="Search by name…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <button type="button" className="admin-btn admin-btn--ghost" onClick={() => void load()} disabled={loading}>
            Refresh
          </button>
          <a className="admin-btn admin-btn--primary" href="/api/admin/export" download>
            Export CSV
          </a>
        </div>
      </section>

      {error && (
        <p className="admin-alert" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p className="admin-muted dash__empty">Reading the book…</p>
      ) : visible.length === 0 ? (
        <p className="admin-muted dash__empty">
          {rsvps.length === 0 ? "No one has signed the guestbook yet." : "No guests match this filter."}
        </p>
      ) : (
        <div className="table-wrap">
          <table className="guests">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Status</th>
                <th scope="col">Note</th>
                <th scope="col">Submitted</th>
                <th scope="col">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <tr key={r.id}>
                  <td data-label="Name" className="guests__name">
                    {r.name}
                  </td>
                  <td data-label="Status">
                    <span className={`pill pill--${r.status}`}>{STATUS_LABEL[r.status]}</span>
                  </td>
                  <td data-label="Note" className="guests__note">
                    {r.note || <span className="admin-muted">—</span>}
                  </td>
                  <td data-label="Submitted" className="guests__date">
                    <time dateTime={r.created_at}>{dateFmt.format(new Date(r.created_at))}</time>
                    {r.updated_at && new Date(r.updated_at).getTime() - new Date(r.created_at).getTime() > 2000 && (
                      <span className="admin-muted guests__edited">edited {dateFmt.format(new Date(r.updated_at))}</span>
                    )}
                  </td>
                  <td className="guests__actions">
                    <button type="button" className="admin-btn admin-btn--small" onClick={() => setEditing(r)}>
                      Edit
                    </button>
                    <button type="button" className="admin-btn admin-btn--small admin-btn--danger" onClick={() => setDeleting(r)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <EditDialog
          rsvp={editing}
          onClose={() => setEditing(null)}
          onUnauthorised={() => router.refresh()}
          onSaved={(updated) => {
            setRsvps((all) => all.map((r) => (r.id === updated.id ? updated : r)));
            setEditing(null);
            flash(`Updated ${updated.name}`);
          }}
        />
      )}

      {deleting && (
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="del-title">
          <div className="modal__card">
            <h2 id="del-title" className="modal__title">
              Erase {deleting.name}?
            </h2>
            <p className="admin-muted">This permanently removes their RSVP and note from the guestbook.</p>
            <div className="modal__actions">
              <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setDeleting(null)} autoFocus>
                Cancel
              </button>
              <button type="button" className="admin-btn admin-btn--danger" onClick={() => void confirmDelete()}>
                Delete RSVP
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <p className="toast" role="status">
          {toast}
        </p>
      )}
    </main>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: RsvpStatus }) {
  return (
    <div className={`stat ${tone ? `stat--${tone}` : ""}`}>
      <span className="stat__value">{value}</span>
      <span className="stat__label">{label}</span>
    </div>
  );
}

function EditDialog({
  rsvp,
  onClose,
  onSaved,
  onUnauthorised,
}: {
  rsvp: Rsvp;
  onClose: () => void;
  onSaved: (r: Rsvp) => void;
  onUnauthorised: () => void;
}) {
  const [name, setName] = useState(rsvp.name);
  const [status, setStatus] = useState<RsvpStatus>(rsvp.status);
  const [note, setNote] = useState(rsvp.note ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/rsvps/${rsvp.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, status, note }),
      });
      if (res.status === 401) return onUnauthorised();
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not save");
      onSaved(data.rsvp);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="edit-title" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <form className="modal__card" onSubmit={save}>
        <h2 id="edit-title" className="modal__title">
          Edit RSVP
        </h2>
        <label className="admin-label" htmlFor="edit-name">
          Name
        </label>
        <input id="edit-name" className="admin-input" value={name} maxLength={NAME_MAX} onChange={(e) => setName(e.target.value)} required autoFocus />
        <span className="admin-label">Status</span>
        <div className="segmented" role="radiogroup" aria-label="Status">
          {RSVP_STATUSES.map((s) => (
            <label key={s} className={`segmented__opt ${status === s ? "is-active" : ""}`}>
              <input type="radio" name="edit-status" value={s} checked={status === s} onChange={() => setStatus(s)} />
              {STATUS_LABEL[s]}
            </label>
          ))}
        </div>
        <label className="admin-label" htmlFor="edit-note">
          Note
        </label>
        <textarea id="edit-note" className="admin-input" rows={4} maxLength={NOTE_MAX} value={note} onChange={(e) => setNote(e.target.value)} />
        {error && (
          <p className="admin-alert" role="alert">
            {error}
          </p>
        )}
        <div className="modal__actions">
          <button type="button" className="admin-btn admin-btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="admin-btn admin-btn--primary" disabled={busy}>
            {busy ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
