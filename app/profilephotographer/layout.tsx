"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/auth-context";
import type { ReactNode } from "react";

const NAV = [
  { href: "/profilephotographer",           label: "Tổng quan",    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { href: "/profilephotographer/portfolio", label: "Portfolio",    icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { href: "/profilephotographer/services",  label: "Dịch vụ",      icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
  { href: "/profilephotographer/bookings",  label: "Booking",      icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { href: "/profilephotographer/earnings",  label: "Thu nhập",     icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { href: "/profilephotographer/messages",  label: "Tin nhắn",     icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
  { href: "/profilephotographer/rental",    label: "Thuê thiết bị", icon: "M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M12 16a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" },
];

export default function ProfilePhotographerLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { session } = useAuth();

  const initials = (session?.fullName || "P").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="flex min-h-screen bg-[#f5f6fa]">

      {/* ── Sidebar ── */}
      <aside className="hidden lg:flex flex-col w-[220px] shrink-0 fixed top-0 left-0 h-full bg-[#0e111d] z-30">

        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#ff8d28] text-white text-xs font-black">S</div>
          <span className="text-white font-black text-[15px] tracking-tight">STUDION</span>
        </div>

        {/* Photographer info */}
        <div className="px-4 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#ff8d28] to-[#f97316] flex items-center justify-center text-white text-xs font-black shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-white text-[12px] font-bold truncate">{session?.fullName || "Photographer"}</p>
              <span className="inline-block rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5">Đang hoạt động</span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {NAV.map(item => {
            const active = pathname === item.href || (item.href !== "/profilephotographer" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all ${
                  active ? "bg-[#ff8d28] text-white shadow-[0_4px_12px_rgba(255,141,40,0.3)]" : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}>
                <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-white/5 space-y-1">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-slate-400 hover:bg-white/5 hover:text-white transition-all">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            Về trang chủ
          </Link>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 lg:ml-[220px] flex flex-col min-h-screen">

        {/* Top header */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-[#eaedf2] bg-white px-6 shadow-sm">
          {/* Mobile menu placeholder */}
          <div className="flex items-center gap-3">
            <div className="lg:hidden flex h-7 w-7 items-center justify-center rounded-lg bg-[#ff8d28] text-white text-xs font-black">S</div>
            {/* Breadcrumb */}
            <p className="hidden sm:block text-[13px] font-semibold text-[#6b7280]">
              {NAV.find(n => pathname === n.href || (n.href !== "/profilephotographer" && pathname.startsWith(n.href)))?.label || "Tổng quan"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification */}
            <button className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-[#eaedf2] bg-white text-[#6b7280] hover:border-[#ff8d28] hover:text-[#ff8d28] transition-all">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[#ff8d28]" />
            </button>

            {/* Avatar */}
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff8d28] to-[#f97316] text-white text-xs font-black cursor-pointer">
              {initials}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
