"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { CONFIRMATION, NAME_MAX, NOTE_MAX, type RsvpStatus } from "@/lib/rsvp";
import { EVENT } from "@/lib/event";
import { downloadCalendarInvite } from "@/lib/client/calendar";
import { sound } from "@/lib/client/sound";
import { useInView } from "@/lib/client/hooks";
import { Raven, WaxSeal } from "./art";
import { summonBats } from "./Bats";
import { RSVP_CHANGED } from "./GuestCounter";

const STORAGE_KEY = "martas-halloween:rsvp";

type Saved = { id: string; token: string; name: string; status: RsvpStatus; note: string };

const CHOICES: { value: RsvpStatus; label: string; hint: string; glyph: string }[] = [
  { value: "yes", label: "Yes, I’ll be there! 🦇", hint: "Count me among the haunted", glyph: "☾" },
  { value: "no", label: "Sadly, I can’t make it.", hint: "I’ll haunt from afar", glyph: "✕" },
  { value: "maybe", label: "I’m not sure yet.", hint: "The spirits are undecided", glyph: "?" },
];

const SEALED_TITLE: Record<RsvpStatus, string> = {
  yes: "Signed in ink",
  no: "Sealed with regret",
  maybe: "Sealed in pencil",
};

function loadSaved(): Saved | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw);
    return v && typeof v.id === "string" && typeof v.token === "string" ? (v as Saved) : null;
  } catch {
    return null;
  }
}
function persist(v: Saved | null) {
  try {
    if (v) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(v));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

type Mode = "form" | "sealed";

export default function Guestbook() {
  const [bookRef, open] = useInView<HTMLDivElement>({ threshold: 0.18 });
  const [mode, setMode] = useState<Mode>("form");
  const [saved, setSaved] = useState<Saved | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [status, setStatus] = useState<RsvpStatus | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<{ message: string; offline?: boolean } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const inFlight = useRef(false);
  const honeypot = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  // A returning guest sees their sealed answer rather than a blank form.
  useEffect(() => {
    const s = loadSaved();
    if (s) {
      setSaved(s);
      setMode("sealed");
    }
  }, []);

  const beginEdit = () => {
    if (!saved) return;
    setName(saved.name);
    setStatus(saved.status);
    setNote(saved.note);
    setEditing(true);
    setError(null);
    setNotice(null);
    setStartedAt(Date.now());
    setMode("form");
    window.setTimeout(() => nameRef.current?.focus(), 50);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (inFlight.current) return; // no accidental double-seals
    setError(null);
    setNotice(null);
    if (!name.trim()) {
      setError({ message: "Please write your name in the book." });
      nameRef.current?.focus();
      return;
    }
    if (!status) {
      setError({ message: "Please choose whether you’re joining us." });
      return;
    }

    inFlight.current = true;
    setSubmitting(true);
    const isUpdate = editing && saved;
    try {
      const res = await fetch("/api/rsvp", {
        method: isUpdate ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          status,
          note,
          startedAt,
          website: honeypot.current?.value ?? "",
          ...(isUpdate ? { id: saved.id, token: saved.token } : {}),
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.status === 404 && isUpdate) {
        // Marta removed the old entry — start fresh rather than fail silently.
        persist(null);
        setSaved(null);
        setEditing(false);
        setStartedAt(Date.now());
        setNotice("Your earlier signature has vanished from the book. Please sign again.");
        return;
      }
      if (!res.ok || !data?.rsvp) {
        setError({
          message: data?.error ?? "The book refused the ink. Please try again.",
          offline: data?.code === "not_configured",
        });
        return;
      }

      const next: Saved = {
        id: data.rsvp.id,
        token: data.token,
        name: data.rsvp.name,
        status: data.rsvp.status,
        note: data.rsvp.note ?? "",
      };
      persist(next);
      setSaved(next);
      setEditing(false);
      setMode("sealed");
      sound.play("crack", 0.6);
      window.setTimeout(() => sound.play("chime", 0.6), 500);
      if (next.status === "yes") window.setTimeout(() => summonBats(6), 900);
      window.dispatchEvent(new Event(RSVP_CHANGED));
      window.setTimeout(() => resultRef.current?.focus({ preventScroll: true }), 80);
    } catch {
      setError({ message: "The raven lost its way (network error). Please check your connection and try again." });
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  };

  return (
    <section className="section guestbook" id="guestbook" aria-labelledby="guestbook-title">
      <div className="section__head">
        <p className="eyebrow">RSVP</p>
        <h2 id="guestbook-title" className="section__title">
          The Haunted <em>Guestbook</em>
        </h2>
        <p className="section__lede">Every guest must leave their mark. Will you join us for the night?</p>
      </div>

      <div ref={bookRef} className={`book ${open ? "is-open" : ""}`}>
        <div className="book__cover" aria-hidden="true" />
        <div className="book__spread">
          <aside className="book__page book__page--left" aria-hidden="true">
            <div className="book__ornament">
              <span className="book__ornament-line" />
              <span>✦</span>
              <span className="book__ornament-line" />
            </div>
            <p className="book__epigraph">
              &ldquo;Sign thy name in ink and candle-smoke, and the house shall know thee when the clock strikes eight.&rdquo;
            </p>
            <div className="book__ledger">
              <span>Liber Noctis</span>
              <span>Vol. XXXI · Octobris</span>
            </div>
            <WaxSeal id="book-seal" className="book__seal" />
            <p className="book__left-foot">{EVENT.dateLabel} · {EVENT.timeLabel}</p>
          </aside>

          <div className="book__page book__page--right">
            {mode === "sealed" && saved ? (
              <div className={`sealed sealed--${saved.status}`} ref={resultRef} tabIndex={-1} role="status" aria-live="polite">
                <Raven className="sealed__raven" />
                <div className="sealed__stamp">
                  <WaxSeal id="sealed-seal" className="sealed__seal" letter={saved.name.trim().charAt(0).toUpperCase() || "M"} />
                </div>
                <p className="sealed__kicker">{SEALED_TITLE[saved.status]}</p>
                <p className="sealed__name">{saved.name}</p>
                <p className="sealed__message">{CONFIRMATION[saved.status]}</p>
                <div className="sealed__actions">
                  {saved.status !== "no" && (
                    <button type="button" className="btn btn--ink" onClick={downloadCalendarInvite}>
                      <span>Add to calendar</span>
                    </button>
                  )}
                  <button type="button" className="btn btn--ink-ghost" onClick={beginEdit}>
                    <span>Change my answer</span>
                  </button>
                </div>
              </div>
            ) : (
              <form className="rsvp" onSubmit={submit} noValidate aria-describedby="rsvp-status">
                <p className="rsvp__folio" aria-hidden="true">
                  {editing ? "Amending your entry" : "Folio xxxi"}
                </p>

                <div className="field">
                  <label htmlFor="rsvp-name" className="field__label">
                    Your name
                  </label>
                  <input
                    ref={nameRef}
                    id="rsvp-name"
                    name="name"
                    className="field__input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={NAME_MAX}
                    autoComplete="name"
                    required
                    aria-required="true"
                    placeholder="Write it as you'd sign a pact…"
                  />
                </div>

                <fieldset className="field choices">
                  <legend className="field__label">Are you joining us?</legend>
                  <div className="choices__list">
                    {CHOICES.map((c) => (
                      <label key={c.value} className={`choice choice--${c.value} ${status === c.value ? "is-selected" : ""}`}>
                        <input
                          type="radio"
                          name="status"
                          value={c.value}
                          checked={status === c.value}
                          onChange={() => {
                            setStatus(c.value);
                            if (c.value === "yes") sound.play("flutter", 0.5);
                          }}
                          required
                        />
                        <span className="choice__glyph" aria-hidden="true">
                          {c.glyph}
                        </span>
                        <span className="choice__text">
                          <span className="choice__label">{c.label}</span>
                          <span className="choice__hint">{c.hint}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div className="field">
                  <label htmlFor="rsvp-note" className="field__label">
                    A little note for Marta <span className="field__optional">(optional)</span>
                  </label>
                  <textarea
                    id="rsvp-note"
                    name="note"
                    className="field__input field__input--area"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    maxLength={NOTE_MAX}
                    rows={4}
                    placeholder="Bringing something? Running late? Have a special request? Leave me a little note..."
                  />
                  <span className="field__count" aria-hidden="true">
                    {note.length}/{NOTE_MAX}
                  </span>
                </div>

                {/* Honeypot for bots — hidden from people and assistive tech. */}
                <div className="hp" aria-hidden="true">
                  <label htmlFor="rsvp-website">Website</label>
                  <input ref={honeypot} id="rsvp-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
                </div>

                <div id="rsvp-status" aria-live="assertive">
                  {notice && <p className="rsvp__notice">{notice}</p>}
                  {error && (
                    <div className="rsvp__error" role="alert">
                      <p>{error.message}</p>
                      {error.offline && (
                        <a className="link-btn link-btn--ink" href={EVENT.whatsapp} target="_blank" rel="noopener noreferrer">
                          Message Marta on WhatsApp
                        </a>
                      )}
                    </div>
                  )}
                </div>

                <div className="rsvp__submit-row">
                  <button type="submit" className={`btn btn--wax ${submitting ? "is-busy" : ""}`} disabled={submitting} aria-busy={submitting}>
                    <span className="btn--wax__drop" aria-hidden="true" />
                    <span>{submitting ? "Sealing…" : editing ? "Reseal my RSVP" : "Seal my RSVP"}</span>
                  </button>
                  {editing && (
                    <button
                      type="button"
                      className="link-btn link-btn--ink"
                      onClick={() => {
                        setEditing(false);
                        setError(null);
                        setMode("sealed");
                      }}
                    >
                      Keep my original answer
                    </button>
                  )}
                </div>
                <p className="rsvp__privacy">Only Marta can read the guestbook. Your note stays between you and her.</p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
