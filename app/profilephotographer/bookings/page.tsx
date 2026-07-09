"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
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
  photographer_id?: string | number;
  photographer_record_id?: string | number | null;
  source_table?: string;
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
    label: "Chờ xác nhận lịch",
    note: "Khách vừa gửi yêu cầu. Bạn cần xác nhận hoặc từ chối.",
    className: "border-[#fed7aa] bg-[#fff7ed] text-[#ea580c]",
    dot: "bg-[#f97316]",
  },
  accepted: {
    label: "Đã xác nhận, chờ khách cọc",
    note: "Bạn đã xác nhận lịch. Đang chờ khách thanh toán cọc.",
    className: "border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8]",
    dot: "bg-[#3b82f6]",
  },
  confirmed: {
    label: "Khách đã thanh toán cọc",
    note: "Lịch đã được giữ. Có thể chat với khách. Sau khi chụp xong, nhập link thư mục Google Drive rồi bấm Hoàn thành.",
    className: "border-[#bbf7d0] bg-[#ecfdf5] text-[#047857]",
    dot: "bg-[#10b981]",
  },
  completed: {
    label: "Đã hoàn thành, chờ khách thanh toán còn lại",
    note: "Bạn đã hoàn thành buổi chụp. Đang chờ khách thanh toán phần còn lại để nhận ảnh. Chat vẫn mở.",
    className: "border-[#fde68a] bg-[#fefce8] text-[#a16207]",
    dot: "bg-[#eab308]",
  },
  fully_paid: {
    label: "Khách đã thanh toán đủ",
    note: "Booking đã hoàn tất. Khách có thể xem ảnh, đánh giá và chat. Booking sẽ được đưa vào luồng đối soát để sàn chuyển tiền cho photographer.",
    className: "border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d]",
    dot: "bg-[#22c55e]",
  },
  rejected: {
    label: "Đã từ chối",
    note: "Bạn đã từ chối yêu cầu này.",
    className: "border-[#fecdd3] bg-[#fff1f2] text-[#be123c]",
    dot: "bg-[#e11d48]",
  },
  cancelled: {
    label: "Đã hủy",
    note: "Booking này đã bị hủy.",
    className: "border-[#e2e8f0] bg-[#f8fafc] text-[#64748b]",
    dot: "bg-[#94a3b8]",
  },
};

function getStatusInfo(status: string) {
  return (
    statusMap[status] || {
      label: status,
      note: "Trạng thái booking.",
      className: "border-[#e2e8f0] bg-[#f8fafc] text-[#475569]",
      dot: "bg-[#64748b]",
    }
  );
}

function findDeepValue(obj: any, keys: string[]): string {
  if (!obj || typeof obj !== "object") return "";

  for (const key of keys) {
    const value = obj?.[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    if (typeof value === "number") {
      return String(value);
    }
  }

  for (const value of Object.values(obj)) {
    if (value && typeof value === "object") {
      const found = findDeepValue(value, keys);
      if (found) return found;
    }
  }

  return "";
}

function readAllLocalStorageObjects() {
  if (typeof window === "undefined") return [];

  const result: any[] = [];

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key) continue;

    const raw = window.localStorage.getItem(key);
    if (!raw) continue;

    result.push({
      key,
      raw,
    });

    try {
      result.push({
        key,
        raw,
        parsed: JSON.parse(raw),
      });
    } catch {
      // bỏ qua string thường
    }
  }

  return result;
}

function getAuthToken() {
  if (typeof window === "undefined") return "";

  const directKeys = [
    "sudion_token",
    "sudion_auth_token",
    "sudion_access_token",
    "auth_token",
    "access_token",
    "token",
    "accessToken",
    "jwt",
  ];

  for (const key of directKeys) {
    const value = window.localStorage.getItem(key);
    if (value) return value;
  }

  const allItems = readAllLocalStorageObjects();

  for (const item of allItems) {
    if (typeof item.raw === "string") {
      const raw = item.raw.trim();

      if (raw.startsWith("eyJ") && raw.split(".").length === 3) {
        return raw;
      }
    }

    if (item.parsed) {
      const token = findDeepValue(item.parsed, [
        "token",
        "accessToken",
        "access_token",
        "authToken",
        "jwt",
      ]);

      if (token) return token;
    }
  }

  return "";
}

