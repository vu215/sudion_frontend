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

const statusTabs = [
  { id: "all", label: "Tất cả" },
  { id: "confirmed", label: "Chờ nhận" },
  { id: "accepted", label: "Đã nhận" },
  { id: "completed", label: "Hoàn thành" },
  { id: "rejected", label: "Từ chối" },
  { id: "cancelled", label: "Đã hủy" },
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
    label: "Chờ thanh toán",
    className: "border-[#fed7aa] bg-[#fff7ed] text-[#ea580c]",
    dot: "bg-[#f97316]",
  },
  confirmed: {
    label: "Khách đã thanh toán",
    className: "border-[#bbf7d0] bg-[#ecfdf5] text-[#047857]",
    dot: "bg-[#10b981]",
  },
  accepted: {
    label: "Đã nhận lịch",
    className: "border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8]",
    dot: "bg-[#3b82f6]",
  },
  rejected: {
    label: "Đã từ chối",
    className: "border-[#fecdd3] bg-[#fff1f2] text-[#be123c]",
    dot: "bg-[#e11d48]",
  },
  completed: {
    label: "Đã hoàn thành",
    className: "border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d]",
    dot: "bg-[#22c55e]",
  },
  cancelled: {
    label: "Đã hủy",
    className: "border-[#e2e8f0] bg-[#f8fafc] text-[#64748b]",
    dot: "bg-[#94a3b8]",
  },
};

function getStatusInfo(status: string) {
  return (
    statusMap[status] || {
      label: status,
      className: "border-[#e2e8f0] bg-[#f8fafc] text-[#475569]",
      dot: "bg-[#64748b]",
    }
  );
}

function formatCurrency(value: number | string | null | undefined) {
  return `${Number(value || 0).toLocaleString("vi-VN")} VND`;
}

function formatDate(value: string | null) {
  if (!value) return "Chưa chọn";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("vi-VN");
}

async function getBookingsByPhotographer(photographerId: string) {
  const response = await fetch(
    `${API_URL}/bookings/photographer/${encodeURIComponent(photographerId)}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  const json: ApiResponse<BackendBooking[]> = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.message || "Không thể lấy booking của photographer.");
  }

  return json.data;
}

async function updateBookingStatus(bookingCode: string, status: string) {
  const response = await fetch(`${API_URL}/bookings/${bookingCode}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  const json: ApiResponse<BackendBooking> = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.message || "Không thể cập nhật trạng thái booking.");
  }

  return json.data;
}

