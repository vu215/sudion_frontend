"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

const photographers = [
  {
    id: "binh-nguyen",
    name: "Bình Nguyễn",
    title: "Nhiếp ảnh gia Thời trang & Chân dung",
    location: "Tp.HCM, Việt Nam",
    rating: "4.9",
    price: "2.500.000 VNĐ",
    image: "https://images.unsplash.com/photo-1496440737103-cd596325d314?auto=format&fit=crop&w=900&q=85",
    thumbs: [
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
    ],
    bio: "Với hơn 8 năm kinh nghiệm trong lĩnh vực nhiếp ảnh thời trang và chân dung, tôi tập trung vào việc khai thác vẻ đẹp tự nhiên và ánh sáng trong từng khoảnh khắc.",
    equipment: ["Sony A7R IV", "Canon 5D Mark IV", "24-70mm f/2.8 GM"],
    languages: ["Tiếng Việt (bản địa)", "Tiếng Anh (lưu loát)"],
    availability: ["Tuần này", "Cuối tuần"],
    addOns: ["makeup", "video", "album", "retouch"],
    services: [
      { badge: "Phổ biến", badgeColor: "bg-orange-100 text-orange-600", name: "Chụp ảnh Chân dung", price: "2.500.000 VNĐ", unit: "buổi", desc: "Gói chụp ảnh chân dung cá nhân, phù hợp cho profile, sinh nhật hoặc concept riêng.", delivery: "Giao file trong 48h", status: "Đang hoạt động", statusColor: "text-green-600" },
      { badge: "Cao cấp", badgeColor: "bg-blue-100 text-blue-600", name: "Chụp ảnh Thời trang Editorial", price: "5.000.000 VNĐ", unit: "ngày", desc: "Dành cho lookbook, tạp chí, chiến dịch thương hiệu. Bao gồm định hướng nghệ thuật.", delivery: "Giao file trong 72h", status: "Đang hoạt động", statusColor: "text-green-600" },
    ],
  },
  {
    id: "hao-le",
    name: "Hào Lê",
    title: "Nhiếp ảnh gia Cưới & Cặp đôi",
    location: "Đà Lạt, Việt Nam",
    rating: "4.8",
    price: "5.000.000 VNĐ",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=85",
    thumbs: [
      "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80",
    ],
    bio: "Chuyên gia nhiếp ảnh cưới và cặp đôi tại Đà Lạt. Với góc nhìn lãng mạn và phong cách tự nhiên, tôi giúp các cặp đôi lưu giữ những khoảnh khắc đẹp nhất.",
    equipment: ["Sony A7 III", "85mm f/1.4 GM", "Flycam DJI Mini 3"],
    languages: ["Tiếng Việt (bản địa)"],
    availability: ["Cuối tuần", "Tháng tới"],
    addOns: ["makeup", "video", "flycam", "album"],
    services: [
      { badge: "Trọn gói", badgeColor: "bg-orange-100 text-orange-600", name: "Chụp ảnh Cưới trọn ngày", price: "15.000.000 VNĐ", unit: "ngày", desc: "Gói cưới đầy đủ, bao gồm flycam và album cao cấp.", delivery: "Giao file trong 7 ngày", status: "Đang hoạt động", statusColor: "text-green-600" },
      { badge: "Tiết kiệm", badgeColor: "bg-green-100 text-green-600", name: "Chụp Pre-wedding", price: "5.000.000 VNĐ", unit: "buổi", desc: "Buổi chụp ngoài trời tại các điểm đẹp ở Đà Lạt, phong cách tự nhiên và lãng mạn.", delivery: "Giao file trong 5 ngày", status: "Đang hoạt động", statusColor: "text-green-600" },
    ],
  },
  {
    id: "studio-k",
    name: "Studio K",
    title: "Nhiếp ảnh gia Sản phẩm & Thương mại",
    location: "Hà Nội, Việt Nam",
    rating: "4.7",
    price: "1.800.000 VNĐ",
    image: "https://images.unsplash.com/photo-1595425964071-2c1ec7c88201?auto=format&fit=crop&w=900&q=85",
    thumbs: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80",
    ],
    bio: "Studio chuyên chụp ảnh sản phẩm và thương mại tại Hà Nội. Trang bị studio hiện đại, đội ngũ chuyên nghiệp với kinh nghiệm phục vụ nhiều thương hiệu lớn.",
    equipment: ["Hasselblad X2D", "Phase One", "Studio Lighting Profoto"],
    languages: ["Tiếng Việt (bản địa)", "Tiếng Anh (lưu loát)"],
    availability: ["Tuần này", "Tháng tới"],
    addOns: ["retouch", "stylist"],
    services: [
      { badge: "Thương mại", badgeColor: "bg-blue-100 text-blue-600", name: "Chụp ảnh Sản phẩm cơ bản", price: "1.800.000 VNĐ", unit: "buổi", desc: "Chụp 10-15 sản phẩm với background trắng, phù hợp cho e-commerce.", delivery: "Giao file trong 24h", status: "Đang hoạt động", statusColor: "text-green-600" },
      { badge: "Cao cấp", badgeColor: "bg-purple-100 text-purple-600", name: "Chụp ảnh Lookbook thương hiệu", price: "8.000.000 VNĐ", unit: "ngày", desc: "Lookbook đầy đủ cho thương hiệu thời trang, bao gồm stylist và model.", delivery: "Giao file trong 5 ngày", status: "Đang hoạt động", statusColor: "text-green-600" },
    ],
  },
  {
    id: "hung-trinh",
    name: "Hưng Trịnh",
    title: "Nhiếp ảnh gia Thời trang & Biên tập",
    location: "Vĩnh Long, Việt Nam",
    rating: "4.9",
    price: "2.500.000 VNĐ",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=85",
    thumbs: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
    ],
    bio: "Nhiếp ảnh gia trẻ với phong cách độc đáo, kết hợp giữa thời trang đường phố và chân dung nghệ thuật.",
    equipment: ["Canon R5", "50mm f/1.2L", "35mm f/1.4L"],
    languages: ["Tiếng Việt (bản địa)"],
    availability: ["Tuần này"],
    addOns: ["makeup", "retouch", "stylist"],
    services: [
      { badge: "Phổ biến", badgeColor: "bg-orange-100 text-orange-600", name: "Chụp ảnh Street Portrait", price: "2.500.000 VNĐ", unit: "buổi", desc: "Chụp ảnh ngoài trời phong cách đường phố, tự nhiên và cá tính.", delivery: "Giao file trong 48h", status: "Đang hoạt động", statusColor: "text-green-600" },
    ],
  },
  {
    id: "hoang-anh",
    name: "Hoàng Anh",
    title: "Nhiếp ảnh gia Cưới & Cặp đôi",
    location: "Đà Nẵng, Việt Nam",
    rating: "4.8",
    price: "5.000.000 VNĐ",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=85&sat=-100",
    thumbs: [
      "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80",
    ],
    bio: "Chuyên nhiếp ảnh cưới tại Đà Nẵng với phong cách hiện đại và tươi sáng.",
    equipment: ["Sony A1", "24-70mm f/2.8 GM II", "DJI Air 3"],
    languages: ["Tiếng Việt (bản địa)", "Tiếng Anh (cơ bản)"],
    availability: ["Cuối tuần"],
    addOns: ["makeup", "video", "flycam"],
    services: [
      { badge: "Trọn gói", badgeColor: "bg-orange-100 text-orange-600", name: "Chụp ảnh Cưới Đà Nẵng", price: "12.000.000 VNĐ", unit: "ngày", desc: "Gói cưới đầy đủ tại Đà Nẵng, bao gồm biển Mỹ Khê và bán đảo Sơn Trà.", delivery: "Giao file trong 7 ngày", status: "Đang hoạt động", statusColor: "text-green-600" },
    ],
  },
  {
    id: "cong-tuan",
    name: "Công Tuấn",
    title: "Nhiếp ảnh gia Ẩm thực & Thương mại",
    location: "Huế, Việt Nam",
    rating: "4.7",
    price: "1.800.000 VNĐ",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=900&q=85",
    thumbs: [
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80",
    ],
    bio: "Nhiếp ảnh gia thương mại và ẩm thực tại Huế. Chuyên chụp sản phẩm ẩm thực, nhà hàng và các chiến dịch marketing địa phương.",
    equipment: ["Nikon Z7 II", "Macro 105mm", "85mm f/1.8S"],
    languages: ["Tiếng Việt (bản địa)"],
    availability: ["Tháng tới"],
    addOns: ["retouch", "album"],
    services: [
      { badge: "Ẩm thực", badgeColor: "bg-yellow-100 text-yellow-700", name: "Chụp ảnh Ẩm thực", price: "1.800.000 VNĐ", unit: "buổi", desc: "Chụp ảnh món ăn, menu nhà hàng, phong cách tươi sáng và hấp dẫn.", delivery: "Giao file trong 24h", status: "Đang hoạt động", statusColor: "text-green-600" },
    ],
  },
];

