"use client";

import { useEffect, useRef, useState } from "react";
import { Candle, WaxSeal } from "./art";
import { summonBats } from "./Bats";
import { sound } from "@/lib/client/sound";
import { prefersReducedMotion } from "@/lib/client/hooks";

export type Stage = "sealed" | "cracking" | "opening" | "rising" | "reveal";

const INVITED = "You have been invited…";

export default function Opening({ onDone }: { onDone: () => void }) {
  const [stage, setStage] = useState<Stage>("sealed");
  const timers = useRef<number[]>([]);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const t = window.setTimeout(() => button.current?.focus({ preventScroll: true }), 2600);
    const all = timers.current;
    return () => {
      window.clearTimeout(t);
      all.forEach(window.clearTimeout);
    };
  }, []);

  const at = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));

  const unseal = () => {
    if (stage !== "sealed") return;
    if (prefersReducedMotion()) {
      setStage("reveal");
      at(400, onDone);
      return;
    }
    setStage("cracking");
    at(650, () => {
      sound.play("crack");
      setStage("opening");
    });
    at(1050, () => sound.play("whoosh", 0.7));
    at(1700, () => setStage("rising"));
    at(2900, () => {
      setStage("reveal");
      sound.play("flutter");
      summonBats(9);
    });
    at(4100, onDone);
  };

  return (
    <section className={`opening stage-${stage}`} aria-label="Your sealed invitation">
      <div className="opening__inner">
        <p className="opening__eyebrow" aria-label={INVITED}>
          {INVITED.split("").map((ch, i) => (
            <span key={i} style={{ animationDelay: `${0.4 + i * 0.055}s` }} aria-hidden="true">
              {ch === " " ? " " : ch}
            </span>
          ))}
        </p>
        <h1 className="opening__title">
          <span className="opening__title-small">Marta&rsquo;s</span>
          <span className="opening__title-big">Halloween Night</span>
        </h1>

        <div className="envelope-stage">
          <Candle className="opening__candle opening__candle--l" height={86} delay={0.2} />
          <div className="envelope" aria-hidden="true">
            <div className="envelope__back" />
            <div className="envelope__letter">
              <span className="envelope__letter-kicker">Admit one honoured guest</span>
              <span className="envelope__letter-title">31 · X · MMXXVI</span>
              <span className="envelope__letter-sub">Tbilisi · from 20:00</span>
            </div>
            <div className="envelope__front">
              <span className="envelope__address">
                <em>for the honoured guest</em>
                <span>by candlelight</span>
              </span>
            </div>
            <div className="envelope__flap" />
            <div className="seal">
              <WaxSeal id="opening-seal" className="seal__half seal__half--l" />
              <WaxSeal id="opening-seal-r" className="seal__half seal__half--r" />
              <svg className="seal__crack" viewBox="0 0 120 120">
                <path d="M62 4 L56 30 L66 46 L54 64 L64 82 L56 100 L60 118" />
              </svg>
            </div>
          </div>
          <Candle className="opening__candle opening__candle--r" height={64} delay={1.1} />
        </div>

        <button ref={button} type="button" className="btn btn--seal opening__cta" onClick={unseal} disabled={stage !== "sealed"}>
          <span>Unseal your invitation</span>
        </button>
        <p className="opening__hint">Turn on sound in the corner for the full haunting.</p>
      </div>
      <div className="opening__flash" aria-hidden="true" />
    </section>
  );
}
