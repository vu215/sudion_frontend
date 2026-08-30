"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, use, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/toast-context";
import {
  getBookingFromBackend,
  type BackendBooking,
} from "@/app/services/booking-api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type PaymentMethod = "momo" | "vnpay" | "bank";

type PaymentInfo = {
  booking_code: string;
  status: string;
  payment_method: string | null;
  total_amount: number;
  deposit_amount: number;
  remaining_amount: number;
  deposit_status: string;
  final_status: string;
  secure_payloads?: {
    deposit?: {
      bookingCode: string;
      paymentType: string;
      amount: number;
      signature: string;
    };
    final?: {
      bookingCode: string;
      paymentType: string;
      amount: number;
      signature: string;
    };
  };
  bank_info?: {
    bank_name: string;
    account_number: string;
    account_name: string;
    transfer_content: string;
  };
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

const PAYMENT_METHODS: {
  id: PaymentMethod;
  label: string;
  desc: string;
  mark: string;
}[] = [
    {
      id: "momo",
      label: "MoMo",
      desc: "Ví điện tử MoMo",
      mark: "M",
    },
    {
      id: "vnpay",
      label: "VNPay",
      desc: "Quét mã QR ngân hàng",
      mark: "QR",
    },
    {
      id: "bank",
      label: "Chuyển khoản",
      desc: "Chuyển khoản thủ công",
      mark: "TK",
    },
  ];

const STATUS_MAP: Record<
  string,
  {
    label: string;
    color: string;
    dot: string;
  }
> = {
  awaiting_payment: {
    label: "Chờ xác nhận",
    color: "border-amber-200 bg-amber-50 text-amber-700",
    dot: "bg-amber-400",
  },
  accepted: {
    label: "Chờ thanh toán cọc",
    color: "border-blue-200 bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
  },
  confirmed: {
    label: "Đã thanh toán cọc",
    color: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  completed: {
    label: "Đã hoàn thành",
    color: "border-purple-200 bg-purple-50 text-purple-700",
    dot: "bg-purple-500",
  },
  fully_paid: {
    label: "Đã thanh toán đủ",
    color: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  rejected: {
    label: "Đã từ chối",
    color: "border-red-200 bg-red-50 text-red-700",
    dot: "bg-red-400",
  },
  cancelled: {
    label: "Đã hủy",
    color: "border-slate-200 bg-slate-50 text-slate-500",
    dot: "bg-slate-400",
  },
};

const FALLBACK_BANK = {
  id: "TCB",
  account: "19075748293011",
  name: "TRAN THIEN VU",
  bankName: "Techcombank",
};

function fmt(value: number | string | null | undefined) {
  return `${Number(value || 0).toLocaleString("vi-VN")} VNĐ`;
}

function statusInfo(status: string) {
  return (
    STATUS_MAP[status] ?? {
      label: status,
      color: "border-slate-200 bg-slate-50 text-slate-600",
      dot: "bg-slate-400",
    }
  );
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Chưa chọn";
  }

  const cleanValue = String(value).split("T")[0];
  const date = new Date(`${cleanValue}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return cleanValue;
  }

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatTime(value: string | null | undefined, endValue?: string | null | undefined) {
  if (!value) {
    return "Chưa chọn";
  }

  const text = String(value).trim();
  const endText = endValue ? String(endValue).trim() : "";
  const rangeMatch = text.match(/(\d{1,2}:\d{2})\s*(?:-|–|—|đến|to)\s*(\d{1,2}:\d{2})/i);
  if (rangeMatch) {
    return `${rangeMatch[1]} - ${rangeMatch[2]}`;
  }

  if (endText && /\d{1,2}:\d{2}/.test(endText)) {
    return `${text} - ${endText}`;
  }

  return text.slice(0, 5);
}

async function fetchPaymentInfo(code: string): Promise<PaymentInfo> {
  const token = typeof window !== 'undefined' ? window.localStorage.getItem('sudion_token') : null;
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}/payments/${code}`, {
    method: "GET",
    cache: "no-store",
    headers,
  });

  const json: ApiResponse<PaymentInfo> = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.message || "Không thể tải thông tin thanh toán.");
  }

  return json.data;
}

