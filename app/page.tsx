"use client";

/* eslint-disable @next/next/no-img-element */
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import Link from "next/link";
import { api } from "@/lib/api";

const assets = {
  photographer: "https://i.pinimg.com/1200x/94/93/63/94936335f2639081d5ab76217e01159e.jpg",
  wedding: "https://i.pinimg.com/1200x/f2/a5/5a/f2a55a5b607de167875d9e3b85668f1a.jpg",
  weddingDetail: "https://i.pinimg.com/736x/c1/1e/62/c11e625dff2d6c16556d4bf313b15bbb.jpg",
  couple: "https://i.pinimg.com/736x/a4/ff/df/a4ffdf7dce679f05f8b0636aef47d43c.jpg",
  coupleDetail: "https://i.pinimg.com/736x/87/28/56/87285639f8ddd169b2e0914c2d09d131.jpg",
  yearbook: "https://i.pinimg.com/1200x/7b/6c/7b/7b6c7b1537a916718a498bc29bbfa2e2.jpg",
  yearbookDetail: "https://i.pinimg.com/736x/35/83/91/358391171213dd117b586f3e948c05fc.jpg",
  event: "https://i.pinimg.com/1200x/7b/c0/52/7bc0529f686c1f7b26f364cf57c57be6.jpg",
  eventDetail: "https://i.pinimg.com/736x/2b/ee/41/2bee41386778a3c1d532ec3e9e3a8829.jpg",
  food: "https://i.pinimg.com/736x/86/20/43/862043dfe5e28d68633eb4290a90d8e1.jpg",
  foodDetail: "https://i.pinimg.com/1200x/3b/a2/c5/3ba2c5ae61f152bde93c84c22cabb7ea.jpg",
  travel: "https://i.pinimg.com/1200x/fb/e6/02/fbe6028082c2a58f3381eceea2b92bc1.jpg",
  travelDetail: "https://i.pinimg.com/1200x/c4/68/6d/c4686d3523a99172767d64f8177e62bd.jpg",
};

const serviceSections = [
  {
    id: "wedding",
    eyebrow: "WEDDING PHOTOGRAPHY",
    title: "Chụp ảnh cưới",
    description:
      "Lưu giữ khoảnh khắc thiêng liêng và cảm xúc chân thật nhất trong ngày trọng đại của bạn.",
    price: "Từ 5.000.000 VND",
    network: "1.200+ Thợ ảnh",
    tags: ["Makeup", "Video", "Flycam", "Album", "Retouching"],
    cta: " Xem chi tiết",
    mainImage: assets.wedding,
    detailImage: assets.weddingDetail,
    badgeTitle: "Top Pick",
    badgeText: "Tỷ lệ match cao",
  },
  {
    id: "couple",
    eyebrow: "COUPLE PHOTOGRAPHY",
    title: "Chụp ảnh đôi",
    description:
      "Kể lại câu chuyện tình yêu của hai bạn qua những khung hình lãng mạn và tự nhiên nhất.",
    price: "Từ 1.500.000 VND",
    network: "850+ Thợ ảnh",
    tags: ["Makeup", "Video", "Flycam", "Album", "Chỉnh sửa"],
    cta: " Xem chi tiết ",
    mainImage: assets.couple,
    detailImage: assets.coupleDetail,
    badgeTitle: "Yêu thích nhất",
    badgeText: "Đánh giá 4.9+",
    reverse: true,
    muted: true,
  },
  {
    id: "yearbook",
    eyebrow: "YEARBOOK PHOTOGRAPHY",
    title: "Chụp kỉ yếu",
    description:
      "Lưu giữ những kỉ niệm rực rỡ của thời học sinh, sinh viên bên bạn bè và thầy cô giáo.",
    price: "Từ 2.000.000 VND",
    network: "640+ Thợ ảnh",
    tags: ["Makeup", "Video", "Flycam", "Album", "Chỉnh sửa"],
    cta: " Xem chi tiết ",
    mainImage: assets.yearbook,
    detailImage: assets.yearbookDetail,
    badgeTitle: "Kỉ yếu trọn gói",
    badgeText: "Nhiều ưu đãi nhóm",
  },
  {
    id: "event",
    eyebrow: "EVENT PHOTOGRAPHY",
    title: "Chụp sự kiện",
    description:
      "Ghi lại mọi khoảnh khắc quan trọng trong các sự kiện doanh nghiệp, hội nghị và tiệc cá nhân.",
    price: "Từ 1.000.000 VND/giờ",
    network: "920+ Thợ ảnh",
    tags: ["Makeup", "Video", "Album", "Chỉnh sửa"],
    cta: " Xem chi tiết",
    mainImage: assets.event,
    detailImage: assets.eventDetail,
    badgeTitle: "Nhận lịch gấp",
    badgeText: "Có mặt trong 2 giờ",
    reverse: true,
    muted: true,
  },
  {
    id: "food",
    eyebrow: "FOOD & PRODUCT",
    title: "Chụp food & product",
    description:
      "Tôn vinh giá trị và vẻ đẹp của món ăn, sản phẩm để thu hút khách hàng từ cái nhìn đầu tiên.",
    price: "Từ 1.200.000 VND/concept",
    network: "450+ Thợ ảnh",
    tags: ["Makeup", "Video", "Flycam", "Album", "Chỉnh sửa"],
    cta: " Xem chi tiết ",
    mainImage: assets.food,
    detailImage: assets.foodDetail,
    badgeTitle: "Stylist chuyên nghiệp",
    badgeText: "Hỗ trợ lên ý tưởng",
  },
  {
    id: "travel",
    eyebrow: "TRAVEL PHOTOGRAPHY",
    title: "Chụp travel",
    description:
      "Lưu lại những kỷ niệm đáng nhớ trong các chuyến hành trình khám phá thế giới đầy màu sắc của bạn.",
    price: "Từ 1.200.000 VND",
    network: "530+ Thợ ảnh",
    tags: ["Makeup", "Video", "Album", "Chỉnh sửa"],
    cta: " Xem chi tiết ",
    mainImage: assets.travel,
    detailImage: assets.travelDetail,
    badgeTitle: "Đặt lịch toàn quốc",
    badgeText: "Hỗ trợ 24/7",
    reverse: true,
    muted: true,
  },
];

