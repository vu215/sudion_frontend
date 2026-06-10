export type ServiceSlug = "wedding" | "couple" | "portrait";

export type ServicePackage = {
  id: string;
  serviceSlug: ServiceSlug;
  photographerId: string;
  photographerName: string;
  packageName: string;
  location: string;
  distanceKm: number;
  rating: number;
  reviewCount: number;
  price: number;
  duration: string;
  addOns: string[];
  nextSlot: string;
  image: string;
  portfolioImages: string[];
  verified?: boolean;
};

export type ServiceCategory = {
  slug: ServiceSlug;
  eyebrow: string;
  title: string;
  shortTitle: string;
  description: string;
  longDescription: string;
  startingPrice: string;
  photographerCount: string;
  heroImage: string;
  accentImage: string;
  tags: string[];
  mood: string;
};

export const serviceCategories: ServiceCategory[] = [
  {
    slug: "wedding",
    eyebrow: "Wedding photography",
    title: "Chụp ảnh cưới",
    shortTitle: "Ảnh cưới",
    description:
      "Pre-wedding, phóng sự ngày cưới và album được cá nhân hóa theo câu chuyện của hai bạn.",
    longDescription:
      "Lưu giữ ngày trọng đại với các photographer chuyên cưới, từ concept pre-wedding lãng mạn đến phóng sự cưới tự nhiên và album cao cấp.",
    startingPrice: "Từ 5.000.000 VND",
    photographerCount: "1.200+ photographer",
    heroImage:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=82",
    accentImage:
      "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=640&q=82",
    tags: ["Makeup", "Video", "Album", "Flycam", "Retouch"],
    mood: "Trang trọng, cảm xúc, chỉn chu",
  },
  {
    slug: "couple",
    eyebrow: "Couple photography",
    title: "Chụp ảnh đôi",
    shortTitle: "Ảnh đôi",
    description:
      "Bộ ảnh tự nhiên cho anniversary, kỷ niệm, hẹn hò hoặc những chuyến đi có ý nghĩa.",
    longDescription:
      "Ghi lại câu chuyện của hai bạn qua những khung hình gần gũi, trẻ trung và giàu cảm xúc ở studio, quán cà phê, phố hoặc ngoại cảnh.",
    startingPrice: "Từ 1.500.000 VND",
    photographerCount: "850+ photographer",
    heroImage:
      "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=1200&q=82",
    accentImage:
      "https://images.unsplash.com/photo-1529634597503-139d3726fed5?auto=format&fit=crop&w=640&q=82",
    tags: ["Concept", "Retouch", "Album mini", "Makeup", "Ngoại cảnh"],
    mood: "Nhẹ nhàng, tự nhiên, lãng mạn",
  },
  {
    slug: "portrait",
    eyebrow: "Portrait photography",
    title: "Chụp ảnh đơn",
    shortTitle: "Ảnh đơn",
    description:
      "Ảnh cá nhân cho profile, sinh nhật, mạng xã hội, công việc hoặc lưu giữ hình ảnh bản thân.",
    longDescription:
      "Tạo bộ ảnh cá nhân chuyên nghiệp với photographer biết hướng dẫn tạo dáng, chọn ánh sáng và xây concept phù hợp cá tính của bạn.",
    startingPrice: "Từ 1.200.000 VND",
    photographerCount: "960+ photographer",
    heroImage:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1200&q=82",
    accentImage:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=640&q=82",
    tags: ["Studio", "Lifestyle", "Profile", "Retouch", "Tạo dáng"],
    mood: "Hiện đại, cá nhân hóa, sắc nét",
  },
];

