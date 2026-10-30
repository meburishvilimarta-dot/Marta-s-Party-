export const EVENT = {
  name: "Marta's Halloween Pre-Drinks",
  tagline: "One night. One house. No ordinary guests.",
  host: "Marta",
  // Georgia is UTC+4 all year round (no daylight saving), so this instant is
  // exactly 20:00 on 31 October 2026 in Asia/Tbilisi.
  startsAt: "2026-10-31T20:00:00+04:00",
  timeZone: "Asia/Tbilisi",
  dateLabel: "Saturday, 31 October 2026",
  timeLabel: "From 20:00",
  addressShort: "Giorgi Shatberashvili 56, Tbilisi",
  addressFull: "Giorgi Shatberashvili 56, Tbilisi, Georgia",
  whatsapp: "https://wa.me/995555431012",
  phoneDisplay: "+995 555 431 012",
} as const;

const q = encodeURIComponent(EVENT.addressFull);
export const MAPS_DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${q}`;
export const MAPS_SEARCH_URL = `https://www.google.com/maps/search/?api=1&query=${q}`;
export const MAPS_EMBED_URL = `https://maps.google.com/maps?q=${q}&z=16&output=embed`;
