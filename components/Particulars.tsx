"use client";

import { EVENT } from "@/lib/event";
import { downloadCalendarInvite } from "@/lib/client/calendar";
import Reveal from "./Reveal";
import Pumpkin from "./Pumpkin";

function MoonIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="M30 6a18 18 0 1 0 12 30A16 16 0 0 1 30 6Z" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="14" cy="12" r="1" fill="currentColor" />
      <circle cx="40" cy="14" r="0.8" fill="currentColor" />
    </svg>
  );
}
function HourglassIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="M12 6h24M12 42h24M15 6c0 10 18 12 18 18S15 32 15 42M33 6c0 10-18 12-18 18s18 8 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M19 38c2-3 8-3 10 0Z" fill="currentColor" opacity="0.7" />
    </svg>
  );
}
function KeyIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="14" cy="24" r="8" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="14" cy="24" r="3" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M22 24h20M36 24v6M41 24v4" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

const CARDS = [
  { n: "I", label: "Date", value: EVENT.dateLabel, Icon: MoonIcon, note: "All Hallows’ Eve" },
  { n: "II", label: "Time", value: EVENT.timeLabel, Icon: HourglassIcon, note: "Tbilisi time · doors open at dusk’s end" },
  { n: "III", label: "Location", value: EVENT.addressShort, Icon: KeyIcon, note: "Follow the candlelight" },
];

export default function Particulars() {
  return (
    <section className="section particulars" id="details" aria-labelledby="details-title">
      <Reveal className="section__head">
        <p className="eyebrow">The Particulars</p>
        <h2 id="details-title" className="section__title">
          Mark the <em>hour</em>
        </h2>
      </Reveal>
      <div className="arches">
        {CARDS.map(({ n, label, value, Icon, note }, i) => (
          <Reveal key={label} className="arch" delay={i * 0.12}>
            <span className="arch__numeral" aria-hidden="true">
              {n}
            </span>
            <span className="arch__icon">
              <Icon />
            </span>
            <h3 className="arch__label">{label}</h3>
            <p className="arch__value">{value}</p>
            <p className="arch__note">{note}</p>
            {label === "Date" && (
              <button type="button" className="link-btn" onClick={downloadCalendarInvite}>
                Add to calendar
              </button>
            )}
            {label === "Location" && (
              <a className="link-btn" href="#location">
                Find the house
              </a>
            )}
            {label === "Time" && (
              <a className="link-btn" href="#countdown">
                See the countdown
              </a>
            )}
          </Reveal>
        ))}
      </div>
      <div className="particulars__pumpkins">
        <Pumpkin size={84} />
        <Pumpkin size={60} className="pumpkin--small" />
      </div>
    </section>
  );
}
