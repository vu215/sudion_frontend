"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

const styleOptions = [
  "Chân dung",
  "Thời trang & Biên tập",
  "Cưới & Sự kiện",
  "Sản phẩm & Thương mại",
  "Đời thường & Lifestyle",
];

const tabs = ["Tất cả", "AI đề xuất", "Được yêu thích", "Mới nhất", "Đang trống lịch"];
const locations = ["Ho Chi Minh City, VN", "Đà Lạt, VN", "Hà Nội, VN", "Đà Nẵng, VN", "Huế, VN"];
const tabTextClass = "pb-4 !text-[12px] !font-bold leading-none";

function fadeUpStyle(isReady: boolean, delay = 0): CSSProperties {
  return {
    opacity: isReady ? 1 : 0,
    transform: isReady ? "translate3d(0, 0, 0)" : "translate3d(0, 18px, 0)",
    transition:
      "opacity 850ms cubic-bezier(0.16, 1, 0.3, 1), transform 850ms cubic-bezier(0.16, 1, 0.3, 1)",
    transitionDelay: `${delay}ms`,
    willChange: isReady ? "auto" : "opacity, transform",
  };
}

const photographers = [
  {
    name: "Bình Nguyễn",
    location: "Tp.HCM, Việt Nam",
    rating: "4.9",
    match: "98%",
    price: "2.500.000 VNĐ",
    image:
      "https://images.unsplash.com/photo-1496440737103-cd596325d314?auto=format&fit=crop&w=900&q=85",
    tags: ["Thời trang", "Chân dung", "Biên tập"],
    thumbs: [
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=80&q=80",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=80&q=80",
    ],
    extra: "+12",
    verified: true,
  },
  {
    name: "Hào Lê",
    location: "Đà Lạt , Việt Nam",
    rating: "4.8",
    match: "92%",
    price: "5.000.000 VNĐ",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=85",
    tags: ["Cưới", "Cặp đôi"],
    thumbs: [
      "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=80&q=80",
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=80&q=80",
    ],
    extra: "+24",
    verified: true,
  },
  {
    name: "Studio K",
    location: "Hà nội, Việt Nam",
    rating: "4.7",
    match: "88%",
    price: "1.800.000 VNĐ",
    image:
      "https://images.unsplash.com/photo-1595425964071-2c1ec7c88201?auto=format&fit=crop&w=900&q=85",
    tags: ["Sản phẩm", "Thương mại"],
    thumbs: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=80&q=80",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=80&q=80",
    ],
    extra: "+8",
    verified: false,
  },
  {
    name: "Hưng Trịnh",
    location: "Vĩnh Long, Việt Nam",
    rating: "4.9",
    match: "98%",
    price: "2.500.000 VNĐ",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=85",
    tags: ["Thời trang", "Chân dung", "Biên tập"],
    thumbs: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80",
    ],
    extra: "+20",
    verified: true,
  },
  {
    name: "Hoàng Anh",
    location: "Đà Nẵng , Việt Nam",
    rating: "4.8",
    match: "92%",
    price: "5.000.000 VNĐ",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=85&sat=-100",
    tags: ["Cưới", "Cặp đôi"],
    thumbs: [
      "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=80&q=80",
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=80&q=80",
    ],
    extra: "+14",
    verified: true,
  },
  {
    name: "Công Tuấn",
    location: "Huế, Việt Nam",
    rating: "4.7",
    match: "88%",
    price: "1.800.000 VNĐ",
    image:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=900&q=85",
    tags: ["Sản phẩm", "Thương mại"],
    thumbs: [
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=80&q=80",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=80&q=80",
    ],
    extra: "+7",
    verified: false,
  },
];

