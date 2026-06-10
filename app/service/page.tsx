"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { serviceCategories, servicePackages } from "./service-data";

const containerClass = "mx-auto w-full max-w-[1440px] px-6 md:px-12 lg:px-20";

function fadeUpStyle(isReady: boolean, delay = 0): CSSProperties {
  return {
    opacity: isReady ? 1 : 0,
    transform: isReady ? "translate3d(0, 0, 0)" : "translate3d(0, 56px, 0) scale(0.96)",
    transition:
      "opacity 1000ms cubic-bezier(0.16, 1, 0.3, 1), transform 1000ms cubic-bezier(0.16, 1, 0.3, 1)",
    transitionDelay: `${delay}ms`,
    willChange: isReady ? "auto" : "opacity, transform",
  };
}

export default function ServicesPage() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsReady(true), 80);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M10 2.5L11.9 8.1L17.5 10L11.9 11.9L10 17.5L8.1 11.9L2.5 10L8.1 8.1L10 2.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

/* ─── photo cluster ──────────────────────────────────────────── */
function PhotoCluster({
  mainImage,
  detailImage,
  badgeTitle,
  badgeText,
  reverse,
  muted,
}: {
  children: ReactNode;
  delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  const op = visible ? 1 : 0;

  const base: CSSProperties = {
    transition:
      "opacity 1050ms cubic-bezier(0.16,1,0.3,1), transform 1050ms cubic-bezier(0.16,1,0.3,1)",
  };

  return (
    <div
      ref={ref}
      className="relative w-full aspect-[1.18/1] max-w-[500px] lg:max-w-[520px] mx-auto select-none group"
      style={{
        opacity: op,
        transform: visible ? "none" : "translateY(72px) scale(0.96)",
        ...base,
      }}
    >
      <div
        className="absolute z-30 w-[48%] rounded-[12px] border border-[#ececf1] bg-white/95 backdrop-blur px-4 py-3 shadow-[0_10px_25px_rgba(0,0,0,0.05)]"
        style={{
          top: "12%",
          left: reverse ? "4%" : "18%",
          opacity: op,
          transform: visible ? "none" : "translateY(38px) scale(0.96)",
          transition:
            "opacity 1050ms 260ms cubic-bezier(0.16,1,0.3,1), transform 1050ms 260ms cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <div className="grid h-7 w-7 place-items-center rounded-full bg-[#fcf2e9] shrink-0">
            <SparkGlyph className="h-3.5 w-3.5 text-[#ff8d28]" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-[12px] font-extrabold text-[#0e111d] leading-none">
              {badgeTitle}
            </p>
            <p className="truncate text-[10px] text-[#8a8fa1] mt-1 leading-none font-medium">
              {badgeText}
            </p>
          </div>
        </div>
      </div>

      <div
        className="absolute z-10 overflow-hidden rounded-[24px] shadow-[0_24px_48px_rgba(0,0,0,0.06)]"
        style={{
          left: reverse ? "0" : "15%",
          right: reverse ? "15%" : "0",
          top: "8%",
          bottom: "4%",
          opacity: op,
          transform: visible
            ? `rotate(${reverse ? "-1deg" : "1deg"})`
            : `translateY(76px) scale(0.96) rotate(${
                reverse ? "-1deg" : "1deg"
              })`,
          transition:
            "opacity 1150ms cubic-bezier(0.16,1,0.3,1), transform 1150ms cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <img
          src={mainImage}
          alt=""
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>

      <div
        className={`absolute z-20 w-[42%] aspect-square overflow-hidden rounded-[18px] border-[4px] shadow-[0_16px_32px_rgba(0,0,0,0.1)] ${
          muted ? "border-[#f8f9fd]" : "border-white"
        }`}
        style={{
          bottom: "0",
          left: reverse ? "auto" : "0",
          right: reverse ? "0" : "auto",
          opacity: op,
          transform: visible
            ? `rotate(${reverse ? "2deg" : "-2deg"})`
            : `translateY(92px) scale(0.94) rotate(${
                reverse ? "2deg" : "-2deg"
              })`,
          transition:
            "opacity 1150ms 160ms cubic-bezier(0.16,1,0.3,1), transform 1150ms 160ms cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <img
          src={detailImage}
          alt=""
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
    </div>
  );
}

/* ─── service section ────────────────────────────────────────── */
function ServiceSection({
  id,
  eyebrow,
  title,
  description,
  price,
  network,
  tags,
  mainImage,
  detailImage,
  badgeTitle,
  badgeText,
  reverse,
  muted,
}: (typeof serviceSections)[number]) {
  return (
    <section
      className={`w-full overflow-hidden ${
        muted ? "bg-[#f8f9fd]" : "bg-white"
      }`}
    >
      <div
        className={`${containerClass} grid gap-16 py-20 sm:py-24 lg:grid-cols-2 lg:items-center lg:gap-24 lg:py-28`}
      >
        <div className={reverse ? "lg:order-2" : ""}>
          <div className="max-w-[540px] lg:max-w-none">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#ff8d28]">
              {eyebrow}
            </p>

            <h2 className="mt-3 text-[32px] sm:text-[38px] md:text-[46px] font-black leading-[1.08] tracking-[-0.03em] text-[#0e111d]">
              {title}
            </h2>

            <p className="mt-5 text-[16px] leading-[1.7] text-[#4b5563] font-medium">
              {description}
            </p>

            <div className="mt-8 grid grid-cols-2 gap-5 border-t border-[#f1f3f7] pt-7 max-w-[420px] lg:max-w-none">
              <div>
                <p className="text-[11px] font-bold leading-4 text-[#8a8fa1] uppercase tracking-wider">
                  Giá khởi điểm
                </p>
                <p className="mt-1 text-[24px] font-extrabold leading-none tracking-[-0.02em] text-[#ff8d28]">
                  {price}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-bold leading-4 text-[#8a8fa1] uppercase tracking-wider">
                  Mạng lưới
                </p>
                <p className="mt-1 text-[24px] font-extrabold leading-none tracking-[-0.02em] text-[#0e111d]">
                  {network}
                </p>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap gap-2.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[#f0f3fe] px-4 py-2 text-[12px] font-bold text-[#556080]"
                >
                  {tag}
                </span>
              ))}
            </div>

            <Link
              href={`/photographer?category=${id}`}
              className="mt-8 inline-flex rounded-lg bg-[#ff8d28] hover:bg-[#e0751b] px-7 py-3.5 text-[14px] font-bold text-white shadow-[0_8px_16px_rgba(255,141,40,0.12)] transition-all hover:-translate-y-[1px]"
            >
              Đặt lịch ngay
            </Link>
          </div>
        </div>

        <div className={reverse ? "lg:order-1" : ""}>
          <PhotoCluster
            mainImage={mainImage}
            detailImage={detailImage}
            badgeTitle={badgeTitle}
            badgeText={badgeText}
            reverse={reverse}
            muted={muted}
          />
        </div>
      </div>
    </section>
  );
}

/* ─── page ───────────────────────────────────────────────────── */
export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-white text-[#0e111d]">
      <section className="bg-[#0e111d] py-16 text-center">
        <div className={containerClass}>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ff8d28]/15 px-4 py-1.5 text-[12px] font-extrabold text-[#ff8d28] mb-4">
            <SparkGlyph className="h-4 w-4" />
            Dịch vụ nhiếp ảnh
          </span>

          <h1 className="mt-4 text-[36px] sm:text-[48px] md:text-[56px] font-black leading-[1.1] text-white">
            Mọi khoảnh khắc đáng được
            <br />
            <span className="text-[#ff8d28]">ghi lại hoàn hảo</span>
          </h1>

          <p className="mx-auto mt-5 max-w-[560px] text-[16px] leading-[1.7] text-gray-400 font-medium">
            Khám phá đa dạng dịch vụ chụp ảnh chuyên nghiệp — từ cưới hỏi, kỉ
            yếu đến thương mại và du lịch.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
            {serviceSections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[12px] font-semibold text-gray-300 transition hover:border-[#ff8d28]/50 hover:text-[#ff8d28]"
              >
                {s.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      <main>
        {serviceSections.map((section) => (
          <div key={section.id} id={section.id}>
            <ServiceSection {...section} />
          </div>
        ))}
      </main>

      <section className="bg-[#ff8d28] py-16 text-center">
        <div className={containerClass}>
          <h2 className="text-[28px] sm:text-[36px] font-black text-white leading-tight">
            Sẵn sàng đặt lịch chụp?
          </h2>

          <p className="mt-3 text-[15px] text-white/80 font-medium">
            Hàng ngàn nhiếp ảnh gia chuyên nghiệp đang chờ bạn.
          </p>

          <Link
            href="/photographer?category=all"
            className="mt-7 inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3.5 text-[14px] font-bold text-[#ff8d28] shadow-lg transition hover:-translate-y-[1px] hover:shadow-xl"
          >
            Tìm Photographer ngay
          </Link>
        </div>
      </section>
    </div>
  );
}