"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useEffect, useState, useRef, useMemo } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function resolveAssetUrl(url: string | null) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url) || url.startsWith("data:")) return url;
  const backendHost = API_URL.replace(/\/api\/?$/, "");
  return `${backendHost}${url.startsWith("/") ? url : `/${url}`}`;
}

const photos = {
  hero: "https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?auto=format&fit=crop&w=2000&q=90",
  wedding: "https://i.pinimg.com/1200x/f2/a5/5a/f2a55a5b607de167875d9e3b85668f1a.jpg",
  portrait: "https://i.pinimg.com/736x/c1/1e/62/c11e625dff2d6c16556d4bf313b15bbb.jpg",
  event: "https://i.pinimg.com/1200x/7b/c0/52/7bc0529f686c1f7b26f364cf57c57be6.jpg",
  travel: "https://i.pinimg.com/1200x/c4/68/6d/c4686d3523a99172767d64f8177e62bd.jpg",
  product: "https://i.pinimg.com/1200x/3b/a2/c5/3ba2c5ae61f152bde93c84c22cabb7ea.jpg",
  family: "https://i.pinimg.com/736x/87/28/56/87285639f8ddd169b2e0914c2d09d131.jpg",
  food: "https://i.pinimg.com/736x/86/20/43/862043dfe5e28d68633eb4290a90d8e1.jpg",
  couple: "https://i.pinimg.com/736x/a4/ff/df/a4ffdf7dce679f05f8b0636aef47d43c.jpg",
};

const fallbackPhotographers = [
  { id: 1, name: "Luxe Studio", specialty: "Chuyên chụp ảnh cưới cao cấp", rating: 4.9, reviews: 256, min_price: 3500000, image_url: photos.wedding },
  { id: 2, name: "Urban Click", specialty: "Chụp ảnh chân dung & Street style", rating: 4.8, reviews: 198, min_price: 2200000, image_url: photos.portrait },
  { id: 3, name: "Sunset Capture", specialty: "Chụp ảnh du lịch & thiên nhiên", rating: 4.9, reviews: 203, min_price: 2500000, image_url: photos.travel },
  { id: 4, name: "Foodie Shot", specialty: "Chuyên chụp ảnh ẩm thực", rating: 4.8, reviews: 142, min_price: 1800000, image_url: photos.food },
];

const services = [
  ["Chụp ảnh cưới", "Lưu giữ khoảnh khắc trọn đời", photos.wedding, "wedding"],
  ["Chụp chân dung", "Thể hiện cá tính riêng", photos.portrait, "portrait"],
  ["Chụp sự kiện", "Ghi lại mọi khoảnh khắc", photos.event, "event"],
  ["Chụp du lịch", "Khám phá thế giới", photos.travel, "travel"],
  ["Chụp sản phẩm", "Nâng tầm thương hiệu", photos.product, "product"],
  ["Chụp gia đình", "Yêu thương trọn vẹn", photos.family, "family"],
];

const deals = [
  ["-20%", "Gói chụp cưới ngoại cảnh", "Mai Wedding", "3.200.000đ", "4.000.000đ", photos.wedding],
  ["-15%", "Gói chụp kỷ yếu nhóm", "Lynh Photography", "1.700.000đ", "2.000.000đ", photos.event],
  ["-10%", "Gói chụp sản phẩm cơ bản", "Tony Media", "900.000đ", "1.000.000đ", photos.product],
  ["-20%", "Gói chụp gia đình cuối tuần", "Nắng Studio", "1.600.000đ", "2.000.000đ", photos.family],
];

