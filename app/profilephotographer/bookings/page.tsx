"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/auth-context";
import { useToast } from "@/app/toast-context";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

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
  add_ons: { id: string; name: string; price: number }[];
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
  { id: "accepted", label: "Chờ khách cọc" },
  { id: "confirmed", label: "Đã cọc" },
  { id: "completed", label: "Chờ khách trả còn lại" },
  { id: "fully_paid", label: "Đã thanh toán đủ" },
  { id: "rejected", label: "Từ chối" },
  { id: "cancelled", label: "Đã hủy" },
];

const statusMap: Record<string, { label: string; note: string; bg: string; text: string; dot: string }> = {
  awaiting_payment: {
    label: "Chờ xác nhận",
    note: "Khách vừa gửi yêu cầu. Bạn cần xác nhận hoặc từ chối.",
    bg: "bg-orange-50", text: "text-orange-600", dot: "bg-orange-400",
  },
  accepted: {
    label: "Chờ khách cọc",
    note: "Bạn đã xác nhận lịch. Đang chờ khách thanh toán cọc 50%.",
    bg: "bg-blue-50", text: "text-blue-600", dot: "bg-blue-400",
  },
  confirmed: {
    label: "Đã cọc",
    note: "Lịch đã được giữ. Sau khi chụp xong, bấm Hoàn thành.",
    bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-400",
  },
  completed: {
    label: "Chờ trả còn lại",
    note: "Bạn đã hoàn thành buổi chụp. Đang chờ khách thanh toán phần còn lại.",
    bg: "bg-yellow-50", text: "text-yellow-700", dot: "bg-yellow-400",
  },
  fully_paid: {
    label: "Đã thanh toán đủ",
    note: "Booking đã hoàn tất. Khách có thể đánh giá và chat.",
    bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500",
  },
  rejected: {
    label: "Đã từ chối",
    note: "Bạn đã từ chối yêu cầu này.",
    bg: "bg-red-50", text: "text-red-600", dot: "bg-red-400",
  },
  cancelled: {
    label: "Đã hủy",
    note: "Booking này đã bị hủy.",
    bg: "bg-slate-100", text: "text-slate-500", dot: "bg-slate-400",
  },
};

function getStatusInfo(status: string) {
  return statusMap[status] || {
    label: status, note: "Trạng thái booking.",
    bg: "bg-slate-100", text: "text-slate-500", dot: "bg-slate-400",
  };
}

function formatCurrency(value: number | string | null | undefined) {
  return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
}

function formatDate(value: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("vi-VN");
}

function formatTime(value: string | null) {
  if (!value) return "—";
  return String(value).slice(0, 5);
}

async function getBookingsByPhotographer(photographerId: string) {
  const response = await fetch(
    `${API_URL}/bookings/photographer/${encodeURIComponent(photographerId)}`,
    { method: "GET", cache: "no-store" }
  );
  const json: ApiResponse<BackendBooking[]> = await response.json();
  if (!response.ok || !json.success) throw new Error(json.message || "Không thể lấy booking.");
  return json.data;
}

