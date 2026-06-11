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
      "https://i.pinimg.com/736x/26/e9/6c/26e96c6c35a006344570ac3fdcb44c41.jpg",
    accentImage:
      "https://i.pinimg.com/736x/d5/39/3f/d5393f1c798379d5dfdf1b85563074dc.jpg",
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
      "https://i.pinimg.com/736x/5b/59/1b/5b591b25939e47f8ef1e58e7d19ce2f1.jpg",
    accentImage:
      "https://i.pinimg.com/736x/5b/59/1b/5b591b25939e47f8ef1e58e7d19ce2f1.jpg",
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
      "https://i.pinimg.com/736x/9d/4d/50/9d4d50b9b37526003d3a2ce6b799f907.jpg",
    accentImage:
      "https://i.pinimg.com/736x/05/b8/2f/05b82fccfbf7594f39fc5f01355db3ea.jpg",
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
      "https://i.pinimg.com/736x/d5/39/3f/d5393f1c798379d5dfdf1b85563074dc.jpg",
    portfolioImages: [
      "https://i.pinimg.com/1200x/cf/97/1b/cf971b66ae3f2c9a892bf0c5b32cfde5.jpg",
      "https://i.pinimg.com/736x/9d/0d/00/9d0d00329a385eaf93551acdcf1aad88.jpg",
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
      "https://i.pinimg.com/736x/6d/c5/19/6dc519d3bd5450d7e06a71e0e5a2a845.jpg",
    portfolioImages: [
      "https://i.pinimg.com/736x/88/f0/a4/88f0a43b271ad694a8e10c7eeaf76ea4.jpg",
      "https://i.pinimg.com/1200x/18/33/4d/18334d20531bae69b882960af71a6113.jpg",
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
      "https://i.pinimg.com/736x/c9/12/65/c912651870f4269a0ef8d7833c8dc519.jpg",
    portfolioImages: [
      "https://i.pinimg.com/736x/98/fd/14/98fd14f0e0dbdc50d0aa5a7550ca66fc.jpg",
      "https://i.pinimg.com/1200x/ac/88/59/ac88598c891cad0cbe1920807b14187e.jpg",
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
      "https://i.pinimg.com/736x/bf/5e/49/bf5e49e7062fc00feb1a461198aa98f6.jpg",
    portfolioImages: [
      "https://i.pinimg.com/736x/64/c2/9d/64c29d36aa963ae723727c560001f206.jpg",
      "https://i.pinimg.com/1200x/21/1d/dd/211ddd9c37e190038cb3b575c777daad.jpg",
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
      "https://i.pinimg.com/1200x/8b/00/a4/8b00a4d00fd643af0017e6be5a397309.jpg",
    portfolioImages: [
      "https://i.pinimg.com/1200x/9d/e3/da/9de3da652483ed03158d917e1dd0672f.jpg",
      "https://i.pinimg.com/1200x/a3/e3/dc/a3e3dc01b70ca75e9f3592a8e9822fa6.jpg",
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
      "https://i.pinimg.com/1200x/80/ba/6d/80ba6d75407a7bcaf0b843654efb5124.jpg",
    portfolioImages: [
      "https://i.pinimg.com/736x/a4/ba/dd/a4baddad6811e1ad64fc1c51063e577b.jpg",
      "https://i.pinimg.com/736x/7a/ce/c1/7acec1272414faa5de3ea436b15be8b6.jpg",
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
      "https://i.pinimg.com/736x/66/53/e9/6653e98495ff276ffd2f071d208b9f79.jpg",
    portfolioImages: [
      "https://i.pinimg.com/736x/49/99/fb/4999fb2b2439e2eab91b90796f661fb5.jpg",
      "https://i.pinimg.com/736x/ca/cd/22/cacd22c47c995c775fd9d703d8dfcde3.jpg",
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
      "https://i.pinimg.com/736x/7f/6d/ea/7f6dea8c0c4a009fd748093eab6e28a6.jpg",
    portfolioImages: [
      "https://i.pinimg.com/736x/39/93/83/39938326bb88ddebf1fd47a0dc9bf185.jpg",
      "https://i.pinimg.com/736x/9b/06/f8/9b06f86077a74faf635aa66962e09e64.jpg",
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
      "https://i.pinimg.com/736x/a2/97/df/a297df54f189b79e0a2a3e650d3ec0f3.jpg",
    portfolioImages: [
      "https://i.pinimg.com/736x/ae/9c/3c/ae9c3c9c39c8a84edd3a904ee042a089.jpg",
      "https://i.pinimg.com/736x/14/ff/0a/14ff0ae1b4982409b3a1493278afb7c0.jpg",
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
      "https://i.pinimg.com/1200x/58/5a/ea/585aea037b8a1d5f364358167d899f29.jpg",
    portfolioImages: [
      "https://i.pinimg.com/1200x/95/f9/a7/95f9a72dd8ca32b42bd62677fc09cfaf.jpg",
      "https://i.pinimg.com/1200x/d3/0b/bd/d30bbdd512f5de127a22c051ff2f6042.jpg",
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
