"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/client/hooks";

type Star = { x: number; y: number; r: number; tw: number; ph: number };
type Ember = { x: number; y: number; r: number; vx: number; vy: number; life: number; max: number; hue: number };

/** One canvas for twinkling stars and drifting embers — cheap on mobile. */
export default function Atmosphere() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduced = prefersReducedMotion();
    let w = 0;
    let h = 0;
    let stars: Star[] = [];
    let embers: Ember[] = [];
    let raf = 0;
    let running = true;

    const spawnEmber = (initial = false): Ember => ({
      x: Math.random() * w,
      y: initial ? Math.random() * h : h + 10,
      r: Math.random() * 1.6 + 0.4,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -(Math.random() * 0.35 + 0.12),
      life: 0,
      max: 500 + Math.random() * 700,
      hue: Math.random() < 0.7 ? 28 : 42,
    });

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const widthChanged = Math.abs(window.innerWidth - w) > 1;
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // iOS resizes the viewport when the toolbar hides; keep the sky stable.
      if (!widthChanged && stars.length) return;
      const area = w * h;
      stars = Array.from({ length: Math.min(220, Math.floor(area / 6500)) }, () => ({
        x: Math.random() * w,
        y: Math.random() * h * 0.75,
        r: Math.random() * 1.1 + 0.2,
        tw: Math.random() * 0.02 + 0.004,
        ph: Math.random() * Math.PI * 2,
      }));
      embers = Array.from({ length: Math.min(46, Math.floor(w / 26)) }, () => spawnEmber(true));
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        const a = reduced ? 0.6 : 0.35 + Math.sin(t * s.tw * 0.06 + s.ph) * 0.3 + 0.25;
        ctx.globalAlpha = Math.max(0.05, a);
        ctx.fillStyle = "#f4ead6";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!reduced) {
        for (let i = 0; i < embers.length; i++) {
          const e = embers[i];
          e.life++;
          e.x += e.vx + Math.sin((e.life + i * 40) / 60) * 0.18;
          e.y += e.vy;
          const p = e.life / e.max;
          if (p >= 1 || e.y < -10) {
            embers[i] = spawnEmber();
            continue;
          }
          const alpha = Math.sin(p * Math.PI) * 0.75;
          const g = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.r * 4);
          g.addColorStop(0, `hsla(${e.hue}, 95%, 65%, ${alpha})`);
          g.addColorStop(1, `hsla(${e.hue}, 95%, 50%, 0)`);
          ctx.globalAlpha = 1;
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.r * 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    };

    const loop = (t: number) => {
      if (!running) return;
      draw(t);
      raf = requestAnimationFrame(loop);
    };

    const onVisibility = () => {
      running = !document.hidden;
      cancelAnimationFrame(raf);
      if (running && !reduced) raf = requestAnimationFrame(loop);
    };

    resize();
    if (reduced) draw(0);
    else raf = requestAnimationFrame(loop);
    const onResize = () => {
      resize();
      if (reduced) draw(0);
    };
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={ref} className="atmosphere" aria-hidden="true" />;
}
