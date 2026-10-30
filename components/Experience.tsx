"use client";

import { useEffect, useState } from "react";
import Sky from "./Sky";
import Bats from "./Bats";
import Ghosts from "./Ghosts";
import Lantern from "./Lantern";
import Opening from "./Opening";
import SoundToggle from "./SoundToggle";
import Hero from "./Hero";
import Summons from "./Summons";
import Particulars from "./Particulars";
import Countdown from "./Countdown";
import Guestbook from "./Guestbook";
import Location from "./Location";
import Closing from "./Closing";

const SESSION_KEY = "martas-halloween:unsealed";
type Phase = "loading" | "sealed" | "open";

export default function Experience() {
  const [phase, setPhase] = useState<Phase>("loading");

  useEffect(() => {
    let seen = false;
    try {
      seen = window.sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {}
    // Deep links (e.g. /#guestbook) and revisits in the same tab skip the intro.
    setPhase(seen || (window.location.hash && window.location.hash !== "#top") ? "open" : "sealed");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("is-sealed", phase !== "open");
    if (phase === "open" && window.location.hash) {
      document.querySelector(window.location.hash)?.scrollIntoView();
    }
  }, [phase]);

  // Fade the moon as the visitor descends the page (rAF-throttled).
  useEffect(() => {
    if (phase !== "open") return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const v = Math.min(1, window.scrollY / (window.innerHeight * 0.8));
      document.documentElement.style.setProperty("--scrolled", v.toFixed(3));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [phase]);

  // A little surprise for visitors who wander off to another tab.
  useEffect(() => {
    const original = document.title;
    const onVis = () => {
      document.title = document.hidden ? "Come back… the night awaits 🦇" : original;
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const unsealed = () => {
    try {
      window.sessionStorage.setItem(SESSION_KEY, "1");
    } catch {}
    setPhase("open");
    window.scrollTo(0, 0);
    window.setTimeout(() => document.getElementById("main-title")?.focus({ preventScroll: true }), 60);
  };

  return (
    <>
      <Sky />
      <Bats />
      <Ghosts />
      <Lantern />

      <nav className={`topbar ${phase === "open" ? "is-visible" : ""}`} aria-label="Site">
        <a href="#top" className="topbar__mark" aria-label="Back to top">
          <span>M</span>
        </a>
        <div className="topbar__right">
          {phase === "open" && (
            <a href="#guestbook" className="topbar__rsvp">
              RSVP
            </a>
          )}
          <SoundToggle />
        </div>
      </nav>

      {phase === "sealed" && <Opening onDone={unsealed} />}
      {phase === "loading" && <div className="opening opening--placeholder" aria-hidden="true" />}

      <main className={`page ${phase === "open" ? "is-open" : ""}`} inert={phase !== "open"} aria-hidden={phase !== "open"}>
        <Hero />
        <Summons />
        <Particulars />
        <Countdown />
        <Guestbook />
        <Location />
        <Closing />
      </main>
    </>
  );
}