function getStoredPhotographerId() {
  if (typeof window === "undefined") return "";

  const directKeys = [
    "sudion_photographer_id",
    "photographer_id",
    "photographerId",
    "sudion_user_id",
    "user_id",
    "userId",
  ];

  for (const key of directKeys) {
    const value = window.localStorage.getItem(key);
    if (value) return value;
  }

  const allItems = readAllLocalStorageObjects();

  for (const item of allItems) {
    if (!item.parsed) continue;

    const role = findDeepValue(item.parsed, ["role", "user_role"]);

    const photographerId = findDeepValue(item.parsed, [
      "photographerId",
      "photographer_id",
      "photographerRecordId",
      "photographer_record_id",
    ]);

    if (photographerId) return photographerId;

    const userId = findDeepValue(item.parsed, ["id", "userId", "user_id"]);

    if (userId && String(role).toLowerCase().includes("photographer")) {
      return userId;
    }
  }

  return "";
}

function authHeaders() {
  const token = getAuthToken();

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function formatCurrency(value: number | string | null | undefined) {
  return `${Number(value || 0).toLocaleString("vi-VN")} VND`;
}

function stripPhotoDriveLink(location?: string | null) {
  return String(location || "")
    .replace(/\s*\[Photos:\s*https?:\/\/[^\]]+\]/i, "")
    .trim();
}

