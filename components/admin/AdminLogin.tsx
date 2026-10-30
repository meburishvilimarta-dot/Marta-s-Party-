"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not sign in.");
        return;
      }
      setPassword("");
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="admin-login">
      <form className="admin-login__card" onSubmit={submit}>
        <p className="admin-eyebrow">Private chamber</p>
        <h1 className="admin-login__title">The Book of the Night</h1>
        <p className="admin-muted">Only the host may read the guestbook.</p>
        {!configured && (
          <p className="admin-alert">
            Admin access isn&rsquo;t configured yet. Add <code>ADMIN_PASSWORD</code> and <code>ADMIN_SESSION_SECRET</code> to your
            environment variables, then redeploy.
          </p>
        )}
        <label htmlFor="admin-password" className="admin-label">
          Password
        </label>
        <input
          id="admin-password"
          type="password"
          className="admin-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
          autoFocus
        />
        {error && (
          <p className="admin-alert" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="admin-btn admin-btn--primary" disabled={busy || !password}>
          {busy ? "Opening…" : "Open the book"}
        </button>
        <a href="/" className="admin-link">
          ← Back to the invitation
        </a>
      </form>
    </main>
  );
}