const containerClass = "w-full max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20";

function heroRevealStyle(isReady: boolean, delay = 0): CSSProperties {
  return {
    opacity: isReady ? 1 : 0,
    transform: isReady
      ? "translate3d(0, 0, 0) scale(1)"
      : "translate3d(0, 56px, 0) scale(0.96)",
    transition:
      "opacity 1000ms cubic-bezier(0.16, 1, 0.3, 1), transform 1000ms cubic-bezier(0.16, 1, 0.3, 1)",
    transitionDelay: `${delay}ms`,
    willChange: isReady ? "auto" : "opacity, transform",
  };
}

export default function Home() {
  const [banners, setBanners] = useState<any[]>([]);
  const [featuredPhotographers, setFeaturedPhotographers] = useState<any[]>([]);

  useEffect(() => {
    async function loadBanners() {
      try {
        const result = (await api.banners.getActive()) as any;
        if (result.success && result.data) {
          setBanners(result.data);
        }
      } catch (err) {
        console.error("Lỗi load banners:", err);
      }
    }
    async function loadFeatured() {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const res = await fetch(`${API_URL}/photographers/featured?limit=8`);
        const json = await res.json();
        if (json.success && json.data) {
          setFeaturedPhotographers(json.data);
        }
      } catch (err) {
        console.error("Lỗi load featured photographers:", err);
      }
    }
    loadBanners();
    loadFeatured();
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fafbfc] text-[#0e111d] font-sans antialiased selection:bg-[#ff8d28]/20">
      <main className="w-full">
        <HeroSection />

        {banners.length > 0 && <BannerSlider banners={banners} />}

        {featuredPhotographers.length > 0 && (
          <FeaturedPhotographersSection photographers={featuredPhotographers} />
        )}

        <ServicesGrid />
      </main>
    </div>
  );
}

