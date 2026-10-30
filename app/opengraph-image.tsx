import { ImageResponse } from "next/og";

export const alt = "Marta's Halloween Pre-Drinks — 31 October 2026, Tbilisi";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(circle at 75% 20%, #3a1a10 0%, #1a0910 35%, #080609 75%)",
          color: "#f1e8d7",
          fontFamily: "serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 60,
            right: 120,
            width: 180,
            height: 180,
            borderRadius: 999,
            background: "radial-gradient(circle at 35% 35%, #fffaf0, #f1dfb6 45%, #c9a96b)",
            boxShadow: "0 0 120px 30px rgba(244,230,196,0.35)",
          }}
        />
        <div style={{ fontSize: 26, letterSpacing: 12, color: "#C6A15B", textTransform: "uppercase" }}>You have been invited…</div>
        <div style={{ fontSize: 64, fontStyle: "italic", color: "#C6A15B", marginTop: 24 }}>Marta&apos;s</div>
        <div style={{ fontSize: 140, fontWeight: 700, lineHeight: 1, letterSpacing: -2 }}>HALLOWEEN</div>
        <div style={{ fontSize: 48, letterSpacing: 18, color: "#E87524", marginTop: 12 }}>PRE-DRINKS</div>
        <div style={{ fontSize: 28, marginTop: 40, color: "rgba(241,232,215,0.75)" }}>31 October 2026 · 20:00 · Tbilisi</div>
      </div>
    ),
    size,
  );
}
