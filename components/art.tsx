// Pure SVG/CSS illustrations shared across the site.

import type { CSSProperties } from "react";

export function BatShape({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 64 32" aria-hidden="true" focusable="false">
      <g className="bat-wing bat-wing--l">
        <path d="M32 15 C27 8 17 5 3 9 C8 11 9.5 14 8.5 18 C12.5 15.5 15.5 16.5 17.5 21 C20.5 17.5 24.5 17.5 28 20 Z" />
      </g>
      <g className="bat-wing bat-wing--r">
        <path d="M32 15 C37 8 47 5 61 9 C56 11 54.5 14 55.5 18 C51.5 15.5 48.5 16.5 46.5 21 C43.5 17.5 39.5 17.5 36 20 Z" />
      </g>
      <path d="M29.6 11.5 L30.4 8.4 L31.6 11 L32.4 11 L33.6 8.4 L34.4 11.5 C36 13 36 19 32 23 C28 19 28 13 29.6 11.5 Z" />
    </svg>
  );
}

/** Deterministic wobbly circle for wax seals. */
function blobPath(cx: number, cy: number, r: number, seed: number, points = 22) {
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const pts = Array.from({ length: points }, (_, i) => {
    const a = (i / points) * Math.PI * 2;
    const rr = r * (0.93 + rand() * 0.11);
    return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr];
  });
  const mid = (a: number[], b: number[]) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  let d = `M ${mid(pts[points - 1], pts[0]).join(" ")}`;
  for (let i = 0; i < points; i++) {
    const p = pts[i];
    const m = mid(p, pts[(i + 1) % points]);
    d += ` Q ${p[0].toFixed(2)} ${p[1].toFixed(2)} ${m[0].toFixed(2)} ${m[1].toFixed(2)}`;
  }
  return d + " Z";
}

const SEAL_EDGE = blobPath(60, 60, 57, 7);

export function WaxSeal({ id = "seal", className, letter = "M" }: { id?: string; className?: string; letter?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={`${id}-wax`} cx="38%" cy="32%" r="75%">
          <stop offset="0" stopColor="#d02a36" />
          <stop offset="0.45" stopColor="#8B101B" />
          <stop offset="1" stopColor="#3b050c" />
        </radialGradient>
        <radialGradient id={`${id}-inner`} cx="60%" cy="65%" r="70%">
          <stop offset="0" stopColor="#a3141f" />
          <stop offset="1" stopColor="#5a0812" />
        </radialGradient>
      </defs>
      <path d={SEAL_EDGE} fill={`url(#${id}-wax)`} />
      <circle cx="60" cy="60" r="40" fill={`url(#${id}-inner)`} stroke="#3b050c" strokeWidth="2.5" opacity="0.95" />
      <circle cx="60" cy="60" r="35" fill="none" stroke="#e05a5f" strokeOpacity="0.35" strokeWidth="1" strokeDasharray="2 3" />
      <path
        d="M60 37 l-2-3 -1.5 2.4 C53 34 47 33.5 42 35.5 c3 1 3.6 2.4 3 4 c2.4-1 4.4-.5 5.5 2 c1.6-1.6 4-1.4 6 0 L60 44 l3.5-2.5 c2-1.4 4.4-1.6 6 0 c1.1-2.5 3.1-3 5.5-2 c-.6-1.6 0-3 3-4 C73 33.5 67 34 63.5 36.4 L62 34 Z"
        fill="#3b050c"
        opacity="0.75"
      />
      <text
        x="60"
        y="78"
        textAnchor="middle"
        fontFamily="var(--font-display), serif"
        fontStyle="italic"
        fontWeight="700"
        fontSize="38"
        fill="#3b050c"
        opacity="0.85"
      >
        {letter}
      </text>
      <text
        x="59"
        y="76.5"
        textAnchor="middle"
        fontFamily="var(--font-display), serif"
        fontStyle="italic"
        fontWeight="700"
        fontSize="38"
        fill="#e4565d"
        opacity="0.5"
      >
        {letter}
      </text>
      <ellipse cx="42" cy="34" rx="14" ry="6" fill="#fff" opacity="0.13" transform="rotate(-28 42 34)" />
    </svg>
  );
}

