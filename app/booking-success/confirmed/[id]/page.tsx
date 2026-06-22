"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getBookingFromBackend,
  type BackendBooking,
} from "../../services/booking-api";

function formatDate(value: string | null) {
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

function formatTimeRange(value: string | null) {
  if (!value) {
    return "Chưa chọn";
  }

  const cleanValue = String(value).slice(0, 5);
  const [hour = "0", minute = "0"] = cleanValue.split(":");
  const endHour = Number(hour) + 2;

  return `${cleanValue} - ${String(endHour).padStart(2, "0")}:${minute}`;
}

export default function BookingSuccessConfirmedPage({
  params,
}: {
  params: { id: string };
}) {
  const bookingCode = params.id;

  const [booking, setBooking] = useState<BackendBooking | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchBooking() {
      try {
        setError("");

        if (!bookingCode) {
          setBooking(null);
          return;
        }

        const data = await getBookingFromBackend(bookingCode);
        setBooking(data);
      } catch (err) {
        console.error("Không tìm thấy booking:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Không tìm thấy booking trong backend."
        );
        setBooking(null);
      } finally {
        setHasLoaded(true);
      }
    }

    fetchBooking();
  }, [bookingCode]);

  if (!hasLoaded) {
    return <main className="min-h-screen bg-[#fafbfc]" />;
  }

  if (!booking) {
    return (
      <main className="min-h-screen bg-[#fafbfc] text-[#0e111d]">
        <section className="mx-auto grid w-full max-w-[860px] gap-5 px-6 py-20 md:px-12 lg:px-20">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-[#fff7ef] text-[#ff8d28]">
            <span className="text-2xl font-black">?</span>
          </div>

          <p className="text-[12px] font-black uppercase tracking-[0.18em] text-[#ff8d28]">
            Không tìm thấy booking
          </p>

          <h1 className="max-w-[680px] text-[38px] font-black leading-[1.08] tracking-[-0.03em] text-[#0e111d] sm:text-[48px]">
            Mã booking không tồn tại trong backend
          </h1>

          <p className="max-w-[620px] text-[16px] font-medium leading-7 text-[#4b5563] sm:text-[18px]">
            {error ||
              "Vui lòng kiểm tra lại đường dẫn xác nhận hoặc tạo booking mới."}
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/booking"
              className="rounded-lg bg-[#ff8d28] px-5 py-3 text-[14px] font-bold text-white shadow-[0_6px_14px_rgba(255,141,40,0.15)] transition-all hover:translate-y-[-1px] hover:bg-[#e0751b]"
            >
              Tạo booking mới
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f7fb] text-[#0e111d]">
      <section className="mx-auto w-full max-w-[760px] px-6 py-20">
        <div className="mx-auto w-full rounded-[20px] bg-white p-8 shadow-[0_20px_40px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 grid h-20 w-20 place-items-center rounded-full bg-[#eef4ff]">
              <span className="text-3xl font-black text-[#ff8d28]">✓</span>
            </div>

            <h1 className="text-[26px] font-black">
              Đặt lịch thành công!
            </h1>

            <p className="mt-3 max-w-[620px] text-[15px] text-[#475569]">
              Chúc mừng! Lịch hẹn của bạn đã được xác nhận. Chúng tôi đã lưu
              thông tin đặt lịch vào hệ thống.
            </p>

            <div className="relative mt-8 w-full rounded-[12px] border border-[#eef0f5] bg-white p-6 shadow-sm">
              <div className="absolute right-6 top-6 font-black text-[#ff8d28]">
                {booking.booking_code}
              </div>

              <div className="flex items-center gap-4">
                <img
                  src={
                    booking.reference_file_name
                      ? `/uploads/${booking.reference_file_name}`
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          booking.photographer_name
                        )}&background=ffffff&color=333&size=128`
                  }
                  alt={booking.photographer_name}
                  className="h-20 w-20 rounded-lg object-cover"
                />

                <div className="min-w-0">
                  <p className="text-[16px] font-black">
                    {booking.photographer_name}
                  </p>

                  <p className="mt-1 text-[13px] font-extrabold text-[#ff8d28]">
                    ★ 4.9 (120 đánh giá)
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 rounded-[8px] bg-[#fffaf5] p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-[#fff3e6] p-2 text-[#ff8d28]">
                    📅
                  </div>

                  <div>
                    <div className="text-[13px] font-semibold">Ngày hẹn</div>
                    <div className="text-[13px] text-[#475569]">
                      {formatDate(booking.shoot_date)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-[#fff3e6] p-2 text-[#ff8d28]">
                    ⏰
                  </div>

                  <div>
                    <div className="text-[13px] font-semibold">Thời gian</div>
                    <div className="text-[13px] text-[#475569]">
                      {formatTimeRange(booking.shoot_time)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-[#fff3e6] p-2 text-[#ff8d28]">
                    🎞️
                  </div>

                  <div>
                    <div className="text-[13px] font-semibold">
                      Gói dịch vụ
                    </div>
                    <div className="text-[13px] text-[#475569]">
                      {booking.service_name}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-[#fff3e6] p-2 text-[#ff8d28]">
                    📍
                  </div>

                  <div>
                    <div className="text-[13px] font-semibold">Địa điểm</div>
                    <div className="text-[13px] text-[#475569]">
                      {booking.location || "Chưa chọn"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-[#fff3e6] p-2 text-[#ff8d28]">
                    ✅
                  </div>

                  <div>
                    <div className="text-[13px] font-semibold">
                      Trạng thái
                    </div>
                    <div className="text-[13px] font-bold text-[#16a34a]">
                      {booking.status === "confirmed"
                        ? "Đã thanh toán"
                        : "Đang chờ thanh toán"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href={`/messages?with=${encodeURIComponent(
                    booking.photographer_id
                  )}&bookingId=${encodeURIComponent(booking.booking_code)}`}
                  className="inline-flex items-center gap-2 rounded-[10px] bg-[#ff8d28] px-5 py-3 text-[14px] font-black text-white shadow-md"
                >
                  <span>💬</span>
                  <span>Nhắn tin ngay</span>
                </Link>

                <Link
                  href="/bookings"
                  className="inline-flex items-center justify-center rounded-[10px] border border-[#e8eaf1] bg-white px-5 py-3 text-[14px] font-extrabold text-[#475569]"
                >
                  Xem chi tiết đơn đặt
                </Link>
              </div>

              <div className="mt-6 border-t border-[#f1f3f7] pt-4 text-center">
                <Link href="/" className="text-[13px] text-[#2563eb]">
                  ← Quay lại Trang chủ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}