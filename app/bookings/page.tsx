"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type BookingStatus =
  | "awaiting_payment"
  | "confirmed"
  | "accepted"
  | "rejected"
  | "completed"
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

const statusMap: Record<
  string,
  {
    label: string;
    className: string;
    dot: string;
  }
> = {
  awaiting_payment: {
    label: "Chờ thanh toán",
    className: "bg-[#fff7ed] text-[#ea580c] border-[#fed7aa]",
    dot: "bg-[#f97316]",
  },
  confirmed: {
    label: "Đã thanh toán",
    className: "bg-[#ecfdf5] text-[#047857] border-[#bbf7d0]",
    dot: "bg-[#10b981]",
  },
  accepted: {
    label: "Đã nhận lịch",
    className: "bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]",
    dot: "bg-[#3b82f6]",
  },
  rejected: {
    label: "Đã từ chối",
    className: "bg-[#fff1f2] text-[#be123c] border-[#fecdd3]",
    dot: "bg-[#e11d48]",
  },
  completed: {
    label: "Đã hoàn thành",
    className: "bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]",
    dot: "bg-[#22c55e]",
  },
  cancelled: {
    label: "Đã hủy",
    className: "bg-[#f8fafc] text-[#64748b] border-[#e2e8f0]",
    dot: "bg-[#94a3b8]",
  },
};

const statusTabs = [
  { id: "all", label: "Tất cả" },
  { id: "awaiting_payment", label: "Chờ thanh toán" },
  { id: "confirmed", label: "Đã thanh toán" },
  { id: "accepted", label: "Đã nhận lịch" },
  { id: "completed", label: "Hoàn thành" },
  { id: "cancelled", label: "Đã hủy" },
];

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

