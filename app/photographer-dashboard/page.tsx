"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/auth-context";
import { useToast } from "@/app/toast-context";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function authHeaders() {
  const token = typeof window !== "undefined" ? window.localStorage.getItem("sudion_token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

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
    note: "Bạn đã xác nhận lịch. Đang chờ khách thanh toán cọc 50%.",
    className: "border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8]",
    dot: "bg-[#3b82f6]",
  },
  confirmed: {
    label: "Khách đã thanh toán cọc",
    note: "Lịch đã được giữ. Sau khi chụp xong, bấm Hoàn thành.",
    className: "border-[#bbf7d0] bg-[#ecfdf5] text-[#047857]",
    dot: "bg-[#10b981]",
  },
  completed: {
    label: "Đã hoàn thành, chờ khách thanh toán còn lại",
    note: "Bạn đã hoàn thành buổi chụp. Đang chờ khách thanh toán phần còn lại.",
    className: "border-[#fde68a] bg-[#fefce8] text-[#a16207]",
    dot: "bg-[#eab308]",
  },
  fully_paid: {
    label: "Khách đã thanh toán đủ",
    note: "Booking đã hoàn tất. Khách có thể đánh giá và chat.",
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

function formatTime(value: string | null) {
  if (!value) return "Chưa chọn";
  return String(value).slice(0, 5);
}

async function getBookingsByPhotographer(photographerId: string) {
  const response = await fetch(
    `${API_URL}/bookings/photographer/${encodeURIComponent(photographerId)}`,
    {
      method: "GET",
      cache: "no-store",
      headers: authHeaders(),
    }
  );

  const json: ApiResponse<BackendBooking[]> = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.message || "Không thể lấy booking của photographer.");
  }

  return json.data;
}

