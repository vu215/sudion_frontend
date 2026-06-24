"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";

const photographers = [
  {
    id: "binh-nguyen",
    name: "Bình Nguyễn",
    title: "Thời trang & Chân dung",
    location: "Tp. HCM, Việt Nam",
    rating: "4.9",
    reviewCount: 820,
    badge: "Top Rated Photographer",
    image: "https://i.pinimg.com/736x/a0/b0/00/a0b000947356b75df1e4ec794477fc49.jpg",
    avatar: "https://i.pinimg.com/736x/9c/44/0c/9c440c4652d4e4476a5c61d25efbef1e.jpg",
    cover: "https://i.pinimg.com/736x/bb/cc/37/bbcc37f0caa97bdff1f08ad8355ac9f4.jpg",
    bio: "Xin chào, tôi là Bình Nguyễn. Với hơn 5 năm kinh nghiệm trong lĩnh vực nhiếp ảnh thời trang và chân dung, tôi luôn nỗ lực nắm bắt những khoảnh khắc chân thực và tôn lên vẻ đẹp riêng biệt của mỗi cá nhân. Phong cách của tôi hướng đến sự thanh lịch, hiện đại và tràn đầy cảm xúc. Tôi tin rằng mỗi bức ảnh là một câu chuyện, và tôi ở đây để giúp bạn kể câu chuyện của mình một cách hoàn hảo nhất.",
    portfolio: [
      "https://i.pinimg.com/736x/d3/16/cf/d316cf2cef71d3a0b9ff9cc2fc778052.jpg",
      "https://i.pinimg.com/736x/4e/4c/5a/4e4c5a0596692b041ad52af1a4c6fec2.jpg",
      "https://i.pinimg.com/736x/e2/d4/2c/e2d42cac2f246dd143b7561d7156a1fd.jpg",
      "https://i.pinimg.com/736x/e2/d4/2c/e2d42cac2f246dd143b7561d7156a1fd.jpg",
      "https://i.pinimg.com/736x/d3/16/cf/d316cf2cef71d3a0b9ff9cc2fc778052.jpg",
    ],
    equipment: ["Sony A7R IV", "Canon 5D Mark IV", "24-70mm f/2.8 GM"],
    services: [
      { name: "Chân dung cá nhân (Portrait)", desc: "Chụp tại studio hoặc ngoại cảnh. Giao 15 ảnh chỉnh sửa chi tiết, hỗ trợ 1 concept trang phục.", price: "2.500.000 VNĐ" },
      { name: "Thời trang thương mại (Fashion)", desc: "Gói chụp lookbook tiêu chuẩn cho các brand thời trang. Bao gồm thiết bị chiếu sáng chuyên nghiệp.", price: "5.000.000 VNĐ" },
      { name: "Phóng sự cưới (Wedding)", desc: "Lưu giữ những khoảnh khắc tự nhiên nhất trong ngày trọng đại. Trọn gói 1 ngày chụp.", price: "12.000.000 VNĐ" },
    ],
    reviews: [
      { name: "Nguyễn Hoàng Yến", time: "2 tuần trước", rating: 5, text: "Anh Tuấn rất nhiệt tình, chụp ảnh đẹp và chỉnh sửa rất nhanh. Chúng mình rất hài lòng với bộ ảnh cưới này. Không gian chụp cũng được anh setup..." },
      { name: "Trần Minh", time: "1 tháng trước", rating: 5, text: "Style màu ảnh cinematic cực kỳ hợp gu mình. Quá trình làm việc chuyên nghiệp, file giao đúng hạn. Chắc chắn sẽ quay lại ủng hộ studio trong..." },
    ],
    ratingScore: 4.9,
    totalReviews: 128,
    startPrice: "2.500.000 VNĐ",
  },
  {
    id: "hao-le",
    name: "Hào Lê",
    title: "Cưới & Cặp đôi",
    location: "Đà Lạt, Việt Nam",
    rating: "4.8",
    reviewCount: 176,
    badge: "Top Rated Photographer",
    image: "https://i.pinimg.com/736x/d3/16/cf/d316cf2cef71d3a0b9ff9cc2fc778052.jpg",
    avatar: "https://i.pinimg.com/736x/a0/b0/00/a0b000947356b75df1e4ec794477fc49.jpg",
    cover: "https://i.pinimg.com/736x/a0/b0/00/a0b000947356b75df1e4ec794477fc49.jpg",
    bio: "Chuyên gia nhiếp ảnh cưới và cặp đôi tại Đà Lạt. Với góc nhìn lãng mạn và phong cách tự nhiên, tôi giúp các cặp đôi lưu giữ những khoảnh khắc đẹp nhất trong ngày trọng đại.",
    portfolio: [
      "https://i.pinimg.com/736x/55/1c/16/551c16fba1056bd0e5862cb552b66513.jpg",
      "https://i.pinimg.com/736x/9c/44/0c/9c440c4652d4e4476a5c61d25efbef1e.jpg",
      "https://i.pinimg.com/736x/a9/60/35/a9603541b3d536cab535250572903e28.jpg",
      "https://i.pinimg.com/1200x/bf/96/6a/bf966a251881671b7e6e0652665ebae1.jpg",
    ],
    equipment: ["Sony A7 III", "85mm f/1.4 GM", "Flycam DJI Mini 3"],
    services: [
      { name: "Pre-wedding Đà Lạt", desc: "Chụp ngoại cảnh tại các địa điểm đẹp ở Đà Lạt, phong cách lãng mạn và tự nhiên.", price: "5.000.000 VNĐ" },
      { name: "Phóng sự cưới trọn ngày", desc: "Trọn gói từ sáng đến tối, bao gồm flycam và album cao cấp.", price: "15.000.000 VNĐ" },
    ],
    reviews: [
      { name: "Minh Châu", time: "1 tuần trước", rating: 5, text: "Anh Hào chụp rất đẹp, phong cách lãng mạn đúng như mong đợi. Bộ ảnh pre-wedding của chúng mình ai xem cũng khen..." },
      { name: "Bảo Trân", time: "3 tuần trước", rating: 5, text: "Rất hài lòng với dịch vụ. Anh Hào rất tận tình và chuyên nghiệp. File ảnh giao đúng hẹn và chất lượng xuất sắc..." },
    ],
    ratingScore: 4.8,
    totalReviews: 176,
    startPrice: "5.000.000 VNĐ",
  },
  {
    id: "studio-k",
    name: "Studio K",
    title: "Sản phẩm & Thương mại",
    location: "Hà Nội, Việt Nam",
    rating: "4.7",
    badge: "Professional Studio",
    image: "https://i.pinimg.com/736x/eb/77/e1/eb77e13b0d770ef3091af4e459f77181.jpg",
    avatar: "https://i.pinimg.com/736x/eb/77/e1/eb77e13b0d770ef3091af4e459f77181.jpg",
    cover: "https://i.pinimg.com/736x/d2/27/a2/d227a2a75b3904a201772c24c4c59e88.jpg",
    bio: "Studio chuyên chụp ảnh sản phẩm và thương mại tại Hà Nội. Trang bị studio hiện đại, đội ngũ chuyên nghiệp với kinh nghiệm phục vụ nhiều thương hiệu lớn trong và ngoài nước.",
    portfolio: [
      "https://i.pinimg.com/736x/bb/cc/37/bbcc37f0caa97bdff1f08ad8355ac9f4.jpg",
      "https://i.pinimg.com/736x/9c/44/0c/9c440c4652d4e4476a5c61d25efbef1e.jpg",
      "https://i.pinimg.com/736x/e2/d4/2c/e2d42cac2f246dd143b7561d7156a1fd.jpg",
      "https://i.pinimg.com/736x/e2/d4/2c/e2d42cac2f246dd143b7561d7156a1fd.jpg",
    ],
    equipment: ["Hasselblad X2D", "Phase One", "Studio Lighting Profoto"],
    services: [
      { name: "Chụp ảnh sản phẩm cơ bản", desc: "10-15 sản phẩm background trắng, phù hợp e-commerce. Giao file trong 24h.", price: "1.800.000 VNĐ" },
      { name: "Lookbook thương hiệu", desc: "Lookbook đầy đủ cho thương hiệu thời trang, bao gồm stylist và model.", price: "8.000.000 VNĐ" },
    ],
    reviews: [
      { name: "Thanh Hà", time: "5 ngày trước", rating: 5, text: "Studio K chụp sản phẩm rất đẹp, ánh sáng chuẩn, màu sắc trung thực. Giao file nhanh chóng và chuyên nghiệp..." },
    ],
    ratingScore: 4.7,
    totalReviews: 89,
    startPrice: "1.800.000 VNĐ",
  },
  {
    id: "hung-trinh",
    name: "Hưng Trịnh",
    title: "Thời trang & Biên tập",
    location: "Vĩnh Long, Việt Nam",
    rating: "4.9",
    badge: "Top Rated Photographer",
    image: "https://i.pinimg.com/1200x/c7/f9/1c/c7f91ceb6242dd1b2e29a2bf217ac6f2.jpg",
    avatar: "https://i.pinimg.com/1200x/e1/25/2c/e1252c8cfb12860877eb7937bafcf47b.jpg",
    cover: "https://i.pinimg.com/1200x/e1/25/2c/e1252c8cfb12860877eb7937bafcf47b.jpg",
    bio: "Nhiếp ảnh gia trẻ với phong cách độc đáo, kết hợp giữa thời trang đường phố và chân dung nghệ thuật. Mỗi bức ảnh là một tác phẩm kể câu chuyện riêng.",
    portfolio: [
      "https://i.pinimg.com/736x/4e/4c/5a/4e4c5a0596692b041ad52af1a4c6fec2.jpg",
      "https://i.pinimg.com/736x/d2/27/a2/d227a2a75b3904a201772c24c4c59e88.jpg",
      "https://i.pinimg.com/736x/4e/4c/5a/4e4c5a0596692b041ad52af1a4c6fec2.jpg",
    ],
    equipment: ["Canon R5", "50mm f/1.2L", "35mm f/1.4L"],
    services: [
      { name: "Street Portrait", desc: "Chụp ngoài trời phong cách đường phố, tự nhiên và cá tính.", price: "2.500.000 VNĐ" },
    ],
    reviews: [
      { name: "Lan Anh", time: "1 tuần trước", rating: 5, text: "Hưng chụp rất có hồn, góc nhìn độc đáo và sáng tạo. Rất vui khi được làm việc cùng..." },
    ],
    ratingScore: 4.9,
    totalReviews: 64,
    startPrice: "2.500.000 VNĐ",
  },
  {
    id: "hoang-anh",
    name: "Hoàng Anh",
    title: "Cưới & Cặp đôi",
    location: "Đà Nẵng, Việt Nam",
    rating: "4.8",
    badge: "Top Rated Photographer",
    image: "https://i.pinimg.com/736x/55/1c/16/551c16fba1056bd0e5862cb552b66513.jpg",
    avatar: "https://i.pinimg.com/736x/55/1c/16/551c16fba1056bd0e5862cb552b66513.jpg",
    cover: "https://i.pinimg.com/736x/bb/cc/37/bbcc37f0caa97bdff1f08ad8355ac9f4.jpg",
    bio: "Chuyên nhiếp ảnh cưới tại Đà Nẵng với phong cách hiện đại và tươi sáng. Mỗi bộ ảnh là một câu chuyện tình yêu được kể bằng ngôn ngữ của ánh sáng.",
    portfolio: [
      "https://i.pinimg.com/736x/a0/b0/00/a0b000947356b75df1e4ec794477fc49.jpg",
      "https://i.pinimg.com/736x/d3/16/cf/d316cf2cef71d3a0b9ff9cc2fc778052.jpg",
      "https://i.pinimg.com/736x/bb/cc/37/bbcc37f0caa97bdff1f08ad8355ac9f4.jpg",
    ],
    equipment: ["Sony A1", "24-70mm f/2.8 GM II", "DJI Air 3"],
    services: [
      { name: "Chụp ảnh Cưới Đà Nẵng", desc: "Gói cưới đầy đủ tại Đà Nẵng, bao gồm biển Mỹ Khê và bán đảo Sơn Trà.", price: "12.000.000 VNĐ" },
    ],
    reviews: [
      { name: "Thu Thảo", time: "2 tuần trước", rating: 5, text: "Hoàng Anh chụp ảnh cưới rất đẹp, phong cách tươi sáng và lãng mạn. Chúng mình rất hài lòng..." },
    ],
    ratingScore: 4.8,
    totalReviews: 112,
    startPrice: "12.000.000 VNĐ",
  },
  {
    id: "cong-tuan",
    name: "Công Tuấn",
    title: "Ẩm thực & Thương mại",
    location: "Huế, Việt Nam",
    rating: "4.7",
    badge: "Professional Photographer",
    image: "https://i.pinimg.com/736x/bb/cc/37/bbcc37f0caa97bdff1f08ad8355ac9f4.jpg",
    avatar: "https://i.pinimg.com/736x/bb/cc/37/bbcc37f0caa97bdff1f08ad8355ac9f4.jpg",
    cover: "https://i.pinimg.com/736x/44/92/2b/44922b0a2eb2d9614dc9cf075e4b0b76.jpg",
    bio: "Nhiếp ảnh gia ẩm thực và thương mại tại Huế. Chuyên chụp sản phẩm ẩm thực, nhà hàng và các chiến dịch marketing địa phương.",
    portfolio: [
      "https://i.pinimg.com/736x/d3/16/cf/d316cf2cef71d3a0b9ff9cc2fc778052.jpg",
      "https://i.pinimg.com/736x/44/92/2b/44922b0a2eb2d9614dc9cf075e4b0b76.jpg",
      "https://i.pinimg.com/736x/d3/16/cf/d316cf2cef71d3a0b9ff9cc2fc778052.jpg",
    ],
    equipment: ["Nikon Z7 II", "Macro 105mm", "85mm f/1.8S"],
    services: [
      { name: "Chụp ảnh Ẩm thực", desc: "Chụp ảnh món ăn, menu nhà hàng, phong cách tươi sáng và hấp dẫn.", price: "1.800.000 VNĐ" },
    ],
    reviews: [
      { name: "Minh Khôi", time: "3 tuần trước", rating: 4, text: "Ảnh ẩm thực rất đẹp, màu sắc tươi sáng và hấp dẫn. Giao file đúng hẹn..." },
    ],
    ratingScore: 4.7,
    totalReviews: 47,
    startPrice: "1.800.000 VNĐ",
  },
  {
    id: "may-studio",
    name: "May Studio",
    title: "Chân dung & Vintage",
    location: "Đà Nẵng, Việt Nam",
    rating: "4.9",
    reviewCount: 63,
    badge: "Top Rated Photographer",
    image: "https://i.pinimg.com/736x/9d/4d/50/9d4d50b9b37526003d3a2ce6b799f907.jpg",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    cover: "https://i.pinimg.com/736x/05/b8/2f/05b82fccfbf7594f39fc5f01355db3ea.jpg",
    bio: "May Studio chuyên về phong cách vintage film và chân dung nghệ thuật tại Đà Nẵng. Chúng tôi mang lại những bức ảnh đậm chất hoài niệm, mềm mại và giàu cảm xúc.",
    portfolio: [
      "https://i.pinimg.com/1200x/58/5a/ea/585aea037b8a1d5f364358167d899f29.jpg",
      "https://i.pinimg.com/1200x/95/f9/a7/95f9a72dd8ca32b42bd62677fc09cfaf.jpg",
      "https://i.pinimg.com/1200x/d3/0b/bd/d30bbdd512f5de127a22c051ff2f6042.jpg",
    ],
    equipment: ["Contax T2", "Canon AE-1", "Fujifilm X-T5"],
    services: [
      { name: "Vintage Film Portrait", desc: "Chụp chân dung phong cách vintage film, màu sắc nhẹ nhàng và hoài niệm.", price: "1.500.000 VNĐ" },
      { name: "Studio Portrait", desc: "Chụp tại studio với ánh sáng chuyên nghiệp, giao 20 ảnh chỉnh sửa.", price: "1.800.000 VNĐ" },
    ],
    reviews: [
      { name: "Linh Chi", time: "1 tuần trước", rating: 5, text: "Màu phim vintage của May Studio cực kỳ đẹp, đúng style mình thích. Rất hài lòng!" },
      { name: "Quốc Anh", time: "2 tuần trước", rating: 5, text: "Chụp chân dung nghệ thuật rất có hồn, đội ngũ thân thiện và chuyên nghiệp." },
    ],
    ratingScore: 4.9,
    totalReviews: 63,
    startPrice: "1.500.000 VNĐ",
  },
  {
    id: "minh-anh",
    name: "Minh Anh",
    title: "Sự kiện & Phóng sự",
    location: "Hà Nội, Việt Nam",
    rating: "4.8",
    reviewCount: 54,
    badge: "Professional Photographer",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    cover: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678",
    bio: "Minh Anh là nhiếp ảnh gia sự kiện và phóng sự tại Hà Nội với 6 năm kinh nghiệm. Chuyên ghi lại những khoảnh khắc chân thực, sống động trong hội nghị, lễ khai trương và các sự kiện doanh nghiệp.",
    portfolio: [
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678",
      "https://images.unsplash.com/photo-1531058020387-3be344556be6",
    ],
    equipment: ["Canon R6 Mark II", "24-70mm f/2.8L", "70-200mm f/2.8L"],
    services: [
      { name: "Event Reportage Hà Nội", desc: "Chụp phóng sự sự kiện 4 giờ, bao gồm flycam và video highlight.", price: "2.200.000 VNĐ" },
      { name: "Hội nghị & Hội thảo", desc: "Ghi lại toàn bộ diễn biến hội nghị, chân dung diễn giả và khách mời.", price: "3.000.000 VNĐ" },
    ],
    reviews: [
      { name: "Thanh Tùng", time: "1 tuần trước", rating: 5, text: "Minh Anh chụp sự kiện rất chuyên nghiệp, bắt được nhiều khoảnh khắc đẹp. Rất đáng tiền!" },
      { name: "Hoa Lê", time: "3 tuần trước", rating: 5, text: "Phóng sự của anh Minh Anh rất tự nhiên và sống động. Hài lòng 100%." },
    ],
    ratingScore: 4.8,
    totalReviews: 54,
    startPrice: "2.200.000 VNĐ",
  },
  {
    id: "linh-hoa",
    name: "Linh Hoa",
    title: "Sự kiện & Doanh nghiệp",
    location: "TP. Hồ Chí Minh, Việt Nam",
    rating: "4.7",
    reviewCount: 68,
    badge: "Professional Photographer",
    image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
    cover: "https://images.unsplash.com/photo-1523580494863-6f3031224c94",
    bio: "Linh Hoa chuyên chụp ảnh sự kiện doanh nghiệp tại TP.HCM. Với phong cách phóng sự tự nhiên và góc nhìn sắc bén, tôi giúp các thương hiệu lưu giữ những khoảnh khắc quan trọng một cách chuyên nghiệp.",
    portfolio: [
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2",
      "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04",
      "https://images.unsplash.com/photo-1523580494863-6f3031224c94",
    ],
    equipment: ["Sony A7 IV", "35mm f/1.4 GM", "85mm f/1.4 GM"],
    services: [
      { name: "Sự kiện doanh nghiệp Sài Gòn", desc: "Chụp 5 giờ, bao gồm ảnh live, phóng sự và retouch chuyên nghiệp.", price: "2.500.000 VNĐ" },
      { name: "Khai trương & Ra mắt sản phẩm", desc: "Gói đầy đủ cho sự kiện khai trương, bao gồm ảnh không gian và khách mời.", price: "3.500.000 VNĐ" },
    ],
    reviews: [
      { name: "Minh Trí", time: "5 ngày trước", rating: 5, text: "Linh Hoa chụp sự kiện rất đẹp, ảnh tự nhiên và sắc nét. Rất chuyên nghiệp!" },
      { name: "Bích Ngọc", time: "2 tuần trước", rating: 4, text: "Hài lòng với chất lượng ảnh, giao đúng hẹn. Sẽ book lại cho sự kiện sau." },
    ],
    ratingScore: 4.7,
    totalReviews: 68,
    startPrice: "2.500.000 VNĐ",
  },
  {
    id: "quang-viet",
    name: "Quang Việt",
    title: "Sự kiện & Flycam",
    location: "Đà Nẵng, Việt Nam",
    rating: "4.8",
    reviewCount: 42,
    badge: "Professional Photographer",
    image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
    cover: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30",
    bio: "Quang Việt là nhiếp ảnh gia sự kiện tại Đà Nẵng, chuyên kết hợp flycam và ảnh mặt đất để tạo ra góc nhìn toàn diện và ấn tượng cho mọi sự kiện.",
    portfolio: [
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3",
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30",
      "https://images.unsplash.com/photo-1511578314322-379afb476865",
    ],
    equipment: ["Sony A7R V", "DJI Mavic 3 Pro", "24-70mm f/2.8 GM"],
    services: [
      { name: "Sự kiện Đà Nẵng", desc: "Chụp 4 giờ kết hợp flycam và ảnh mặt đất, giao video + ảnh album.", price: "2.100.000 VNĐ" },
      { name: "Gói Flycam + Ảnh", desc: "Flycam chuyên nghiệp kết hợp chụp ảnh toàn cảnh sự kiện.", price: "2.800.000 VNĐ" },
    ],
    reviews: [
      { name: "Tuấn Khải", time: "1 tuần trước", rating: 5, text: "Ảnh flycam của Quang Việt rất đẹp, góc nhìn độc đáo. Sự kiện của chúng tôi được ghi lại rất trọn vẹn." },
      { name: "Mai Hương", time: "1 tháng trước", rating: 5, text: "Chuyên nghiệp, đúng giờ và ảnh chất lượng cao. Rất hài lòng!" },
    ],
    ratingScore: 4.8,
    totalReviews: 42,
    startPrice: "2.100.000 VNĐ",
  },
  {
    id: "thu-hien",
    name: "Thu Hiền",
    title: "Kỷ yếu & Chân dung",
    location: "Hà Nội, Việt Nam",
    rating: "4.9",
    reviewCount: 48,
    badge: "Top Rated Photographer",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop",
    cover: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f",
    bio: "Thu Hiền là nhiếp ảnh gia kỷ yếu sáng tạo tại Hà Nội. Với con mắt thẩm mỹ tinh tế và cách tiếp cận trẻ trung, tôi giúp các bạn học sinh, sinh viên có những bộ ảnh kỷ yếu đầy cá tính và đáng nhớ.",
    portfolio: [
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac",
      "https://images.unsplash.com/photo-1541339907198-e08756dedf3f",
      "https://images.unsplash.com/photo-1580582932707-520aed937b7b",
    ],
    equipment: ["Fujifilm X-T5", "56mm f/1.2 XF", "Canon R8"],
    services: [
      { name: "Kỷ yếu sáng tạo Hà Nội", desc: "Chụp 3 giờ với concept độc đáo, retouch chuyên sâu và studio setup.", price: "1.300.000 VNĐ" },
      { name: "Kỷ yếu nhóm", desc: "Gói chụp nhóm từ 10-30 người, phong cách sáng tạo và năng động.", price: "2.500.000 VNĐ" },
    ],
    reviews: [
      { name: "Ngọc Linh", time: "3 ngày trước", rating: 5, text: "Chị Thu Hiền chụp kỷ yếu đẹp lắm! Concept sáng tạo và ảnh rất có hồn. Cả nhóm đều thích!" },
      { name: "Đức Minh", time: "2 tuần trước", rating: 5, text: "Giá phải chăng mà chất lượng ảnh xuất sắc. Sẽ recommend cho các bạn khóa sau." },
    ],
    ratingScore: 4.9,
    totalReviews: 48,
    startPrice: "1.300.000 VNĐ",
  },
  {
    id: "linh-anh",
    name: "Linh Anh",
    title: "Kỷ yếu & Sự kiện",
    location: "TP. Hồ Chí Minh, Việt Nam",
    rating: "4.7",
    reviewCount: 37,
    badge: "Professional Photographer",
    image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d",
    avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&h=200&fit=crop",
    cover: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b",
    bio: "Linh Anh chuyên chụp ảnh kỷ yếu và sự kiện tại TP.HCM. Phong cách năng động, tươi trẻ và đầy màu sắc, phù hợp với các bạn trẻ muốn có bộ ảnh kỷ yếu cá tính.",
    portfolio: [
      "https://images.unsplash.com/photo-1546410531-bb4caa6b424d",
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b",
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6",
    ],
    equipment: ["Sony A7C II", "35mm f/1.8", "50mm f/1.4"],
    services: [
      { name: "Kỷ yếu năng động Sài Gòn", desc: "Chụp 3.5 giờ, bao gồm makeup, concept và album mini.", price: "1.400.000 VNĐ" },
      { name: "Kỷ yếu concept theme", desc: "Chụp theo chủ đề đặc biệt: Hàn Quốc, vintage, hiện đại...", price: "1.800.000 VNĐ" },
    ],
    reviews: [
      { name: "Thanh Thảo", time: "1 tuần trước", rating: 5, text: "Chị Linh Anh chụp đẹp và rất vui tính. Bộ ảnh kỷ yếu của lớp mình ai cũng thích!" },
      { name: "Minh Phúc", time: "3 tuần trước", rating: 4, text: "Giá hợp lý, ảnh đẹp và giao đúng hẹn. Hài lòng với dịch vụ." },
    ],
    ratingScore: 4.7,
    totalReviews: 37,
    startPrice: "1.400.000 VNĐ",
  },
  {
    id: "hoa-mai",
    name: "Hoa Mai",
    title: "Kỷ yếu & Thiên nhiên",
    location: "Đà Lạt, Việt Nam",
    rating: "4.8",
    reviewCount: 44,
    badge: "Professional Photographer",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
    cover: "https://images.unsplash.com/photo-1627556704302-624286467c65",
    bio: "Hoa Mai chuyên chụp ảnh kỷ yếu tại Đà Lạt, nơi thiên nhiên thơ mộng trở thành phông nền hoàn hảo. Tôi giúp các bạn trẻ có những bộ ảnh kỷ yếu đẹp, đầy cảm xúc giữa núi rừng Đà Lạt.",
    portfolio: [
      "https://images.unsplash.com/photo-1509062522246-3755977927d7",
      "https://images.unsplash.com/photo-1627556704302-624286467c65",
      "https://images.unsplash.com/photo-1523580494863-6f3031224c94",
    ],
    equipment: ["Nikon Z6 III", "24-120mm f/4S", "50mm f/1.8S"],
    services: [
      { name: "Kỷ yếu Đà Lạt", desc: "Chụp 4 giờ tại các địa điểm đẹp Đà Lạt, kèm album và retouch.", price: "1.450.000 VNĐ" },
      { name: "Kỷ yếu + Studio", desc: "Kết hợp chụp ngoại cảnh Đà Lạt và trong studio, giao 50 ảnh.", price: "2.000.000 VNĐ" },
    ],
    reviews: [
      { name: "Khánh Vy", time: "5 ngày trước", rating: 5, text: "Cảnh Đà Lạt trong ảnh đẹp quá! Chị Hoa Mai chụp rất tự nhiên và khéo léo." },
      { name: "Bảo Nam", time: "2 tuần trước", rating: 5, text: "Bộ ảnh kỷ yếu tuyệt vời, màu sắc đẹp và chất lượng cao. Cả lớp đều hài lòng!" },
    ],
    ratingScore: 4.8,
    totalReviews: 44,
    startPrice: "1.450.000 VNĐ",
  },
  {
    id: "anh-travel",
    name: "Anh Travel",
    title: "Du lịch & Phong cảnh",
    location: "Mũi Né, Bình Thuận, Việt Nam",
    rating: "4.8",
    reviewCount: 38,
    badge: "Professional Photographer",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    avatar: "https://images.unsplash.com/photo-1522556189639-b150ed9c4330?w=200&h=200&fit=crop",
    cover: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1",
    bio: "Anh Travel đồng hành cùng bạn trong mọi chuyến đi, ghi lại những khoảnh khắc du lịch đẹp nhất tại Mũi Né và các điểm đến ven biển. Phong cách phóng khoáng, tự nhiên và đầy cảm hứng.",
    portfolio: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1",
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
    ],
    equipment: ["Sony A7C", "16-35mm f/2.8 GM", "DJI Mini 4 Pro"],
    services: [
      { name: "Travel story Mũi Né", desc: "Chụp 5 giờ tại Mũi Né, bao gồm flycam và retouch phong cách travel.", price: "1.850.000 VNĐ" },
      { name: "Gói du lịch ven biển", desc: "Chụp ảnh lifestyle biển trọn gói, từ bình minh đến hoàng hôn.", price: "2.500.000 VNĐ" },
    ],
    reviews: [
      { name: "Minh Long", time: "1 tuần trước", rating: 5, text: "Ảnh biển Mũi Né đẹp tuyệt! Anh chụp rất nhanh và chuyên nghiệp, màu sắc rất ưng." },
      { name: "Thu Nga", time: "1 tháng trước", rating: 5, text: "Chuyến đi Mũi Né được lưu giữ hoàn hảo. Cảm ơn Anh Travel rất nhiều!" },
    ],
    ratingScore: 4.8,
    totalReviews: 38,
    startPrice: "1.850.000 VNĐ",
  },
  {
    id: "tu-anh",
    name: "Tú Anh",
    title: "Du lịch & Lifestyle",
    location: "Đà Nẵng, Việt Nam",
    rating: "4.8",
    reviewCount: 33,
    badge: "Professional Photographer",
    image: "https://images.unsplash.com/photo-1501854140801-50d01698950b",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop",
    cover: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429",
    bio: "Tú Anh là nhiếp ảnh gia du lịch và lifestyle tại Đà Nẵng. Với con mắt nhạy bén và tình yêu thiên nhiên, tôi ghi lại những khoảnh khắc chân thực và đẹp đẽ trong từng hành trình.",
    portfolio: [
      "https://images.unsplash.com/photo-1501854140801-50d01698950b",
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
    ],
    equipment: ["Fujifilm GFX 50S II", "32-64mm f/4 GF", "DJI Mavic 3 Classic"],
    services: [
      { name: "Travel style Đà Nẵng", desc: "Chụp 5.5 giờ tại các địa điểm đẹp Đà Nẵng, bao gồm flycam.", price: "1.900.000 VNĐ" },
      { name: "Lifestyle du lịch", desc: "Gói chụp phong cách lifestyle cho cá nhân và cặp đôi đi du lịch.", price: "2.200.000 VNĐ" },
    ],
    reviews: [
      { name: "Hải Đăng", time: "3 ngày trước", rating: 5, text: "Tú Anh chụp du lịch Đà Nẵng quá đẹp! Góc nhìn sáng tạo và màu sắc rất tự nhiên." },
      { name: "Phương Linh", time: "3 tuần trước", rating: 5, text: "Ảnh chân thực, đẹp tự nhiên. Rất hài lòng với bộ ảnh du lịch Đà Nẵng!" },
    ],
    ratingScore: 4.8,
    totalReviews: 33,
    startPrice: "1.900.000 VNĐ",
  },
  {
    id: "duc-long",
    name: "Đức Long",
    title: "Du lịch & Thiên nhiên",
    location: "Sapa, Lào Cai, Việt Nam",
    rating: "4.7",
    reviewCount: 27,
    badge: "Professional Photographer",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop",
    cover: "https://images.unsplash.com/photo-1519681393784-d120267933ba",
    bio: "Đức Long chuyên chụp ảnh du lịch thiên nhiên tại Sapa và vùng Tây Bắc. Tôi yêu những cảnh bình minh trên ruộng bậc thang, mùa hoa rực rỡ và cuộc sống bản làng chân thực.",
    portfolio: [
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b",
      "https://images.unsplash.com/photo-1519681393784-d120267933ba",
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828",
    ],
    equipment: ["Nikon Z7 II", "14-24mm f/2.8S", "70-200mm f/2.8S"],
    services: [
      { name: "Travel Sapa mùa hoa", desc: "Chụp 4 giờ tại ruộng bậc thang và bản làng Sapa, phong cách thiên nhiên.", price: "1.750.000 VNĐ" },
      { name: "Tây Bắc full day", desc: "Trọn gói 1 ngày khám phá và chụp ảnh vùng Tây Bắc.", price: "3.000.000 VNĐ" },
    ],
    reviews: [
      { name: "Việt Hoàng", time: "2 tuần trước", rating: 5, text: "Ảnh Sapa của anh Đức Long đẹp như tranh! Màu sắc thiên nhiên rất chân thực và huyền ảo." },
      { name: "Ngọc Hà", time: "1 tháng trước", rating: 4, text: "Chụp ảnh mùa hoa tam giác mạch rất đẹp, anh rất am hiểu địa điểm." },
    ],
    ratingScore: 4.7,
    totalReviews: 27,
    startPrice: "1.750.000 VNĐ",
  },
  {
    id: "nha-bep",
    name: "Nhà Bếp Studio",
    title: "Ẩm thực & Editorial",
    location: "Quận 1, TP. Hồ Chí Minh, Việt Nam",
    rating: "4.9",
    reviewCount: 29,
    badge: "Top Rated Photographer",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop",
    cover: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38",
    bio: "Nhà Bếp Studio là studio nhiếp ảnh ẩm thực chuyên nghiệp tại Quận 1, TP.HCM. Chúng tôi kết hợp ánh sáng tự nhiên, food styling chuyên sâu để tạo ra những hình ảnh ẩm thực hấp dẫn và tinh tế nhất.",
    portfolio: [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38",
      "https://images.unsplash.com/photo-1482049016688-2d3e1b311543",
    ],
    equipment: ["Canon R5", "100mm Macro f/2.8L", "Studio Profoto B10"],
    services: [
      { name: "Ảnh ẩm thực Sài Gòn", desc: "Chụp 2.5 giờ tại studio, bao gồm food styling và retouch chuyên nghiệp.", price: "1.550.000 VNĐ" },
      { name: "Menu nhà hàng", desc: "Chụp toàn bộ menu nhà hàng theo phong cách editorial, giao file trong 3 ngày.", price: "4.000.000 VNĐ" },
    ],
    reviews: [
      { name: "Quỳnh Trang", time: "1 tuần trước", rating: 5, text: "Nhà Bếp Studio chụp ảnh ẩm thực cực kỳ chuyên nghiệp, menu nhà hàng mình nhìn hấp dẫn hẳn!" },
      { name: "Đức Anh", time: "2 tuần trước", rating: 5, text: "Ảnh đẹp, màu sắc tươi sáng và food styling rất chuyên nghiệp. Đáng đồng tiền bát gạo!" },
    ],
    ratingScore: 4.9,
    totalReviews: 29,
    startPrice: "1.550.000 VNĐ",
  },
  {
    id: "viet-hung",
    name: "Việt Hùng",
    title: "Ẩm thực & Food Styling",
    location: "Hà Nội, Việt Nam",
    rating: "4.8",
    reviewCount: 35,
    badge: "Professional Photographer",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38",
    avatar: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=200&h=200&fit=crop",
    cover: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543",
    bio: "Việt Hùng chuyên chụp ảnh ẩm thực và food styling tại Hà Nội. Với kinh nghiệm 5 năm trong ngành F&B, tôi hiểu cách làm nổi bật vẻ đẹp của từng món ăn qua ánh sáng và bố cục.",
    portfolio: [
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288",
    ],
    equipment: ["Sony A7R IV", "90mm Macro", "Godox SL150W"],
    services: [
      { name: "Ảnh ẩm thực Hà Nội", desc: "Chụp 3 giờ, bao gồm food styling và retouch chuyên sâu.", price: "1.450.000 VNĐ" },
      { name: "Chụp menu & branding", desc: "Gói đầy đủ cho thương hiệu F&B: menu, social media và brand identity.", price: "3.500.000 VNĐ" },
    ],
    reviews: [
      { name: "Hương Lan", time: "4 ngày trước", rating: 5, text: "Anh Việt Hùng chụp ảnh ẩm thực rất đẹp, menu quán mình sau khi có ảnh mới đã tăng order rõ rệt!" },
      { name: "Minh Tuấn", time: "3 tuần trước", rating: 5, text: "Chuyên nghiệp và sáng tạo. Ảnh food styling của anh ấy rất có hồn." },
    ],
    ratingScore: 4.8,
    totalReviews: 35,
    startPrice: "1.450.000 VNĐ",
  },
  {
    id: "thu-trang",
    name: "Thu Trang",
    title: "Ẩm thực & Editorial",
    location: "Đà Lạt, Việt Nam",
    rating: "4.7",
    reviewCount: 24,
    badge: "Professional Photographer",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop",
    cover: "https://images.unsplash.com/photo-1490645935967-10de6ba17061",
    bio: "Thu Trang chuyên chụp ảnh ẩm thực theo phong cách editorial tại Đà Lạt. Tôi kết hợp thiên nhiên Đà Lạt tươi mát vào từng khung hình để tạo ra những bức ảnh ẩm thực độc đáo và khác biệt.",
    portfolio: [
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd",
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061",
      "https://images.unsplash.com/photo-1543353071-873f17a7a088",
    ],
    equipment: ["Canon R6", "50mm f/1.2L RF", "Profoto A10"],
    services: [
      { name: "Ảnh ẩm thực Đà Lạt", desc: "Chụp 3 giờ theo phong cách editorial, kết hợp thiên nhiên Đà Lạt.", price: "1.480.000 VNĐ" },
      { name: "Food editorial campaign", desc: "Chụp chiến dịch ảnh ẩm thực cho thương hiệu, phong cách cao cấp.", price: "4.500.000 VNĐ" },
    ],
    reviews: [
      { name: "Bảo Châu", time: "1 tuần trước", rating: 5, text: "Thu Trang chụp ảnh bánh và cà phê Đà Lạt đẹp lắm! Màu sắc nhẹ nhàng, ấm áp đúng chất Đà Lạt." },
      { name: "Gia Huy", time: "1 tháng trước", rating: 4, text: "Ảnh editorial rất sáng tạo và có phong cách riêng. Hài lòng với kết quả." },
    ],
    ratingScore: 4.7,
    totalReviews: 24,
    startPrice: "1.480.000 VNĐ",
  },
];

