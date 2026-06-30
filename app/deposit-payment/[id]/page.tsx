"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/toast-context";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type Booking = {
  booking_code: string;
  photographer_id?: string | number;
  photographer_name: string;
  service_name: string;
  deposit_amount: number;
  remaining_amount: number;
  estimated_total: number;
  status: string;
  location?: string | null;
};

type ApiResponse<T> = { success: boolean; message: string; data: T };
type PaymentMethod = "momo" | "vnpay" | "bank";

const PAYMENT_METHODS: { id: PaymentMethod; label: string; desc: string; mark: string }[] = [
  { id: "momo",  label: "MoMo",          desc: "Ví điện tử MoMo",       mark: "M"  },
  { id: "vnpay", label: "VNPay",         desc: "Quét mã QR ngân hàng",  mark: "QR" },
  { id: "bank",  label: "Chuyển khoản",  desc: "Chuyển khoản thủ công", mark: "TK" },
];

const STATUS_MAP: Record<string, { label: string; color: string; dot: string }> = {
  awaiting_payment: { label: "Chờ xác nhận",        color: "border-amber-200 bg-amber-50 text-amber-700",     dot: "bg-amber-400"  },
  accepted:         { label: "Chờ thanh toán cọc",   color: "border-blue-200 bg-blue-50 text-blue-700",        dot: "bg-blue-500"   },
  confirmed:        { label: "Đã thanh toán cọc",    color: "border-emerald-200 bg-emerald-50 text-emerald-700", dot: "bg-emerald-500"},
  completed:        { label: "Đã hoàn thành",        color: "border-purple-200 bg-purple-50 text-purple-700",   dot: "bg-purple-500" },
  fully_paid:       { label: "Đã thanh toán đủ",     color: "border-emerald-200 bg-emerald-50 text-emerald-700", dot: "bg-emerald-500"},
  rejected:         { label: "Đã từ chối",            color: "border-red-200 bg-red-50 text-red-700",            dot: "bg-red-400"    },
  cancelled:        { label: "Đã hủy",               color: "border-slate-200 bg-slate-50 text-slate-500",      dot: "bg-slate-400"  },
};

const BANK = { id: "TCB", account: "0762682989", name: "TRAN THIEN VU", bankName: "Techcombank" };

function fmt(v: number | null | undefined) {
  return `${Number(v || 0).toLocaleString("vi-VN")} VNĐ`;
}

function statusInfo(s: string) {
  return STATUS_MAP[s] ?? { label: s, color: "border-slate-200 bg-slate-50 text-slate-600", dot: "bg-slate-400" };
}

async function fetchBooking(code: string): Promise<Booking> {
  const res = await fetch(`${API_URL}/bookings/${code}`, { cache: "no-store" });
  const json: ApiResponse<Booking> = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message || "Không thể tải booking.");
  return json.data;
}

async function confirmPayment(code: string, method: string): Promise<Booking> {
  const res = await fetch(`${API_URL}/bookings/${code}/confirm-payment`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paymentMethod: method }),
  });
  const json: ApiResponse<Booking> = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message || "Không thể thanh toán cọc.");
  return json.data;
}

