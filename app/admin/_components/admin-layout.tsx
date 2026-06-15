"use client";

import { useState } from "react";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin", "vietnamese"], weight: ["400", "500", "600", "700"] });

const navItems = [
  ["Dashboard", "/admin", "M3 10.5L12 3l9 7.5M5 10v9h5v-5h4v5h5v-9"],
  ["Người dùng", "/admin/users", "M16 19v-1.2a4.8 4.8 0 00-4.8-4.8H8.8A4.8 4.8 0 004 17.8V19M12 7.5a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0zM20 19v-1a4 4 0 00-3-3.9M16.5 4.8a3 3 0 010 5.4"],
  ["Photographer", "/admin/photographer", "M4 8h3l1.5-2h7L17 8h3v10H4zM12 16a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM7 8V6"],
  ["Dịch vụ", "/admin/services", "M20 13.5V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2h7.5M8 8h8M8 12h5M17 17l2 2 3-4"],
  ["Booking", "/admin/booking", "M7 3v3M17 3v3M4 8h16M6 5h12a2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2z"],
  ["Thanh toán", "/admin/payments", "M3 7h18v10H3zM3 10h18M7 15h3"],
  ["Hoàn tiền", "/admin/refunds", "M9 14l-4-4 4-4M5 10h10a4 4 0 010 8h-2M19 6v4h-4"],
  ["Report / Khiếu nại", "/admin/reports", "M6 3h9l3 3v15H6zM15 3v4h4M9 12h6"],
  ["AI Moderation", "/admin/ai-moderation", "M12 3l8 4v6c0 4-3.5 7-8 8s-8-4-8-8V7zM9 12l2 2 4-5"],
  ["Đánh giá", "/admin/reviews", "M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.4 6.4 20.2l1.1-6.2L3 9.6l6.2-.9z"],
  ["Thông báo", "/admin/notifications", "M18 16H6l1.5-2V10a4.5 4.5 0 019 0v4zM10 19h4"],
  ["System Log", "/admin/logs", "M5 4h14v16H5zM8 8h8M8 12h8M8 16h5"],
  ["Cài đặt", "/admin/settings", "M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM19 12a7.4 7.4 0 00-.1-1l2-1.5-2-3.4-2.4 1a7.2 7.2 0 00-1.7-1L14.5 3h-5l-.4 3.1a7.2 7.2 0 00-1.7 1l-2.4-1-2 3.4 2 1.5a7.4 7.4 0 000 2l-2 1.5 2 3.4 2.4-1a7.2 7.2 0 001.7 1l.4 3.1h5l.4-3.1a7.2 7.2 0 001.7-1l2.4 1 2-3.4-2-1.5a7.4 7.4 0 00.1-1z"],
] as const;

export default function AdminLayout({
  active,
  children,
  search,
  onSearch,
}: {
  active: string;
  children: React.ReactNode;
  search?: string;
  onSearch?: (value: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <main className={`${inter.className} min-h-screen overflow-x-hidden bg-[#f7f7fb] text-[13px] text-[#0f172a]`}>
      <aside className={`fixed inset-y-0 left-0 z-30 hidden border-r border-[#e6e9f1] bg-white text-[#0f172a] shadow-[18px_0_45px_rgba(12,18,32,0.06)] transition-all lg:block ${collapsed ? "w-[80px]" : "w-[252px]"}`}>
        <div className={`flex h-[72px] items-center ${collapsed ? "justify-center px-3" : "px-5"}`}>
          {!collapsed ? <b className="text-[23px] tracking-normal text-[#0f172a]">STUD<span className="text-[#ff8d28]">ION</span></b> : <img src="/logo_sudion_remove.png" alt="Studion" className="h-11 w-11 rounded-xl bg-[#fff3e8] p-1" />}
        </div>
        <nav className="space-y-1 overflow-y-auto px-3 pb-24">
          {navItems.map(([label, href, path]) => (
            <a key={label} href={href} title={collapsed ? label : undefined} className={`flex h-11 items-center rounded-xl text-[14px] font-medium transition ${active === label ? "bg-[#ff8d28] text-white shadow-[0_12px_24px_rgba(255,141,40,0.22)]" : "text-[#162033] hover:bg-[#fff3e8] hover:text-[#ff8d28]"} ${collapsed ? "justify-center px-0" : "gap-3 px-3"}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px] shrink-0"><path d={path} /></svg>
              {!collapsed ? <span className="truncate">{label}</span> : null}
            </a>
          ))}
        </nav>
        <div className="absolute inset-x-0 bottom-0 border-t border-[#e6e9f1] bg-white p-3">
          <div className={`flex items-center rounded-2xl bg-[#f7f8fb] p-3 ${collapsed ? "justify-center" : "gap-3"}`}>
            <img src="/Overlay+Shadow.png" alt="Admin" className="h-9 w-9 rounded-full object-cover" />
            {!collapsed ? <div><b className="text-[13px] text-[#0f172a]">Admin</b><p className="text-[11px] text-[#697086]">Super Admin</p><p className="text-[10px] text-emerald-500">● Online</p></div> : null}
          </div>
        </div>
      </aside>

      <section className={`min-h-screen transition-all ${collapsed ? "lg:ml-[80px]" : "lg:ml-[252px]"}`}>
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-[#e6e8f0] bg-white/90 px-4 backdrop-blur md:px-6">
          <button onClick={() => setCollapsed(!collapsed)} className="grid h-9 w-9 place-items-center rounded-xl text-[#536078] hover:bg-[#f4f5f8] hover:text-[#ff8d28]" aria-label="Thu gọn sidebar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" className="h-5 w-5"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
          </button>
          <div className="ml-auto flex items-center gap-3">
            <button type="button" aria-label="Thông báo" title="Thông báo" className="relative grid h-9 w-9 place-items-center rounded-xl text-[#536078] hover:bg-[#fff3e8] hover:text-[#ff8d28]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M18 16H6l1.5-2V10a4.5 4.5 0 019 0v4L18 16zM10 19h4" /></svg>
              <b className="absolute right-0 top-0 rounded-full bg-red-500 px-1 text-[10px] leading-4 text-white">12</b>
            </button>
            <img src="/Overlay+Shadow.png" alt="Admin" className="h-9 w-9 rounded-full object-cover" />
            <div className="hidden sm:block"><b>Admin</b><p className="text-[11px] text-[#697086]">Super Admin</p></div>
          </div>
        </header>
        <div className="min-w-0 px-4 py-5 md:px-6">{children}</div>
      </section>
    </main>
  );
}
