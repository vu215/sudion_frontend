"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";

/* ─── data ───────────────────────────────────────────────────── */
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
    mainImage:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80",
    detailImage:
      "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=400&q=80",
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
    mainImage:
      "https://images.unsplash.com/photo-1529634597503-139d3726fed5?auto=format&fit=crop&w=900&q=80",
    detailImage:
      "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?auto=format&fit=crop&w=400&q=80",
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
    mainImage:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=900&q=80",
    detailImage:
      "https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=400&q=80",
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
    mainImage:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=80",
    detailImage:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=400&q=80",
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
    mainImage:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80",
    detailImage:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=400&q=80",
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
    mainImage:
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=900&q=80",
    detailImage:
      "https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?auto=format&fit=crop&w=400&q=80",
    badgeTitle: "Đặt lịch toàn quốc",
    badgeText: "Hỗ trợ 24/7",
    reverse: true,
    muted: true,
  },
];

const containerClass = "w-full max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20";

/* ─── helpers ────────────────────────────────────────────────── */
function SparkGlyph({ className }: { className?: string }) {
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
  mainImage: string;
  detailImage: string;
  badgeTitle: string;
  badgeText: string;
  reverse?: boolean;
  muted?: boolean;
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