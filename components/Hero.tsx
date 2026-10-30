import { EVENT } from "@/lib/event";
import { Candle } from "./art";
import CornerWeb from "./CornerWeb";
import GuestCounter from "./GuestCounter";

export default function Hero() {
  return (
    <header className="hero" id="top">
      <CornerWeb side="left" spider />
      <CornerWeb side="right" />
      <div className="hero__candles hero__candles--l" aria-hidden="true">
        <Candle height={120} delay={0} />
        <Candle height={84} delay={0.7} />
        <Candle height={56} delay={1.3} />
      </div>
      <div className="hero__candles hero__candles--r" aria-hidden="true">
        <Candle height={64} delay={0.4} />
        <Candle height={104} delay={1.6} />
      </div>

      <div className="hero__content">
        <p className="eyebrow hero__eyebrow">
          <span className="rule" aria-hidden="true" /> All Hallows&rsquo; Eve · MMXXVI <span className="rule" aria-hidden="true" />
        </p>
        <h1 className="hero__title" id="main-title" tabIndex={-1}>
          <span className="hero__line hero__line--1">Marta&rsquo;s</span>
          <span className="hero__line hero__line--2">Halloween</span>
          <span className="hero__line hero__line--3">Pre-Drinks</span>
        </h1>
        <p className="hero__tagline">{EVENT.tagline}</p>
        <p className="hero__meta">
          <span>31 October</span>
          <span className="hero__meta-dot" aria-hidden="true">✦</span>
          <span>20:00</span>
          <span className="hero__meta-dot" aria-hidden="true">✦</span>
          <span>Tbilisi</span>
        </p>
        <div className="hero__actions">
          <a href="#guestbook" className="btn btn--seal">
            <span>RSVP in the guestbook</span>
          </a>
          <GuestCounter />
        </div>
      </div>

      <a href="#summons" className="scroll-cue" aria-label="Scroll to the invitation">
        <span>Descend</span>
        <i aria-hidden="true" />
      </a>
    </header>
  );
}
