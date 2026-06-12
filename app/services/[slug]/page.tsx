"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { formatVnd, getServiceBySlug, serviceCategories, servicePackages, type ServicePackage, type ServiceSlug } from "../service-data-fresh";

const containerClass = "mx-auto w-full max-w-[1440px] px-6 md:px-12 lg:px-20";

function fadeUpStyle(isReady: boolean, delay = 0): CSSProperties {
  return {
    opacity: isReady ? 1 : 0,
    transform: isReady ? "translate3d(0, 0, 0)" : "translate3d(0, 22px, 0)",
    transition: "opacity 850ms cubic-bezier(0.16, 1, 0.3, 1), transform 850ms cubic-bezier(0.16, 1, 0.3, 1)",
    transitionDelay: `${delay}ms`,
    willChange: isReady ? "auto" : "opacity, transform",
  };
}

export default function ServiceDetailPage() {
  const params = useParams<{ slug: string }>();
  const service = getServiceBySlug(params.slug);

  if (!service) {
    return (
      <main className="min-h-screen bg-[#fafbfc] px-6 py-20 text-center text-[#0e111d]">
        <h1 className="text-[32px] font-black">Không tìm thấy dịch vụ</h1>
        <p className="mt-3 text-[14px] font-semibold text-[#667085]">Dịch vụ này chưa được mở trên STUDION.</p>
        <Link href="/services" className="mt-6 inline-flex rounded-lg bg-[#ff8d28] px-5 py-3 text-[14px] font-black text-white">
          Quay lại dịch vụ
        </Link>
      </main>
    );
  }

  const packages = servicePackages.filter((item) => item.serviceSlug === service.slug);

  return (
    <ServiceListingPage
      packages={packages}
      serviceTitle={service.title}
      serviceSlug={service.slug as ServiceSlug}
    />
  );
}