function HeroSection() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsReady(true);
    }, 80);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section className="w-full overflow-hidden bg-white">
      <div
        className={`${containerClass} grid gap-10 py-14 lg:grid-cols-[1.15fr_0.75fr] lg:items-center lg:gap-12 lg:py-16`}
      >
        <div className="pt-2">
          <div
            className="inline-flex items-center gap-1.5 rounded-full bg-[#fcf2e9] px-4 py-1.5 text-[12px] font-extrabold text-[#ff8d28]"
            style={heroRevealStyle(isReady, 0)}
          >
            <SparkGlyph className="h-4 w-4" />
            AI Creative Match
          </div>

          <h1
            className="mt-5 max-w-[12ch] text-[38px] font-black leading-[1.12] tracking-normal text-[#0e111d] sm:max-w-[16ch] sm:text-[46px] md:max-w-[18ch] md:text-[52px] lg:max-w-[760px] lg:text-[58px] xl:text-[64px]"
            style={heroRevealStyle(isReady, 120)}
          >
            Tìm photographer phù hợp cho mọi khoảnh khắc
          </h1>

          <p
            className="mt-6 max-w-[520px] text-[16px] sm:text-[17px] md:text-[18px] leading-[1.7] text-[#4b5563] font-medium"
            style={heroRevealStyle(isReady, 240)}
          >
            Tìm kiếm thông minh và kết nối trực tiếp với hàng ngàn nhiếp ảnh gia
            chuyên nghiệp tại Việt Nam.
          </p>

          <div
            className="mt-7 max-w-[720px]"
            style={heroRevealStyle(isReady, 360)}
          >
            <SearchBar />
          </div>

          <div
            className="mt-10 flex items-start gap-12"
            style={heroRevealStyle(isReady, 480)}
          >
            <Stat value="500+" label="Photographers" />
            <Stat value="10K+" label="Buổi chụp" />
          </div>
        </div>

        <div style={heroRevealStyle(isReady, 320)}>
          <PhotographerCard />
        </div>
      </div>
    </section>
  );
}

function SearchBar() {
  const [service, setService] = useState("Tất cả");
  const [location, setLocation] = useState("Hồ Chí Minh");

  const [date, setDate] = useState(() => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = today.getFullYear();

    return `${day}/${month}/${year}`;
  });

  const serviceOptions = [
    "Tất cả",
    "Chụp ảnh cưới",
    "Chụp ảnh đôi",
    "Chụp kỉ yếu",
    "Chụp sự kiện",
    "Chụp food & product",
    "Chụp travel",
  ];

  const serviceSlugMap: Record<string, string> = {
    "Tất cả": "all",
    "Chụp ảnh cưới": "wedding",
    "Chụp ảnh đôi": "couple",
    "Chụp kỉ yếu": "yearbook",
    "Chụp sự kiện": "event",
    "Chụp food & product": "food",
    "Chụp travel": "travel",
  };

  const locationOptions = [
    "Hồ Chí Minh",
    "Hà Nội",
    "Đà Nẵng",
    "Đà Lạt",
    "Nha Trang",
    "Cần Thơ",
  ];

  const locationMap: Record<string, string> = {
    "Hồ Chí Minh": "Ho Chi Minh City, VN",
    "Hà Nội": "Hà Nội, VN",
    "Đà Nẵng": "Đà Nẵng, VN",
    "Đà Lạt": "Đà Lạt, VN",
    "Nha Trang": "Nha Trang, VN",
    "Cần Thơ": "Cần Thơ, Việt Nam",
  };

  const selectedCategory = serviceSlugMap[service] || "all";
  const selectedLocation = locationMap[location] || location;

  return (
    <div className="rounded-[14px] bg-white/95 p-1.5 shadow-[0_12px_30px_rgba(0,0,0,0.08)] ring-1 ring-black/5">
      <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_112px] lg:items-stretch">
        <SearchSelect
          icon={<CameraGlyph />}
          helper="Dịch vụ chụp"
          options={serviceOptions}
          selected={service}
          onChange={setService}
        />

        <SearchSelect
          icon={<PinGlyph />}
          helper="Địa điểm"
          options={locationOptions}
          selected={location}
          onChange={setLocation}
        />

        <SearchInput
          icon={<CalendarGlyph className="h-8 w-8" />}
          helper="Ngày chụp"
          value={date}
          placeholder={date}
          onChange={setDate}
        />

        <Link
          href={`/photographer?category=${selectedCategory}&location=${encodeURIComponent(
            selectedLocation,
          )}`}
          className="inline-flex min-h-[42px] items-center justify-center rounded-[10px] bg-[#ff8d28] px-4 text-[14px] font-extrabold text-white shadow-[0_8px_18px_rgba(255,141,40,0.22)] transition-all hover:bg-[#e0751b] sm:col-span-2 lg:col-span-1 lg:min-h-full"
        >
          Tìm Kiếm
        </Link>
      </div>
    </div>
  );
}

