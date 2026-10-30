import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Cinzel, Manrope } from "next/font/google";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});
const engraved = Cinzel({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-engraved", display: "swap" });
const sans = Manrope({ subsets: ["latin"], weight: ["300", "400", "500", "600"], variable: "--font-sans", display: "swap" });

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined);

const description =
  "One night. One house. No ordinary guests. You're invited to Marta's Halloween Pre-Drinks — 31 October 2026, from 20:00, Tbilisi.";

export const metadata: Metadata = {
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  title: "Marta's Halloween Night 🎃",
  description,
  applicationName: "Marta's Halloween Night",
  openGraph: {
    title: "Marta's Halloween Night 🎃",
    description,
    type: "website",
    locale: "en_GB",
  },
  twitter: { card: "summary_large_image", title: "Marta's Halloween Night 🎃", description },
  robots: { index: false, follow: false }, // a private invitation
};

export const viewport: Viewport = {
  themeColor: "#080609",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${engraved.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