export default function PhotographerPage() {
  const [isReady, setIsReady] = useState(false);
  const [activeTab, setActiveTab] = useState("AI đề xuất");
  const [aiSuggested, setAiSuggested] = useState(true);
  const [location, setLocation] = useState("Ho Chi Minh City, VN");
  const [selectedStyles, setSelectedStyles] = useState<string[]>([
    "Chân dung",
    "Cưới & Sự kiện",
    "Sản phẩm & Thương mại",
  ]);
  const [availability, setAvailability] = useState("Tuần này");
  const [maxPrice, setMaxPrice] = useState(10);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsReady(true), 80);
    return () => window.clearTimeout(timer);
  }, []);

  const visiblePhotographers = useMemo(() => {
    const styleFiltered = photographers.filter((person) => {
      const personLocation = person.location.toLowerCase();
      const cityMatched =
        location === "Ho Chi Minh City, VN" ||
        (location.includes("Đà Lạt") && personLocation.includes("đà lạt")) ||
        (location.includes("Hà Nội") && personLocation.includes("hà nội")) ||
        (location.includes("Đà Nẵng") && personLocation.includes("đà nẵng")) ||
        (location.includes("Huế") && personLocation.includes("huế"));

      if (!cityMatched) {
        return false;
      }

      if (selectedStyles.length === 0) {
        return true;
      }

      return person.tags.some((tag) =>
        selectedStyles.some((style) => style.toLowerCase().includes(tag.toLowerCase())),
      );
    });

    const tabFiltered = styleFiltered.filter((person) => {
      const match = Number(person.match.replace("%", ""));
      const price = Number(person.price.replace(/\D/g, "")) / 1000000;

      if (price > maxPrice) {
        return false;
      }

      if (activeTab === "Được yêu thích") {
        return favorites.includes(person.name);
      }

      if (aiSuggested || activeTab === "AI đề xuất") {
        return match >= 88;
      }

      return true;
    });

    if (activeTab === "Mới nhất") {
      return [...tabFiltered].reverse();
    }

    return tabFiltered;
  }, [activeTab, aiSuggested, favorites, location, maxPrice, selectedStyles]);

  const toggleStyle = (style: string) => {
    setSelectedStyles((current) =>
      current.includes(style)
        ? current.filter((item) => item !== style)
        : [...current, style],
    );
  };

  const clearFilters = () => {
    setSelectedStyles([]);
    setAvailability("");
    setLocation("Ho Chi Minh City, VN");
    setMaxPrice(10);
    setActiveTab("Tất cả");
    setAiSuggested(false);
    setPage(1);
  };

  const toggleFavorite = (name: string) => {
    setFavorites((current) =>
      current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name],
    );
  };

  return (
    <div className="min-h-screen bg-[#faf7ff] text-[#171821]">
      <main className="mx-auto w-full max-w-[1296px] px-5 pb-24 pt-12 sm:px-6 lg:px-0">
        <div className="grid gap-6 md:grid-cols-[288px_minmax(0,1fr)] xl:grid-cols-[312px_minmax(0,1fr)]">
          <FilterSidebar
            availability={availability}
            location={location}
            maxPrice={maxPrice}
            onClear={clearFilters}
            onLocationChange={setLocation}
            onMaxPriceChange={setMaxPrice}
            onStyleToggle={toggleStyle}
            onAvailabilityChange={setAvailability}
            selectedStyles={selectedStyles}
          />

          <section className="min-w-0">
            <div className="flex flex-col gap-5 border-b border-[#e9e3f2] pb-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="min-w-0">
                <h1
                  data-reveal
                  data-reveal-delay="80"
                  className="max-w-[850px] text-[clamp(1.6rem,2.05vw,2.2rem)] font-black leading-[1.08] tracking-normal text-[#14151f] xl:whitespace-nowrap"
                >
                  Khám phá các photographer
                </h1>
                <p
                  data-reveal
                  data-reveal-delay="160"
                  className="mt-2 text-[13px] font-medium leading-6 text-[#5d5b68]"
                >
                  Tìm kiếm góc nhìn hoàn hảo cho tầm nhìn của bạn.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAiSuggested((value) => !value)}
                data-reveal
                data-reveal-delay="240"
                className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-[#f0d9c9] bg-white px-3 py-2 text-[11px] font-bold text-[#4a4350] shadow-[0_8px_20px_rgba(31,24,43,0.06)] xl:mb-6 xl:mr-8"
                aria-pressed={aiSuggested}
              >
                <SparkIcon className="h-4 w-4 text-[#ff8d28]" />
                Đề xuất của AI
                <span
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    aiSuggested ? "bg-[#ff8d28]" : "bg-[#d8d3e4]"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${
                      aiSuggested ? "right-1" : "right-6"
                    }`}
                  />
                </span>
              </button>
            </div>

            <div className="flex flex-wrap gap-8 border-b border-[#e9e3f2] pt-5">
              {tabs.map((tab, index) => (
                <button
                  type="button"
                  key={tab}
                  style={fadeUpStyle(isReady, 240 + index * 70)}
                  onClick={() => {
                    setActiveTab(tab);
                    setPage(1);
                  }}
                  className={`${tabTextClass} ${
                    tab === activeTab
                      ? "border-b-2 border-[#ff8d28] text-[#ff8d28]"
                      : "border-b-2 border-transparent text-[#414350]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {visiblePhotographers.map((person, index) => (
                <PhotographerCard
                  aiSuggested={aiSuggested}
                  isFavorite={favorites.includes(person.name)}
                  isReady={isReady}
                  key={person.name}
                  onFavoriteToggle={toggleFavorite}
                  person={person}
                  index={index}
                />
              ))}
            </div>
            {visiblePhotographers.length === 0 ? (
              <div className="mt-8 rounded-2xl border border-[#ebe6f1] bg-white px-6 py-10 text-center text-[12px] font-semibold text-[#6b6878]">
                Không có photographer phù hợp với bộ lọc hiện tại.
              </div>
            ) : null}

            <Pagination activePage={page} onPageChange={setPage} />
          </section>
        </div>
      </main>
    </div>
  );
}

