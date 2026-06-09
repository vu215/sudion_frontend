"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

const photographers = [
  {
    id: "binh-nguyen",
    name: "Bình Nguyễn",
    title: "Nhiếp ảnh gia Thời trang & Chân dung",
    location: "Tp.HCM, Việt Nam",
    image: "https://images.unsplash.com/photo-1496440737103-cd596325d314?auto=format&fit=crop&w=900&q=85",
    bio: "Với hơn 8 năm kinh nghiệm trong lĩnh vực nhiếp ảnh thời trang và chân dung, tôi tập trung vào việc khai thác vẻ đẹp tự nhiên và ánh sáng trong từng khoảnh khắc.",
    equipment: ["Sony A7R IV", "Canon 5D Mark IV", "24-70mm f/2.8 GM"],
    languages: ["Tiếng Việt (bản địa)", "Tiếng Anh (lưu loát)"],
    services: [
      {
        name: "Chụp ảnh Chân dung",
        desc: "Gói chụp ảnh chân dung cá nhân, phù hợp cho profile và concept riêng.",
        price: "$450",
        tag: "Cơ bản",
      },
      {
        name: "Chụp ảnh Sản phẩm Editorial",
        desc: "Gói chụp ảnh thời trang, lookbook và thương mại với phong cách editorial.",
        price: "$800",
        tag: "Cao cấp",
      },
    ],
    portfolio: [
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80",
    ],
  },
];

export default function ProfilePhotographerPage() {
  return <ProfilePhotographerContent />;
}

function ProfilePhotographerContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const person = photographers.find((p) => p.id === id) || photographers[0];
  const [bio, setBio] = useState(person.bio);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });

  return (
    <main className="p-6 lg:px-10 xl:px-14">
      <div className="mx-auto w-full max-w-[1180px] space-y-6 pb-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-slate-950">Hồ sơ Nhiếp ảnh gia</h1>
              <p className="mt-2 text-sm text-slate-500">Quản lý cách bạn xuất hiện trước khách hàng trên Photor AI.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
                Hủy
              </button>
              <button className="rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600">
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 overflow-hidden rounded-3xl bg-slate-100">
                <img src={person.image} alt={person.name} className="h-full w-full object-cover" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-950">Thông tin cơ bản</h2>
                <p className="text-sm text-slate-500 mt-1">Điều chỉnh hồ sơ để khách hàng thấy đúng phong cách của bạn.</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                <label className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">Tên hiển thị</label>
                <input
                  defaultValue={person.name}
                  className="mt-3 w-full bg-transparent text-sm text-slate-900 outline-none"
                />
              </div>
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                <label className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">Chức danh chuyên môn</label>
                <input
                  defaultValue={person.title}
                  className="mt-3 w-full bg-transparent text-sm text-slate-900 outline-none"
                />
              </div>
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">
                <span>Tiểu sử</span>
                <span className="text-slate-400">{bio.length}/500</span>
              </div>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="mt-3 w-full resize-none rounded-[1.5rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">Giá khởi điểm</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-950">2.500.000 VNĐ</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-700">4.9</p>
                  <p className="text-xs text-slate-400">(128)</p>
                </div>
              </div>
              <div className="mt-6 rounded-[1.5rem] bg-slate-50 p-4">
                <label className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">Ngày chụp</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="mt-3 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-100"
                />
              </div>
              <button className="mt-6 w-full rounded-full bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 transition">
                Đặt lịch ngay
              </button>
              <p className="mt-3 text-xs text-slate-500">Bạn sẽ không bị trừ tiền cho đến khi xác nhận xong.</p>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-3xl bg-orange-50 text-orange-600">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20s8-4 8-10-3.582-6-8-6-8 2.686-8 6 8 10 8 10z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">Thông tin chuyên môn</h2>
                  <p className="text-sm text-slate-500 mt-1">Thiết bị, vị trí và ngôn ngữ làm việc của bạn.</p>
                </div>
              </div>

              <div className="mt-5 grid gap-4">
                <div className="rounded-[1.5rem] bg-slate-50 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">Danh sách thiết bị</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {person.equipment.map((item) => (
                      <span key={item} className="rounded-full bg-white px-3 py-2 text-[11px] text-slate-600 shadow-sm">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.5rem] bg-slate-50 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">Vị trí hoạt động chính</p>
                  <div className="mt-3 rounded-3xl bg-white px-4 py-3 text-sm text-slate-700">{person.location}</div>
                </div>

                <div className="rounded-[1.5rem] bg-slate-50 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">Ngôn ngữ</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {person.languages.map((lang) => (
                      <span key={lang} className="rounded-full bg-white px-3 py-2 text-[11px] text-slate-600 shadow-sm">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">Ảnh nổi bật (Portfolio)</h2>
                  <p className="text-sm text-slate-500 mt-1">Chọn 4 ảnh nổi bật để hiển thị ở đầu trang hồ sơ của bạn.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition">
                    Sắp xếp
                  </button>
                  <button className="rounded-full border border-slate-200 bg-slate-950 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition">
                    Tải lên
                  </button>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-[1.4fr_0.6fr]">
                <div className="rounded-[1.5rem] overflow-hidden bg-slate-200">
                  <img src={person.portfolio[0]} alt="Portfolio" className="h-full w-full object-cover" style={{ minHeight: 280 }} />
                </div>
                <div className="grid gap-3">
                  <img src={person.portfolio[1]} alt="Portfolio" className="h-1/2 w-full rounded-[1.5rem] object-cover" style={{ minHeight: 132 }} />
                  <img src={person.portfolio[2]} alt="Portfolio" className="h-1/2 w-full rounded-[1.5rem] object-cover" style={{ minHeight: 132 }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-950">Các gói dịch vụ</h2>
            <button className="rounded-full text-sm font-semibold text-orange-500">+ Thêm dịch vụ mới</button>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {person.services.map((service) => (
              <div key={service.name} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">{service.tag}</p>
                    <h3 className="mt-2 text-base font-semibold text-slate-950">{service.name}</h3>
                  </div>
                  <span className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-orange-600 shadow-sm">{service.price}</span>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