function getStatusInfo(status: string) {
  return (
    statusMap[status] || {
      label: status,
      className: "bg-[#f8fafc] text-[#475569] border-[#e2e8f0]",
      dot: "bg-[#64748b]",
    }
  );
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
    const savedEmail = window.localStorage.getItem("sudion_booking_email");

    if (savedEmail) {
      setEmail(savedEmail);
      void handleLoadBookings(savedEmail);
    }
  }, []);

  const stats = useMemo(() => {
    return {
      total: bookings.length,
      awaitingPayment: bookings.filter(
        (item) => item.status === "awaiting_payment"
      ).length,
      confirmed: bookings.filter((item) => item.status === "confirmed").length,
      accepted: bookings.filter((item) => item.status === "accepted").length,
      completed: bookings.filter((item) => item.status === "completed").length,
      cancelled: bookings.filter((item) => item.status === "cancelled").length,
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
      setCancelTarget(null);
      setCancelReason("");
    } catch (error) {
      console.error("Lỗi hủy booking:", error);

      setPageError(
        error instanceof Error ? error.message : "Không thể hủy booking."
      );
    } finally {
      setIsCancelling(false);
    }
  }

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

                <p className="mt-4 max-w-[680px] text-[14px] font-medium leading-7 text-white/70">
                  Nhập email đã dùng khi đặt lịch để xem trạng thái, thanh toán,
                  hủy lịch hoặc theo dõi lịch chụp với photographer.
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

          <div className="grid gap-4 border-b border-[#eef0f5] bg-[#fbfcff] px-6 py-5 sm:grid-cols-2 lg:grid-cols-5 lg:px-8">
            <StatCard label="Tổng booking" value={stats.total} />
            <StatCard label="Chờ thanh toán" value={stats.awaitingPayment} />
            <StatCard label="Đã thanh toán" value={stats.confirmed} />
            <StatCard label="Đã nhận lịch" value={stats.accepted} />
            <StatCard label="Hoàn thành" value={stats.completed} />
          </div>

          <div className="px-6 py-5 lg:px-8">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-[22px] font-black tracking-[-0.02em] text-[#0e111d]">
                  Danh sách booking
                </h2>

                <p className="mt-1 text-[13px] font-semibold text-[#6b7280]">
                  Dữ liệu lấy trực tiếp từ MySQL qua backend.
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
          <div className="w-full max-w-[460px] rounded-[24px] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.25)]">
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
                className="rounded-[12px] border border-[#e8eaf1] bg-white px-4 py-3 text-[13px] font-black text-[#4b5563] transition-all hover:bg-[#f8fafc]"
              >
                Giữ lại
              </button>

              <button
                type="button"
                onClick={handleCancelBooking}
                disabled={isCancelling}
                className="rounded-[12px] bg-[#dc2626] px-4 py-3 text-[13px] font-black text-white transition-all hover:bg-[#b91c1c] disabled:cursor-not-allowed disabled:opacity-60"
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
      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#8a8fa1]">
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

  const canCancel =
    booking.status !== "cancelled" &&
    booking.status !== "completed" &&
    booking.status !== "rejected";

  return (
    <article className="overflow-hidden rounded-[22px] border border-[#e8eaf1] bg-white shadow-[0_14px_36px_rgba(15,23,42,0.045)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_46px_rgba(15,23,42,0.075)]">
      <div className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-black ${statusInfo.className}`}
            >
              <span className={`h-2 w-2 rounded-full ${statusInfo.dot}`} />
              {statusInfo.label}
            </span>

            <span className="rounded-full bg-[#f8fafc] px-3 py-1.5 text-[11px] font-black text-[#64748b]">
              {booking.booking_code}
            </span>
          </div>

          <h3 className="mt-4 text-[22px] font-black leading-tight tracking-[-0.03em] text-[#0e111d]">
            {booking.service_name}
          </h3>

          <p className="mt-2 text-[14px] font-bold text-[#475569]">
            Photographer:{" "}
            <span className="text-[#0e111d]">{booking.photographer_name}</span>
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <InfoItem label="Ngày chụp" value={formatDate(booking.shoot_date)} />
            <InfoItem label="Khung giờ" value={booking.shoot_time || "Chưa chọn"} />
            <InfoItem label="Địa điểm" value={booking.location || "Chưa chọn"} />
            <InfoItem label="Quy mô" value={booking.people_scale || "Chưa chọn"} />
          </div>

          {booking.add_ons?.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {booking.add_ons.map((addOn) => (
                <span
                  key={addOn.id}
                  className="rounded-full bg-[#fff7ed] px-3 py-1.5 text-[11px] font-black text-[#ff8d28]"
                >
                  {addOn.name}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="rounded-[18px] border border-[#eef0f5] bg-[#fbfcff] p-4">
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#8a8fa1]">
            Thanh toán
          </p>

          <div className="mt-3 grid gap-2">
            <MoneyRow label="Tổng tiền" value={booking.estimated_total} strong />
            <MoneyRow label="Tiền cọc" value={booking.deposit_amount} />
            <MoneyRow label="Còn lại" value={booking.remaining_amount} />
          </div>

          <div className="mt-4 grid gap-2">
            <Link
              href={`/booking-success/confirmed?id=${encodeURIComponent(
                booking.booking_code
              )}`}
              className="rounded-[12px] bg-[#111827] px-4 py-3 text-center text-[13px] font-black text-white transition-all hover:bg-[#0f172a]"
            >
              Xem chi tiết
              {booking.status === "completed" ? (
  <Link
    href={`/review?booking=${encodeURIComponent(booking.booking_code)}`}
    className="rounded-[12px] bg-[#ff8d28] px-4 py-3 text-center text-[13px] font-black text-white shadow-[0_10px_24px_rgba(255,141,40,0.18)] transition-all hover:bg-[#e0751b]"
  >
    Đánh giá photographer
  </Link>
) : null}
            </Link>

            {canCancel ? (
              <button
                type="button"
                onClick={onCancel}
                className="rounded-[12px] border border-red-200 bg-white px-4 py-3 text-[13px] font-black text-red-600 transition-all hover:bg-red-50"
              >
                Hủy lịch
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="rounded-[12px] border border-[#e8eaf1] bg-[#f8fafc] px-4 py-3 text-[13px] font-black text-[#94a3b8]"
              >
                Không thể hủy
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] border border-[#eef0f5] bg-[#fbfcff] px-4 py-3">
      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#8a8fa1]">
        {label}
      </p>

      <p className="mt-1 truncate text-[13px] font-black text-[#0e111d]">
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
    <div className="flex items-center justify-between gap-3 text-[13px]">
      <span className="font-bold text-[#64748b]">{label}</span>
      <span
        className={`font-black ${
          strong ? "text-[16px] text-[#ff8d28]" : "text-[#0e111d]"
        }`}
      >
        {formatCurrency(value)}
      </span>
    </div>
  );
}

function EmptyState({ hasEmail }: { hasEmail: boolean }) {
  return (
    <div className="mt-5 rounded-[24px] border border-dashed border-[#d9dee9] bg-[#fbfcff] px-6 py-12 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#fff7ed] text-[#ff8d28]">
        <CalendarIcon className="h-7 w-7" />
      </div>

      <h3 className="mt-5 text-[22px] font-black tracking-[-0.03em] text-[#0e111d]">
        {hasEmail ? "Chưa có booking nào" : "Nhập email để tra cứu booking"}
      </h3>

      <p className="mx-auto mt-2 max-w-[420px] text-[14px] font-semibold leading-6 text-[#6b7280]">
        {hasEmail
          ? "Email này chưa có lịch đặt nào trong hệ thống. Bạn có thể tạo booking mới với photographer phù hợp."
          : "Dữ liệu booking hiện được lấy từ backend MySQL, không còn chỉ lưu cục bộ trên trình duyệt."}
      </p>

      <Link
        href="/photographer"
        className="mt-5 inline-flex items-center justify-center rounded-[12px] bg-[#ff8d28] px-5 py-3 text-[13px] font-black text-white shadow-[0_10px_24px_rgba(255,141,40,0.18)] transition-all hover:translate-y-[-1px] hover:bg-[#e0751b]"
      >
        Tìm photographer
      </Link>
    </div>
  );
}

function BookingSkeleton() {
  return (
    <div className="mt-5 grid gap-4">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="animate-pulse rounded-[22px] border border-[#e8eaf1] bg-white p-5"
        >
          <div className="h-6 w-[220px] rounded-full bg-[#eef0f5]" />
          <div className="mt-5 h-7 w-[60%] rounded-full bg-[#eef0f5]" />
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="h-16 rounded-[14px] bg-[#eef0f5]" />
            <div className="h-16 rounded-[14px] bg-[#eef0f5]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6.5 2.5V5M13.5 2.5V5M3.5 7H16.5M5 4H15C15.8 4 16.5 4.7 16.5 5.5V15C16.5 15.8 15.8 16.5 15 16.5H5C4.2 16.5 3.5 15.8 3.5 15V5.5C3.5 4.7 4.2 4 5 4Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M7 10H7.1M10 10H10.1M13 10H13.1M7 13H7.1M10 13H10.1"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}