"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllBookings, saveBooking, deleteBooking, type StoredBooking } from "../booking-store";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<StoredBooking[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setBookings(getAllBookings());
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  function handleCancel(id: string) {
    if (!window.confirm("Bạn có chắc muốn hủy booking này?")) return;
    const target = bookings.find((b) => b.id === id);
    if (!target) return;
    const updated: StoredBooking = { ...target, status: "cancelled" } as StoredBooking;
    saveBooking(updated);
    setBookings((prev) => prev.map((p) => (p.id === id ? updated : p)));
  }

  function handleDelete(id: string) {
    if (!window.confirm("Xóa booking sẽ không thể khôi phục. Tiếp tục?")) return;
    deleteBooking(id);
    setBookings((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <main className="min-h-screen bg-[#fafbfc] text-[#0e111d]">
      <section className="mx-auto w-full max-w-[980px] px-6 py-10">
        <div className="mb-6">
          <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#ff8d28]">Lịch đặt của tôi</p>
          <h1 className="mt-2 text-[26px] font-black">Danh sách booking</h1>
          <p className="mt-2 text-[14px] text-[#6b7280]">Các booking được lưu cục bộ sẽ hiển thị tại đây.</p>
        </div>

        {bookings.length === 0 ? (
          <div className="rounded-md border border-[#eef0f5] bg-white p-6 text-center">
            <p className="text-[15px] text-[#6b7280]">Không có booking nào trong trình duyệt này.</p>
            <div className="mt-4">
              <Link href="/booking" className="inline-flex items-center justify-center rounded-lg bg-[#ff8d28] px-4 py-2 text-sm font-black text-white">Tạo booking mới</Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {bookings.map((b) => (
              <div key={b.id} className="rounded-md border border-[#eef0f5] bg-white p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[13px] text-[#6b7280]">Mã đặt lịch</p>
                    <p className="text-[16px] font-black">{b.id}</p>
                    <p className="mt-1 text-[14px] text-[#475569]">{b.photographerName} — {b.serviceName}</p>
                    <p className="mt-1 text-[13px] text-[#6b7280]">{b.shootDate} • {b.shootTime}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className={`rounded-full px-3 py-1 text-[12px] font-bold ${b.status === 'confirmed' ? 'bg-[#eaf8f1] text-[#047857]' : b.status === 'cancelled' ? 'bg-[#fff1f2] text-[#b91c1c]' : 'bg-[#fff4e6] text-[#ff8d28]'}`}>
                      {b.status}
                    </div>
                    <div className="flex items-center gap-3">
                      <Link href={`/booking-success/confirmed?id=${encodeURIComponent(b.id)}`} className="text-[13px] font-extrabold text-[#ff8d28]">Xem chi tiết</Link>
                      {b.status !== 'cancelled' ? (
                        <button onClick={() => handleCancel(b.id)} className="text-[13px] text-[#b91c1c] underline">Hủy lịch</button>
                      ) : (
                        <span className="text-[13px] text-[#6b7280]">Đã hủy</span>
                      )}
                      <button onClick={() => handleDelete(b.id)} className="ml-1 inline-flex items-center gap-2 rounded-[8px] border border-[#fca5a5] bg-white px-3 py-1 text-[13px] font-semibold text-[#b91c1c] hover:bg-[#fff1f2]">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H3a1 1 0 100 2h14a1 1 0 100-2h-2V3a1 1 0 00-1-1H6zm2 6a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 10-2 0v6a1 1 0 102 0V8z" clipRule="evenodd" />
                        </svg>
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