function ServiceListingPage({
  packages,
  serviceSlug,
  serviceTitle,
}: {
  packages: ServicePackage[];
  serviceSlug: ServiceSlug;
  serviceTitle: string;
}) {
  const [activeRegion, setActiveRegion] = useState("Tất cả");
  const [activeStyle, setActiveStyle] = useState("Tất cả");
  const [priceRange, setPriceRange] = useState("Tất cả");
  const [sortMode, setSortMode] = useState("Phổ biến");
  const [page, setPage] = useState(1);
  const [isReady, setIsReady] = useState(false);
  const portraitPageSize = 4;

  useEffect(() => {
    setIsReady(false);
    const timer = window.setTimeout(() => setIsReady(true), 80);
    return () => window.clearTimeout(timer);
  }, [serviceSlug]);

  const filteredPackages = useMemo(() => {
    return packages
      .filter((item) => {
        const regionMatched =
          activeRegion === "Tất cả" ||
          item.location.includes(activeRegion.replace("TP. ", ""));
        const styleMatched =
          activeStyle === "Tất cả" ||
          item.addOns.includes(activeStyle) ||
          item.packageName.includes(activeStyle);
        if (priceRange === "Dưới 1.000.000đ" && item.price >= 1000000) return false;
        if (priceRange === "1.000.000đ - 2.000.000đ" && (item.price < 1000000 || item.price > 2000000)) return false;
        if (priceRange === "2.000.000đ - 3.000.000đ" && (item.price < 2000000 || item.price > 3000000)) return false;
        if (priceRange === "Trên 3.000.000đ" && item.price <= 3000000) return false;
        return regionMatched && styleMatched;
      })
      .sort((a, b) => {
        if (sortMode === "Gần nhất") return a.distanceKm - b.distanceKm;
        if (sortMode === "Giá thấp") return a.price - b.price;
        if (sortMode === "Đánh giá cao") return b.rating - a.rating;
        return b.reviewCount - a.reviewCount;
      });
  }, [activeRegion, activeStyle, packages, priceRange, sortMode]);

  const totalPages = Math.max(1, Math.ceil(filteredPackages.length / portraitPageSize));
  const safePage = Math.min(page, totalPages);
  const pagedPackages = filteredPackages.slice(
    (safePage - 1) * portraitPageSize,
    safePage * portraitPageSize,
  );

  const quickFilters =
    serviceSlug === "wedding"
      ? ["Tất cả", "Sài Gòn", "Hà Nội", "Đà Nẵng", "Đà Lạt", "Makeup", "Album", "Flycam"]
      : serviceSlug === "couple"
      ? ["Tất cả", "Sài Gòn", "Hà Nội", "Đà Nẵng", "Đà Lạt", "Ngoại cảnh", "Studio"]
      : serviceSlug === "portrait"
      ? ["Tất cả", "Sài Gòn", "Hà Nội", "Đà Nẵng", "Đà Lạt", "Tạo dáng", "Studio"]
      : serviceSlug === "event"
      ? ["Tất cả", "Sài Gòn", "Hà Nội", "Đà Nẵng", "Đà Lạt", "Video", "Flycam"]
      : serviceSlug === "yearbook"
      ? ["Tất cả", "Sài Gòn", "Hà Nội", "Đà Nẵng", "Đà Lạt", "Concept", "Studio"]
      : serviceSlug === "travel"
      ? ["Tất cả", "Sài Gòn", "Hà Nội", "Đà Nẵng", "Đà Lạt", "Lifestyle", "Flycam"]
      : ["Tất cả", "Sài Gòn", "Hà Nội", "Đà Nẵng", "Đà Lạt", "Studio", "Food styling"];

  const heroMeta =
    serviceSlug === "wedding"
      ? { image: "https://i.pinimg.com/736x/e1/a8/16/e1a816d82b5a387c8a3a7e2318f87133.jpg", description: "Lưu giữ ngày trọng đại với các gói pre-wedding, phóng sự cưới và album được cá nhân hóa theo câu chuyện của hai bạn." }
      : serviceSlug === "couple"
      ? { image: "https://i.pinimg.com/736x/f1/b3/a7/f1b3a74c133b8060f9e4935865dae3c0.jpg", description: "Ghi lại câu chuyện của hai bạn qua những khung hình tự nhiên, gần gũi và giàu cảm xúc." }
      : serviceSlug === "portrait"
      ? { image: "https://i.pinimg.com/736x/35/5e/45/355e4567ee65e77e43be0d243510572b.jpg", description: "Ghi lại những khoảnh khắc chân thật và tôn vinh cá tính của bạn với những bức ảnh chuyên nghiệp và đầy cảm xúc." }
      : serviceSlug === "event"
      ? { image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80&fit=crop", description: "Ghi lại mọi diễn biến của sự kiện với phong cách reportage, ánh sáng chuyên nghiệp và cảm xúc tự nhiên." }
      : serviceSlug === "yearbook"
      ? { image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80&fit=crop", description: "Tạo album kỷ yếu đa dạng và tràn đầy thanh xuân với những bức ảnh cá tính cho bạn và nhóm bạn." }
      : serviceSlug === "travel"
      ? { image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=80&fit=crop", description: "Đồng hành cùng bạn trong chuyến đi để ghi lại cảnh đẹp và khoảnh khắc du lịch thật tự nhiên." }
      : { image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836", description: "Tôn vinh món ăn qua ánh sáng, bố cục và chi tiết tinh tế, phù hợp cho menu và thương hiệu ẩm thực." };

  const handleQuickFilter = (filter: string) => {
    setActiveRegion(
      filter === "Sài Gòn" ? "TP. Hồ Chí Minh"
      : ["Hà Nội", "Đà Nẵng", "Đà Lạt"].includes(filter) ? filter
      : "Tất cả"
    );
    setActiveStyle(
      ["Studio", "Makeup", "Album", "Flycam", "Tạo dáng", "Concept", "Lifestyle", "Video", "Food styling", "Ngoại cảnh"].includes(filter)
        ? filter
        : "Tất cả"
    );
    setPage(1);
  };

  return (
    <main className="min-h-screen bg-[#fbfcff] text-[#0e111d]">
      {/* Hero */}
      <section className="w-full overflow-hidden bg-white">
        <div className={`${containerClass} grid gap-10 py-14 lg:grid-cols-[1.05fr_0.85fr] lg:items-center lg:gap-14 lg:py-16`}>
          <div className="pt-2">
            <div className="flex items-center gap-3 text-[12px] font-semibold text-[#667085]" style={fadeUpStyle(isReady, 0)}>
              <Link href="/" className="hover:text-[#ff8d28]">Trang chủ</Link>
              <span>|</span>
              <Link href="/services" className="hover:text-[#ff8d28]">Dịch vụ</Link>
              <span>›</span>
              <span>{serviceTitle}</span>
            </div>
            <div className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-[#fcf2e9] px-4 py-1.5 text-[12px] font-extrabold text-[#ff8d28]" style={fadeUpStyle(isReady, 80)}>
              <span>✦</span> Dịch vụ nhiếp ảnh
            </div>
            <h1 className="mt-5 max-w-[15ch] text-[40px] font-black leading-[1.18] text-[#0e111d] sm:text-[48px] lg:text-[56px]" style={fadeUpStyle(isReady, 180)}>
              {serviceTitle}
            </h1>
            <p className="mt-6 max-w-[560px] text-[16px] font-medium leading-[1.7] text-[#4b5563]" style={fadeUpStyle(isReady, 300)}>
              {heroMeta.description}
            </p>
          </div>

          <div className="relative min-h-[430px] lg:min-h-[520px]" style={fadeUpStyle(isReady, 320)}>
            <div className="absolute right-0 top-0 h-[82%] w-[86%] overflow-hidden rounded-[24px] bg-[#eef1f7] shadow-[0_24px_56px_rgba(14,17,29,0.12)]">
              <Image src={heroMeta.image} alt={serviceTitle} fill priority sizes="(max-width: 1023px) 100vw, 560px" className="object-cover" />
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
            <div className="absolute bottom-[10%] left-0 flex w-[min(340px,72%)] items-center gap-4 rounded-2xl border border-[#e8eaf1] bg-white p-4 shadow-[0_18px_42px_rgba(14,17,29,0.12)]">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#fcf2e9] text-[#ff8d28]">✦</div>
              <div>
                <p className="text-[15px] font-black text-[#0e111d]">Listing theo gói</p>
                <p className="mt-1 text-[13px] font-semibold leading-5 text-[#667085]">So sánh giá, add-on và khoảng cách của các gói {serviceTitle.toLowerCase()}.</p>
              </div>
            </div>
            {packages[1]?.image && (
              <div className="absolute bottom-0 right-[8%] w-[42%] overflow-hidden rounded-[18px] border-4 border-white bg-[#eef1f7] shadow-[0_18px_42px_rgba(14,17,29,0.14)]">
                <div className="relative aspect-square">
                  <Image src={packages[1].image} alt="" fill sizes="220px" className="object-cover" />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className={`${containerClass} py-6`}>
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {quickFilters.map((filter) => {
              const active =
                (filter === "Tất cả" && activeRegion === "Tất cả" && activeStyle === "Tất cả") ||
                (filter === "Sài Gòn" && activeRegion === "TP. Hồ Chí Minh") ||
                filter === activeRegion ||
                filter === activeStyle;
              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => handleQuickFilter(filter)}
                  className={`rounded-full px-3 py-1.5 text-[12px] font-semibold leading-none transition ${active ? "bg-[#ff8d28] text-white" : "bg-[#fff4eb] text-[#9a4a00] hover:bg-[#ffe3cc]"}`}
                >
                  {filter}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <TopFilter
              label="Giá"
              value={priceRange}
              options={["Tất cả", "Dưới 1.000.000đ", "1.000.000đ - 2.000.000đ", "2.000.000đ - 3.000.000đ", "Trên 3.000.000đ"]}
              onChange={(v) => { setPriceRange(v); setPage(1); }}
            />
            <TopFilter
              label="Sắp xếp"
              value={sortMode}
              options={["Phổ biến", "Gần nhất", "Giá thấp", "Đánh giá cao"]}
              onChange={setSortMode}
            />
          </div>
        </div>

        {/* Cards */}
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {pagedPackages.map((item, index) => (
            <PortraitResultCard
              key={item.id}
              item={item}
              isReady={isReady}
              revealDelay={120 + index * 90}
              serviceSlug={serviceSlug}
            />
          ))}
        </div>

        {pagedPackages.length === 0 && (
          <div className="mt-6 rounded-2xl border border-[#e4e7ec] bg-white px-6 py-12 text-center">
            <p className="text-[18px] font-black text-[#0e111d]">Không có gói phù hợp.</p>
            <p className="mt-2 text-[14px] font-semibold text-[#667085]">Hãy đổi khu vực, phong cách hoặc khoảng giá.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="grid h-10 w-10 place-items-center rounded-full border border-[#d0d5dd] bg-white text-[14px] font-black text-[#475467] disabled:opacity-40"
            >
              &lt;
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i + 1}
                type="button"
                onClick={() => setPage(i + 1)}
                className={`grid h-10 min-w-10 place-items-center rounded-full px-3 text-[13px] font-black ${safePage === i + 1 ? "bg-[#ff8d28] text-white" : "border border-[#d0d5dd] bg-white text-[#475467]"}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="grid h-10 w-10 place-items-center rounded-full border border-[#d0d5dd] bg-white text-[14px] font-black text-[#475467] disabled:opacity-40"
            >
              &gt;
            </button>
          </div>
        )}
      </section>

      {/* Other services */}
      <section className={`${containerClass} pb-14`}>
        <h2 className="text-[20px] font-black text-[#0e111d]">Dịch vụ khác</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {serviceCategories
            .filter((s) => s.slug !== serviceSlug)
            .map((s) => (
              <Link
                key={s.slug}
                href={`/services/${s.slug}`}
                className="rounded-full border border-[#e8eaf1] bg-white px-4 py-2 text-[13px] font-bold text-[#0e111d] transition hover:border-[#ff8d28] hover:text-[#ff8d28]"
              >
                {s.title}
              </Link>
            ))}
        </div>
      </section>
    </main>
  );
}

function TopFilter({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  const selectWidth = label === "Giá" ? "w-[132px] sm:w-[188px]" : "w-[112px] sm:w-[132px]";

  return (
    <div className="flex h-10 items-center gap-2 rounded-full border border-[#e5e7ef] bg-white px-2.5 shadow-sm">
      <span className="shrink-0 whitespace-nowrap text-[10px] font-black uppercase leading-none tracking-wide text-[#98a2b3]">{label}:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${selectWidth} !min-h-0 !border-0 !bg-transparent !p-0 text-[12px] font-bold leading-none text-[#0e111d] outline-none !shadow-none`}
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function PortraitResultCard({
  isReady,
  item,
  revealDelay,
  serviceSlug,
}: {
  isReady: boolean;
  item: ServicePackage;
  revealDelay: number;
  serviceSlug: ServiceSlug;
}) {
  const detailRows = [
    item.duration,
    item.price <= 1300000 ? "15 ảnh chỉnh sửa" : item.price <= 1800000 ? "30 ảnh chỉnh sửa" : "40 ảnh chỉnh sửa",
    item.price <= 1600000 ? "Giao ảnh trong 2 ngày" : item.price <= 2500000 ? "Giao ảnh trong 3 ngày" : "Giao ảnh trong 5 ngày",
  ];

  return (
    <article
      style={fadeUpStyle(isReady, revealDelay)}
      className="overflow-hidden rounded-2xl bg-white shadow-[0_12px_30px_rgba(14,17,29,0.07)]"
    >
      <div className="relative aspect-[16/11] bg-[#eef1f7]">
        <Image src={item.image} alt={item.packageName} fill sizes="(max-width: 1023px) 100vw, 420px" className="object-cover" />
        {item.verified && (
          <span className="absolute left-3 top-3 rounded-full bg-[#ff8d28] px-3 py-1.5 text-[10px] font-black text-white">PRO</span>
        )}
        <span className={`absolute ${item.verified ? "left-3 top-11" : "left-3 top-3"} rounded-full bg-black/60 px-3 py-1.5 text-[11px] font-black text-white`}>
          ★ {item.rating.toFixed(1)} ({item.reviewCount})
        </span>
        <button type="button" className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white/80 text-[#667085] backdrop-blur">
          ♡
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 px-4 pt-3">
        {[item.image, ...item.portfolioImages].slice(0, 3).map((img, i) => (
          <span key={i} className="relative block aspect-[4/3] overflow-hidden rounded-xl bg-[#eef1f7]">
            <Image src={img} alt="" fill sizes="100px" className="object-cover" />
          </span>
        ))}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[20px] font-black leading-tight text-[#0e111d]">{item.photographerName}</h3>
            <p className="mt-1 text-[13px] font-bold text-[#ff8d28]">{item.packageName}</p>
            {/* <p className="mt-1 flex items-center gap-1 text-[12px] font-medium text-[#344054]">
             {item.location} ({item.distanceKm.toFixed(1)}km)
            </p> */}
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[15px] font-black text-[#ff8d28]">Từ {formatVnd(item.price).replace(" VND", "đ")}</p>
             <p className="mt-1 flex items-center gap-1 text-[12px] font-medium text-[#344054]">
             {item.location} ({item.distanceKm.toFixed(1)}km)
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {item.addOns.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-md bg-[#fff4eb] px-3 py-1.5 text-[11px] font-semibold text-[#9a4a00]">{tag}</span>
          ))}
        </div>

        <div className="mt-4 grid gap-1.5 rounded-xl bg-[#fff7ef] p-3">
          {detailRows.map((row) => (
            <span key={row} className="flex items-center gap-2 text-[12px] font-medium text-[#344054]">
              ✓ {row}
            </span>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Link
            href={`/photographer-profile?id=${item.photographerId}`}
            className="rounded-lg border border-[#d0d5dd] bg-white px-3 py-2.5 text-center text-[12px] font-black text-[#0e111d] transition hover:border-[#ffcfaa] hover:text-[#ff8d28]"
          >
            Xem profile
          </Link>
          <Link
            href={`/booking?photographer=${item.photographerId}&service=${encodeURIComponent(serviceSlug)}`}
            className="rounded-lg bg-[#ff8d28] px-3 py-2.5 text-center text-[12px] font-black text-white shadow-[0_10px_22px_rgba(255,141,40,0.2)] transition hover:bg-[#e0751b]"
          >
            Xem gói dịch vụ
          </Link>
        </div>
      </div>
    </article>
  );
}
