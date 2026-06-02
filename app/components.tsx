"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { dashboardLinks, navItems, photographers, services } from "./data";

const mainNavItems = [
  { href: "/", label: "Home" },
  { href: "/photographers", label: "Photographer" },
  { href: "/booking-detail", label: "Services" },
  { href: "/photo-ai", label: "AI Consultation" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  if (
    href === "/photographers" &&
    pathname.startsWith("/photographer")
  ) {
    return true;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label="Sudion home">
        Photor AI
      </Link>
      <nav className="desktop-nav" aria-label="Dieu huong chinh">
        {mainNavItems.map((item) => {
          const isActive = isActivePath(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={isActive ? "is-active" : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="header-actions">
        <Link href="/notifications" className="icon-button" aria-label="Thong bao">
          bell
        </Link>
        <Link href="/login" className="nav-login">
          Login
        </Link>
        <Link href="/register" className="btn btn-primary compact">
          Find Photographer
        </Link>
      </div>
      <details className="mobile-menu">
        <summary aria-label="Mo menu">Menu</summary>
        <div>
          {[...navItems, ...dashboardLinks].map((item) => {
            const isActive = isActivePath(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={isActive ? "is-active" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </details>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div>
        <p className="mono">Photor AI</p>
        <h2>AI-powered creative marketplace cho moi buoi chup.</h2>
      </div>
      <div className="footer-grid">
        <div>
          <h4>Dich vu</h4>
          {services.slice(0, 4).map((service) => (
            <Link key={service.name} href="/booking-detail">
              {service.name}
            </Link>
          ))}
        </div>
        <div>
          <h4>Tai khoan</h4>
          {dashboardLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </div>
        <div>
          <h4>He thong</h4>
          <Link href="/forgot-password">Quen mat khau</Link>
          <Link href="/reset-password">Reset password</Link>
          <Link href="/reset-pasword">Reset pasword</Link>
          <Link href="/booking-success">Dat lich thanh cong</Link>
        </div>
      </div>
    </footer>
  );
}

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main>{children}</main>
      <Footer />
    </>
  );
}

export function SectionIntro({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <div data-reveal className="section-intro">
      <p className="mono">{eyebrow}</p>
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  );
}

export function ServicesGrid() {
  const icons = ["P", "C", "K", "N", "S", "W"];

  return (
    <div className="service-grid">
      {services.map((service, index) => (
        <article
          key={service.name}
          data-reveal
          data-reveal-delay={String(index * 90)}
          className="card"
        >
          <span className="tool-icon">{icons[index]}</span>
          <h3>{service.name}</h3>
          <p>{service.description}</p>
          <div className="card-meta">
            <span>{service.duration}</span>
            <span>{service.price}</span>
          </div>
          <p className="muted">{service.scene}</p>
        </article>
      ))}
    </div>
  );
}

export function PhotographerCards() {
  return (
    <div className="photographer-grid">
      {photographers.map((person, index) => (
        <article
          key={person.handle}
          data-reveal
          data-reveal-delay={String(index * 90)}
          className="photographer-card"
        >
          <Image
            src={person.image}
            alt={person.name}
            width={900}
            height={700}
            sizes="(max-width: 1023px) 50vw, 33vw"
          />
          <div>
            <span className={`badge ${person.status.toLowerCase()}`}>
              {person.status}
            </span>
            <h3>{person.name}</h3>
            <p>{person.specialty}</p>
            <div className="card-meta">
              <span>{person.location}</span>
              <span>{person.rating} sao</span>
              <span>{person.bookings}</span>
            </div>
            <Link href="/photographer-detail" className="inline-link">
              Xem ho so
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}

export function AuthPage({
  title,
  subtitle,
  mode,
}: {
  title: string;
  subtitle: string;
  mode: "login" | "register" | "forgot" | "reset";
}) {
  const isRegister = mode === "register";
  const isReset = mode === "reset";
  return (
    <PageShell>
      <section className="auth-section">
        <div data-reveal className="auth-copy">
          <p className="mono">Tai khoan Sudion</p>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        <form data-reveal data-reveal-delay="140" className="auth-card">
          {isRegister && (
            <label>
              Ho va ten
              <input placeholder="Nguyen Minh Anh" />
            </label>
          )}
          <label>
            Email
            <input type="email" placeholder="you@sudion.vn" />
          </label>
          {mode !== "forgot" && (
            <label>
              {isReset ? "Mat khau moi" : "Mat khau"}
              <input type="password" placeholder="••••••••" />
            </label>
          )}
          {isRegister && (
            <label>
              Vai tro
              <select defaultValue="client">
                <option value="client">Khach hang</option>
                <option value="photographer">Photographer</option>
              </select>
            </label>
          )}
          {isReset && (
            <label>
              Xac nhan mat khau
              <input type="password" placeholder="••••••••" />
            </label>
          )}
          <button className="btn btn-primary" type="button">
            Tiep tuc
          </button>
          <div className="auth-links">
            <Link href="/login">Login</Link>
            <Link href="/forgot-password">Quen mat khau</Link>
            <Link href="/register">Dang ky</Link>
          </div>
        </form>
      </section>
    </PageShell>
  );
}

export function DashboardPage({
  eyebrow,
  title,
  text,
  children,
}: {
  eyebrow: string;
  title: string;
  text: string;
  children: ReactNode;
}) {
  return (
    <PageShell>
      <section className="dashboard-shell">
        <aside data-reveal className="sidebar">
          <p className="mono">Bang dieu khien</p>
          {dashboardLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </aside>
        <div className="dashboard-content">
          <SectionIntro eyebrow={eyebrow} title={title} text={text} />
          {children}
        </div>
      </section>
    </PageShell>
  );
}
