"use client";

import { useState } from "react";
import { Cobweb } from "./art";

/** A corner cobweb with a resident spider who drops down when poked. */
export default function CornerWeb({ side = "left", spider = false }: { side?: "left" | "right"; spider?: boolean }) {
  const [drop, setDrop] = useState(false);
  return (
    <div className={`corner-web corner-web--${side}`}>
      <Cobweb className="corner-web__svg" />
      {spider && (
        <button
          type="button"
          className={`spider ${drop ? "is-dropping" : ""}`}
          onClick={() => {
            if (drop) return;
            setDrop(true);
            window.setTimeout(() => setDrop(false), 2600);
          }}
          aria-label="A small spider. It seems friendly."
        >
          <span className="spider__thread" />
          <svg className="spider__body" viewBox="0 0 40 40" aria-hidden="true">
            <g stroke="#0b0709" strokeWidth="1.6" fill="none" strokeLinecap="round">
              <path d="M16 18 L6 10 L2 16 M16 21 L4 20 L1 27 M17 24 L7 30 L6 37 M24 18 L34 10 L38 16 M24 21 L36 20 L39 27 M23 24 L33 30 L34 37" />
            </g>
            <ellipse cx="20" cy="23" rx="6.5" ry="7.5" fill="#0b0709" />
            <circle cx="20" cy="14.5" r="4" fill="#0b0709" />
            <circle cx="18.6" cy="14" r="0.9" fill="#E87524" />
            <circle cx="21.4" cy="14" r="0.9" fill="#E87524" />
            <path d="M20 19 L18 24 L20 28 L22 24 Z" fill="#8B101B" opacity="0.8" />
          </svg>
        </button>
      )}
    </div>
  );
}
