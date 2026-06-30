"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, use } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const AUTO_REFRESH_MS = 8000;

type Booking = {
  booking_code: string;
  photographer_id?: string | number;
  photographer_name: string;
  service_name: string;
  shoot_date: string | null;
  shoot_time: string | null;
  estimated_total: number;
  deposit_amount: number;
  remaining_amount: number;
  status: string;
  location?: string | null;
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
  const res = await fetch(`${API_URL}/bookings/${code}`, { cache: "no-store" });
  const json: ApiResponse<Booking> = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message || "Không thể tải booking.");
  return json.data;
}

type PkgSuggestion = { id: number; name: string; price: number; image_url?: string | null; category: { name: string; slug: string } };

/* ─── Page ─── */
export default function BookingRequestSuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: bookingCode } = use(params);
  const [booking,      setBooking]      = useState<Booking | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [pageError,    setPageError]    = useState("");
  const [suggestions,  setSuggestions]  = useState<PkgSuggestion[]>([]);

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

  // Load gợi ý dịch vụ từ photographer
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
        // Lấy tối đa 4 gói khác với gói đã đặt
        const others = pkgs.filter(p => p.name !== booking.service_name).slice(0, 4);
        setSuggestions(others);
      } catch { /* silent */ }
    })();
    return () => { ignore = true; };
  }, [booking?.photographer_id, booking?.service_name]);

  const info = useMemo(() => si(booking?.status || "awaiting_payment"), [booking?.status]);

  if (loading) return <Skeleton />;
  if (pageError || !booking) return <ErrorScreen msg={pageError || "Không tìm thấy booking."} />;

  const depositPct = booking.estimated_total > 0
    ? Math.round((booking.deposit_amount / booking.estimated_total) * 100)
    : 50;

  // Tách địa điểm và link ảnh
  const rawLocation  = booking.location || "";
  const photoMatch   = rawLocation.match(/\[Photos:\s*(https?:\/\/[^\]]+)\]/);
  const displayLoc   = rawLocation.split(" [Photos:")[0] || "Chưa chọn";
  const photoLink    = photoMatch?.[1] ?? null;

  return (
    <main className="min-h-screen bg-[#f4f6fa] px-4 py-10 sm:py-14 text-[#0f172a]">
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
              <Field title="Photographer"  value={booking.photographer_name}     />
              <Field title="Dịch vụ"       value={booking.service_name}          />
              <Field title="Ngày chụp"     value={fmtDate(booking.shoot_date)}   />
              <Field title="Giờ chụp"      value={fmtTime(booking.shoot_time)}   />
              <Field title="Địa điểm"      value={displayLoc}                    />
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
              <MoneyCard label={`Cọc ${depositPct}%`} value={booking.deposit_amount} />
              <MoneyCard label="Còn lại"            value={booking.remaining_amount} />
            </div>

            {/* Actions */}
            <ActionButtons booking={booking} />
          </div>
        </div>

        {/* ── Right sidebar ── */}
        <aside className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm lg:sticky lg:top-[88px]">
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

          {/* Auto-refresh note */}
          <div className="mt-4 rounded-xl border border-[#ffedd5] bg-[#fff7ed] p-3">
            <p className="text-[12px] font-black text-[#ea580c]">Tự cập nhật trạng thái</p>
            <p className="mt-1 text-[11px] font-medium leading-4 text-[#9a3412]">
              Khi photographer xác nhận, từ chối hoặc hoàn thành booking, trang này sẽ tự cập nhật sau vài giây.
            </p>
          </div>

          {/* Gợi ý dịch vụ khác */}
          {suggestions.length > 0 && (
            <div className="mt-4">
              <p className="text-[11px] font-black uppercase tracking-widest text-[#ff8d28]">Gợi ý thêm</p>
              <div className="mt-2 grid gap-2">
                {suggestions.map(pkg => (
                  <Link
                    key={pkg.id}
                    href={`/booking?photographer=${booking.photographer_id}&service=${pkg.category.slug}`}
                    className="flex items-center gap-3 rounded-xl border border-[#eef2f7] bg-white p-2.5 transition hover:border-[#ffcfaa] hover:bg-[#fff7ed]"
                  >
                    {/* Thumbnail */}
                    <div className="h-11 w-11 shrink-0 rounded-lg overflow-hidden bg-[#f1f5f9]">
                      <img
                        src={pkg.image_url || getCatImage(pkg.category.slug, pkg.category.name)}
                        alt={pkg.name}
                        className="h-full w-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = getCatImage(pkg.category.slug, pkg.category.name); }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] font-black text-[#0f172a]">{pkg.name}</p>
                      <p className="text-[11px] font-semibold text-[#64748b]">{pkg.category.name}</p>
                      <p className="text-[11px] font-black text-[#ff8d28]">{fmt(pkg.price)}</p>
                    </div>
                    <svg className="h-4 w-4 shrink-0 text-[#cbd5e1]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6"/></svg>
                  </Link>
                ))}
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

// SVG placeholder đúng màu + icon theo từng category — không phụ thuộc domain ngoài
function getCatImage(slug: string, name: string): string {
  const s = (slug + " " + name).toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");

  const make = (bg: string, emoji: string) =>
    `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><rect width='80' height='80' fill='${encodeURIComponent(bg)}' rx='8'/><text x='50%' y='54%' dominant-baseline='middle' text-anchor='middle' font-size='32'>${emoji}</text></svg>`;

  if (s.includes("wedding") || s.includes("cuoi"))                     return make("#fff0f0", "💍");
  if (s.includes("couple")  || s.includes("doi"))                      return make("#fff0f9", "👫");
  if (s.includes("portrait")|| s.includes("chan-dung")||s.includes("ca-nhan")) return make("#f0f4ff", "🧑");
  if (s.includes("event")   || s.includes("su-kien"))                  return make("#f0fff4", "🎉");
  if (s.includes("yearbook")|| s.includes("ky-yeu")||s.includes("tot-nghiep")) return make("#fffbf0", "🎓");
  if (s.includes("travel")  || s.includes("du-lich"))                  return make("#f0fbff", "✈️");
  if (s.includes("food")    || s.includes("am-thuc")||s.includes("san-pham"))  return make("#fff8f0", "🍽️");
  return make("#f8f8f8", "📷");
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
