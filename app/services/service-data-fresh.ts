export type ServiceSlug = "wedding" | "couple" | "portrait" | "event" | "yearbook" | "travel" | "food";

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
  {
    slug: "event",
    eyebrow: "Event photography",
    title: "Chụp ảnh sự kiện",
    shortTitle: "Sự kiện",
    description:
      "Ghi lại mọi khoảnh khắc sự kiện, hội nghị, khai trương và tiệc tùng với phong cách chuyên nghiệp.",
    longDescription:
      "Bắt trọn không khí, diễn biến và cảm xúc của sự kiện với những khung hình reportage, chân dung khách mời và ảnh tổng thể.",
    startingPrice: "Từ 2.000.000 VND",
    photographerCount: "760+ photographer",
    heroImage:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80&fit=crop",
    accentImage:
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=640&q=80&fit=crop",
    tags: ["Sự kiện", "Hội nghị", "Phóng sự", "Live", "Truyền thông"],
    mood: "Năng động, sôi nổi, chuyên nghiệp",
  },
  {
    slug: "yearbook",
    eyebrow: "Yearbook photography",
    title: "Chụp ảnh kỷ yếu",
    shortTitle: "Kỷ yếu",
    description:
      "Ảnh kỷ yếu cá tính, ghi lại thanh xuân trường lớp và những khoảnh khắc bạn bè đáng nhớ.",
    longDescription:
      "Tạo album kỷ yếu độc đáo với phong cách trẻ trung, năng động và sáng tạo, phù hợp từng nhóm bạn và cá tính riêng.",
    startingPrice: "Từ 1.200.000 VND",
    photographerCount: "520+ photographer",
    heroImage:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80&fit=crop",
    accentImage:
      "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=640&q=80&fit=crop",
    tags: ["Kỷ yếu", "Tốt nghiệp", "Nhóm bạn", "Trang phục", "Sáng tạo"],
    mood: "Tươi trẻ, thân mật, đầy hoài niệm",
  },
  {
    slug: "travel",
    eyebrow: "Travel photography",
    title: "Chụp ảnh du lịch",
    shortTitle: "Travel",
    description:
      "Ghi lại hành trình và những bức ảnh du lịch đẹp mắt, từ phố phường đến cảnh thiên nhiên.",
    longDescription:
      "Đồng hành cùng bạn trong mỗi chuyến đi với ảnh phong cảnh, portrait du lịch và khoảnh khắc trải nghiệm độc đáo.",
    startingPrice: "Từ 1.800.000 VND",
    photographerCount: "630+ photographer",
    heroImage:
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=80&fit=crop",
    accentImage:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=640&q=80&fit=crop",
    tags: ["Ngoại cảnh", "Lifestyle", "Phiêu lưu", "Cảnh đẹp", "Story"],
    mood: "Phiêu lưu, phóng khoáng, sáng tạo",
  },
  {
    slug: "food",
    eyebrow: "Food photography",
    title: "Chụp ảnh ẩm thực",
    shortTitle: "Food",
    description:
      "Tôn vinh màu sắc, kết cấu và hương vị món ăn qua những bức ảnh đẹp mắt và chuyên nghiệp.",
    longDescription:
      "Chụp menu, đầu bếp và food styling cho nhà hàng, cafe hoặc thương hiệu thực phẩm với phong cách editorial.",
    startingPrice: "Từ 1.500.000 VND",
    photographerCount: "410+ photographer",
    heroImage:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
    accentImage:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd",
    tags: ["Ẩm thực", "Food styling", "Menu", "Editorial", "Fine dining"],
    mood: "Tinh tế, ngon mắt, sang trọng",
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
    nextSlot:
      "14/06 - 16:00",
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
  {
    id: "minh-anh-event-hanoi",
    serviceSlug: "event",
    photographerId: "minh-anh",
    photographerName: "Minh Anh",
    packageName: "Event reportage Hà Nội",
    location: "Hà Nội",
    distanceKm: 3.2,
    rating: 4.8,
    reviewCount: 54,
    price: 2200000,
    duration: "4 giờ",
    addOns: ["Video", "Retouch", "Flycam"],
    nextSlot: "20/06 - 10:00",
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80&fit=crop",
    portfolioImages: [
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400&q=80&fit=crop",
      "https://images.unsplash.com/photo-1531058020387-3be344556be6?w=400&q=80&fit=crop",
    ],
  },
  {
    id: "linh-hoa-event-sai-gon",
    serviceSlug: "event",
    photographerId: "linh-hoa",
    photographerName: "Linh Hoa",
    packageName: "Sự kiện doanh nghiệp Sài Gòn",
    location: "TP. Hồ Chí Minh",
    distanceKm: 2.1,
    rating: 4.7,
    reviewCount: 68,
    price: 2500000,
    duration: "5 giờ",
    addOns: ["Live", "Phóng sự", "Retouch"],
    nextSlot: "21/06 - 09:00",
    image:
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80&fit=crop",
    portfolioImages: [
      "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400&q=80&fit=crop",
      "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400&q=80&fit=crop",
    ],
  },
  {
    id: "quang-viet-event-da-nang",
    serviceSlug: "event",
    photographerId: "quang-viet",
    photographerName: "Quang Việt",
    packageName: "Sự kiện Đà Nẵng",
    location: "Đà Nẵng",
    distanceKm: 6.3,
    rating: 4.8,
    reviewCount: 42,
    price: 2100000,
    duration: "4 giờ",
    addOns: ["Video", "Flycam", "Album"],
    nextSlot: "24/06 - 14:00",
    image:
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80&fit=crop",
    portfolioImages: [
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&q=80&fit=crop",
      "https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&q=80&fit=crop",
    ],
  },
  {
    id: "thu-hien-yearbook-hn",
    serviceSlug: "yearbook",
    photographerId: "thu-hien",
    photographerName: "Thu Hiền",
    packageName: "Kỷ yếu sáng tạo Hà Nội",
    location: "Hà Nội",
    distanceKm: 2.8,
    rating: 4.9,
    reviewCount: 48,
    price: 1300000,
    duration: "3 giờ",
    addOns: ["Concept", "Retouch", "Studio"],
    nextSlot: "22/06 - 14:00",
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80&fit=crop",
    portfolioImages: [
      "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&q=80&fit=crop",
      "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&q=80&fit=crop",
    ],
  },
  {
    id: "linh-anh-yearbook-sai-gon",
    serviceSlug: "yearbook",
    photographerId: "linh-anh",
    photographerName: "Linh Anh",
    packageName: "Kỷ yếu năng động Sài Gòn",
    location: "TP. Hồ Chí Minh",
    distanceKm: 5.0,
    rating: 4.7,
    reviewCount: 37,
    price: 1400000,
    duration: "3.5 giờ",
    addOns: ["Makeup", "Concept", "Album"],
    nextSlot: "25/06 - 10:00",
    image:
      "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&q=80&fit=crop",
    portfolioImages: [
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=80&fit=crop",
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&q=80&fit=crop",
    ],
  },
  {
    id: "hoa-mai-yearbook-da-lat",
    serviceSlug: "yearbook",
    photographerId: "hoa-mai",
    photographerName: "Hoa Mai",
    packageName: "Kỷ yếu Đà Lạt",
    location: "Đà Lạt",
    distanceKm: 8.3,
    rating: 4.8,
    reviewCount: 44,
    price: 1450000,
    duration: "4 giờ",
    addOns: ["Album", "Retouch", "Studio"],
    nextSlot: "26/06 - 08:30",
    image:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80&fit=crop",
    portfolioImages: [
      "https://images.unsplash.com/photo-1627556704302-624286467c65?w=400&q=80&fit=crop",
      "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400&q=80&fit=crop",
    ],
  },
  {
    id: "anh-travel-mui-ne",
    serviceSlug: "travel",
    photographerId: "anh-travel",
    photographerName: "Anh Travel",
    packageName: "Travel story Mũi Né",
    location: "Mũi Né, Bình Thuận",
    distanceKm: 7.9,
    rating: 4.8,
    reviewCount: 38,
    price: 1850000,
    duration: "5 giờ",
    addOns: ["Concept", "Retouch", "Flycam"],
    nextSlot: "18/06 - 08:30",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80&fit=crop",
    portfolioImages: [
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&q=80&fit=crop",
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&q=80&fit=crop",
    ],
  },
  {
    id: "tu-anh-travel-da-nang",
    serviceSlug: "travel",
    photographerId: "tu-anh",
    photographerName: "Tú Anh",
    packageName: "Travel style Đà Nẵng",
    location: "Đà Nẵng",
    distanceKm: 6.7,
    rating: 4.8,
    reviewCount: 33,
    price: 1900000,
    duration: "5.5 giờ",
    addOns: ["Lifestyle", "Retouch", "Flycam"],
    nextSlot: "24/06 - 09:00",
    image:
      "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80&fit=crop",
    portfolioImages: [
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400&q=80&fit=crop",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80&fit=crop",
    ],
  },
  {
    id: "duc-long-travel-sapa",
    serviceSlug: "travel",
    photographerId: "duc-long",
    photographerName: "Đức Long",
    packageName: "Travel Sapa mùa hoa",
    location: "Sapa, Lào Cai",
    distanceKm: 12.4,
    rating: 4.7,
    reviewCount: 27,
    price: 1750000,
    duration: "4 giờ",
    addOns: ["Concept", "Retouch", "Nature"],
    nextSlot: "23/06 - 08:30",
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80&fit=crop",
    portfolioImages: [
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=80&fit=crop",
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&q=80&fit=crop",
    ],
  },
  {
    id: "nha-bep-food-saigon",
    serviceSlug: "food",
    photographerId: "nha-bep",
    photographerName: "Nhà Bếp Studio",
    packageName: "Ảnh ẩm thực Sài Gòn",
    location: "Quận 1, TP.HCM",
    distanceKm: 4.5,
    rating: 4.9,
    reviewCount: 29,
    price: 1550000,
    duration: "2.5 giờ",
    addOns: ["Studio", "Retouch", "Concept"],
    nextSlot: "19/06 - 11:00",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
    portfolioImages: [
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38",
      "https://images.unsplash.com/photo-1482049016688-2d3e1b311543",
    ],
  },
  {
    id: "viet-hung-food-hanoi",
    serviceSlug: "food",
    photographerId: "viet-hung",
    photographerName: "Việt Hùng",
    packageName: "Ảnh ẩm thực Hà Nội",
    location: "Hà Nội",
    distanceKm: 3.1,
    rating: 4.8,
    reviewCount: 35,
    price: 1450000,
    duration: "3 giờ",
    addOns: ["Food styling", "Retouch", "Studio"],
    nextSlot: "21/06 - 10:30",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38",
    portfolioImages: [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288",
    ],
  },
  {
    id: "thu-trang-food-da-lat",
    serviceSlug: "food",
    photographerId: "thu-trang",
    photographerName: "Thu Trang",
    packageName: "Ảnh ẩm thực Đà Lạt",
    location: "Đà Lạt",
    distanceKm: 8.9,
    rating: 4.7,
    reviewCount: 24,
    price: 1480000,
    duration: "3 giờ",
    addOns: ["Food styling", "Retouch", "Editorial"],
    nextSlot: "23/06 - 09:00",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd",
    portfolioImages: [
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061",
      "https://images.unsplash.com/photo-1543353071-873f17a7a088",
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