function FilterSidebar({
  availability,
  location,
  maxPrice,
  onAvailabilityChange,
  onClear,
  onLocationChange,
  onMaxPriceChange,
  onStyleToggle,
  selectedStyles,
}: {
  availability: string;
  location: string;
  maxPrice: number;
  onAvailabilityChange: (value: string) => void;
  onClear: () => void;
  onLocationChange: (value: string) => void;
  onMaxPriceChange: (value: number) => void;
  onStyleToggle: (style: string) => void;
  selectedStyles: string[];
}) {
  return (
    <aside
      data-reveal
      data-reveal-delay="0"
      className={`${inter.className} rounded-[18px] border border-[#e5deed] bg-white px-5 py-7 shadow-[0_16px_42px_rgba(42,32,62,0.045)] md:sticky md:top-[112px] md:self-start xl:px-6`}
    >
      <div className="flex items-center justify-between">
        <h2 className="!text-[24px] !font-bold leading-none text-[#24242d]">Bộ lọc</h2>
        <button type="button" onClick={onClear} className="!text-[14px] !font-normal text-[#858091]">
          Xóa tất cả
        </button>
      </div>

      <div className="mt-9 space-y-8">
        <div>
          <p className="mb-3 !text-[16px] !font-bold leading-none text-[#252631]">Địa điểm</p>
          <div className="relative flex h-[42px] w-full items-center rounded-[8px] border border-[#d8d3ea] bg-[#f7f4ff] px-3.5 text-[12px] font-medium text-[#4f4d5c]">
            <span className="flex min-w-0 items-center gap-3">
              <PinIcon className="h-[18px] w-[18px] shrink-0 text-[#b8b1ca]" />
              <select
                aria-label="Địa điểm"
                className="!h-auto !min-h-0 w-full appearance-none !border-0 !bg-transparent !p-0 !text-[14px] !font-normal text-[#4f4d5c] !shadow-none outline-none"
                onChange={(event) => onLocationChange(event.target.value)}
                value={location}
              >
                {locations.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </span>
            <ChevronDownIcon className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 shrink-0 -translate-y-1/2 text-[#b8b1ca]" />
          </div>
        </div>

        <div>
          <p className="mb-4 !text-[16px] !font-bold leading-none text-[#252631]">Phong cách chụp</p>
          <div className="space-y-[13px]">
            {styleOptions.map((option) => {
              const checked = selectedStyles.includes(option);
              return (
              <button
                key={option}
                type="button"
                onClick={() => onStyleToggle(option)}
                className="flex w-full items-center gap-3 text-left !text-[12px] !font-normal leading-none text-[#5c5b68]"
                aria-pressed={checked}
              >
                <span
                  className={`grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[4px] border ${
                    checked
                      ? "border-[#ff8d28] bg-[#ff8d28] text-white"
                      : "border-[#d3cee0] bg-white text-transparent"
                  }`}
                >
                  <CheckIcon className="h-3.5 w-3.5" />
                </span>
                <span>{option}</span>
              </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="!text-[16px] !font-bold leading-none text-[#252631]">Khoảng giá</p>
            <p className="whitespace-nowrap !text-[10px] !font-medium text-[#ff7d1a]">
              1 Triệu - {maxPrice} Triệu
            </p>
          </div>
          <input
            aria-label="Khoảng giá tối đa"
            className="h-7 !min-h-0 w-full !border-0 !bg-transparent !p-0 !shadow-none accent-[#ff8d28]"
            max={100}
            min={1}
            onChange={(event) => onMaxPriceChange(Number(event.target.value))}
            type="range"
            value={maxPrice}
          />
        </div>

        <div>
          <p className="mb-3 !text-[16px] !font-bold leading-none text-[#252631]">Thời gian sẵn sàng</p>
          <div className="flex flex-wrap gap-3">
            {["Tuần này", "Cuối tuần", "Tháng tới"].map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => onAvailabilityChange(item)}
                className={`h-[34px] rounded-full border px-4 !text-[12px] !font-semibold ${
                  item === availability
                    ? "border-[#ff8d28] bg-[#fff4eb] text-[#ff7d1a]"
                    : "border-[#d9d4e4] bg-white text-[#5d5c68]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M5 10.4L8.3 13.5L15 6.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PhotographerCard({
  aiSuggested,
  isFavorite,
  isReady,
  onFavoriteToggle,
  person,
  index,
}: {
  aiSuggested: boolean;
  isFavorite: boolean;
  isReady: boolean;
  onFavoriteToggle: (name: string) => void;
  person: (typeof photographers)[number];
  index: number;
}) {
  return (
    <article
      style={fadeUpStyle(isReady, 340 + index * 90)}
      className="group overflow-hidden rounded-2xl border border-[#ebe6f1] bg-white shadow-[0_12px_32px_rgba(45,35,70,0.04)]"
    >
      <div className="relative h-[220px] overflow-hidden bg-[#eeeaf5]">
        <img src={person.image} alt={person.name} className="h-full w-full object-cover" />
        {aiSuggested ? (
          <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-[#ffb06a] px-3 py-1.5 text-xs font-extrabold text-white">
            <SparkIcon className="h-3.5 w-3.5" />
            AI Match {person.match}
          </span>
        ) : null}
        <button
          type="button"
          onClick={() => onFavoriteToggle(person.name)}
          className={`absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/90 shadow-sm opacity-0 transition-all duration-200 translate-y-1 group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100 ${
            isFavorite ? "text-[#ff8d28]" : "text-[#414350]"
          }`}
          aria-pressed={isFavorite}
        >
          <HeartIcon className="h-5 w-5" filled={isFavorite} />
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="flex items-center gap-2 text-[20px] font-black leading-[1.15] text-[#1f2029]">
              {person.name}
              {person.verified ? <VerifyIcon className="h-6 w-6 text-[#1687ff]" /> : null}
            </h3>
            <p className="mt-2 flex items-center gap-1 text-[14px] font-medium leading-none text-[#575966]">
              <PinIcon className="h-4 w-4" />
              {person.location}
            </p>
          </div>
          <div className="mt-1 flex items-center gap-1 text-[13px] font-black leading-none text-[#1f2029]">
            <StarIcon className="h-6 w-6 text-[#c55c11]" />
            {person.rating}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {person.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-[#f0eefb] px-3 py-1 text-[10px] font-bold text-[#747084]">
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-end justify-between border-t border-[#eeeaf4] pt-4">
          <div>
            <p className="text-[11px] font-semibold leading-none text-[#74737e]">Chỉ từ</p>
            <p className="mt-2 text-[20px] font-black leading-none text-[#ff7518]">{person.price}</p>
          </div>
          <div className="flex items-center">
            {person.thumbs.map((thumb) => (
              <img
                key={thumb}
                src={thumb}
                alt=""
                className="-ml-2 h-8 w-8 rounded-md border-2 border-white object-cover first:ml-0"
              />
            ))}
            <span className="-ml-2 grid h-8 min-w-9 place-items-center rounded-md border-2 border-white bg-[#f0eefb] px-2 text-xs font-black text-[#6d687b]">
              {person.extra}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

function Pagination({
  activePage,
  onPageChange,
}: {
  activePage: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <nav data-reveal data-reveal-delay="180" className="mt-24 flex items-center justify-center gap-3" aria-label="Pagination">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, activePage - 1))}
        className="grid h-9 w-9 place-items-center rounded-full border border-[#ddd8e8] bg-white text-[#6c6878]"
      >
        <ChevronLeftIcon className="h-4 w-4" />
      </button>
      {["1", "2", "3", "...", "12"].map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => item !== "..." && onPageChange(Number(item))}
          className={`grid h-9 min-w-9 place-items-center rounded-full px-3 text-xs font-black ${
            item === String(activePage)
              ? "bg-[#ff8d28] text-white"
              : item === "..."
                ? "bg-transparent text-[#6c6878]"
                : "border border-[#ddd8e8] bg-white text-[#20212b]"
          }`}
        >
          {item}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onPageChange(Math.min(12, activePage + 1))}
        className="grid h-9 w-9 place-items-center rounded-full border border-[#ddd8e8] bg-white text-[#6c6878]"
      >
        <ChevronRightIcon className="h-4 w-4" />
      </button>
    </nav>
  );
}

function SparkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 2.5L11.7 7.7L17 10L11.7 12.3L10 17.5L8.3 12.3L3 10L8.3 7.7L10 2.5Z" fill="currentColor" />
    </svg>
  );
}

function PinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M15 8.4C15 11.9 10 16.2 10 16.2S5 11.9 5 8.4a5 5 0 1110 0z" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="10" cy="8.4" r="1.6" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M12.5 5L7.5 10L12.5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HeartIcon({ className, filled }: { className?: string; filled?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 16.5S3.5 12.7 3.5 7.8A3.3 3.3 0 019.2 5.5L10 6.4l.8-.9a3.3 3.3 0 015.7 2.3c0 4.9-6.5 8.7-6.5 8.7z" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M10 2.8l1.9 4 4.4.6-3.2 3.1.8 4.4-3.9-2.1-3.9 2.1.8-4.4-3.2-3.1 4.4-.6 1.9-4z" />
    </svg>
  );
}

function VerifyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M10 1.8l2 1.5 2.5-.1.7 2.4 2 1.5-.9 2.4.9 2.4-2 1.5-.7 2.4-2.5-.1-2 1.5-2-1.5-2.5.1-.7-2.4-2-1.5.9-2.4-.9-2.4 2-1.5.7-2.4 2.5.1 2-1.5z" />
      <path d="M7.3 10.1l1.8 1.8 3.8-4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}
