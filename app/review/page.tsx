"use client";

import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type BackendBooking = {
  booking_code: string;
  photographer_id: string;
  photographer_name: string;
  service_name: string;
  status: string;
  customer_full_name: string;
  customer_email: string;
  shoot_date: string | null;
  shoot_time: string | null;
  estimated_total: number;
};

type ReviewItem = {
  id: number;
  booking_code: string;
  photographer_id: string;
  customer_email: string;
  customer_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  error?: unknown;
};

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

async function getBooking(bookingCode: string) {
  const response = await fetch(`${API_URL}/bookings/${bookingCode}`, {
    method: "GET",
    cache: "no-store",
  });

  const json: ApiResponse<BackendBooking> = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.message || "Không tìm thấy booking.");
  }

  return json.data;
}

async function getReviewByBooking(bookingCode: string) {
  const response = await fetch(`${API_URL}/reviews/booking/${bookingCode}`, {
    method: "GET",
    cache: "no-store",
  });

  const json: ApiResponse<ReviewItem | null> = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.message || "Không thể lấy review.");
  }

  return json.data;
}

async function createReview(payload: {
  bookingCode: string;
  rating: number;
  comment: string;
}) {
  const response = await fetch(`${API_URL}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const json: ApiResponse<ReviewItem> = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.message || "Không thể gửi đánh giá.");
  }

  return json.data;
}

export default function ReviewPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#f8fafc]" />}>
      <ReviewContent />
    </Suspense>
  );
}

function ReviewContent() {
  const searchParams = useSearchParams();
  const bookingQuery = searchParams.get("booking") || "";

  const [bookingCode, setBookingCode] = useState(bookingQuery);
  const [booking, setBooking] = useState<BackendBooking | null>(null);
  const [existingReview, setExistingReview] = useState<ReviewItem | null>(null);

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pageError, setPageError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (bookingQuery) {
      setBookingCode(bookingQuery);
      void handleLoadReview(bookingQuery);
    }
  }, [bookingQuery]);

  const canReview = booking?.status === "completed" && !existingReview;

  const ratingLabel = useMemo(() => {
    const value = hoverRating || rating;

    if (value === 5) return "Tuyệt vời";
    if (value === 4) return "Rất tốt";
    if (value === 3) return "Ổn";
    if (value === 2) return "Chưa tốt";
    return "Cần cải thiện";
  }, [hoverRating, rating]);

  async function handleLoadReview(targetCode = bookingCode) {
    try {
      const finalCode = targetCode.trim();

      if (!finalCode) {
        setPageError("Vui lòng nhập mã booking.");
        return;
      }

      setLoading(true);
      setPageError("");
      setSuccessMessage("");

      const [bookingData, reviewData] = await Promise.all([
        getBooking(finalCode),
        getReviewByBooking(finalCode),
      ]);

      setBooking(bookingData);
      setExistingReview(reviewData);
    } catch (error) {
      console.error("Lỗi tải review:", error);
      setBooking(null);
      setExistingReview(null);
      setPageError(
        error instanceof Error ? error.message : "Không thể tải đánh giá."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await handleLoadReview();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!booking) {
      setPageError("Vui lòng tải booking trước khi đánh giá.");
      return;
    }

    try {
      setSubmitting(true);
      setPageError("");
      setSuccessMessage("");

      const review = await createReview({
        bookingCode: booking.booking_code,
        rating,
        comment: comment.trim(),
      });

      setExistingReview(review);
      setSuccessMessage("Cảm ơn bạn! Đánh giá đã được gửi thành công.");
    } catch (error) {
      console.error("Lỗi gửi review:", error);
      setPageError(
        error instanceof Error ? error.message : "Không thể gửi đánh giá."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#0f172a]">
      <section className="mx-auto w-full max-w-[1120px] px-5 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="overflow-hidden rounded-[32px] border border-[#e2e8f0] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
          <div className="relative overflow-hidden bg-[#111827] px-6 py-9 text-white sm:px-8 lg:px-10">
            <div className="absolute right-[-120px] top-[-120px] h-[320px] w-[320px] rounded-full bg-[#ff8d28]/25 blur-3xl" />
            <div className="absolute bottom-[-150px] left-[18%] h-[300px] w-[300px] rounded-full bg-white/10 blur-3xl" />

            <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-end">
              <div>
                <p className="text-[12px] font-black uppercase tracking-[0.18em] text-[#ffb267]">
                  Review
                </p>

                <h1 className="mt-3 text-[36px] font-black leading-[1.04] tracking-[-0.05em] sm:text-[50px]">
                  Đánh giá photographer
                </h1>

                <p className="mt-4 max-w-[680px] text-[14px] font-medium leading-7 text-white/70">
                  Sau khi booking hoàn thành, khách hàng có thể gửi đánh giá để
                  giúp cộng đồng chọn photographer phù hợp hơn.
                </p>
              </div>

              <form
                onSubmit={handleSearch}
                className="rounded-[20px] border border-white/10 bg-white/10 p-3 backdrop-blur-md"
              >
                <label className="grid gap-2">
                  <span className="px-1 text-[12px] font-extrabold text-white/80">
                    Mã booking
                  </span>

                  <span className="flex gap-2 rounded-[14px] bg-white p-2">
                    <input
                      value={bookingCode}
                      onChange={(event) => setBookingCode(event.target.value)}
                      placeholder="BK..."
                      className="min-h-[44px] flex-1 border-0 bg-transparent px-3 text-[14px] font-bold text-[#111827] outline-none placeholder:text-[#9ca3af]"
                    />

                    <button
                      type="submit"
                      disabled={loading}
                      className="rounded-[12px] bg-[#ff8d28] px-4 text-[13px] font-black text-white shadow-[0_10px_24px_rgba(255,141,40,0.3)] transition-all hover:bg-[#e0751b] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? "Đang tải" : "Tải"}
                    </button>
                  </span>
                </label>
              </form>
            </div>
          </div>

          <div className="grid gap-6 p-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:p-8">
            <aside className="rounded-[24px] border border-[#e2e8f0] bg-[#fbfcff] p-5">
              <p className="text-[12px] font-black uppercase tracking-[0.16em] text-[#ff8d28]">
                Booking info
              </p>

              {booking ? (
                <div className="mt-4 grid gap-4">
                  <div>
                    <h2 className="text-[22px] font-black leading-tight tracking-[-0.03em]">
                      {booking.service_name}
                    </h2>

                    <p className="mt-2 text-[13px] font-bold text-[#64748b]">
                      {booking.booking_code}
                    </p>
                  </div>

                  <InfoRow label="Photographer" value={booking.photographer_name} />
                  <InfoRow label="Khách hàng" value={booking.customer_full_name} />
                  <InfoRow
                    label="Ngày chụp"
                    value={`${formatDate(booking.shoot_date)} · ${
                      booking.shoot_time || "Chưa chọn"
                    }`}
                  />
                  <InfoRow label="Tổng tiền" value={formatCurrency(booking.estimated_total)} />
                  <InfoRow label="Trạng thái" value={booking.status} />

                  <Link
                    href="/bookings"
                    className="mt-2 rounded-[14px] border border-[#e2e8f0] bg-white px-4 py-3 text-center text-[13px] font-black text-[#334155] transition-all hover:border-[#ffcfaa] hover:text-[#ff8d28]"
                  >
                    Quay lại booking
                  </Link>
                </div>
              ) : (
                <p className="mt-4 text-[14px] font-semibold leading-6 text-[#64748b]">
                  Nhập mã booking để tải thông tin và đánh giá.
                </p>
              )}
            </aside>

            <section className="rounded-[24px] border border-[#e2e8f0] bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.04)]">
              {pageError ? (
                <div className="rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-bold text-red-600">
                  {pageError}
                </div>
              ) : null}

              {successMessage ? (
                <div className="rounded-[16px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] font-bold text-emerald-700">
                  {successMessage}
                </div>
              ) : null}

              {loading ? (
                <ReviewSkeleton />
              ) : existingReview ? (
                <div className="grid place-items-center py-10 text-center">
                  <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#fff7ed] text-[#ff8d28]">
                    ★
                  </div>

                  <h2 className="mt-5 text-[28px] font-black tracking-[-0.04em]">
                    Booking này đã được đánh giá
                  </h2>

                  <div className="mt-4 flex justify-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`text-[28px] ${
                          star <= existingReview.rating
                            ? "text-[#ff8d28]"
                            : "text-[#cbd5e1]"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>

                  <p className="mt-4 max-w-[520px] text-[15px] font-semibold leading-7 text-[#475569]">
                    {existingReview.comment || "Khách chưa nhập nhận xét."}
                  </p>
                </div>
              ) : booking && booking.status !== "completed" ? (
                <div className="grid place-items-center py-10 text-center">
                  <h2 className="text-[28px] font-black tracking-[-0.04em]">
                    Chưa thể đánh giá
                  </h2>

                  <p className="mt-3 max-w-[520px] text-[15px] font-semibold leading-7 text-[#64748b]">
                    Booking chỉ được đánh giá sau khi photographer đánh dấu
                    trạng thái là <span className="font-black">completed</span>.
                  </p>

                  <Link
                    href={`/booking-success/confirmed?id=${encodeURIComponent(
                      booking.booking_code
                    )}`}
                    className="mt-6 rounded-[14px] bg-[#111827] px-5 py-3 text-[13px] font-black text-white transition-all hover:bg-[#0f172a]"
                  >
                    Xem chi tiết booking
                  </Link>
                </div>
              ) : booking && canReview ? (
                <form onSubmit={handleSubmit} className="grid gap-6">
                  <div>
                    <p className="text-[12px] font-black uppercase tracking-[0.16em] text-[#ff8d28]">
                      Rating
                    </p>

                    <h2 className="mt-2 text-[30px] font-black tracking-[-0.04em]">
                      Bạn hài lòng với buổi chụp không?
                    </h2>

                    <p className="mt-2 text-[14px] font-semibold leading-6 text-[#64748b]">
                      Đánh giá của bạn sẽ giúp photographer cải thiện dịch vụ.
                    </p>
                  </div>

                  <div className="rounded-[24px] border border-[#eef2f7] bg-[#fbfcff] p-6 text-center">
                    <div className="flex justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const active = star <= (hoverRating || rating);

                        return (
                          <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(star)}
                            className={`text-[42px] leading-none transition-all hover:scale-110 ${
                              active ? "text-[#ff8d28]" : "text-[#cbd5e1]"
                            }`}
                            aria-label={`${star} sao`}
                          >
                            ★
                          </button>
                        );
                      })}
                    </div>

                    <p className="mt-3 text-[18px] font-black text-[#0f172a]">
                      {ratingLabel}
                    </p>
                  </div>

                  <label className="grid gap-2 text-[13px] font-extrabold text-[#0f172a]">
                    Nhận xét của bạn
                    <textarea
                      value={comment}
                      onChange={(event) => setComment(event.target.value)}
                      placeholder="Ví dụ: Photographer rất nhiệt tình, ảnh đẹp, đúng concept..."
                      rows={6}
                      className="min-h-[160px] rounded-[18px] border border-[#e2e8f0] bg-[#fbfcff] px-4 py-3 text-[14px] font-semibold leading-6 outline-none transition-all focus:border-[#ff8d28] focus:bg-white"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-[16px] bg-[#ff8d28] px-5 py-4 text-[14px] font-black text-white shadow-[0_12px_28px_rgba(255,141,40,0.18)] transition-all hover:-translate-y-0.5 hover:bg-[#e0751b] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                  >
                    {submitting ? "Đang gửi đánh giá..." : "Gửi đánh giá"}
                  </button>
                </form>
              ) : (
                <div className="grid place-items-center py-10 text-center">
                  <h2 className="text-[28px] font-black tracking-[-0.04em]">
                    Nhập mã booking để bắt đầu
                  </h2>

                  <p className="mt-3 max-w-[520px] text-[15px] font-semibold leading-7 text-[#64748b]">
                    Bạn có thể mở trang này từ nút Đánh giá trong danh sách
                    booking sau khi lịch đã hoàn thành.
                  </p>
                </div>
              )}
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[16px] border border-[#eef2f7] bg-white px-4 py-3">
      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#94a3b8]">
        {label}
      </p>

      <p className="mt-1 text-[14px] font-black text-[#0f172a]">{value}</p>
    </div>
  );
}

function ReviewSkeleton() {
  return (
    <div className="animate-pulse py-10">
      <div className="h-8 w-[260px] rounded-full bg-[#eef2f7]" />
      <div className="mt-4 h-12 w-[70%] rounded-full bg-[#eef2f7]" />
      <div className="mt-8 h-[180px] rounded-[24px] bg-[#eef2f7]" />
      <div className="mt-6 h-[160px] rounded-[18px] bg-[#eef2f7]" />
    </div>
  );
}