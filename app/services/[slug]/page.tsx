"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { allAddOns, formatVnd, getServiceBySlug, servicePackages, type ServicePackage, type ServiceSlug } from "../service-data-fresh";

const containerClass = "mx-auto w-full max-w-[1440px] px-6 md:px-12 lg:px-20";
const pageSize = 2;

type SortMode = "nearest" | "rating" | "priceLow" | "soonest";

function fadeUpStyle(isReady: boolean, delay = 0): CSSProperties {
  return {
    opacity: isReady ? 1 : 0,
    transform: isReady ? "translate3d(0, 0, 0)" : "translate3d(0, 22px, 0)",
    transition:
      "opacity 850ms cubic-bezier(0.16, 1, 0.3, 1), transform 850ms cubic-bezier(0.16, 1, 0.3, 1)",
    transitionDelay: `${delay}ms`,
    willChange: isReady ? "auto" : "opacity, transform",
  };
}

function safePageKey(...parts: Array<string | number>) {
  return parts.join("|");
}

export default function ServiceDetailPage() {
  const params = useParams<{ slug: string }>();
  const service = getServiceBySlug(params.slug);
  const [sortMode, setSortMode] = useState<SortMode>("nearest");
  const [maxPrice, setMaxPrice] = useState(15000000);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const packages = useMemo(() => {
    if (!service) {
      return [];
    }

    const filtered = servicePackages.filter((item) => {
      const sameService = item.serviceSlug === service.slug;
      const inBudget = item.price <= maxPrice;
      const hasAddOns = selectedAddOns.every((addOn) => item.addOns.includes(addOn));

      return sameService && inBudget && hasAddOns;
    });

    return [...filtered].sort((a, b) => {
      if (sortMode === "rating") return b.rating - a.rating;
      if (sortMode === "priceLow") return a.price - b.price;
      if (sortMode === "soonest") return a.nextSlot.localeCompare(b.nextSlot);
      return a.distanceKm - b.distanceKm;
    });
  }, [maxPrice, selectedAddOns, service, sortMode]);

  const totalPages = Math.max(1, Math.ceil(packages.length / pageSize));
  const visiblePackages = packages.slice((page - 1) * pageSize, page * pageSize);

  const toggleAddOn = (addOn: string) => {
    setPage(1);
    setSelectedAddOns((current) =>
      current.includes(addOn) ? current.filter((item) => item !== addOn) : [...current, addOn],
    );
  };

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

  return (
    <ServiceListingPage
      packages={servicePackages.filter((item) => item.serviceSlug === service.slug)}
      serviceTitle={service.title}
      serviceSlug={service.slug}
    />
  );

  // return (
  //   <main className="min-h-screen bg-[#fafbfc] text-[#0e111d]">
  //     <section className="bg-[#0e111d]">
  //       <div className={`${containerClass} grid gap-10 py-12 lg:grid-cols-[minmax(0,0.86fr)_minmax(360px,0.7fr)] lg:items-center lg:py-16`}>
  //         <div>
  //           <Link href="/services" className="text-[13px] font-extrabold text-[#ff8d28]">
  //             Dịch vụ
  //           </Link>
  //           <p className="mt-6 text-[12px] font-black uppercase tracking-[0.18em] text-[#ff8d28]">
  //             {service.eyebrow}
  //           </p>
  //           <h1 className="mt-3 text-[40px] font-black leading-[1.05] text-white sm:text-[56px]">
  //             {service.title}
  //           </h1>
  //           <p className="mt-5 max-w-[680px] text-[16px] font-medium leading-7 text-slate-300">
  //             {service.longDescription}
  //           </p>
  //           <div className="mt-7 grid max-w-[620px] gap-3 sm:grid-cols-3">
  //             <Metric label="Giá từ" value={service.startingPrice} />
  //             <Metric label="Mạng lưới" value={service.photographerCount} />
  //             <Metric label="Phong cách" value={service.mood} />
  //           </div>
  //           <div className="mt-7 flex flex-wrap gap-2">
  //             {service.tags.map((tag) => (
  //               <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[12px] font-bold text-slate-200">
  //                 {tag}
  //               </span>
  //             ))}
  //           </div>
  //         </div>

  //         <div className="relative min-h-[360px]">
  //           <div className="absolute inset-y-7 left-0 right-10 overflow-hidden rounded-[28px] bg-[#1f2430] shadow-[0_24px_70px_rgba(0,0,0,0.24)]">
  //             <Image src={service.heroImage} alt={service.title} fill priority sizes="(max-width: 1023px) 100vw, 560px" className="object-cover" />
  //           </div>
  //           <div className="absolute bottom-0 right-0 h-[44%] w-[42%] overflow-hidden rounded-2xl border-4 border-[#0e111d] bg-white shadow-[0_18px_46px_rgba(0,0,0,0.24)]">
  //             <Image src={service.accentImage} alt="" fill sizes="220px" className="object-cover" />
  //           </div>
  //         </div>
  //       </div>
  //     </section>

  //     <section className={`${containerClass} grid gap-6 py-10 lg:grid-cols-[300px_minmax(0,1fr)] lg:py-12`}>
  //       <aside className="h-fit rounded-2xl border border-[#e5e7ef] bg-white p-5 shadow-[0_16px_42px_rgba(14,17,29,0.045)] lg:sticky lg:top-[112px]">
  //         <div className="flex items-center justify-between gap-3">
  //           <h2 className="text-[20px] font-black text-[#0e111d]">Bộ lọc</h2>
  //           <button
  //             type="button"
  //             onClick={() => {
  //               setSelectedAddOns([]);
  //               setMaxPrice(15000000);
  //               setSortMode("nearest");
  //               setPage(1);
  //             }}
  //             className="text-[12px] font-extrabold text-[#ff8d28]"
  //           >
  //             Xóa lọc
  //           </button>
  //         </div>

  //         <div className="mt-6 grid gap-6">
  //           <label className="grid gap-3">
  //             <span className="text-[13px] font-black text-[#0e111d]">Khoảng giá tối đa</span>
  //             <input
  //               type="range"
  //               min={1000000}
  //               max={15000000}
  //               step={500000}
  //               value={maxPrice}
  //               onChange={(event) => {
  //                 setMaxPrice(Number(event.target.value));
  //                 setPage(1);
  //               }}
  //               className="h-6 min-h-0 border-0 p-0 accent-[#ff8d28]"
  //             />
  //             <span className="text-[13px] font-extrabold text-[#ff8d28]">{formatVnd(maxPrice)}</span>
  //           </label>

  //           <div>
  //             <p className="text-[13px] font-black text-[#0e111d]">Dịch vụ đi kèm</p>
  //             <div className="mt-3 grid gap-2">
  //               {allAddOns.map((addOn) => {
  //                 const active = selectedAddOns.includes(addOn);

  //                 return (
  //                   <button
  //                     key={addOn}
  //                     type="button"
  //                     onClick={() => toggleAddOn(addOn)}
  //                     className="flex items-center gap-3 rounded-xl border border-[#e5e7ef] bg-[#fafbfc] px-3 py-2.5 text-left text-[13px] font-bold text-[#475467] transition hover:border-[#ffcfaa]"
  //                     aria-pressed={active}
  //                   >
  //                     <span className={`grid h-5 w-5 place-items-center rounded-md border ${active ? "border-[#ff8d28] bg-[#ff8d28] text-white" : "border-[#d0d5dd] bg-white text-transparent"}`}>
  //                       <CheckIcon />
  //                     </span>
  //                     {addOn}
  //                   </button>
  //                 );
  //               })}
  //             </div>
  //           </div>
  //         </div>
  //       </aside>

  //       <section className="min-w-0">
  //         <div className="flex flex-col gap-4 rounded-2xl border border-[#e5e7ef] bg-white p-5 shadow-[0_16px_42px_rgba(14,17,29,0.045)] sm:flex-row sm:items-center sm:justify-between">
  //           <div>
  //             <p className="text-[12px] font-black uppercase tracking-[0.16em] text-[#ff8d28]">
  //               {packages.length} gói phù hợp
  //             </p>
  //             <h2 className="mt-1 text-[24px] font-black text-[#0e111d]">
  //               Gói {service.title.toLowerCase()} gần bạn
  //             </h2>
  //           </div>
  //           <div className="grid gap-2 sm:min-w-[220px]">
  //             <label className="text-[12px] font-black text-[#667085]" htmlFor="sort-service-packages">
  //               Sắp xếp
  //             </label>
  //             <select
  //               id="sort-service-packages"
  //               value={sortMode}
  //               onChange={(event) => {
  //                 setSortMode(event.target.value as SortMode);
  //                 setPage(1);
  //               }}
  //               className="min-h-11 rounded-xl border border-[#e5e7ef] bg-[#fafbfc] px-3 text-[14px] font-bold text-[#0e111d]"
  //             >
  //               <option value="nearest">Gần nhất</option>
  //               <option value="rating">Đánh giá cao</option>
  //               <option value="priceLow">Giá thấp trước</option>
  //               <option value="soonest">Lịch gần nhất</option>
  //             </select>
  //           </div>
  //         </div>

  //         <div className="mt-6 grid gap-5">
  //           {visiblePackages.map((item) => (
  //             <article key={item.id} className="grid overflow-hidden rounded-2xl border border-[#e5e7ef] bg-white shadow-[0_16px_42px_rgba(14,17,29,0.045)] md:grid-cols-[280px_minmax(0,1fr)]">
  //               <div className="relative min-h-[240px] bg-[#eef1f7]">
  //                 <Image src={item.image} alt={item.packageName} fill sizes="(max-width: 767px) 100vw, 280px" className="object-cover" />
  //                 {item.verified ? (
  //                   <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-black text-[#ff8d28]">
  //                     Đã xác minh
  //                   </span>
  //                 ) : null}
  //               </div>

  //               <div className="grid gap-5 p-5">
  //                 <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
  //                   <div>
  //                     <p className="text-[13px] font-extrabold text-[#667085]">{item.photographerName}</p>
  //                     <h3 className="mt-1 text-[24px] font-black leading-tight text-[#0e111d]">
  //                       {item.packageName}
  //                     </h3>
  //                     <div className="mt-3 flex flex-wrap gap-2 text-[12px] font-bold text-[#667085]">
  //                       <span>{item.location}</span>
  //                       <span>•</span>
  //                       <span className="text-[#ff8d28]">Cách bạn {item.distanceKm.toFixed(1)} km</span>
  //                       <span>•</span>
  //                       <span>{item.rating.toFixed(1)} sao ({item.reviewCount})</span>
  //                     </div>
  //                   </div>
  //                   <div className="lg:text-right">
  //                     <p className="text-[12px] font-black uppercase tracking-[0.12em] text-[#98a2b3]">Giá từ</p>
  //                     <p className="mt-1 text-[24px] font-black text-[#ff8d28]">{formatVnd(item.price)}</p>
  //                   </div>
  //                 </div>

  //                 <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
  //                   <InfoPill label="Thời lượng" value={item.duration} />
  //                   <InfoPill label="Lịch gần nhất" value={item.nextSlot} />
  //                   <InfoPill label="Dịch vụ" value={service.shortTitle} />
  //                 </div>

  //                 <div className="flex flex-wrap gap-2">
  //                   {item.addOns.map((addOn) => (
  //                     <span key={addOn} className="rounded-full bg-[#fff4eb] px-3 py-1.5 text-[12px] font-extrabold text-[#ff8d28]">
  //                       {addOn}
  //                     </span>
  //                   ))}
  //                 </div>

  //                 <div className="flex flex-col gap-3 border-t border-[#f0f2f6] pt-5 sm:flex-row sm:items-center sm:justify-between">
  //                   <div className="flex items-center">
  //                     {item.portfolioImages.map((image) => (
  //                       <Image
  //                         key={image}
  //                         src={image}
  //                         alt=""
  //                         width={40}
  //                         height={40}
  //                         className="-ml-2 h-10 w-10 rounded-lg border-2 border-white object-cover first:ml-0"
  //                       />
  //                     ))}
  //                   </div>
  //                   <div className="grid gap-2 sm:grid-cols-2">
  //                     <Link href={`/photographer-profile?id=${item.photographerId}`} className="rounded-lg border border-[#d0d5dd] bg-white px-4 py-2.5 text-center text-[13px] font-black text-[#344054] transition hover:border-[#ffcfaa] hover:text-[#ff8d28]">
  //                       Xem chi tiết
  //                     </Link>
  //                     <Link href={`/booking?photographer=${item.photographerId}&service=${encodeURIComponent(service.title)}`} className="rounded-lg bg-[#ff8d28] px-4 py-2.5 text-center text-[13px] font-black text-white shadow-[0_8px_18px_rgba(255,141,40,0.16)] transition hover:bg-[#e0751b]">
  //                       Đặt lịch
  //                     </Link>
  //                   </div>
  //                 </div>
  //               </div>
  //             </article>
  //           ))}
  //         </div>

  //         {visiblePackages.length === 0 ? (
  //           <div className="mt-6 rounded-2xl border border-[#e5e7ef] bg-white px-6 py-12 text-center">
  //             <p className="text-[18px] font-black text-[#0e111d]">Chưa có gói phù hợp bộ lọc.</p>
  //             <p className="mt-2 text-[14px] font-semibold text-[#667085]">Hãy bỏ bớt add-on hoặc tăng khoảng giá để xem thêm lựa chọn.</p>
  //           </div>
  //         ) : null}

  //         <div className="mt-8 flex items-center justify-center gap-2">
  //           <button
  //             type="button"
  //             onClick={() => setPage((current) => Math.max(1, current - 1))}
  //             className="grid h-10 w-10 place-items-center rounded-full border border-[#d0d5dd] bg-white text-[14px] font-black text-[#475467]"
  //             aria-label="Trang trước"
  //           >
  //             &lt;
  //           </button>
  //           {Array.from({ length: totalPages }).map((_, index) => {
  //             const pageNumber = index + 1;

  //             return (
  //               <button
  //                 key={pageNumber}
  //                 type="button"
  //                 onClick={() => setPage(pageNumber)}
  //                 className={`grid h-10 min-w-10 place-items-center rounded-full px-3 text-[13px] font-black ${page === pageNumber ? "bg-[#ff8d28] text-white" : "border border-[#d0d5dd] bg-white text-[#475467]"}`}
  //               >
  //                 {pageNumber}
  //               </button>
  //             );
  //           })}
  //           <button
  //             type="button"
  //             onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
  //             className="grid h-10 w-10 place-items-center rounded-full border border-[#d0d5dd] bg-white text-[14px] font-black text-[#475467]"
  //             aria-label="Trang sau"
  //           >
  //             &gt;
  //           </button>
  //         </div>
  //       </section>
  //     </section>
  //   </main>
  // );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">{label}</p>
      <p className="mt-1 text-[15px] font-black leading-5 text-white">{value}</p>
    </div>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#e5e7ef] bg-[#fafbfc] px-4 py-3">
      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#98a2b3]">{label}</p>
      <p className="mt-1 text-[13px] font-black text-[#0e111d]">{value}</p>
    </div>
  );
}

