"use client";

import { useEffect, useState } from "react";

export const RSVP_CHANGED = "mh:rsvp-changed";

/** Anonymous tally of confirmed guests. Names and notes never leave the server. */
export default function GuestCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch("/api/stats", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => alive && setCount(typeof d?.attending === "number" ? d.attending : null))
        .catch(() => {});
    load();
    window.addEventListener(RSVP_CHANGED, load);
    return () => {
      alive = false;
      window.removeEventListener(RSVP_CHANGED, load);
    };
  }, []);

  if (count === null) return null;
  return (
    <a href="#guestbook" className="guest-counter">
      <span className="guest-counter__dot" aria-hidden="true" />
      {count === 0 ? (
        <span>The guestbook awaits its first signature</span>
      ) : (
        <span>
          <strong>{count}</strong> {count === 1 ? "soul has" : "souls have"} confirmed for the night
        </span>
      )}
    </a>
  );
}
