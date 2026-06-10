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
    <main className="min-h-screen bg-[#fafbfc] text-[#0e111d]">
      <section className="w-full overflow-hidden bg-white">
        <div className={`${containerClass} grid gap-10 py-14 lg:grid-cols-[1.05fr_0.85fr] lg:items-center lg:gap-14 lg:py-16`}>
          <div className="pt-2">
            <div
              className="inline-flex items-center gap-1.5 rounded-full bg-[#fcf2e9] px-4 py-1.5 text-[12px] font-extrabold text-[#ff8d28]"
              style={fadeUpStyle(isReady, 0)}
            >
              <span className="grid h-4 w-4 place-items-center">✦</span>
              Dịch vụ nhiếp ảnh
            </div>
            <h1
              className="mt-5 max-w-[15ch] text-[40px] font-black leading-[1.18] tracking-normal text-[#0e111d] sm:text-[48px] md:text-[54px] lg:text-[56px] xl:text-[64px]"
              style={fadeUpStyle(isReady, 120)}
            >
              Chọn dịch vụ trước, rồi tìm gói chụp gần bạn
            </h1>
            <p
              className="mt-6 max-w-[560px] text-[16px] font-medium leading-[1.7] text-[#4b5563] sm:text-[17px] md:text-[18px]"
              style={fadeUpStyle(isReady, 240)}
            >
              Mỗi dịch vụ là một danh mục. Bên trong là nhiều gói chụp của nhiều photographer, có thể lọc theo khoảng cách, giá, add-on và lịch trống.
            </p>
            <div className="mt-7 flex flex-wrap gap-3" style={fadeUpStyle(isReady, 360)}>
              {serviceCategories.map((service) => (
                <Link
                  key={service.slug}
                  href={`/services/${service.slug}`}
                  className="rounded-full border border-[#e8eaf1] bg-white px-5 py-2.5 text-[14px] font-extrabold text-[#0e111d] shadow-[0_8px_18px_rgba(14,17,29,0.04)] transition hover:border-[#ff8d28] hover:bg-[#fff7ef] hover:text-[#ff8d28]"
                >
                  {service.title}
                </Link>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap items-start gap-10" style={fadeUpStyle(isReady, 480)}>
              <div className="grid gap-1 border-l-4 border-[#ff8d28] pl-4">
                <strong className="text-[32px] font-black leading-none text-[#0e111d]">3</strong>
                <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#6b7280]">Dịch vụ chính</span>
              </div>
              <div className="grid gap-1 border-l-4 border-[#ff8d28] pl-4">
                <strong className="text-[32px] font-black leading-none text-[#0e111d]">2K+</strong>
                <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#6b7280]">Photographer</span>
              </div>
            </div>
          </div>

          <div className="relative min-h-[430px] lg:min-h-[520px]" style={fadeUpStyle(isReady, 320)}>
            <div className="absolute right-0 top-0 h-[82%] w-[86%] overflow-hidden rounded-[24px] bg-[#eef1f7] shadow-[0_24px_56px_rgba(14,17,29,0.12)] ring-1 ring-black/5">
              <Image
                src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=82"
                alt="Dịch vụ chụp ảnh Studion"
                fill
                priority
                sizes="(max-width: 1023px) 100vw, 560px"
                className="object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
            <div className="absolute bottom-[10%] left-0 flex w-[min(340px,72%)] items-center gap-4 rounded-2xl border border-[#e8eaf1] bg-white p-4 shadow-[0_18px_42px_rgba(14,17,29,0.12)]">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#fcf2e9] text-[#ff8d28]">
                ✦
              </div>
              <div>
                <p className="text-[15px] font-black text-[#0e111d]">Listing theo gói</p>
                <p className="mt-1 text-[13px] font-semibold leading-5 text-[#667085]">
                  Cùng dịch vụ, mỗi photographer có giá, add-on và khoảng cách khác nhau.
                </p>
              </div>
            </div>
            <div className="absolute bottom-0 right-[8%] w-[42%] overflow-hidden rounded-[18px] border-4 border-white bg-[#eef1f7] shadow-[0_18px_42px_rgba(14,17,29,0.14)]">
              <div className="relative aspect-square">
                <Image
                  src="https://images.unsplash.com/photo-1529634597503-139d3726fed5?auto=format&fit=crop&w=640&q=82"
                  alt=""
                  fill
                  sizes="220px"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={`${containerClass} py-14 lg:py-18`}>
        

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {serviceCategories.map((service, index) => {
            const packageCount = servicePackages.filter((item) => item.serviceSlug === service.slug).length;

            return (
              <RevealCard key={service.slug} delay={index * 130}>
                <Link
                  href={`/services/${service.slug}`}
                  className="group block overflow-hidden rounded-2xl border border-[#e5e7ef] bg-white shadow-[0_16px_42px_rgba(14,17,29,0.045)] transition hover:-translate-y-1 hover:border-[#ffcfaa] hover:shadow-[0_22px_54px_rgba(255,141,40,0.12)]"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#eef1f7]">
                    <Image
                      src={service.heroImage}
                      alt={service.title}
                      fill
                      sizes="(max-width: 1023px) 100vw, 420px"
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-[#ff8d28]">
                      {service.shortTitle}
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-[22px] font-black text-[#0e111d]">{service.title}</h3>
                      <span className="shrink-0 rounded-full bg-[#fff4eb] px-3 py-1 text-[11px] font-extrabold text-[#ff8d28]">
                        {packageCount} gói mẫu
                      </span>
                    </div>
                    <p className="mt-3 text-[14px] font-semibold leading-6 text-[#667085]">
                      {service.description}
                    </p>
                    <div className="mt-5 flex items-end justify-between gap-4 border-t border-[#f0f2f6] pt-5">
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#98a2b3]">
                          Giá khởi điểm
                        </p>
                        <p className="mt-1 text-[18px] font-black text-[#ff8d28]">{service.startingPrice}</p>
                      </div>
                      <span className="rounded-lg bg-[#ff8d28] px-4 py-2 text-[12px]  font-black text-white">
                        Xem gói
                      </span>
                    </div>
                  </div>
                </Link>
              </RevealCard>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function RevealCard({
  children,
  delay,
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
      { rootMargin: "0px 0px -8% 0px", threshold: 0.16 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
      className={`transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
        visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      }`}
    >
      {children}
    </div>
  );
}
