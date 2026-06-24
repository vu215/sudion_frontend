"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/auth-context";
import type { ReactNode } from "react";

type NavItem = {
  key: string;
  href: string;
  label: string;
  icon: ReactNode;
  badge?: string | number;
};

/* ── Nav items ────────────────────────────────────────────── */
const NAV: NavItem[] = [
  {
    key: "dashboard",
    href: "/profilephotographer/dashboard",
    label: "Tổng quan",
    icon: (
      <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    key: "portfolio",
    href: "/profilephotographer/portfolio",
    label: "Portfolio",
    icon: (
      <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    key: "services",
    href: "/profilephotographer/services",
    label: "Dịch vụ của tôi",
    icon: (
      <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    key: "bookings",
    href: "/profilephotographer/bookings",
    label: "Bookings",
    icon: (
      <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    key: "messages",
    href: "/profilephotographer/messages",
    label: "Tin nhắn",
    icon: (
      <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    key: "reviews",
    href: "/profilephotographer/reviews",
    label: "Đánh giá",
    icon: (
      <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
  {
    key: "earnings",
    href: "/profilephotographer/earnings",
    label: "Doanh thu",
    icon: (
      <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    key: "settings",
    href: "/profilephotographer/settings",
    label: "Cài đặt",
    icon: (
      <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

function matchActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

/* ── Footer ───────────────────────────────────────────────── */
function DashboardFooter() {
  return (
    <footer className="border-t border-slate-100 bg-white mt-auto">
      <div className="mx-auto max-w-[1200px] px-6 py-10">
        <div className="grid gap-8 md:grid-cols-[1fr_auto_auto_auto]">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500">
                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="text-base font-black tracking-wider text-slate-800">STUDION</span>
            </div>
            <p className="text-sm text-slate-400 max-w-[220px] leading-6">
              Nền tảng kết nối khách hàng với nhiếp ảnh gia chuyên nghiệp.
            </p>
          </div>
          {/* Col 1 */}
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Về chúng tôi</p>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/about" className="hover:text-orange-500 transition">Giới thiệu</Link></li>
              <li><Link href="/about" className="hover:text-orange-500 transition">Điều khoản sử dụng</Link></li>
              <li><Link href="/about" className="hover:text-orange-500 transition">Chính sách bảo mật</Link></li>
            </ul>
          </div>
          {/* Col 2 */}
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Hỗ trợ</p>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/about" className="hover:text-orange-500 transition">Trung tâm hỗ trợ</Link></li>
              <li><Link href="/about" className="hover:text-orange-500 transition">Hướng dẫn sử dụng</Link></li>
              <li><Link href="/about" className="hover:text-orange-500 transition">Liên hệ</Link></li>
            </ul>
          </div>
          {/* Col 3 */}
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Kết nối với chúng tôi</p>
            <div className="flex gap-3">
              {[
                { label: "Facebook", icon: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" },
                { label: "Instagram", icon: "M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01M6.5 19.5h11a3 3 0 003-3v-11a3 3 0 00-3-3h-11a3 3 0 00-3 3v11a3 3 0 003 3z" },
                { label: "YouTube", icon: "M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" },
                { label: "TikTok", icon: "M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" },
              ].map((s) => (
                <button key={s.label} aria-label={s.label}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:border-orange-300 hover:text-orange-500 transition">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={s.icon} />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-100 pt-5 text-center text-xs text-slate-400">
          © 2026 STUDION. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

/* ── Layout ───────────────────────────────────────────────── */
export default function ProfilePhotographerLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { session } = useAuth();

  const initial = session?.fullName?.charAt(0)?.toUpperCase() ?? "P";

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f7fb]">
      <div className="flex flex-1 min-h-0">
        {/* ── Sidebar ── */}
        <aside className="hidden lg:flex w-[200px] shrink-0 flex-col fixed top-0 left-0 h-full bg-white border-r border-slate-100 z-30 py-5 px-3">
          {/* Logo */}
          <Link href="/" className="mb-5 flex items-center gap-2 px-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500">
              <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="text-[15px] font-black tracking-wider text-slate-800">STUDION</span>
          </Link>

          {/* Nav */}
          <nav className="flex-1 space-y-0.5 overflow-y-auto">
            {NAV.map((item) => {
              const active = matchActive(pathname, item.href);
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all ${
                    active
                      ? "bg-orange-50 text-orange-500 font-bold"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span className={active ? "text-orange-500" : "text-slate-400 group-hover:text-slate-600"}>
                      {item.icon}
                    </span>
                    {item.label}
                  </span>
                  {"badge" in item && item.badge ? (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>

          {/* Upgrade card */}
          <div className="mt-4 rounded-2xl bg-orange-50 border border-orange-100 p-3">
            <div className="mb-1 flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <span className="text-[11px] font-bold text-orange-500">Nâng cấp tài khoản</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-4">
              Mở khoá nhiều tính năng nâng cao dành cho bạn.
            </p>
            <button className="mt-2 w-full rounded-xl bg-orange-500 py-1.5 text-[11px] font-bold text-white hover:bg-orange-600 transition">
              Nâng cấp ngay
            </button>
          </div>
        </aside>

        {/* ── Main area ── */}
        <div className="flex flex-1 flex-col lg:ml-[200px] min-h-screen">
          {/* Top header */}
          <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-slate-100 bg-white px-5 py-3">
            {/* Public nav */}
            <nav className="hidden md:flex items-center gap-5 text-[13px] font-medium text-slate-500">
              <Link href="/" className="hover:text-slate-800 transition">Trang chủ</Link>
              <Link href="/photographer" className="hover:text-slate-800 transition">Photographer</Link>
              <Link href="/services" className="hover:text-slate-800 transition">Dịch vụ</Link>
              <Link href="/news" className="hover:text-slate-800 transition">Tin tức</Link>
              <Link href="/about" className="hover:text-slate-800 transition">Liên hệ</Link>
            </nav>

            <div className="ml-auto flex items-center gap-2.5">
              {/* Bell */}
              <Link href="/notification" className="relative rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </Link>
              {/* Messages */}
              <Link href="/profilephotographer/messages" className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </Link>
              {/* User */}
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 pl-2 pr-3 py-1.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600">
                  {initial}
                </div>
                <div className="hidden sm:block leading-tight">
                  <p className="text-[12px] font-bold text-slate-700">{session?.fullName ?? "Photographer"}</p>
                  <p className="text-[10px] text-slate-400">Photographer</p>
                </div>
                <svg className="h-3 w-3 text-slate-400 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </header>

          {/* Page children */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>

      {/* Footer — full width, bên ngoài sidebar+content flex */}
      <div className="lg:pl-[200px]">
        <DashboardFooter />
      </div>
    </div>
  );
}