const portraitStyles = [
  {
    name: "Cinematic",
    count: "128 photographer",
    image:
      "https://i.pinimg.com/1200x/40/7d/bc/407dbcc049319e116fe6667e0ffd8552.jpg",
  },
  {
    name: "Hàn Quốc",
    count: "96 photographer",
    image:
      "https://i.pinimg.com/736x/5e/8d/27/5e8d272394e7c994a87322c6679221eb.jpg",
  },
  {
    name: "Tự nhiên",
    count: "112 photographer",
    image:
      "https://i.pinimg.com/736x/af/f4/95/aff49527301b29ba577e1fad9be256be.jpg",
  },
  {
    name: "Vintage",
    count: "58 photographer",
    image:
      "https://i.pinimg.com/736x/2a/38/a5/2a38a5a6170d922d03cbb410db4f5409.jpg",
  },
  {
    name: "Minimalist",
    count: "74 photographer",
    image:
      "https://i.pinimg.com/1200x/c7/f9/1c/c7f91ceb6242dd1b2e29a2bf217ac6f2.jpg",
  },
];

const regionFilters = [
  { label: "Tất cả", count: "" },
  { label: "TP. Hồ Chí Minh", count: "87" },
  { label: "Hà Nội", count: "56" },
  { label: "Đà Nẵng", count: "28" },
  { label: "Đà Lạt", count: "24" },
  { label: "Khác", count: "17" },
];

