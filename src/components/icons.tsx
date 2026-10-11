import type { ReactElement } from "react";

/**
 * مجموعه آیکون‌های SVG سبک و بدون وابستگی
 * ---------------------------------------------------------------
 * همه آیکون‌ها خطی (stroke) و هم‌اندازه هستند تا در کنار هم یکدست دیده شوند.
 */

const base = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
};

const paths: Record<string, ReactElement> = {
  /* --- عمومی --- */
  home: <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6 18 18M18 6 6 18" />,
  check: <path d="M5 12.8 9.4 17 19 7" />,
  checkCircle: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.4 11 15l4.7-5.2" />
    </>
  ),
  arrowLeft: <path d="M19 12H5M11 6l-6 6 6 6" />,
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  chevronDown: <path d="M6 9.5 12 15.5 18 9.5" />,
  chevronUp: <path d="M6 14.5 12 8.5 18 14.5" />,
  chevronLeft: <path d="M14.5 6 8.5 12l6 6" />,
  chevronRight: <path d="M9.5 6l6 6-6 6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  external: <path d="M14 4h6v6M20 4l-8.5 8.5M18 14v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h5" />,
  filter: <path d="M4 6h16M7 12h10M10 18h4" />,
  sort: <path d="M7 4v16M7 20l-3-3M17 20V4M17 4l3 3" />,
  refresh: (
    <>
      <path d="M20 11A8 8 0 0 0 6.3 6.3L4 8.5" />
      <path d="M4 5v4h4" />
      <path d="M4 13a8 8 0 0 0 13.7 4.7L20 15.5" />
      <path d="M20 19v-4h-4" />
    </>
  ),
  more: (
    <>
      <circle cx="5.5" cy="12" r="1.4" />
      <circle cx="12" cy="12" r="1.4" />
      <circle cx="18.5" cy="12" r="1.4" />
    </>
  ),
  dot: <circle cx="12" cy="12" r="4" />,

  /* --- سلامت و خدمات --- */
  card: (
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="3" />
      <path d="M6.5 10h4M6.5 14h6" />
      <circle cx="17" cy="10" r="1.6" />
    </>
  ),
  book: (
    <>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
      <path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5" />
      <path d="M9 8h7" />
    </>
  ),
  book2: (
    <>
      <path d="M4 4h9a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4z" />
      <path d="M8.5 8.5h5M8.5 12.5h5" />
    </>
  ),
  badge: (
    <>
      <path d="M12 3l7 3v5c0 4.6-3 8.2-7 9.6C8 19.2 5 15.6 5 11V6z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  clipboard: (
    <>
      <rect x="6" y="4" width="12" height="17" rx="2.5" />
      <path d="M9.5 4V2.8h5V4" />
      <path d="M9.5 10h5M9.5 14h5M9.5 18h3" />
    </>
  ),
  shield: <path d="M12 3l7 3v5c0 4.6-3 8.2-7 9.6C8 19.2 5 15.6 5 11V6z" />,
  shieldCheck: (
    <>
      <path d="M12 3l7 3v5c0 4.6-3 8.2-7 9.6C8 19.2 5 15.6 5 11V6z" />
      <path d="M9 12l2 2 4-4.5" />
    </>
  ),
  heartbeat: (
    <>
      <path d="M3 12h3.5l2-5 3 10 2.5-7 1.8 4H21" />
      <path d="M12 4.2a5.2 5.2 0 0 1 8.2 4.3c0 .9-.2 1.7-.5 2.5" />
    </>
  ),
  stethoscope: (
    <>
      <path d="M6 3v5a4 4 0 0 0 8 0V3" />
      <path d="M10 12v3a5 5 0 0 0 10 0v-2" />
      <circle cx="20" cy="10" r="2" />
      <path d="M4.5 3h3M14.5 3h3" />
    </>
  ),
  pill: (
    <>
      <rect x="2.5" y="8.5" width="19" height="7" rx="3.5" transform="rotate(-45 12 12)" />
      <path d="M9 9l6 6" />
    </>
  ),
  beaker: (
    <>
      <path d="M9 3h6M10 3v5.5L5.5 17A2.5 2.5 0 0 0 7.8 21h8.4a2.5 2.5 0 0 0 2.3-4L14 8.5V3" />
      <path d="M7.5 14h9" />
    </>
  ),

  /* --- داده و نمودار --- */
  chart: (
    <>
      <path d="M4 20V4" />
      <path d="M4 20h16" />
      <path d="M8 17V11M12.5 17V7M17 17v-4" />
    </>
  ),
  chartPie: (
    <>
      <path d="M12 3a9 9 0 1 0 9 9h-9z" />
      <path d="M12 3v9h9A9 9 0 0 0 12 3z" opacity=".4" />
    </>
  ),
  trendUp: <path d="M3 17l5.5-6 4 3.5L21 6M21 6h-5M21 6v5" />,
  inbox: (
    <>
      <path d="M4 13 6.5 5h11L20 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
      <path d="M4 13h4l1 2.5h6L16 13h4" />
    </>
  ),
  layers: (
    <>
      <path d="M12 3 3 8l9 5 9-5z" />
      <path d="M3 13l9 5 9-5" />
    </>
  ),
  database: (
    <>
      <ellipse cx="12" cy="6" rx="8" ry="3" />
      <path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6" />
      <path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
    </>
  ),
  activity: <path d="M3 12h4l2.5-6 4 12L16 12h5" />,

  /* --- کاربر و دسترسی --- */
  user: (
    <>
      <circle cx="12" cy="8.5" r="4" />
      <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
    </>
  ),
  users: (
    <>
      <circle cx="9.5" cy="8.5" r="3.6" />
      <path d="M3 20a6.5 6.5 0 0 1 13 0" />
      <path d="M16 5.2a3.6 3.6 0 0 1 0 6.9M17.5 20a6.6 6.6 0 0 0-1.6-4.3" />
    </>
  ),
  lock: (
    <>
      <rect x="4.5" y="10.5" width="15" height="10.5" rx="2.5" />
      <path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7" />
      <path d="M12 15v2.5" />
    </>
  ),
  key: (
    <>
      <circle cx="8" cy="14" r="3.6" />
      <path d="M10.6 11.4 20 2M17 5l2 2M14.5 7.5l2 2" />
    </>
  ),
  logout: (
    <>
      <path d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4" />
      <path d="M15 8l4 4-4 4M9 12h10" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  eyeOff: (
    <>
      <path d="M4 4l16 16" />
      <path d="M9.5 5.9A9.5 9.5 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-2.6 3.5" />
      <path d="M6.4 8.2A17 17 0 0 0 2.5 12S6 18.5 12 18.5c1 0 1.9-.2 2.7-.5" />
      <path d="M9.9 10a3 3 0 0 0 4.2 4.2" />
    </>
  ),

  /* --- ارتباط --- */
  phone: (
    <path d="M5 3.5h3.5l1.8 4.6-2.3 1.5a11.5 11.5 0 0 0 5.4 5.4l1.5-2.3 4.6 1.8V19a2.5 2.5 0 0 1-2.7 2.5A17.5 17.5 0 0 1 2.5 6.2 2.5 2.5 0 0 1 5 3.5z" />
  ),
  mail: (
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
    </>
  ),
  chat: (
    <>
      <path d="M4 5.5h16v10H9.5L4 19.5z" />
      <path d="M8 9.5h8M8 12.5h5" />
    </>
  ),
  bell: (
    <>
      <path d="M6.5 10a5.5 5.5 0 0 1 11 0v4.5l1.5 3h-14l1.5-3z" />
      <path d="M10 20.5a2.2 2.2 0 0 0 4 0" />
    </>
  ),
  send: <path d="M21 3 10.5 13.5M21 3l-7 18-4-8.5L1.5 8.5z" />,
  pin: (
    <>
      <path d="M12 21.5S4.5 15 4.5 9.8a7.5 7.5 0 0 1 15 0c0 5.2-7.5 11.7-7.5 11.7z" />
      <circle cx="12" cy="9.8" r="2.6" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 3.8 5.6 3.8 9S14.5 19.5 12 21c-2.5-1.5-3.8-5.6-3.8-9S9.5 5.5 12 3z" />
    </>
  ),
  wifi: <path d="M3.5 9a13 13 0 0 1 17 0M6.5 12.5a9 9 0 0 1 11 0M9.5 16a4.8 4.8 0 0 1 5 0M12 19.5h.01" />,

  /* --- فایل و داده --- */
  upload: <path d="M12 16.5V4M7.5 8.5 12 4l4.5 4.5M4 16v3.5a1.5 1.5 0 0 0 1.5 1.5h13a1.5 1.5 0 0 0 1.5-1.5V16" />,
  download: <path d="M12 4v12.5M7.5 12 12 16.5 16.5 12M4 16v3.5A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5V16" />,
  file: (
    <>
      <path d="M6 3h7l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M13 3v5h5" />
    </>
  ),
  fileCheck: (
    <>
      <path d="M6 3h7l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M13 3v5h5" />
      <path d="M9 14.5l2 2 3.5-4" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
      <circle cx="8.5" cy="9.5" r="1.6" />
      <path d="m4 17 5-4.5 4 3.5 3-2.5 4 3.5" />
    </>
  ),
  trash: (
    <>
      <path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13" />
      <path d="M10.5 11v5.5M13.5 11v5.5" />
    </>
  ),
  edit: (
    <>
      <path d="M4 20h4l10-10-4-4L4 16z" />
      <path d="M14.5 5.5 18.5 9.5" />
    </>
  ),
  copy: (
    <>
      <rect x="8.5" y="8.5" width="11.5" height="12" rx="2.5" />
      <path d="M15.5 8.5V5.8A2.3 2.3 0 0 0 13.2 3.5H6A2.3 2.3 0 0 0 3.7 5.8v8.4a2.3 2.3 0 0 0 2.3 2.3H8" />
    </>
  ),
  save: (
    <>
      <path d="M5 3.5h11L20.5 8v12a1 1 0 0 1-1 1h-14a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1z" />
      <path d="M8 3.5v6h7v-6M8 20v-6h8v6" />
    </>
  ),
  link: (
    <>
      <path d="M10 13.5a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.2 1.2" />
      <path d="M14 10.5a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.2-1.2" />
    </>
  ),

  /* --- زمان و وضعیت --- */
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5.2l3.2 2" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  alert: (
    <>
      <path d="M12 3.5 21.5 20.5H2.5z" />
      <path d="M12 10v4.5M12 17.6v.4" />
    </>
  ),
  alertCircle: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5M12 16v.4" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5M12 8v.4" />
    </>
  ),
  sparkles: (
    <>
      <path d="M12 3.5l1.7 4.3 4.3 1.7-4.3 1.7L12 15.5l-1.7-4.3L6 9.5l4.3-1.7z" />
      <path d="M18.5 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" />
    </>
  ),
  star: <path d="M12 3.8l2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 10l5.9-.8z" />,
  moon: <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M20 20l-4.4-4.4" />
    </>
  ),
  filter2: (
    <>
      <path d="M4 6h16l-6 7v6l-4-2v-4z" />
    </>
  ),
  wizard: (
    <>
      <path d="M5 4v6a4 4 0 0 0 8 0V4" />
      <path d="M9 14v6" />
      <path d="M15 12l6-6M17 4h4v4" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  rocket: (
    <>
      <path d="M13 4c4 0 7 3 7 7 0 3-2 5-4.5 6.5L12 21l-1-4-1.5-1.5L5 15l3.5-3.5C10 9 11 4 13 4z" />
      <circle cx="15" cy="9" r="1.6" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.8l1.4 2.4 2.7-.5.6 2.7 2.5 1.2-1.2 2.5 1.7 2.2-2.2 1.7.5 2.7-2.7.6-1.2 2.5-2.5-1.2-2.2 1.7-1.7-2.2-2.7.5-.6-2.7L2.9 14l1.2-2.5L2.4 9.3l2.2-1.7-.5-2.7 2.7-.6z" />
    </>
  ),
  instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="3.8" />
      <path d="M16.8 7.3v.01" />
    </>
  ),
  telegram: <path d="M21 4 2.8 11.2l5 1.6 1.9 5.9 2.6-3.4 4.6 3.4z" />,
  whatsapp: (
    <>
      <path d="M20.5 12a8.5 8.5 0 0 1-12.6 7.4L3.5 20.5l1.2-4.2A8.5 8.5 0 1 1 20.5 12z" />
      <path d="M9 9.5c0 3 2.5 5.5 5.5 5.5.6 0 1-.5 1-1l-1.4-.8-1 .9c-1-.5-1.7-1.2-2.2-2.2l.9-1L11 9.5c0-.5-.4-1-1-1-.6 0-1 .4-1 1z" />
    </>
  ),
  quote: (
    <>
      <path d="M9 6.5c-3 1.2-4.5 3.4-4.5 6.6V18h5v-5H6.2c0-2 .8-3.4 2.3-4.2z" />
      <path d="M19 6.5c-3 1.2-4.5 3.4-4.5 6.6V18h5v-5h-3.3c0-2 .8-3.4 2.3-4.2z" />
    </>
  ),
  qr: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <path d="M13.5 13.5h3v3h-3zM20.5 13.5v3M17 20.5h3.5V20" />
    </>
  ),
  print: (
    <>
      <path d="M7 8V3.5h10V8" />
      <rect x="3.5" y="8" width="17" height="8" rx="2" />
      <path d="M7 13h10v7.5H7z" />
    </>
  ),
  truck: (
    <>
      <path d="M2.5 6.5h10v9h-10z" />
      <path d="M12.5 10h4l3 3v2.5h-7" />
      <circle cx="6" cy="18" r="1.8" />
      <circle cx="16.5" cy="18" r="1.8" />
    </>
  ),
  factory: (
    <>
      <path d="M3 20.5V10l5 3V10l5 3V10l5 3v7.5z" />
      <path d="M6.5 4h3v3h-3z" />
      <path d="M7 17h2M13 17h2" />
    </>
  ),
  scale: (
    <>
      <path d="M12 3.5v17M6 6.5h12M4 12l2-5.5 2 5.5a2.4 2.4 0 0 1-4 0zM16 12l2-5.5 2 5.5a2.4 2.4 0 0 1-4 0z" />
    </>
  ),
  crown: <path d="M4 17.5 3 7l5 3.5L12 5l4 5.5L21 7l-1 10.5z" />,
  building: (
    <>
      <rect x="4" y="3.5" width="16" height="17" rx="2" />
      <path d="M8 8h3M13 8h3M8 12h3M13 12h3M10 20.5v-4h4v4" />
    </>
  ),
  archive: (
    <>
      <rect x="3.5" y="4" width="17" height="4.5" rx="1.5" />
      <path d="M5 8.5v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-10M10 13h4" />
    </>
  ),
  /* --- تکمیلی --- */
  track: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M11 8.5v2.8l1.8 1.2" />
      <path d="M16 16l4 4" />
    </>
  ),
  services: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="2" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="2" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="2" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="2" />
    </>
  ),
  zap: <path d="M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H12z" />,
  heart: <path d="M12 20s-7-4.4-7-9.3A4.2 4.2 0 0 1 12 7.6a4.2 4.2 0 0 1 7 3.1C19 15.6 12 20 12 20z" />,
  list: <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />,
  folder: <path d="M3.5 7.5a2 2 0 0 1 2-2h3.2l2 2.5h5.8a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2z" />,
};

export type IconName = keyof typeof paths;

export function Icon({
  name,
  className = "",
  size = 24,
  strokeWidth,
}: {
  name: string;
  className?: string;
  size?: number;
  strokeWidth?: number;
}) {
  const shape = paths[name] ?? paths.shield;
  return (
    <svg {...base} width={size} height={size} className={className} strokeWidth={strokeWidth ?? base.strokeWidth}>
      {shape}
    </svg>
  );
}

export const ICON_NAMES = Object.keys(paths);