function SearchSelect({
  icon,
  helper,
  options,
  selected,
  onChange,
}: {
  icon: ReactNode;
  helper: string;
  options: string[];
  selected: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="group !flex min-h-[42px] min-w-0 items-center gap-2 rounded-[10px] px-3 py-1.5 transition-colors hover:bg-[#fff7ef] lg:border-r lg:border-dashed lg:border-[#d9dce6]">
      <span className="grid h-7 w-7 shrink-0 place-items-center text-[#ff8d28]">
        {icon}
      </span>

      <span className="min-w-0 flex-1">
        <select
          value={selected}
          onChange={(event) => onChange(event.target.value)}
          className="block !h-5 !min-h-0 w-full truncate !border-0 bg-transparent !p-0 text-[13px] font-bold leading-4 text-[#0e111d] !shadow-none outline-none"
          aria-label={helper}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <span className="mt-0.5 block truncate text-[11px] font-semibold leading-3 text-[#4b5563]">
          {helper}
        </span>
      </span>
    </label>
  );
}

function SearchInput({
  icon,
  helper,
  value,
  placeholder,
  onChange,
}: {
  icon: ReactNode;
  helper: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="group !flex min-h-[42px] min-w-0 items-center gap-2 rounded-[10px] px-3 py-1.5 transition-colors hover:bg-[#fff7ef] lg:border-r lg:border-dashed lg:border-[#d9dce6]">
      <span className="grid h-7 w-7 shrink-0 place-items-center text-[#ff8d28]">
        {icon}
      </span>

      <span className="min-w-0 flex-1">
        <input
          type="text"
          inputMode="numeric"
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="block !h-4 !min-h-0 w-full !border-0 bg-transparent !p-0 text-[13px] font-bold leading-4 text-[#0e111d] placeholder:text-[#0e111d] !shadow-none outline-none"
          aria-label={helper}
        />

        <span className="mt-0.5 block truncate text-[11px] font-semibold leading-3 text-[#4b5563]">
          {helper}
        </span>
      </span>
    </label>
  );
}

