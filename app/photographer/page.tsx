"use client";
import { useState } from "react";
import Link from "next/link";

const equipmentList = ["Sony A7R IV", "Canon 5D Mark IV", "24-70mm f/2.8 GM"];
const languages = ["Tiếng Việt (bản địa)", "Tiếng Anh (lưu loát)"];
const portfolioImages = [
  { src: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80", main: true, label: "Ảnh chính" },
  { src: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&q=80", main: false },
  { src: "https://images.unsplash.com/photo-1549989476-69a92fa57c36?w=400&q=80", main: false },
];

const services = [
  {
    badge: "Cao cấp", badgeColor: "bg-blue-100 text-blue-600",
    name: "Chụp ảnh Bất động sản Cao cấp",
    price: "$450", unit: "buổi",
    desc: "Gói tiêu chuẩn bao gồm 25 ảnh đã qua chỉnh sửa kỹ lưỡng, phù hợp cho các căn hộ cao cấp hoặc biệt thự.",
    delivery: "Giao file trong 48h",
    slots: "2 còn trống",
    status: "Đang hoạt động",
    statusColor: "text-green-600",
  },
  {
    badge: "Thương mại", badgeColor: "bg-orange-100 text-orange-600",
    name: "Chụp ảnh Sản phẩm Editorial",
    price: "$800", unit: "ngày",
    desc: "Dành cho các chiến dịch quảng cáo, lookbook. Bao gồm setup ánh sáng chuyên nghiệp và định hướng nghệ thuật.",
    delivery: "Cần nhắp hỗ trợ",
    slots: "Đang hoạt động",
    status: "Đang hoạt động",
    statusColor: "text-green-600",
  },
];

export default function PhotographerPage() {
  const [bio, setBio] = useState(
    "Với hơn 10 năm kinh nghiệm trong lĩnh vực nhiếp ảnh thương mại, tôi tập trung vào việc kiến tạo những khung hình có chiều sâu, tôn vinh ánh sáng tự nhiên và đường nét kiến trúc. Từng cộng tác với nhiều tạp chí thiết kế uy tín."
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-56 bg-white border-r border-gray-100 py-6 px-4 fixed h-full">
        <div className="text-orange-500 font-bold text-xl mb-8 px-2 flex items-center gap-2">
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 9a3 3 0 100 6 3 3 0 000-6z"/>
            <path fillRule="evenodd" d="M9.343 3.071A1 1 0 0110.28 3h3.44a1 1 0 01.937.651l.528 1.398H18a2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V7.05a2 2 0 012-2h2.815l.528-1.398zM12 8a4 4 0 100 8 4 4 0 000-8z" clipRule="evenodd"/>
          </svg>
          STUDION
        </div>
        {[
          { icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6", label: "Dashboard" },
          { icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z", label: "Portfolio" },
          { icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", label: "Services" },
          { icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", label: "Bookings" },
          { icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", label: "Earnings" },
          { icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z", label: "Messages" },
        ].map((item) => (
          <button key={item.label} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-orange-50 hover:text-orange-500 transition-colors text-sm mb-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
            </svg>
            {item.label}
          </button>
        ))}
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-orange-50 text-orange-500 text-sm font-medium mt-1">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Settings
        </button>
        <div className="mt-auto">
          <button className="w-full border border-gray-200 text-gray-500 text-xs rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors">
            🚀 Get Pro Support
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-56">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <Link href="/about" className="text-orange-500 font-bold text-lg lg:hidden flex items-center gap-1.5">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 9a3 3 0 100 6 3 3 0 000-6z"/>
                <path fillRule="evenodd" d="M9.343 3.071A1 1 0 0110.28 3h3.44a1 1 0 01.937.651l.528 1.398H18a2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V7.05a2 2 0 012-2h2.815l.528-1.398zM12 8a4 4 0 100 8 4 4 0 000-8z" clipRule="evenodd"/>
              </svg>
              STUDION
            </Link>
            <h1 className="text-lg font-bold text-gray-900">Profile photographer</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input className="bg-gray-100 rounded-full px-4 py-2 text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-200 w-48" placeholder="Search..." />
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <button className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            </svg>
            </button>
            <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80" alt="avatar" className="w-9 h-9 rounded-full object-cover border-2 border-orange-200" />
          </div>
        </header>

        <div className="p-6 max-w-4xl mx-auto space-y-6">
          {/* Page title */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Hồ sơ Nhiếp ảnh gia</h2>
              <p className="text-gray-400 text-sm mt-1">Quản lý cách bạn xuất hiện trước khách hàng trên Photor AI.</p>
            </div>
            <div className="flex gap-2">
              <button className="border border-gray-200 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">Hủy</button>
              <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Lưu thay đổi
              </button>
            </div>
          </div>

          {/* Basic Info Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Thông tin cơ bản
            </h3>
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div className="relative">
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80" alt="Markus" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow" />
                  <button className="absolute bottom-0 right-0 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center shadow">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-400">Tỉnh trạng JPG, PNG</div>
                  <div className="text-xs text-gray-400">Tối đa 5MB</div>
                </div>
              </div>

              {/* Fields */}
              <div className="flex-1 grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Tên hiển thị</label>
                  <input defaultValue="Markus Andersen" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Chức danh chuyên môn</label>
                  <input defaultValue="Nhiếp ảnh gia Thương mại & Kiến trúc" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-500 mb-1 flex justify-between">
                    <span>Tiểu sử</span>
                    <span className="text-gray-400">{bio.length}/500</span>
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Professional Info Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Thông tin chuyên môn
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="text-xs text-gray-500 mb-2 block">Danh sách thiết bị</label>
                <div className="flex flex-wrap gap-2">
                  {equipmentList.map((e) => (
                    <span key={e} className="bg-gray-100 text-gray-700 text-xs px-3 py-1.5 rounded-full flex items-center gap-1">
                      {e}
                      <button className="text-gray-400 hover:text-gray-600 ml-1">×</button>
                    </span>
                  ))}
                  <button className="text-orange-500 text-xs hover:underline">Thêm thiết bị...</button>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-2 block">Vị trí hoạt động chính</label>
                <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2.5">
                  <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm text-gray-700">TP. Hồ Chí Minh, Việt Nam</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <input type="checkbox" defaultChecked className="accent-blue-500" />
                  <span className="text-xs text-gray-500">Sẵn sàng đi công tác xa</span>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-2 block">Ngôn ngữ</label>
                <div className="flex flex-wrap gap-2">
                  {languages.map((l) => (
                    <span key={l} className="bg-blue-50 text-blue-600 text-xs px-3 py-1.5 rounded-full flex items-center gap-1">
                      {l}
                      <button className="hover:text-blue-800 ml-1">×</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Portfolio Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Ảnh nổi bật (Portfolio)
              </h3>
              <div className="flex gap-2">
                <button className="text-gray-500 text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" /></svg>
                  Sắp xếp
                </button>
                <button className="text-gray-500 text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  Tải lên
                </button>
              </div>
            </div>
            <p className="text-gray-400 text-xs mb-4">Chọn 4-8 bức ảnh ấn tượng nhất để hiển thị đầu tiên trong portfolio của bạn.</p>
            <div className="grid grid-cols-3 gap-3">
              {portfolioImages.map((img, i) => (
                <div key={i} className={`relative rounded-xl overflow-hidden ${img.main ? "row-span-2" : ""}`} style={img.main ? { gridRow: "span 2" } : {}}>
                  <img src={img.src} alt="" className="w-full h-full object-cover" style={{ minHeight: img.main ? "280px" : "130px" }} />
                  {img.label && (
                    <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">{img.label}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Services Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Các gói dịch vụ
              </h3>
              <button className="text-orange-500 text-xs font-medium hover:underline flex items-center gap-1">
                + Thêm dịch vụ mới
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {services.map((svc) => (
                <div key={svc.name} className="border border-gray-100 rounded-xl p-4 relative">
                  <button className="absolute top-3 right-3 text-gray-300 hover:text-gray-500">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
                    </svg>
                  </button>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${svc.badgeColor}`}>{svc.badge}</span>
                  <h4 className="font-semibold text-gray-900 text-sm mt-2 mb-1">{svc.name}</h4>
                  <div className="text-orange-500 font-bold text-base">
                    {svc.price} <span className="text-gray-400 font-normal text-sm">/{svc.unit}</span>
                  </div>
                  <p className="text-gray-400 text-xs mt-2 leading-relaxed line-clamp-2">{svc.desc}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {svc.delivery}
                    </span>
                    <span className={`flex items-center gap-1 ${svc.statusColor}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
                      {svc.status}
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
