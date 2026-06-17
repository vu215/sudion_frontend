"use client";

import type { MouseEvent } from "react";

export type IconName = "add" | "archive" | "calendar" | "camera" | "check" | "chevronLeft" | "chevronRight" | "close" | "copy" | "credit" | "database" | "delete" | "download" | "edit" | "eye" | "filter" | "link" | "lock" | "log" | "mail" | "more" | "policy" | "refresh" | "search" | "settings" | "shield" | "user";

const paths: Record<IconName, string[]> = {
  add: ["M12 5v14M5 12h14"],
  archive: ["M4 7h16M6 7v12h12V7M9 11h6"],
  calendar: ["M7 3v3M17 3v3M4 8h16M6 5h12a2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2z"],
  camera: ["M4 8h3l1.5-2h7L17 8h3v10H4z", "M12 16a3.5 3.5 0 100-7 3.5 3.5 0 000 7z"],
  check: ["M5 13l4 4L19 7"],
  chevronLeft: ["M15 18l-6-6 6-6"],
  chevronRight: ["M9 18l6-6-6-6"],
  close: ["M6 6l12 12M18 6L6 18"],
  copy: ["M9 9h10v10H9z", "M5 15H4a1 1 0 01-1-1V4a1 1 0 011-1h10a1 1 0 011 1v1"],
  credit: ["M4 6h16v12H4z", "M4 10h16", "M7 15h3"],
  database: ["M5 6c0-1.7 3.1-3 7-3s7 1.3 7 3-3.1 3-7 3-7-1.3-7-3z", "M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6", "M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"],
  delete: ["M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"],
  download: ["M12 4v10M8 10l4 4 4-4M5 20h14"],
  edit: ["M4 20h4L18.5 9.5a2.1 2.1 0 00-3-3L5 17v3z"],
  eye: ["M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z", "M12 15a3 3 0 100-6 3 3 0 000 6z"],
  filter: ["M4 6h16M7 12h10M10 18h4"],
  link: ["M10 13a5 5 0 007.1 0l2-2a5 5 0 00-7.1-7.1l-1.1 1.1", "M14 11a5 5 0 00-7.1 0l-2 2a5 5 0 007.1 7.1l1.1-1.1"],
  lock: ["M7 11V8a5 5 0 0110 0v3M6 11h12v9H6z"],
  log: ["M6 4h12v16H6z", "M9 8h6M9 12h6M9 16h3"],
  mail: ["M4 6h16v12H4z", "M4 7l8 6 8-6"],
  more: ["M5 12h.01M12 12h.01M19 12h.01"],
  policy: ["M6 4h9l3 3v13H6z", "M14 4v4h4", "M9 13h6M9 17h4"],
  refresh: ["M20 6v5h-5M4 18v-5h5M18 9a7 7 0 00-11.7-2.7M6 15a7 7 0 0011.7 2.7"],
  search: ["M11 19a8 8 0 100-16 8 8 0 000 16z", "M21 21l-4.35-4.35"],
  settings: ["M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z", "M19.4 15a1.7 1.7 0 00.3 1.9l.1.1-2 3.4-.2-.1a1.8 1.8 0 00-1.9.1l-.4.2a1.8 1.8 0 00-.9 1.6V22h-4v-.3a1.8 1.8 0 00-.9-1.6l-.4-.2a1.8 1.8 0 00-1.9-.1l-.2.1-2-3.4.1-.1a1.7 1.7 0 00.3-1.9l-.2-.5a1.8 1.8 0 00-1.5-1H3V9h.3a1.8 1.8 0 001.5-1l.2-.5a1.7 1.7 0 00-.3-1.9l-.1-.1 2-3.4.2.1a1.8 1.8 0 001.9-.1l.4-.2A1.8 1.8 0 0010 0.3V0h4v.3a1.8 1.8 0 00.9 1.6l.4.2a1.8 1.8 0 001.9.1l.2-.1 2 3.4-.1.1a1.7 1.7 0 00-.3 1.9l.2.5a1.8 1.8 0 001.5 1h.3v4h-.3a1.8 1.8 0 00-1.5 1z"],
  shield: ["M12 3l7 3v5c0 4.5-2.8 8.3-7 10-4.2-1.7-7-5.5-7-10V6z"],
  user: ["M16 19v-1.2a4.8 4.8 0 00-4.8-4.8H8.8A4.8 4.8 0 004 17.8V19", "M12 7.5a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0z"],
};

export function AdminIcon({ name, className = "h-4 w-4" }: { name: IconName; className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>{paths[name].map((path) => <path key={path} d={path} />)}</svg>;
}

export function IconButton({ label, icon, onClick, tone = "orange", size = "sm" }: { label: string; icon: IconName; onClick?: (event: MouseEvent<HTMLButtonElement>) => void; tone?: "orange" | "danger" | "neutral"; size?: "sm" | "md" }) {
  const cls = tone === "danger" ? "border-red-200 text-red-600 hover:bg-red-50" : tone === "neutral" ? "border-[#dfe3ec] text-[#536078] hover:bg-[#f7f8fb]" : "border-[#ffd2ad] text-[#ff8d28] hover:bg-[#fff8f1]";
  const dimension = size === "md" ? "!h-10 !w-10" : "h-8 w-8";
  return <button type="button" aria-label={label} title={label} onClick={onClick} className={`grid ${dimension} place-items-center rounded-full border bg-white transition ${cls}`}><AdminIcon name={icon} /></button>;
}
