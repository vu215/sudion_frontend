"use client";

import { useState } from "react";

/* ─── mock data ─────────────────────────────────────────────── */
const defaultPerson = {
  id: "markus-andersen",
  name: "Markus Andersen",
  title: "Nhiếp ảnh gia Thương mại & Kiến trúc",
  location: "TP. Hồ Chí Minh, Việt Nam",
  image:
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
  bio: "Với hơn 10 năm kinh nghiệm trong lĩnh vực nhiếp ảnh thương mại, tôi tập trung vào việc khai thác những khung hình có chiều sâu, tôn vinh ánh sáng tự nhiên và đường nét kiến trúc. Từng cộng tác với nhiều tạp chí thiết kế uy tín.",
  equipment: ["Sony A7R IV", "Canon 5D Mark IV", "24-70mm f/2.8 GM"],
  languages: ["Tiếng Việt (bản địa)", "Tiếng Anh (lưu loát)"],
  portfolio: [
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80",
  ],
  services: [
    {
      id: "s1",
      tag: "Cơ bản",
      tagColor: "bg-[#e8f5e9] text-[#2e7d32]",
      name: "Chụp ảnh Bất động sản Cao cấp",
      price: "$450",
      unit: "/buổi",
      desc: "Gói tiêu chuẩn bao gồm 20 ảnh đã qua chỉnh sửa kỹ lưỡng, phù hợp cho căn hộ cao cấp hoặc biệt thự. Thời gian...",
      delivery: "Giao file trong 48h",
      deliveryColor: "text-green-600",
      status: "Đang hoạt động",
      statusColor: "text-green-600",
      statusDot: "bg-green-500",
    },
    {
      id: "s2",
      tag: "Thương mại",
      tagColor: "bg-[#fff3e0] text-[#e65100]",
      name: "Chụp ảnh Sản phẩm Editorial",
      price: "$800",
      unit: "/ngày",
      desc: "Dịch vụ cho các chiến dịch quảng cáo, lookbook. Bao gồm setup ánh sáng studio chuyên lực và định hướng nghề...",
      delivery: "Cần nhập hỗ trợ",
      deliveryColor: "text-slate-500",
      status: "Đang hoạt động",
      statusColor: "text-green-600",
      statusDot: "bg-green-500",
    },
  ],
};

