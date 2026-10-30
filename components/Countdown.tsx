"use client";

import { useEffect, useState } from "react";
import { EVENT } from "@/lib/event";
import Reveal from "./Reveal";

const TARGET = new Date(EVENT.startsAt).getTime();

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

function tbilisiNow(now: number) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: EVENT.timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(now);
}

export default function Countdown() {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const begun = now !== null && now >= TARGET;
  const p = now === null ? null : parts(TARGET - now);
  const units: [string, number | undefined][] = [
    ["Days", p?.days],
    ["Hours", p?.hours],
    ["Minutes", p?.minutes],
    ["Seconds", p?.seconds],
  ];

  return (
    <section className="section countdown" id="countdown" aria-labelledby="countdown-title">
      <Reveal className="section__head">
        <p className="eyebrow">The clock is ticking</p>
        <h2 id="countdown-title" className="section__title">
          {begun ? "The doors are open" : <>Until the <em>doors</em> open</>}
        </h2>
      </Reveal>
      {begun ? (
        <Reveal className="countdown__begun">
          <p role="status">The night has begun.</p>
        </Reveal>
      ) : (
        <Reveal className="countdown__grid" delay={0.1}>
          <div role="timer" aria-live="off" aria-label="Time remaining until the party" className="countdown__units">
            {units.map(([label, v], i) => (
              <div key={label} className="countdown__unit">
                <span className="countdown__value" key={label === "Seconds" ? v : undefined}>
                  {v === undefined ? "––" : String(v).padStart(2, "0")}
                </span>
                <span className="countdown__label">{label}</span>
                {i < 3 && <span className="countdown__sep" aria-hidden="true" />}
              </div>
            ))}
          </div>
        </Reveal>
      )}
      <p className="countdown__tz">
        Saturday 31 October · 20:00 Tbilisi time (GMT+4)
        {now !== null && !begun && <> · it&rsquo;s now {tbilisiNow(now)} in Tbilisi</>}
      </p>
    </section>
  );
}
