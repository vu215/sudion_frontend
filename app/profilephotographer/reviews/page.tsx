"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/app/auth-context";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type Review = {
  id: number;
  booking_code: string;
  photographer_id: string;
  customer_name: string;
  customer_email: string;
  rating: number;
  comment: string;
  created_at: string;
};

type ApiResponse<T> = { success: boolean; message: string; data: T };

function fmtDate(v: string) {
  const d = new Date(v);
  return isNaN(d.getTime()) ? v : d.toLocaleDateString("vi-VN");
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} className={`h-4 w-4 ${s <= rating ? "text-orange-400" : "text-slate-200"}`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ))}
    </div>
  );
}

const AVT_COLORS = [
  "bg-orange-100 text-orange-600", "bg-blue-100 text-blue-600",
  "bg-emerald-100 text-emerald-600", "bg-purple-100 text-purple-600",
];

export default function PhotographerReviewsPage() {
  const { session, isPhotographer } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const photographerId = useMemo(() => {
    if (isPhotographer && session?.photographerId) return session.photographerId;
    if (typeof window !== "undefined") return window.localStorage.getItem("sudion_photographer_id") ?? "";
    return "";
  }, [isPhotographer, session]);

  useEffect(() => {
    if (!photographerId) return;
    setLoading(true);
    fetch(`${API_URL}/photographers/${photographerId}/reviews`, { cache: "no-store" })
      .then((r) => r.json())
      .then((json: ApiResponse<Review[]>) => {
        if (json.success) setReviews(json.data);
        else setError(json.message);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [photographerId]);

  const avgRating = useMemo(() => {
    if (!reviews.length) return 0;
    return Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10;
  }, [reviews]);

  const dist = useMemo(() => {
    const d: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => { d[r.rating] = (d[r.rating] ?? 0) + 1; });
    return d;
  }, [reviews]);

  return (
    <div className="px-5 py-6 lg:px-8">
      <div className="mx-auto max-w-[1000px] space-y-6 pb-10">
        {/* Header */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-orange-500">Đánh giá</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-800">Đánh giá từ khách hàng</h1>
          <p className="mt-1 text-sm text-slate-400">Tổng hợp phản hồi sau các buổi chụp đã hoàn tất.</p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</div>
        )}

        {/* Summary */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex items-center gap-5">
            <div className="text-center">
              <p className="text-5xl font-bold text-slate-800">{avgRating || "—"}</p>
              <Stars rating={Math.round(avgRating)} />
              <p className="mt-1 text-xs text-slate-400">{reviews.length} đánh giá</p>
            </div>
            <div className="flex-1 space-y-1.5">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-2">
                  <span className="w-3 text-xs text-slate-400">{star}</span>
                  <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-orange-400 transition-all"
                      style={{ width: reviews.length ? `${((dist[star] ?? 0) / reviews.length) * 100}%` : "0%" }}
                    />
                  </div>
                  <span className="w-5 text-xs text-slate-400 text-right">{dist[star] ?? 0}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Tổng đánh giá", value: reviews.length },
              { label: "5 sao", value: dist[5] ?? 0 },
              { label: "4 sao", value: dist[4] ?? 0 },
              { label: "Điểm TB", value: avgRating || "—" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm text-center">
                <p className="text-xs text-slate-400">{s.label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-800">{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-bold text-slate-800">Danh sách đánh giá</h2>
          </div>

          {loading ? (
            <div className="space-y-3 p-5">
              {[1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100" />)}
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-orange-100">
                <svg className="h-7 w-7 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <p className="text-base font-bold text-slate-700">Chưa có đánh giá nào</p>
              <p className="mt-1 text-sm text-slate-400">
                {photographerId ? "Đánh giá sẽ xuất hiện sau khi khách hoàn tất thanh toán." : "Nhập Photographer ID để xem dữ liệu."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {reviews.map((r, i) => (
                <div key={r.id} className="flex gap-4 px-5 py-4 hover:bg-slate-50 transition">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${AVT_COLORS[i % AVT_COLORS.length]}`}>
                    {r.customer_name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold text-slate-700">{r.customer_name}</p>
                      <span className="text-[10px] text-slate-400">{fmtDate(r.created_at)}</span>
                      <span className="text-[10px] font-mono text-slate-400">{r.booking_code}</span>
                    </div>
                    <div className="mt-1"><Stars rating={r.rating} /></div>
                    {r.comment && <p className="mt-1.5 text-sm leading-5 text-slate-500">{r.comment}</p>}
                  </div>
                  <div className="flex items-start">
                    <button
                      onClick={async () => {
                        if (!confirm("Xoá đánh giá này? (Việc này sẽ xoá booking có tiền cọc / chờ thanh toán nếu có.)")) return;
                        setLoading(true);
                        setError("");
                        try {
                          // Try to fetch booking to check status
                          const bRes = await fetch(`${API_URL}/bookings/${encodeURIComponent(r.booking_code)}`, { method: "GET", cache: "no-store" });
                          if (bRes.ok) {
                            const bJson = await bRes.json();
                            const booking = bJson && bJson.success && bJson.data ? bJson.data : null;
                            console.log("Booking for delete:", booking);
                            // Delete booking if status is in deposit/pending states (not completed/canceled)
                            const depositStatuses = ["pending", "accepted", "confirmed", "deposit", "awaiting_payment"];
                            if (booking && depositStatuses.includes(booking.status?.toLowerCase?.() || "")) {
                              console.log("Deleting booking with status:", booking.status);
                              const delRes = await fetch(`${API_URL}/bookings/${encodeURIComponent(r.booking_code)}`, { method: "DELETE" });
                              const delJson = await delRes.json().catch(() => null);
                              console.log("Delete booking result:", delJson);
                            }
                          }

                          // Delete the review itself
                          const res = await fetch(`${API_URL}/reviews/${r.id}`, { method: "DELETE" });
                          const json = await res.json().catch(() => null);
                          if (!res.ok || (json && json.success === false)) throw new Error((json && json.message) || "Không thể xoá đánh giá.");

                          setReviews((cur) => cur.filter((x) => x.id !== r.id));
                        } catch (e: any) {
                          setError(e?.message || String(e));
                        } finally {
                          setLoading(false);
                        }
                      }}
                      className="ml-3 rounded-md bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
                    >
                      Xoá
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
