"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getBookingById } from "../booking-store";

function formatTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const withId = searchParams.get("with") || "";
  const bookingId = searchParams.get("bookingId") || "";

  const [booking, setBooking] = useState<any | null>(null);
  const [messages, setMessages] = useState<Array<any>>([]);
  const [text, setText] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);

  const convKey = `chat:${withId}:${bookingId}`;

  useEffect(() => {
    if (bookingId) {
      setBooking(getBookingById(bookingId));
    }
  }, [bookingId]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(convKey);
      setMessages(raw ? JSON.parse(raw) : []);
    } catch (e) {
      setMessages([]);
    }
  }, [convKey]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: 99999, behavior: "smooth" });
  }, [messages]);

  function persist(next: Array<any>) {
    try {
      window.localStorage.setItem(convKey, JSON.stringify(next));
    } catch {}
    setMessages(next);
  }

  function handleSend() {
    const body = text.trim();
    if (!body) return;
    const msg = { id: Date.now().toString(), sender: "user", text: body, ts: Date.now() };
    const next = [...messages, msg];
    persist(next);
    setText("");

    // Simulate auto-reply from photographer
    setTimeout(() => {
      const reply = { id: (Date.now() + 1).toString(), sender: "photographer", text: "Cám ơn! Tôi đã nhận được tin nhắn, sẽ trả lời sớm.", ts: Date.now() };
      persist([...next, reply]);
    }, 700);
  }

  return (
    <main className="min-h-screen bg-[#fafbfc] text-[#0e111d]">
      <section className="mx-auto w-full max-w-[960px] px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#ff8d28]">Tin nhắn</p>
            <h1 className="mt-2 text-[26px] font-black">Trao đổi với nhiếp ảnh gia</h1>
            <p className="mt-2 text-[14px] text-[#6b7280]">Nối cuộc trò chuyện giữa khách hàng và nhiếp ảnh gia cho booking {bookingId}</p>
          </div>
          <div>
            <Link href="/bookings" className="rounded-lg border border-[#e8eaf1] bg-white px-4 py-2 text-sm font-semibold text-[#475569]">Quay lại</Link>
          </div>
        </div>

        <div className="grid gap-4 rounded-[12px] border border-[#eef0f5] bg-white p-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#f3f4f6]">
              <img src={booking?.referenceFileName ? `/uploads/${booking.referenceFileName}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(booking?.photographerName ?? "Photographer")}&background=ffffff&color=333&size=128`} alt={booking?.photographerName || "Photographer"} className="h-full w-full object-cover" />
            </div>
            <div>
              <div className="text-[16px] font-black">{booking?.photographerName ?? "Nhiếp ảnh gia"}</div>
              <div className="text-[13px] text-[#6b7280]">{booking?.serviceName ?? "Dịch vụ"}</div>
            </div>
          </div>

          <div ref={listRef} className="max-h-[420px] overflow-auto px-3 py-4">
            {messages.length === 0 ? (
              <div className="text-center text-[13px] text-[#6b7280]">Chưa có tin nhắn. Bắt đầu cuộc trò chuyện với nhiếp ảnh gia.</div>
            ) : (
              messages.map((m) => (
                <div key={m.id} className={`mb-3 flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`${m.sender === "user" ? "bg-[#ff8d28] text-white" : "bg-[#f1f5f9] text-[#0f172a]"} max-w-[72%] rounded-[12px] px-4 py-2 text-[14px]`}>
                    <div>{m.text}</div>
                    <div className="mt-1 text-right text-[11px] opacity-70">{formatTime(m.ts)}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-2 flex gap-3">
            <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Nhập tin nhắn..." className="min-h-[48px] w-full resize-none rounded-md border border-[#e8eef7] px-3 py-2 text-sm"></textarea>
            <button onClick={handleSend} className="rounded-md bg-[#ff8d28] px-4 py-2 font-black text-white">Gửi</button>
          </div>
        </div>
      </section>
    </main>
  );
}