export default function PhotographerDashboardPage() {
  const [photographerId, setPhotographerId] = useState("");
  const [bookings, setBookings] = useState<BackendBooking[]>([]);
  const [activeStatus, setActiveStatus] = useState("all");

  const [loading, setLoading] = useState(false);
  const [updatingCode, setUpdatingCode] = useState("");
  const [pageError, setPageError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const savedId = window.localStorage.getItem("sudion_photographer_id");

    if (savedId) {
      setPhotographerId(savedId);
      void handleLoadBookings(savedId);
    }
  }, []);

  const stats = useMemo(() => {
    return {
      total: bookings.length,
      confirmed: bookings.filter((item) => item.status === "confirmed").length,
      accepted: bookings.filter((item) => item.status === "accepted").length,
      completed: bookings.filter((item) => item.status === "completed").length,
      rejected: bookings.filter((item) => item.status === "rejected").length,
      cancelled: bookings.filter((item) => item.status === "cancelled").length,
    };
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    if (activeStatus === "all") {
      return bookings;
    }

    return bookings.filter((item) => item.status === activeStatus);
  }, [activeStatus, bookings]);

  async function handleLoadBookings(targetId = photographerId) {
    try {
      const finalId = targetId.trim();

      if (!finalId) {
        setPageError("Vui lòng nhập photographer ID.");
        return;
      }

      setLoading(true);
      setPageError("");
      setSuccessMessage("");

      const data = await getBookingsByPhotographer(finalId);

      setBookings(data);
      window.localStorage.setItem("sudion_photographer_id", finalId);
    } catch (error) {
      console.error("Lỗi lấy booking photographer:", error);

      setBookings([]);
      setPageError(
        error instanceof Error
          ? error.message
          : "Không thể lấy booking của photographer."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await handleLoadBookings();
  }

  async function handleUpdateStatus(bookingCode: string, status: string) {
    try {
      setUpdatingCode(bookingCode);
      setPageError("");
      setSuccessMessage("");

      const updatedBooking = await updateBookingStatus(bookingCode, status);

      setBookings((current) =>
        current.map((item) =>
          item.booking_code === updatedBooking.booking_code
            ? updatedBooking
            : item
        )
      );

      setSuccessMessage(
        `Đã cập nhật booking ${updatedBooking.booking_code} thành ${getStatusInfo(
          updatedBooking.status
        ).label}.`
      );
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);

      setPageError(
        error instanceof Error
          ? error.message
          : "Không thể cập nhật trạng thái."
      );
    } finally {
      setUpdatingCode("");
    }
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#0f172a]">
      <section className="mx-auto w-full max-w-[1280px] px-5 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="overflow-hidden rounded-[30px] border border-[#e2e8f0] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
          <div className="relative overflow-hidden bg-[#111827] px-6 py-8 text-white sm:px-8 lg:px-10">
            <div className="absolute right-[-120px] top-[-120px] h-[300px] w-[300px] rounded-full bg-[#ff8d28]/25 blur-3xl" />
            <div className="absolute bottom-[-120px] left-[20%] h-[260px] w-[260px] rounded-full bg-white/10 blur-3xl" />

            <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-end">
              <div>
                <p className="text-[12px] font-black uppercase tracking-[0.18em] text-[#ffb267]">
                  Photographer dashboard
                </p>

                <h1 className="mt-3 max-w-[760px] text-[34px] font-black leading-[1.05] tracking-[-0.04em] sm:text-[46px]">
                  Quản lý đơn booking của photographer
                </h1>

                <p className="mt-4 max-w-[680px] text-[14px] font-medium leading-7 text-white/70">
                  Xem lịch khách đã đặt, nhận lịch, từ chối hoặc đánh dấu hoàn
                  thành sau khi buổi chụp kết thúc.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="rounded-[20px] border border-white/10 bg-white/10 p-3 backdrop-blur-md"
              >
                <label className="grid gap-2">
                  <span className="px-1 text-[12px] font-extrabold text-white/80">
                    Photographer ID
                  </span>

                  <span className="flex gap-2 rounded-[14px] bg-white p-2">
                    <input
                      value={photographerId}
                      onChange={(event) => setPhotographerId(event.target.value)}
                      placeholder="Ví dụ: 1"
                      className="min-h-[44px] flex-1 border-0 bg-transparent px-3 text-[14px] font-bold text-[#111827] outline-none placeholder:text-[#9ca3af]"
                    />

                    <button
                      type="submit"
                      disabled={loading}
                      className="rounded-[12px] bg-[#ff8d28] px-4 text-[13px] font-black text-white shadow-[0_10px_24px_rgba(255,141,40,0.3)] transition-all hover:bg-[#e0751b] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? "Đang tải" : "Xem đơn"}
                    </button>
                  </span>
                </label>
              </form>
            </div>
          </div>

          <div className="grid gap-4 border-b border-[#eef2f7] bg-[#fbfcff] px-6 py-5 sm:grid-cols-2 lg:grid-cols-6 lg:px-8">
            <StatCard label="Tổng đơn" value={stats.total} />
            <StatCard label="Chờ nhận" value={stats.confirmed} />
            <StatCard label="Đã nhận" value={stats.accepted} />
            <StatCard label="Hoàn thành" value={stats.completed} />
            <StatCard label="Từ chối" value={stats.rejected} />
            <StatCard label="Đã hủy" value={stats.cancelled} />
          </div>

          <div className="px-6 py-6 lg:px-8">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-[24px] font-black tracking-[-0.03em] text-[#0f172a]">
                  Danh sách đơn được book
                </h2>

                <p className="mt-1 text-[13px] font-semibold text-[#64748b]">
                  Dữ liệu lấy trực tiếp từ bảng booking_requests.
                </p>
              </div>

              <Link
                href="/photographer"
                className="inline-flex w-fit items-center justify-center rounded-[12px] border border-[#e2e8f0] bg-white px-4 py-3 text-[13px] font-black text-[#334155] transition-all hover:border-[#ffcfaa] hover:text-[#ff8d28]"
              >
                Quay lại danh sách photographer
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
                        : "border-[#e2e8f0] bg-white text-[#64748b] hover:border-[#ffcfaa] hover:text-[#ff8d28]"
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
              <DashboardSkeleton />
            ) : filteredBookings.length === 0 ? (
              <EmptyState hasPhotographerId={Boolean(photographerId.trim())} />
            ) : (
              <div className="mt-5 grid gap-4">
                {filteredBookings.map((booking) => (
                  <DashboardBookingCard
                    key={booking.booking_code}
                    booking={booking}
                    updatingCode={updatingCode}
                    onUpdateStatus={handleUpdateStatus}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[18px] border border-[#eef2f7] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.035)]">
      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#94a3b8]">
        {label}
      </p>

      <p className="mt-2 text-[28px] font-black tracking-[-0.04em] text-[#0f172a]">
        {value}
      </p>
    </div>
  );
}

function DashboardBookingCard({
  booking,
  updatingCode,
  onUpdateStatus,
}: {
  booking: BackendBooking;
  updatingCode: string;
  onUpdateStatus: (bookingCode: string, status: string) => void;
}) {
  const statusInfo = getStatusInfo(booking.status);
  const isUpdating = updatingCode === booking.booking_code;

  const canAccept =
    booking.status === "confirmed" || booking.status === "awaiting_payment";

  const canReject =
    booking.status !== "rejected" &&
    booking.status !== "cancelled" &&
    booking.status !== "completed";

  const canComplete = booking.status === "accepted";

  return (
    <article className="overflow-hidden rounded-[24px] border border-[#e2e8f0] bg-white shadow-[0_14px_36px_rgba(15,23,42,0.045)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_46px_rgba(15,23,42,0.075)]">
      <div className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
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

          <h3 className="mt-4 text-[22px] font-black leading-tight tracking-[-0.03em] text-[#0f172a]">
            {booking.service_name}
          </h3>

          <p className="mt-2 text-[14px] font-bold text-[#475569]">
            Khách hàng:{" "}
            <span className="text-[#0f172a]">
              {booking.customer_full_name}
            </span>
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <InfoItem label="Ngày chụp" value={formatDate(booking.shoot_date)} />
            <InfoItem label="Khung giờ" value={booking.shoot_time || "Chưa chọn"} />
            <InfoItem label="Địa điểm" value={booking.location || "Chưa chọn"} />
            <InfoItem label="Liên hệ" value={booking.customer_phone || "Chưa có"} />
          </div>

          <div className="mt-4 rounded-[16px] border border-[#eef2f7] bg-[#fbfcff] p-4">
            <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#94a3b8]">
              Ghi chú / concept
            </p>

            <p className="mt-2 text-[13px] font-semibold leading-6 text-[#475569]">
              {booking.concept || "Khách chưa nhập ghi chú."}
            </p>
          </div>
        </div>

        <div className="rounded-[20px] border border-[#eef2f7] bg-[#fbfcff] p-4">
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#94a3b8]">
            Tổng quan thanh toán
          </p>

          <div className="mt-3 grid gap-2">
            <MoneyRow label="Tổng tiền" value={booking.estimated_total} strong />
            <MoneyRow label="Tiền cọc" value={booking.deposit_amount} />
            <MoneyRow label="Còn lại" value={booking.remaining_amount} />
          </div>

          <div className="mt-4 grid gap-2">
            <Link
              href={`/messages?booking=${encodeURIComponent(
                booking.booking_code
              )}`}
              className="rounded-[12px] border border-[#e2e8f0] bg-white px-4 py-3 text-center text-[13px] font-black text-[#334155] transition-all hover:border-[#ffcfaa] hover:text-[#ff8d28]"
            >
              Nhắn tin với khách
            </Link>

            {canAccept ? (
              <button
                type="button"
                disabled={isUpdating}
                onClick={() =>
                  onUpdateStatus(booking.booking_code, "accepted")
                }
                className="rounded-[12px] bg-[#2563eb] px-4 py-3 text-[13px] font-black text-white transition-all hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUpdating ? "Đang xử lý..." : "Nhận lịch"}
              </button>
            ) : null}

            {canComplete ? (
              <button
                type="button"
                disabled={isUpdating}
                onClick={() =>
                  onUpdateStatus(booking.booking_code, "completed")
                }
                className="rounded-[12px] bg-[#16a34a] px-4 py-3 text-[13px] font-black text-white transition-all hover:bg-[#15803d] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUpdating ? "Đang xử lý..." : "Hoàn thành"}
              </button>
            ) : null}

            {canReject ? (
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => {
                  if (!window.confirm("Bạn chắc chắn muốn từ chối lịch này?")) {
                    return;
                  }

                  onUpdateStatus(booking.booking_code, "rejected");
                }}
                className="rounded-[12px] border border-red-200 bg-white px-4 py-3 text-[13px] font-black text-red-600 transition-all hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Từ chối lịch
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
    <div className="rounded-[14px] border border-[#eef2f7] bg-[#fbfcff] px-4 py-3">
      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#94a3b8]">
        {label}
      </p>

      <p className="mt-1 truncate text-[13px] font-black text-[#0f172a]">
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
          strong ? "text-[16px] text-[#ff8d28]" : "text-[#0f172a]"
        }`}
      >
        {formatCurrency(value)}
      </span>
    </div>
  );
}

function EmptyState({
  hasPhotographerId,
}: {
  hasPhotographerId: boolean;
}) {
  return (
    <div className="mt-5 rounded-[24px] border border-dashed border-[#cbd5e1] bg-[#fbfcff] px-6 py-12 text-center">
      <h3 className="text-[22px] font-black tracking-[-0.03em] text-[#0f172a]">
        {hasPhotographerId
          ? "Chưa có đơn booking nào"
          : "Nhập photographer ID để xem đơn"}
      </h3>

      <p className="mx-auto mt-2 max-w-[440px] text-[14px] font-semibold leading-6 text-[#64748b]">
        {hasPhotographerId
          ? "Photographer này chưa có khách đặt lịch hoặc bộ lọc hiện tại không có kết quả."
          : "Sau này khi nối đăng nhập, trang này sẽ tự lấy photographer ID từ tài khoản hiện tại."}
      </p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="mt-5 grid gap-4">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="animate-pulse rounded-[24px] border border-[#e2e8f0] bg-white p-5"
        >
          <div className="h-6 w-[220px] rounded-full bg-[#eef2f7]" />
          <div className="mt-5 h-7 w-[60%] rounded-full bg-[#eef2f7]" />
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="h-16 rounded-[14px] bg-[#eef2f7]" />
            <div className="h-16 rounded-[14px] bg-[#eef2f7]" />
          </div>
        </div>
      ))}
    </div>
  );
}