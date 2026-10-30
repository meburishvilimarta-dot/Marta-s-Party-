// Hand-built haunted mansion silhouette with flickering windows.

const FENCE = Array.from({ length: 64 }, (_, i) => i * 23);

function Window({ x, y, w = 14, h = 22, lit = false, delay = 0 }: { x: number; y: number; w?: number; h?: number; lit?: boolean; delay?: number }) {
  const r = w / 2;
  const d = `M${x} ${y + h} L${x} ${y + r} A${r} ${r} 0 0 1 ${x + w} ${y + r} L${x + w} ${y + h} Z`;
  return <path d={d} className={lit ? "mansion__window is-lit" : "mansion__window"} style={lit ? { animationDelay: `${delay}s` } : undefined} />;
}

export default function Mansion({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 1440 520" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
      <defs>
        <filter id="window-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="hill-far" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a0d14" />
          <stop offset="1" stopColor="#0c070a" />
        </linearGradient>
      </defs>

      {/* distant hills */}
      <path d="M0 400 Q 200 340 420 372 T 860 360 T 1440 350 L1440 520 L0 520 Z" fill="url(#hill-far)" opacity="0.9" />

      <g fill="#060406">
        {/* left dead tree */}
        <g stroke="#060406" strokeLinecap="round" fill="none">
          <path d="M210 440 C214 380 206 330 222 270" strokeWidth="12" />
          <path d="M218 330 C190 300 170 300 140 270 M222 300 C250 270 262 240 300 228 M214 360 C180 350 160 360 128 340 M222 270 C226 240 214 220 222 196 M300 228 C310 214 326 212 338 200 M140 270 C132 258 120 252 108 254" strokeWidth="5" />
          <path d="M160 288 C150 270 152 256 144 244 M262 244 C270 226 266 212 274 200 M180 352 C170 370 160 376 150 380" strokeWidth="3" />
        </g>

        {/* left tower */}
        <rect x="500" y="190" width="72" height="250" />
        <path d="M488 194 L536 52 L584 194 Z" />
        <path d="M536 52 L536 22" stroke="#060406" strokeWidth="3" />
        <path d="M528 32 L544 32" stroke="#060406" strokeWidth="3" />
        {/* main house */}
        <rect x="566" y="258" width="320" height="182" />
        <path d="M546 262 L726 166 L906 262 Z" />
        <rect x="612" y="186" width="20" height="60" />
        <rect x="808" y="196" width="20" height="52" />
        {/* central gable & porch */}
        <path d="M676 262 L726 216 L776 262 Z" fill="#0a0609" />
        <path d="M684 440 L684 360 L726 326 L768 360 L768 440 Z" fill="#0a0609" />
        {/* right wing */}
        <rect x="880" y="296" width="176" height="144" />
        <path d="M868 300 L968 234 L1068 300 Z" />
        <rect x="1016" y="244" width="44" height="64" />
        <path d="M1008 248 L1038 176 L1068 248 Z" />
        <path d="M1038 176 L1038 154" stroke="#060406" strokeWidth="3" />

        {/* right dead tree */}
        <g stroke="#060406" strokeLinecap="round" fill="none">
          <path d="M1250 446 C1246 390 1258 340 1240 280" strokeWidth="14" />
          <path d="M1246 340 C1280 316 1300 300 1336 296 M1240 300 C1214 270 1206 248 1170 236 M1250 380 C1290 370 1310 380 1340 360 M1240 280 C1236 250 1250 230 1242 206" strokeWidth="5" />
          <path d="M1336 296 C1350 284 1362 284 1376 272 M1170 236 C1158 222 1146 222 1134 210 M1300 306 C1306 290 1302 278 1310 266" strokeWidth="3" />
        </g>
      </g>

      {/* windows */}
      <g filter="url(#window-glow)">
        <Window x={525} y={230} lit delay={0.3} />
        <Window x={525} y={300} />
        <Window x={525} y={364} lit delay={2.1} />
        <Window x={600} y={290} w={18} h={30} lit delay={1.2} />
        <Window x={640} y={290} w={18} h={30} />
        <Window x={600} y={360} w={18} h={30} />
        <Window x={640} y={360} w={18} h={30} lit delay={3.4} />
        <Window x={717} y={228} w={18} h={24} lit delay={0.8} />
        <Window x={794} y={290} w={18} h={30} lit delay={2.7} />
        <Window x={834} y={290} w={18} h={30} />
        <Window x={794} y={360} w={18} h={30} />
        <Window x={834} y={360} w={18} h={30} lit delay={1.6} />
        <Window x={712} y={378} w={28} h={62} lit delay={0.1} />
        <Window x={914} y={330} w={18} h={30} lit delay={4.1} />
        <Window x={960} y={330} w={18} h={30} />
        <Window x={1006} y={330} w={18} h={30} lit delay={2.2} />
        <Window x={1031} y={262} w={14} h={22} lit delay={1.9} />
      </g>

      {/* ground + iron fence */}
      <path d="M0 448 Q 360 424 720 436 T 1440 440 L1440 520 L0 520 Z" fill="#050305" />
      <g fill="#050305">
        <rect x="0" y="452" width="1440" height="4" />
        <rect x="0" y="480" width="1440" height="3" />
        {FENCE.map((x) => (
          <path key={x} d={`M${x + 2} 500 L${x + 2} 440 L${x + 5} 432 L${x + 8} 440 L${x + 8} 500 Z`} />
        ))}
      </g>
    </svg>
  );
}