export const servicePackages: ServicePackage[] = [
  {
    id: "hao-le-prewedding-da-lat",
    serviceSlug: "wedding",
    photographerId: "hao-le",
    photographerName: "Hào Lê",
    packageName: "Pre-wedding Đà Lạt",
    location: "Đà Lạt, Lâm Đồng",
    distanceKm: 2.4,
    rating: 4.9,
    reviewCount: 128,
    price: 5000000,
    duration: "1 ngày chụp",
    addOns: ["Makeup", "Album", "Retouch"],
    nextSlot: "15/06 - 08:00",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=82",
    portfolioImages: [
      "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=120&q=80",
      "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=120&q=80",
    ],
    verified: true,
  },
  {
    id: "binh-nguyen-wedding-day",
    serviceSlug: "wedding",
    photographerId: "binh-nguyen",
    photographerName: "Bình Nguyễn",
    packageName: "Phóng sự cưới trọn ngày",
    location: "Quận 1, TP.HCM",
    distanceKm: 5.7,
    rating: 4.8,
    reviewCount: 96,
    price: 12000000,
    duration: "Sáng đến tối",
    addOns: ["Video", "Flycam", "Album"],
    nextSlot: "16/06 - 14:00",
    image:
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=82",
    portfolioImages: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=120&q=80",
      "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=120&q=80",
    ],
    verified: true,
  },
  {
    id: "hoang-anh-wedding-beach",
    serviceSlug: "wedding",
    photographerId: "hoang-anh",
    photographerName: "Hoàng Anh",
    packageName: "Ảnh cưới biển Đà Nẵng",
    location: "Mỹ Khê, Đà Nẵng",
    distanceKm: 8.6,
    rating: 4.7,
    reviewCount: 74,
    price: 7800000,
    duration: "6 giờ",
    addOns: ["Makeup", "Flycam", "Retouch"],
    nextSlot: "18/06 - 07:00",
    image:
      "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=900&q=82",
    portfolioImages: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=120&q=80",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=120&q=80",
    ],
  },
  {
    id: "hao-le-couple-hills",
    serviceSlug: "couple",
    photographerId: "hao-le",
    photographerName: "Hào Lê",
    packageName: "Couple lifestyle Đà Lạt",
    location: "Đồi cỏ hồng, Đà Lạt",
    distanceKm: 1.9,
    rating: 4.9,
    reviewCount: 142,
    price: 1800000,
    duration: "3 giờ",
    addOns: ["Concept", "Retouch", "Album mini"],
    nextSlot: "12/06 - 15:00",
    image:
      "https://images.unsplash.com/photo-1529634597503-139d3726fed5?auto=format&fit=crop&w=900&q=82",
    portfolioImages: [
      "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?auto=format&fit=crop&w=120&q=80",
      "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=120&q=80",
    ],
    verified: true,
  },
  {
    id: "hung-trinh-couple-city",
    serviceSlug: "couple",
    photographerId: "hung-trinh",
    photographerName: "Hưng Trịnh",
    packageName: "Love story trong phố",
    location: "TP.HCM",
    distanceKm: 4.2,
    rating: 4.8,
    reviewCount: 89,
    price: 2200000,
    duration: "2.5 giờ",
    addOns: ["Makeup", "Retouch"],
    nextSlot: "14/06 - 16:00",
    image:
      "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?auto=format&fit=crop&w=900&q=82",
    portfolioImages: [
      "https://images.unsplash.com/photo-1529634597503-139d3726fed5?auto=format&fit=crop&w=120&q=80",
      "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=120&q=80",
    ],
  },
  {
    id: "studio-k-couple-studio",
    serviceSlug: "couple",
    photographerId: "studio-k",
    photographerName: "Studio K",
    packageName: "Couple studio tối giản",
    location: "Cầu Giấy, Hà Nội",
    distanceKm: 9.1,
    rating: 4.7,
    reviewCount: 63,
    price: 1500000,
    duration: "2 giờ",
    addOns: ["Studio", "Retouch"],
    nextSlot: "17/06 - 10:00",
    image:
      "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=900&q=82",
    portfolioImages: [
      "https://images.unsplash.com/photo-1529634597503-139d3726fed5?auto=format&fit=crop&w=120&q=80",
      "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?auto=format&fit=crop&w=120&q=80",
    ],
  },
  {
    id: "binh-nguyen-portrait-editorial",
    serviceSlug: "portrait",
    photographerId: "binh-nguyen",
    photographerName: "Bình Nguyễn",
    packageName: "Portrait editorial cá nhân",
    location: "Quận 3, TP.HCM",
    distanceKm: 2.1,
    rating: 4.9,
    reviewCount: 116,
    price: 2500000,
    duration: "3 giờ",
    addOns: ["Stylist", "Retouch", "Tạo dáng"],
    nextSlot: "11/06 - 09:00",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=82",
    portfolioImages: [
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=120&q=80",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=120&q=80",
    ],
    verified: true,
  },
  {
    id: "hung-trinh-portrait-street",
    serviceSlug: "portrait",
    photographerId: "hung-trinh",
    photographerName: "Hưng Trịnh",
    packageName: "Street portrait",
    location: "TP.HCM",
    distanceKm: 3.8,
    rating: 4.8,
    reviewCount: 77,
    price: 1600000,
    duration: "2 giờ",
    addOns: ["Lifestyle", "Retouch"],
    nextSlot: "13/06 - 16:00",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=82",
    portfolioImages: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
    ],
  },
  {
    id: "studio-k-portrait-profile",
    serviceSlug: "portrait",
    photographerId: "studio-k",
    photographerName: "Studio K",
    packageName: "Ảnh profile studio",
    location: "Cầu Giấy, Hà Nội",
    distanceKm: 7.5,
    rating: 4.7,
    reviewCount: 58,
    price: 1200000,
    duration: "90 phút",
    addOns: ["Studio", "Retouch", "LinkedIn"],
    nextSlot: "15/06 - 13:30",
    image:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=900&q=82",
    portfolioImages: [
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=120&q=80",
    ],
  },
  {
    id: "may-studio-portrait-vintage",
    serviceSlug: "portrait",
    photographerId: "may-studio",
    photographerName: "May Studio",
    packageName: "Vintage film portrait",
    location: "Đà Nẵng",
    distanceKm: 6.4,
    rating: 4.9,
    reviewCount: 63,
    price: 1500000,
    duration: "1.5 giờ",
    addOns: ["Vintage", "Film", "Retouch"],
    nextSlot: "12/06 - 09:30",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=82",
    portfolioImages: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=120&q=80",
    ],
  },
];

export const allAddOns = ["Makeup", "Video", "Album", "Flycam", "Retouch", "Concept", "Studio", "Stylist"];

export function formatVnd(value: number) {
  return `${value.toLocaleString("vi-VN")} VND`;
}

export function getServiceBySlug(slug: string) {
  return serviceCategories.find((service) => service.slug === slug);
}