/* ─── Page ─── */
export default function DepositPaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const toast  = useToast();
  const { id: bookingCode } = use(params);

  const [booking,    setBooking]    = useState<Booking | null>(null);
  const [method,     setMethod]     = useState<PaymentMethod>("momo");
  const [pct,        setPct]        = useState<30 | 50 | 100>(30);
  const [loading,    setLoading]    = useState(true);
  const [paying,     setPaying]     = useState(false);
  const [error,      setError]      = useState("");

  const payAmount   = useMemo(() => booking ? Math.round(booking.estimated_total * pct / 100) : 0, [booking, pct]);
  const remaining   = useMemo(() => booking ? booking.estimated_total - payAmount : 0, [booking, payAmount]);
  const selectedM   = PAYMENT_METHODS.find(m => m.id === method) ?? PAYMENT_METHODS[0];
  const canPay      = booking?.status === "accepted";

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setBooking(await fetchBooking(bookingCode));
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Lỗi tải booking.";
        setError(msg);
        toast.error("Lỗi", msg);
      } finally {
        setLoading(false);
      }
    })();
  }, [bookingCode, toast]);

  async function handlePay() {
    if (!booking) return;
    try {
      setPaying(true);
      setError("");
      // Cập nhật số tiền
      await fetch(`${API_URL}/admin/bookings/${booking.booking_code}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deposit_amount: payAmount, remaining_amount: remaining }),
      });
      const updated = await confirmPayment(booking.booking_code, method);
      toast.success("Thanh toán thành công", `Booking ${updated.booking_code} đã được xác nhận.`);
      router.push("/bookings");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Thanh toán thất bại.";
      setError(msg);
      toast.error("Lỗi thanh toán", msg);
    } finally {
      setPaying(false);
    }
  }

  if (loading) return <Skeleton />;
  if (error && !booking) return <ErrorScreen msg={error} />;
  if (!booking) return null;

  const si = statusInfo(booking.status);
  const qrUrl = `https://img.vietqr.io/image/${BANK.id}-${BANK.account}-compact.png?amount=${payAmount}&addInfo=${encodeURIComponent(bookingCode)}&accountName=${encodeURIComponent(BANK.name)}`;

  return (
    <main className="min-h-screen bg-[#f4f6fa] px-4 py-10 sm:py-14 text-[#0f172a]">
      <div className="mx-auto max-w-[960px] grid gap-5 lg:grid-cols-[1fr_320px] lg:items-start">

        {/* ── Left: main card ── */}
        <div className="rounded-2xl border border-[#e2e8f0] bg-white shadow-sm overflow-hidden">

          {/* Header */}
          <div className="bg-[#111827] px-6 py-7 text-white relative overflow-hidden">
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#ff8d28]/20 blur-3xl" />
            <span className="relative text-[11px] font-black uppercase tracking-widest text-[#ffb267]">Deposit Payment</span>
            <div className="relative mt-3 flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-black">Thanh toán cọc</h1>
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${si.color}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${si.dot}`} />
                {si.label}
              </span>
            </div>
            <p className="relative mt-2 text-[13px] text-white/60 font-medium leading-relaxed">
              Thanh toán sau khi photographer xác nhận. Booking sẽ được giữ lịch ngay sau khi thanh toán.
            </p>
          </div>

          <div className="grid gap-4 p-5 sm:p-6">

            {/* Booking info */}
            <Section label="Thông tin đặt lịch">
              <div className="grid gap-3 sm:grid-cols-3">
                <Field title="Mã booking"    value={booking.booking_code}      />
                <Field title="Photographer"  value={booking.photographer_name} />
                <Field title="Dịch vụ"       value={booking.service_name}      />
              </div>
            </Section>

            {/* Amount */}
            <Section label="Chọn mức thanh toán">
              <div className="grid gap-3">
                <div className="flex items-center justify-between rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3">
                  <span className="text-[13px] font-semibold text-[#64748b]">Tổng tiền</span>
                  <span className="text-[15px] font-black text-[#0f172a]">{fmt(booking.estimated_total)}</span>
                </div>

                {/* Percent selector */}
                <div className="flex flex-wrap items-center gap-2">
                  {([30, 50, 100] as const).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPct(p)}
                      className={`rounded-xl px-4 py-2 text-[13px] font-black transition-all border ${
                        pct === p
                          ? "bg-[#ff8d28] text-white border-[#ff8d28] shadow-sm"
                          : "bg-white text-[#64748b] border-[#e2e8f0] hover:border-[#ff8d28] hover:text-[#ff8d28]"
                      }`}
                    >
                      {p === 100 ? "100% (Đủ)" : `Cọc ${p}%`}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between rounded-xl border border-[#ffedd5] bg-[#fff7ed] px-4 py-3">
                  <span className="text-[13px] font-semibold text-[#92400e]">Cần thanh toán ngay</span>
                  <span className="text-[18px] font-black text-[#ff8d28]">{fmt(payAmount)}</span>
                </div>

                {pct < 100 && (
                  <div className="flex items-center justify-between rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3">
                    <span className="text-[13px] font-semibold text-[#64748b]">Còn lại sau buổi chụp</span>
                    <span className="text-[14px] font-black text-[#0f172a]">{fmt(remaining)}</span>
                  </div>
                )}
              </div>
            </Section>

            {/* Payment method */}
            <Section label="Phương thức thanh toán">
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {PAYMENT_METHODS.map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id)}
                    className={`rounded-xl border p-3 text-left transition-all ${
                      method === m.id
                        ? "border-[#ff8d28] bg-[#fff7ed]"
                        : "border-[#e2e8f0] bg-white hover:border-[#ffcfaa]"
                    }`}
                  >
                    <span className={`grid h-8 w-8 place-items-center rounded-full text-[11px] font-black ${method === m.id ? "bg-[#ff8d28] text-white" : "bg-[#f1f5f9] text-[#64748b]"}`}>
                      {m.mark}
                    </span>
                    <p className="mt-2 text-[13px] font-black text-[#0f172a]">{m.label}</p>
                    <p className="text-[11px] text-[#94a3b8] font-medium">{m.desc}</p>
                  </button>
                ))}
              </div>

              {/* QR + bank info */}
              <div className="mt-3 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex flex-col items-center shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrUrl} alt="QR VietQR" className="h-[120px] w-[120px] rounded-lg border border-[#e2e8f0] bg-white object-contain" />
                    <span className="mt-1.5 text-[10px] font-bold text-[#94a3b8] uppercase tracking-wide">Quét VietQR</span>
                  </div>
                  <div className="grid gap-1.5 text-[12px] leading-5 text-[#64748b] min-w-0">
                    <p>Ngân hàng: <strong className="text-[#0f172a]">{BANK.bankName}</strong></p>
                    <p>Số tài khoản: <strong className="text-[#0f172a] select-all">{BANK.account}</strong></p>
                    <p>Chủ tài khoản: <strong className="text-[#0f172a]">{BANK.name}</strong></p>
                    <p className="mt-1">Nội dung chuyển khoản:</p>
                    <span className="inline-block rounded-lg border border-orange-100 bg-[#fff7ed] px-3 py-1 text-[13px] font-black text-[#ff8d28] select-all w-fit">
                      {bookingCode}
                    </span>
                    <p className="mt-1">Số tiền: <strong className="text-[#ff8d28]">{fmt(payAmount)}</strong></p>
                  </div>
                </div>
              </div>
            </Section>

            {/* Errors / warnings */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-bold text-red-600">
                {error}
              </div>
            )}
            {!canPay && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] font-semibold leading-6 text-amber-700">
                Booking cần được photographer xác nhận trước khi thanh toán.
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handlePay}
                disabled={!canPay || paying}
                className="flex-1 min-w-[160px] rounded-xl bg-[#ff8d28] px-5 py-3.5 text-[14px] font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#e0751b] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {paying ? "Đang xử lý..." : "Xác nhận thanh toán cọc"}
              </button>
              <Link
                href="/bookings"
                className="flex-1 min-w-[120px] rounded-xl border border-[#e2e8f0] bg-white px-5 py-3.5 text-center text-[14px] font-black text-[#334155] transition hover:border-[#ff8d28] hover:text-[#ff8d28]"
              >
                Quay lại
              </Link>
            </div>
          </div>
        </div>

        {/* ── Right: sidebar ── */}
        <aside className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm lg:sticky lg:top-[88px]">

          {/* Progress */}
          <p className="text-[11px] font-black uppercase tracking-widest text-[#ff8d28]">Quy trình</p>
          <div className="mt-3 grid gap-1.5">
            {[
              { key: ["awaiting_payment"],              title: "Gửi yêu cầu"     },
              { key: ["accepted"],                      title: "Xác nhận lịch"   },
              { key: ["accepted","confirmed"],          title: "Thanh toán cọc"  },
              { key: ["completed"],                     title: "Thực hiện chụp"  },
              { key: ["fully_paid"],                    title: "Hoàn tất"        },
            ].map((step, i) => {
              const doneStatuses = ["accepted","confirmed","completed","fully_paid","awaiting_payment"];
              const stepIdx = i;
              const curIdx  = ["awaiting_payment","accepted","confirmed","completed","fully_paid"].indexOf(booking.status);
              const done    = curIdx > stepIdx;
              const active  = step.key.includes(booking.status);
              return (
                <div key={i} className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-[12.5px] transition-all ${active ? "border-[#ffcfaa] bg-[#fff7ed] font-black text-[#0f172a]" : "border-[#eef2f7] text-[#94a3b8] font-semibold"}`}>
                  <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-black ${done ? "bg-[#ff8d28] text-white" : active ? "border border-[#ff8d28] text-[#ff8d28]" : "bg-[#e2e8f0] text-[#94a3b8]"}`}>
                    {done ? "✓" : i + 1}
                  </span>
                  {step.title}
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <p className="mt-5 text-[11px] font-black uppercase tracking-widest text-[#ff8d28]">Tóm tắt</p>
          <div className="mt-3 grid gap-2 rounded-xl border border-[#eef2f7] bg-[#f8fafc] p-4 text-[12px]">
            <SRow label="Mã booking"    value={booking.booking_code}      />
            <SRow label="Trạng thái"    value={si.label}                  />
            <SRow label="Thanh toán"    value={selectedM.label}           />
            <div className="border-t border-[#e2e8f0] pt-2 mt-1">
              <SRow label="Tổng tiền"   value={fmt(booking.estimated_total)} />
              <SRow label="Cần cọc"     value={fmt(payAmount)}  strong     />
              {pct < 100 && <SRow label="Còn lại" value={fmt(remaining)} />}
            </div>
          </div>

          {/* Refund note */}
          <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-[12px] font-black text-blue-700">Chính sách hoàn cọc</p>
            <p className="mt-1 text-[12px] font-medium leading-5 text-blue-600/80">
              Hủy trước 48 giờ để được xét hoàn cọc theo chính sách hệ thống.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}

/* ─── Small helpers ─── */

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-3 rounded-xl border border-[#eef2f7] bg-[#fbfcff] p-4">
      <p className="text-[11px] font-black uppercase tracking-widest text-[#ff8d28]">{label}</p>
      {children}
    </div>
  );
}

function Field({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#eef2f7] bg-white px-3 py-2.5">
      <p className="text-[10px] font-black uppercase tracking-wider text-[#94a3b8]">{title}</p>
      <p className="mt-0.5 break-words text-[14px] font-black text-[#0f172a]">{value}</p>
    </div>
  );
}

function SRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-[#64748b] font-semibold">{label}</span>
      <span className={`text-right font-black ${strong ? "text-[#ff8d28]" : "text-[#0f172a]"}`}>{value}</span>
    </div>
  );
}

function Skeleton() {
  return (
    <main className="min-h-screen bg-[#f4f6fa] px-4 py-10">
      <div className="mx-auto max-w-[960px] grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-[#e2e8f0] bg-white overflow-hidden shadow-sm">
          <div className="h-[160px] animate-pulse bg-[#111827]" />
          <div className="grid gap-4 p-5">
            {[150, 180, 200].map(h => (
              <div key={h} style={{ height: h }} className="animate-pulse rounded-xl bg-[#eef2f7]" />
            ))}
          </div>
        </div>
        <div className="hidden lg:block h-[400px] animate-pulse rounded-2xl bg-white" />
      </div>
    </main>
  );
}

function ErrorScreen({ msg }: { msg: string }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f4f6fa] px-4">
      <div className="w-full max-w-[420px] rounded-2xl border border-[#e2e8f0] bg-white p-7 text-center shadow-sm">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-red-50 text-xl font-black text-red-600">!</div>
        <h1 className="mt-4 text-xl font-black text-[#0f172a]">Không thể tải trang</h1>
        <p className="mt-2 text-[13px] font-medium text-red-500">{msg}</p>
        <Link href="/bookings" className="mt-5 inline-flex rounded-xl bg-[#ff8d28] px-5 py-2.5 text-[13px] font-black text-white">
          Về booking
        </Link>
      </div>
    </main>
  );
}