const sideNavItems = [
  { icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6", label: "Tổng quan", active: true },
  { icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z", label: "Bộ sưu tập" },
  { icon: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4", label: "Dịch vụ" },
  { icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z", label: "Đánh giá" },
];

const tabs = ["Tổng quan", "Portfolio", "Gói dịch vụ", "Đánh giá"];

export default function PhotographerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  return <PhotographerProfileContent id={unwrappedParams.id} />;
}

function PhotographerProfileContent({ id }: { id: string }) {
  const person = photographers.find((p) => p.id === id) || photographers[0];
  const [activeTab, setActiveTab] = useState("Tổng quan");
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const [selectedDates, setSelectedDates] = useState<string[]>([todayStr]);
  const [selectedService, setSelectedService] = useState(person.services[0]);
  const [reviews, setReviews] = useState(person.reviews);
  const [reviewerName, setReviewerName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);

  useEffect(() => {
    setSelectedService(person.services[0]);
    setSelectedDates([todayStr]);
    setReviews(person.reviews);
    setReviewerName("");
    setReviewText("");
    setReviewRating(5);
  }, [person.id, todayStr, person.services, person.reviews]);

  const averageRating = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
  const totalReviews = reviews.length;

  const getCalendarDays = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const offset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (number | null)[] = [];

    for (let i = 0; i < offset; i += 1) {
      days.push(null);
    }
    for (let d = 1; d <= daysInMonth; d += 1) {
      days.push(d);
    }
    return days;
  };

  const calendarYear = today.getFullYear();
  const calendarMonth = today.getMonth();
  const calendarDays = getCalendarDays(calendarYear, calendarMonth);

  const selectedServicePrice = selectedService?.price || person.startPrice;
  const selectedServiceName = selectedService?.name || "Chọn dịch vụ";
  const selectedDatesLabel = selectedDates.length === 1
    ? new Date(selectedDates[0]).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
    : `${selectedDates.length} ngày đã chọn`;

  return (
    <div className="min-h-screen bg-white">
      {/* Cover + Avatar + Info */}
      <div className="relative h-52 md:h-64">
        <img src={person.cover} alt="cover" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/30" />
        {/* Avatar block */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="max-w-6xl mx-auto px-6 flex items-end gap-4 pb-4">
            <div className="relative -mb-10">
              <img src={person.avatar} alt={person.name} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg" />
            </div>
            <div className="mb-2 text-white">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black">{person.name}</h1>
                <svg className="w-5 h-5 text-[#ff8d28]" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 1.8l2 1.5 2.5-.1.7 2.4 2 1.5-.9 2.4.9 2.4-2 1.5-.7 2.4-2.5-.1-2 1.5-2-1.5-2.5.1-.7-2.4-2-1.5.9-2.4-.9-2.4 2-1.5.7-2.4 2.5.1 2-1.5z" />
                </svg>
              </div>
              <p className="text-sm text-white/80">{person.title}</p>
            </div>
          </div>
        </div>
        {/* Badge */}
        <div className="absolute bottom-4 left-6 md:left-[calc(50%-480px+6rem+1rem+1.5rem)]">
          <span className="hidden" />
        </div>
      </div>

      {/* Main layout */}
      <div className="max-w-6xl mx-auto px-6 pt-14 pb-16 grid md:grid-cols-[220px_minmax(0,1fr)] gap-8">

        {/* Sidebar */}
        <aside>
          {/* Profile mini */}
          <div className="text-center mb-6">
            <p className="font-bold text-gray-900 text-sm">{person.name}</p>
            <p className="text-xs text-gray-500">{person.title}</p>
            <button className="mt-3 w-full border border-gray-200 text-gray-600 text-xs py-2 rounded-full hover:bg-gray-50 flex items-center justify-center gap-1.5 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Gửi tin nhắn
            </button>
          </div>

          <nav className="space-y-1">
            {sideNavItems.map((item) => (
              <button
                key={item.label}
                onClick={() => setActiveTab(item.label === "Bộ sưu tập" ? "Portfolio" : item.label === "Đánh giá" ? "Đánh giá" : item.label === "Dịch vụ" ? "Gói dịch vụ" : "Tổng quan")}
                className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  (item.label === "Tổng quan" && activeTab === "Tổng quan") ||
                  (item.label === "Bộ sưu tập" && activeTab === "Portfolio") ||
                  (item.label === "Dịch vụ" && activeTab === "Gói dịch vụ") ||
                  (item.label === "Đánh giá" && activeTab === "Đánh giá")
                    ? "bg-[#ff8d28] text-white font-semibold"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={item.icon} />
                </svg>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-6 pt-6 border-t border-gray-100 space-y-1">
            <button className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-gray-50 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Cài đặt
            </button>
            <button className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-gray-50 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Trợ giúp
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div className="min-w-0">
          {/* Badge */}
          <div className="mb-3">
            <span className="inline-block bg-[#ff8d28] text-white text-[11px] font-bold px-3 py-1 rounded-full">{person.badge}</span>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 border-b border-gray-100 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === tab ? "border-[#ff8d28] text-[#ff8d28]" : "border-transparent text-gray-400 hover:text-gray-700"
                }`}
              >
                {tab}
                {tab === "Đánh giá" && <span className="ml-1.5 bg-gray-100 text-gray-500 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{totalReviews}</span>}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-[minmax(0,1fr)_280px] gap-6">
            {/* Left column */}
            <div>
              {/* Tổng quan tab */}
              {activeTab === "Tổng quan" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-bold text-gray-900 mb-2 text-sm">Về tôi</h2>
                    <p className="text-sm text-gray-600 leading-relaxed">{person.bio}</p>
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 mb-3 text-sm">Bộ sưu tập</h2>
                    <div className="grid grid-cols-2 gap-2">
                      {person.portfolio.slice(0, 4).map((src, i) => (
                        <img key={i} src={src} alt="" className="w-full h-36 object-cover rounded-xl" />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Portfolio tab */}
              {activeTab === "Portfolio" && (
                <div className="grid grid-cols-2 gap-3">
                  {person.portfolio.map((src, i) => (
                    <img key={i} src={src} alt="" className="w-full h-40 object-cover rounded-xl" />
                  ))}
                </div>
              )}

              {/* Gói dịch vụ tab */}
              {activeTab === "Gói dịch vụ" && (
                <div className="space-y-3">
                  {person.services.map((svc) => (
                    <div key={svc.name} className={`border rounded-xl p-4 flex items-start justify-between gap-4 transition ${selectedService.name === svc.name ? "border-[#ff8d28] bg-[#fff4eb]" : "border-[#e0e7ff] bg-white"}`}>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-sm">{svc.name}</h3>
                        <p className="text-gray-500 text-xs mt-1 leading-relaxed">{svc.desc}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-gray-400">Từ</p>
                        <p className="font-black text-gray-900 text-sm whitespace-nowrap">{svc.price}</p>
                        <button
                          type="button"
                          onClick={() => setSelectedService(svc)}
                          className={`mt-2 text-xs font-bold px-4 py-1.5 rounded-full transition-colors ${selectedService.name === svc.name ? "bg-[#ff8d28] text-white border border-[#ff8d28]" : "border border-[#ff8d28] text-[#ff8d28] hover:bg-[#fff4eb]"}`}
                        >
                          {selectedService.name === svc.name ? "Đã chọn" : "Chọn"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Đánh giá tab */}
              {activeTab === "Đánh giá" && (
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="text-center">
                      <p className="text-4xl font-black text-gray-900">{averageRating.toFixed(1)}</p>
                      <p className="text-xs text-gray-400 mt-1">/5</p>
                      <div className="flex gap-0.5 mt-1 justify-center">
                        {[1,2,3,4,5].map((s) => (
                          <svg key={s} className={`w-4 h-4 ${s <= Math.round(averageRating) ? "text-[#ff8d28]" : "text-gray-200"}`} viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 2.8l1.9 4 4.4.6-3.2 3.1.8 4.4-3.9-2.1-3.9 2.1.8-4.4-3.2-3.1 4.4-.6 1.9-4z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Dựa trên {totalReviews} đánh giá</p>
                    </div>
                  </div>

                  <div className="mb-6 rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-900 mb-3">Gửi đánh giá của bạn</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-[11px] text-gray-500 mb-2">Chọn số sao</p>
                        <div className="flex gap-2">
                          {[1,2,3,4,5].map((value) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => setReviewRating(value)}
                              className={`w-9 h-9 rounded-full border text-sm font-bold transition ${value <= reviewRating ? "bg-[#ff8d28] text-white border-[#ff8d28]" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
                            >
                              {value}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-500 mb-1">Tên của bạn</label>
                        <input
                          value={reviewerName}
                          onChange={(event) => setReviewerName(event.target.value)}
                          className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-[#ff8d28] outline-none"
                          placeholder="Nhập tên"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-500 mb-1">Nhận xét</label>
                        <textarea
                          value={reviewText}
                          onChange={(event) => setReviewText(event.target.value)}
                          className="w-full min-h-[110px] rounded-2xl border border-gray-200 p-3 text-sm text-gray-900 focus:border-[#ff8d28] outline-none"
                          placeholder="Viết cảm nghĩ của bạn về photographer"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (!reviewText.trim()) return;
                          const newReview = {
                            name: reviewerName.trim() || "Khách hàng",
                            time: "Vừa xong",
                            rating: reviewRating,
                            text: reviewText.trim(),
                          };
                          setReviews([newReview, ...reviews]);
                          setReviewerName("");
                          setReviewText("");
                          setReviewRating(5);
                        }}
                        className="w-full rounded-2xl bg-[#ff8d28] text-white text-sm font-bold py-3 hover:bg-[#e0751b] transition-colors"
                      >
                        Gửi đánh giá
                      </button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {reviews.map((r, i) => (
                      <div key={i} className="border border-gray-100 rounded-xl p-4">
                        <div className="flex gap-0.5 mb-2">
                          {[1,2,3,4,5].map((s) => (
                            <svg key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? "text-[#ff8d28]" : "text-gray-200"}`} viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 2.8l1.9 4 4.4.6-3.2 3.1.8 4.4-3.9-2.1-3.9 2.1.8-4.4-3.2-3.1 4.4-.6 1.9-4z" />
                            </svg>
                          ))}
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">{r.text}</p>
                        <div className="flex items-center gap-2 mt-3">
                          <div className="w-7 h-7 rounded-full bg-[#ff8d28] flex items-center justify-center text-white text-[10px] font-black">
                            {r.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-800">{r.name}</p>
                            <p className="text-[10px] text-gray-400">{r.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Services box (shown in Tổng quan) */}
              {activeTab === "Tổng quan" && (
                <div className="mt-6 border-2 border-dashed border-[#c7d2fe] rounded-2xl p-4">
                  <h3 className="font-bold text-gray-900 text-sm mb-3">Dịch vụ & Bảng giá</h3>
                  <div className="space-y-3">
                    {person.services.map((svc) => (
                      <div key={svc.name} className={`flex items-start justify-between gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0 transition ${selectedService.name === svc.name ? "bg-[#fff4eb]" : "bg-transparent"}`}>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">{svc.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5 leading-relaxed line-clamp-2">{svc.desc}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-[#ff8d28] font-black whitespace-nowrap">Từ {svc.price}</p>
                          <button
                            type="button"
                            onClick={() => setSelectedService(svc)}
                            className={`mt-1.5 text-[11px] font-bold px-3 py-1 rounded-full transition-colors ${selectedService.name === svc.name ? "bg-[#ff8d28] text-white border border-[#ff8d28]" : "border border-[#ff8d28] text-[#ff8d28] hover:bg-[#fff4eb]"}`}
                          >
                            {selectedService.name === svc.name ? "Đã chọn" : "Chọn"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="mt-3 text-[#ff8d28] text-xs font-semibold hover:underline">Xem tất cả →</button>
                </div>
              )}
            </div>

            {/* Right column — booking card */}
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm sticky top-24">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs text-gray-400">Giá gói đã chọn</p>
                    <p className="text-lg font-black text-gray-900">{selectedServicePrice}</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-bold text-gray-900">
                    <svg className="w-4 h-4 text-[#ff8d28]" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 2.8l1.9 4 4.4.6-3.2 3.1.8 4.4-3.9-2.1-3.9 2.1.8-4.4-3.2-3.1 4.4-.6 1.9-4z" />
                    </svg>
                    {averageRating.toFixed(1)} ({totalReviews})
                  </div>
                </div>

                <div className="mb-4 rounded-2xl border border-gray-100 bg-gray-50 p-3 text-sm">
                  <p className="text-[10px] text-gray-400">Dịch vụ đã chọn</p>
                  <p className="font-semibold text-gray-900">{selectedServiceName}</p>
                  <p className="text-xs text-gray-500 leading-relaxed mt-1 line-clamp-2">{selectedService.desc}</p>
                  <div className="mt-3 text-xs text-gray-500">
                    <p>Ngày chụp: <span className="font-semibold text-gray-900">{selectedDatesLabel}</span></p>
                    <p className="mt-1">Giá hiện tại: <span className="font-black text-gray-900">{selectedServicePrice}</span></p>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-700">{today.toLocaleString("vi-VN", { month: "long", year: "numeric" })}</span>
                    <div className="flex gap-1">
                      <button className="w-5 h-5 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50" type="button" disabled>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                      </button>
                      <button className="w-5 h-5 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50" type="button" disabled>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-0.5 text-center">
                    {["T2","T3","T4","T5","T6","T7","CN"].map((d) => (
                      <div key={d} className="text-[9px] text-gray-400 font-semibold py-0.5">{d}</div>
                    ))}
                    {calendarDays.map((d, i) => {
                      const dateString = d ? `${calendarYear}-${String(calendarMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}` : "";
                      const isSelected = d ? selectedDates.includes(dateString) : false;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            if (!d) return;
                            setSelectedDates((current) => {
                              if (current.includes(dateString)) {
                                return current.filter((item) => item !== dateString);
                              }
                              return [...current, dateString].sort();
                            });
                          }}
                          disabled={!d}
                          className={`text-[11px] py-1 rounded-full font-semibold transition-colors ${
                            !d ? "bg-transparent text-transparent pointer-events-none" : isSelected ? "bg-[#ff8d28] text-white" : dateString === todayStr ? "border border-[#ff8d28] text-[#ff8d28]" : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {d || ""}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Link
                  href={`/booking?photographer=${person.id}&service=${encodeURIComponent(selectedServiceName)}&dates=${encodeURIComponent(selectedDates.join(","))}`}
                  className="w-full bg-[#ff8d28] hover:bg-[#e0751b] text-white text-sm font-extrabold py-3 rounded-full flex items-center justify-center transition-all hover:-translate-y-0.5 shadow-[0_8px_18px_rgba(255,141,40,0.2)]"
                >
                  Đặt lịch ngay
                </Link>
                <p className="text-[10px] text-gray-400 text-center mt-2">Bạn sẽ không bị trừ tiền cho đến khi xác nhận xong.</p>
              </div>
            </div>
          </div>

          {/* Reviews preview in Tổng quan */}
          {activeTab === "Tổng quan" && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900 text-base flex items-center gap-2">
                  Đánh giá từ khách hàng
                </h2>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-[#ff8d28]" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 2.8l1.9 4 4.4.6-3.2 3.1.8 4.4-3.9-2.1-3.9 2.1.8-4.4-3.2-3.1 4.4-.6 1.9-4z" />
                  </svg>
                  <span className="font-black text-gray-900 text-sm">{averageRating.toFixed(1)}/5</span>
                  <span className="text-xs text-gray-400 ml-1">Dựa trên {totalReviews} đánh giá</span>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {reviews.map((r, i) => (
                  <div key={i} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex gap-0.5 mb-2">
                      {[1,2,3,4,5].map((s) => (
                        <svg key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? "text-[#ff8d28]" : "text-gray-200"}`} viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 2.8l1.9 4 4.4.6-3.2 3.1.8 4.4-3.9-2.1-3.9 2.1.8-4.4-3.2-3.1 4.4-.6 1.9-4z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">{r.text}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <div className="w-7 h-7 rounded-full bg-[#ff8d28] flex items-center justify-center text-white text-[10px] font-black">
                        {r.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-800">{r.name}</p>
                        <p className="text-[10px] text-gray-400">{r.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
