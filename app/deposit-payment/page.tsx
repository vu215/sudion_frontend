"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/app/toast-context";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type Booking = {
  booking_code: string;
  photographer_name: string;
  service_name: string;
  deposit_amount: number;
  remaining_amount: number;
  estimated_total: number;
  status: string;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

type PaymentMethod = "momo" | "vnpay" | "bank";

const paymentMethods: {
  id: PaymentMethod;
  label: string;
  description: string;
  mark: string;
}[] = [
  {
    id: "momo",
    label: "MoMo",
    description: "Thanh toán ví điện tử",
    mark: "M",
  },
  {
    id: "vnpay",
    label: "VNPay",
    description: "Quét mã QR ngân hàng",
    mark: "QR",
  },
  {
    id: "bank",
    label: "Chuyển khoản",
    description: "Chuyển khoản thủ công",
    mark: "B",
  },
];

const statusMap: Record<
  string,
  {
    label: string;
    className: string;
    dot: string;
  }
> = {
  awaiting_payment: {
    label: "Chờ photographer xác nhận",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },
  accepted: {
    label: "Chờ thanh toán cọc",
    className: "border-blue-200 bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
  },
  confirmed: {
    label: "Đã thanh toán cọc",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  completed: {
    label: "Đã hoàn thành buổi chụp",
    className: "border-purple-200 bg-purple-50 text-purple-700",
    dot: "bg-purple-500",
  },
  fully_paid: {
    label: "Đã thanh toán đủ",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  rejected: {
    label: "Đã từ chối",
    className: "border-red-200 bg-red-50 text-red-700",
    dot: "bg-red-500",
  },
  cancelled: {
    label: "Đã hủy",
    className: "border-slate-200 bg-slate-50 text-slate-600",
    dot: "bg-slate-400",
  },
};

function formatCurrency(value: number | string | null | undefined) {
  return `${Number(value || 0).toLocaleString("vi-VN")} VND`;
}

function getStatusInfo(status: string) {
  return (
    statusMap[status] || {
      label: status,
      className: "border-slate-200 bg-slate-50 text-slate-600",
      dot: "bg-slate-400",
    }
  );
}

async function getBooking(bookingCode: string) {
  const response = await fetch(`${API_URL}/bookings/${bookingCode}`, {
    method: "GET",
    cache: "no-store",
  });

  const json: ApiResponse<Booking> = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.message || "Không thể lấy booking.");
  }

  return json.data;
}

async function payDeposit(bookingCode: string, paymentMethod: string) {
  const response = await fetch(
    `${API_URL}/bookings/${bookingCode}/confirm-payment`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paymentMethod }),
    }
  );

  const json: ApiResponse<Booking> = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.message || "Không thể thanh toán cọc.");
  }

  return json.data;
}

export default function DepositPaymentPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <DepositPaymentContent />
    </Suspense>
  );
}

function DepositPaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  const bookingCode = searchParams.get("id") || "";

  const [booking, setBooking] = useState<Booking | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("momo");
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    async function loadBooking() {
      try {
        if (!bookingCode) {
          throw new Error("Thiếu mã booking.");
        }

        setLoading(true);
        setPageError("");

        const data = await getBooking(bookingCode);
        setBooking(data);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Không thể lấy booking.";

        setPageError(message);
        toast.error("Không thể tải booking", message);
      } finally {
        setLoading(false);
      }
    }

    void loadBooking();
  }, [bookingCode, toast]);

  const canPay = booking?.status === "accepted";

  const selectedMethod = useMemo(() => {
    return (
      paymentMethods.find((item) => item.id === paymentMethod) ||
      paymentMethods[0]
    );
  }, [paymentMethod]);

  async function handlePay() {
    if (!booking) return;

    try {
      setPaying(true);
      setPageError("");

      const updatedBooking = await payDeposit(
        booking.booking_code,
        paymentMethod
      );

      toast.success(
        "Thanh toán cọc thành công",
        `Booking ${updatedBooking.booking_code} đã được thanh toán cọc.`
      );

      router.push("/bookings");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Không thể thanh toán cọc.";

      setPageError(message);
      toast.error("Thanh toán cọc thất bại", message);
    } finally {
      setPaying(false);
    }
  }

  if (loading) {
    return <LoadingScreen />;
  }

  if (pageError && !booking) {
    return <ErrorState message={pageError} />;
  }

  if (!booking) return null;

  const statusInfo = getStatusInfo(booking.status);

  return (
    <main className="min-h-screen bg-[#f8fafc] px-5 py-10 text-[#0f172a] sm:py-14">
      <section className="mx-auto grid w-full max-w-[1180px] gap-6 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">
        <div className="overflow-hidden rounded-[30px] border border-[#e2e8f0] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="relative overflow-hidden bg-[#111827] px-6 py-8 text-white sm:px-8">
            <div className="absolute right-[-90px] top-[-90px] h-[260px] w-[260px] rounded-full bg-[#ff8d28]/25 blur-3xl" />
            <div className="absolute bottom-[-120px] left-[20%] h-[260px] w-[260px] rounded-full bg-white/10 blur-3xl" />

            <div className="relative">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-[12px] font-black uppercase tracking-[0.18em] text-[#ffb267]">
                  Deposit payment
                </p>

                <StatusBadge
                  label={statusInfo.label}
                  className={statusInfo.className}
                  dot={statusInfo.dot}
                />
              </div>

              <h1 className="mt-4 max-w-[680px] text-[34px] font-black leading-[1.05] tracking-[-0.04em] sm:text-[46px]">
                Thanh toán cọc 50%
              </h1>

              <p className="mt-4 max-w-[680px] text-[14px] font-semibold leading-7 text-white/70">
                Chỉ thanh toán cọc sau khi photographer đã xác nhận lịch. Sau
                khi thanh toán, booking sẽ được giữ lịch trong hệ thống.
              </p>
            </div>
          </div>

          <div className="grid gap-5 p-6 sm:p-8">
            <div className="grid gap-4 rounded-[24px] border border-[#eef2f7] bg-[#fbfcff] p-5">
              <SectionTitle
                eyebrow="Thông tin booking"
                title="Chi tiết yêu cầu đặt lịch"
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <InfoCard label="Mã booking" value={booking.booking_code} />
                <InfoCard
                  label="Photographer"
                  value={booking.photographer_name}
                />
                <div className="sm:col-span-2">
                  <InfoCard label="Dịch vụ" value={booking.service_name} />
                </div>
              </div>
            </div>

            <div className="grid gap-4 rounded-[24px] border border-[#ffedd5] bg-[#fff7ed] p-5">
              <SectionTitle
                eyebrow="Số tiền thanh toán"
                title="Cọc trước để giữ lịch"
              />

              <div className="grid gap-3">
                <MoneyRow label="Tổng tiền" value={booking.estimated_total} />
                <MoneyRow
                  label="Thanh toán cọc 50%"
                  value={booking.deposit_amount}
                  strong
                />
                <MoneyRow
                  label="Còn lại sau khi cọc"
                  value={booking.remaining_amount}
                />
              </div>
            </div>

            <div className="grid gap-4 rounded-[24px] border border-[#eef2f7] bg-white p-5">
              <SectionTitle
                eyebrow="Phương thức"
                title="Chọn cách thanh toán"
              />

              <div className="grid gap-3 sm:grid-cols-3">
                {paymentMethods.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPaymentMethod(item.id)}
                    className={`rounded-[18px] border p-4 text-left transition-all ${
                      paymentMethod === item.id
                        ? "border-[#ff8d28] bg-[#fff7ed] shadow-[0_12px_28px_rgba(255,141,40,0.12)]"
                        : "border-[#e2e8f0] bg-white hover:border-[#ffcfaa]"
                    }`}
                  >
                    <span
                      className={`grid h-10 w-10 place-items-center rounded-full text-[13px] font-black ${
                        paymentMethod === item.id
                          ? "bg-[#ff8d28] text-white"
                          : "bg-[#f1f5f9] text-[#64748b]"
                      }`}
                    >
                      {item.mark}
                    </span>

                    <span className="mt-3 block text-[14px] font-black text-[#0f172a]">
                      {item.label}
                    </span>

                    <span className="mt-1 block text-[12px] font-semibold leading-5 text-[#64748b]">
                      {item.description}
                    </span>
                  </button>
                ))}
              </div>

              <PaymentPreview
                method={selectedMethod.label}
                bookingCode={booking.booking_code}
                amount={booking.deposit_amount}
              />
            </div>

            {pageError ? (
              <div className="rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-bold text-red-600">
                {pageError}
              </div>
            ) : null}

            {!canPay ? (
              <div className="rounded-[18px] border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] font-bold leading-6 text-amber-700">
                Booking này chưa ở trạng thái chờ thanh toán cọc. Photographer
                cần xác nhận lịch trước, sau đó bạn mới có thể thanh toán cọc.
              </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={handlePay}
                disabled={!canPay || paying}
                className="rounded-[16px] bg-[#ff8d28] px-5 py-4 text-[14px] font-black text-white shadow-[0_14px_30px_rgba(255,141,40,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#e0751b] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {paying ? "Đang xử lý..." : "Xác nhận thanh toán cọc"}
              </button>

              <Link
                href="/bookings"
                className="rounded-[16px] border border-[#e2e8f0] bg-white px-5 py-4 text-center text-[14px] font-black text-[#334155] transition-all hover:border-[#ffcfaa] hover:text-[#ff8d28]"
              >
                Quay lại booking
              </Link>
            </div>
          </div>
        </div>

        <aside className="rounded-[30px] border border-[#e2e8f0] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.06)] lg:sticky lg:top-[100px]">
          <p className="text-[12px] font-black uppercase tracking-[0.18em] text-[#ff8d28]">
            Payment summary
          </p>

          <h2 className="mt-3 text-[26px] font-black tracking-[-0.04em] text-[#0f172a]">
            Tóm tắt thanh toán
          </h2>

          <div className="mt-5 grid gap-3 rounded-[22px] border border-[#eef2f7] bg-[#fbfcff] p-5">
            <SummaryRow label="Mã booking" value={booking.booking_code} />
            <SummaryRow label="Trạng thái" value={statusInfo.label} />
            <SummaryRow label="Phương thức" value={selectedMethod.label} />
          </div>

          <div className="mt-5 grid gap-3 rounded-[22px] border border-[#ffedd5] bg-[#fff7ed] p-5">
            <SummaryRow
              label="Tổng tiền"
              value={formatCurrency(booking.estimated_total)}
            />
            <SummaryRow
              label="Cần thanh toán"
              value={formatCurrency(booking.deposit_amount)}
              strong
            />
            <SummaryRow
              label="Còn lại"
              value={formatCurrency(booking.remaining_amount)}
            />
          </div>

          <div className="mt-5 rounded-[22px] border border-[#dbeafe] bg-blue-50 p-5">
            <p className="text-[13px] font-black text-blue-700">
              Chính sách hoàn cọc
            </p>

            <p className="mt-2 text-[13px] font-semibold leading-6 text-blue-700/80">
              Bạn có thể hủy trước 48 giờ để được xét hoàn cọc theo chính sách
              của hệ thống.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}

function LoadingScreen() {
  return (
    <main className="min-h-screen bg-[#f8fafc] px-5 py-12">
      <section className="mx-auto grid max-w-[1180px] gap-6 lg:grid-cols-[minmax(0,1fr)_390px]">
        <div className="overflow-hidden rounded-[30px] border border-[#e2e8f0] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="h-[220px] animate-pulse bg-[#111827]" />

          <div className="grid gap-5 p-6 sm:p-8">
            <div className="h-[150px] animate-pulse rounded-[24px] bg-[#eef2f7]" />
            <div className="h-[180px] animate-pulse rounded-[24px] bg-[#eef2f7]" />
            <div className="h-[220px] animate-pulse rounded-[24px] bg-[#eef2f7]" />
          </div>
        </div>

        <div className="hidden h-[420px] animate-pulse rounded-[30px] bg-white lg:block" />
      </section>
    </main>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f8fafc] px-5">
      <div className="w-full max-w-[460px] rounded-[28px] border border-[#e2e8f0] bg-white p-7 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-red-50 text-[24px] font-black text-red-600">
          !
        </div>

        <h1 className="mt-5 text-[26px] font-black tracking-[-0.04em] text-[#0f172a]">
          Không thể mở thanh toán
        </h1>

        <p className="mt-2 text-[14px] font-bold leading-6 text-red-600">
          {message}
        </p>

        <Link
          href="/bookings"
          className="mt-6 inline-flex rounded-[14px] bg-[#ff8d28] px-5 py-3 text-[14px] font-black text-white shadow-[0_12px_28px_rgba(255,141,40,0.2)]"
        >
          Về booking
        </Link>
      </div>
    </main>
  );
}

function SectionTitle({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div>
      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#ff8d28]">
        {eyebrow}
      </p>

      <h2 className="mt-1 text-[20px] font-black tracking-[-0.03em] text-[#0f172a]">
        {title}
      </h2>
    </div>
  );
}

function StatusBadge({
  label,
  className,
  dot,
}: {
  label: string;
  className: string;
  dot: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-black ${className}`}
    >
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-[#eef2f7] bg-white px-4 py-3">
      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#94a3b8]">
        {label}
      </p>

      <p className="mt-1 break-words text-[15px] font-black text-[#0f172a]">
        {value}
      </p>
    </div>
  );
}

function MoneyRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: number;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[16px] bg-white px-4 py-3">
      <p className="text-[13px] font-bold text-[#64748b]">{label}</p>

      <p
        className={`text-right font-black ${
          strong ? "text-[20px] text-[#ff8d28]" : "text-[16px] text-[#111827]"
        }`}
      >
        {formatCurrency(value)}
      </p>
    </div>
  );
}

function PaymentPreview({
  method,
  bookingCode,
  amount,
}: {
  method: string;
  bookingCode: string;
  amount: number;
}) {
  return (
    <div className="rounded-[22px] border border-[#eef2f7] bg-[#fbfcff] p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="grid h-[120px] w-[120px] shrink-0 place-items-center rounded-[22px] border border-[#e2e8f0] bg-white">
          <div className="grid h-[88px] w-[88px] place-items-center rounded-[18px] bg-[#111827] text-center text-[12px] font-black leading-4 text-white">
            QR
            <br />
            DEMO
          </div>
        </div>

        <div className="min-w-0">
          <p className="text-[13px] font-black text-[#0f172a]">
            Thanh toán qua {method}
          </p>

          <p className="mt-2 text-[13px] font-semibold leading-6 text-[#64748b]">
            Nội dung chuyển khoản:
          </p>

          <p className="mt-1 rounded-[12px] bg-white px-3 py-2 text-[13px] font-black text-[#ff8d28]">
            {bookingCode}
          </p>

          <p className="mt-2 text-[13px] font-semibold text-[#64748b]">
            Số tiền:{" "}
            <span className="font-black text-[#0f172a]">
              {formatCurrency(amount)}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-[12px] font-bold text-[#64748b]">{label}</span>

      <span
        className={`max-w-[210px] text-right text-[13px] font-black leading-5 ${
          strong ? "text-[#ff8d28]" : "text-[#0f172a]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}