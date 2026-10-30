"use client";

import { useRef, useState } from "react";
import { PumpkinShape } from "./art";
import { sound } from "@/lib/client/sound";

const WHISPERS = [
  "Boo.",
  "Bring snacks.",
  "I saw you.",
  "Costume? Mandatory.",
  "Mwahaha…",
  "Not the face!",
  "Trick… or treat?",
  "The spirits approve.",
];

export default function Pumpkin({ className = "", size = 110 }: { className?: string; size?: number }) {
  const [awake, setAwake] = useState(false);
  const [whisper, setWhisper] = useState<string | null>(null);
  const idx = useRef(Math.floor(Math.random() * WHISPERS.length));

  const poke = () => {
    idx.current = (idx.current + 1) % WHISPERS.length;
    setWhisper(WHISPERS[idx.current]);
    setAwake(true);
    sound.play("boo", 0.8);
    window.setTimeout(() => setAwake(false), 1400);
    window.setTimeout(() => setWhisper(null), 1900);
  };

  return (
    <button
      type="button"
      className={`pumpkin ${awake ? "is-awake" : ""} ${className}`}
      style={{ width: size }}
      onClick={poke}
      aria-label="A jack-o'-lantern. Poke it, if you dare."
    >
      <PumpkinShape className="pumpkin__svg" />
      <span className="pumpkin__glow" aria-hidden="true" />
      <span className={`pumpkin__whisper ${whisper ? "is-shown" : ""}`} role="status">
        {whisper}
      </span>
    </button>
  );
}