/* ─── icons ─────────────────────────────────────────────────── */
function IconCamera({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}
function IconWrench({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
    </svg>
  );
}
function IconPin({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
function IconSort({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 6h18M7 12h10M11 18h2" />
    </svg>
  );
}
function IconUpload({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}
function IconDots({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" />
    </svg>
  );
}
function IconStar({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

/* ─── main page ─────────────────────────────────────────────── */
export default function ProfilePhotographerPage() {
  const person = defaultPerson;

  const [name, setName] = useState(person.name);
  const [title, setTitle] = useState(person.title);
  const [bio, setBio] = useState(person.bio);
  const [equipment, setEquipment] = useState<string[]>(person.equipment);
  const [equipmentInput, setEquipmentInput] = useState("");
  const [languages, setLanguages] = useState<string[]>(person.languages);

  const removeEquipment = (item: string) =>
    setEquipment((prev) => prev.filter((e) => e !== item));

  const addEquipment = () => {
    const val = equipmentInput.trim();
    if (val && !equipment.includes(val)) setEquipment((prev) => [...prev, val]);
    setEquipmentInput("");
  };

  const removeLanguage = (lang: string) =>
    setLanguages((prev) => prev.filter((l) => l !== lang));

  return (
    <main className="px-6 py-7 lg:px-8 xl:px-10">
      <div className="mx-auto w-full max-w-[860px] space-y-5 pb-10">

        {/* ── Header ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1a1a2e]">Hồ Sơ Nhiếp Ảnh Gia</h1>
            <p className="mt-1 text-[13px] text-slate-500">
              Quản lý cách bạn xuất hiện trước khách hàng trên Photor AI.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Hủy
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg bg-[#ff8d28] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#e07820] transition"
            >
              <IconUpload className="h-4 w-4" />
              Lưu thay đổi
            </button>
          </div>
        </div>

        {/* ── Thông tin cơ bản ── */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {/* section title */}
          <div className="flex items-center gap-2 mb-5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50 text-[#ff8d28]">
              <IconCamera className="h-4 w-4" />
            </span>
            <h2 className="font-bold text-[#1a1a2e]">Thông tin cơ bản</h2>
          </div>

          <div className="flex flex-col gap-6 sm:flex-row">
            {/* avatar */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div className="relative">
                <img
                  src={person.image}
                  alt={person.name}
                  className="h-[100px] w-[100px] rounded-full object-cover border-2 border-orange-100"
                />
                <button
                  type="button"
                  aria-label="Đổi ảnh đại diện"
                  className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-[#ff8d28] text-white shadow"
                >
                  <IconCamera className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="text-center text-[11px] text-slate-400 leading-tight">
                Định dạng JPG, PNG
                <br />
                Tối đa 5MB
              </p>
            </div>

            {/* fields */}
            <div className="flex-1 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* tên */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Tên hiển thị
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-[#f8f8fb] px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-300 focus:ring-1 focus:ring-orange-100"
                  />
                </div>
                {/* chức danh */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Chức danh chuyên môn
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-[#f8f8fb] px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-300 focus:ring-1 focus:ring-orange-100"
                  />
                </div>
              </div>

              {/* tiểu sử */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-slate-500">Tiểu sử</label>
                  <span className="text-[11px] text-slate-400">{bio.length}/500</span>
                </div>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  maxLength={500}
                  className="w-full resize-none rounded-lg border border-slate-200 bg-[#f8f8fb] px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-300 focus:ring-1 focus:ring-orange-100"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── Thông tin chuyên môn ── */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50 text-[#ff8d28]">
              <IconWrench className="h-4 w-4" />
            </span>
            <h2 className="font-bold text-[#1a1a2e]">Thông tin chuyên môn</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {/* thiết bị */}
            <div>
              <p className="text-[11px] font-semibold text-slate-500 mb-2">Danh sách thiết bị</p>
              <div className="min-h-[96px] rounded-lg border border-slate-200 bg-[#f8f8fb] p-3 flex flex-col gap-2">
                <div className="flex flex-wrap gap-1.5">
                  {equipment.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1 rounded-md bg-white border border-slate-200 px-2.5 py-1 text-xs text-slate-700 shadow-sm"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => removeEquipment(item)}
                        aria-label={`Xóa ${item}`}
                        className="ml-0.5 text-slate-400 hover:text-red-400 leading-none"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-1 mt-auto">
                  <input
                    value={equipmentInput}
                    onChange={(e) => setEquipmentInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addEquipment()}
                    placeholder="Thêm thiết bị..."
                    className="flex-1 rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 outline-none focus:border-orange-300"
                  />
                  <button
                    type="button"
                    onClick={addEquipment}
                    className="rounded border border-orange-200 bg-orange-50 px-2 py-1 text-xs text-orange-600 hover:bg-orange-100 transition"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* vị trí */}
            <div>
              <p className="text-[11px] font-semibold text-slate-500 mb-2">Vị trí hoạt động chính</p>
              <div className="rounded-lg border border-slate-200 bg-[#f8f8fb] p-3">
                <div className="flex items-center gap-1.5 text-sm text-slate-700">
                  <IconPin className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>{person.location}</span>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-[12px] text-slate-500">
                  <span className="inline-block h-2 w-2 rounded-full bg-orange-400 shrink-0" />
                  Sẵn sàng đi công tác xa
                </div>
              </div>
            </div>

            {/* ngôn ngữ */}
            <div>
              <p className="text-[11px] font-semibold text-slate-500 mb-2">Ngôn ngữ</p>
              <div className="rounded-lg border border-slate-200 bg-[#f8f8fb] p-3 flex flex-wrap gap-1.5">
                {languages.map((lang) => (
                  <span
                    key={lang}
                    className="inline-flex items-center gap-1 rounded-md bg-orange-50 border border-orange-200 px-2.5 py-1 text-xs text-orange-700"
                  >
                    {lang}
                    <button
                      type="button"
                      onClick={() => removeLanguage(lang)}
                      aria-label={`Xóa ${lang}`}
                      className="ml-0.5 text-orange-400 hover:text-red-400 leading-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Portfolio ── */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50 text-[#ff8d28]">
                <IconCamera className="h-4 w-4" />
              </span>
              <div>
                <h2 className="font-bold text-[#1a1a2e]">Ảnh nổi bật (Portfolio)</h2>
                <p className="text-[12px] text-slate-500">
                  Chọn 4 bức ảnh ấn tượng nhất để hiển thị ở đầu trang hồ sơ của bạn.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                <IconSort className="h-3.5 w-3.5" />
                Sắp xếp
              </button>
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-[#1a1a2e] px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition"
              >
                <IconUpload className="h-3.5 w-3.5" />
                Tải lên
              </button>
            </div>
          </div>

          {/* grid: 1 ảnh lớn bên trái, 2 ảnh nhỏ bên phải */}
          <div className="grid gap-3 sm:grid-cols-[1.5fr_1fr]">
            <div className="relative overflow-hidden rounded-xl bg-slate-100">
              <img
                src={person.portfolio[0]}
                alt="Portfolio chính"
                className="h-full w-full object-cover"
                style={{ minHeight: 260 }}
              />
              <span className="absolute left-3 top-3 rounded-md bg-black/50 px-2 py-0.5 text-[11px] font-bold text-white backdrop-blur-sm">
                Ảnh chính
              </span>
            </div>
            <div className="flex flex-col gap-3">
              <div className="overflow-hidden rounded-xl bg-slate-100 flex-1">
                <img
                  src={person.portfolio[1]}
                  alt="Portfolio 2"
                  className="h-full w-full object-cover"
                  style={{ minHeight: 124 }}
                />
              </div>
              <div className="overflow-hidden rounded-xl bg-slate-100 flex-1">
                <img
                  src={person.portfolio[2]}
                  alt="Portfolio 3"
                  className="h-full w-full object-cover"
                  style={{ minHeight: 124 }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── Gói dịch vụ ── */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50 text-[#ff8d28]">
                <IconStar className="h-4 w-4" />
              </span>
              <h2 className="font-bold text-[#1a1a2e]">Các gói dịch vụ</h2>
            </div>
            <button
              type="button"
              className="text-sm font-semibold text-[#ff8d28] hover:text-orange-600 transition"
            >
              + Thêm dịch vụ mới
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {defaultPerson.services.map((service) => (
              <div
                key={service.id}
                className="rounded-xl border border-slate-200 bg-[#f8f8fb] p-4 flex flex-col gap-3 shadow-sm"
              >
                {/* top row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <span
                      className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold mb-1.5 ${service.tagColor}`}
                    >
                      {service.tag}
                    </span>
                    <h3 className="text-sm font-bold text-[#1a1a2e] leading-snug">{service.name}</h3>
                    <p className="mt-0.5 text-[#ff8d28] font-bold text-base">
                      {service.price}
                      <span className="text-[11px] font-medium text-slate-500">{service.unit}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label="Tùy chọn"
                    className="text-slate-400 hover:text-slate-600 shrink-0 mt-0.5"
                  >
                    <IconDots className="h-5 w-5" />
                  </button>
                </div>

                {/* desc */}
                <p className="text-[12px] text-slate-500 leading-relaxed line-clamp-2">
                  {service.desc}
                </p>

                {/* footer */}
                <div className="flex items-center justify-between text-[11px] font-semibold">
                  <span className={service.deliveryColor}>
                    📦 {service.delivery}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className={`inline-block h-1.5 w-1.5 rounded-full ${service.statusDot}`} />
                    <span className={service.statusColor}>{service.status}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}