async function updateBookingStatus(bookingCode: string, status: string) {
  const response = await fetch(`${API_URL}/bookings/${bookingCode}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  const json: ApiResponse<BackendBooking> = await response.json();
  if (!response.ok || !json.success) throw new Error(json.message || "Không thể cập nhật trạng thái.");
  return json.data;
}

export default function PhotographerBookingsPage() {
  const { session, isPhotographer } = useAuth();
  const toast = useToast();
  const [photographerId, setPhotographerId] = useState("");
  const [bookings, setBookings] = useState<BackendBooking[]>([]);
  const [activeStatus, setActiveStatus] = useState("all");
  const [loading, setLoading] = useState(false);
  const [updatingCode, setUpdatingCode] = useState("");
  const [pageError, setPageError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [expandedCode, setExpandedCode] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = isPhotographer && session?.photographerId ? session.photographerId : "";
    const savedId = window.localStorage.getItem("sudion_photographer_id") || "";
    const finalId = sessionId || savedId;
    if (!finalId) return;
    setPhotographerId(finalId);
    void handleLoadBookings(finalId);
  }, [isPhotographer, session?.photographerId]);

  const stats = useMemo(() => ({
    total: bookings.length,
    awaiting: bookings.filter((b) => b.status === "awaiting_payment").length,
    accepted: bookings.filter((b) => b.status === "accepted").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    fullyPaid: bookings.filter((b) => b.status === "fully_paid").length,
  }), [bookings]);

  const filteredBookings = useMemo(
    () => activeStatus === "all" ? bookings : bookings.filter((b) => b.status === activeStatus),
    [activeStatus, bookings]
  );

  async function handleLoadBookings(targetId = photographerId) {
    const finalId = targetId.trim();
    if (!finalId) { setPageError("Vui lòng nhập photographer ID."); return; }
    try {
      setLoading(true); setPageError(""); setSuccessMessage("");
      const data = await getBookingsByPhotographer(finalId);
      setBookings(data);
      window.localStorage.setItem("sudion_photographer_id", finalId);
    } catch (error) {
      setBookings([]);
      setPageError(error instanceof Error ? error.message : "Không thể lấy booking.");
    } finally { setLoading(false); }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await handleLoadBookings();
  }

  async function handleUpdateStatus(bookingCode: string, status: string) {
    try {
      setUpdatingCode(bookingCode); setPageError(""); setSuccessMessage("");
      const updated = await updateBookingStatus(bookingCode, status);
      setBookings((cur) => cur.map((b) => b.booking_code === updated.booking_code ? updated : b));
      const label = getStatusInfo(updated.status).label;
      setSuccessMessage(`Đã cập nhật booking ${updated.booking_code}: ${label}.`);
      toast.success("Cập nhật thành công", `Booking ${updated.booking_code}: ${label}.`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Không thể cập nhật trạng thái.";
      setPageError(msg);
      toast.error("Cập nhật thất bại", msg);
    } finally { setUpdatingCode(""); }
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1200px] space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-orange-500">Bookings</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-800">Quản lý đơn booking</h1>
            <p className="mt-1 text-sm text-slate-400">Xác nhận, từ chối và theo dõi thanh toán các đơn của bạn.</p>
          </div>
          {/* ID form */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              value={photographerId}
              onChange={(e) => setPhotographerId(e.target.value)}
              placeholder="Photographer ID"
              className="h-10 w-40 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
            <button
              type="submit"
              disabled={loading}
              className="h-10 rounded-xl bg-orange-500 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600 disabled:opacity-60"
            >
              {loading ? "Đang tải..." : "Xem đơn"}
            </button>
          </form>
        </div>

        {/* Stats */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {[
            { label: "Tổng đơn", value: stats.total, color: "text-slate-800" },
            { label: "Chờ xác nhận", value: stats.awaiting, color: "text-orange-500" },
            { label: "Chờ khách cọc", value: stats.accepted, color: "text-blue-500" },
            { label: "Đã cọc", value: stats.confirmed, color: "text-emerald-500" },
            { label: "Chờ trả còn lại", value: stats.completed, color: "text-yellow-500" },
            { label: "Đã thanh toán đủ", value: stats.fullyPaid, color: "text-green-600" },
          ].map((s) => (
            <article key={s.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{s.label}</p>
              <p className={`mt-2 text-3xl font-bold ${s.color}`}>{s.value}</p>
            </article>
          ))}
        </section>

        {/* Filters + List */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-base font-bold text-slate-800">Danh sách đơn được book</h2>
              <p className="text-xs text-slate-400">Cập nhật sau khi nhấn Xem đơn</p>
            </div>
            {/* Tabs */}
            <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
              {statusTabs.map((tab) => {
                const active = tab.id === activeStatus;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveStatus(tab.id)}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                      active
                        ? "bg-orange-500 text-white shadow-sm"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Alerts */}
          {pageError && (
            <div className="mx-5 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
              {pageError}
            </div>
          )}
          {successMessage && (
            <div className="mx-5 mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              {successMessage}
            </div>
          )}

          {/* Content */}
          <div className="p-5">
            {loading ? (
              <BookingsSkeleton />
            ) : filteredBookings.length === 0 ? (
              <EmptyState hasId={Boolean(photographerId.trim())} />
            ) : (
              <div className="space-y-3">
                {filteredBookings.map((booking) => (
                  <BookingRow
                    key={booking.booking_code}
                    booking={booking}
                    expanded={expandedCode === booking.booking_code}
                    onToggle={() =>
                      setExpandedCode(
                        expandedCode === booking.booking_code ? null : booking.booking_code
                      )
                    }
                    updatingCode={updatingCode}
                    onUpdateStatus={handleUpdateStatus}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function BookingRow({
  booking,
  expanded,
  onToggle,
  updatingCode,
  onUpdateStatus,
}: {
  booking: BackendBooking;
  expanded: boolean;
  onToggle: () => void;
  updatingCode: string;
  onUpdateStatus: (code: string, status: string) => Promise<void>;
}) {
  const s = getStatusInfo(booking.status);
  const isUpdating = updatingCode === booking.booking_code;
  const canAccept = booking.status === "awaiting_payment";
  const canReject = booking.status === "awaiting_payment";
  const canComplete = booking.status === "confirmed";

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 transition-all">
      {/* Row summary */}
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-4 px-4 py-4 text-left transition hover:bg-slate-100"
      >
        {/* Avatar placeholder */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-500">
          {booking.customer_full_name.charAt(0)}
        </div>

        <div className="min-w-0 flex-1 grid grid-cols-1 gap-0.5 sm:grid-cols-[1fr_auto]">
          <div>
            <p className="truncate text-sm font-bold text-slate-800">{booking.customer_full_name}</p>
            <p className="truncate text-xs text-slate-400">{booking.service_name} · {booking.booking_code}</p>
          </div>
          <div className="flex items-center gap-3 sm:justify-end">
            <div className="hidden sm:block text-right">
              <p className="text-xs text-slate-400">{formatDate(booking.shoot_date)}</p>
              <p className="text-xs font-semibold text-slate-600">{formatCurrency(booking.estimated_total)}</p>
            </div>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${s.bg} ${s.text}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
              {s.label}
            </span>
            <svg
              className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-slate-200 bg-white px-5 py-5">
          <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
            {/* Left: info */}
            <div className="space-y-4">
              {/* Grid info */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <InfoCell label="Ngày chụp" value={formatDate(booking.shoot_date)} />
                <InfoCell label="Giờ chụp" value={formatTime(booking.shoot_time)} />
                <InfoCell label="Địa điểm" value={booking.location || "—"} />
                <InfoCell label="Quy mô" value={booking.people_scale || "—"} />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InfoCell label="Email" value={booking.customer_email || "—"} />
                <InfoCell label="Điện thoại" value={booking.customer_phone || "—"} />
              </div>

              {/* Status note */}
              <div className={`rounded-xl px-4 py-3 ${s.bg}`}>
                <p className={`text-xs font-bold uppercase tracking-wider ${s.text}`}>Ghi chú trạng thái</p>
                <p className="mt-1 text-sm text-slate-600">{s.note}</p>
              </div>

              {booking.concept && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Concept / ghi chú</p>
                  <p className="mt-1 whitespace-pre-line text-sm text-slate-600">{booking.concept}</p>
                </div>
              )}
            </div>

            {/* Right: payment + actions */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Thanh toán</p>
              <MoneyRow label="Tổng tiền" value={booking.estimated_total} />
              <MoneyRow label="Tiền cọc (50%)" value={booking.deposit_amount} highlight={booking.status === "confirmed"} />
              <MoneyRow label="Còn lại" value={booking.remaining_amount} highlight={booking.status === "completed"} />

              <div className="pt-2 space-y-2">
                {canAccept && (
                  <button
                    type="button"
                    onClick={() => onUpdateStatus(booking.booking_code, "accepted")}
                    disabled={isUpdating}
                    className="w-full rounded-xl bg-orange-500 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600 disabled:opacity-60"
                  >
                    {isUpdating ? "Đang xử lý..." : "✓ Xác nhận lịch"}
                  </button>
                )}
                {canReject && (
                  <button
                    type="button"
                    onClick={() => onUpdateStatus(booking.booking_code, "rejected")}
                    disabled={isUpdating}
                    className="w-full rounded-xl border border-red-200 bg-white py-2.5 text-sm font-bold text-red-500 transition hover:bg-red-50 disabled:opacity-60"
                  >
                    Từ chối lịch
                  </button>
                )}
                {booking.status === "accepted" && (
                  <div className="rounded-xl bg-blue-50 py-2.5 text-center text-sm font-bold text-blue-600">
                    Chờ khách thanh toán cọc
                  </div>
                )}
                {canComplete && (
                  <button
                    type="button"
                    onClick={() => onUpdateStatus(booking.booking_code, "completed")}
                    disabled={isUpdating}
                    className="w-full rounded-xl bg-emerald-500 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-600 disabled:opacity-60"
                  >
                    {isUpdating ? "Đang xử lý..." : "✓ Hoàn thành buổi chụp"}
                  </button>
                )}
                {booking.status === "completed" && (
                  <div className="rounded-xl bg-yellow-50 py-2.5 text-center text-sm font-bold text-yellow-700">
                    Chờ khách thanh toán còn lại
                  </div>
                )}
                {booking.status === "fully_paid" && (
                  <Link
                    href={`/profilephotographer/messages?booking=${encodeURIComponent(booking.booking_code)}`}
                    className="block w-full rounded-xl bg-orange-500 py-2.5 text-center text-sm font-bold text-white shadow-sm transition hover:bg-orange-600"
                  >
                    Chat với khách
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-0.5 truncate text-sm font-semibold text-slate-700">{value}</p>
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
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={`text-sm font-bold ${highlight ? "text-orange-500" : "text-slate-800"}`}>
        {formatCurrency(value)}
      </span>
    </div>
  );
}

function EmptyState({ hasId }: { hasId: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-100">
        <svg className="h-7 w-7 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <p className="text-base font-bold text-slate-700">
        {hasId ? "Chưa có booking nào" : "Nhập Photographer ID"}
      </p>
      <p className="mt-1 max-w-xs text-sm text-slate-400">
        {hasId
          ? "Khi khách gửi yêu cầu đặt lịch, đơn sẽ xuất hiện tại đây."
          : "Nhập ID của bạn và nhấn Xem đơn để tải danh sách booking."}
      </p>
    </div>
  );
}

function BookingsSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />
      ))}
    </div>
  );
}