async function updateBookingStatus(bookingCode: string, status: string, location?: string) {
  const response = await fetch(`${API_URL}/bookings/${bookingCode}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({ status, location }),
  });

  const json: ApiResponse<BackendBooking> = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.message || "Không thể cập nhật trạng thái booking.");
  }

  return json.data;
}

export default function PhotographerDashboardPage() {
  const { session, isLoggedIn, isPhotographer, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [photographerId, setPhotographerId] = useState("");
  const [bookings, setBookings] = useState<BackendBooking[]>([]);
  const [activeStatus, setActiveStatus] = useState("all");
  const [mainTab, setMainTab] = useState<"bookings" | "promotion">("bookings");
  const [profile, setProfile] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [updatingCode, setUpdatingCode] = useState("");
  const [pageError, setPageError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function loadProfile(id: string) {
    try {
      const response = await fetch(`${API_URL}/photographers/${id}`);
      const json = await response.json();
      if (json.success) {
        setProfile(json.data);
      }
    } catch (error) {
      console.error("Error loading photographer profile:", error);
    }
  }

  useEffect(() => {
    if (!isLoading) {
      if (!isLoggedIn) {
        router.push("/login");
      } else if (!isPhotographer && !isAdmin) {
        router.push("/");
      }
    }
  }, [isLoggedIn, isPhotographer, isAdmin, isLoading, router]);

  useEffect(() => {
    if (isLoading) return;
    if (!isLoggedIn || (!isPhotographer && !isAdmin)) return;

    // Secure: normal thợ ảnh cannot query arbitrary IDs, admins can.
    const finalId = isAdmin 
      ? (photographerId || session?.photographerId || session?.userId || "79")
      : (session?.photographerId || session?.userId || "");

    if (!finalId) return;

    setPhotographerId(finalId);
    void handleLoadBookings(finalId);
    void loadProfile(finalId);

    const timer = window.setInterval(async () => {
      try {
        const data = await getBookingsByPhotographer(finalId);
        setBookings(data);
        await loadProfile(finalId);
        window.localStorage.setItem("sudion_photographer_id", finalId);
      } catch (error) {
        console.error("Auto refresh photographer dashboard failed:", error);
      }
    }, AUTO_REFRESH_MS);

    return () => window.clearInterval(timer);
  }, [isLoading, isLoggedIn, isPhotographer, isAdmin, session]);

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
    if (!isAdmin) {
      toast.warning("Hành động bị chặn", "Chỉ admin mới có quyền đổi ID thợ ảnh.");
      return;
    }
    await handleLoadBookings();
  }

 async function handleUpdateStatus(bookingCode: string, status: string, location?: string) {
  try {
    setUpdatingCode(bookingCode);
    setPageError("");
    setSuccessMessage("");

    const updatedBooking = await updateBookingStatus(bookingCode, status, location);

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
  } catch (error) {
    console.error("Lỗi cập nhật trạng thái:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Không thể cập nhật trạng thái.";

    setPageError(message);

    toast.error("Cập nhật thất bại", message);
  } finally {
    setUpdatingCode("");
  }
}

  async function handleBuyPromotion(packageType: "7_days" | "30_days") {
    try {
      setLoading(true);
      const result = (await api.promotion.createPayment(packageType)) as any;
      if (result.success && result.data) {
        const { bookingCode, paymentType, amount, signature } = result.data;
        router.push(
          `/checkout-gateway?bookingCode=${bookingCode}&paymentType=${paymentType}&amount=${amount}&signature=${signature}`
        );
      } else {
        alert(result.message || "Lỗi tạo thông tin thanh toán.");
      }
    } catch (err: any) {
      alert("Lỗi kết nối: " + err.message);
    } finally {
      setLoading(false);
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

                <p className="mt-4 max-w-[720px] text-[14px] font-medium leading-7 text-white/70">
                  Xác nhận lịch, từ chối lịch, đánh dấu hoàn thành sau khi khách
                  đã cọc, và theo dõi thanh toán còn lại.
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
                      placeholder="Ví dụ: 79"
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

          {/* Main Tabs */}
          <div className="flex border-b border-[#eef2f7] bg-white px-6">
            <button
              onClick={() => setMainTab("bookings")}
              className={`pb-4 pt-5 px-4 text-[14px] font-bold border-b-2 transition-all ${
                mainTab === "bookings"
                  ? "border-[#ff8d28] text-[#ff8d28]"
                  : "border-transparent text-[#64748b] hover:text-[#0f172a]"
              }`}
            >
              Quản lý Đặt lịch ({stats.total})
            </button>
            <button
              onClick={() => setMainTab("promotion")}
              className={`pb-4 pt-5 px-4 text-[14px] font-bold border-b-2 transition-all ${
                mainTab === "promotion"
                  ? "border-[#ff8d28] text-[#ff8d28]"
                  : "border-transparent text-[#64748b] hover:text-[#0f172a]"
              }`}
            >
              Quảng cáo & Nổi bật hồ sơ
            </button>
          </div>

          {mainTab === "bookings" ? (
            <>
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
                      Trang này tự cập nhật sau mỗi 8 giây.
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
                            : "border-transparent bg-white text-[#64748b] hover:text-[#ff8d28]"
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
            </>
          ) : (
            <div className="p-6 lg:p-8">
              <div className="max-w-[720px] mx-auto bg-white rounded-3xl border border-[#e2e8f0] p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#fff3e8] text-[#ff8d28]">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  </div>
                  <div>
                    <h2 className="text-[20px] font-black text-[#0f172a] tracking-tight">Đăng ký vị trí Nổi bật (Featured)</h2>
                    <p className="text-[13px] text-[#64748b] font-medium mt-1">Đưa hồ sơ của bạn lên đầu kết quả tìm kiếm của khách hàng</p>
                  </div>
                </div>

                {profile?.is_featured ? (
                  <div className="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-800">
                    <p className="text-[14px] font-bold flex items-center gap-2">
                      <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      Hồ sơ của bạn đang ở trạng thái NỔI BẬT!
                    </p>
                    <p className="text-[12px] font-semibold text-emerald-700/90 mt-1">
                      Hết hạn vào ngày: {new Date(profile.featured_until).toLocaleDateString("vi-VN")} lúc {new Date(profile.featured_until).toLocaleTimeString("vi-VN")}
                    </p>
                  </div>
                ) : (
                  <div className="mb-8 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-700">
                    <p className="text-[14px] font-bold">Trạng thái hồ sơ: Thông thường</p>
                    <p className="text-[12px] font-medium text-slate-500 mt-1">Đăng ký một trong các gói bên dưới để tiếp cận hàng ngàn khách hàng tiềm năng mới.</p>
                  </div>
                )}

                <h3 className="text-[15px] font-bold text-[#0f172a] mb-4">Lựa chọn gói Quảng cáo:</h3>
                
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="rounded-2xl border border-[#e2e8f0] p-5 flex flex-col justify-between hover:border-[#ff8d28] transition-all">
                    <div>
                      <span className="text-[11px] font-black uppercase text-[#ff8d28] tracking-wider">Gói Vàng</span>
                      <h4 className="text-[18px] font-black text-gray-800 mt-1">Nổi bật 7 ngày</h4>
                      <p className="text-[12px] text-gray-500 mt-2 font-medium">Lý tưởng để thử nghiệm hiệu quả hiển thị và tăng nhanh lượng khách hàng trong tuần.</p>
                    </div>
                    <div className="mt-6">
                      <p className="text-[20px] font-black text-gray-900">200.000đ</p>
                      <button
                        onClick={() => handleBuyPromotion("7_days")}
                        disabled={loading}
                        className="w-full mt-4 rounded-xl bg-[#ff8d28] hover:bg-[#e0751b] py-2.5 text-[13px] font-black text-white text-center transition-all disabled:opacity-55"
                      >
                        Thanh toán ngay
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl border-2 border-[#ff8d28] bg-[#fffbf7] p-5 flex flex-col justify-between relative">
                    <span className="absolute top-[-12px] right-4 bg-[#ff8d28] text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">Phổ biến nhất</span>
                    <div>
                      <span className="text-[11px] font-black uppercase text-[#ff8d28] tracking-wider">Gói Kim Cương</span>
                      <h4 className="text-[18px] font-black text-gray-800 mt-1">Nổi bật 30 ngày</h4>
                      <p className="text-[12px] text-gray-500 mt-2 font-medium">Tối ưu chi phí và duy trì thứ hạng nổi bật liên tục trên trang chủ trong suốt một tháng.</p>
                    </div>
                    <div className="mt-6">
                      <p className="text-[20px] font-black text-gray-900">700.000đ <span className="text-[11px] font-bold text-gray-400 line-through">800.000đ</span></p>
                      <button
                        onClick={() => handleBuyPromotion("30_days")}
                        disabled={loading}
                        className="w-full mt-4 rounded-xl bg-[#111827] hover:bg-black py-2.5 text-[13px] font-black text-white text-center transition-all disabled:opacity-55"
                      >
                        Thanh toán ngay
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
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
  onUpdateStatus: (bookingCode: string, status: string, location?: string) => Promise<void>;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [driveLink, setDriveLink] = useState("");
  const statusInfo = getStatusInfo(booking.status);
  const isUpdating = updatingCode === booking.booking_code;

  const canAccept = booking.status === "awaiting_payment";
  const canReject = booking.status === "awaiting_payment";
  const canComplete = booking.status === "confirmed";

  const handleComplete = async () => {
    if (!driveLink.trim().startsWith("http")) {
      alert("Vui lòng nhập link Google Drive hợp lệ (bắt đầu bằng http hoặc https).");
      return;
    }
    try {
      const location = `${booking.location || "Chưa chọn"} [Photos: ${driveLink.trim()}]`;
      await onUpdateStatus(booking.booking_code, "completed", location);
    } catch (error: any) {
      console.error("Lỗi hoàn thành buổi chụp:", error);
      alert(error.message || "Lỗi khi hoàn thành buổi chụp.");
    }
  };

  return (
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

        <div className="flex items-center gap-2.5">
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

          <span
            className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-2 text-[12px] font-black ${statusInfo.className}`}
          >
            <span className={`h-2 w-2 rounded-full ${statusInfo.dot}`} />
            {statusInfo.label}
          </span>
        </div>
      </div>

      <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_300px]">
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

             {canComplete ? (
              <div className="flex flex-col gap-2 mb-2 text-[#0f172a] text-left">
                <label className="block text-[11px] font-black uppercase tracking-[0.12em] text-[#94a3b8]">
                  Link Google Drive ảnh buổi chụp (Bắt buộc)
                </label>
                <input
                  type="url"
                  value={driveLink}
                  onChange={(e) => setDriveLink(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full rounded-[10px] border border-[#e2e8f0] px-3 py-2 text-[12px] font-bold outline-none focus:border-[#ff8d28] bg-white text-[#0f172a]"
                />
              </div>
            ) : null}

            {canComplete ? (
              <button
                type="button"
                onClick={handleComplete}
                disabled={isUpdating || !driveLink.trim().startsWith("http")}
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

            {["accepted", "confirmed", "completed", "fully_paid"].includes(booking.status) ? (
              <Link
                href={`/messages?booking=${encodeURIComponent(
                  booking.booking_code
                )}`}
                className="rounded-[12px] bg-[#ff8d28] px-4 py-3 text-center text-[13px] font-black text-white shadow-[0_10px_24px_rgba(255,141,40,0.18)] transition-all hover:bg-[#e0751b] flex items-center justify-center gap-1.5"
              >
                💬 Chat với khách
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      {/* Expandable Full Detailed Breakdown for Photographer */}
      {showDetails && (
        <div className="border-t border-[#e8eaf1] bg-[#f8fafc] p-5 text-xs text-[#334155] space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-2.5">
            <h4 className="text-[13px] font-black uppercase text-[#0f172a] tracking-wider">
              Chi tiết đầy đủ đơn booking: <span className="text-[#ff8d28]">{booking.booking_code}</span>
            </h4>
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-black ${statusInfo.className}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${statusInfo.dot}`} />
              {statusInfo.label}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Box 1: Chi tiết dịch vụ */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 shadow-sm">
              <h5 className="font-black text-[#ff8d28] text-xs uppercase tracking-wider border-b border-slate-100 pb-1.5">
                Chi tiết dịch vụ
              </h5>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Gói dịch vụ:</span>
                <strong className="text-slate-900">{booking.service_name}</strong>
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
                <span className="text-slate-500 font-medium">Khung cảnh/Concept:</span>
                <strong className="text-slate-900">{booking.concept || booking.scene || "Theo trao đổi với nhiếp ảnh gia"}</strong>
              </div>
            </div>

            {/* Box 2: Lịch trình & Địa điểm */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 shadow-sm">
              <h5 className="font-black text-[#ff8d28] text-xs uppercase tracking-wider border-b border-slate-100 pb-1.5">
                Lịch trình & Địa điểm
              </h5>
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
                <strong className="text-slate-900 text-right max-w-[180px] truncate">{booking.location ? booking.location.split(" [Photos:")[0] : "Chưa chọn"}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Hình thức cọc:</span>
                <strong className="text-slate-900">{booking.payment_method === "bank" ? "Chuyển khoản VietQR" : "Thanh toán MoMo/VnPay"}</strong>
              </div>
            </div>

            {/* Box 3: Thông tin người đặt & Tài chính */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 shadow-sm">
              <h5 className="font-black text-[#ff8d28] text-xs uppercase tracking-wider border-b border-slate-100 pb-1.5">
                Khách hàng & Tài chính
              </h5>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Họ tên khách:</span>
                <strong className="text-slate-900">{booking.customer_full_name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Số điện thoại:</span>
                <strong className="text-slate-900">{booking.customer_phone || "Chưa có"}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Email liên hệ:</span>
                <strong className="text-slate-[#0f172a] truncate max-w-[160px]">{booking.customer_email || "Chưa có"}</strong>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-1.5">
                <span className="text-slate-500 font-medium">Tổng tiền:</span>
                <strong className="text-[#0f172a]">{formatCurrency(booking.estimated_total)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Đã cọc:</span>
                <strong className="text-emerald-600">{formatCurrency(booking.deposit_amount)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Còn lại:</span>
                <strong className="text-[#ff8d28]">{formatCurrency(booking.remaining_amount)}</strong>
              </div>
            </div>
          </div>

          {/* Dịch vụ bổ sung Add-ons nếu có */}
          {Array.isArray(booking.add_ons) && booking.add_ons.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h5 className="font-black text-[#ff8d28] text-xs uppercase tracking-wider border-b border-slate-100 pb-1.5 mb-2">
                Dịch vụ bổ sung đã chọn (Add-ons)
              </h5>
              <div className="flex flex-wrap gap-2">
                {booking.add_ons.map((addon: any, idx: number) => (
                  <span key={idx} className="inline-flex items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50/70 px-2.5 py-1 text-[11px] font-bold text-[#ff8d28]">
                    <span>{addon.name || addon.title}</span>
                    <span>(+{formatCurrency(addon.price)})</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </article>
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

function EmptyState({ hasPhotographerId }: { hasPhotographerId: boolean }) {
  return (
    <div className="mt-5 rounded-[22px] border border-dashed border-[#dbe1ea] bg-[#fbfcff] px-6 py-12 text-center">
      <p className="text-[18px] font-black text-[#0f172a]">
        {hasPhotographerId ? "Chưa có booking nào" : "Nhập photographer ID"}
      </p>

      <p className="mx-auto mt-2 max-w-[560px] text-[14px] font-semibold leading-6 text-[#64748b]">
        {hasPhotographerId
          ? "Khi khách gửi yêu cầu đặt lịch, đơn sẽ xuất hiện tại đây."
          : "Sau khi đăng nhập bằng tài khoản photographer, hệ thống sẽ tự lấy ID nếu bạn đã liên kết khi đăng ký."}
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
          className="h-[240px] animate-pulse rounded-[22px] bg-[#f1f5f9]"
        />
      ))}
    </div>
  );
}
