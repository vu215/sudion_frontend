"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect, type ReactNode } from "react";
import { useAuth } from "@/app/auth-context";

const containerClass = "w-full max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20";

const headerLinks = [
  { href: "/", label: "Trang chủ" },
  { href: "/about", label: "Về chúng tôi" },
  { href: "/photographer", label: "Photographer" },
  { href: "/#services", label: "Dịch vụ" },
  { href: "/news", label: "Tin tức" },
];

const footerColumns = [
  { title: "Dịch vụ", links: ["Chụp ảnh cưới", "Chụp ảnh đôi", "Chụp kỉ yếu", "Chụp sự kiện"] },
  { title: "Công ty", links: ["Về chúng tôi", "Liên hệ", "Tuyển dụng", "Blog"] },
  { title: "Hỗ trợ", links: ["Trung tâm trợ giúp", "Điều khoản dịch vụ", "Chính sách bảo mật"] },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const standalonePaths = ["/login", "/register", "/forgot-password", "/reset-password"];
  const isStandalonePage =
    pathname.startsWith("/profilephotographer") || standalonePaths.includes(pathname);

  if (isStandalonePage) {
    return <>{children}</>;
  }

  return (
    <>
      <Header pathname={pathname} />
      <div className="pt-[76px] lg:pt-[88px]">{children}</div>
      <Footer />
    </>
  );
}

function Header({ pathname }: { pathname: string }) {
  const router = useRouter();
  const { session, logout, loading } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (searchOpen) {
      inputRef.current?.focus();
    }
  }, [searchOpen]);

  const initials = session?.fullName
    ? session.fullName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "";
  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-[#e8eaf1]/80 bg-white/95 backdrop-blur-md shadow-sm">
      <div
        className={`${containerClass} flex min-h-[76px] items-center justify-between gap-4 lg:min-h-[88px]`}
      >
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <img
            src="/logo_sudion_remove.png"
            alt="Studion logo"
            className="h-[70px] w-[70px] rounded-full"
          />
          <span className="text-[20px] font-black uppercase tracking-[0.05em] text-[#0e111d]">
            STUDION
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-[14px] font-bold text-[#4b5563] md:flex lg:gap-8 lg:text-[15px]">
          {headerLinks.map((link) => {
            const active =
              link.href === "/" ? pathname === "/" : !link.href.includes("#") && pathname.startsWith(link.href);

            return (
              <Link
                key={link.label}
                href={link.href}
                className={`border-b-2 pb-1 transition-all ${
                  active
                    ? "border-[#ff8d28] text-[#ff8d28]"
                    : "border-transparent hover:text-[#0e111d]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <div ref={searchRef} className="relative hidden lg:flex items-center">
            <button
              type="button"
              onClick={() => setSearchOpen((value) => !value)}
              className="relative z-50 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#e8eaf1] text-[#4b5563] hover:bg-gray-50"
              aria-label="Mở tìm kiếm"
            >
              <SearchGlyph className="h-5 w-5" />
            </button>
            {searchOpen && (
              <div className="absolute right-0 top-full mt-2 z-50">
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    const target = `/photographer${searchQuery.trim() ? `?search=${encodeURIComponent(searchQuery.trim())}` : ""}`;
                    router.push(target);
                  }}
                  className="relative w-72 rounded-full border border-[#e8eaf1] bg-white px-2 py-1 shadow-[0_18px_50px_rgba(15,23,42,0.08)]"
                >
                  <input
                    ref={inputRef}
                    name="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    type="search"
                    placeholder="Tìm kiếm photographer..."
                    className="h-11 w-full rounded-full border-none bg-transparent px-4 pr-12 text-sm text-[#0e111d] outline-none placeholder:text-[#9ca3af]"
                  />
                  <button
                    type="submit"
                    className="absolute right-1 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#ff8d28] text-white shadow-sm hover:bg-[#e27517]"
                    aria-label="Tìm kiếm"
                  >
                    <SearchGlyph className="h-4 w-4" />
                  </button>
                </form>
              </div>
            )}
          </div>

          {!loading && !session ? (
            <Link
              href="/register"
              className="rounded-lg bg-[#ff8d28] px-5 py-2.5 text-[14px] font-bold text-white shadow-[0_6px_14px_rgba(255,141,40,0.15)] transition-all hover:translate-y-[-1px] hover:bg-[#e0751b]"
            >
              Đăng ký
            </Link>
          ) : !loading && session ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-2.5 rounded-full border border-[#e8eaf1] px-3 py-1.5 hover:bg-[#f9f9fb] transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#ff8d28] flex items-center justify-center text-white text-xs font-black">
                  {initials}
                </div>
                <span className="hidden text-sm font-bold text-[#0e111d] md:block max-w-[120px] truncate">
                  {session.fullName}
                </span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-[#e8eaf1] bg-white shadow-xl py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-bold text-gray-900 truncate">{session.fullName}</p>
                    <p className="text-xs text-gray-400 truncate">{session.email}</p>
                    <span className="mt-1 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">
                      {session.role === "photographer" ? "Nhiếp ảnh gia" : "Khách hàng"}
                    </span>
                  </div>
                  {session.role === "photographer" && (
                    <Link href="/profilephotographer" onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      </svg>
                      Dashboard nhiếp ảnh gia
                    </Link>
                  )}
                  <Link href="/bookings" onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Lịch đặt của tôi
                  </Link>
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button type="button" onClick={() => { setDropdownOpen(false); logout(); }}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          <button
            type="button"
            aria-label="Open menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#e8eaf1] text-[#6a7082] md:hidden"
          >
            <MenuGlyph />
          </button>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer data-reveal className="w-full border-t border-white/5 bg-[#0a0a0c] py-16 text-white">
      <div
        className={`${containerClass} grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_repeat(3,1fr)] lg:gap-16`}
      >
        <div>
          <div className="flex items-center gap-2.5">
            <img
              src="/logo_sudion_remove.png"
              alt="Studion logo"
              className="h-[70px] w-[70px] rounded-full"
            />
            <span className="text-[20px] font-black uppercase tracking-[0.05em] text-white">
              STUDION
            </span>
          </div>
          <p className="mt-4 max-w-[280px] text-[14px] font-semibold leading-6 text-gray-400">
            Nền tảng tìm kiếm và đặt lịch chụp hình chuyên nghiệp hàng đầu tại Việt Nam.
          </p>
          <p className="mt-6 text-[12px] font-bold text-gray-500">
            © 2026 STUDION. All rights reserved.
          </p>
        </div>

        {footerColumns.map((column) => (
          <div key={column.title}>
            <p className="text-[13px] font-bold uppercase tracking-wider text-gray-300">
              {column.title}
            </p>
            <div className="mt-4 space-y-3.5">
              {column.links.map((link) => (
                <Link
                  key={link}
                  href={column.title === "Dịch vụ" ? "/#services" : column.title === "Công ty" ? "/about" : "/support"}
                  className="block text-[14px] font-semibold text-gray-400 transition-colors hover:text-white"
                >
                  {link}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </footer>
  );
}

function SearchGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" aria-hidden="true">
      <path d="M14 14L17 17" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="8.5" cy="8.5" r="5.75" stroke="currentColor" strokeWidth="2.2" />
    </svg>
  );
}

function ProfileGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 17v-1a4 4 0 00-4-4H8a4 4 0 00-4 4v1M12 5a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function MenuGlyph() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
      <path d="M4 6H16M4 10H16M4 14H16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}