const navItems = [
  { icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6", label: "Dashboard" },
  { icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z", label: "Portfolio" },
  { icon: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4", label: "Services" },
  { icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", label: "Bookings" },
  { icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", label: "Earnings" },
  { icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z", label: "Messages" },
];

export default function ProfilePhotographerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <ProfilePhotographerContent />
    </Suspense>
  );
}

function ProfilePhotographerContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const person = photographers.find((p) => p.id === id) || photographers[0];
  const [bio, setBio] = useState(person.bio);

  return (
    <div className="min-h-screen bg-[#1a1a2e] flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-52 bg-[#1e1e32] py-6 px-4 fixed h-full z-20">
        <div className="flex items-center gap-2 px-2 mb-8">
          <div className="w-7 h-7 rounded-full bg-[#ff8d28] flex items-center justify-center">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="2.5" fill="white" />
            </svg>
          </div>
          <span className="text-[#ff8d28] font-black text-base tracking-widest uppercase">STUDION</span>
        </div>

        <nav className="space-y-1 flex-1">
          {navItems.map((item) => (
            <button key={item.label} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-colors text-sm">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={item.icon} />
              </svg>
              {item.label}
            </button>
          ))}
          <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl bg-white/10 text-white text-sm font-semibold mt-2">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </button>
        </nav>

        <button className="mt-4 w-full border border-white/10 text-gray-400 text-xs rounded-lg px-3 py-2 hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Get Pro Support
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 lg:ml-52 bg-[#f5f5fa] min-h-screen">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-4 sticky top-0 z-10">
          <a href="/photographer" className="flex items-center gap-1.5 text-gray-400 hover:text-orange-500 transition-colors text-xs font-semibold shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại
          </a>
          <span className="text-gray-200">|</span>
          <div className="flex-1 relative max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input className="w-full bg-gray-50 border border-gray-200 rounded-full pl-9 pr-4 py-2 text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-100" placeholder="Search..." />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button className="text-gray-400 hover:text-gray-600 relative">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <button className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <img src={person.image} alt="avatar" className="w-8 h-8 rounded-full object-cover border-2 border-orange-200" />
          </div>
        </header>

        <div className="p-6 max-w-3xl mx-auto space-y-5">
          {/* Page title */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black text-gray-900">Hồ sơ — {person.name}</h1>
              <p className="text-gray-400 text-xs mt-1">Quản lý cách bạn xuất hiện trước khách hàng trên Photor AI.</p>
            </div>
            <div className="flex gap-2">
              <button className="border border-gray-200 text-gray-500 text-xs px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">Hủy</button>
              <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Lưu thay đổi
              </button>
            </div>
          </div>

          {/* Basic Info */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2 text-sm">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Thông tin cơ bản
            </h2>
            <div className="flex gap-6">
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <div className="relative">
                  <img src={person.image} alt="avatar" className="w-20 h-20 rounded-full object-cover border-4 border-white shadow" />
                  <button className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 text-center leading-tight">Định dạng JPG, PNG<br />Tối đa 5MB</p>
              </div>

              <div className="flex-1 grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-gray-500 mb-1 block">Tên hiển thị</label>
                  <input defaultValue={person.name} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100" />
                </div>
                <div>
                  <label className="text-[11px] text-gray-500 mb-1 block">Chức danh chuyên môn</label>
                  <input defaultValue={person.title} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100" />
                </div>
                <div className="col-span-2">
                  <label className="text-[11px] text-gray-500 mb-1 flex justify-between">
                    <span>Tiểu sử</span>
                    <span className="text-gray-400">{bio.length}/500</span>
                  </label>
                  <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Professional Info */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2 text-sm">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Thông tin chuyên môn
            </h2>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="text-[11px] text-gray-500 mb-2 block">Danh sách thiết bị</label>
                <div className="flex flex-wrap gap-1.5">
                  {person.equipment.map((e) => (
                    <span key={e} className="bg-gray-100 text-gray-700 text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1">
                      {e} <button className="text-gray-400 hover:text-gray-600">×</button>
                    </span>
                  ))}
                  <button className="text-blue-500 text-[11px] hover:underline mt-1">Thêm thiết bị...</button>
                </div>
              </div>
              <div>
                <label className="text-[11px] text-gray-500 mb-2 block">Vị trí hoạt động chính</label>
                <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2">
                  <svg className="w-3.5 h-3.5 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <span className="text-xs text-gray-700">{person.location}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <input type="checkbox" defaultChecked className="accent-blue-500 w-3.5 h-3.5" />
                  <span className="text-[11px] text-gray-500">Sẵn sàng đi công tác xa</span>
                </div>
              </div>
              <div>
                <label className="text-[11px] text-gray-500 mb-2 block">Ngôn ngữ</label>
                <div className="flex flex-wrap gap-1.5">
                  {person.languages.map((l) => (
                    <span key={l} className="bg-blue-50 text-blue-600 text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1">
                      {l} <button className="hover:text-blue-800">×</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Portfolio */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Ảnh nổi bật (Portfolio)
              </h2>
              <div className="flex gap-2">
                <button className="text-gray-500 text-[11px] border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" /></svg>
                  Sắp xếp
                </button>
                <button className="text-gray-500 text-[11px] border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  Tải lên
                </button>
              </div>
            </div>
            <p className="text-gray-400 text-[11px] mb-4">Chọn 4-8 bức ảnh ấn tượng nhất để hiển thị ở đầu trang hồ sơ của bạn.</p>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-1 row-span-2 relative rounded-xl overflow-hidden" style={{ gridRow: "span 2" }}>
                <img src={person.image} alt="" className="w-full h-full object-cover" style={{ minHeight: "260px" }} />
                <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">Ảnh chính</span>
              </div>
              {person.thumbs.map((thumb, i) => (
                <div key={i} className="rounded-xl overflow-hidden">
                  <img src={thumb} alt="" className="w-full object-cover" style={{ height: "124px" }} />
                </div>
              ))}
            </div>
          </div>

          {/* Services */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Các gói dịch vụ
              </h2>
              <button className="text-blue-500 text-[11px] font-medium hover:underline">+ Thêm dịch vụ mới</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {person.services.map((svc) => (
                <div key={svc.name} className="border border-gray-100 rounded-xl p-4 relative">
                  <button className="absolute top-3 right-3 text-gray-300 hover:text-gray-500">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                    </svg>
                  </button>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${svc.badgeColor}`}>{svc.badge}</span>
                  <h3 className="font-semibold text-gray-900 text-xs mt-2 mb-1">{svc.name}</h3>
                  <p className="text-orange-500 font-bold text-sm">{svc.price} <span className="text-gray-400 font-normal text-xs">/{svc.unit}</span></p>
                  <p className="text-gray-400 text-[11px] mt-1.5 leading-relaxed line-clamp-2">{svc.desc}</p>
                  <div className="flex items-center gap-3 mt-3 text-[11px] text-gray-400">
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {svc.delivery}
                    </span>
                    <span className={`flex items-center gap-1 ${svc.statusColor}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />{svc.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