const styleFilters = [
  { label: "Tất cả", count: "" },
  { label: "Cinematic", count: "68" },
  { label: "Hàn Quốc", count: "53" },
  { label: "Tự nhiên", count: "72" },
  { label: "Vintage", count: "31" },
  { label: "Film", count: "44" },
];

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
  const [ratingFilter, setRatingFilter] = useState("Tất cả");
  const [sortMode, setSortMode] = useState("Phổ biến");
  const [page, setPage] = useState(1);
  const [isReady, setIsReady] = useState(false);
  const portraitPageSize = 4;

  useEffect(() => {
    setIsReady(false);
    const timer = window.setTimeout(() => setIsReady(true), 80);
    return () => window.clearTimeout(timer);
  }, [serviceSlug, safePageKey(activeRegion, activeStyle, priceRange, ratingFilter, sortMode, page)]);

  const filteredPackages = useMemo(() => {
    return packages.filter((item) => {
      const regionMatched = activeRegion === "Tất cả" || item.location.includes(activeRegion.replace("TP. ", ""));
      const styleMatched = activeStyle === "Tất cả" || item.addOns.includes(activeStyle) || item.packageName.includes(activeStyle);
      const ratingMatched =
        ratingFilter === "Tất cả" ||
        (ratingFilter === "4.9 trở lên" && item.rating >= 4.9) ||
        (ratingFilter === "4.8 trở lên" && item.rating >= 4.8) ||
        (ratingFilter === "4.7 trở lên" && item.rating >= 4.7);

      if (priceRange === "Dưới 1.000.000đ" && item.price >= 1000000) return false;
      if (priceRange === "1.000.000đ - 2.000.000đ" && (item.price < 1000000 || item.price > 2000000)) return false;
      if (priceRange === "2.000.000đ - 3.000.000đ" && (item.price < 2000000 || item.price > 3000000)) return false;
      if (priceRange === "Trên 3.000.000đ" && item.price <= 3000000) return false;

      return regionMatched && styleMatched && ratingMatched;
    }).sort((a, b) => {
      if (sortMode === "Gần nhất") return a.distanceKm - b.distanceKm;
      if (sortMode === "Giá thấp") return a.price - b.price;
      if (sortMode === "Đánh giá cao") return b.rating - a.rating;
      return b.reviewCount - a.reviewCount;
    });
  }, [activeRegion, activeStyle, packages, priceRange, ratingFilter, sortMode]);

  const totalPortraitPages = Math.max(1, Math.ceil(filteredPackages.length / portraitPageSize));
  const safePortraitPage = Math.min(page, totalPortraitPages);
  const pagedPackages = filteredPackages.slice(
    (safePortraitPage - 1) * portraitPageSize,
    safePortraitPage * portraitPageSize,
  );
  const quickFilters =
    serviceSlug === "wedding"
      ? ["Tất cả", "Sài Gòn", "Hà Nội", "Đà Nẵng", "Đà Lạt", "Makeup", "Album", "Flycam"]
      : serviceSlug === "couple"
        ? ["Tất cả", "Sài Gòn", "Hà Nội", "Đà Nẵng", "Đà Lạt", "Ngoại cảnh", "Studio"]
        : serviceSlug === "portrait"
          ? ["Tất cả", "Sài Gòn", "Hà Nội", "Đà Nẵng", "Đà Lạt", "Tạo dáng", "Studio"]
          : serviceSlug === "event"
            ? ["Tất cả", "Sài Gòn", "Hà Nội", "Đà Nẵng", "Đà Lạt", "Video", "Flycam", "Phóng sự"]
            : serviceSlug === "yearbook"
              ? ["Tất cả", "Sài Gòn", "Hà Nội", "Đà Nẵng", "Đà Lạt", "Concept", "Studio", "Tốt nghiệp"]
              : serviceSlug === "travel"
                ? ["Tất cả", "Sài Gòn", "Hà Nội", "Đà Nẵng", "Đà Lạt", "Ngoại cảnh", "Lifestyle", "Phiêu lưu"]
                : ["Tất cả", "Sài Gòn", "Hà Nội", "Đà Nẵng", "Đà Lạt", "Studio", "Retouch", "Food"];
  const heroMeta =
    serviceSlug === "wedding"
      ? {
          image: "https://i.pinimg.com/736x/e1/a8/16/e1a816d82b5a387c8a3a7e2318f87133.jpg",
          description:
            "Lưu giữ ngày trọng đại với các gói pre-wedding, phóng sự cưới và album được cá nhân hóa theo câu chuyện của hai bạn.",
        }
      : serviceSlug === "couple"
        ? {
            image: "https://i.pinimg.com/736x/f1/b3/a7/f1b3a74c133b8060f9e4935865dae3c0.jpg",
            description:
              "Ghi lại câu chuyện của hai bạn qua những khung hình tự nhiên, gần gũi và giàu cảm xúc.",
          }
        : serviceSlug === "portrait"
          ? {
              image: "https://i.pinimg.com/736x/35/5e/45/355e4567ee65e77e43be0d243510572b.jpg",
              description:
                "Ghi lại những khoảnh khắc chân thật và tôn vinh cá tính của bạn với những bức ảnh chuyên nghiệp và đầy cảm xúc.",
            }
          : serviceSlug === "event"
            ? {
                image: "https://i.pinimg.com/736x/15/22/8e/15228e2e02b9b54d2d43b36b978e7c6f.jpg",
                description:
                  "Ghi lại mọi diễn biến của sự kiện với phong cách reportage, ánh sáng chuyên nghiệp và cảm xúc tự nhiên.",
              }
            : serviceSlug === "yearbook"
              ? {
                  image: "https://i.pinimg.com/736x/5c/82/6b/5c826b21c75a6f577065a52be5b7f103.jpg",
                  description:
                    "Tạo album kỷ yếu đa dạng và tràn đầy thanh xuân với những bức ảnh cá tính cho bạn và nhóm bạn.",
                }
              : serviceSlug === "travel"
                ? {
                    image: "https://i.pinimg.com/736x/b8/b7/75/b8b7756b9c6b2f19024f9f7ec3de540a.jpg",
                    description:
                      "Đồng hành cùng bạn trong chuyến đi để ghi lại cảnh đẹp và khoảnh khắc du lịch thật tự nhiên.",
                  }
                : {
                    image: "https://i.pinimg.com/736x/bf/2f/5d/bf2f5d6c8c2d0477c3ae6b0135360d6c.jpg",
                    description:
                      "Tôn vinh món ăn qua ánh sáng, bố cục và bố cục chi tiết, phù hợp cho menu và thương hiệu ẩm thực.",
                  };

  const handleQuickFilter = (filter: string) => {
    setActiveRegion(filter === "Sài Gòn" ? "TP. Hồ Chí Minh" : ["Hà Nội", "Đà Nẵng", "Đà Lạt"].includes(filter) ? filter : "Tất cả");
    setActiveStyle(
      filter === "Ngoại cảnh"
        ? "Tự nhiên"
        : filter === "Phóng sự"
          ? "Video"
          : filter === "Tốt nghiệp"
            ? "Concept"
            : filter === "Lifestyle"
              ? "Tự nhiên"
              : filter === "Phiêu lưu"
                ? "Tự nhiên"
                : filter === "Food"
                  ? "Studio"
                  : ["Studio", "Makeup", "Album", "Flycam", "Tạo dáng"].includes(filter)
                    ? filter
                    : "Tất cả",
    );
    setPage(1);
  };

  return (
    <main className="min-h-screen bg-[#fbfcff] text-[#0e111d]">
      <section className="w-full overflow-hidden bg-white">
        <div className={`${containerClass} grid gap-10 py-14 lg:grid-cols-[1.05fr_0.85fr] lg:items-center lg:gap-14 lg:py-16`}>
          <div className="pt-2">
            <div
              className="flex items-center gap-3 text-[12px] font-semibold text-[#667085]"
              style={fadeUpStyle(isReady, 0)}
            >
              <HomeIcon className="h-4 w-4 text-[#0e111d]" />
              <span>|</span>
              <Link href="/services" className="hover:text-[#ff8d28]">Dịch vụ</Link>
              <span>›</span>
              <span>{serviceTitle}</span>
            </div>
            <div
              className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-[#fcf2e9] px-4 py-1.5 text-[12px] font-extrabold text-[#ff8d28]"
              style={fadeUpStyle(isReady, 80)}
            >
              <span className="grid h-4 w-4 place-items-center">✦</span>
              Dịch vụ nhiếp ảnh
            </div>
            <h1
              className="mt-5 max-w-[15ch] text-[40px] font-black leading-[1.18] tracking-normal text-[#0e111d] sm:text-[48px] md:text-[54px] lg:text-[56px] xl:text-[64px]"
              style={fadeUpStyle(isReady, 180)}
            >
              {serviceTitle}
            </h1>
            <p
              className="mt-6 max-w-[560px] text-[16px] font-medium leading-[1.7] text-[#4b5563] sm:text-[17px] md:text-[18px]"
              style={fadeUpStyle(isReady, 300)}
            >
              {heroMeta.description}
            </p>
            <div
              className="mt-7 flex flex-wrap gap-x-7 gap-y-3 text-[13px] font-bold text-[#1f2937]"
              style={fadeUpStyle(isReady, 420)}
            >
              <FeatureItem icon={<ShieldIcon />} label="Nhiều phong cách" />
              <FeatureItem icon={<SparkIcon />} label="Photographer chuyên nghiệp" />
              <FeatureItem icon={<BadgeIcon />} label="Giá cả minh bạch" />
              <FeatureItem icon={<CalendarIcon />} label="Đặt lịch dễ dàng" />
            </div>
          </div>

          <div className="relative min-h-[430px] lg:min-h-[520px]" style={fadeUpStyle(isReady, 320)}>
            <div className="absolute right-0 top-0 h-[82%] w-[86%] overflow-hidden rounded-[24px] bg-[#eef1f7] shadow-[0_24px_56px_rgba(14,17,29,0.12)] ring-1 ring-black/5">
              <Image
                src={heroMeta.image}
                alt={serviceTitle}
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
                  So sánh giá, add-on và khoảng cách của các gói {serviceTitle.toLowerCase()}.
                </p>
              </div>
            </div>
            <div className="absolute bottom-0 right-[8%] w-[42%] overflow-hidden rounded-[18px] border-4 border-white bg-[#eef1f7] shadow-[0_18px_42px_rgba(14,17,29,0.14)]">
              <div className="relative aspect-square">
                <Image
                  src={packages[1]?.image || heroMeta.image}
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

      <section className={`${containerClass} py-6`}>
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {quickFilters.map((filter) => {
              const active =
                (filter === "Tất cả" && activeRegion === "Tất cả" && activeStyle === "Tất cả") ||
                (filter === "Sài Gòn" && activeRegion === "TP. Hồ Chí Minh") ||
                (filter === activeRegion) ||
                (filter === "Ngoại cảnh" && activeStyle === "Tự nhiên") ||
                (filter === activeStyle);

              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => handleQuickFilter(filter)}
                  className={`rounded-full px-3 py-1.5 text-[12px] font-semibold leading-none transition ${
                    active ? "bg-[#ff8d28] text-white" : "bg-[#fff4eb] text-[#9a4a00] hover:bg-[#ffe3cc]"
                  }`}
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
              onChange={(value) => {
                setPriceRange(value);
                setPage(1);
              }}
            />
            <TopFilter
              label="Sắp xếp"
              value={sortMode}
              options={["Phổ biến", "Gần nhất", "Giá thấp", "Đánh giá cao"]}
              onChange={(value) => setSortMode(value)}
            />
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {pagedPackages.map((item, index) => (
            <PortraitResultCard
              item={item}
              key={item.id}
              isReady={isReady}
              revealDelay={120 + index * 90}
              serviceTitle={serviceTitle}
            />
          ))}
        </div>
        {pagedPackages.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-[#e4e7ec] bg-white px-6 py-12 text-center">
            <p className="text-[18px] font-black text-[#0e111d]">Không có photographer phù hợp.</p>
            <p className="mt-2 text-[14px] font-semibold text-[#667085]">Hãy đổi khu vực, phong cách, khoảng giá hoặc đánh giá.</p>
          </div>
        ) : null}

        <Pagination page={safePortraitPage} totalPages={totalPortraitPages} onPageChange={setPage} />
      </section>

      <section className={`${containerClass} pb-12`}>
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-[22px] font-black text-[#0e111d]">Gợi ý phong cách phổ biến cho {serviceTitle.toLowerCase()}</h2>
          <button type="button" className="text-[13px] font-bold text-[#ff8d28]">
            Xem tất cả
          </button>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {portraitStyles.map((style, index) => (
            <button
              key={style.name}
              type="button"
              data-reveal
              data-reveal-delay={`${180 + index * 70}`}
              style={fadeUpStyle(isReady, 220 + index * 70)}
              className="grid min-h-[94px] grid-cols-[92px_minmax(0,1fr)] overflow-hidden rounded-xl border border-[#edf0f5] bg-[#f7f7fb] text-left shadow-[0_10px_28px_rgba(14,17,29,0.045)] transition hover:-translate-y-0.5 hover:border-[#ffcfaa]"
            >
              <span className="relative block">
                <Image src={style.image} alt={style.name} fill sizes="92px" className="object-cover" />
              </span>
              <span className="grid content-center px-4">
                <span className="text-[15px] font-black text-[#0e111d]">{style.name}</span>
                <span className="mt-2 text-[13px] font-semibold text-[#1f2937]">{style.count}</span>
              </span>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}

function PortraitResultCard({
  isReady,
  item,
  revealDelay,
  serviceTitle,
}: {
  isReady: boolean;
  item: ServicePackage;
  revealDelay: number;
  serviceTitle: string;
}) {
  const detailRows = [
    item.duration.includes("90") ? "90 phút chụp" : item.duration,
    item.price <= 1300000 ? "15 ảnh chỉnh sửa" : item.price <= 1800000 ? "30 ảnh chỉnh sửa" : "40 ảnh chỉnh sửa",
    item.price <= 1600000 ? "Giao ảnh trong 2 ngày" : item.price <= 2500000 ? "Giao ảnh trong 3 ngày" : "Giao ảnh trong 5 ngày",
  ];

  return (
    <article
      data-reveal
      data-reveal-delay={`${revealDelay}`}
      style={fadeUpStyle(isReady, revealDelay)}
      className="overflow-hidden rounded-2xl bg-white shadow-[0_12px_30px_rgba(14,17,29,0.07)]"
    >
      <div className="relative aspect-[16/11] bg-[#eef1f7]">
        <Image src={item.image} alt={item.photographerName} fill sizes="(max-width: 1023px) 100vw, 420px" className="object-cover" />
        {item.verified ? (
          <span className="absolute left-3 top-3 rounded-full bg-[#ff8d28] px-3 py-1.5 text-[10px] font-black text-white">PRO</span>
        ) : null}
        <span className={`absolute ${item.verified ? "left-3 top-11" : "left-3 top-3"} rounded-full bg-black/60 px-3 py-1.5 text-[11px] font-black text-white`}>
          ★ {item.rating.toFixed(1)} ({item.reviewCount})
        </span>
        <button type="button" className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white/80 text-[#667085] backdrop-blur">
          <HeartIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 px-4 pt-3">
        {[item.image, ...item.portfolioImages].slice(0, 3).map((image) => (
          <span className="relative block aspect-[4/3] overflow-hidden rounded-xl bg-[#eef1f7]" key={image}>
            <Image src={image} alt="" fill sizes="100px" className="object-cover" />
          </span>
        ))}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[20px] font-black leading-tight text-[#0e111d]">{item.photographerName}</h3>
            <p className="mt-2 flex items-center gap-2 text-[12px] font-medium text-[#344054]">
              <PinIcon className="h-4 w-4 text-[#ff8d28]" />
              {item.location} ({item.distanceKm.toFixed(1)}km)
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[15px] font-black text-[#ff8d28]">Từ {formatVnd(item.price).replace(" VND", "đ")}</p>
            <p className="mt-1 text-[11px] font-medium text-[#667085]">{item.price > 2000000 ? "4 năm" : item.price > 1500000 ? "3 năm" : "5 năm"} kinh nghiệm</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {item.addOns.slice(0, 3).map((tag) => (
            <span className="rounded-md bg-[#fff4eb] px-3 py-1.5 text-[11px] font-semibold text-[#9a4a00]" key={tag}>
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-5 grid gap-2 rounded-xl bg-[#fff7ef] p-3">
          <span className="flex items-center gap-3 text-[12px] font-medium text-[#344054]">
            <ClockIcon className="h-4 w-4 text-[#ff8d28]" />
            Nhận lịch trong {Math.max(1, Math.round(item.distanceKm / 3))} ngày tới
          </span>
          {detailRows.map((row) => (
            <span className="flex items-center gap-3 text-[12px] font-medium text-[#344054]" key={row}>
              <SmallCheckIcon className="h-4 w-4 shrink-0 text-[#ff8d28]" />
              {row}
            </span>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Link href={`/photographer-profile?id=${item.photographerId}`} className="rounded-lg border border-[#d0d5dd] bg-white px-3 py-2.5 text-center text-[12px] font-black text-[#0e111d] transition hover:border-[#ffcfaa] hover:text-[#ff8d28]">
            Xem profile
          </Link>
          <Link href={`/booking?photographer=${item.photographerId}&service=${encodeURIComponent(serviceTitle)}`} className="rounded-lg bg-[#ff8d28] px-3 py-2.5 text-center text-[12px] font-black text-white shadow-[0_10px_22px_rgba(255,141,40,0.2)] transition hover:bg-[#e0751b]">
            Xem gói dịch vụ
          </Link>
        </div>
      </div>
    </article>
  );
}

function TopFilter({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: string[];
  value: string;
}) {
  return (
    <details className="group relative w-full sm:w-[154px]">
      <summary className="flex h-9 cursor-pointer list-none items-center justify-between gap-2 rounded-lg border border-[#e1e5ec] bg-white px-3 text-[12px] font-semibold text-[#101828] shadow-[0_6px_18px_rgba(14,17,29,0.04)] outline-none transition hover:border-[#ffcfaa] focus-visible:border-[#ff8d28] focus-visible:ring-2 focus-visible:ring-[#ff8d28]/10 [&::-webkit-details-marker]:hidden">
        <span className="min-w-0 truncate">
          {label}: {value}
        </span>
        <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[#fff4eb] text-[#ff8d28] transition group-open:rotate-180">
          <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3 w-3" fill="none">
            <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </summary>

      <div className="absolute right-0 z-30 mt-2 w-[210px] overflow-hidden rounded-xl border border-[#edf0f5] bg-white p-1.5 shadow-[0_18px_42px_rgba(14,17,29,0.14)]">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={(event) => {
              onChange(option);
              event.currentTarget.closest("details")?.removeAttribute("open");
            }}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[12px] font-semibold transition ${
              option === value ? "bg-[#fff4eb] text-[#ff8d28]" : "text-[#344054] hover:bg-[#faf7f4] hover:text-[#0e111d]"
            }`}
          >
            <span>{option}</span>
            {option === value ? <span className="text-[#ff8d28]">✓</span> : null}
          </button>
        ))}
      </div>
    </details>
  );
}

function Pagination({
  onPageChange,
  page,
  totalPages,
}: {
  onPageChange: (page: number) => void;
  page: number;
  totalPages: number;
}) {
  const items = Array.from({ length: Math.min(totalPages, 5) }, (_, index) => index + 1);

  return (
    <div className="mt-6 flex items-center justify-center gap-2">
      <button type="button" onClick={() => onPageChange(Math.max(1, page - 1))} className="grid h-9 w-9 place-items-center rounded-full border border-[#d0d5dd] bg-white text-[#667085]">
        ‹
      </button>
      {items.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onPageChange(item)}
          className={`grid h-9 min-w-9 place-items-center rounded-full px-3 text-[13px] font-black ${page === item ? "bg-[#ff8d28] text-white" : "border border-[#d0d5dd] bg-white text-[#475467]"}`}
        >
          {item}
        </button>
      ))}
      {totalPages > 5 ? (
        <>
          <span className="px-2 text-[#667085]">...</span>
          <button type="button" onClick={() => onPageChange(totalPages)} className="grid h-9 min-w-9 place-items-center rounded-full border border-[#d0d5dd] bg-white px-3 text-[13px] font-black text-[#475467]">
            {totalPages}
          </button>
        </>
      ) : null}
      <button type="button" onClick={() => onPageChange(Math.min(totalPages, page + 1))} className="grid h-9 w-9 place-items-center rounded-full border border-[#d0d5dd] bg-white text-[#667085]">
        ›
      </button>
    </div>
  );
}

function FeatureItem({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="grid h-8 w-8 place-items-center rounded-full bg-white/75 text-[#ff8d28]">{icon}</span>
      {label}
    </span>
  );
}

function CheckIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M5 10.3L8.3 13.5L15 6.5" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconPath({ className, d }: { className?: string; d: string }) {
  return (
    <svg className={className || "h-4 w-4"} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d={d} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return <IconPath className={className} d="M3.5 9.2L10 4l6.5 5.2M5.5 8.4V16h9V8.4M8.4 16v-4h3.2v4" />;
}

function CameraIcon({ className }: { className?: string }) {
  return <IconPath className={className} d="M4 7h3l1-2h4l1 2h3v9H4V7zM10 14a2.8 2.8 0 100-5.6 2.8 2.8 0 000 5.6z" />;
}

function ShieldIcon() {
  return <IconPath d="M10 3.5l5 1.8v4.2c0 3.2-2 5.6-5 7-3-1.4-5-3.8-5-7V5.3l5-1.8zM8.2 9.8l1.1 1.1 2.5-2.7" />;
}

function SparkIcon() {
  return <IconPath d="M10 3.5l1.3 4 4.2 1.5-4.2 1.5-1.3 4-1.3-4L4.5 9l4.2-1.5L10 3.5z" />;
}

function BadgeIcon() {
  return <IconPath d="M10 3.5l1.7 1.3 2.1-.1.7 2 1.7 1.3-.8 2 .8 2-1.7 1.3-.7 2-2.1-.1L10 16.5l-1.7-1.3-2.1.1-.7-2L3.8 12l.8-2-.8-2 1.7-1.3.7-2 2.1.1L10 3.5zM8 10l1.4 1.4L12.5 8" />;
}

function CalendarIcon() {
  return <IconPath d="M5 5.5h10v10H5v-10zM7.5 3.5v3M12.5 3.5v3M5 8h10" />;
}

function FilterIcon({ className }: { className?: string }) {
  return <IconPath className={className} d="M4 5h12M6.5 10h7M8.5 15h3" />;
}

function HeartIcon({ className }: { className?: string }) {
  return <IconPath className={className} d="M10 16s-6-3.5-6-8a3 3 0 015.3-1.9L10 7l.7-.9A3 3 0 0116 8c0 4.5-6 8-6 8z" />;
}

function PinIcon({ className }: { className?: string }) {
  return <IconPath className={className} d="M14.5 8.5c0 3-4.5 7.5-4.5 7.5S5.5 11.5 5.5 8.5a4.5 4.5 0 119 0zM10 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />;
}

function ClockIcon({ className }: { className?: string }) {
  return <IconPath className={className} d="M10 4a6 6 0 100 12 6 6 0 000-12zM10 7.5V10l2 1.2" />;
}

function SmallCheckIcon({ className }: { className?: string }) {
  return <IconPath className={className} d="M5 10.3l3 3L15 6.7" />;
}
