"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/client/hooks";

/**
 * Candlelight that follows the pointer on desktop, plus a little shower of
 * embers wherever you click. The native cursor stays for accessibility.
 */
export default function Lantern() {
  const glow = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = prefersReducedMotion();
    const el = glow.current;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let cx = x;
    let cy = y;
    let raf = 0;

    const tick = () => {
      cx += (x - cx) * 0.14;
      cy += (y - cy) * 0.14;
      if (el) el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      if (Math.abs(x - cx) > 0.3 || Math.abs(y - cy) > 0.3) raf = requestAnimationFrame(tick);
      else raf = 0;
    };
    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (el) el.style.opacity = "1";
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onLeave = () => el && (el.style.opacity = "0");

    const onClick = (e: PointerEvent) => {
      if (reduced) return;
      for (let i = 0; i < 8; i++) {
        const s = document.createElement("span");
        s.className = "spark";
        const a = (Math.PI * 2 * i) / 8 + Math.random() * 0.5;
        const d = 18 + Math.random() * 26;
        s.style.left = `${e.clientX}px`;
        s.style.top = `${e.clientY}px`;
        s.style.setProperty("--tx", `${Math.cos(a) * d}px`);
        s.style.setProperty("--ty", `${Math.sin(a) * d - 10}px`);
        document.body.appendChild(s);
        window.setTimeout(() => s.remove(), 750);
      }
    };

    if (fine && !reduced) {
      window.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
    }
    window.addEventListener("pointerdown", onClick, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onClick);
    };
  }, []);

  return <div ref={glow} className="lantern" aria-hidden="true" />;
}
