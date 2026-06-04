"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Inter } from "next/font/google";
import Link from "next/link";

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

const tabs = ["Tất cả", "AI đề xuất", "Photo ở gần bạn", "Được yêu thích", "Mới nhất", "Đang trống lịch"];
const locations = ["Ho Chi Minh City, VN", "Đà Lạt, VN", "Hà Nội, VN", "Đà Nẵng, VN", "Huế, VN"];
const tabTextClass = "pb-4 !text-[12px] !font-bold leading-none";

const shootLocationOptions = [
  {
    id: "current",
    label: "Vị trí hiện tại",
    query: "photographer studio near me",
  },
  {
    id: "doi-co-hong-da-lat",
    label: "Đồi cỏ hồng Đà Lạt",
    query: "photographer studio near Đồi cỏ hồng Đà Lạt",
    coordinates: { lat: 12.0138, lng: 108.4242 },
  },
  {
    id: "ho-xuan-huong",
    label: "Hồ Xuân Hương, Đà Lạt",
    query: "photographer studio near Hồ Xuân Hương Đà Lạt",
    coordinates: { lat: 11.9417, lng: 108.4383 },
  },
  {
    id: "cho-da-lat",
    label: "Chợ Đà Lạt",
    query: "photographer studio near Chợ Đà Lạt",
    coordinates: { lat: 11.9404, lng: 108.4373 },
  },
  {
    id: "da-nang-beach",
    label: "Bãi biển Mỹ Khê, Đà Nẵng",
    query: "photographer studio near Mỹ Khê Đà Nẵng",
    coordinates: { lat: 16.0616, lng: 108.2478 },
  },
];

type Coordinates = {
  lat: number;
  lng: number;
};