function PhotographerCard() {
  return (
    <div className="relative mx-auto w-full max-w-[360px] pt-2 sm:max-w-[390px] lg:max-w-[410px] lg:pt-0">
      <article className="group ml-auto overflow-hidden rounded-[22px] border border-[#e6e8ef]/80 bg-white shadow-[0_18px_36px_rgba(0,0,0,0.04)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_28px_56px_rgba(0,0,0,0.12)]">
        <div className="aspect-[1.08/1]">
          <img
            src={assets.photographer}
            alt="Đức Anh"
            fetchPriority="high"
            decoding="async"
            className="h-full w-full object-cover transition-all duration-700 ease-out group-hover:scale-110 group-hover:brightness-105"
          />
        </div>

        <div className="-mt-28 bg-gradient-to-t from-[rgba(0,0,0,0.85)] via-[rgba(0,0,0,0.4)] to-transparent px-7 pb-7 pt-24 text-white">
          <h2 className="text-[26px] sm:text-[30px] font-extrabold leading-tight">
            Đức Anh
          </h2>

          <p className="mt-1.5 text-[14px] text-white/80 font-bold">
            Premium Wedding Photographer
          </p>
        </div>
      </article>

      <div className="absolute z-10 bottom-5 -left-4 w-[225px] rounded-[14px] border border-[#e8e9ef]/60 bg-white/95 backdrop-blur-md px-4 py-3 shadow-[0_12px_28px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-3.5">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-[#fcf2e9] shrink-0">
            <SparkGlyph className="h-4.5 w-4.5 text-[#ff8d28]" />
          </div>

          <div>
            <p className="text-[13px] font-extrabold text-[#0e111d]">
              98% Match
            </p>

            <p className="text-[11px] leading-normal text-[#8a8fa1] font-bold mt-0.5">
              Phù hợp phong cách & ngân sách
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ServiceSection({
  id,
  eyebrow,
  title,
  description,
  price,
  network,
  tags,
  cta,
  mainImage,
  detailImage,
  badgeTitle,
  badgeText,
  clusterLabel,
  reverse,
  muted,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  price: string;
  network: string;
  tags: string[];
  cta: string;
  mainImage: string;
  detailImage: string;
  badgeTitle: string;
  badgeText: string;
  clusterLabel?: string;
  reverse?: boolean;
  muted?: boolean;
}) {
  return (
    <section
      className={`w-full ${
        muted ? "bg-[#f8f9fd]" : "bg-white"
      } overflow-hidden`}
    >
      <div
        className={`${containerClass} grid gap-16 py-20 sm:py-24 lg:grid-cols-2 lg:items-center lg:gap-24 lg:py-28`}
      >
        <div className={reverse ? "lg:order-2" : ""}>
          <ServiceCopy
            id={id}
            eyebrow={eyebrow}
            title={title}
            description={description}
            price={price}
            network={network}
            tags={tags}
            cta={cta}
          />
        </div>

        <div className={reverse ? "lg:order-1" : ""}>
          <PhotoCluster
            mainImage={mainImage}
            detailImage={detailImage}
            badgeTitle={badgeTitle}
            badgeText={badgeText}
            clusterLabel={clusterLabel}
            reverse={reverse}
            muted={muted}
          />
        </div>
      </div>
    </section>
  );
}

function ServiceCopy({
  id,
  eyebrow,
  title,
  description,
  price,
  network,
  tags,
  cta,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  price: string;
  network: string;
  tags: string[];
  cta: string;
}) {
  return (
    <div className="max-w-[540px] lg:max-w-none">
      <p
        data-reveal
        data-reveal-delay="0"
        className="text-[11px] sm:text-[12px] font-black uppercase tracking-[0.18em] text-[#ff8d28]"
      >
        {eyebrow}
      </p>

      <h2
        data-reveal
        data-reveal-delay="80"
        className="mt-3 text-[32px] sm:text-[38px] md:text-[42px] lg:text-[46px] font-black leading-[1.08] tracking-[-0.03em] text-[#0e111d]"
      >
        {title}
      </h2>

      <p
        data-reveal
        data-reveal-delay="160"
        className="mt-5 text-[15px] sm:text-[16px] md:text-[17px] leading-[1.7] text-[#4b5563] font-medium"
      >
        {description}
      </p>

      <div
        data-reveal
        data-reveal-delay="240"
        className="mt-8 grid grid-cols-2 gap-5 border-t border-[#f1f3f7] pt-7 max-w-[420px] lg:max-w-none"
      >
        <div>
          <p className="text-[11px] font-bold leading-4 text-[#8a8fa1] uppercase tracking-wider">
            Giá khởi điểm
          </p>

          <p className="mt-1 text-[22px] sm:text-[26px] md:text-[28px] font-extrabold leading-none tracking-[-0.02em] text-[#ff8d28]">
            {price}
          </p>
        </div>

        <div>
          <p className="text-[11px] font-bold leading-4 text-[#8a8fa1] uppercase tracking-wider">
            Mạng lưới
          </p>

          <p className="mt-1 text-[22px] sm:text-[26px] md:text-[28px] font-extrabold leading-none tracking-[-0.02em] text-[#0e111d]">
            {network}
          </p>
        </div>
      </div>

      <div
        data-reveal
        data-reveal-delay="320"
        className="mt-7 flex flex-wrap gap-2.5"
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-[#f0f3fe] px-4 py-2 text-[11px] sm:text-[12px] font-bold text-[#556080]"
          >
            {tag}
          </span>
        ))}
      </div>

      <Link
        data-reveal
        data-reveal-delay="400"
        href={`/photographer?category=${id}`}
        className="mt-8 inline-flex rounded-lg bg-[#ff8d28] hover:bg-[#e0751b] px-7 py-3.5 text-[13px] sm:text-[14px] font-bold text-white shadow-[0_8px_16px_rgba(255,141,40,0.12)] transition-all hover:translate-y-[-1px]"
      >
        {cta}
      </Link>
    </div>
  );
}

function PhotoCluster({
  mainImage,
  detailImage,
  badgeTitle,
  badgeText,
  clusterLabel,
  reverse,
  muted,
}: {
  mainImage: string;
  detailImage: string;
  badgeTitle: string;
  badgeText: string;
  clusterLabel?: string;
  reverse?: boolean;
  muted?: boolean;
}) {
  const clusterRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = clusterRef.current;

    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  const visibleOpacity = isVisible ? 1 : 0;

  const clusterReveal = isVisible
    ? "translate3d(0, 0, 0) scale(1)"
    : "translate3d(0, 72px, 0) scale(0.96)";

  const labelReveal = isVisible
    ? "translateX(-50%) translateY(0) scale(1)"
    : "translateX(-50%) translateY(28px) scale(0.96)";

  const badgeReveal = isVisible
    ? "translateY(0) scale(1)"
    : "translateY(38px) scale(0.96)";

  const mainReveal = isVisible
    ? "translateY(0) scale(1)"
    : "translateY(76px) scale(0.96)";

  const detailReveal = isVisible
    ? "translateY(0) scale(1)"
    : "translateY(92px) scale(0.94)";

  return (
    <div
      ref={clusterRef}
      data-tilt
      className="relative w-full aspect-[1.18/1] max-w-[500px] lg:max-w-[520px] mx-auto select-none group"
      style={{
        opacity: visibleOpacity,
        transform: clusterReveal,
        transition:
          "opacity 1050ms cubic-bezier(0.16, 1, 0.3, 1), transform 1050ms cubic-bezier(0.16, 1, 0.3, 1)",
        willChange: isVisible ? "auto" : "opacity, transform",
      }}
    >
      {clusterLabel ? (
        <p
          className="absolute -top-6 left-1/2 text-[14px] font-bold text-[#ff8d28] tracking-widest z-30 uppercase"
          style={{
            opacity: visibleOpacity,
            transform: labelReveal,
            transition:
              "opacity 850ms cubic-bezier(0.16, 1, 0.3, 1) 100ms, transform 850ms cubic-bezier(0.16, 1, 0.3, 1) 100ms",
          }}
        >
          {clusterLabel}
        </p>
      ) : null}

      <div
        className="absolute z-30 w-[48%] rounded-[12px] border border-[#ececf1] bg-white/95 backdrop-blur px-4 py-3 shadow-[0_10px_25px_rgba(0,0,0,0.05)]"
        style={{
          top: reverse ? "12%" : "12%",
          left: reverse ? "4%" : "18%",
          opacity: visibleOpacity,
          transform: `translate3d(calc(var(--mx, 0) * 28px), calc(var(--my, 0) * 22px), 0) ${badgeReveal}`,
          transition:
            "opacity 1050ms cubic-bezier(0.16, 1, 0.3, 1) 260ms, transform 1050ms cubic-bezier(0.16, 1, 0.3, 1) 260ms",
        }}
      >
        <div className="flex items-center gap-2.5">
          <div className="grid h-7.5 w-7.5 place-items-center rounded-full bg-[#fcf2e9] shrink-0">
            <SparkGlyph className="h-4.5 w-4.5 text-[#ff8d28]" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-[12px] sm:text-[13px] font-extrabold text-[#0e111d] leading-none">
              {badgeTitle}
            </p>

            {badgeText ? (
              <p className="truncate text-[10px] sm:text-[11px] text-[#8a8fa1] mt-1 leading-none font-medium">
                {badgeText}
              </p>
            ) : null}
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
          opacity: visibleOpacity,
          transform: `translate3d(calc(var(--mx, 0) * 8px), calc(var(--my, 0) * 6px), 0) ${mainReveal} ${
            reverse ? "rotate(-1deg)" : "rotate(1deg)"
          }`,
          transition:
            "opacity 1150ms cubic-bezier(0.16, 1, 0.3, 1), transform 1150ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <img
          src={mainImage}
          alt=""
          loading="lazy"
          decoding="async"
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
          opacity: visibleOpacity,
          transform: `translate3d(calc(var(--mx, 0) * -16px), calc(var(--my, 0) * -12px), 0) ${detailReveal} ${
            reverse ? "rotate(2deg)" : "rotate(-2deg)"
          }`,
          transition:
            "opacity 1150ms cubic-bezier(0.16, 1, 0.3, 1) 160ms, transform 1150ms cubic-bezier(0.16, 1, 0.3, 1) 160ms",
        }}
      >
        <img
          src={detailImage}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-[36px] sm:text-[40px] font-black leading-none tracking-[-0.03em] text-[#0e111d]">
        {value}
      </p>

      <p className="mt-2 text-[12px] font-extrabold text-[#8a8fa1] uppercase tracking-wider">
        {label}
      </p>
    </div>
  );
}

function CalendarGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={className || "h-4 w-4"}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M5.5 3V6M14.5 3V6M4 8H16M5 5H15C15.8 5 16.5 5.7 16.5 6.5V15C16.5 15.8 15.8 16.5 15 16.5H5C4.2 16.5 3.5 15.8 3.5 15V6.5C3.5 5.7 4.2 5 5 5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CameraGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={className || "h-8 w-8"}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M6.2 6L7.6 4.3H12.4L13.8 6H15.2C16.1 6 16.8 6.7 16.8 7.6V14.2C16.8 15.1 16.1 15.8 15.2 15.8H4.8C3.9 15.8 3.2 15.1 3.2 14.2V7.6C3.2 6.7 3.9 6 4.8 6H6.2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle cx="10" cy="10.8" r="2.35" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function PinGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={className || "h-8 w-8"}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M15.5 8.4C15.5 12.1 10 16.8 10 16.8S4.5 12.1 4.5 8.4A5.5 5.5 0 1115.5 8.4Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle cx="10" cy="8.4" r="1.8" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function SparkGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M10 2.5L11.9 8.1L17.5 10L11.9 11.9L10 17.5L8.1 11.9L2.5 10L8.1 8.1L10 2.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function FeaturedPhotographersSection({ photographers }: { photographers: any[] }) {
  return (
    <section className="w-full bg-white py-16 lg:py-20 border-b border-[#e8ecf4]">
      <div className="w-full max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#fff7ed] to-[#fef3c7] px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.15em] text-[#f59e0b] mb-3">
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5"><polygon points="10 1 12.6 7.1 19.1 7.6 14.1 11.9 15.5 18.2 10 15 4.5 18.2 5.9 11.9 0.9 7.6 7.4 7.1" /></svg>
              PHOTOGRAPHER NỔI BẬT
            </div>
            <h2 className="text-[28px] sm:text-[34px] font-black tracking-[-0.03em] text-[#0e111d] leading-tight">
              Thợ ảnh đang được quảng cáo
            </h2>
            <p className="mt-2 text-[14px] text-[#4b5563] font-medium max-w-[520px]">
              Những nhiếp ảnh gia chuyên nghiệp đã đăng ký gói nổi bật — ưu tiên hiển thị và được khách hàng tin tưởng.
            </p>
          </div>
          <Link
            href="/photographer"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#e2e8f0] bg-white px-5 py-2.5 text-[13px] font-bold text-[#334155] hover:border-[#ff8d28] hover:text-[#ff8d28] transition-all shrink-0"
          >
            Xem tất cả
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M7 4l6 6-6 6"/></svg>
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {photographers.map((p) => (
            <Link
              key={p.id}
              href={`/photographer/${p.id}`}
              className="group relative overflow-hidden rounded-[20px] border border-[#e8ecf4] bg-white shadow-[0_6px_20px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(0,0,0,0.09)]"
            >
              {/* Avatar / Photo area */}
              <div className="aspect-[1.25/1] overflow-hidden bg-gradient-to-br from-[#f8fafc] to-[#e2e8f0] relative">
                {p.avatar_url ? (
                  <img
                    src={p.avatar_url}
                    alt={p.full_name}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[48px] font-black text-[#cbd5e1]">
                    {p.full_name?.charAt(0) || "?"}
                  </div>
                )}

                {/* Featured badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#f59e0b] to-[#f97316] px-3 py-1 shadow-sm">
                  <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3 text-white"><polygon points="8 1 10 6 15.5 6.5 11.3 10 12.5 15 8 12.5 3.5 15 4.7 10 0.5 6.5 6 6" /></svg>
                  <span className="text-[9px] font-black text-white uppercase tracking-wider">Nổi bật</span>
                </div>

                {/* Rating */}
                {p.avg_rating > 0 && (
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-1 shadow-sm">
                    <svg viewBox="0 0 16 16" fill="#f59e0b" className="h-3 w-3"><polygon points="8 1 10 6 15.5 6.5 11.3 10 12.5 15 8 12.5 3.5 15 4.7 10 0.5 6.5 6 6" /></svg>
                    <span className="text-[11px] font-black text-[#0e111d]">{p.avg_rating.toFixed(1)}</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="text-[15px] font-black text-[#0e111d] truncate">{p.full_name}</h3>
                {p.active_area && (
                  <p className="mt-1 text-[11px] font-semibold text-[#64748b] truncate flex items-center gap-1">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-3 w-3 shrink-0"><path d="M12.5 6.8C12.5 9.8 8 13.5 8 13.5S3.5 9.8 3.5 6.8a4.5 4.5 0 019 0z" strokeLinecap="round" strokeLinejoin="round"/><circle cx="8" cy="6.8" r="1.4"/></svg>
                    {p.active_area}
                  </p>
                )}
                {p.categories && (
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {p.categories.split(", ").slice(0, 2).map((cat: string) => (
                      <span key={cat} className="rounded-full bg-[#f0f3fe] px-2 py-0.5 text-[9px] font-bold text-[#556080]">
                        {cat}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-3 pt-3 border-t border-[#f1f3f7] flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-[#8a8fa1] uppercase tracking-wider block">Từ</span>
                    <span className="text-[14px] font-black text-[#ff8d28]">
                      {p.min_price > 0 ? `${p.min_price.toLocaleString("vi-VN")}đ` : "Liên hệ"}
                    </span>
                  </div>
                  <span className="inline-flex h-8 items-center justify-center rounded-full bg-[#111827] group-hover:bg-[#ff8d28] px-3.5 text-[10px] font-black text-white transition-colors">
                    Xem hồ sơ →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function BannerSlider({ banners }: { banners: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners]);

  if (banners.length === 0) return null;

  const currentBanner = banners[currentIndex];

  return (
    <section className="w-full bg-[#f8fafc] py-8 border-b border-[#e2e8f0]">
      <div className="w-full max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="relative h-[200px] md:h-[260px] w-full overflow-hidden rounded-[24px] shadow-[0_12px_28px_rgba(0,0,0,0.06)] group">
          <Link href={currentBanner.link_url || "/photographer"}>
            <div className="absolute inset-0 bg-black/40 z-10 transition-colors group-hover:bg-black/30" />
            <img
              src={currentBanner.image_url}
              alt={currentBanner.title}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-1000 scale-100 group-hover:scale-105"
            />
            <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 z-20 text-white max-w-[80%]">
              <span className="inline-block rounded-full bg-[#ff8d28] px-3 py-1 text-[10px] font-black uppercase tracking-[0.05em] mb-2.5">
                Quảng cáo tài trợ
              </span>
              <h2 className="text-[18px] md:text-[24px] font-black leading-tight tracking-tight drop-shadow-sm">
                {currentBanner.title}
              </h2>
              <p className="mt-2 text-[12px] text-white/90 font-medium hidden md:block">
                Bấm vào đây để tìm hiểu ngay chương trình của đối tác
              </p>
            </div>
          </Link>

          {banners.length > 1 && (
            <div className="absolute bottom-6 right-6 z-20 flex gap-1.5">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === currentIndex ? "w-5 bg-white" : "w-2 bg-white/50"
                  }`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ServicesGrid() {
  return (
    <section id="services" className="w-full bg-[#f8fafc] py-20 lg:py-24 border-y border-[#e2e8f0]">
      <div className="w-full max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="text-center max-w-[680px] mx-auto mb-16">
          <p className="text-[12px] font-black uppercase tracking-[0.18em] text-[#ff8d28]">
            DỊCH VỤ CỦA CHÚNG TÔI
          </p>
          <h2 className="mt-3 text-[30px] sm:text-[38px] font-black tracking-[-0.03em] text-[#0e111d]">
            Khám phá dịch vụ nhiếp ảnh nổi bật
          </h2>
          <p className="mt-4 text-[15px] leading-[1.7] text-[#4b5563] font-medium">
            Từ những ngày cưới hạnh phúc đến những bộ ảnh kỉ yếu lưu giữ thanh xuân, chúng tôi giúp bạn kết nối với thợ chụp hình ưng ý nhất.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {serviceSections.map((section) => (
            <article key={section.id} className="group overflow-hidden rounded-[22px] border border-[#e8ecf4] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_36px_rgba(0,0,0,0.08)] flex flex-col">
              <div className="aspect-[1.6/1] overflow-hidden relative">
                <img
                  src={section.mainImage}
                  alt={section.title}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute top-4 left-4 rounded-full bg-white/90 backdrop-blur-sm px-3.5 py-1.5 text-[10px] font-black text-[#ff8d28] uppercase tracking-[0.05em] shadow-sm">
                  {section.badgeTitle}
                </span>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-[18px] font-black text-[#0e111d] tracking-tight">{section.title}</h3>
                  <p className="mt-2.5 text-[13px] leading-[1.6] text-[#4b5563] font-medium line-clamp-3">{section.description}</p>
                  
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {section.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="rounded-full bg-[#f0f3fe] px-2.5 py-1 text-[10px] font-bold text-[#556080]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#f1f3f7] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#8a8fa1] uppercase tracking-wider block">Giá khởi điểm</span>
                    <span className="text-[15px] font-black text-[#ff8d28]">{section.price}</span>
                  </div>
                  <Link
                    href={`/photographer?category=${section.id}`}
                    className="inline-flex h-9 items-center justify-center rounded-full bg-[#111827] hover:bg-[#ff8d28] px-4 text-[12px] font-black text-white shadow-sm transition-all"
                  >
                    Xem thợ ảnh →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
