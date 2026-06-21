"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type NavItem = {
  href: string;
  icon: string;
  label: string;
};

const navItems: NavItem[] = [
  {
    href: "/profilephotographer/dashboard",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    label: "Dashboard",
  },
  {
    href: "/profilephotographer/portfolio",
    icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
    label: "Portfolio",
  },
  {
    href: "/profilephotographer/services",
    icon: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4",
    label: "Services",
  },
  {
    href: "/profilephotographer/bookings",
    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    label: "Bookings",
  },
  {
    href: "/profilephotographer/earnings",
    icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    label: "Earnings",
  },
  {
    href: "/profilephotographer/messages",
    icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
    label: "Messages",
  },
  {
    href: "/profilephotographer/settings",
    icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.573-1.066zM12 8a4 4 0 100 8 4 4 0 000-8z",
    label: "Settings",
  },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

type ProfilePhotographerLayoutProps = {
  children: ReactNode;
};

export default function ProfilePhotographerLayout({ children }: ProfilePhotographerLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#1a1a2e] flex">
      <aside className="hidden lg:flex flex-col w-52 bg-[#1e1e32] py-6 px-4 fixed h-full z-20">
        <div className="mb-8 flex items-center gap-2 px-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ff8d28]">
            <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="5" />
              <circle cx="12" cy="12" r="2.5" fill="white" />
            </svg>
          </div>
          <span className="text-[#ff8d28] font-black text-base tracking-widest uppercase">
            STUDION
          </span>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                  active ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={item.icon} />
                </svg>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/photographer"
          className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-400 transition-colors hover:bg-white/5"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Get Pro Support
        </Link>
      </aside>

      <div className="flex-1 lg:ml-52 min-h-screen bg-[#f5f5fa]">
        <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-gray-100 bg-white px-6 py-3">
          <Link
            href="/photographer"
            className="flex items-center gap-1.5 shrink-0 text-xs font-semibold text-gray-400 transition-colors hover:text-orange-500"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại
          </Link>

          <div className="ml-auto flex items-center gap-3">
            <button className="text-gray-400 hover:text-gray-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </button>
            <button className="text-gray-400 hover:text-gray-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <img src="/logo_sudion_remove.png" alt="avatar" className="h-8 w-8 rounded-full border-2 border-orange-200 object-cover" />
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}
