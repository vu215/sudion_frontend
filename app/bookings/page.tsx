"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/auth-context";
import { useToast } from "@/app/toast-context";
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const AUTO_REFRESH_MS = 8000;

type BookingStatus =
  | "awaiting_payment"
  | "accepted"
  | "confirmed"
  | "completed"
  | "fully_paid"
  | "rejected"
  | "cancelled"
  | string;

type BackendBooking = {
  id: number;
  booking_code: string;

  photographer_id: string;
  photographer_name: string;

  service_id: string;
  service_name: string;
  base_price: number;

  availability_slot_id: string | null;
  availability_slot_label: string | null;

  location: string | null;
  shoot_date: string | null;
  shoot_time: string | null;

  people_scale: string | null;
  people_extra: number;

  scene: string | null;
  concept: string | null;
  budget: string | null;

  add_on_total: number;
  estimated_total: number;
  deposit_amount: number;
  remaining_amount: number;

  add_ons: {
    id: string;
    name: string;
    price: number;
  }[];

  reference_file_name: string | null;
  payment_method: string | null;
  status: BookingStatus;

  customer_full_name: string;
  customer_phone: string;
  customer_email: string;
  contact_channel: string | null;

  created_at: string;
  updated_at: string;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  error?: unknown;
};

const statusTabs = [
  { id: "all", label: "Tất cả" },
  { id: "awaiting_payment", label: "Chờ xác nhận" },
  { id: "accepted", label: "Chờ cọc" },
  { id: "confirmed", label: "Đã cọc" },
  { id: "completed", label: "Chờ thanh toán còn lại" },
  { id: "fully_paid", label: "Đã thanh toán đủ" },
  { id: "cancelled", label: "Đã hủy" },
  { id: "rejected", label: "Từ chối" },
];

const statusMap: Record<
  string,
  {
    label: string;
    note: string;
    className: string;
    dot: string;
  }
> = {
  awaiting_payment: {
    label: "Chờ photographer xác nhận",
    note: "Bạn đã gửi yêu cầu. Photographer sẽ xác nhận hoặc từ chối lịch.",
    className: "bg-[#fff7ed] text-[#ea580c] border-[#fed7aa]",
    dot: "bg-[#f97316]",
  },
  accepted: {
    label: "Photographer đã xác nhận",
    note: "Vui lòng thanh toán cọc 50% để giữ lịch chụp.",
    className: "bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]",
    dot: "bg-[#3b82f6]",
  },
  confirmed: {
    label: "Đã thanh toán cọc",
    note: "Lịch đã được giữ. Bạn có thể chat với photographer.",
    className: "bg-[#ecfdf5] text-[#047857] border-[#bbf7d0]",
    dot: "bg-[#10b981]",
  },
  completed: {
    label: "Chờ thanh toán còn lại",
    note: "Photographer đã hoàn thành buổi chụp. Vui lòng thanh toán phần còn lại.",
    className: "bg-[#fefce8] text-[#a16207] border-[#fde68a]",
    dot: "bg-[#eab308]",
  },
  fully_paid: {
    label: "Đã thanh toán đủ",
    note: "Bạn có thể đánh giá và chat với photographer.",
    className: "bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]",
    dot: "bg-[#22c55e]",
  },
  rejected: {
    label: "Photographer đã từ chối",
    note: "Bạn có thể chọn photographer hoặc khung giờ khác.",
    className: "bg-[#fff1f2] text-[#be123c] border-[#fecdd3]",
    dot: "bg-[#e11d48]",
  },
  cancelled: {
    label: "Đã hủy",
    note: "Booking này đã được hủy.",
    className: "bg-[#f8fafc] text-[#64748b] border-[#e2e8f0]",
    dot: "bg-[#94a3b8]",
  },
};

function getStatusInfo(status: string) {
  return (
    statusMap[status] || {
      label: status,
      note: "Trạng thái booking.",
      className: "bg-[#f8fafc] text-[#475569] border-[#e2e8f0]",
      dot: "bg-[#64748b]",
    }
  );
}

function formatCurrency(value: number | string | null | undefined) {
  const numberValue = Number(value || 0);
  return `${numberValue.toLocaleString("vi-VN")} VND`;
}

function formatDate(value: string | null) {
  if (!value) return "Chưa chọn";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("vi-VN");
}

