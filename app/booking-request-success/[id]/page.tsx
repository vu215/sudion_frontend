"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, use } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const AUTO_REFRESH_MS = 8000;

type Booking = {
  id?: number;
  booking_code: string;
  photographer_id?: string | number;
  photographer_name: string;
  service_id?: string | number;
  service_name: string;
  shoot_date: string | null;
  shoot_time: string | null;
  estimated_total: number;
  deposit_amount: number;
  remaining_amount: number;
  status: string;
  location?: string | null;

  customer_full_name?: string;
  customer_phone?: string;
  customer_email?: string;
  contact_channel?: string | null;
  people_scale?: string | null;
  people_extra?: number;
  scene?: string | null;
  concept?: string | null;
  budget?: string | null;
  add_ons?: any;
  reference_file_name?: string | null;
  payment_method?: string | null;
  base_price?: string | number;
  add_on_total?: string | number;
};

type ApiResponse<T> = { success: boolean; message: string; data: T };

const STATUS_MAP: Record<string, { label: string; desc: string; color: string; dot: string }> = {
  awaiting_payment: {
    label: "Chờ photographer xác nhận",
    desc:  "Yêu cầu đã gửi tới photographer. Vui lòng chờ xác nhận lịch.",
    color: "border-amber-200 bg-amber-50 text-amber-700",
    dot:   "bg-amber-400",
  },
  accepted: {
    label: "Photographer đã xác nhận",
    desc:  "Photographer đã xác nhận lịch. Bạn có thể thanh toán cọc để giữ lịch.",
    color: "border-blue-200 bg-blue-50 text-blue-700",
    dot:   "bg-blue-500",
  },
  confirmed: {
    label: "Đã thanh toán cọc",
    desc:  "Thanh toán cọc thành công. Vui lòng đến đúng lịch hẹn.",
    color: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot:   "bg-emerald-500",
  },
  completed: {
    label: "Buổi chụp đã hoàn thành",
    desc:  "Photographer đã hoàn thành buổi chụp. Bạn có thể thanh toán phần còn lại.",
    color: "border-purple-200 bg-purple-50 text-purple-700",
    dot:   "bg-purple-500",
  },
  fully_paid: {
    label: "Đã thanh toán đủ",
    desc:  "Booking hoàn tất. Bạn có thể đánh giá photographer.",
    color: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot:   "bg-emerald-500",
  },
  rejected: {
    label: "Photographer từ chối",
    desc:  "Photographer đã từ chối yêu cầu. Bạn có thể chọn photographer hoặc khung giờ khác.",
    color: "border-red-200 bg-red-50 text-red-700",
    dot:   "bg-red-400",
  },
  cancelled: {
    label: "Booking đã hủy",
    desc:  "Booking này đã được hủy.",
    color: "border-slate-200 bg-slate-50 text-slate-500",
    dot:   "bg-slate-400",
  },
};

function si(status: string) {
  return STATUS_MAP[status] ?? {
    label: status,
    desc:  "Trạng thái booking hiện tại.",
    color: "border-slate-200 bg-slate-50 text-slate-600",
    dot:   "bg-slate-400",
  };
}

function fmt(v: number) { return `${Number(v || 0).toLocaleString("vi-VN")} VNĐ`; }
function fmtDate(v: string | null) {
  if (!v) return "Chưa chọn";
  const d = new Date(v);
  return isNaN(d.getTime()) ? v : d.toLocaleDateString("vi-VN");
}
function fmtTime(v: string | null) { return v ? String(v).slice(0, 5) : "Chưa chọn"; }

