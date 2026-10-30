"use client";

import { useState } from "react";
import { EVENT, MAPS_DIRECTIONS_URL, MAPS_EMBED_URL, MAPS_SEARCH_URL } from "@/lib/event";
import Reveal from "./Reveal";

export default function Location() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EVENT.addressFull);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      window.open(MAPS_SEARCH_URL, "_blank", "noopener");
    }
  };

  return (
    <section className="section location" id="location" aria-labelledby="location-title">
      <Reveal className="section__head">
        <p className="eyebrow">Find the House</p>
        <h2 id="location-title" className="section__title">
          Where the <em>candles</em> burn
        </h2>
      </Reveal>
      <div className="location__grid">
        <Reveal className="location__info">
          <address className="location__address">
            Giorgi Shatberashvili&nbsp;56
            <span>Tbilisi, Georgia</span>
          </address>
          <p className="location__hint">Arrive from 20:00. Come in costume, knock with confidence, and don&rsquo;t mind the cobwebs.</p>
          <div className="location__actions">
            <a className="btn btn--gold" href={MAPS_DIRECTIONS_URL} target="_blank" rel="noopener noreferrer">
              <span>Get directions</span>
            </a>
            <button type="button" className="btn btn--ghost" onClick={copy}>
              <span>{copied ? "Address copied ✓" : "Copy address"}</span>
            </button>
          </div>
          <a className="btn btn--seal location__contact" href={EVENT.whatsapp} target="_blank" rel="noopener noreferrer">
            <span>Questions? Contact Marta</span>
          </a>
          <p className="location__phone">WhatsApp · {EVENT.phoneDisplay}</p>
        </Reveal>
        <Reveal className="location__map" delay={0.15}>
          <div className="map-frame">
            <iframe
              title={`Map showing ${EVENT.addressFull}`}
              src={MAPS_EMBED_URL}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <a className="map-frame__open" href={MAPS_SEARCH_URL} target="_blank" rel="noopener noreferrer">
              Open in Google Maps ↗
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
