"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BatShape } from "./art";
import { prefersReducedMotion } from "@/lib/client/hooks";

type Bat = { id: number; top: number; dy: number; scale: number; duration: number; delay: number; dir: 1 | -1; wobble: number };

const EVENT = "mh:bats";

/** Fire from anywhere: a small colony bursts across the screen. */
export function summonBats(count = 5) {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(EVENT, { detail: count }));
}

let nextId = 1;

export default function Bats() {
  const [bats, setBats] = useState<Bat[]>([]);
  const timer = useRef<number | undefined>(undefined);

  const add = useCallback((count: number, burst = false) => {
    if (prefersReducedMotion()) return;
    const dirAll: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
    const fresh: Bat[] = Array.from({ length: count }, (_, i) => ({
      id: nextId++,
      top: burst ? 25 + Math.random() * 35 : 6 + Math.random() * 50,
      dy: (Math.random() - 0.6) * 30,
      scale: 0.45 + Math.random() * (burst ? 0.8 : 0.6),
      duration: (burst ? 3.2 : 7) + Math.random() * 4,
      delay: burst ? i * 0.12 + Math.random() * 0.25 : 0,
      dir: burst ? dirAll : Math.random() < 0.5 ? 1 : -1,
      wobble: 2 + Math.random() * 4,
    }));
    setBats((b) => [...b.slice(-24), ...fresh]);
  }, []);

  useEffect(() => {
    const schedule = () => {
      timer.current = window.setTimeout(() => {
        if (!document.hidden) add(Math.random() < 0.25 ? 2 : 1);
        schedule();
      }, 5000 + Math.random() * 9000);
    };
    schedule();
    const onSummon = (e: Event) => add(Number((e as CustomEvent).detail) || 5, true);
    window.addEventListener(EVENT, onSummon);
    return () => {
      window.clearTimeout(timer.current);
      window.removeEventListener(EVENT, onSummon);
    };
  }, [add]);

  return (
    <div className="bats" aria-hidden="true">
      {bats.map((b) => (
        <div
          key={b.id}
          className="bat-flight"
          style={
            {
              top: `${b.top}vh`,
              "--dy": `${b.dy}vh`,
              "--x0": b.dir === 1 ? "-14vw" : "114vw",
              "--x1": b.dir === 1 ? "114vw" : "-14vw",
              "--wob": `${b.wobble}vh`,
              animationDuration: `${b.duration}s`,
              animationDelay: `${b.delay}s`,
            } as React.CSSProperties
          }
          onAnimationEnd={() => setBats((all) => all.filter((x) => x.id !== b.id))}
        >
          <BatShape className="bat" style={{ transform: `scale(${b.scale}) scaleX(${b.dir})` }} />
        </div>
      ))}
    </div>
  );
}