function isValidGoogleDriveFolderLink(value: string) {
  try {
    const url = new URL(value.trim());
    const host = url.hostname.toLowerCase();
    const path = url.pathname.toLowerCase();

    if (url.protocol !== "https:" && url.protocol !== "http:") return false;

    if (host !== "drive.google.com" && host !== "www.drive.google.com") {
      return false;
    }

    return /^\/drive\/(?:u\/\d+\/)?folders\/[^/]+/.test(path);
  } catch {
    return false;
  }
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

async function getMyPhotographerBookings() {
  const token = getAuthToken();

  if (token) {
    const response = await fetch(`${API_URL}/bookings/photographer/me`, {
      method: "GET",
      headers: authHeaders(),
      cache: "no-store",
    });

    const json: ApiResponse<BackendBooking[]> = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || "Không thể lấy booking của photographer.");
    }

    return json;
  }

  const fallbackPhotographerId = getStoredPhotographerId();

  if (!fallbackPhotographerId) {
    throw new Error("Vui lòng đăng nhập bằng tài khoản photographer.");
  }

  const response = await fetch(
    `${API_URL}/bookings/photographer/${encodeURIComponent(
      fallbackPhotographerId
    )}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  const json: ApiResponse<BackendBooking[]> = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.message || "Không thể lấy booking của photographer.");
  }

  return {
    ...json,
    photographer_id: fallbackPhotographerId,
    photographer_record_id: "",
    source_table: "booking_requests",
  };
}

async function updateMyBookingStatus(bookingCode: string, status: string) {
  const response = await fetch(
    `${API_URL}/bookings/photographer/me/${encodeURIComponent(
      bookingCode
    )}/status`,
    {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ status }),
    }
  );

  const json: ApiResponse<BackendBooking> = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.message || "Không thể cập nhật trạng thái booking.");
  }

  return json.data;
}

async function updateBookingPhotoLink(bookingCode: string, location: string) {
  const response = await fetch(
    `${API_URL}/admin/bookings/${encodeURIComponent(bookingCode)}`,
    {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ location }),
    }
  );

  const json = await response.json().catch(() => null);

  if (!response.ok || json?.success === false) {
    throw new Error(json?.message || "Không thể cập nhật liên kết Google Drive.");
  }

  return json;
}

export default function PhotographerDashboardPage() {
  const toast = useToast();
  const requestIdRef = useRef(0);

  const [photographerId, setPhotographerId] = useState("");
  const [photographerRecordId, setPhotographerRecordId] = useState("");
  const [sourceTable, setSourceTable] = useState("");
  const [bookings, setBookings] = useState<BackendBooking[]>([]);
  const [activeStatus, setActiveStatus] = useState("all");

  const [loading, setLoading] = useState(true);
  const [updatingCode, setUpdatingCode] = useState("");
  const [pageError, setPageError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function loadMyBookings(showLoading = true) {
    const currentRequestId = ++requestIdRef.current;

    try {
      if (showLoading) setLoading(true);

      setPageError("");
      setSuccessMessage("");

      const result = await getMyPhotographerBookings();

      if (currentRequestId !== requestIdRef.current) return;

      setBookings(result.data || []);
      setPhotographerId(result.photographer_id ? String(result.photographer_id) : "");
      setPhotographerRecordId(
        result.photographer_record_id ? String(result.photographer_record_id) : ""
      );
      setSourceTable(result.source_table || "");
      setActiveStatus((current) => current || "all");
    } catch (error) {
      if (currentRequestId !== requestIdRef.current) return;

      console.error("Lỗi lấy booking photographer:", error);

      setBookings([]);
      setPhotographerId("");
      setPhotographerRecordId("");
      setSourceTable("");
      setPageError(
        error instanceof Error
          ? error.message
          : "Không thể lấy booking của photographer."
      );
    } finally {
      if (currentRequestId === requestIdRef.current && showLoading) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    void loadMyBookings(true);

    const timer = window.setInterval(() => {
      void loadMyBookings(false);
    }, AUTO_REFRESH_MS);

    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  async function handleUpdateStatus(
    bookingCode: string,
    status: string
  ): Promise<BackendBooking | null> {
    try {
      setUpdatingCode(bookingCode);
      setPageError("");
      setSuccessMessage("");

      const updatedBooking = await updateMyBookingStatus(bookingCode, status);

      setBookings((current) =>
        current.map((item) =>
          item.booking_code === updatedBooking.booking_code
            ? updatedBooking
            : item
        )
      );

      const statusLabel = getStatusInfo(updatedBooking.status).label;

      setSuccessMessage(
        `Đã cập nhật booking ${updatedBooking.booking_code}: ${statusLabel}.`
      );

      toast.success(
        "Cập nhật booking thành công",
        `Booking ${updatedBooking.booking_code}: ${statusLabel}.`
      );

      return updatedBooking;
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);

      const message =
        error instanceof Error ? error.message : "Không thể cập nhật trạng thái.";

      setPageError(message);
      toast.error("Cập nhật thất bại", message);

      return null;
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
                  Quản lý đơn booking của bạn
                </h1>

                <p className="mt-4 max-w-[720px] text-[14px] font-medium leading-7 text-white/70">
                  Dashboard tự nhận tài khoản photographer đang đăng nhập. Không
                  cần nhập Photographer ID thủ công nữa.
                </p>
              </div>

              <div className="rounded-[20px] border border-white/10 bg-white/10 p-4 backdrop-blur-md">
                <p className="text-[12px] font-black uppercase tracking-[0.14em] text-white/70">
                  Tài khoản photographer
                </p>

                <div className="mt-3 grid gap-2 text-[13px] font-bold text-white/80">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-white/55">Photographer ID cũ</span>
                    <span className="rounded-full bg-white/15 px-3 py-1 text-white">
                      {photographerId || "—"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-white/55">Profile mới</span>
                    <span className="rounded-full bg-white/15 px-3 py-1 text-white">
                      {photographerRecordId || "—"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-white/55">Nguồn booking</span>
                    <span className="rounded-full bg-white/15 px-3 py-1 text-white">
                      {sourceTable || "—"}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => void loadMyBookings(true)}
                  disabled={loading}
                  className="mt-4 w-full rounded-[12px] bg-[#ff8d28] px-4 py-3 text-[13px] font-black text-white shadow-[0_10px_24px_rgba(255,141,40,0.3)] transition-all hover:bg-[#e0751b] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Đang tải..." : "Làm mới đơn booking"}
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 border-b border-[#eef2f7] bg-[#fbfcff] px-6 py-5 sm:grid-cols-2 lg:grid-cols-6 lg:px-8">
            <StatCard label="Tổng đơn" value={stats.total} />
            <StatCard label="Chờ xác nhận" value={stats.awaiting} />
            <StatCard label="Chờ khách cọc" value={stats.accepted} />
            <StatCard label="Đã cọc" value={stats.confirmed} />
            <StatCard label="Chờ trả còn lại" value={stats.completed} />
            <StatCard label="Đã thanh toán đủ" value={stats.fullyPaid} />
          </div>

          <div className="px-6 py-6 lg:px-8">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-[24px] font-black tracking-[-0.03em] text-[#0f172a]">
                  Danh sách đơn được book
                </h2>

                <p className="mt-1 text-[13px] font-semibold text-[#64748b]">
                  Trang này tự cập nhật sau mỗi 8 giây theo tài khoản đăng nhập.
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
            ) : pageError ? (
              <LoginState />
            ) : filteredBookings.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="mt-5 grid gap-4">
                {filteredBookings.map((booking) => (
                  <DashboardBookingCard
                    key={booking.booking_code}
                    booking={booking}
                    updatingCode={updatingCode}
                    onUpdateStatus={handleUpdateStatus}
                    onBookingChanged={(updatedBooking) => {
                      setBookings((current) =>
                        current.map((item) =>
                          item.booking_code === updatedBooking.booking_code
                            ? updatedBooking
                            : item
                        )
                      );
                    }}
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
  onBookingChanged,
}: {
  booking: BackendBooking;
  updatingCode: string;
  onUpdateStatus: (
    bookingCode: string,
    status: string
  ) => Promise<BackendBooking | null>;
  onBookingChanged: (booking: BackendBooking) => void;
}) {
  const toast = useToast();

  const [driveLink, setDriveLink] = useState("");
  const [driveError, setDriveError] = useState("");

  const statusInfo = getStatusInfo(booking.status);
  const isUpdating = updatingCode === booking.booking_code;
  const cleanLocation = stripPhotoDriveLink(booking.location) || "Chưa chọn";
  const isDriveLinkValid = isValidGoogleDriveFolderLink(driveLink);

  const canAccept = booking.status === "awaiting_payment";
  const canReject = booking.status === "awaiting_payment";
  const canComplete = booking.status === "confirmed";
  const canChat = ["confirmed", "completed", "fully_paid"].includes(
    String(booking.status || "")
  );

  const driveErrorMessage =
    "Vui lòng gửi đúng link thư mục Google Drive. Không dùng Google Docs, Google Sheets, Google Drive file hoặc link web khác.";

  async function handleComplete() {
    if (!isDriveLinkValid) {
      setDriveError(driveErrorMessage);

      toast.error("Link Google Drive không hợp lệ", driveErrorMessage);
      return;
    }

    try {
      setDriveError("");

      const finalLocation = `${cleanLocation} [Photos: ${driveLink.trim()}]`;

      await updateBookingPhotoLink(booking.booking_code, finalLocation);

      const updatedStatusBooking = await onUpdateStatus(
        booking.booking_code,
        "completed"
      );

      if (updatedStatusBooking) {
        onBookingChanged({
          ...updatedStatusBooking,
          location: finalLocation,
        });
      } else {
        onBookingChanged({
          ...booking,
          location: finalLocation,
        });
      }

      setDriveLink("");

      toast.success(
        "Đã gửi link ảnh",
        "Link thư mục Google Drive hợp lệ đã được lưu cho booking."
      );
    } catch (error) {
      console.error("Lỗi hoàn thành buổi chụp:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Lỗi khi hoàn thành buổi chụp.";

      setDriveError(message);
      toast.error("Không thể hoàn thành", message);
    }
  }

  return (
    <>
      {driveError ? (
        <DriveErrorModal
          message={driveError}
          onClose={() => setDriveError("")}
        />
      ) : null}

      <article className="overflow-hidden rounded-[22px] border border-[#e2e8f0] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.045)]">
        <div className="flex flex-col gap-4 border-b border-[#eef2f7] bg-[#fbfcff] px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[12px] font-black uppercase tracking-[0.14em] text-[#ff8d28]">
              {booking.booking_code}
            </p>

            <h3 className="mt-1 text-[20px] font-black tracking-[-0.03em] text-[#0f172a]">
              {booking.service_name}
            </h3>

            <p className="mt-1 text-[13px] font-semibold text-[#64748b]">
              Khách hàng:{" "}
              <span className="font-black text-[#111827]">
                {booking.customer_full_name}
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

        <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <InfoItem label="Ngày chụp" value={formatDate(booking.shoot_date)} />
              <InfoItem label="Giờ chụp" value={formatTime(booking.shoot_time)} />
              <InfoItem label="Địa điểm" value={cleanLocation} />
              <InfoItem
                label="Quy mô"
                value={booking.people_scale || "Chưa chọn"}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <InfoItem
                label="Email khách"
                value={booking.customer_email || "Chưa có"}
              />
              <InfoItem
                label="Số điện thoại"
                value={booking.customer_phone || "Chưa có"}
              />
            </div>

            <div className="rounded-[16px] border border-[#eef2f7] bg-[#fafbfc] px-4 py-3">
              <p className="text-[12px] font-black uppercase tracking-[0.14em] text-[#94a3b8]">
                Ghi chú trạng thái
              </p>

              <p className="mt-2 text-[14px] font-semibold leading-6 text-[#475569]">
                {statusInfo.note}
              </p>
            </div>

            {booking.concept ? (
              <div className="rounded-[16px] border border-[#eef2f7] bg-white px-4 py-3">
                <p className="text-[12px] font-black uppercase tracking-[0.14em] text-[#94a3b8]">
                  Concept / ghi chú
                </p>

                <p className="mt-2 whitespace-pre-line text-[14px] font-semibold leading-6 text-[#475569]">
                  {booking.concept}
                </p>
              </div>
            ) : null}
          </div>

          <div className="grid gap-3 rounded-[18px] border border-[#eef2f7] bg-[#fbfcff] p-4">
            <MoneyRow label="Tổng tiền" value={booking.estimated_total} />

            <MoneyRow
              label="Tiền cọc"
              value={booking.deposit_amount}
              highlight={booking.status === "confirmed"}
            />

            <MoneyRow
              label="Còn lại"
              value={booking.remaining_amount}
              highlight={booking.status === "completed"}
            />

            <div className="my-1 h-px bg-[#e2e8f0]" />

            <div className="grid gap-2">
              {canAccept ? (
                <button
                  type="button"
                  onClick={() =>
                    onUpdateStatus(booking.booking_code, "accepted")
                  }
                  disabled={isUpdating}
                  className="rounded-[12px] bg-[#ff8d28] px-4 py-3 text-center text-[13px] font-black text-white shadow-[0_10px_24px_rgba(255,141,40,0.18)] transition-all hover:bg-[#e0751b] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isUpdating ? "Đang xử lý..." : "Xác nhận lịch"}
                </button>
              ) : null}

              {canReject ? (
                <button
                  type="button"
                  onClick={() =>
                    onUpdateStatus(booking.booking_code, "rejected")
                  }
                  disabled={isUpdating}
                  className="rounded-[12px] border border-red-200 bg-white px-4 py-3 text-center text-[13px] font-black text-red-600 transition-all hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Từ chối lịch
                </button>
              ) : null}

              {booking.status === "accepted" ? (
                <button
                  type="button"
                  disabled
                  className="rounded-[12px] bg-[#eff6ff] px-4 py-3 text-center text-[13px] font-black text-[#1d4ed8]"
                >
                  Đang chờ khách thanh toán cọc
                </button>
              ) : null}

              {canChat ? (
                <Link
                  href={`/messages?booking=${encodeURIComponent(
                    booking.booking_code
                  )}`}
                  className="rounded-[12px] bg-[#ff8d28] px-4 py-3 text-center text-[13px] font-black text-white shadow-[0_10px_24px_rgba(255,141,40,0.18)] transition-all hover:bg-[#e0751b]"
                >
                  Chat với khách
                </Link>
              ) : null}

              {canComplete ? (
                <div className="mb-2 flex flex-col gap-2 text-left text-[#0f172a]">
                  <label className="block text-[11px] font-black uppercase tracking-[0.12em] text-[#94a3b8]">
                    Link Google Drive ảnh buổi chụp
                  </label>

                  <input
                    type="url"
                    value={driveLink}
                    onChange={(event) => {
                      setDriveLink(event.target.value);

                      if (driveError) {
                        setDriveError("");
                      }
                    }}
                    placeholder="https://drive.google.com/drive/folders/..."
                    className={`w-full rounded-[10px] border px-3 py-2 text-[12px] font-bold text-[#0f172a] outline-none ${
                      driveLink.trim() && !isDriveLinkValid
                        ? "border-red-300 bg-red-50 focus:border-red-500"
                        : "border-[#e2e8f0] bg-white focus:border-[#ff8d28]"
                    }`}
                  />

                  {driveLink.trim() && !isDriveLinkValid ? (
                    <div className="rounded-[12px] border border-red-200 bg-red-50 px-3 py-2">
                      <p className="text-[11px] font-black text-red-700">
                        Link Google Drive không hợp lệ
                      </p>
                      <p className="mt-1 text-[11px] font-bold leading-5 text-red-600">
                        Chỉ nhận link thư mục Google Drive dạng
                        https://drive.google.com/drive/folders/... Không dùng
                        Google Docs, Sheets, file Drive hoặc web khác.
                      </p>
                    </div>
                  ) : (
                    <p className="text-[11px] font-semibold leading-5 text-[#94a3b8]">
                      Chỉ chấp nhận link thư mục Google Drive để khách nhận ảnh.
                    </p>
                  )}
                </div>
              ) : null}

              {canComplete ? (
                <button
                  type="button"
                  onClick={handleComplete}
                  disabled={isUpdating || !isDriveLinkValid}
                  className="rounded-[12px] bg-[#16a34a] px-4 py-3 text-center text-[13px] font-black text-white shadow-[0_10px_24px_rgba(22,163,74,0.18)] transition-all hover:bg-[#15803d] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isUpdating ? "Đang xử lý..." : "Hoàn thành buổi chụp"}
                </button>
              ) : null}

              {booking.status === "completed" ? (
                <button
                  type="button"
                  disabled
                  className="rounded-[12px] bg-[#fefce8] px-4 py-3 text-center text-[13px] font-black text-[#a16207]"
                >
                  Chờ khách thanh toán còn lại
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </article>
    </>
  );
}

function DriveErrorModal({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[9999] grid place-items-center bg-black/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-[560px] overflow-hidden rounded-[24px] border border-red-300 bg-white shadow-[0_24px_90px_rgba(127,29,29,0.35)]">
        <div className="bg-red-600 px-6 py-4 text-white">
          <p className="text-[12px] font-black uppercase tracking-[0.16em] text-red-100">
            Cảnh báo
          </p>

          <h3 className="mt-1 text-[22px] font-black">
            Link Google Drive không hợp lệ
          </h3>
        </div>

        <div className="px-6 py-5">
          <div className="rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-bold leading-6 text-red-700">
            {message}
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              autoFocus
              className="rounded-[14px] bg-red-600 px-6 py-3 text-[13px] font-black text-white shadow-[0_10px_24px_rgba(220,38,38,0.2)] transition hover:bg-red-700"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] border border-[#eef2f7] bg-white px-4 py-3">
      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#94a3b8]">
        {label}
      </p>

      <p className="mt-1 break-words text-[13px] font-black text-[#111827]">
        {value}
      </p>
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
          highlight ? "text-[#ff8d28]" : "text-[#0f172a]"
        }`}
      >
        {formatCurrency(value)}
      </span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-5 rounded-[22px] border border-dashed border-[#dbe1ea] bg-[#fbfcff] px-6 py-12 text-center">
      <p className="text-[18px] font-black text-[#0f172a]">
        Chưa có booking nào
      </p>

      <p className="mx-auto mt-2 max-w-[560px] text-[14px] font-semibold leading-6 text-[#64748b]">
        Tài khoản photographer này hiện chưa có booking nào.
      </p>
    </div>
  );
}

function LoginState() {
  return (
    <div className="mt-5 rounded-[22px] border border-dashed border-red-200 bg-red-50 px-6 py-12 text-center">
      <p className="text-[18px] font-black text-red-700">
        Chưa đăng nhập photographer
      </p>

      <p className="mx-auto mt-2 max-w-[560px] text-[14px] font-semibold leading-6 text-red-600">
        Đăng nhập bằng tài khoản photographer rồi quay lại dashboard để hệ thống
        tự lấy booking.
      </p>

      <Link
        href="/login"
        className="mt-5 inline-flex rounded-[14px] bg-[#ff8d28] px-5 py-3 text-[13px] font-black text-white"
      >
        Đi tới đăng nhập
      </Link>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="mt-5 grid gap-4">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="h-[240px] animate-pulse rounded-[22px] bg-[#f1f5f9]"
        />
      ))}
    </div>
  );
}