async function fetchBooking(code: string): Promise<Booking> {
  const isRental = code.startsWith("RENT-");
  const endpoint = isRental ? `${API_URL}/equipment-bookings/${code}` : `${API_URL}/bookings/${code}`;
  const res = await fetch(endpoint, { cache: "no-store" });
  const json: ApiResponse<any> = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message || "Không thể tải booking.");
  
  if (isRental) {
    const r = json.data;
    let mappedStatus = r.status;
    if (r.status === "paid_deposit") mappedStatus = "confirmed";
    if (r.status === "active") mappedStatus = "confirmed";

    return {
      booking_code: r.booking_code,
      photographer_name: "Giao dịch Cho thuê thiết bị",
      service_name: r.equipment_name,
      shoot_date: r.start_date,
      shoot_time: r.end_date,
      estimated_total: Number(r.total_price),
      deposit_amount: Number(r.deposit_amount),
      remaining_amount: Number(r.total_price),
      status: mappedStatus,
      location: r.equipment_location,
      customer_full_name: r.customer_name,
      customer_phone: r.customer_phone,
      customer_email: r.customer_email,
    };
  }
  return json.data;
}

const WEDDING_SUBTYPES = [
  { id: "pre-wedding", label: "Chụp ảnh cưới", extra: 0, image: "https://i.pinimg.com/736x/d5/39/3f/d5393f1c798379d5dfdf1b85563074dc.jpg" },
  { id: "phong-su", label: "Phóng sự cưới", extra: 2500000, image: "https://i.pinimg.com/736x/6d/c5/19/6dc519d3bd5450d7e06a71e0e5a2a845.jpg" },
  { id: "gia-tien", label: "Lễ gia tiên", extra: 800000, image: "https://i.pinimg.com/736x/88/f0/a4/88f0a43b271ad694a8e10c7eeaf76ea4.jpg" },
  { id: "an-hoi", label: "Lễ ăn hỏi", extra: 800000, image: "https://i.pinimg.com/736x/26/e9/6c/26e96c6c35a006344570ac3fdcb44c41.jpg" },
  { id: "tiec-cuoi", label: "Tiệc cưới", extra: 2000000, image: "https://i.pinimg.com/1200x/ac/88/59/ac88598c891cad0cbe1920807b14187e.jpg" },
  { id: "studio-cuoi", label: "Chụp studio cưới", extra: 1000000, image: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=400&q=80&fit=crop" },
  { id: "le-cuoi", label: "Chụp lễ cưới", extra: 1500000, image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80" },
  { id: "full-day", label: "Chụp full wedding day", extra: 5000000, image: "https://i.pinimg.com/1200x/18/33/4d/18334d20531bae69b882960af71a6113.jpg" },
];

type PkgSuggestion = { id: string | number; name: string; price: number; image_url?: string | null; category: { name: string; slug: string }; isSubtype?: boolean; extra?: number };

export default function BookingRequestSuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: bookingCode } = use(params);
  const router = useRouter();
  const [booking,      setBooking]      = useState<Booking | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [pageError,    setPageError]    = useState("");
  const [suggestions,  setSuggestions]  = useState<PkgSuggestion[]>([]);
  const [switching,    setSwitching]    = useState(false);
  const [showSameCategory, setShowSameCategory] = useState(false);
  const [showOtherCategory, setShowOtherCategory] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function load(showLoading = true) {
      try {
        if (!bookingCode) throw new Error("Thiếu mã booking.");
        if (showLoading) setLoading(true);
        const data = await fetchBooking(bookingCode);
        if (!ignore) setBooking(data);
      } catch (e) {
        if (!ignore) setPageError(e instanceof Error ? e.message : "Không thể tải booking.");
      } finally {
        if (!ignore && showLoading) setLoading(false);
      }
    }
    load(true);
    const t = window.setInterval(() => load(false), AUTO_REFRESH_MS);
    return () => { ignore = true; clearInterval(t); };
  }, [bookingCode]);

  // Load all packages of photographer to suggest
  useEffect(() => {
    if (!booking?.photographer_id) return;
    let ignore = false;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/photographers/${booking.photographer_id}`);
        if (!res.ok) return;
        const json = await res.json();
        if (!json.success || ignore) return;
        const pkgs: PkgSuggestion[] = (json.data?.packages || []);
        setSuggestions(pkgs);
      } catch { /* silent */ }
    })();
    return () => { ignore = true; };
  }, [booking?.photographer_id]);

  // Find category of currently booked service
  const currentPkg = useMemo(() => {
    return suggestions.find(p => p.name === booking?.service_name || p.id === Number(booking?.service_id));
  }, [suggestions, booking]);

  const currentCategorySlug = useMemo(() => {
    if (currentPkg) return currentPkg.category.slug;
    const name = (booking?.service_name || "").toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
    if (name.includes("cuoi") || name.includes("wedding") || name.includes("gia tien") || name.includes("dam hoi")) return "wedding";
    if (name.includes("doi") || name.includes("couple")) return "couple";
    if (name.includes("su kien") || name.includes("event")) return "event";
    if (name.includes("ky yeu") || name.includes("yearbook")) return "yearbook";
    if (name.includes("du lich") || name.includes("travel")) return "travel";
    if (name.includes("am thuc") || name.includes("food") || name.includes("san pham") || name.includes("product")) return "food";
    return "portrait";
  }, [currentPkg, booking]);

  // Group same category (wedding): unselected first, selected last
  const sameCategoryPkgs = useMemo(() => {
    if (currentCategorySlug === "wedding") {
      const basePrice = Number(booking?.base_price || 5000000);
      const list = WEDDING_SUBTYPES.map(sub => ({
        id: sub.id,
        name: sub.label,
        price: basePrice + sub.extra,
        image_url: sub.image,
        category: { name: "Chụp ảnh cưới", slug: "wedding" },
        isSubtype: true,
        extra: sub.extra
      }));
      return [...list].sort((a, b) => {
        const aSelected = a.name === booking?.people_scale;
        const bSelected = b.name === booking?.people_scale;
        if (aSelected && !bSelected) return 1;
        if (!aSelected && bSelected) return -1;
        return 0;
      });
    }

    const list = suggestions.filter(p => p.category.slug === currentCategorySlug);
    return [...list].sort((a, b) => {
      const aSelected = a.name === booking?.service_name || a.id === Number(booking?.service_id);
      const bSelected = b.name === booking?.service_name || b.id === Number(booking?.service_id);
      if (aSelected && !bSelected) return 1;
      if (!aSelected && bSelected) return -1;
      return 0;
    });
  }, [suggestions, currentCategorySlug, booking]);

  // Group other categories' packages
  const otherCategoryPkgs = useMemo(() => {
    return suggestions.filter(p => p.category.slug !== currentCategorySlug);
  }, [suggestions, currentCategorySlug]);

  // Navigate to booking page with the selected service pre-filled
  function handleSelectService(newPkg: any) {
    const isSelected = newPkg.isSubtype
      ? newPkg.name === booking?.people_scale
      : newPkg.name === booking?.service_name || newPkg.id === Number(booking?.service_id);
      
    if (isSelected || switching || !booking) return;

    // Redirect to booking page with photographer + service pre-filled
    const photographerId = String(booking.photographer_id);
    if (newPkg.isSubtype) {
      router.push(`/booking?photographer=${photographerId}&service=wedding&wedding_subtype=${newPkg.id}`);
    } else {
      router.push(`/booking?photographer=${photographerId}&service=${newPkg.category.slug}`);
    }
  }

  const info = useMemo(() => si(booking?.status || "awaiting_payment"), [booking?.status]);

  if (loading) return <Skeleton />;
  if (pageError || !booking) return <ErrorScreen msg={pageError || "Không tìm thấy booking."} />;

  // Hiển thị số tiền cọc và còn lại từ database (mặc định cọc 30%)
  const displayDeposit = Number(booking.deposit_amount !== undefined && booking.deposit_amount !== null ? booking.deposit_amount : Math.round(booking.estimated_total * 0.3));
  const displayRemaining = Number(booking.remaining_amount !== undefined && booking.remaining_amount !== null ? booking.remaining_amount : booking.estimated_total - displayDeposit);

  // Split location and image drive link
  const rawLocation  = booking.location || "";
  const photoMatch   = rawLocation.match(/\[Photos:\s*(https?:\/\/[^\]]+)\]/);
  const displayLoc   = rawLocation.split(" [Photos:")[0] || "Chưa chọn";
  const photoLink    = photoMatch?.[1] ?? null;

  return (
    <main className="min-h-screen bg-[#f4f6fa] px-4 py-10 sm:py-14 text-[#0f172a]">
      {switching && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm text-white">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-t-[#ff8d28] border-white/20" />
          <p className="mt-4 text-sm font-black">Đang chuyển đổi gói dịch vụ...</p>
        </div>
      )}

      <div className="mx-auto max-w-[960px] grid gap-5 lg:grid-cols-[1fr_300px] lg:items-start">

        {/* ── Left ── */}
        <div className="rounded-2xl border border-[#e2e8f0] bg-white shadow-sm overflow-hidden">

          {/* Header */}
          <div className="bg-[#111827] px-6 py-7 text-white relative overflow-hidden">
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#ff8d28]/20 blur-3xl" />
            <div className="relative">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[11px] font-black uppercase tracking-widest text-[#ffb267]">Booking request sent</span>
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${info.color}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${info.dot}`} />
                  {info.label}
                </span>
              </div>
              <h1 className="mt-3 text-2xl font-black">Đã gửi yêu cầu đặt lịch</h1>
              <p className="mt-1.5 text-[13px] text-white/60 font-medium">
                Trang này tự cập nhật mỗi 8 giây — không cần tải lại.
              </p>
            </div>
          </div>

          <div className="grid gap-4 p-5 sm:p-6">

            {/* Booking code */}
            <div className="rounded-xl border border-[#eef2f7] bg-[#f8fafc] px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-wider text-[#94a3b8]">Mã booking</p>
              <p className="mt-1 break-all text-[22px] font-black text-[#111827]">{booking.booking_code}</p>
            </div>

            {/* Info grid */}
            <div className="grid gap-3 sm:grid-cols-2">
              <Field 
                title={booking.booking_code.startsWith("RENT-") ? "Phân loại" : "Photographer"}  
                value={booking.photographer_name}     
              />
              <Field 
                title={booking.booking_code.startsWith("RENT-") ? "Thiết bị" : "Dịch vụ"}       
                value={booking.service_name}          
              />
              <Field 
                title={booking.booking_code.startsWith("RENT-") ? "Ngày nhận máy" : "Ngày chụp"}     
                value={fmtDate(booking.shoot_date)}   
              />
              <Field 
                title={booking.booking_code.startsWith("RENT-") ? "Ngày trả máy" : "Giờ chụp"}      
                value={booking.booking_code.startsWith("RENT-") ? fmtDate(booking.shoot_time) : fmtTime(booking.shoot_time)}   
              />
              <Field 
                title={booking.booking_code.startsWith("RENT-") ? "Nơi nhận máy" : "Địa điểm"}      
                value={displayLoc}                    
              />
              {photoLink && (
                <div className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5">
                  <p className="text-[10px] font-black uppercase tracking-wider text-blue-400">Ảnh buổi chụp</p>
                  <a href={photoLink} target="_blank" rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-[13px] font-black text-blue-700 underline hover:text-blue-900">
                    📂 Google Drive
                  </a>
                </div>
              )}
            </div>

            {/* Status banner */}
            <div className={`rounded-xl border px-4 py-3 ${info.color}`}>
              <p className="text-[13px] font-black">{info.label}</p>
              <p className="mt-1 text-[12px] font-medium leading-5 opacity-90">{info.desc}</p>
            </div>

            {/* Money */}
            <div className="grid grid-cols-3 gap-3">
              <MoneyCard label="Tổng tiền"          value={booking.estimated_total} />
              <MoneyCard label="Cọc 30%"            value={displayDeposit} />
              <MoneyCard label="Còn lại"            value={displayRemaining} />
            </div>

            {/* Actions */}
            <ActionButtons booking={booking} />
          </div>
        </div>

        {/* ── Right sidebar ── */}
        <aside className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm lg:sticky lg:top-[88px] grid gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-[#ff8d28]">Quy trình</p>
            <div className="mt-3 grid gap-1.5">
              {[
                { keys: ["awaiting_payment","accepted","confirmed","completed","fully_paid"], doneKeys: ["accepted","confirmed","completed","fully_paid"], title: "Gửi yêu cầu"          },
                { keys: ["accepted","confirmed","completed","fully_paid"],                   doneKeys: ["confirmed","completed","fully_paid"],            title: "Photographer xác nhận" },
                { keys: ["confirmed","completed","fully_paid"],                              doneKeys: ["completed","fully_paid"],                        title: "Thanh toán cọc"       },
                { keys: ["completed","fully_paid"],                                          doneKeys: ["fully_paid"],                                    title: "Hoàn thành chụp"      },
                { keys: ["fully_paid"],                                                      doneKeys: [],                                                title: "Hoàn tất"             },
              ].map((step, i) => {
                const active = step.keys.includes(booking.status);
                const done   = step.doneKeys.includes(booking.status);
                return (
                  <div key={i} className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-[12.5px] ${active ? "border-[#ffcfaa] bg-[#fff7ed] font-black text-[#0f172a]" : "border-[#eef2f7] text-[#94a3b8] font-semibold"}`}>
                    <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-black ${done ? "bg-[#ff8d28] text-white" : active ? "border border-[#ff8d28] text-[#ff8d28]" : "bg-[#e2e8f0] text-[#94a3b8]"}`}>
                      {done ? "✓" : i + 1}
                    </span>
                    {step.title}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dịch vụ cùng nhóm gợi ý */}
          {sameCategoryPkgs.length > 0 && (
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-[#ff8d28]">Loại hình chụp ảnh</p>
              <div className="mt-2 grid gap-2">
                {(showSameCategory ? sameCategoryPkgs : sameCategoryPkgs.slice(0, 3)).map(pkg => {
                  const isSelected = pkg.isSubtype
                    ? pkg.name === booking?.people_scale
                    : pkg.name === booking?.service_name || pkg.id === Number(booking?.service_id);
                  return (
                    <button
                      key={pkg.id}
                      type="button"
                      disabled={isSelected || switching}
                      onClick={() => handleSelectService(pkg)}
                      className={`flex items-center gap-3 rounded-xl border p-2.5 transition text-left w-full ${
                        isSelected
                          ? "border-[#ff8d28] bg-[#fff7ed] ring-2 ring-[#ff8d28]/20 cursor-default"
                          : "border-[#eef2f7] bg-white hover:border-[#ffcfaa] hover:bg-[#fff7ed]"
                      }`}
                    >
                      <div className="h-11 w-11 shrink-0 rounded-lg overflow-hidden bg-[#f1f5f9]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={pkg.image_url || getCatImage(pkg.category.slug, pkg.category.name, pkg.name)}
                          alt={pkg.name}
                          className="h-full w-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = getCatImage(pkg.category.slug, pkg.category.name, pkg.name); }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className="truncate text-[12px] font-black text-[#0f172a]">{pkg.name}</p>
                          {isSelected && (
                            <span className="shrink-0 rounded-full bg-[#ff8d28] px-1.5 py-0.5 text-[9px] font-black text-white">Đang chọn</span>
                          )}
                        </div>
                        <p className="text-[11px] font-semibold text-[#64748b]">{pkg.category.name}</p>
                        <p className="text-[11px] font-black text-[#ff8d28]">{fmt(pkg.price)}</p>
                      </div>
                      {!isSelected && (
                        <svg className="h-4 w-4 shrink-0 text-[#cbd5e1]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6"/></svg>
                      )}
                    </button>
                  );
                })}
                {sameCategoryPkgs.length > 3 && (
                  <button
                    type="button"
                    onClick={() => setShowSameCategory(v => !v)}
                    className="flex items-center justify-center gap-1 rounded-xl border border-dashed border-[#ffcfaa] py-2 text-[11px] font-black text-[#ff8d28] transition hover:bg-[#fff7ed]"
                  >
                    {showSameCategory ? 'Thu gọn' : `Xem thêm ${sameCategoryPkgs.length - 3} loại`}
                    <svg className={`h-3.5 w-3.5 transition-transform ${showSameCategory ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Dịch vụ khác gợi ý */}
          {otherCategoryPkgs.length > 0 && (
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-[#64748b]">Dịch vụ khác của photographer</p>
              <div className="mt-2 grid gap-2">
                {(showOtherCategory ? otherCategoryPkgs : otherCategoryPkgs.slice(0, 3)).map(pkg => (
                  <button
                    key={pkg.id}
                    type="button"
                    disabled={switching}
                    onClick={() => handleSelectService(pkg)}
                    className="flex items-center gap-3 rounded-xl border border-[#eef2f7] bg-white p-2.5 transition hover:border-[#ffcfaa] hover:bg-[#fff7ed] text-left w-full"
                  >
                    <div className="h-11 w-11 shrink-0 rounded-lg overflow-hidden bg-[#f1f5f9]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={pkg.image_url || getCatImage(pkg.category.slug, pkg.category.name, pkg.name)}
                        alt={pkg.name}
                        className="h-full w-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = getCatImage(pkg.category.slug, pkg.category.name, pkg.name); }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] font-black text-[#0f172a]">{pkg.name}</p>
                      <p className="text-[11px] font-semibold text-[#64748b]">{pkg.category.name}</p>
                      <p className="text-[11px] font-black text-[#ff8d28]">{fmt(pkg.price)}</p>
                    </div>
                    <svg className="h-4 w-4 shrink-0 text-[#cbd5e1]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6"/></svg>
                  </button>
                ))}
                {otherCategoryPkgs.length > 3 && (
                  <button
                    type="button"
                    onClick={() => setShowOtherCategory(v => !v)}
                    className="flex items-center justify-center gap-1 rounded-xl border border-dashed border-[#cbd5e1] py-2 text-[11px] font-black text-[#64748b] transition hover:bg-[#f8fafc]"
                  >
                    {showOtherCategory ? 'Thu gọn' : `Xem thêm ${otherCategoryPkgs.length - 3} dịch vụ`}
                    <svg className={`h-3.5 w-3.5 transition-transform ${showOtherCategory ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                  </button>
                )}
              </div>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}

/* ─── Action buttons ─── */
function ActionButtons({ booking }: { booking: Booking }) {
  const code = encodeURIComponent(booking.booking_code);
  if (booking.status === "accepted") return (
    <div className="flex flex-wrap gap-3">
      <Link href={`/deposit-payment/${code}`} className="flex-1 min-w-[140px] rounded-xl bg-[#ff8d28] px-5 py-3.5 text-center text-[14px] font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#e0751b]">Thanh toán cọc</Link>
      <Link href="/bookings" className="flex-1 min-w-[140px] rounded-xl border border-[#e2e8f0] bg-white px-5 py-3.5 text-center text-[14px] font-black text-[#334155] transition hover:border-[#ff8d28] hover:text-[#ff8d28]">Xem booking của tôi</Link>
    </div>
  );
  if (booking.status === "completed") return (
    <div className="flex flex-wrap gap-3">
      <Link href={`/final-payment/${code}`} className="flex-1 min-w-[140px] rounded-xl bg-[#ff8d28] px-5 py-3.5 text-center text-[14px] font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#e0751b]">Thanh toán còn lại</Link>
      <Link href="/bookings" className="flex-1 min-w-[140px] rounded-xl border border-[#e2e8f0] bg-white px-5 py-3.5 text-center text-[14px] font-black text-[#334155] transition hover:border-[#ff8d28] hover:text-[#ff8d28]">Xem booking của tôi</Link>
    </div>
  );
  if (booking.status === "fully_paid") return (
    <div className="flex flex-wrap gap-3">
      <Link href={`/review?booking=${code}`} className="flex-1 min-w-[140px] rounded-xl bg-[#ff8d28] px-5 py-3.5 text-center text-[14px] font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#e0751b]">Đánh giá photographer</Link>
      <Link href="/bookings" className="flex-1 min-w-[140px] rounded-xl border border-[#e2e8f0] bg-white px-5 py-3.5 text-center text-[14px] font-black text-[#334155] transition hover:border-[#ff8d28] hover:text-[#ff8d28]">Xem booking của tôi</Link>
    </div>
  );
  return (
    <div className="flex flex-wrap gap-3">
      <Link href="/bookings" className="flex-1 min-w-[140px] rounded-xl bg-[#ff8d28] px-5 py-3.5 text-center text-[14px] font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#e0751b]">Xem booking của tôi</Link>
      <Link href="/photographer" className="flex-1 min-w-[140px] rounded-xl border border-[#e2e8f0] bg-white px-5 py-3.5 text-center text-[14px] font-black text-[#334155] transition hover:border-[#ff8d28] hover:text-[#ff8d28]">Chọn photographer khác</Link>
    </div>
  );
}

/* ─── Small helpers ─── */
function Field({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#eef2f7] bg-white px-3 py-2.5">
      <p className="text-[10px] font-black uppercase tracking-wider text-[#94a3b8]">{title}</p>
      <p className="mt-0.5 break-words text-[14px] font-black text-[#0f172a]">{value}</p>
    </div>
  );
}

function MoneyCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-[#eef2f7] bg-[#f8fafc] px-3 py-2.5 text-center">
      <p className="text-[10px] font-bold text-[#64748b]">{label}</p>
      <p className="mt-1 text-[13px] font-black text-[#111827]">{fmt(value)}</p>
    </div>
  );
}

function Skeleton() {
  return (
    <main className="min-h-screen bg-[#f4f6fa] px-4 py-10">
      <div className="mx-auto max-w-[960px] grid gap-5 lg:grid-cols-[1fr_300px]">
        <div className="rounded-2xl border border-[#e2e8f0] bg-white overflow-hidden shadow-sm">
          <div className="h-[140px] animate-pulse bg-[#111827]" />
          <div className="grid gap-4 p-5">
            {[80, 120, 90, 100].map(h => <div key={h} style={{ height: h }} className="animate-pulse rounded-xl bg-[#eef2f7]" />)}
          </div>
        </div>
        <div className="hidden lg:block h-[360px] animate-pulse rounded-2xl bg-white" />
      </div>
    </main>
  );
}

function getCatImage(slug: string, name: string, pkgName: string = ""): string {
  const s = (slug + " " + name + " " + pkgName).toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");

  if (s.includes("wedding") || s.includes("cuoi") || s.includes("gia tien") || s.includes("dam hoi") || s.includes("le gia tien")) {
    return "https://images.unsplash.com/photo-1519741497674-611481863552?w=150&auto=format&fit=crop&q=60";
  }
  if (s.includes("couple") || s.includes("doi")) {
    return "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=150&auto=format&fit=crop&q=60";
  }
  if (s.includes("portrait") || s.includes("chan-dung") || s.includes("ca-nhan")) {
    return "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=60";
  }
  if (s.includes("event") || s.includes("su-kien")) {
    return "https://images.unsplash.com/photo-1511578314322-379afb476865?w=150&auto=format&fit=crop&q=60";
  }
  if (s.includes("yearbook") || s.includes("ky-yeu") || s.includes("tot-nghiep")) {
    return "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=150&auto=format&fit=crop&q=60";
  }
  if (s.includes("travel") || s.includes("du-lich")) {
    return "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=150&auto=format&fit=crop&q=60";
  }
  if (s.includes("food") || s.includes("am-thuc") || s.includes("san-pham") || s.includes("product")) {
    return "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=150&auto=format&fit=crop&q=60";
  }
  return "https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?w=150&auto=format&fit=crop&q=60";
}

function ErrorScreen({ msg }: { msg: string }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f4f6fa] px-4">
      <div className="w-full max-w-[400px] rounded-2xl border border-[#e2e8f0] bg-white p-7 text-center shadow-sm">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-red-50 text-xl font-black text-red-600">!</div>
        <h1 className="mt-4 text-xl font-black text-[#0f172a]">Không thể mở booking</h1>
        <p className="mt-2 text-[13px] font-medium text-red-500">{msg}</p>
        <Link href="/photographer" className="mt-5 inline-flex rounded-xl bg-[#ff8d28] px-5 py-2.5 text-[13px] font-black text-white">Quay lại photographer</Link>
      </div>
    </main>
  );
}
