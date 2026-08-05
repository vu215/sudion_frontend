"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/auth-context";
import { useToast } from "@/app/toast-context";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://sudion-backend-production-453b.up.railway.app/api";

function authHeaders() {
  const token = typeof window !== "undefined" ? window.localStorage.getItem("sudion_token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const AUTO_REFRESH_MS = 8000;
const BOOKINGS_PER_PAGE = 5;

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
    note: "Vui lòng thanh toán trước theo mức bạn đã chọn để giữ lịch chụp.",
    className: "bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]",
    dot: "bg-[#3b82f6]",
  },
  confirmed: {
    label: "Đã thanh toán cọc",
    note: "Lịch đã được giữ. Hủy trước 48 giờ có thể được hoàn cọc.",
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
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("vi-VN");
}

function formatTime(value: string | null) {
  if (!value) return "Chưa chọn";
  return String(value).slice(0, 5);
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "Chưa có thời gian đặt";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function extractPhotoDriveLink(location: string | null | undefined): string {
  if (!location) return "";
  const match = String(location).match(/\[Photos:\s*(https?:\/\/[^\]]+)\]/i);
  if (match?.[1]) return match[1].trim();
  if (String(location).includes("drive.google.com")) {
    const urlMatch = String(location).match(/(https?:\/\/[^\s\]]+)/i);
    if (urlMatch?.[1]) return urlMatch[1].trim();
  }
  return "";
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
      headers: authHeaders(),
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
      ...authHeaders(),
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
  const { session, isLoggedIn, isLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [bookings, setBookings] = useState<BackendBooking[]>([]);
  const [activeStatus, setActiveStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [cancelTarget, setCancelTarget] = useState<BackendBooking | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push("/login");
    }
  }, [isLoggedIn, isLoading, router]);

  useEffect(() => {
    if (isLoading || !isLoggedIn) return;
    const finalEmail = session?.email || "";
    if (!finalEmail) return;

    setEmail(finalEmail);
    void handleLoadBookings(finalEmail);

    const timer = window.setInterval(async () => {
      try {
        const data = await getBookingsByCustomer(finalEmail);
        setBookings(data);
      } catch (error) {
        console.error("Auto refresh bookings failed:", error);
      }
    }, AUTO_REFRESH_MS);

    return () => window.clearInterval(timer);
  }, [isLoading, isLoggedIn, session]);

  const toggleSelectBooking = (code: string) => {
    setSelectedCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const selectedBookings = useMemo(() => {
    return bookings.filter((b) => selectedCodes.includes(b.booking_code));
  }, [bookings, selectedCodes]);

  const selectedTotalAmount = useMemo(() => {
    return selectedBookings.reduce((sum, b) => {
      const amt = b.status === "completed" ? Number(b.remaining_amount || 0) : Number(b.deposit_amount || 0);
      return sum + amt;
    }, 0);
  }, [selectedBookings]);

  const handleGroupCheckout = async () => {
    if (selectedCodes.length === 0) {
      toast.error("Chưa chọn đơn", "Vui lòng chọn ít nhất 1 đơn booking để thanh toán gom.");
      return;
    }

    try {
      setIsCreatingGroup(true);
      const isFinal = selectedBookings.every((b) => b.status === "completed");
      const pType = isFinal ? "final" : "deposit";

      const response = await fetch(`${API_URL}/payments/group/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({
          bookingCodes: selectedCodes,
          paymentType: pType,
        }),
      });

      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.message || "Lỗi tạo đơn gom thanh toán.");
      }

      toast.success("Tạo đơn gom thành công", "Chuyển tới trang thanh toán...");
      router.push(`/checkout-gateway?groupCode=${json.data.group_code}`);
    } catch (err: any) {
      toast.error("Không thể gom đơn", err.message || "Đã xảy ra lỗi.");
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const stats = useMemo(() => {
    return {
      total: bookings.length,
      awaiting: bookings.filter((item) => item.status === "awaiting_payment").length,
      accepted: bookings.filter((item) => item.status === "accepted").length,
      confirmed: bookings.filter((item) => item.status === "confirmed").length,
      completed: bookings.filter((item) => item.status === "completed").length,
      fullyPaid: bookings.filter((item) => item.status === "fully_paid").length,
    };
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    if (activeStatus === "all") return bookings;
    return bookings.filter((item) => item.status === activeStatus);
  }, [activeStatus, bookings]);

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / BOOKINGS_PER_PAGE));
  const paginatedBookings = useMemo(
    () => filteredBookings.slice((currentPage - 1) * BOOKINGS_PER_PAGE, currentPage * BOOKINGS_PER_PAGE),
    [filteredBookings, currentPage]
  );
  const paginationStart = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
  const pageNumbers = Array.from({ length: Math.min(5, totalPages) }, (_, index) => paginationStart + index);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeStatus]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  async function handleLoadBookings(targetEmail = email) {
    try {
      const finalEmail = targetEmail.trim();
      if (!finalEmail) return;

      setLoading(true);
      setPageError("");
      const data = await getBookingsByCustomer(finalEmail);
      setBookings(data);
      setCurrentPage(1);
    } catch (error) {
      console.error("Lỗi lấy booking:", error);
      setBookings([]);
      setPageError(error instanceof Error ? error.message : "Không thể lấy danh sách booking.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelBooking() {
    if (!cancelTarget) return;

    try {
      setIsCancelling(true);
      setPageError("");
      const updatedBooking = await cancelBooking(
        cancelTarget.booking_code,
        cancelReason.trim() || "Khách hủy lịch"
      );

      setBookings((current) =>
        current.map((item) =>
          item.booking_code === updatedBooking.booking_code ? updatedBooking : item
        )
      );

      setSuccessMessage(`Đã hủy booking ${updatedBooking.booking_code}.`);
      toast.success("Đã hủy booking", `Booking ${updatedBooking.booking_code} đã được hủy.`);
      setCancelTarget(null);
      setCancelReason("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể hủy booking.";
      setPageError(message);
      toast.error("Hủy booking thất bại", message);
    } finally {
      setIsCancelling(false);
    }
  }

  const cancelRefundInfo = cancelTarget ? getRefundInfo(cancelTarget) : null;

  return (
    <main className="min-h-screen bg-[#fafbfc] text-[#0e111d]">
      <section className="mx-auto w-full max-w-[1180px] px-5 py-10 sm:px-6 lg:px-8 lg:py-14 overflow-hidden">
        <div className="overflow-hidden rounded-[28px] border border-[#e8eaf1] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.06)]">

          {/* Top Banner Header */}
          <div className="relative overflow-hidden bg-[#111827] px-6 py-8 text-white sm:px-8 lg:px-10">
            <div className="relative grid gap-6 lg:grid-cols-[1.55fr_0.95fr] lg:items-end">
              <div>
                <span className="inline-flex rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold uppercase tracking-[0.16em] text-orange-600">
                  Khách hàng
                </span>
                <h1 className="mt-4 max-w-[760px] text-[34px] font-black leading-[1.05] tracking-[-0.04em] text-white sm:text-[44px]">
                  Lịch đặt của tôi
                </h1>
                <p className="mt-4 max-w-[720px] text-sm leading-7 text-white/75">
                  Quản lý danh sách các lịch đặt dịch vụ chụp ảnh. Tích chọn nhiều đơn để gom thanh toán cọc 1 lần.
                </p>
              </div>

              <aside className="rounded-[28px] border border-white/20 bg-white/10 p-6 backdrop-blur-md text-white">
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-white/15 text-2xl font-bold text-white">
                    {(session?.fullName || "KH").split(" ").map((s) => s[0]).slice(0, 2).join("")}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-orange-200">Khách hàng</p>
                    <h2 className="mt-1 text-2xl font-black text-white">{session?.fullName || "Khách hàng"}</h2>
                    <p className="mt-1 text-sm text-white/75">{session?.email || ""}</p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/cart"
                    className="inline-flex items-center justify-center rounded-full bg-[#ff8d28] px-4 py-2.5 text-xs font-black text-white shadow-md hover:bg-[#e0751b]"
                  >
                    Xem Giỏ Booking ({selectedCodes.length > 0 ? selectedCodes.length : "0"})
                  </Link>
                  <Link
                    href="/photographer"
                    className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-black text-white hover:bg-white/20"
                  >
                    + Đặt lịch mới
                  </Link>
                </div>
              </aside>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid gap-4 border-b border-[#eef0f5] bg-[#fbfcff] px-6 py-5 sm:grid-cols-2 lg:grid-cols-6 lg:px-8">
            <StatCard label="Tổng booking" value={stats.total} />
            <StatCard label="Chờ xác nhận" value={stats.awaiting} />
            <StatCard label="Chờ cọc" value={stats.accepted} />
            <StatCard label="Đã cọc" value={stats.confirmed} />
            <StatCard label="Chờ còn lại" value={stats.completed} />
            <StatCard label="Đã thanh toán đủ" value={stats.fullyPaid} />
          </div>

          {/* Booking List Container */}
          <div className="px-6 py-5 lg:px-8">
            <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
              {statusTabs.map((tab) => {
                const active = tab.id === activeStatus;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveStatus(tab.id)}
                    className={`shrink-0 rounded-full border px-4 py-2 text-[12px] font-black transition-all ${active
                      ? "border-[#ff8d28] bg-[#fff7ed] text-[#ff8d28]"
                      : "border-[#e8eaf1] bg-white text-[#6b7280] hover:border-[#ffcfaa] hover:text-[#ff8d28]"
                      }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {pageError && (
              <div className="mt-4 rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-bold text-red-600">
                {pageError}
              </div>
            )}

            {successMessage && (
              <div className="mt-4 rounded-[16px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] font-bold text-emerald-700">
                {successMessage}
              </div>
            )}

            {loading ? (
              <BookingSkeleton />
            ) : filteredBookings.length === 0 ? (
              <EmptyState hasEmail={Boolean(email.trim())} />
            ) : (
              <div className="mt-5 grid gap-4">
                {paginatedBookings.map((booking) => (
                  <BookingCard
                    key={booking.booking_code}
                    booking={booking}
                    isSelected={selectedCodes.includes(booking.booking_code)}
                    onToggleSelect={() => toggleSelectBooking(booking.booking_code)}
                    onCancel={() => {
                      setCancelTarget(booking);
                      setCancelReason("");
                    }}
                  />
                ))}
                {totalPages > 1 ? (
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#eef0f5] pt-5">
                    <p className="text-xs font-semibold text-[#6b7280]">
                      Hiển thị {(currentPage - 1) * BOOKINGS_PER_PAGE + 1}–{Math.min(currentPage * BOOKINGS_PER_PAGE, filteredBookings.length)} trong {filteredBookings.length} booking
                    </p>
                    <div className="flex items-center gap-1.5">
                      <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} className="rounded-lg border border-[#e8eaf1] px-3 py-2 text-xs font-black text-[#6b7280] hover:border-[#ff8d28] hover:text-[#ff8d28] disabled:cursor-not-allowed disabled:opacity-40">Trước</button>
                      {pageNumbers.map((page) => (
                        <button key={page} type="button" onClick={() => setCurrentPage(page)} className={`h-8 min-w-8 rounded-lg px-2 text-xs font-black transition ${currentPage === page ? "bg-[#ff8d28] text-white" : "border border-[#e8eaf1] text-[#6b7280] hover:border-[#ff8d28] hover:text-[#ff8d28]"}`}>{page}</button>
                      ))}
                      <button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} className="rounded-lg border border-[#e8eaf1] px-3 py-2 text-xs font-black text-[#6b7280] hover:border-[#ff8d28] hover:text-[#ff8d28] disabled:cursor-not-allowed disabled:opacity-40">Sau</button>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Floating Bar for Group Checkout */}
      {selectedCodes.length > 0 && (
        <div className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-4 rounded-full border border-orange-200 bg-[#111827] px-6 py-4 text-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-md">
          <div>
            <p className="text-xs text-white/70">
              Đã chọn <strong className="text-orange-400">{selectedCodes.length}</strong> đơn booking
            </p>
            <p className="text-lg font-black text-white">{formatCurrency(selectedTotalAmount)}</p>
          </div>
          <button
            onClick={handleGroupCheckout}
            disabled={isCreatingGroup}
            className="rounded-full bg-[#ff8d28] px-6 py-3 text-sm font-black text-white shadow-lg transition-all hover:bg-[#e0751b] disabled:opacity-60"
          >
            {isCreatingGroup ? "Đang xử lý..." : "Thanh toán gom 1 lần "}
          </button>
        </div>
      )}

      {/* Cancel Target Modal */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-4 backdrop-blur-sm">
          <div className="w-full max-w-[480px] rounded-[24px] bg-white p-6 shadow-2xl">
            <p className="text-[12px] font-black uppercase tracking-[0.16em] text-[#ff8d28]">Hủy lịch</p>
            <h3 className="mt-2 text-[24px] font-black text-[#0e111d]">Bạn muốn hủy booking này?</h3>
            <p className="mt-2 text-[13px] font-semibold text-[#6b7280]">
              Mã booking: <span className="font-black text-[#0e111d]">{cancelTarget.booking_code}</span>
            </p>

            <div className="mt-4 rounded-[16px] border border-[#ffedd5] bg-[#fff7ed] px-4 py-3 text-[13px] font-bold text-[#9a3412]">
              {cancelRefundInfo?.message}
            </div>

            <label className="mt-5 grid gap-2 text-[13px] font-extrabold text-[#0e111d]">
              Lý do hủy
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Ví dụ: Tôi muốn đổi ngày chụp..."
                rows={3}
                className="rounded-[14px] border border-[#e8eaf1] bg-[#fafbfc] px-4 py-3 text-[14px] font-semibold text-[#111827] outline-none focus:border-[#ff8d28]"
              />
            </label>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCancelTarget(null)}
                disabled={isCancelling}
                className="rounded-[12px] border border-[#e8eaf1] bg-white px-4 py-3 text-[13px] font-black text-[#4b5563]"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={handleCancelBooking}
                disabled={isCancelling}
                className="rounded-[12px] bg-red-600 px-4 py-3 text-[13px] font-black text-white"
              >
                {isCancelling ? "Đang hủy..." : "Xác nhận hủy"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[18px] border border-[#eef0f5] bg-white p-4 shadow-sm">
      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#94a3b8]">{label}</p>
      <p className="mt-2 text-[28px] font-black text-[#0e111d]">{value}</p>
    </div>
  );
}

function BookingCard({
  booking,
  isSelected,
  onToggleSelect,
  onCancel,
}: {
  booking: BackendBooking;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  onCancel: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const statusInfo = getStatusInfo(booking.status);
  const canCancel = ["awaiting_payment", "accepted", "confirmed"].includes(booking.status);
  const isEligibleForGroupPay = ["accepted", "completed"].includes(booking.status);

  const driveUrl = extractPhotoDriveLink(booking.location);

  return (
    <article className={`overflow-hidden rounded-[22px] border transition-all ${isSelected ? "border-[#ff8d28] bg-orange-50/20 shadow-md" : "border-[#e8eaf1] bg-white shadow-sm"}`}>
      <div className="flex flex-col gap-4 border-b border-[#eef0f5] bg-[#fbfcff] px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          {isEligibleForGroupPay && onToggleSelect && (
            <input
              type="checkbox"
              checked={Boolean(isSelected)}
              onChange={onToggleSelect}
              className="h-4 w-4 rounded border-slate-300 text-[#ff8d28] accent-[#ff8d28] focus:ring-0 cursor-pointer shrink-0 transition"
              title="Chọn để thanh toán gom đơn"
            />
          )}
          <div>
            <p className="text-[12px] font-black uppercase tracking-[0.14em] text-[#ff8d28]">
              MÃ ĐƠN: {booking.booking_code}
            </p>
            <h3 className="mt-0.5 text-[19px] font-black text-[#0e111d]">
              {booking.service_name}
            </h3>
            <p className="mt-0.5 text-[13px] font-semibold text-[#6b7280]">
              Photographer: <span className="font-black text-[#111827]">{booking.photographer_name}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1.5 shrink-0 rounded-full border border-orange-200 bg-orange-50 px-3.5 py-1.5 text-xs font-black text-[#ff8d28] hover:bg-[#ff8d28] hover:text-white transition-all shadow-sm"
          >
            <span>{showDetails ? "Thu gọn" : "Xem chi tiết đơn"}</span>
            <svg className={`h-3.5 w-3.5 transition-transform duration-200 ${showDetails ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <span className={`inline-flex w-fit items-center gap-2 rounded-full border px-3.5 py-2 text-[12px] font-black ${statusInfo.className}`}>
            <span className={`h-2 w-2 rounded-full ${statusInfo.dot}`} />
            {statusInfo.label}
          </span>
        </div>
      </div>

      <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <InfoItem label="Ngày chụp" value={formatDate(booking.shoot_date)} />
            <InfoItem label="Giờ chụp" value={formatTime(booking.shoot_time)} />
            <InfoItem label="Địa điểm" value={booking.location ? booking.location.split(" [Photos:")[0] : "Chưa chọn"} />
            <InfoItem label="Quy mô" value={booking.people_scale || "Chưa chọn"} />
          </div>
          <div className="rounded-[16px] border border-[#eef0f5] bg-[#fafbfc] px-4 py-3">
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#94a3b8]">Trạng thái hiện tại</p>
            <p className="mt-0.5 text-[13px] font-semibold text-[#475569]">{statusInfo.note}</p>
          </div>
        </div>

        <div className="grid gap-3 rounded-[18px] border border-[#eef0f5] bg-[#fbfcff] p-4">
          {(() => {
            const depPercent = booking.estimated_total > 0 && booking.deposit_amount
              ? Math.round((Number(booking.deposit_amount) / Number(booking.estimated_total)) * 100)
              : 30;
            const remPercent = Math.max(100 - depPercent, 0);
            return (
              <>
                <MoneyRow label="Tổng tiền" value={booking.estimated_total} />
                <MoneyRow label={`Tiền cọc (${depPercent}%)`} value={booking.deposit_amount} highlight={booking.status === "confirmed"} />
                <MoneyRow label={`Còn lại (${remPercent}%)`} value={booking.remaining_amount} highlight={booking.status === "completed"} />
              </>
            );
          })()}

          <div className="my-1 h-px bg-[#e8eaf1]" />

          <div className="grid gap-2">
            {["accepted", "confirmed", "completed", "fully_paid"].includes(booking.status) && (
              <Link
                href={`/messages?booking=${encodeURIComponent(booking.booking_code)}`}
                className="rounded-[12px] border border-[#ff8d28] bg-orange-50/70 px-4 py-3 text-center text-[13px] font-black text-[#ff8d28] hover:bg-[#ff8d28] hover:text-white transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                Chat với Photographer
              </Link>
            )}

            {booking.status === "accepted" && (
              <Link
                href={`/deposit-payment/${encodeURIComponent(booking.booking_code)}`}
                className="rounded-[12px] bg-[#ff8d28] px-4 py-3 text-center text-[13px] font-black text-white shadow hover:bg-[#e0751b]"
              >
                Thanh toán cọc lẻ
              </Link>
            )}

            {booking.status === "completed" && (
              <Link
                href={`/final-payment/${encodeURIComponent(booking.booking_code)}`}
                className="rounded-[12px] bg-[#ff8d28] px-4 py-3 text-center text-[13px] font-black text-white shadow hover:bg-[#e0751b]"
              >
                Thanh toán còn lại
              </Link>
            )}

            {canCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="rounded-[12px] border border-red-200 bg-white px-4 py-3 text-center text-[13px] font-black text-red-600 hover:bg-red-50"
              >
                Hủy lịch
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Google Drive Link Section (Locked vs Unlocked) */}
      {driveUrl ? (
        (booking.status === "fully_paid" || Number(booking.remaining_amount || 0) <= 0) ? (
          <div className="mx-5 mb-5 rounded-[18px] border border-emerald-200 bg-emerald-50/90 p-4 space-y-3 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[12px] font-black uppercase text-emerald-800 tracking-wider flex items-center gap-1.5">
                Link Google Drive Sản Phẩm (Đã Mở Khóa)
              </span>
              <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-bold text-white">
                Đã thanh toán 100%
              </span>
            </div>
            <p className="text-xs font-semibold text-emerald-900 leading-5">
              Ảnh chụp HD của bạn đã được photographer hoàn tất và tải lên. Bấm nút dưới đây để truy cập thư mục Google Drive.
            </p>
            <a
              href={driveUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-black text-white shadow hover:bg-emerald-700 transition-all"
            >
              Mở Thư Mục Google Drive Xem & Tải Ảnh ↗
            </a>
          </div>
        ) : (
          <div className="mx-5 mb-5 rounded-[18px] border border-amber-200 bg-amber-50/90 p-4 space-y-3 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[12px] font-black uppercase text-amber-800 tracking-wider flex items-center gap-1.5">
                Link Google Drive Ảnh (Chưa Mở Khóa)
              </span>
              <span className="rounded-full bg-amber-600 px-2.5 py-0.5 text-[10px] font-bold text-white">
                Cần thanh toán nốt
              </span>
            </div>
            <p className="text-xs font-semibold text-amber-900 leading-5">
              Photographer đã hoàn thành buổi chụp và gửi Link Drive. Vui lòng thanh toán phần còn lại <strong>({formatCurrency(booking.remaining_amount)})</strong> để mở khóa quyền truy cập xem & tải ảnh.
            </p>
            <Link
              href={`/final-payment/${encodeURIComponent(booking.booking_code)}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#ff8d28] px-5 py-2.5 text-xs font-black text-white shadow hover:bg-[#e0751b] transition-all"
            >
              Thanh toán nốt {formatCurrency(booking.remaining_amount)} để mở khóa ảnh ↗
            </Link>
          </div>
        )
      ) : null}

      {/* Floating Popup Modal for Booking Details */}
      {showDetails && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-[880px] max-h-[90vh] flex flex-col overflow-hidden rounded-[26px] border border-white/20 bg-white shadow-[0_32px_80px_rgba(15,23,42,0.3)] animate-in zoom-in-95 duration-200">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#eef2f7] bg-white px-6 py-4 shrink-0">
              <div className="flex items-center gap-3">

                <div>
                  <h3 className="text-[17px] font-black text-[#0f172a] tracking-tight">
                    Chi tiết đơn booking: <span className="text-[#ff8d28]">{booking.booking_code}</span>
                  </h3>
                  <p className="text-[11.5px] font-semibold text-[#64748b]">
                    {booking.service_name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-black ${statusInfo.className}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${statusInfo.dot}`} />
                  {statusInfo.label}
                </span>

                <button
                  type="button"
                  onClick={() => setShowDetails(false)}
                  className="grid h-9 w-9 place-items-center rounded-full border border-[#e2e8f0] bg-white text-[#64748b] hover:bg-slate-100 hover:text-[#0f172a] transition-all"
                  title="Đóng cửa sổ"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#f8fafc] text-xs text-[#334155]">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                {/* Box 1: Chi tiết dịch vụ */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2.5 shadow-sm">
                  <h4 className="font-black text-[#ff8d28] text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
                    Chi tiết dịch vụ
                  </h4>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Gói dịch vụ:</span>
                    <strong className="text-slate-900 text-right">{booking.service_name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Giá gốc gói:</span>
                    <strong className="text-slate-900">{formatCurrency(booking.base_price)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Quy mô nhóm:</span>
                    <strong className="text-slate-900">{booking.people_scale || "Tiêu chuẩn"} {booking.people_extra ? `(+${formatCurrency(booking.people_extra)})` : ""}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Concept/Khung cảnh:</span>
                    <strong className="text-slate-900 text-right max-w-[150px] truncate">{booking.concept || booking.scene || "Theo trao đổi với nhiếp ảnh gia"}</strong>
                  </div>
                </div>

                {/* Box 2: Lịch trình & Địa điểm */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2.5 shadow-sm">
                  <h4 className="font-black text-[#ff8d28] text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
                    Lịch trình & Địa điểm
                  </h4>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Ngày thực hiện:</span>
                    <strong className="text-slate-900">{formatDate(booking.shoot_date)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Giờ khởi hành:</span>
                    <strong className="text-slate-900">{formatTime(booking.shoot_time)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Địa điểm chụp:</span>
                    <strong className="text-slate-900 text-right max-w-[160px] truncate">{booking.location ? booking.location.split(" [Photos:")[0] : "Chưa chọn"}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Hình thức cọc:</span>
                    <strong className="text-slate-900">{booking.payment_method === "bank" ? "Chuyển khoản VietQR" : "Thanh toán MoMo/VnPay"}</strong>
                  </div>
                </div>

                {/* Box 3: Thông tin người đặt & Tài chính */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2.5 shadow-sm">
                  <h4 className="font-black text-[#ff8d28] text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
                    Thông tin đặt lịch
                  </h4>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Photographer:</span>
                    <strong className="text-slate-900">{booking.photographer_name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Khách hàng:</span>
                    <strong className="text-slate-900">{booking.customer_full_name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Số điện thoại:</span>
                    <strong className="text-slate-900">{booking.customer_phone || "Đã đăng ký"}</strong>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-1.5">
                    <span className="text-slate-500 font-medium">Tổng chi phí:</span>
                    <strong className="text-[#0f172a] font-black">{formatCurrency(booking.estimated_total)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Đã cọc:</span>
                    <strong className="text-emerald-600 font-black">{formatCurrency(booking.deposit_amount)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Còn lại:</span>
                    <strong className="text-[#ff8d28] font-black">{formatCurrency(booking.remaining_amount)}</strong>
                  </div>
                </div>
              </div>

              {/* Dịch vụ bổ sung Add-ons nếu có */}
              {Array.isArray(booking.add_ons) && booking.add_ons.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <h4 className="font-black text-[#ff8d28] text-xs uppercase tracking-wider border-b border-slate-100 pb-2 mb-2.5">
                    Dịch vụ bổ sung đã chọn ({booking.add_ons.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {booking.add_ons.map((addon: any, idx: number) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 rounded-xl border border-orange-200 bg-orange-50/70 px-3 py-1.5 text-[11.5px] font-bold text-[#ff8d28]">
                        <span>{addon.name || addon.title}</span>
                        <span className="text-[#e0751b]">(+{formatCurrency(addon.price)})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end border-t border-[#eef2f7] bg-white px-6 py-3.5 shrink-0">
              <button
                type="button"
                onClick={() => setShowDetails(false)}
                className="rounded-xl border border-[#e2e8f0] bg-white px-5 py-2.5 text-xs font-black text-[#475569] shadow-sm hover:bg-slate-50 hover:border-[#ff8d28] hover:text-[#ff8d28] transition-all"
              >
                Đóng cửa sổ
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] border border-[#eef0f5] bg-white px-4 py-3">
      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#94a3b8]">{label}</p>
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
      <span className={`text-[14px] font-black ${highlight ? "text-[#ff8d28]" : "text-[#0e111d]"}`}>
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
      <p className="mx-auto mt-2 max-w-[520px] text-[14px] font-semibold text-[#64748b]">
        Khi bạn gửi yêu cầu đặt lịch, booking sẽ xuất hiện tại đây.
      </p>
    </div>
  );
}

function BookingSkeleton() {
  return (
    <div className="mt-5 grid gap-4">
      {[1, 2, 3].map((item) => (
        <div key={item} className="h-[220px] animate-pulse rounded-[22px] bg-[#f1f5f9]" />
      ))}
    </div>
  );
}
