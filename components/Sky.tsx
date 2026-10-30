"use client";

import { useState } from "react";
import Atmosphere from "./Atmosphere";
import Mansion from "./Mansion";
import { sound } from "@/lib/client/sound";
import { summonBats } from "./Bats";

/** Fixed cinematic backdrop: night sky, moon, mansion, fog and embers. */
export default function Sky() {
  const [blood, setBlood] = useState(false);

  const onMoon = () => {
    if (blood) return;
    setBlood(true);
    sound.play("thunder");
    summonBats(7);
    window.setTimeout(() => setBlood(false), 4200);
  };

  return (
    <div className={`sky ${blood ? "is-blood" : ""}`}>
      <div className="sky__gradient" />
      <Atmosphere />
      <button
        type="button"
        className="moon"
        onClick={onMoon}
        aria-label="The full moon. Don't stare too long…"
        title="Don't stare too long…"
      >
        <span className="moon__surface" />
        <span className="moon__cloud moon__cloud--a" />
        <span className="moon__cloud moon__cloud--b" />
      </button>
      <div className="sky__lightning" />
      <Mansion className="mansion" />
      <div className="fog" aria-hidden="true">
        <div className="fog__layer fog__layer--1" />
        <div className="fog__layer fog__layer--2" />
        <div className="fog__layer fog__layer--3" />
      </div>
      <div className="sky__vignette" />
    </div>
  );
}