const fallbackProducts = [
  {
    id: 101,
    name: "Sony Alpha 7 IV (Body)",
    slug: "sony-alpha-7-iv",
    category_name: "Máy ảnh (Mirrorless)",
    price: 58990000,
    sale_price: 54990000,
    image_url: "https://images.unsplash.com/photo-1616035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
    description: "Cảm biến Full-frame 33MP, Chip BIONZ XR, Lấy nét Real-time Eye AF, video 4K 60p.",
    hot: 1
  },
  {
    id: 102,
    name: "Sony Alpha 7C II (Body)",
    slug: "sony-alpha-7c-ii",
    category_name: "Máy ảnh (Mirrorless)",
    price: 54990000,
    sale_price: 52990000,
    image_url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
    description: "Cảm biến Full-frame 33MP, bộ xử lý trí tuệ nhân tạo AI chuyên dụng, trọng lượng siêu nhẹ 514g.",
    hot: 1
  },
  {
    id: 103,
    name: "Sony ZV-E10 II (Body)",
    slug: "sony-zv-e10-ii",
    category_name: "Máy ảnh (Mirrorless)",
    price: 19990000,
    sale_price: 18990000,
    image_url: "https://images.unsplash.com/photo-1502920917128-1da500764ccc?auto=format&fit=crop&w=800&q=80",
    description: "Cảm biến APS-C 26MP chuyên quay vlog, mic 3 đầu hướng lọc gió, màn hình xoay lật đa góc.",
    hot: 1
  },
  {
    id: 104,
    name: "Sony Alpha 7R V (Body)",
    slug: "sony-alpha-7r-v",
    category_name: "Máy ảnh (Mirrorless)",
    price: 92900000,
    sale_price: 89990000,
    image_url: "https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?auto=format&fit=crop&w=800&q=80",
    description: "Cảm biến Exmor R CMOS 61MP siêu phân giải, chống rung 8.0 bước, màn hình LCD 4 trục xoay linh hoạt.",
    hot: 1
  },
  {
    id: 105,
    name: "Sony FE 24-70mm f/2.8 GM II",
    slug: "sony-fe-24-70mm-f28-gm-ii",
    category_name: "Ống kính (Lens)",
    price: 53990000,
    sale_price: 49990000,
    image_url: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=800&q=80",
    description: "Ống kính zoom tiêu chuẩn G Master thế hệ 2 siêu nhẹ, độ sắc nét tuyệt đối, f/2.8 cố định.",
    hot: 1
  },
  {
    id: 106,
    name: "Sony FE 70-200mm f/2.8 GM OSS II",
    slug: "sony-fe-70-200mm-f28-gm-oss-ii",
    category_name: "Ống kính (Lens)",
    price: 67990000,
    sale_price: 63990000,
    image_url: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80",
    description: "Ống kính tele zoom đỉnh cao G Master II, 4 động cơ XD Linear, tích hợp chống rung OSS quang học.",
    hot: 0
  },
  {
    id: 107,
    name: "Sony FE 50mm f/1.2 GM",
    slug: "sony-fe-50mm-f12-gm",
    category_name: "Ống kính (Lens)",
    price: 49990000,
    sale_price: 45990000,
    image_url: "https://images.unsplash.com/photo-1527018601619-a508a2be00cd?auto=format&fit=crop&w=800&q=80",
    description: "Ống kính chân dung khẩu độ siêu rộng f/1.2 G Master, 11 lá khẩu tròn cho bokeh hoàn hảo.",
    hot: 1
  },
  {
    id: 108,
    name: "Sony FE 85mm f/1.4 GM",
    slug: "sony-fe-85mm-f14-gm",
    category_name: "Ống kính (Lens)",
    price: 38990000,
    sale_price: 35990000,
    image_url: "https://images.unsplash.com/photo-1619961313028-e4b9e2365922?auto=format&fit=crop&w=800&q=80",
    description: "Ống kính chân dung huyền thoại khẩu f/1.4, tiêu cự vàng 85mm xóa phông mượt mà nghệ thuật.",
    hot: 0
  },
  {
    id: 109,
    name: "Gimbal DJI RS 4 (Standard)",
    slug: "gimbal-dji-rs-4-standard",
    category_name: "Phụ kiện (Accessory)",
    price: 10990000,
    sale_price: 9990000,
    image_url: "https://images.unsplash.com/photo-1581591524425-c7e0978865fc?auto=format&fit=crop&w=800&q=80",
    description: "Gimbal chống rung 3 trục thế hệ 4 hỗ trợ quay dọc native, màn hình OLED tự động khóa, tải trọng 3.0 kg.",
    hot: 1
  },
  {
    id: 110,
    name: "Peak Design Travel Tripod (Carbon)",
    slug: "peak-design-travel-tripod-carbon",
    category_name: "Phụ kiện (Accessory)",
    price: 16500000,
    sale_price: 14990000,
    image_url: "https://images.unsplash.com/photo-1495707902641-75cac588d2e9?auto=format&fit=crop&w=800&q=80",
    description: "Chân máy ảnh du lịch carbon siêu nhẹ chỉ 1.27 kg, tải trọng 9.1 kg, thiết kế thu gọn thông minh.",
    hot: 0
  }
];

const promoSlides = [
  {
    eyebrow: "KHOẢNH KHẮC GIA ĐÌNH",
    title: "TẶNG THÊM 30 ẢNH",
    description: "Khi đặt gói chụp gia đình cuối tuần",
    image: photos.family,
    href: "/services/family",
  },
  {
    eyebrow: "ƯU ĐÃI MÙA CƯỚI",
    title: "GIẢM ĐẾN 20%",
    description: "Cho các gói chụp cưới ngoại cảnh",
    image: photos.wedding,
    href: "/services/wedding",
  },
  {
    eyebrow: "NÂNG TẦM THƯƠNG HIỆU",
    title: "ƯU ĐÃI 15%",
    description: "Dành cho khách hàng chụp sản phẩm lần đầu",
    image: photos.product,
    href: "/services/product",
  },
];

const testimonials = [
  ["Dễ dàng tìm được Photographer phù hợp. Chất lượng dịch vụ rất tốt!", "Nguyễn Hoàng Anh", "Hà Nội"],
  ["Đặt lịch nhanh chóng, Photographer nhiệt tình và chuyên nghiệp.", "Trần Minh Thư", "TP. HCM"],
  ["Ảnh đẹp vượt mong đợi, sẽ tiếp tục ủng hộ PIXORA AI!", "Lê Quang Huy", "Đà Nẵng"],
  ["Giao diện dễ dùng, nhiều ưu đãi hấp dẫn. Rất hài lòng!", "Phạm Kim Ngân", "Đà Lạt"],
];

type Photographer = Record<string, unknown>;

const money = (value: unknown) => Number(value || 0).toLocaleString("vi-VN") + "đ";
const pick = (item: Photographer, keys: string[], fallback: unknown) => {
  for (const key of keys) if (item[key] !== undefined && item[key] !== null && item[key] !== "") return item[key];
  return fallback;
};

