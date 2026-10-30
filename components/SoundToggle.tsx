"use client";

import { sound } from "@/lib/client/sound";
import { useSoundEnabled } from "@/lib/client/hooks";

export default function SoundToggle() {
  const on = useSoundEnabled();
  return (
    <button
      type="button"
      className={`sound-toggle ${on ? "is-on" : ""}`}
      onClick={() => void sound.toggle()}
      aria-pressed={on}
      aria-label={on ? "Mute sound" : "Turn sound on"}
    >
      <span className="sound-toggle__bars" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
      <span className="sound-toggle__label">{on ? "Sound on" : "Sound off"}</span>
    </button>
  );
}