function formatTime(value: string | null) {
  if (!value) return "Chưa chọn";
  return String(value).slice(0, 5);
}

function getRefundInfo(booking: BackendBooking) {
  if (!booking.shoot_date || !booking.shoot_time) {
    return {
      canRefund: false,
      message: "Chưa đủ ngày giờ để tính chính sách hoàn cọc.",
    };
  }

  const dateText = String(booking.shoot_date).slice(0, 10);
  const timeText = String(booking.shoot_time).slice(0, 5);
  const shootDateTime = new Date(`${dateText}T${timeText}:00`);

  if (Number.isNaN(shootDateTime.getTime())) {
    return {
      canRefund: false,
      message: "Không thể tính chính sách hoàn cọc do ngày giờ không hợp lệ.",
    };
  }

  const diffHours = (shootDateTime.getTime() - Date.now()) / (1000 * 60 * 60);

  if (diffHours >= 48) {
    return {
      canRefund: true,
      message: "Bạn đang hủy trước 48 giờ, có thể được hoàn cọc.",
    };
  }

  return {
    canRefund: false,
    message: "Bạn đang hủy trong vòng 48 giờ, có thể không được hoàn cọc.",
  };
}

async function getBookingsByCustomer(email: string) {
  const response = await fetch(
    `${API_URL}/bookings/customer/${encodeURIComponent(email)}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  const json: ApiResponse<BackendBooking[]> = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.message || "Không thể lấy danh sách booking.");
  }

  return json.data;
}

async function cancelBooking(bookingCode: string, cancelReason: string) {
  const response = await fetch(`${API_URL}/bookings/${bookingCode}/cancel`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      cancelledBy: "customer",
      cancelReason,
    }),
  });

  const json: ApiResponse<BackendBooking> = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.message || "Không thể hủy booking.");
  }

  return json.data;
}

export default function BookingsPage() {
  const { session, isCustomer } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [bookings, setBookings] = useState<BackendBooking[]>([]);
  const [activeStatus, setActiveStatus] = useState("all");
  
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [cancelTarget, setCancelTarget] = useState<BackendBooking | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const sessionEmail = isCustomer ? session?.email || "" : "";
    const savedEmail = window.localStorage.getItem("sudion_booking_email") || "";
    const finalEmail = sessionEmail || savedEmail;

    if (!finalEmail) return;

    setEmail(finalEmail);
    void handleLoadBookings(finalEmail);

    const timer = window.setInterval(async () => {
      try {
        const data = await getBookingsByCustomer(finalEmail);
        setBookings(data);
        window.localStorage.setItem("sudion_booking_email", finalEmail);
      } catch (error) {
        console.error("Auto refresh bookings failed:", error);
      }
    }, AUTO_REFRESH_MS);

    return () => window.clearInterval(timer);
  }, [isCustomer, session?.email]);

  const stats = useMemo(() => {
    return {
      total: bookings.length,
      awaiting: bookings.filter((item) => item.status === "awaiting_payment")
        .length,
      accepted: bookings.filter((item) => item.status === "accepted").length,
      confirmed: bookings.filter((item) => item.status === "confirmed").length,
      completed: bookings.filter((item) => item.status === "completed").length,
      fullyPaid: bookings.filter((item) => item.status === "fully_paid").length,
    };
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    if (activeStatus === "all") {
      return bookings;
    }

    return bookings.filter((item) => item.status === activeStatus);
  }, [activeStatus, bookings]);

  async function handleLoadBookings(targetEmail = email) {
    try {
      const finalEmail = targetEmail.trim();

      if (!finalEmail) {
        setPageError("Vui lòng nhập email đã dùng khi đặt lịch.");
        return;
      }

      setLoading(true);
      setPageError("");
      setSuccessMessage("");

      const data = await getBookingsByCustomer(finalEmail);

      setBookings(data);
      window.localStorage.setItem("sudion_booking_email", finalEmail);
    } catch (error) {
      console.error("Lỗi lấy booking:", error);

      setBookings([]);
      setPageError(
        error instanceof Error
          ? error.message
          : "Không thể lấy danh sách booking."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await handleLoadBookings();
  }

async function handleCancelBooking() {
  if (!cancelTarget) return;

  try {
    setIsCancelling(true);
    setPageError("");
    setSuccessMessage("");

    const updatedBooking = await cancelBooking(
      cancelTarget.booking_code,
      cancelReason.trim() || "Khách hủy lịch"
    );

    setBookings((current) =>
      current.map((item) =>
        item.booking_code === updatedBooking.booking_code
          ? updatedBooking
          : item
      )
    );

    setSuccessMessage(`Đã hủy booking ${updatedBooking.booking_code}.`);

    toast.success(
      "Đã hủy booking",
      `Booking ${updatedBooking.booking_code} đã được hủy.`
    );

    setCancelTarget(null);
    setCancelReason("");
  } catch (error) {
    console.error("Lỗi hủy booking:", error);

    const message =
      error instanceof Error ? error.message : "Không thể hủy booking.";

    setPageError(message);

    toast.error("Hủy booking thất bại", message);
  } finally {
    setIsCancelling(false);
  }
}

  const cancelRefundInfo = cancelTarget ? getRefundInfo(cancelTarget) : null;

  return (
    <main className="min-h-screen bg-[#fafbfc] text-[#0e111d]">
      <section className="mx-auto w-full max-w-[1180px] px-5 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="overflow-hidden rounded-[28px] border border-[#e8eaf1] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
          <div className="relative overflow-hidden bg-[#111827] px-6 py-8 text-white sm:px-8 lg:px-10">
            <div className="absolute right-[-90px] top-[-90px] h-[260px] w-[260px] rounded-full bg-[#ff8d28]/20 blur-3xl" />
            <div className="absolute bottom-[-120px] left-[30%] h-[260px] w-[260px] rounded-full bg-white/10 blur-3xl" />

            <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
              <div>
                <p className="text-[12px] font-black uppercase tracking-[0.18em] text-[#ffb267]">
                  My bookings
                </p>

                <h1 className="mt-3 max-w-[760px] text-[34px] font-black leading-[1.05] tracking-[-0.04em] sm:text-[44px]">
                  Quản lý lịch đặt chụp của bạn
                </h1>

                <p className="mt-4 max-w-[720px] text-[14px] font-medium leading-7 text-white/70">
                  Theo dõi toàn bộ luồng: gửi yêu cầu, photographer xác nhận,
                  thanh toán cọc, thanh toán còn lại, đánh giá và chat.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="rounded-[20px] border border-white/10 bg-white/10 p-3 backdrop-blur-md"
              >
                <label className="grid gap-2">
                  <span className="px-1 text-[12px] font-extrabold text-white/80">
                    Email đặt lịch
                  </span>

                  <span className="flex gap-2 rounded-[14px] bg-white p-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@email.com"
                      className="min-h-[44px] flex-1 border-0 bg-transparent px-3 text-[14px] font-bold text-[#111827] outline-none placeholder:text-[#9ca3af]"
                    />

                    <button
                      type="submit"
                      disabled={loading}
                      className="rounded-[12px] bg-[#ff8d28] px-4 text-[13px] font-black text-white shadow-[0_10px_24px_rgba(255,141,40,0.3)] transition-all hover:bg-[#e0751b] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? "Đang tải" : "Tra cứu"}
                    </button>
                  </span>
                </label>
              </form>
            </div>
          </div>

          <div className="grid gap-4 border-b border-[#eef0f5] bg-[#fbfcff] px-6 py-5 sm:grid-cols-2 lg:grid-cols-6 lg:px-8">
            <StatCard label="Tổng booking" value={stats.total} />
            <StatCard label="Chờ xác nhận" value={stats.awaiting} />
            <StatCard label="Chờ cọc" value={stats.accepted} />
            <StatCard label="Đã cọc" value={stats.confirmed} />
            <StatCard label="Chờ còn lại" value={stats.completed} />
            <StatCard label="Đã thanh toán đủ" value={stats.fullyPaid} />
          </div>

          <div className="px-6 py-5 lg:px-8">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-[22px] font-black tracking-[-0.02em] text-[#0e111d]">
                  Danh sách booking
                </h2>

                <p className="mt-1 text-[13px] font-semibold text-[#6b7280]">
                  Trang này tự cập nhật sau mỗi 8 giây.
                </p>
              </div>

              <Link
                href="/photographer"
                className="inline-flex w-fit items-center justify-center rounded-[12px] bg-[#ff8d28] px-4 py-3 text-[13px] font-black text-white shadow-[0_10px_24px_rgba(255,141,40,0.18)] transition-all hover:translate-y-[-1px] hover:bg-[#e0751b]"
              >
                Tạo booking mới
              </Link>
            </div>

            <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
              {statusTabs.map((tab) => {
                const active = tab.id === activeStatus;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveStatus(tab.id)}
                    className={`shrink-0 rounded-full border px-4 py-2 text-[12px] font-black transition-all ${
                      active
                        ? "border-[#ff8d28] bg-[#fff7ed] text-[#ff8d28]"
                        : "border-[#e8eaf1] bg-white text-[#6b7280] hover:border-[#ffcfaa] hover:text-[#ff8d28]"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {pageError ? (
              <div className="mt-4 rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-bold text-red-600">
                {pageError}
              </div>
            ) : null}

            {successMessage ? (
              <div className="mt-4 rounded-[16px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] font-bold text-emerald-700">
                {successMessage}
              </div>
            ) : null}

            {loading ? (
              <BookingSkeleton />
            ) : filteredBookings.length === 0 ? (
              <EmptyState hasEmail={Boolean(email.trim())} />
            ) : (
              <div className="mt-5 grid gap-4">
                {filteredBookings.map((booking) => (
                  <BookingCard
                    key={booking.booking_code}
                    booking={booking}
                    onCancel={() => {
                      setCancelTarget(booking);
                      setCancelReason("");
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {cancelTarget ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-4 backdrop-blur-sm">
          <div className="w-full max-w-[480px] rounded-[24px] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.25)]">
            <p className="text-[12px] font-black uppercase tracking-[0.16em] text-[#ff8d28]">
              Hủy lịch
            </p>

            <h3 className="mt-2 text-[24px] font-black tracking-[-0.03em] text-[#0e111d]">
              Bạn muốn hủy booking này?
            </h3>

            <p className="mt-2 text-[13px] font-semibold leading-6 text-[#6b7280]">
              Mã booking:{" "}
              <span className="font-black text-[#0e111d]">
                {cancelTarget.booking_code}
              </span>
            </p>

            {cancelTarget.status === "confirmed" ? (
              <div
                className={`mt-4 rounded-[16px] border px-4 py-3 text-[13px] font-bold leading-6 ${
                  cancelRefundInfo?.canRefund
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-amber-200 bg-amber-50 text-amber-700"
                }`}
              >
                {cancelRefundInfo?.message}
              </div>
            ) : (
              <div className="mt-4 rounded-[16px] border border-[#ffedd5] bg-[#fff7ed] px-4 py-3 text-[13px] font-bold leading-6 text-[#9a3412]">
                Nếu đã thanh toán cọc, hệ thống sẽ xét chính sách hủy trước 48
                giờ để hoàn cọc.
              </div>
            )}

            <label className="mt-5 grid gap-2 text-[13px] font-extrabold text-[#0e111d]">
              Lý do hủy
              <textarea
                value={cancelReason}
                onChange={(event) => setCancelReason(event.target.value)}
                placeholder="Ví dụ: Tôi muốn đổi ngày chụp..."
                rows={4}
                className="min-h-[110px] rounded-[14px] border border-[#e8eaf1] bg-[#fafbfc] px-4 py-3 text-[14px] font-semibold text-[#111827] outline-none transition-all focus:border-[#ff8d28] focus:bg-white"
              />
            </label>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setCancelTarget(null);
                  setCancelReason("");
                }}
                disabled={isCancelling}
                className="rounded-[12px] border border-[#e8eaf1] bg-white px-4 py-3 text-[13px] font-black text-[#4b5563] transition-all hover:bg-[#f8fafc] disabled:opacity-60"
              >
                Đóng
              </button>

              <button
                type="button"
                onClick={handleCancelBooking}
                disabled={isCancelling}
                className="rounded-[12px] bg-red-600 px-4 py-3 text-[13px] font-black text-white transition-all hover:bg-red-700 disabled:opacity-60"
              >
                {isCancelling ? "Đang hủy..." : "Xác nhận hủy"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[18px] border border-[#eef0f5] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.035)]">
      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#94a3b8]">
        {label}
      </p>

      <p className="mt-2 text-[28px] font-black tracking-[-0.04em] text-[#0e111d]">
        {value}
      </p>
    </div>
  );
}

function BookingCard({
  booking,
  onCancel,
}: {
  booking: BackendBooking;
  onCancel: () => void;
}) {
  const statusInfo = getStatusInfo(booking.status);
  const canCancel = ["awaiting_payment", "accepted", "confirmed"].includes(
    booking.status
  );

  const refundInfo = getRefundInfo(booking);

  return (
    <article className="overflow-hidden rounded-[22px] border border-[#e8eaf1] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.045)]">
      <div className="flex flex-col gap-4 border-b border-[#eef0f5] bg-[#fbfcff] px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[12px] font-black uppercase tracking-[0.14em] text-[#ff8d28]">
            {booking.booking_code}
          </p>

          <h3 className="mt-1 text-[20px] font-black tracking-[-0.03em] text-[#0e111d]">
            {booking.service_name}
          </h3>

          <p className="mt-1 text-[13px] font-semibold text-[#6b7280]">
            Photographer:{" "}
            <span className="font-black text-[#111827]">
              {booking.photographer_name}
            </span>
          </p>
        </div>

        <span
          className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-2 text-[12px] font-black ${statusInfo.className}`}
        >
          <span className={`h-2 w-2 rounded-full ${statusInfo.dot}`} />
          {statusInfo.label}
        </span>
      </div>

      <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <InfoItem label="Ngày chụp" value={formatDate(booking.shoot_date)} />
            <InfoItem label="Giờ chụp" value={formatTime(booking.shoot_time)} />
            <InfoItem
              label="Địa điểm"
              value={booking.location || "Chưa chọn"}
            />
            <InfoItem
              label="Quy mô"
              value={booking.people_scale || "Chưa chọn"}
            />
          </div>

          <div className="rounded-[16px] border border-[#eef0f5] bg-[#fafbfc] px-4 py-3">
            <p className="text-[12px] font-black uppercase tracking-[0.14em] text-[#94a3b8]">
              Trạng thái hiện tại
            </p>

            <p className="mt-2 text-[14px] font-semibold leading-6 text-[#475569]">
              {statusInfo.note}
            </p>
          </div>

          {["accepted", "confirmed"].includes(booking.status) ? (
            <div className="rounded-[16px] border border-[#ffedd5] bg-[#fff7ed] px-4 py-3">
              <p className="text-[13px] font-black text-[#ea580c]">
                Chính sách hủy cọc
              </p>

              <p className="mt-1 text-[13px] font-semibold leading-6 text-[#9a3412]">
                {booking.status === "confirmed"
                  ? refundInfo.message
                  : "Sau khi thanh toán cọc, nếu hủy trước 48 giờ có thể được hoàn cọc."}
              </p>
            </div>
          ) : null}

          {booking.add_ons?.length ? (
            <div className="rounded-[16px] border border-[#eef0f5] bg-white px-4 py-3">
              <p className="text-[12px] font-black uppercase tracking-[0.14em] text-[#94a3b8]">
                Dịch vụ đi kèm
              </p>

              <div className="mt-2 flex flex-wrap gap-2">
                {booking.add_ons.map((item) => (
                  <span
                    key={item.id}
                    className="rounded-full bg-[#f1f5f9] px-3 py-1 text-[12px] font-bold text-[#475569]"
                  >
                    {item.name}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="grid gap-3 rounded-[18px] border border-[#eef0f5] bg-[#fbfcff] p-4">
          <MoneyRow label="Tổng tiền" value={booking.estimated_total} />
          <MoneyRow
            label="Tiền cọc 50%"
            value={booking.deposit_amount}
            highlight={booking.status === "confirmed"}
          />
          <MoneyRow
            label="Còn lại"
            value={booking.remaining_amount}
            highlight={booking.status === "completed"}
          />

          <div className="my-1 h-px bg-[#e8eaf1]" />

          <div className="grid gap-2">
            {booking.status === "awaiting_payment" ? (
              <button
                type="button"
                disabled
                className="rounded-[12px] bg-[#f1f5f9] px-4 py-3 text-center text-[13px] font-black text-[#64748b]"
              >
                Chờ photographer xác nhận
              </button>
            ) : null}

            {booking.status === "accepted" ? (
              <Link
                href={`/deposit-payment?id=${encodeURIComponent(
                  booking.booking_code
                )}`}
                className="rounded-[12px] bg-[#ff8d28] px-4 py-3 text-center text-[13px] font-black text-white shadow-[0_10px_24px_rgba(255,141,40,0.18)] transition-all hover:bg-[#e0751b]"
              >
                Thanh toán cọc
              </Link>
            ) : null}

            {booking.status === "confirmed" ? (
              <div className="grid gap-2">
                <button
                  type="button"
                  disabled
                  className="rounded-[12px] bg-[#ecfdf5] px-4 py-3 text-center text-[13px] font-black text-[#047857]"
                >
                  Đã cọc, chờ buổi chụp
                </button>

                <Link
                  href={`/messages?booking=${encodeURIComponent(
                    booking.booking_code
                  )}`}
                  className="rounded-[12px] border border-[#e8eaf1] bg-white px-4 py-3 text-center text-[13px] font-black text-[#334155] transition-all hover:border-[#ffcfaa] hover:text-[#ff8d28]"
                >
                  Chat với photographer
                </Link>
              </div>
            ) : null}

            {booking.status === "completed" ? (
              <Link
                href={`/final-payment?id=${encodeURIComponent(
                  booking.booking_code
                )}`}
                className="rounded-[12px] bg-[#ff8d28] px-4 py-3 text-center text-[13px] font-black text-white shadow-[0_10px_24px_rgba(255,141,40,0.18)] transition-all hover:bg-[#e0751b]"
              >
                Thanh toán còn lại
              </Link>
            ) : null}

            {booking.status === "fully_paid" ? (
              <div className="grid gap-2">
                <Link
                  href={`/review?booking=${encodeURIComponent(
                    booking.booking_code
                  )}`}
                  className="rounded-[12px] bg-[#ff8d28] px-4 py-3 text-center text-[13px] font-black text-white shadow-[0_10px_24px_rgba(255,141,40,0.18)] transition-all hover:bg-[#e0751b]"
                >
                  Đánh giá photographer
                </Link>

                <Link
                  href={`/messages?booking=${encodeURIComponent(
                    booking.booking_code
                  )}`}
                  className="rounded-[12px] border border-[#e8eaf1] bg-white px-4 py-3 text-center text-[13px] font-black text-[#334155] transition-all hover:border-[#ffcfaa] hover:text-[#ff8d28]"
                >
                  Chat với photographer
                </Link>
              </div>
            ) : null}

            {canCancel ? (
              <button
                type="button"
                onClick={onCancel}
                className="rounded-[12px] border border-red-200 bg-white px-4 py-3 text-center text-[13px] font-black text-red-600 transition-all hover:bg-red-50"
              >
                Hủy lịch
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] border border-[#eef0f5] bg-white px-4 py-3">
      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#94a3b8]">
        {label}
      </p>

      <p className="mt-1 text-[13px] font-black text-[#111827]">{value}</p>
    </div>
  );
}

function MoneyRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number | string | null | undefined;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[13px] font-bold text-[#64748b]">{label}</span>
      <span
        className={`text-[14px] font-black ${
          highlight ? "text-[#ff8d28]" : "text-[#0e111d]"
        }`}
      >
        {formatCurrency(value)}
      </span>
    </div>
  );
}

function EmptyState({ hasEmail }: { hasEmail: boolean }) {
  return (
    <div className="mt-5 rounded-[22px] border border-dashed border-[#dbe1ea] bg-[#fbfcff] px-6 py-12 text-center">
      <p className="text-[18px] font-black text-[#0e111d]">
        {hasEmail ? "Chưa có booking nào" : "Nhập email để xem booking"}
      </p>

      <p className="mx-auto mt-2 max-w-[520px] text-[14px] font-semibold leading-6 text-[#64748b]">
        {hasEmail
          ? "Khi bạn gửi yêu cầu đặt lịch, booking sẽ xuất hiện tại đây."
          : "Sau khi đăng nhập, hệ thống sẽ tự lấy email tài khoản của bạn."}
      </p>
    </div>
  );
}

function BookingSkeleton() {
  return (
    <div className="mt-5 grid gap-4">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="h-[220px] animate-pulse rounded-[22px] bg-[#f1f5f9]"
        />
      ))}
    </div>
  );
}