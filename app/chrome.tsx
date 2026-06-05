"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const containerClass = "w-full max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20";

const headerLinks = [
  { href: "/", label: "Trang chủ" },
  { href: "/about", label: "Về chúng tôi" },
  { href: "/photographer", label: "Photographer" },
  { href: "/#services", label: "Dịch vụ" },
  { href: "/news", label: "Tin tức" },
  { href: "/pricing", label: "Bảng giá" },
  { href: "/portfolio", label: "Portfolio" },
];

const footerColumns = [
  { title: "Sản Phẩm", links: ["Tính năng", "Bảng giá"] },
  { title: "Công Ty", links: ["Về chúng tôi", "Tuyển dụng"] },
  { title: "Hỗ Trợ", links: ["Trung tâm trợ giúp", "Điều Khoản"] },
  { title: "Liên Hệ", links: ["Gửi Email cho chúng tôi"] },
];

export function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isStandalonePage = pathname.startsWith("/profilephotographer");

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
  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-[#e8eaf1]/80 bg-white/95 backdrop-blur-md shadow-sm">
      <div
        className={`${containerClass} flex min-h-[76px] lg:min-h-[88px] items-center justify-between gap-4`}
      >
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <img
            src="/logo_sudion.jpg"
            alt="Studion logo"
            className="h-[70px] w-[70px] rounded-full object-cover"
          />
          <span className="text-[20px] font-black tracking-[0.05em] text-[#0e111d] uppercase">
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
          <button
            type="button"
            aria-label="Search"
            className="hidden h-10 w-10 items-center justify-center rounded-full text-[#4b5563] transition-colors hover:bg-[#f3f4f6] hover:text-[#0e111d] lg:inline-flex"
          >
            <SearchGlyph className="h-5 w-5" />
          </button>

          <button
            type="button"
            aria-label="Profile"
            className="hidden h-10 w-10 items-center justify-center rounded-full text-[#4b5563] transition-colors hover:bg-[#f3f4f6] hover:text-[#0e111d] lg:inline-flex"
          >
            <ProfileGlyph className="h-5 w-5" />
          </button>

          <Link
            href="/booking"
            className="rounded-lg bg-[#ff8d28] px-5 py-2.5 text-[14px] font-bold text-white shadow-[0_6px_14px_rgba(255,141,40,0.15)] transition-all hover:translate-y-[-1px] hover:bg-[#e0751b]"
          >
            Đặt lịch ngay
          </Link>

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
    <footer data-reveal className="w-full bg-[#0a0a0c] py-10 text-white">
      <div className={`${containerClass} grid grid-cols-2 md:grid-cols-5 gap-8 items-start`}>
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2">
            <LogoMark className="h-5 w-5" />
            <span className="text-[15px] font-black tracking-[0.05em] text-orange-500 uppercase">STUDION</span>
          </div>
          <p className="mt-3 text-[11px] text-gray-500 leading-relaxed">
            © 2024 Photor AI. All rights reserved.
          </p>
        </div>

        {footerColumns.map((column) => (
          <div key={column.title}>
            <p className="text-[11px] font-bold uppercase tracking-wider text-orange-500 mb-3">
              {column.title}
            </p>
            <div className="space-y-2">
              {column.links.map((link) => (
                <Link
                  key={link}
                  href="#"
                  className="block text-[12px] text-gray-400 transition-colors hover:text-white"
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

function LogoMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#FF8D28" />
      <circle cx="12" cy="12" r="5" fill="white" />
      <circle cx="12" cy="12" r="2" fill="#0e111d" />
    </svg>
  );
}