export function Raven({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 130 84" aria-hidden="true" focusable="false">
      <path d="M32 47 L5 58 L10 50 L2 45 L32 41 Z" fill="#0b0709" />
      <path d="M28 45 C34 30 60 25 77 31 C86 34 88 42 83 48 C75 59 45 61 28 45 Z" fill="#100a0d" />
      <circle cx="86" cy="29" r="11.5" fill="#100a0d" />
      <path d="M95 26 L116 30.5 L96 35 Z" fill="#1d1418" />
      <circle cx="89.5" cy="27" r="1.9" fill="#E87524" />
      <g className="raven-letter">
        <rect x="104" y="30" width="20" height="13" rx="1.5" fill="#efe2c4" transform="rotate(12 114 36)" />
        <path d="M104.5 31 L114 38 L123.5 33.5" fill="none" stroke="#b9a37a" strokeWidth="1" transform="rotate(12 114 36)" />
        <circle cx="114.5" cy="37.5" r="3" fill="#8B101B" />
      </g>
      <g className="raven-wing">
        <path d="M44 36 C50 14 72 3 96 1 C83 11 76 20 72 34 Z" fill="#1a1115" />
        <path d="M50 35 C56 20 70 12 84 9" stroke="#2c2024" strokeWidth="1.2" fill="none" />
      </g>
      <path d="M58 56 L56 68 M66 56 L66 68 M53 68 h7 M63 68 h7" stroke="#1d1418" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Candle({ height = 90, delay = 0, className }: { height?: number; delay?: number; className?: string }) {
  return (
    <span
      className={`candle ${className ?? ""}`}
      style={{ "--h": `${height}px`, "--d": `${delay}s` } as CSSProperties}
      aria-hidden="true"
    >
      <span className="candle__halo" />
      <span className="candle__flame" />
      <span className="candle__wick" />
      <span className="candle__body">
        <span className="candle__drip" />
      </span>
    </span>
  );
}

export function PumpkinShape({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 100" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="pk-body" cx="45%" cy="38%" r="70%">
          <stop offset="0" stopColor="#f39a4a" />
          <stop offset="0.55" stopColor="#d2601a" />
          <stop offset="1" stopColor="#6e2507" />
        </radialGradient>
        <radialGradient id="pk-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#fff2b3" />
          <stop offset="0.5" stopColor="#ffc24a" />
          <stop offset="1" stopColor="#ff7a1a" />
        </radialGradient>
      </defs>
      <path d="M58 20 C57 12 60 6 67 3 L70 7 C65 9 63 14 64 20 Z" fill="#3d3a1c" />
      <ellipse cx="34" cy="58" rx="27" ry="34" fill="url(#pk-body)" />
      <ellipse cx="86" cy="58" rx="27" ry="34" fill="url(#pk-body)" />
      <ellipse cx="60" cy="58" rx="30" ry="37" fill="url(#pk-body)" />
      <path d="M48 24 C40 45 40 75 48 94 M72 24 C80 45 80 75 72 94" stroke="#7a2c08" strokeWidth="1.6" fill="none" opacity="0.6" />
      <g className="pumpkin__face" fill="url(#pk-glow)">
        <path className="pumpkin__eye" d="M33 46 L47 46 L40 33 Z" />
        <path className="pumpkin__eye" d="M73 46 L87 46 L80 33 Z" />
        <path d="M56 56 L64 56 L60 49 Z" />
        <path d="M30 66 C40 82 80 82 90 66 L83 68 L79 74 L73 69 L67 76 L60 70 L53 76 L47 69 L41 74 L37 68 Z" />
      </g>
    </svg>
  );
}

export function Cobweb({ className }: { className?: string }) {
  // Corner web anchored at (0,0); radial spokes plus sagging threads.
  const spokes = [8, 22, 38, 54, 70, 84];
  const rings = [30, 58, 90, 124, 160];
  const pt = (r: number, deg: number) => [Math.cos((deg * Math.PI) / 180) * r, Math.sin((deg * Math.PI) / 180) * r];
  return (
    <svg className={className} viewBox="0 0 200 200" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeLinecap="round">
        {spokes.map((deg) => {
          const [x, y] = pt(205, deg);
          return <path key={deg} className="web-thread" d={`M0 0 L${x.toFixed(1)} ${y.toFixed(1)}`} strokeWidth="0.8" />;
        })}
        {rings.map((r, ri) => {
          let d = "";
          spokes.forEach((deg, i) => {
            const [x, y] = pt(r, deg);
            if (i === 0) d += `M${x.toFixed(1)} ${y.toFixed(1)}`;
            else {
              const [px, py] = pt(r * 0.86, (deg + spokes[i - 1]) / 2);
              d += ` Q${px.toFixed(1)} ${py.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
            }
          });
          return (
            <path
              key={r}
              className="web-thread"
              d={d}
              strokeWidth="0.6"
              style={{ animationDelay: `${0.4 + ri * 0.18}s` } as CSSProperties}
            />
          );
        })}
      </g>
    </svg>
  );
}

export function Ghost({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 100" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="ghost-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6efe2" stopOpacity="0.95" />
          <stop offset="0.75" stopColor="#f6efe2" stopOpacity="0.55" />
          <stop offset="1" stopColor="#f6efe2" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M40 4 C18 4 8 22 8 42 L8 92 C13 86 17 86 21 92 C25 98 29 98 33 92 C36 87 44 87 47 92 C51 98 55 98 59 92 C63 86 67 86 72 92 L72 42 C72 22 62 4 40 4 Z"
        fill="url(#ghost-fade)"
      />
      <ellipse cx="30" cy="40" rx="4.5" ry="6.5" fill="#080609" opacity="0.8" />
      <ellipse cx="50" cy="40" rx="4.5" ry="6.5" fill="#080609" opacity="0.8" />
      <ellipse cx="40" cy="56" rx="5" ry="6.5" fill="#080609" opacity="0.55" />
    </svg>
  );
}
