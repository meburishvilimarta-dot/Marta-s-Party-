"use client";

import { useEffect, useState } from "react";
import { Ghost } from "./art";
import { prefersReducedMotion } from "@/lib/client/hooks";
import { sound } from "@/lib/client/sound";

type G = { id: number; left: number; size: number; duration: number };
let gid = 1;

/** A pale visitor drifts up now and then. Typing “boo” summons one at once. */
export default function Ghosts() {
  const [ghosts, setGhosts] = useState<G[]>([]);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const spawn = () => {
      setGhosts((g) => [
        ...g.slice(-3),
        { id: gid++, left: 5 + Math.random() * 85, size: 50 + Math.random() * 50, duration: 11 + Math.random() * 6 },
      ]);
    };
    let t: number;
    const schedule = () => {
      t = window.setTimeout(() => {
        if (!document.hidden) spawn();
        schedule();
      }, 16000 + Math.random() * 20000);
    };
    schedule();

    let typed = "";
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) return;
      typed = (typed + e.key.toLowerCase()).slice(-3);
      if (typed === "boo") {
        sound.play("boo");
        spawn();
        window.setTimeout(spawn, 500);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className="ghosts" aria-hidden="true">
      {ghosts.map((g) => (
        <div
          key={g.id}
          className="ghost-drift"
          style={{ left: `${g.left}vw`, width: g.size, animationDuration: `${g.duration}s` }}
          onAnimationEnd={() => setGhosts((all) => all.filter((x) => x.id !== g.id))}
        >
          <Ghost className="ghost" />
        </div>
      ))}
    </div>
  );
}
