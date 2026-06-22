"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const AUTO_REFRESH_MS = 8000;

type Booking = {
  booking_code: string;
  photographer_name: string;
  service_name: string;
  shoot_date: string | null;
  shoot_time: string | null;
  estimated_total: number;
  deposit_amount: number;
  remaining_amount: number;
  status: string;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

type StatusInfo = {
  label: string;
  description: string;
  className: string;
  dot: string;
};

const statusMap: Record<string, StatusInfo> = {
  awaiting_payment: {
    label: "Chờ photographer xác nhận",
    description:
      "Yêu cầu đã được gửi tới photographer. Vui lòng chờ xác nhận lịch.",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },
  accepted: {
    label: "Photographer đã xác nhận",
    description:
      "Photographer đã xác nhận lịch. Bạn có thể thanh toán cọc để giữ lịch.",
    className: "border-blue-200 bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
  },
  confirmed: {
    label: "Đã thanh toán cọc",
    description:
      "Bạn đã thanh toán cọc thành công. Vui lòng đến đúng lịch hẹn chụp.",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  completed: {
    label: "Buổi chụp đã hoàn thành",
    description:
      "Photographer đã hoàn thành buổi chụp. Bạn có thể thanh toán phần còn lại.",
    className: "border-purple-200 bg-purple-50 text-purple-700",
    dot: "bg-purple-500",
  },
  fully_paid: {
    label: "Đã thanh toán đủ",
    description:
      "Booking đã hoàn tất thanh toán. Bạn có thể đánh giá photographer.",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  rejected: {
    label: "Photographer đã từ chối",
    description:
      "Photographer đã từ chối yêu cầu này. Bạn có thể chọn photographer hoặc khung giờ khác.",
    className: "border-red-200 bg-red-50 text-red-700",
    dot: "bg-red-500",
  },
  cancelled: {
    label: "Booking đã hủy",
    description: "Booking này đã được hủy.",
    className: "border-slate-200 bg-slate-50 text-slate-600",
    dot: "bg-slate-400",
  },
};

function getStatusInfo(status: string): StatusInfo {
  return (
    statusMap[status] || {
      label: status,
      description: "Trạng thái booking hiện tại.",
      className: "border-slate-200 bg-slate-50 text-slate-600",
      dot: "bg-slate-400",
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

export default function BookingRequestSuccessPage({
  params,
}: {
  params: { id: string };
}) {
  const bookingCode = params.id;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadBooking(showLoading = true) {
      try {
        if (!bookingCode) {
          throw new Error("Thiếu mã booking.");
        }

        if (showLoading) {
          setLoading(true);
        }

        setPageError("");

        const data = await getBooking(bookingCode);

        if (!ignore) {
          setBooking(data);
        }
      } catch (error) {
        if (!ignore) {
          setPageError(
            error instanceof Error ? error.message : "Không thể lấy booking."
          );
        }
      } finally {
        if (!ignore && showLoading) {
          setLoading(false);
        }
      }
    }

    void loadBooking(true);

    const timer = window.setInterval(() => {
      void loadBooking(false);
    }, AUTO_REFRESH_MS);

    return () => {
      ignore = true;
      window.clearInterval(timer);
    };
  }, [bookingCode]);

  const statusInfo = useMemo(() => {
    return getStatusInfo(booking?.status || "awaiting_payment");
  }, [booking?.status]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (pageError || !booking) {
    return <ErrorState message={pageError || "Không tìm thấy booking."} />;
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] px-5 py-10 text-[#0f172a] sm:py-14">
      <section className="mx-auto grid w-full max-w-[1180px] gap-6 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">
        <div className="overflow-hidden rounded-[30px] border border-[#e2e8f0] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="relative overflow-hidden bg-[#111827] px-6 py-8 text-white sm:px-8 lg:px-10">
            <div className="absolute right-[-110px] top-[-110px] h-[300px] w-[300px] rounded-full bg-[#ff8d28]/25 blur-3xl" />
            <div className="absolute bottom-[-130px] left-[20%] h-[280px] w-[280px] rounded-full bg-white/10 blur-3xl" />

            <div className="relative">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-[12px] font-black uppercase tracking-[0.18em] text-[#ffb267]">
                  Booking request sent
                </p>

                <StatusBadge
                  label={statusInfo.label}
                  className={statusInfo.className}
                  dot={statusInfo.dot}
                />
              </div>

              <h1 className="mt-4 max-w-[760px] text-[34px] font-black leading-[1.05] tracking-[-0.04em] sm:text-[46px]">
                Đã gửi yêu cầu đặt lịch
              </h1>

              <p className="mt-4 max-w-[720px] text-[14px] font-semibold leading-7 text-white/70">
                STUDION đã gửi yêu cầu này tới photographer. Trang này sẽ tự cập
                nhật trạng thái mỗi 8 giây, không cần tải lại.
              </p>
            </div>
          </div>

          <div className="grid gap-5 p-6 sm:p-8">
            <div className="rounded-[24px] border border-[#eef2f7] bg-[#fbfcff] p-5">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#94a3b8]">
                Mã booking
              </p>

              <p className="mt-2 break-all text-[28px] font-black tracking-[-0.04em] text-[#111827]">
                {booking.booking_code}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <InfoCard label="Photographer" value={booking.photographer_name} />
              <InfoCard label="Dịch vụ" value={booking.service_name} />
              <InfoCard label="Ngày chụp" value={formatDate(booking.shoot_date)} />
              <InfoCard label="Giờ chụp" value={formatTime(booking.shoot_time)} />
            </div>

            <div className={`rounded-[22px] border p-5 ${statusInfo.className}`}>
              <p className="text-[13px] font-black">{statusInfo.label}</p>

              <p className="mt-2 text-[14px] font-semibold leading-6 opacity-90">
                {statusInfo.description}
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <MoneyCard label="Tổng tiền" value={booking.estimated_total} />
              <MoneyCard label="Tiền cọc 50%" value={booking.deposit_amount} />
              <MoneyCard label="Còn lại" value={booking.remaining_amount} />
            </div>

            <ActionButtons booking={booking} />
          </div>
        </div>

        <aside className="rounded-[30px] border border-[#e2e8f0] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.06)] lg:sticky lg:top-[100px]">
          <p className="text-[12px] font-black uppercase tracking-[0.18em] text-[#ff8d28]">
            Booking progress
          </p>

          <h2 className="mt-3 text-[26px] font-black tracking-[-0.04em] text-[#0f172a]">
            Quy trình booking
          </h2>

          <div className="mt-6 grid gap-4">
            <ProgressItem
              active
              done
              title="Gửi yêu cầu"
              description="Bạn đã gửi yêu cầu đặt lịch tới photographer."
            />

            <ProgressItem
              active={["accepted", "confirmed", "completed", "fully_paid"].includes(
                booking.status
              )}
              done={["accepted", "confirmed", "completed", "fully_paid"].includes(
                booking.status
              )}
              title="Photographer xác nhận"
              description="Photographer kiểm tra lịch và xác nhận yêu cầu."
            />

            <ProgressItem
              active={["confirmed", "completed", "fully_paid"].includes(
                booking.status
              )}
              done={["confirmed", "completed", "fully_paid"].includes(
                booking.status
              )}
              title="Thanh toán cọc"
              description="Bạn thanh toán cọc để giữ lịch chụp."
            />

            <ProgressItem
              active={["completed", "fully_paid"].includes(booking.status)}
              done={["completed", "fully_paid"].includes(booking.status)}
              title="Hoàn thành buổi chụp"
              description="Photographer đánh dấu hoàn thành sau buổi chụp."
            />

            <ProgressItem
              active={booking.status === "fully_paid"}
              done={booking.status === "fully_paid"}
              title="Thanh toán đủ"
              description="Bạn thanh toán phần còn lại và có thể đánh giá."
            />
          </div>

          <div className="mt-6 rounded-[22px] border border-[#ffedd5] bg-[#fff7ed] p-5">
            <p className="text-[13px] font-black text-[#ea580c]">
              Tự cập nhật trạng thái
            </p>

            <p className="mt-2 text-[13px] font-semibold leading-6 text-[#9a3412]">
              Khi photographer xác nhận, từ chối hoặc hoàn thành booking, trang
              này sẽ tự cập nhật sau vài giây.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}

  useEffect(() => {
    let ignore = false;

    async function loadBooking(showLoading = true) {
      try {
        if (!bookingCode) {
          throw new Error("Thiếu mã booking.");
        }

        if (showLoading) {
          setLoading(true);
        }

        setPageError("");

        const data = await getBooking(bookingCode);

        if (!ignore) {
          setBooking(data);
        }
      } catch (error) {
        if (!ignore) {
          setPageError(
            error instanceof Error ? error.message : "Không thể lấy booking."
          );
        }
      } finally {
        if (!ignore && showLoading) {
          setLoading(false);
        }
      }
    }

    void loadBooking(true);

    const timer = window.setInterval(() => {
      void loadBooking(false);
    }, AUTO_REFRESH_MS);

    return () => {
      ignore = true;
      window.clearInterval(timer);
    };
  }, [bookingCode]);

  const statusInfo = useMemo(() => {
    return getStatusInfo(booking?.status || "awaiting_payment");
  }, [booking?.status]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (pageError || !booking) {
    return <ErrorState message={pageError || "Không tìm thấy booking."} />;
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] px-5 py-10 text-[#0f172a] sm:py-14">
      <section className="mx-auto grid w-full max-w-[1180px] gap-6 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">
        <div className="overflow-hidden rounded-[30px] border border-[#e2e8f0] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="relative overflow-hidden bg-[#111827] px-6 py-8 text-white sm:px-8 lg:px-10">
            <div className="absolute right-[-110px] top-[-110px] h-[300px] w-[300px] rounded-full bg-[#ff8d28]/25 blur-3xl" />
            <div className="absolute bottom-[-130px] left-[20%] h-[280px] w-[280px] rounded-full bg-white/10 blur-3xl" />

            <div className="relative">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-[12px] font-black uppercase tracking-[0.18em] text-[#ffb267]">
                  Booking request sent
                </p>

                <StatusBadge
                  label={statusInfo.label}
                  className={statusInfo.className}
                  dot={statusInfo.dot}
                />
              </div>

              <h1 className="mt-4 max-w-[760px] text-[34px] font-black leading-[1.05] tracking-[-0.04em] sm:text-[46px]">
                Đã gửi yêu cầu đặt lịch
              </h1>

              <p className="mt-4 max-w-[720px] text-[14px] font-semibold leading-7 text-white/70">
                STUDION đã gửi yêu cầu này tới photographer. Trang này sẽ tự cập
                nhật trạng thái mỗi 8 giây, không cần tải lại.
              </p>
            </div>
          </div>

          <div className="grid gap-5 p-6 sm:p-8">
            <div className="rounded-[24px] border border-[#eef2f7] bg-[#fbfcff] p-5">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#94a3b8]">
                Mã booking
              </p>

              <p className="mt-2 break-all text-[28px] font-black tracking-[-0.04em] text-[#111827]">
                {booking.booking_code}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <InfoCard label="Photographer" value={booking.photographer_name} />
              <InfoCard label="Dịch vụ" value={booking.service_name} />
              <InfoCard label="Ngày chụp" value={formatDate(booking.shoot_date)} />
              <InfoCard label="Giờ chụp" value={formatTime(booking.shoot_time)} />
            </div>

            <div className={`rounded-[22px] border p-5 ${statusInfo.className}`}>
              <p className="text-[13px] font-black">{statusInfo.label}</p>

              <p className="mt-2 text-[14px] font-semibold leading-6 opacity-90">
                {statusInfo.description}
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <MoneyCard label="Tổng tiền" value={booking.estimated_total} />
              <MoneyCard label="Tiền cọc 50%" value={booking.deposit_amount} />
              <MoneyCard label="Còn lại" value={booking.remaining_amount} />
            </div>

            <ActionButtons booking={booking} />
          </div>
        </div>

        <aside className="rounded-[30px] border border-[#e2e8f0] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.06)] lg:sticky lg:top-[100px]">
          <p className="text-[12px] font-black uppercase tracking-[0.18em] text-[#ff8d28]">
            Booking progress
          </p>

          <h2 className="mt-3 text-[26px] font-black tracking-[-0.04em] text-[#0f172a]">
            Quy trình booking
          </h2>

          <div className="mt-6 grid gap-4">
            <ProgressItem
              active
              done
              title="Gửi yêu cầu"
              description="Bạn đã gửi yêu cầu đặt lịch tới photographer."
            />

            <ProgressItem
              active={["accepted", "confirmed", "completed", "fully_paid"].includes(
                booking.status
              )}
              done={["accepted", "confirmed", "completed", "fully_paid"].includes(
                booking.status
              )}
              title="Photographer xác nhận"
              description="Photographer kiểm tra lịch và xác nhận yêu cầu."
            />

            <ProgressItem
              active={["confirmed", "completed", "fully_paid"].includes(
                booking.status
              )}
              done={["confirmed", "completed", "fully_paid"].includes(
                booking.status
              )}
              title="Thanh toán cọc"
              description="Bạn thanh toán cọc để giữ lịch chụp."
            />

            <ProgressItem
              active={["completed", "fully_paid"].includes(booking.status)}
              done={["completed", "fully_paid"].includes(booking.status)}
              title="Hoàn thành buổi chụp"
              description="Photographer đánh dấu hoàn thành sau buổi chụp."
            />

            <ProgressItem
              active={booking.status === "fully_paid"}
              done={booking.status === "fully_paid"}
              title="Thanh toán đủ"
              description="Bạn thanh toán phần còn lại và có thể đánh giá."
            />
          </div>

          <div className="mt-6 rounded-[22px] border border-[#ffedd5] bg-[#fff7ed] p-5">
            <p className="text-[13px] font-black text-[#ea580c]">
              Tự cập nhật trạng thái
            </p>

            <p className="mt-2 text-[13px] font-semibold leading-6 text-[#9a3412]">
              Khi photographer xác nhận, từ chối hoặc hoàn thành booking, trang
              này sẽ tự cập nhật sau vài giây.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}

function ActionButtons({ booking }: { booking: Booking }) {
  if (booking.status === "accepted") {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href={`/deposit-payment/${encodeURIComponent(booking.booking_code)}`}
          className="rounded-[16px] bg-[#ff8d28] px-5 py-4 text-center text-[14px] font-black text-white shadow-[0_14px_30px_rgba(255,141,40,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#e0751b]"
        >
          Thanh toán cọc
        </Link>

        <Link
          href="/bookings"
          className="rounded-[16px] border border-[#e2e8f0] bg-white px-5 py-4 text-center text-[14px] font-black text-[#334155] transition-all hover:border-[#ffcfaa] hover:text-[#ff8d28]"
        >
          Xem booking của tôi
        </Link>
      </div>
    );
  }

  if (booking.status === "completed") {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href={`/final-payment/${encodeURIComponent(booking.booking_code)}`}
          className="rounded-[16px] bg-[#ff8d28] px-5 py-4 text-center text-[14px] font-black text-white shadow-[0_14px_30px_rgba(255,141,40,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#e0751b]"
        >
          Thanh toán còn lại
        </Link>

        <Link
          href="/bookings"
          className="rounded-[16px] border border-[#e2e8f0] bg-white px-5 py-4 text-center text-[14px] font-black text-[#334155] transition-all hover:border-[#ffcfaa] hover:text-[#ff8d28]"
        >
          Xem booking của tôi
        </Link>
      </div>
    );
  }

  if (booking.status === "fully_paid") {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href={`/review?booking=${encodeURIComponent(booking.booking_code)}`}
          className="rounded-[16px] bg-[#ff8d28] px-5 py-4 text-center text-[14px] font-black text-white shadow-[0_14px_30px_rgba(255,141,40,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#e0751b]"
        >
          Đánh giá photographer
        </Link>

        <Link
          href="/bookings"
          className="rounded-[16px] border border-[#e2e8f0] bg-white px-5 py-4 text-center text-[14px] font-black text-[#334155] transition-all hover:border-[#ffcfaa] hover:text-[#ff8d28]"
        >
          Xem booking của tôi
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Link
        href="/bookings"
        className="rounded-[16px] bg-[#ff8d28] px-5 py-4 text-center text-[14px] font-black text-white shadow-[0_14px_30px_rgba(255,141,40,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#e0751b]"
      >
        Xem booking của tôi
      </Link>

      <Link
        href="/photographer"
        className="rounded-[16px] border border-[#e2e8f0] bg-white px-5 py-4 text-center text-[14px] font-black text-[#334155] transition-all hover:border-[#ffcfaa] hover:text-[#ff8d28]"
      >
        Chọn photographer khác
      </Link>
    </div>
  );
}

function LoadingScreen() {
  return (
    <main className="min-h-screen bg-[#f8fafc] px-5 py-12">
      <section className="mx-auto grid max-w-[1180px] gap-6 lg:grid-cols-[minmax(0,1fr)_390px]">
        <div className="overflow-hidden rounded-[30px] border border-[#e2e8f0] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="h-[230px] animate-pulse bg-[#111827]" />

          <div className="grid gap-5 p-6 sm:p-8">
            <div className="h-[110px] animate-pulse rounded-[24px] bg-[#eef2f7]" />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="h-[86px] animate-pulse rounded-[18px] bg-[#eef2f7]" />
              <div className="h-[86px] animate-pulse rounded-[18px] bg-[#eef2f7]" />
            </div>
            <div className="h-[100px] animate-pulse rounded-[22px] bg-[#eef2f7]" />
          </div>
        </div>

        <div className="hidden h-[520px] animate-pulse rounded-[30px] bg-white lg:block" />
      </section>
    </main>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f8fafc] px-5 text-[#0f172a]">
      <div className="w-full max-w-[520px] rounded-[28px] border border-red-100 bg-white p-7 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-red-50 text-[24px] font-black text-red-600">
          !
        </div>

        <h1 className="mt-5 text-[26px] font-black tracking-[-0.04em] text-[#0f172a]">
          Không thể mở booking
        </h1>

        <p className="mt-2 text-[14px] font-bold leading-6 text-red-600">
          {message}
        </p>

        <Link
          href="/photographer"
          className="mt-6 inline-flex rounded-[14px] bg-[#ff8d28] px-5 py-3 text-[14px] font-black text-white shadow-[0_12px_28px_rgba(255,141,40,0.2)]"
        >
          Quay lại photographer
        </Link>
      </div>
    </main>
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
    <div className="rounded-[18px] border border-[#eef2f7] bg-white p-4">
      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#94a3b8]">
        {label}
      </p>

      <p className="mt-2 break-words text-[15px] font-black text-[#111827]">
        {value}
      </p>
    </div>
  );
}

function MoneyCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[18px] border border-[#eef2f7] bg-white p-4">
      <p className="text-[12px] font-bold text-[#64748b]">{label}</p>

      <p className="mt-2 text-[18px] font-black text-[#111827]">
        {formatCurrency(value)}
      </p>
    </div>
  );
}

function ProgressItem({
  active,
  done,
  title,
  description,
}: {
  active: boolean;
  done: boolean;
  title: string;
  description: string;
}) {
  return (
    <div
      className={`rounded-[20px] border p-4 transition-all ${
        active
          ? "border-[#ffcfaa] bg-[#fff7ed]"
          : "border-[#eef2f7] bg-[#fbfcff]"
      }`}
    >
      <div className="flex gap-3">
        <span
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-[13px] font-black ${
            done
              ? "bg-[#ff8d28] text-white"
              : active
              ? "bg-white text-[#ff8d28]"
              : "bg-[#e2e8f0] text-[#94a3b8]"
          }`}
        >
          {done ? "✓" : "•"}
        </span>

        <div>
          <p
            className={`text-[14px] font-black ${
              active ? "text-[#0f172a]" : "text-[#64748b]"
            }`}
          >
            {title}
          </p>

          <p className="mt-1 text-[12px] font-semibold leading-5 text-[#64748b]">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}