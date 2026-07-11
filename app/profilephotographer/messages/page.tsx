"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  formatDate,
  getMyPhotographerProfile,
  getPhotographerBookings,
  type PhotographerBooking,
} from "../photographer-api";

const CHAT_STATUSES = ["confirmed", "completed", "fully_paid"];

export default function PhotographerMessagesPage() {
  const [bookings, setBookings] = useState<PhotographerBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        setError("");
        const profile = await getMyPhotographerProfile();
        const id = String(profile.photographer_id || profile.photographer?.id || "");
        const rows = id ? await getPhotographerBookings(id) : [];
        if (alive) setBookings(rows);
      } catch (err) {
        if (alive) setError(err instanceof Error ? err.message : "Không thể tải hội thoại.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    void load();
    return () => {
      alive = false;
    };
  }, []);

  const chatBookings = useMemo(() => {
    return bookings.filter((item) => CHAT_STATUSES.includes(item.status));
  }, [bookings]);

  return (
    <main className="px-6 py-7 lg:px-8 xl:px-10">
      <div className="mx-auto max-w-[1080px] space-y-6 pb-10">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a2e]">Tin nhắn</h1>
          <p className="mt-1 text-sm text-slate-500">
            Chat mở sau khi khách đã thanh toán cọc hoặc booking đã hoàn tất.
          </p>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">
            {error}
          </div>
        ) : null}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-20 animate-pulse rounded-2xl bg-slate-100" />
              ))
            ) : chatBookings.length ? (
              chatBookings.map((booking) => (
                <Link
                  key={booking.booking_code}
                  href={`/messages?booking=${encodeURIComponent(booking.booking_code)}`}
                  className="grid gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-orange-200 hover:bg-orange-50/40 sm:grid-cols-[1fr_auto]"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {booking.customer_full_name || "Khách hàng"}
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      {booking.booking_code} · {booking.service_name} · {formatDate(booking.shoot_date)}
                    </p>
                  </div>
                  <span className="h-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                    Chat đang mở
                  </span>
                </Link>
              ))
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-600">
                Chưa có hội thoại đang mở. Khi khách đặt lịch và thanh toán cọc, cuộc trò chuyện sẽ xuất hiện tại đây.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