function getCategoryIcon(slug: string) {
  if (slug === "wedding" || slug === "couple") {
    return (
      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    );
  }
  if (slug === "portrait" || slug === "personal") {
    return (
      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    );
  }
  if (slug === "event") {
    return (
      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    );
  }
  if (slug === "travel") {
    return (
      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <circle cx="12" cy="11" r="3" />
      </svg>
    );
  }
  if (slug === "product" || slug === "food") {
    return (
      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    );
  }
  return (
    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 035.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

const getCategoryPhoto = (slug: string) => {
  if (slug === "wedding" || slug === "couple") return photos.wedding;
  if (slug === "portrait" || slug === "personal") return photos.portrait;
  if (slug === "event") return photos.event;
  if (slug === "travel") return photos.travel;
  if (slug === "product" || slug === "food") return photos.product;
  return photos.family;
};

export default function Home() {
  const [photographers, setPhotographers] = useState<Photographer[]>(fallbackPhotographers);
  const [allProducts, setAllProducts] = useState<any[]>(fallbackProducts);
  const [categoriesList, setCategoriesList] = useState<any[]>(services);
  const [homeDeals, setHomeDeals] = useState<any[]>(deals);

  useEffect(() => {
    // 1. Fetch categories
    fetch(`${API_URL}/services`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const mapped = json.data.map((cat: any) => [
            cat.name,
            cat.description || "Dịch vụ chụp ảnh chuyên nghiệp tại Sudion.",
            getCategoryPhoto(cat.slug),
            cat.slug
          ]);
          setCategoriesList(mapped);
        }
      })
      .catch((err) => console.log("Failed to fetch services:", err));

    // 2. Fetch photographers & deals
    const loadPhotographersAndDeals = async () => {
      try {
        const res = await fetch(`${API_URL}/photographers/featured?limit=4`);
        const json = await res.json();
        let list = json.success && Array.isArray(json.data) ? json.data : [];
        
        // If featured list is empty, fetch all active photographers as fallback
        if (list.length === 0) {
          const resAll = await fetch(`${API_URL}/photographers`);
          const jsonAll = await resAll.json();
          list = jsonAll.success && Array.isArray(jsonAll.data) ? jsonAll.data : [];
        }
        
        if (list.length > 0) {
          setPhotographers(list.slice(0, 4));
          
          // Fetch booking options (packages) for the first 3 photographers to build dynamic deals
          const allPackages: any[] = [];
          for (const photog of list.slice(0, 3)) {
            try {
              const resPack = await fetch(`${API_URL}/photographers/${photog.id}/booking-options`);
              const jsonPack = await resPack.json();
              if (jsonPack.success && jsonPack.data && Array.isArray(jsonPack.data.packages)) {
                for (const pkg of jsonPack.data.packages) {
                  allPackages.push({ pkg, photog });
                }
              }
            } catch (e) {
              console.log("Error loading packages for photographer:", photog.id, e);
            }
          }
          
          if (allPackages.length > 0) {
            const discounts = ["-20%", "-15%", "-10%", "-25%"];
            const mappedDeals = allPackages.slice(0, 4).map(({ pkg, photog }, idx) => {
              const disc = discounts[idx % discounts.length];
              const priceNum = Number(pkg.price);
              const oldPriceNum = Math.round(priceNum * 1.25);
              const formatVND = (v: number) => v.toLocaleString("vi-VN") + "đ";
              
              const pkgImg = pkg.image_url 
                ? resolveAssetUrl(pkg.image_url) 
                : getCategoryPhoto(pkg.category?.slug || "wedding");

              return [
                disc,
                pkg.name,
                photog.full_name,
                formatVND(priceNum),
                formatVND(oldPriceNum),
                pkgImg
              ];
            });
            setHomeDeals(mappedDeals);
          }
        }
      } catch (err) {
        console.log("Error loading photographers & packages:", err);
      }
    };
    
    loadPhotographersAndDeals();

    // 3. Fetch products
    fetch(`${API_URL}/products`)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : (data.success && Array.isArray(data.data)) ? data.data : [];
        if (list.length > 0) {
          setAllProducts(list);
        }
      })
      .catch((err) => console.log("Failed to fetch homepage products:", err));
  }, []);

  const getProductImage = (image_url: string) => {
    const backendHost = API_URL.replace(/\/api\/?$/, "");
    if (!image_url) return "/default-product.png";
    if (image_url.startsWith("http") || image_url.startsWith("data:")) {
      return image_url;
    }
    if (image_url.startsWith("/")) {
      return `${backendHost}${image_url}`;
    }
    return `${backendHost}/uploads/${image_url}`;
  };

  const hotProducts = useMemo(() => {
    return allProducts.filter(p => p.hot === 1).slice(0, 4);
  }, [allProducts]);

  const promoProducts = useMemo(() => {
    return allProducts.filter(p => p.sale_price > 0 && p.sale_price < p.price).slice(0, 4);
  }, [allProducts]);

  return (
    <main className="bg-white font-sans text-[#111827]">
      <div className="mx-auto w-full max-w-[1440px] px-6 pb-10 pt-3 md:px-12 lg:px-20">
        <Hero />

        <Section title="Photographer được tài trợ" action="/photographer" badge="Được tài trợ">
          <SponsoredGrid photographers={photographers} />
        </Section>

        <PromoBanner />

        <Section title="Dịch vụ được đặt nhiều" action="/services">
          <div className="flex snap-x gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-6 md:overflow-visible">
            {categoriesList.slice(0, 6).map(([name, desc, image, slug]) => (
              <Link key={name} href={`/services/${slug}`} className="group relative w-[160px] shrink-0 snap-start overflow-hidden rounded-2xl bg-slate-900 shadow-sm sm:w-[185px] md:w-auto" style={{ aspectRatio: "0.5" }}>
                <img src={image} alt={name} className="transition duration-500 group-hover:scale-105" style={{ height: "100%", width: "100%", objectFit: "cover" }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/15 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-white flex items-end gap-2.5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/70 bg-black/25 text-sm">
                    {getCategoryIcon(slug)}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-extrabold sm:text-base leading-tight truncate">{name}</h3>
                    <p className="mt-0.5 line-clamp-1 text-[10px] text-white/75 sm:text-[11px] leading-tight">{desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Section>

        <Section title="Gói dịch vụ ưu đãi" action="/services">
          <div className="flex snap-x gap-4 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-4 md:overflow-visible">
            {homeDeals.map(([discount, name, studio, price, oldPrice, image]) => (
              <article key={name} className="flex overflow-hidden rounded-xl border border-slate-200 bg-white font-sans shadow-[0_5px_18px_rgba(15,23,42,.06)] transition duration-300 hover:shadow-md w-[280px] shrink-0 snap-start sm:w-[320px] md:w-auto" style={{ height: "clamp(145px, 11vw, 180px)" }}>
                <div className="relative w-[43%] shrink-0 bg-slate-100">
                  <img src={image} alt={name} className="h-full w-full object-cover" style={{ height: "100%", width: "100%", objectFit: "cover" }} />
                  <span className="absolute left-2 top-2 rounded-md bg-[#ff8d28] px-2 py-0.5 text-[10px] font-black text-white shadow-sm">{discount}</span>
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-center p-3">
                  <div>
                    <h3 className="line-clamp-2 text-xs font-black text-slate-800 leading-snug">{name}</h3>
                    <p className="mt-1 text-[10px] font-semibold text-slate-400">{studio}</p>
                  </div>
                  <div className="mt-2">
                    <p className="whitespace-nowrap text-sm font-black text-[#ff8d28]">
                      {price}
                      <del className="ml-1 text-[9px] font-medium text-slate-400">{oldPrice}</del>
                    </p>
                    <Link href="/services" className="mt-2 block rounded-lg border border-[#ff8d28]/35 py-1.5 text-center text-[10px] font-black text-[#ff8d28] transition hover:border-[#ff8d28] hover:bg-[#fff4e8]">
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Section>

        {hotProducts.length > 0 && (
          <Section title="Thiết bị máy ảnh HOT" action="/products" badge="HOT">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {hotProducts.map((item) => (
                <div key={item.id} className="group bg-white rounded-3xl shadow-[0_4px_20px_rgba(15,23,42,.1)] hover:shadow-[0_8px_30px_rgba(15,23,42,.16)] overflow-hidden flex flex-col transition-all duration-300">
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-50">
                    <img
                      src={getProductImage(item.image_url)}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-[#ff8d28] text-white px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wider shadow-sm uppercase">
                      HOT
                    </div>
                    {item.sale_price > 0 && item.sale_price < item.price && (
                      <div className="absolute top-2.5 right-2.5 bg-red-500 text-white px-2.5 py-0.5 rounded-full text-[9px] font-black shadow-sm">
                        -{Math.round(((item.price - item.sale_price) / item.price) * 100)}%
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] font-extrabold text-[#ff8d28] uppercase tracking-wider">{item.category_name}</div>
                      <h3 className="mt-1.5 text-sm font-extrabold text-slate-800 line-clamp-1 group-hover:text-[#ff8d28] transition-colors">{item.name}</h3>
                      <p className="mt-1 text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{item.description}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-sm font-black text-slate-800 block truncate">
                          {Number(item.sale_price || item.price).toLocaleString('vi-VN')} ₫
                        </span>
                        {item.sale_price > 0 && item.sale_price < item.price && (
                          <span className="text-[10px] text-slate-400 line-through block mt-0.5 truncate">
                            {Number(item.price).toLocaleString('vi-VN')} ₫
                          </span>
                        )}
                      </div>
                      <Link href={`/products/${item.slug}`} className="rounded-lg bg-slate-900 px-3 py-1.5 text-[10px] font-black text-white hover:bg-[#ff8d28] transition-colors whitespace-nowrap shrink-0">
                        Xem chi tiết
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {promoProducts.length > 0 && (
          <Section title="Ưu đãi thiết bị chính hãng" action="/products" badge="SALE">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {promoProducts.map((item) => (
                <div key={item.id} className="group bg-white rounded-3xl shadow-[0_4px_20px_rgba(15,23,42,.1)] hover:shadow-[0_8px_30px_rgba(15,23,42,.16)] overflow-hidden flex flex-col transition-all duration-300">
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-50">
                    <img
                      src={getProductImage(item.image_url)}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-red-600 text-white px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wider shadow-sm uppercase">
                      GIẢM GIÁ
                    </div>
                    {item.sale_price > 0 && item.sale_price < item.price && (
                      <div className="absolute top-2.5 right-2.5 bg-red-500 text-white px-2.5 py-0.5 rounded-full text-[9px] font-black shadow-sm">
                        -{Math.round(((item.price - item.sale_price) / item.price) * 100)}%
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] font-extrabold text-[#ff8d28] uppercase tracking-wider">{item.category_name}</div>
                      <h3 className="mt-1.5 text-sm font-extrabold text-slate-800 line-clamp-1 group-hover:text-[#ff8d28] transition-colors">{item.name}</h3>
                      <p className="mt-1 text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{item.description}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-sm font-black text-slate-800 block truncate">
                          {Number(item.sale_price || item.price).toLocaleString('vi-VN')} ₫
                        </span>
                        {item.sale_price > 0 && item.sale_price < item.price && (
                          <span className="text-[10px] text-slate-400 line-through block mt-0.5 truncate">
                            {Number(item.price).toLocaleString('vi-VN')} ₫
                          </span>
                        )}
                      </div>
                      <Link href={`/products/${item.slug}`} className="rounded-lg bg-slate-900 px-3 py-1.5 text-[10px] font-black text-white hover:bg-[#ff8d28] transition-colors whitespace-nowrap shrink-0">
                        Chi tiết
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        <AiBanner />
        <BookingSteps />

        <Section title="Khách hàng nói gì về chúng tôi" action="/review">
          <div className="relative">
            {/* Left navigation chevron */}
            <button className="absolute left-[-18px] top-1/2 -translate-y-1/2 z-10 hidden md:grid h-9 w-9 place-items-center rounded-full bg-white shadow border border-slate-200 text-slate-500 hover:text-slate-900 transition-all font-black hover:bg-slate-50" aria-label="Previous testimonials">
              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {testimonials.slice(0, 3).map(([quote, name, city]) => (
                <article key={name} className="rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-[#f7f7ff] p-6 shadow-[0_5px_18px_rgba(15,23,42,.05)]" style={{ minHeight: 210, aspectRatio: "1.4" }}>
                  <div className="text-lg tracking-wider text-[#ff8d28]">★★★★★</div>
                  <p className="mt-3 min-h-12 text-sm leading-6 text-slate-700">{quote}</p>
                  <div className="mt-5 flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-full bg-[#fff1e5] text-xs font-black text-[#ff8d28]">{name.charAt(0)}</div><div><p className="text-xs font-extrabold">{name}</p><p className="text-[10px] text-slate-500">{city}</p></div></div>
                </article>
              ))}
            </div>

            {/* Right navigation chevron */}
            <button className="absolute right-[-18px] top-1/2 -translate-y-1/2 z-10 hidden md:grid h-9 w-9 place-items-center rounded-full bg-white shadow border border-slate-200 text-slate-500 hover:text-slate-900 transition-all font-black hover:bg-slate-50" aria-label="Next testimonials">
              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </Section>

        <TrustBar />
      </div>
    </main>
  );
}

const categories = {
  all: "Thể loại",
  wedding: "Chụp ảnh cưới",
  portrait: "Chụp chân dung",
  event: "Chụp sự kiện",
};

const locations = {
  all: "Địa điểm",
  "Hà Nội, Việt Nam": "Hà Nội",
  "TP. Hồ Chí Minh": "TP. Hồ Chí Minh",
  "Đà Nẵng": "Đà Nẵng",
  "Đà Lạt": "Đà Lạt",
};

const slides = [
  {
    id: "main",
    image: "https://images.pexels.com/photos/1024960/pexels-photo-1024960.jpeg?auto=compress&cs=tinysrgb&w=2000",
    gradient: "from-black/60 via-black/30 to-transparent",
    slogan1: "Kết nối với",
    slogan2: "PHOTOGRAPHER",
    slogan3: "chuyên nghiệp",
    slogan1Color: "text-white/90",
    slogan2Color: "text-[#ff8d28]",
    slogan3Color: "text-white/90",
    description: "Khám phá, so sánh và đặt lịch với những photographer uy tín, chuyên nghiệp trên toàn quốc."
  },
  {
    id: "wedding",
    image: "https://images.pexels.com/photos/2253870/pexels-photo-2253870.jpeg?auto=compress&cs=tinysrgb&w=2000",
    gradient: "from-black/60 via-black/30 to-transparent",
    slogan1: "Viết câu chuyện tình",
    slogan2: "NGÀY CƯỚI",
    slogan3: "đẹp như cổ tích",
    slogan1Color: "text-white/90",
    slogan2Color: "text-[#ff8d28]",
    slogan3Color: "text-white/90",
    description: "Dịch vụ chụp ảnh cưới chuyên nghiệp, tinh tế, đồng hành cùng tình yêu đôi lứa."
  },
  {
    id: "portrait",
    image: "https://images.pexels.com/photos/3621234/pexels-photo-3621234.jpeg?auto=compress&cs=tinysrgb&w=2000",
    gradient: "from-black/60 via-black/30 to-transparent",
    slogan1: "Lưu giữ mọi",
    slogan2: "KHOẢNH KHẮC",
    slogan3: "đáng nhớ",
    slogan1Color: "text-white/90",
    slogan2Color: "text-[#ff8d28]",
    slogan3Color: "text-white/90",
    description: "Chụp ảnh chân dung, kỷ yếu, couple theo phong cách riêng cùng photographer được chọn lọc."
  },
  {
    id: "yearbook",
    image: "https://images.pexels.com/photos/1205651/pexels-photo-1205651.jpeg?auto=compress&cs=tinysrgb&w=2000",
    gradient: "from-black/65 via-black/35 to-transparent",
    slogan1: "Ghi dấu tuổi thanh xuân",
    slogan2: "KỶ YẾU",
    slogan3: "đầy kỷ niệm",
    slogan1Color: "text-white/90",
    slogan2Color: "text-[#ff8d28]",
    slogan3Color: "text-white/90",
    description: "Bộ ảnh kỷ yếu sáng tạo, cá tính — lưu giữ tuổi học trò đẹp nhất của bạn."
  },
  {
    id: "event",
    image: "https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=2000",
    gradient: "from-black/65 via-black/35 to-transparent",
    slogan1: "Ghi lại từng khoảnh khắc",
    slogan2: "SỰ KIỆN",
    slogan3: "chuyên nghiệp",
    slogan1Color: "text-white/90",
    slogan2Color: "text-[#ff8d28]",
    slogan3Color: "text-white/90",
    description: "Nhiếp ảnh sự kiện, hội nghị, khai trương — bắt trọn không khí và cảm xúc."
  },
  {
    id: "travel",
    image: "https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=2000",
    gradient: "from-black/60 via-black/30 to-transparent",
    slogan1: "Đồng hành cùng",
    slogan2: "HÀNH TRÌNH",
    slogan3: "của bạn",
    slogan1Color: "text-white/90",
    slogan2Color: "text-[#ff8d28]",
    slogan3Color: "text-white/90",
    description: "Chụp ảnh travel, phong cảnh và lifestyle — lưu lại từng chuyến đi đáng nhớ."
  }
];

function Hero() {
  const [location, setLocation] = useState("all");
  const [category, setCategory] = useState("all");
  const [date, setDate] = useState("");
  const [openDropdown, setOpenDropdown] = useState<"category" | "location" | null>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".search-bar-container")) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="relative mb-10 md:mb-12">
      <section className="relative min-h-[580px] overflow-hidden rounded-[26px] bg-slate-900 shadow-sm md:min-h-[380px] md:aspect-[2.25]">
        {slides.map((slide, index) => {
          const isActive = index === activeSlide;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${isActive ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0"
                }`}
            >
              {/* Background Image */}
              <img
                src={slide.image}
                alt="Banner background"
                className="absolute inset-0 h-full w-full object-cover object-center"
              />
              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient}`} />

              {/* Slide Content */}
              <div className="relative h-full flex items-center px-12 pt-10 pb-20 sm:px-16 md:px-20 lg:px-24 lg:pb-20">
                <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  {/* Left Column (Text) */}
                  <div className="lg:col-span-9 flex flex-col justify-center">
                    <h1 className="flex flex-col items-start leading-[1.25] md:leading-[1.2] tracking-tight gap-1 md:gap-2">
                      <span className={`font-script text-2xl sm:text-3xl lg:text-[38px] font-medium normal-case ${slide.slogan1Color}`}>
                        {slide.slogan1}
                      </span>
                      <span className={`font-sans text-3xl sm:text-4xl lg:text-[54px] font-black uppercase tracking-wide ${slide.slogan2Color}`}>
                        {slide.slogan2}
                      </span>
                      <span className={`font-script text-2xl sm:text-3xl lg:text-[38px] font-medium normal-case ${slide.slogan3Color}`}>
                        {slide.slogan3}
                      </span>
                    </h1>
                    <p className="mt-4 max-w-[550px] text-sm font-medium leading-7 text-slate-800 sm:text-[16px]">
                      {slide.description}
                    </p>
                  </div>

                  {/* Right Column (Left empty intentionally so characters on custom banner background design can shine through) */}
                  <div className="lg:col-span-3 relative hidden lg:block h-[280px]" />
                </div>
              </div>
            </div>
          );
        })}

        {/* Slide navigation arrows */}
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/70 hover:bg-white text-slate-800 flex items-center justify-center shadow-md transition hover:scale-110 active:scale-95 cursor-pointer"
          aria-label="Previous slide"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/70 hover:bg-white text-slate-800 flex items-center justify-center shadow-md transition hover:scale-110 active:scale-95 cursor-pointer"
          aria-label="Next slide"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Slide indicators (dots) */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setActiveSlide(index);
              }}
              className={`w-2 h-2 rounded-full transition-all cursor-pointer ${index === activeSlide ? "bg-[#ff8d28] w-4" : "bg-slate-400/50 hover:bg-slate-400"
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Search Bar - positioned absolutely inside the bottom edge of the banner */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 w-[calc(100%-48px)] sm:w-[calc(100%-80px)] md:w-[calc(100%-96px)] lg:w-[calc(100%-112px)] max-w-[920px]">
        <div className="search-bar-container w-full bg-white rounded-[24px] md:rounded-full p-1.5 md:p-0 md:pl-6 shadow-[0_12px_35px_rgba(0,0,0,0.06)] border border-slate-100/80 flex flex-col md:flex-row md:items-center md:justify-between gap-2.5 md:gap-0 md:h-[48px] md:overflow-visible">
          {/* Thể loại */}
          <div className="flex-1 min-w-0 relative">
            <SearchField
              icon={<HeroFieldIcon type="camera" />}
              labelText={categories[category as keyof typeof categories] || "Thể loại"}
              onClick={() => setOpenDropdown(openDropdown === "category" ? null : "category")}
            />
            {openDropdown === "category" && (
              <div className="absolute top-[calc(100%+12px)] left-0 w-full bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-slate-100 py-1.5 z-30 min-w-[200px]">
                {Object.entries(categories).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setCategory(key);
                      setOpenDropdown(null);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm font-semibold transition cursor-pointer block ${category === key ? "text-[#ff4f00] bg-slate-50" : "text-slate-700 hover:bg-slate-50 hover:text-[#ff4f00]"
                      }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Thời gian */}
          <div className="flex-1 min-w-0 relative">
            <SearchField
              icon={<HeroFieldIcon type="calendar" />}
              labelText={date ? date.split("-").reverse().join("/") : "Thời gian"}
              onClick={() => dateInputRef.current?.showPicker()}
            />
            <input
              ref={dateInputRef}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="absolute pointer-events-none opacity-0 w-0 h-0"
            />
          </div>

          {/* Địa điểm */}
          <div className="flex-1 min-w-0 relative">
            <SearchField
              icon={<HeroFieldIcon type="location" />}
              labelText={locations[location as keyof typeof locations] || "Địa điểm"}
              onClick={() => setOpenDropdown(openDropdown === "location" ? null : "location")}
            />
            {openDropdown === "location" && (
              <div className="absolute top-[calc(100%+12px)] left-0 w-full bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-slate-100 py-1.5 z-30 min-w-[200px]">
                {Object.entries(locations).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setLocation(key);
                      setOpenDropdown(null);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm font-semibold transition cursor-pointer block ${location === key ? "text-[#ff4f00] bg-slate-50" : "text-slate-700 hover:bg-slate-50 hover:text-[#ff4f00]"
                      }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-0.5 md:p-0">
            <Link href={`/photographer?category=${category === "all" ? "" : category}&location=${encodeURIComponent(location === "all" ? "" : location)}&date=${date}`} className="flex h-[46px] md:h-[48px] items-center justify-center gap-2 rounded-[20px] md:rounded-r-full md:rounded-l-none bg-gradient-to-r from-[#ff5e00] to-[#ff3c00] px-8 text-[15px] font-extrabold text-white transition hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap w-full md:w-auto">
              <svg className="h-4.5 w-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              Đặt lịch
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
function SearchField({ icon, labelText, onClick }: { icon: React.ReactNode; labelText: string; onClick?: () => void }) {
  return (
    <div onClick={onClick} className="flex min-h-[46px] md:min-h-[40px] items-center gap-2.5 px-4 bg-white md:bg-transparent rounded-full md:rounded-none border border-slate-100 md:border-0 w-full cursor-pointer select-none">
      <span className="grid h-5 w-5 shrink-0 place-items-center text-slate-800">{icon}</span>
      <span className="min-w-0 flex-1 text-sm font-bold text-slate-800 truncate">
        {labelText}
      </span>
    </div>
  );
}

function HeroFieldIcon({ type }: { type: "location" | "camera" | "calendar" }) {
  if (type === "location") return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>;
  if (type === "camera") return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 7h3l1.5-2h7L17 7h3v12H4Z" /><circle cx="12" cy="13" r="4" /></svg>;
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4m10-4v4M3 10h18" /></svg>;
}

function PromoBanner() {
  const [activePromo, setActivePromo] = useState(0);
  const promo = promoSlides[activePromo];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActivePromo((current) => (current + 1) % promoSlides.length);
    }, 3000);

    return () => window.clearInterval(timer);
  }, []);

  const movePromo = (direction: number) => {
    setActivePromo((current) => (current + direction + promoSlides.length) % promoSlides.length);
  };

  return (
    <section
      aria-label="Chương trình khuyến mãi"
      aria-roledescription="carousel"
      className="relative mt-7 min-h-[210px] overflow-hidden rounded-2xl border border-orange-100 bg-gradient-to-r from-[#fff5e7] to-[#ffedd1] shadow-sm sm:min-h-[170px]"
    >
      <div
        className="absolute inset-y-0 right-0 w-[76%] sm:w-[52%]"
        style={{
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,.25) 14%, #000 34%)",
          maskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,.25) 14%, #000 34%)",
        }}
      >
        {promoSlides.map((slide, index) => (
          <img
            key={slide.image}
            src={slide.image}
            alt=""
            aria-hidden={activePromo !== index}
            className={`absolute inset-0 h-full w-full object-cover object-center transition-[opacity,transform] duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none ${activePromo === index ? "scale-100 opacity-100" : "scale-[1.025] opacity-0"
              }`}
          />
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#fff5e7] via-[#fff5e7]/45 to-transparent sm:via-[42%]" />

      <div className="relative z-10 flex min-h-[210px] items-center px-8 py-8 sm:min-h-[170px] sm:px-16 lg:px-24">
        <div key={activePromo} className="w-full animate-fade-in-up text-center motion-reduce:animate-none sm:w-[58%] sm:text-left">
          <p className="text-[10px] font-black tracking-[0.24em] text-[#ff8d28] sm:text-xs">
            {promo.eyebrow}
          </p>
          <div className="mt-2 flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-8">
            <div className="min-w-0">
              <h3 className="text-[26px] font-black leading-none tracking-tight text-[#ff8d28] sm:text-[30px] lg:text-[36px]">
                {promo.title}
              </h3>
              <p className="mt-2 text-xs font-semibold text-orange-950/75 sm:text-sm">{promo.description}</p>
            </div>
            <Link
              href={promo.href}
              className="shrink-0 rounded-full border border-[#ff8d28] bg-[#ff8d28] px-7 py-3 text-xs font-extrabold text-white shadow-md shadow-[#ff8d28]/30 transition hover:-translate-y-0.5 hover:bg-[#ed7c18]"
            >
              Xem ưu đãi ngay
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute right-4 top-4 z-20 flex gap-2">
        <button
          type="button"
          onClick={() => movePromo(-1)}
          aria-label="Khuyến mãi trước"
          className="grid h-9 w-9 place-items-center rounded-lg border border-white/70 bg-white/80 text-lg font-bold text-slate-600 shadow-sm backdrop-blur-md transition hover:bg-white hover:text-[#ff8d28]"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => movePromo(1)}
          aria-label="Khuyến mãi tiếp theo"
          className="grid h-9 w-9 place-items-center rounded-lg border border-white/70 bg-white/80 text-lg font-bold text-slate-600 shadow-sm backdrop-blur-md transition hover:bg-white hover:text-[#ff8d28]"
        >
          ›
        </button>
      </div>

      <div className="absolute bottom-3 right-5 z-20 flex items-center gap-2">
        {promoSlides.map((slide, index) => (
          <button
            type="button"
            key={slide.title}
            onClick={() => setActivePromo(index)}
            aria-label={`Xem khuyến mãi ${index + 1}`}
            aria-current={activePromo === index}
            className={`h-2 rounded-full shadow-sm transition-all duration-500 ${activePromo === index ? "w-6 bg-white/90" : "w-2 bg-white/45 hover:bg-white/70"}`}
          />
        ))}
      </div>
    </section>
  );
}

function Section({ title, action, children, badge }: { title: string; action: string; children: React.ReactNode; badge?: string }) {
  return <section className="pt-7"><div className="mb-3 flex items-center justify-between"><div className="flex items-center gap-3"><h2 className="text-lg font-black tracking-tight sm:text-xl">{title}</h2>{badge && <span className="hidden rounded-full bg-[#fff1e5] px-3 py-1 text-[10px] font-extrabold text-[#ff8d28] sm:inline">{badge}</span>}</div><Link href={action} className="text-[11px] font-bold text-slate-700 transition hover:text-[#ff8d28]">Xem tất cả →</Link></div>{children}</section>;
}

function SponsoredGrid({ photographers }: { photographers: Photographer[] }) {
  return (
    <div className="grid items-start gap-3 md:grid-cols-[.8fr_1.2fr]">
      <SponsoredCard item={photographers[0] || fallbackPhotographers[0]} index={0} featured />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <SponsoredCard item={photographers[1] || fallbackPhotographers[1]} index={1} wide />
        </div>
        <SponsoredCard item={photographers[2] || fallbackPhotographers[2]} index={2} />
        <SponsoredCard item={photographers[3] || fallbackPhotographers[3]} index={3} />
      </div>
    </div>
  );
}

function SponsoredCard({ item, index, featured = false, wide = false }: { item: Photographer; index: number; featured?: boolean; wide?: boolean }) {
  const rawImage = String(pick(item, ["avatar_url", "image_url", "profile_image", "avatar"], fallbackPhotographers[index]?.image_url));
  const image = resolveAssetUrl(rawImage);
  const name = String(pick(item, ["full_name", "name", "studio_name"], fallbackPhotographers[index]?.name));
  const specialty = String(pick(item, ["specialty", "bio", "photographer_type"], fallbackPhotographers[index]?.specialty));
  const price = pick(item, ["min_price", "starting_price", "price"], fallbackPhotographers[index]?.min_price);
  const id = String(pick(item, ["id", "user_id", "photographer_id"], index + 1));
  const rating = String(pick(item, ["rating", "average_rating"], 4.9));
  const reviewCount = String(pick(item, ["reviews", "review_count"], 128));

  return (
    <Link href={`/photographer-profile/${id}`} className="group relative block w-full overflow-hidden rounded-2xl bg-slate-900 shadow-[0_5px_18px_rgba(15,23,42,.06)] transition duration-300" style={{ aspectRatio: featured ? "0.86" : wide ? "2.72" : "1.32" }}>
      <img src={image} alt={name} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

      {/* Sponsored tag top left */}
      <span className="absolute left-3 top-3 rounded bg-[#ff8d28] px-2 py-0.5 text-[9px] font-black italic tracking-wide text-white uppercase shadow-sm">
        Sponsored
      </span>

      {/* Details overlay bottom */}
      <div className="absolute inset-x-0 bottom-0 p-4 flex flex-col justify-end min-h-[120px] text-white">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <h3 className="text-sm md:text-base font-black truncate">{name}</h3>
              <svg className="h-4 w-4 shrink-0 text-[#ff8d28]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-white/80 font-medium">
              <span className="flex items-center gap-0.5"><span className="text-[#ff8d28]">★</span> {rating} ({reviewCount})</span>
              <span className="text-white/40">•</span>
              <span className="truncate">Chuyên: {specialty.replace("Chuyên chụp ", "").replace("Chuyên: ", "")}</span>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <span className="block text-[9px] text-white/60 font-black uppercase tracking-wider">Từ</span>
            <strong className="block text-sm font-black text-[#ff8d28] md:text-base">{money(price)}</strong>
          </div>
        </div>
      </div>
    </Link>
  );
}

function AiBanner() {
  return (
    <section className="relative mt-7 flex min-h-[150px] flex-col items-center justify-between gap-5 overflow-hidden rounded-2xl bg-gradient-to-r from-[#0d0d45] via-[#1b0c6a] to-[#22056f] px-7 font-sans text-white shadow-sm sm:flex-row sm:px-10">
      <div className="absolute -right-8 -top-12 h-32 w-32 rounded-full border-[18px] border-white/10" />
      <div className="relative flex items-center gap-6">
        <RobotMark />
        <div>
          <h2 className="text-xl font-black text-white sm:text-2xl">Chưa biết chọn Photographer nào?</h2>
          <p className="mt-2 max-w-2xl text-xs font-semibold leading-6 text-white/80 sm:text-sm">Hãy để AI gợi ý cho bạn Photographer phù hợp nhất với phong cách,<br className="hidden lg:block" /> ngân sách và địa điểm bạn mong muốn.</p>
        </div>
      </div>
      <button onClick={() => window.dispatchEvent(new CustomEvent("open-ai-consultant"))} className="relative flex shrink-0 items-center gap-2 rounded-xl bg-[#ff8d28] px-8 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-[#ed7c18] hover:shadow-xl">
        <svg className="h-4.5 w-4.5 fill-current text-white" viewBox="0 0 24 24">
          <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z" />
        </svg>
        Nhận gợi ý từ AI
      </button>
    </section>
  );
}

function RobotMark() {
  return (
    <div className="relative hidden h-[135px] w-[145px] shrink-0 self-end sm:block">
      <div className="absolute bottom-2 left-5 h-20 w-24 rounded-[36px] bg-gradient-to-br from-white to-blue-200 shadow-lg" />
      <div className="absolute left-7 top-1 h-20 w-24 rounded-[30px] border-[7px] border-white bg-gradient-to-b from-blue-100 to-blue-300 shadow-xl">
        <div className="absolute inset-2 rounded-[18px] bg-gradient-to-b from-[#3b8cff] to-[#162f87]">
          <i className="absolute left-4 top-4 h-3 w-3 rounded-full bg-cyan-200 shadow-[0_0_9px_#67e8f9]" />
          <i className="absolute right-4 top-4 h-3 w-3 rounded-full bg-cyan-200 shadow-[0_0_9px_#67e8f9]" />
        </div>
      </div>
      <i className="absolute left-[72px] top-0 h-3 w-3 rounded-full bg-amber-300 shadow-[0_0_12px_#fcd34d]" />
    </div>
  );
}

function BookingSteps() {
  const steps = [
    {
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      color: "bg-indigo-50 text-indigo-600 border-indigo-100",
      title: "Tìm Photographer",
      desc: "Tìm kiếm và chọn Photographer phù hợp với nhu cầu."
    },
    {
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      color: "bg-blue-50 text-blue-600 border-blue-100",
      title: "Chọn gói dịch vụ",
      desc: "Chọn gói dịch vụ và thời gian chụp phù hợp."
    },
    {
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      color: "bg-violet-50 text-violet-600 border-violet-100",
      title: "Đặt lịch & Thanh toán",
      desc: "Xác nhận lịch và thanh toán để giữ chỗ."
    },
    {
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "bg-emerald-50 text-emerald-600 border-emerald-100",
      title: "Hoàn thành & Đánh giá",
      desc: "Hoàn thành buổi chụp và đánh giá dịch vụ."
    }
  ];

  return (
    <section className="py-7" style={{ minHeight: 170 }}>
      <h2 className="mb-5 text-xl font-black">Quy trình đặt lịch đơn giản</h2>
      <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-4">
        {steps.map(({ icon, color, title, desc }, i) => (
          <div key={title} className="relative flex items-start gap-4">
            <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-full border text-2xl ${color}`}>
              {icon}
            </span>
            <div>
              <h3 className="text-sm font-extrabold">{title}</h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">{desc}</p>
            </div>
            {i < 3 && (
              <span className="absolute -right-3 top-3.5 hidden text-slate-300 md:block">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function TrustBar() {
  const items = [
    {
      title: "Thanh toán an toàn",
      desc: "Bảo mật tuyệt đối",
      icon: (
        <svg className="h-6 w-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    {
      title: "Không phí ẩn",
      desc: "Minh bạch giá cả",
      icon: (
        <svg className="h-6 w-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: "Đặt lịch dễ dàng",
      desc: "Xác nhận nhanh chóng",
      icon: (
        <svg className="h-6 w-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      title: "Hỗ trợ 24/7",
      desc: "Luôn sẵn sàng giúp đỡ",
      icon: (
        <svg className="h-6 w-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    }
  ];

  return (
    <section className="mt-8 grid gap-4 rounded-2xl border border-slate-100 bg-gradient-to-r from-[#fffaf7] to-[#faf9ff] px-5 py-8 shadow-[0_4px_18px_rgba(15,23,42,.03)] sm:grid-cols-2 md:grid-cols-4">
      {items.map(({ icon, title, desc }) => (
        <div key={title} className="flex items-center justify-center gap-3">
          <span className="grid h-10 w-10 place-items-center bg-white shadow-sm border border-slate-100 rounded-full shrink-0">{icon}</span>
          <div>
            <p className="text-xs font-extrabold text-slate-800">{title}</p>
            <p className="text-[11px] text-slate-500 font-semibold">{desc}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
