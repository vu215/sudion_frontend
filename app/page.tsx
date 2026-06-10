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

const assets = {
  photographer:
    "https://www.figma.com/api/mcp/asset/6a309021-faab-470e-8eb4-00d9dec71444",
  wedding:
    "https://www.figma.com/api/mcp/asset/562009e6-7e75-4a98-a6fe-5d9cb1e9ea76",
  weddingDetail:
    "https://www.figma.com/api/mcp/asset/56419ca9-6a90-4558-83df-77cfb96a3ab2",
  couple:
    "https://www.figma.com/api/mcp/asset/97d3fb14-57d8-472d-9e23-491baaa81cbb",
  coupleDetail:
    "https://www.figma.com/api/mcp/asset/8c7adf63-8b00-40ae-a559-a0b0872dd59c",
  yearbook:
    "https://www.figma.com/api/mcp/asset/76215340-f546-4dc3-bb6b-f965fcc87ad6",
  yearbookDetail:
    "https://www.figma.com/api/mcp/asset/36357a06-4f37-443e-b109-61c302dc87e1",
  event:
    "https://www.figma.com/api/mcp/asset/7f5bd5c1-8308-4597-9a3a-79305d826ee2",
  eventDetail:
    "https://www.figma.com/api/mcp/asset/508abb71-d2fc-4449-bc0e-1608e56cf008",
  food:
    "https://www.figma.com/api/mcp/asset/1a8e5f75-e03c-4262-8add-185cc8e0e005",
  foodDetail:
    "https://www.figma.com/api/mcp/asset/e243406d-d9c8-49cd-8c3e-c77fdce79dc8",
  travel:
    "https://www.figma.com/api/mcp/asset/bcd9a754-1bf3-47a9-bde6-2270fed16d80",
  travelDetail:
    "https://www.figma.com/api/mcp/asset/7ab40b42-ec98-40f7-8976-ad31e168ddbc",
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
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fafbfc] text-[#0e111d] font-sans antialiased selection:bg-[#ff8d28]/20">
      <main className="w-full">
        <HeroSection />

        <div id="services">
          {serviceSections.map((section) => (
            <ServiceSection key={section.id} {...section} />
          ))}
        </div>
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
            className="mt-5 max-w-[15ch] text-[40px] sm:text-[48px] md:text-[54px] lg:text-[56px] xl:text-[64px] font-black leading-[1.18] tracking-normal text-[#0e111d]"
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