export default function DepositPaymentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const toast = useToast();
  const { id: bookingCode } = use(params);

  const [booking, setBooking] = useState<BackendBooking | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [method, setMethod] = useState<PaymentMethod>("bank");
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  const selectedMethod =
    PAYMENT_METHODS.find((item) => item.id === method) || PAYMENT_METHODS[0];

  const totalAmount = Number(
    paymentInfo?.total_amount || booking?.estimated_total || 0
  );

  const payAmount = Number(
    paymentInfo?.deposit_amount || booking?.deposit_amount || 0
  );

  const remainingAmount = Number(
    paymentInfo?.remaining_amount || booking?.remaining_amount || 0
  );

  const depositPercent =
    totalAmount > 0 ? Math.round((payAmount / totalAmount) * 100) : 50;

  const currentStatus = paymentInfo?.status || booking?.status || "";
  const si = statusInfo(currentStatus);

  const canPay =
    paymentInfo?.deposit_status !== "paid" &&
    ["awaiting_payment", "accepted"].includes(currentStatus);

  const bankName = paymentInfo?.bank_info?.bank_name || FALLBACK_BANK.bankName;
  const accountNumber =
    paymentInfo?.bank_info?.account_number || FALLBACK_BANK.account;
  const accountName =
    paymentInfo?.bank_info?.account_name || FALLBACK_BANK.name;
  const transferContent =
    paymentInfo?.bank_info?.transfer_content || `STUDION ${bookingCode}`;

  const qrUrl = `https://img.vietqr.io/image/${FALLBACK_BANK.id}-${accountNumber}-compact.png?amount=${payAmount}&addInfo=${encodeURIComponent(
    transferContent
  )}&accountName=${encodeURIComponent(accountName)}`;

  async function loadPageData() {
    try {
      setLoading(true);
      setError("");

      if (!bookingCode) {
        throw new Error("Thiếu mã booking.");
      }

      const [bookingData, paymentData] = await Promise.all([
        getBookingFromBackend(bookingCode),
        fetchPaymentInfo(bookingCode),
      ]);

      setBooking(bookingData);
      setPaymentInfo(paymentData);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Không thể tải trang thanh toán.";

      setError(message);
      toast.error("Lỗi", message);
      setBooking(null);
      setPaymentInfo(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPageData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingCode]);

  async function handlePay() {
    if (!paymentInfo) {
      return;
    }

    try {
      setPaying(true);
      setError("");

      if (!canPay) {
        throw new Error("Booking không ở trạng thái phù hợp để thanh toán cọc.");
      }

      const depositPayload = paymentInfo.secure_payloads?.deposit;
      if (!depositPayload) {
        throw new Error("Không tìm thấy chữ ký bảo mật từ hệ thống.");
      }

      router.push(
        `/checkout-gateway?bookingCode=${paymentInfo.booking_code}&paymentType=deposit&amount=${paymentInfo.deposit_amount}&method=${method}&signature=${depositPayload.signature}`
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Thanh toán cọc thất bại.";

      setError(message);
      toast.error("Lỗi thanh toán", message);
      setPaying(false);
    }
  }

  if (loading) {
    return <Skeleton />;
  }

  if (error && !booking && !paymentInfo) {
    return <ErrorScreen msg={error} />;
  }

  if (!booking || !paymentInfo) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#f4f6fa] px-4 py-10 text-[#0f172a] sm:py-14">
      <div className="mx-auto grid max-w-[960px] gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start overflow-hidden">
        <div className="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-sm">
          <div className="relative overflow-hidden bg-[#111827] px-6 py-7 text-white">
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#ff8d28]/20 blur-3xl" />

            <span className="relative text-[11px] font-black uppercase tracking-widest text-[#ffb267]">
              Deposit Payment
            </span>

            <div className="relative mt-3 flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-black">Thanh toán cọc</h1>

              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${si.color}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${si.dot}`} />
                {si.label}
              </span>
            </div>

            <p className="relative mt-2 text-[13px] font-medium leading-relaxed text-white/60">
              Thanh toán cọc qua API bảo mật mới. Hệ thống sẽ ghi nhận payment,
              cập nhật trạng thái booking và lưu lịch sử thanh toán.
            </p>
          </div>

          <div className="grid gap-4 p-5 sm:p-6">
            <Section label="Thông tin đặt lịch">
              <div className="grid gap-3 sm:grid-cols-3">
                <Field title="Mã booking" value={booking.booking_code} />
                <Field title="Photographer" value={booking.photographer_name} />
                <Field title="Dịch vụ" value={booking.service_name} />
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <Field title="Ngày chụp" value={formatDate(booking.shoot_date)} />
                <Field title="Giờ chụp" value={formatTime(booking.shoot_time, booking.shoot_end_time)} />
                <Field title="Địa điểm" value={booking.location || "Chưa chọn"} />
              </div>
            </Section>

            <Section label="Số tiền thanh toán">
              <div className="grid gap-3">
                <MoneyBox label="Tổng tiền" value={fmt(totalAmount)} />

                <MoneyBox
                  label={`Tiền cọc ${depositPercent}%`}
                  value={fmt(payAmount)}
                  highlight
                />

                <MoneyBox
                  label="Còn lại sau buổi chụp"
                  value={fmt(remainingAmount)}
                />

                <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[13px] font-semibold text-[#64748b]">
                      Trạng thái cọc
                    </span>

                    <span
                      className={`text-[13px] font-black ${paymentInfo.deposit_status === "paid"
                          ? "text-emerald-600"
                          : "text-amber-600"
                        }`}
                    >
                      {paymentInfo.deposit_status}
                    </span>
                  </div>
                </div>
              </div>
            </Section>

            <Section label="Phương thức thanh toán">
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {PAYMENT_METHODS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMethod(item.id)}
                    className={`rounded-xl border p-3 text-left transition-all ${method === item.id
                        ? "border-[#ff8d28] bg-[#fff7ed]"
                        : "border-[#e2e8f0] bg-white hover:border-[#ffcfaa]"
                      }`}
                  >
                    <span
                      className={`grid h-8 w-8 place-items-center rounded-full text-[11px] font-black ${method === item.id
                          ? "bg-[#ff8d28] text-white"
                          : "bg-[#f1f5f9] text-[#64748b]"
                        }`}
                    >
                      {item.mark}
                    </span>

                    <p className="mt-2 text-[13px] font-black text-[#0f172a]">
                      {item.label}
                    </p>

                    <p className="text-[11px] font-medium text-[#94a3b8]">
                      {item.desc}
                    </p>
                  </button>
                ))}
              </div>

              <div className="mt-3 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex shrink-0 flex-col items-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrUrl}
                      alt="QR VietQR"
                      className="h-[120px] w-[120px] rounded-lg border border-[#e2e8f0] bg-white object-contain"
                    />

                    <span className="mt-1.5 text-[10px] font-bold uppercase tracking-wide text-[#94a3b8]">
                      Quét VietQR
                    </span>
                  </div>

                  <div className="grid min-w-0 gap-1.5 text-[12px] leading-5 text-[#64748b]">
                    <p>
                      Phương thức:{" "}
                      <strong className="text-[#0f172a]">
                        {selectedMethod.label}
                      </strong>
                    </p>

                    <p>
                      Ngân hàng:{" "}
                      <strong className="text-[#0f172a]">{bankName}</strong>
                    </p>

                    <p>
                      Số tài khoản:{" "}
                      <strong className="select-all text-[#0f172a]">
                        {accountNumber}
                      </strong>
                    </p>

                    <p>
                      Chủ tài khoản:{" "}
                      <strong className="text-[#0f172a]">{accountName}</strong>
                    </p>

                    <p className="mt-1">Nội dung chuyển khoản:</p>

                    <span className="inline-block w-fit select-all rounded-lg border border-orange-100 bg-[#fff7ed] px-3 py-1 text-[13px] font-black text-[#ff8d28]">
                      {transferContent}
                    </span>

                    <p className="mt-1">
                      Số tiền:{" "}
                      <strong className="text-[#ff8d28]">
                        {fmt(payAmount)}
                      </strong>
                    </p>
                  </div>
                </div>
              </div>
            </Section>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-bold text-red-600">
                {error}
              </div>
            )}

            {!canPay && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] font-semibold leading-6 text-amber-700">
                {paymentInfo.deposit_status === "paid"
                  ? "Booking này đã thanh toán cọc rồi."
                  : "Booking cần ở trạng thái awaiting_payment hoặc accepted để thanh toán cọc."}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handlePay}
                disabled={!canPay || paying}
                className="min-w-[160px] flex-1 rounded-xl bg-[#ff8d28] px-5 py-3.5 text-[14px] font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#e0751b] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {paying
                  ? "Đang xử lý..."
                  : paymentInfo.deposit_status === "paid"
                    ? "Đã thanh toán cọc"
                    : "Xác nhận thanh toán cọc"}
              </button>

              <Link
                href="/bookings"
                className="min-w-[120px] flex-1 rounded-xl border border-[#e2e8f0] bg-white px-5 py-3.5 text-center text-[14px] font-black text-[#334155] transition hover:border-[#ff8d28] hover:text-[#ff8d28]"
              >
                Quay lại
              </Link>
            </div>
          </div>
        </div>

        <aside className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm lg:sticky lg:top-[88px]">
          <p className="text-[11px] font-black uppercase tracking-widest text-[#ff8d28]">
            Quy trình
          </p>

          <div className="mt-3 grid gap-1.5">
            {[
              {
                status: "awaiting_payment",
                title: "Gửi yêu cầu",
              },
              {
                status: "accepted",
                title: "Xác nhận lịch",
              },
              {
                status: "confirmed",
                title: "Thanh toán cọc",
              },
              {
                status: "completed",
                title: "Thực hiện chụp",
              },
              {
                status: "fully_paid",
                title: "Hoàn tất",
              },
            ].map((step, index) => {
              const order = [
                "awaiting_payment",
                "accepted",
                "confirmed",
                "completed",
                "fully_paid",
              ];

              const currentIndex = order.indexOf(currentStatus);
              const stepIndex = order.indexOf(step.status);
              const done = currentIndex > stepIndex;
              const active =
                currentStatus === step.status ||
                (currentStatus === "accepted" && step.status === "confirmed");

              return (
                <div
                  key={step.status}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-[12.5px] transition-all ${active
                      ? "border-[#ffcfaa] bg-[#fff7ed] font-black text-[#0f172a]"
                      : "border-[#eef2f7] font-semibold text-[#94a3b8]"
                    }`}
                >
                  <span
                    className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-black ${done
                        ? "bg-[#ff8d28] text-white"
                        : active
                          ? "border border-[#ff8d28] text-[#ff8d28]"
                          : "bg-[#e2e8f0] text-[#94a3b8]"
                      }`}
                  >
                    {done ? "✓" : index + 1}
                  </span>

                  {step.title}
                </div>
              );
            })}
          </div>

          <p className="mt-5 text-[11px] font-black uppercase tracking-widest text-[#ff8d28]">
            Tóm tắt
          </p>

          <div className="mt-3 grid gap-2 rounded-xl border border-[#eef2f7] bg-[#f8fafc] p-4 text-[12px]">
            <SRow label="Mã booking" value={booking.booking_code} />
            <SRow label="Trạng thái" value={si.label} />
            <SRow label="Thanh toán" value={selectedMethod.label} />

            <div className="mt-1 border-t border-[#e2e8f0] pt-2">
              <SRow label="Tổng tiền" value={fmt(totalAmount)} />
              <SRow label="Cần cọc" value={fmt(payAmount)} strong />
              <SRow label="Còn lại" value={fmt(remainingAmount)} />
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-[12px] font-black text-blue-700">
              Chính sách hoàn cọc
            </p>

            <p className="mt-1 text-[12px] font-medium leading-5 text-blue-600/80">
              Hủy trước 48 giờ để được xét hoàn cọc theo chính sách hệ thống.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-3 rounded-xl border border-[#eef2f7] bg-[#fbfcff] p-4">
      <p className="text-[11px] font-black uppercase tracking-widest text-[#ff8d28]">
        {label}
      </p>

      {children}
    </div>
  );
}

function Field({
  title,
  value,
}: {
  title: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="rounded-xl border border-[#eef2f7] bg-white px-3 py-2.5">
      <p className="text-[10px] font-black uppercase tracking-wider text-[#94a3b8]">
        {title}
      </p>

      <p className="mt-0.5 break-words text-[14px] font-black text-[#0f172a]">
        {value || "Chưa có"}
      </p>
    </div>
  );
}

function MoneyBox({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-xl border px-4 py-3 ${highlight
          ? "border-[#ffedd5] bg-[#fff7ed]"
          : "border-[#e2e8f0] bg-[#f8fafc]"
        }`}
    >
      <span
        className={`text-[13px] font-semibold ${highlight ? "text-[#92400e]" : "text-[#64748b]"
          }`}
      >
        {label}
      </span>

      <span
        className={`font-black ${highlight ? "text-[18px] text-[#ff8d28]" : "text-[15px] text-[#0f172a]"
          }`}
      >
        {value}
      </span>
    </div>
  );
}

function SRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="font-semibold text-[#64748b]">{label}</span>

      <span
        className={`text-right font-black ${strong ? "text-[#ff8d28]" : "text-[#0f172a]"
          }`}
      >
        {value}
      </span>
    </div>
  );
}

function Skeleton() {
  return (
    <main className="min-h-screen bg-[#f4f6fa] px-4 py-10">
      <div className="mx-auto grid max-w-[960px] gap-5 lg:grid-cols-[1fr_320px]">
        <div className="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-sm">
          <div className="h-[160px] animate-pulse bg-[#111827]" />

          <div className="grid gap-4 p-5">
            {[150, 180, 200].map((height) => (
              <div
                key={height}
                style={{ height }}
                className="animate-pulse rounded-xl bg-[#eef2f7]"
              />
            ))}
          </div>
        </div>

        <div className="hidden h-[400px] animate-pulse rounded-2xl bg-white lg:block" />
      </div>
    </main>
  );
}

function ErrorScreen({ msg }: { msg: string }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f4f6fa] px-4">
      <div className="w-full max-w-[420px] rounded-2xl border border-[#e2e8f0] bg-white p-7 text-center shadow-sm">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-red-50 text-xl font-black text-red-600">
          !
        </div>

        <h1 className="mt-4 text-xl font-black text-[#0f172a]">
          Không thể tải trang
        </h1>

        <p className="mt-2 text-[13px] font-medium text-red-500">{msg}</p>

        <Link
          href="/bookings"
          className="mt-5 inline-flex rounded-xl bg-[#ff8d28] px-5 py-2.5 text-[13px] font-black text-white"
        >
          Về booking
        </Link>
      </div>
    </main>
  );
}