function getDistanceKm(from: Coordinates, to: Coordinates) {
  const earthRadius = 6371;
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const fromLat = (from.lat * Math.PI) / 180;
  const toLat = (to.lat * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(fromLat) * Math.cos(toLat) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

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
    id: "binh-nguyen",
    name: "Bình Nguyễn",
    location: "Tp.HCM, Việt Nam",
    city: "Ho Chi Minh City, VN",
    coordinates: { lat: 10.7758, lng: 106.7009 },
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
    availability: ["Tuần này", "Cuối tuần"],
    addOns: ["makeup", "video", "album", "retouch"],
  },
  {
    id: "hao-le",
    name: "Hào Lê",
    location: "Đà Lạt , Việt Nam",
    city: "Đà Lạt, VN",
    coordinates: { lat: 11.9404, lng: 108.4583 },
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
    availability: ["Cuối tuần", "Tháng tới"],
    addOns: ["makeup", "video", "flycam", "album"],
  },
  {
    id: "studio-k",
    name: "Studio K",
    location: "Hà nội, Việt Nam",
    city: "Hà Nội, VN",
    coordinates: { lat: 21.0278, lng: 105.8342 },
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
    availability: ["Tuần này", "Tháng tới"],
    addOns: ["retouch", "stylist"],
  },
  {
    id: "hung-trinh",
    name: "Hưng Trịnh",
    location: "Vĩnh Long, Việt Nam",
    city: "Ho Chi Minh City, VN",
    coordinates: { lat: 10.2537, lng: 105.9722 },
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
    availability: ["Tuần này"],
    addOns: ["makeup", "retouch", "stylist"],
  },
  {
    id: "hoang-anh",
    name: "Hoàng Anh",
    location: "Đà Nẵng , Việt Nam",
    city: "Đà Nẵng, VN",
    coordinates: { lat: 16.0544, lng: 108.2022 },
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
    availability: ["Cuối tuần"],
    addOns: ["makeup", "video", "flycam"],
  },
  {
    id: "cong-tuan",
    name: "Công Tuấn",
    location: "Huế, Việt Nam",
    city: "Huế, VN",
    coordinates: { lat: 16.4637, lng: 107.5909 },
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
    availability: ["Tháng tới"],
    addOns: ["retouch", "album"],
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
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [nearbyEnabled, setNearbyEnabled] = useState(false);
  const [shootLocationId, setShootLocationId] = useState("current");
  const [customShootLocation, setCustomShootLocation] = useState("");
  const [locationMessage, setLocationMessage] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsReady(true), 80);
    return () => window.clearTimeout(timer);
  }, []);

  const visiblePhotographers = useMemo(() => {
    const styleFiltered = photographers.filter((person) => {
      const cityMatched = person.city === location;

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

      if (availability && !person.availability.includes(availability)) {
        return false;
      }

      if (activeTab === "Đang trống lịch" && !person.availability.includes("Tuần này")) {
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
  }, [activeTab, aiSuggested, availability, favorites, location, maxPrice, selectedStyles]);

  const nearbyPhotographers = useMemo(() => {
    const selectedShootLocation = shootLocationOptions.find((item) => item.id === shootLocationId);
    const targetLocation =
      shootLocationId === "custom"
        ? null
        : shootLocationId === "current"
        ? userLocation
        : selectedShootLocation?.coordinates || null;

    if (!targetLocation) {
      return photographers.filter((person) => person.city === location);
    }

    return [...photographers]
      .map((person) => ({
        ...person,
        distanceKm: getDistanceKm(targetLocation, person.coordinates),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 6);
  }, [location, shootLocationId, userLocation]);

  const displayedPhotographers =
    activeTab === "Photo ở gần bạn" ? nearbyPhotographers : visiblePhotographers;

  const getDisplayDistance = (person: (typeof displayedPhotographers)[number]) => {
    if (activeTab !== "Photo ở gần bạn") {
      return nearbyEnabled && userLocation
        ? getDistanceKm(userLocation, person.coordinates)
        : undefined;
    }

    return "distanceKm" in person
      ? (person as (typeof photographers)[number] & { distanceKm: number }).distanceKm
      : undefined;
  };

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
    setNearbyEnabled(false);
    setShootLocationId("current");
    setCustomShootLocation("");
    setLocationMessage("");
    setPage(1);
  };

  const toggleFavorite = (name: string) => {
    setFavorites((current) =>
      current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name],
    );
  };

  const requestNearbyPhotographers = () => {
    if (!navigator.geolocation) {
      setLocationMessage("Trình duyệt chưa hỗ trợ lấy vị trí.");
      return;
    }

    setLocationMessage("Đang lấy vị trí của bạn...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setNearbyEnabled(true);
        setLocationMessage("Đang ưu tiên photographer và studio gần bạn.");
        setPage(1);
      },
      () => {
        setLocationMessage("Không thể lấy vị trí. Bạn có thể chọn địa điểm thủ công.");
      },
      { enableHighAccuracy: true, timeout: 9000 },
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
                    if (tab === "Photo ở gần bạn" && !userLocation) {
                      requestNearbyPhotographers();
                    }
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

            {activeTab === "Photo ở gần bạn" ? (
              <NearbyMapPanel
                isReady={isReady}
                locationMessage={locationMessage}
                nearbyPhotographers={nearbyPhotographers}
                onScan={requestNearbyPhotographers}
                customShootLocation={customShootLocation}
                onCustomShootLocationChange={setCustomShootLocation}
                onShootLocationChange={setShootLocationId}
                shootLocationId={shootLocationId}
                userLocation={userLocation}
              />
            ) : null}

            <div className="mt-8 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {displayedPhotographers.map((person, index) => (
                <PhotographerCard
                  aiSuggested={aiSuggested}
                  isFavorite={favorites.includes(person.name)}
                  isReady={isReady}
                  key={person.name}
                  onFavoriteToggle={toggleFavorite}
                  person={person}
                  distanceKm={getDisplayDistance(person)}
                  distanceLabel={
                    activeTab === "Photo ở gần bạn" && shootLocationId !== "current" && shootLocationId !== "custom"
                      ? "Cách điểm chụp khoảng"
                      : "Cách bạn khoảng"
                  }
                  index={index}
                />
              ))}
            </div>
            {displayedPhotographers.length === 0 ? (
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
  distanceKm,
  distanceLabel,
  isFavorite,
  isReady,
  onFavoriteToggle,
  person,
  index,
}: {
  aiSuggested: boolean;
  distanceKm?: number;
  distanceLabel?: string;
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
            {typeof distanceKm === "number" ? (
              <p className="mt-2 text-[12px] font-extrabold leading-none text-[#ff8d28]">
                {distanceLabel || "Cách bạn khoảng"} {distanceKm.toFixed(1)} km
              </p>
            ) : null}
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

        <div className="mt-3 flex flex-wrap gap-2">
          {person.availability.map((item) => (
            <span key={item} className="rounded-full bg-[#fff4eb] px-3 py-1 text-[10px] font-extrabold text-[#ff7d1a]">
              Trống {item.toLowerCase()}
            </span>
          ))}
        </div>

        <p className="mt-3 text-[11px] font-semibold leading-5 text-[#74737e]">
          Dịch vụ kèm: {person.addOns.join(", ")}
        </p>

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

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link
            href="/profilephotographer"
            className="rounded-lg border border-[#e1dceb] bg-white px-3 py-2.5 text-center text-[12px] font-extrabold text-[#4a4350] transition-colors hover:border-[#ffcfaa] hover:text-[#ff7d1a]"
          >
            Xem hồ sơ
          </Link>
          <Link
            href={`/booking?photographer=${person.id}`}
            className="rounded-lg bg-[#ff8d28] px-3 py-2.5 text-center text-[12px] font-extrabold text-white shadow-[0_8px_18px_rgba(255,141,40,0.14)] transition-all hover:translate-y-[-1px] hover:bg-[#e0751b]"
          >
            Đặt lịch
          </Link>
        </div>
      </div>
    </article>
  );
}

function NearbyMapPanel({
  customShootLocation,
  isReady,
  locationMessage,
  nearbyPhotographers,
  onCustomShootLocationChange,
  onScan,
  onShootLocationChange,
  shootLocationId,
  userLocation,
}: {
  customShootLocation: string;
  isReady: boolean;
  locationMessage: string;
  nearbyPhotographers: (typeof photographers)[number][];
  onCustomShootLocationChange: (value: string) => void;
  onScan: () => void;
  onShootLocationChange: (value: string) => void;
  shootLocationId: string;
  userLocation: Coordinates | null;
}) {
  const selectedShootLocation =
    shootLocationOptions.find((item) => item.id === shootLocationId) ||
    shootLocationOptions[0];
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const locationSearchValue =
    shootLocationId === "custom" ? customShootLocation : selectedShootLocation.label;
  const locationSuggestions = shootLocationOptions.filter((item) =>
    item.label.toLowerCase().includes(locationSearchValue.toLowerCase()),
  );
  const mapCenter =
    selectedShootLocation.coordinates ||
    userLocation ||
    nearbyPhotographers[0]?.coordinates ||
    photographers.find((person) => person.city === "Ho Chi Minh City, VN")?.coordinates ||
    photographers[0].coordinates;
  const mapQuery = encodeURIComponent(
    selectedShootLocation.id === "custom"
      ? `photographer studio near ${customShootLocation || "Da Lat Vietnam"}`
      : selectedShootLocation.id === "current"
      ? userLocation
        ? `photographer studio near ${mapCenter.lat},${mapCenter.lng}`
        : "photographer studio Ho Chi Minh City"
      : selectedShootLocation.query,
  );
  const mapSrc = `https://www.google.com/maps?q=${mapQuery}&z=${selectedShootLocation.id === "current" ? 13 : 14}&output=embed`;

  return (
    <section
      style={fadeUpStyle(isReady, 260)}
      className="mt-6 overflow-hidden rounded-[22px] border border-[#e9e3f2] bg-white shadow-[0_16px_42px_rgba(42,32,62,0.05)]"
    >
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="relative min-h-[340px] overflow-hidden bg-[#eef1f7]">
          <iframe
            title="Google Maps - photographer gần bạn"
            src={mapSrc}
            className="absolute inset-0 h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />

          <div className="pointer-events-none absolute left-5 top-5 rounded-2xl bg-white/95 px-4 py-3 shadow-[0_10px_24px_rgba(31,24,43,0.08)]">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#ff8d28]">
              Google Maps
            </p>
            <p className="mt-1 text-[13px] font-bold text-[#4a4350]">
              {selectedShootLocation.id === "current"
                ? userLocation
                  ? "Đang xem khu vực gần bạn"
                  : "Bản đồ khu vực mặc định"
                : selectedShootLocation.label}
            </p>
          </div>

          <div className="absolute bottom-5 left-5 flex max-w-[calc(100%-40px)] flex-wrap items-center gap-2">
            <label className="relative block">
              <input
                value={locationSearchValue}
                onChange={(event) => {
                  onShootLocationChange("custom");
                  onCustomShootLocationChange(event.target.value);
                  setShowLocationSuggestions(true);
                }}
                onFocus={() => setShowLocationSuggestions(true)}
                placeholder="Nhập nơi sắp chụp"
                className="h-10 min-h-0 w-[280px] rounded-full border border-white/70 bg-white/95 px-4 py-0 text-[12px] font-extrabold text-[#4a4350] shadow-[0_10px_22px_rgba(31,24,43,0.1)] outline-none"
                aria-label="Nhập nơi sắp chụp"
              />
              {showLocationSuggestions ? (
                <div className="absolute bottom-12 left-0 z-20 grid w-[280px] gap-1 rounded-2xl border border-[#eadff0] bg-white p-2 shadow-[0_16px_32px_rgba(31,24,43,0.14)]">
                  {(locationSuggestions.length ? locationSuggestions : shootLocationOptions).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onShootLocationChange(item.id);
                        onCustomShootLocationChange("");
                        setShowLocationSuggestions(false);
                      }}
                      className="rounded-xl px-3 py-2 text-left text-[12px] font-bold text-[#4a4350] transition-colors hover:bg-[#fff4eb] hover:text-[#ff7d1a]"
                    >
                      {item.label}
                    </button>
                  ))}
                  {locationSearchValue && shootLocationId === "custom" ? (
                    <button
                      type="button"
                      onClick={() => setShowLocationSuggestions(false)}
                      className="rounded-xl bg-[#fff4eb] px-3 py-2 text-left text-[12px] font-extrabold text-[#ff7d1a]"
                    >
                      Tìm quanh: {locationSearchValue}
                    </button>
                  ) : null}
                </div>
              ) : null}
            </label>
            {shootLocationId === "current" ? (
              <button
                type="button"
                onClick={onScan}
                className="grid h-10 w-10 place-items-center rounded-full bg-[#ff8d28] text-white shadow-[0_10px_22px_rgba(255,141,40,0.22)] transition-all hover:translate-y-[-1px] hover:bg-[#e0751b]"
                aria-label="Quét vị trí gần tôi"
                title="Quét vị trí gần tôi"
              >
                <LocateIcon className="h-4.5 w-4.5" />
              </button>
            ) : null}
          </div>
        </div>

        <div className="border-t border-[#e9e3f2] p-5 lg:border-l lg:border-t-0">
          <p className="text-[12px] font-black uppercase tracking-[0.16em] text-[#ff8d28]">
            Ở gần bạn
          </p>
          <h2 className="mt-2 text-[22px] font-black leading-tight text-[#1f2029]">
            Photographer & studio gần nhất
          </h2>
          <p className="mt-2 text-[12px] font-semibold leading-5 text-[#6b6878]">
            {selectedShootLocation.id === "current"
              ? locationMessage || "Cho phép trình duyệt lấy vị trí để quét các lựa chọn gần bạn."
              : selectedShootLocation.id === "custom"
                ? `Google Maps đang tìm photographer/studio quanh ${customShootLocation || "địa chỉ bạn nhập"}.`
                : `Đang ưu tiên photographer/studio quanh ${selectedShootLocation.label}.`}
          </p>

          <div className="mt-5 grid gap-3">
            {nearbyPhotographers.slice(0, 4).map((person) => (
              <Link
                key={person.id}
                href={`/booking?photographer=${person.id}`}
                className="flex items-center justify-between gap-3 rounded-[14px] border border-[#ebe6f1] bg-[#faf8ff] px-3 py-3 transition-colors hover:border-[#ffcfaa] hover:bg-[#fff7ef]"
              >
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-black text-[#1f2029]">
                    {person.name}
                  </span>
                  <span className="mt-1 block truncate text-[11px] font-semibold text-[#6b6878]">
                    {person.location}
                  </span>
                </span>
                {userLocation ? (
                  <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[11px] font-extrabold text-[#ff8d28]">
                    {getDistanceKm(userLocation, person.coordinates).toFixed(1)} km
                  </span>
                ) : null}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
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

function LocateIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 3V5M10 15V17M17 10H15M5 10H3" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <circle cx="10" cy="10" r="4.5" stroke="currentColor" strokeWidth="1.9" />
      <circle cx="10" cy="10" r="1.6" fill="currentColor" />
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
