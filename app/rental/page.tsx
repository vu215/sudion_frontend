"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface Equipment {
  id: number;
  owner_id: string;
  name: string;
  type: "camera" | "lens" | "lighting" | "accessory";
  brand: string;
  condition: string;
  rate_per_day: number;
  deposit_amount: number;
  description: string;
  location: string;
  images: string;
  status: string;
}

const typeLabels = {
  all: "Tất cả thiết bị",
  camera: "Máy ảnh (Body)",
  lens: "Ống kính (Lens)",
  lighting: "Thiết bị ánh sáng",
  accessory: "Phụ kiện đi kèm",
};

const locations = ["Tất cả khu vực", "Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Đà Lạt"];

export default function RentalPage() {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [type, setType] = useState("all");
  const [location, setLocation] = useState("Tất cả khu vực");
  const [search, setSearch] = useState("");
  const [openTypeDropdown, setOpenTypeDropdown] = useState(false);
  const [openLocDropdown, setOpenLocDropdown] = useState(false);
  const filterContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (filterContainerRef.current && !filterContainerRef.current.contains(e.target as Node)) {
        setOpenTypeDropdown(false);
        setOpenLocDropdown(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  useEffect(() => {
    fetchEquipments();
  }, [type, location]);

  const fetchEquipments = async () => {
    try {
      setLoading(true);
      setError("");
      
      let url = `${API_URL}/equipments?`;
      if (type !== "all") url += `type=${type}&`;
      if (location !== "Tất cả khu vực") url += `location=${encodeURIComponent(location)}&`;
      if (search.trim()) url += `search=${encodeURIComponent(search.trim())}&`;

      const res = await fetch(url);
      const resData = await res.json();
      if (resData.success) {
        setEquipments(resData.data);
      } else {
        setError(resData.message || "Không thể tải danh sách thiết bị.");
      }
    } catch (err) {
      console.error(err);
      setError("Đã xảy ra lỗi kết nối máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEquipments();
  };

  const formatPrice = (value: any) => {
    const num = Math.round(Number(value || 0));
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
  };

  const getParsedImages = (imagesJson: string | string[]) => {
    try {
      if (Array.isArray(imagesJson)) return imagesJson;
      const parsed = JSON.parse(imagesJson);
      return Array.isArray(parsed) && parsed.length > 0
        ? parsed
        : ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80"];
    } catch {
      return ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80"];
    }
  };

  return (
    <main className="bg-white min-h-screen font-sans text-slate-900 pb-16">
      <div className="mx-auto w-full max-w-[1440px] px-6 pt-6 md:px-12 lg:px-20">
        <div className="relative mb-10 md:mb-12">
          <div className="relative min-h-[260px] overflow-hidden rounded-[26px] bg-slate-950 shadow-md flex items-center px-8 md:px-16 py-12">
            <img 
              src="https://images.unsplash.com/photo-1495707902641-75cac588d2e9?auto=format&fit=crop&w=1500&q=80" 
              alt="Dịch vụ thuê máy ảnh chuyên nghiệp" 
              className="absolute inset-0 w-full h-full object-cover opacity-35 object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent" />
            
            <div className="relative z-10 max-w-[650px]">
              <span className="inline-block text-[11px] font-extrabold tracking-wider text-[#ff8d28] uppercase bg-[#ff8d28]/10 px-3 py-1 rounded-full mb-3">
                Sudion Gear Sharing
              </span>
              <h1 className="text-3xl md:text-5xl font-black text-white leading-tight uppercase">
                Thuê thiết bị <br className="hidden md:inline"/> Máy ảnh chuyên nghiệp
              </h1>
              <p className="mt-3 text-slate-300 text-sm md:text-[15px] font-medium leading-relaxed">
                Kết nối thuê máy ảnh, ống kính, đèn studio nhàn rỗi trực tiếp từ cộng đồng nhiếp ảnh gia Sudion. Tiết kiệm, uy tín và đầy đủ hợp đồng.
              </p>
            </div>
          </div>

          <div ref={filterContainerRef} className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-20 w-[calc(100%-48px)] sm:w-[calc(100%-80px)] md:w-[calc(100%-96px)] lg:w-[calc(100%-112px)] max-w-[920px]">
            <form onSubmit={handleSearchSubmit} className="search-bar-container w-full bg-white rounded-[24px] md:rounded-full p-1.5 md:p-0 md:pl-6 shadow-[0_12px_35px_rgba(0,0,0,0.06)] border border-slate-100/80 flex flex-col md:flex-row md:items-center md:justify-between gap-2.5 md:gap-0 md:h-[48px]">
              <div className="flex-1 min-w-0 relative">
                <div onClick={() => { setOpenTypeDropdown(!openTypeDropdown); setOpenLocDropdown(false); }} className="flex min-h-[40px] items-center gap-2.5 px-4 bg-transparent cursor-pointer select-none">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-slate-800" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M4 7h3l1.5-2h7L17 7h3v12H4Z" /><circle cx="12" cy="13" r="4" />
                  </svg>
                  <span className="text-sm font-bold text-slate-800 truncate">
                    {typeLabels[type as keyof typeof typeLabels] || "Loại thiết bị"}
                  </span>
                </div>
                {openTypeDropdown && (
                  <div className="absolute top-[calc(100%+12px)] left-0 w-full bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-slate-100 py-1.5 z-30 min-w-[200px]">
                    {Object.entries(typeLabels).map(([key, val]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => { setType(key); setOpenTypeDropdown(false); }}
                        className={`w-full text-left px-4 py-2 text-sm font-semibold transition cursor-pointer block ${
                          type === key ? "text-[#ff4f00] bg-slate-50" : "text-slate-700 hover:bg-slate-50 hover:text-[#ff4f00]"
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 relative">
                <div onClick={() => { setLocation(loc => loc); setOpenLocDropdown(!openLocDropdown); setOpenTypeDropdown(false); }} className="flex min-h-[40px] items-center gap-2.5 px-4 bg-transparent cursor-pointer select-none">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-slate-800" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" />
                  </svg>
                  <span className="text-sm font-bold text-slate-800 truncate">
                    {location}
                  </span>
                </div>
                {openLocDropdown && (
                  <div className="absolute top-[calc(100%+12px)] left-0 w-full bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-slate-100 py-1.5 z-30 min-w-[200px]">
                    {locations.map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => { setLocation(loc); setOpenLocDropdown(false); }}
                        className={`w-full text-left px-4 py-2 text-sm font-semibold transition cursor-pointer block ${
                          location === loc ? "text-[#ff4f00] bg-slate-50" : "text-slate-700 hover:bg-slate-50 hover:text-[#ff4f00]"
                        }`}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex-[1.2] min-w-0">
                <div className="flex min-h-[40px] items-center gap-2.5 px-4">
                  <svg className="h-4.5 w-4.5 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input 
                    type="text" 
                    placeholder="Tìm tên máy ảnh, ống kính..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full text-sm font-semibold outline-none border-0 text-slate-800 placeholder-slate-400 bg-transparent"
                  />
                </div>
              </div>

              <div className="p-0.5 md:p-0">
                <button type="submit" className="flex h-[46px] md:h-[48px] items-center justify-center gap-2 rounded-[20px] md:rounded-r-full md:rounded-l-none bg-gradient-to-r from-[#ff5e00] to-[#ff3c00] px-8 text-[15px] font-extrabold text-white transition hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap w-full md:w-auto cursor-pointer">
                  Tìm đồ
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="pt-10 md:pt-14">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#ff8d28] border-t-transparent mb-4"></div>
              <p className="text-slate-500 font-bold">Đang tải danh sách thiết bị...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-red-500 font-extrabold text-lg">{error}</p>
              <button onClick={fetchEquipments} className="mt-4 px-6 py-2 bg-[#ff8d28] text-white font-extrabold rounded-full shadow hover:bg-orange-600 transition">Thử lại</button>
            </div>
          ) : equipments.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-100">
              <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="mt-4 text-slate-600 font-bold text-lg">Không tìm thấy thiết bị nào phù hợp.</p>
              <p className="text-slate-400 text-sm mt-1">Hãy thử đổi bộ lọc tìm kiếm hoặc từ khóa khác.</p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase">
                  Thiết bị nổi bật ({equipments.length})
                </h2>
                <div className="text-sm font-bold text-slate-500">
                  Hiển thị thiết bị khả dụng
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {equipments.map((item) => {
                  const image = getParsedImages(item.images)[0];
                  return (
                    <div key={item.id} className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200/60 overflow-hidden flex flex-col transition-all duration-300">
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                        <img 
                          src={image} 
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                          {typeLabels[item.type as keyof typeof typeLabels] ? typeLabels[item.type as keyof typeof typeLabels].split(" ")[0] : "Thiết bị"}
                        </div>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-1 text-[11px] font-extrabold text-slate-400 uppercase tracking-wide">
                            <span>{item.brand}</span>
                            <span>•</span>
                            <span className="text-[#ff8d28]">{item.condition}</span>
                          </div>
                          <h3 className="mt-1.5 text-[15px] font-extrabold text-slate-800 line-clamp-1 group-hover:text-[#ff8d28] transition-colors">
                            {item.name}
                          </h3>
                          <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        </div>

                        <div className="mt-5 pt-4 border-t border-slate-50">
                          <div className="flex items-center justify-between gap-2 mb-4">
                            <div>
                              <div className="text-[10px] font-bold text-slate-400 uppercase">Giá thuê</div>
                              <div className="text-md font-black text-[#ff8d28]">
                                {formatPrice(item.rate_per_day)}<span className="text-[10px] font-bold text-slate-400">/ngày</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-[10px] font-bold text-slate-400 uppercase">Tiền cọc</div>
                              <div className="text-xs font-bold text-slate-700">
                                {formatPrice(item.deposit_amount)}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-3 pt-1">
                            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
                              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" />
                              </svg>
                              <span>{item.location}</span>
                            </div>

                            <Link href={`/rental/${item.id}`} className="inline-flex items-center justify-center rounded-xl bg-slate-900 text-white font-extrabold text-xs px-4 py-2 hover:bg-[#ff8d28] transition-colors cursor-pointer shadow-sm shadow-slate-900/10">
                              Thuê ngay
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
