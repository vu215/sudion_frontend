"use client";

import { FormEvent, Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type MessageItem = {
  id: number;
  booking_code: string;
  sender_id: string | null;
  sender_name: string;
  sender_role: string;
  receiver_id: string | null;
  message: string;
  is_read: number;
  created_at: string;
};

type BookingItem = {
  booking_code: string;
  photographer_name: string;
  service_name: string;
  customer_full_name: string;
  customer_email: string;
  customer_phone: string;
  status: string;
  shoot_date: string | null;
  shoot_time: string | null;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  error?: unknown;
};

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("vi-VN");
}

async function getBooking(bookingCode: string) {
  const response = await fetch(`${API_URL}/bookings/${bookingCode}`, {
    method: "GET",
    cache: "no-store",
  });

  const json: ApiResponse<BookingItem> = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.message || "Không tìm thấy booking.");
  }

  return json.data;
}

async function getMessages(bookingCode: string) {
  const response = await fetch(`${API_URL}/messages/${bookingCode}`, {
    method: "GET",
    cache: "no-store",
  });

  const json: ApiResponse<MessageItem[]> = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.message || "Không thể lấy tin nhắn.");
  }

  return json.data;
}

async function sendMessage(payload: {
  bookingCode: string;
  senderId: string | null;
  senderName: string;
  senderRole: string;
  receiverId: string | null;
  message: string;
}) {
  const response = await fetch(`${API_URL}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const json: ApiResponse<MessageItem> = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.message || "Không thể gửi tin nhắn.");
  }

  return json.data;
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#f8fafc]" />}>
      <MessagesContent />
    </Suspense>
  );
}

function MessagesContent() {
  const searchParams = useSearchParams();
  const bookingQuery = searchParams.get("booking") || "";

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const [bookingCode, setBookingCode] = useState(bookingQuery);
  const [booking, setBooking] = useState<BookingItem | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);

  const [senderName, setSenderName] = useState("");
  const [senderRole, setSenderRole] = useState("customer");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [pageError, setPageError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const savedName = window.localStorage.getItem("sudion_chat_name");
    const savedRole = window.localStorage.getItem("sudion_chat_role");

    if (savedName) {
      setSenderName(savedName);
    }

    if (savedRole) {
      setSenderRole(savedRole);
    }
  }, []);

  useEffect(() => {
    if (bookingQuery) {
      setBookingCode(bookingQuery);
      void handleLoadConversation(bookingQuery);
    }
  }, [bookingQuery]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const title = useMemo(() => {
    if (!booking) {
      return "Tin nhắn theo booking";
    }

    return `${booking.service_name} · ${booking.booking_code}`;
  }, [booking]);

  async function handleLoadConversation(targetCode = bookingCode) {
    try {
      const finalCode = targetCode.trim();

      if (!finalCode) {
        setPageError("Vui lòng nhập mã booking.");
        return;
      }

      setLoading(true);
      setPageError("");
      setSuccessMessage("");

      const [bookingData, messageData] = await Promise.all([
        getBooking(finalCode),
        getMessages(finalCode),
      ]);

      setBooking(bookingData);
      setMessages(messageData);
    } catch (error) {
      console.error("Lỗi tải chat:", error);
      setBooking(null);
      setMessages([]);
      setPageError(
        error instanceof Error ? error.message : "Không thể tải hội thoại."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await handleLoadConversation();
  }

  async function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const finalBookingCode = bookingCode.trim();
      const finalSenderName = senderName.trim();
      const finalMessage = message.trim();

      if (!finalBookingCode || !finalSenderName || !finalMessage) {
        setPageError("Vui lòng nhập mã booking, tên người gửi và nội dung.");
        return;
      }

      setSending(true);
      setPageError("");
      setSuccessMessage("");

      const newMessage = await sendMessage({
        bookingCode: finalBookingCode,
        senderId: null,
        senderName: finalSenderName,
        senderRole,
        receiverId: null,
        message: finalMessage,
      });

      setMessages((current) => [...current, newMessage]);
      setMessage("");

      window.localStorage.setItem("sudion_chat_name", finalSenderName);
      window.localStorage.setItem("sudion_chat_role", senderRole);
    } catch (error) {
      console.error("Lỗi gửi tin nhắn:", error);
      setPageError(
        error instanceof Error ? error.message : "Không thể gửi tin nhắn."
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#0f172a]">
      <section className="mx-auto grid w-full max-w-[1280px] gap-6 px-5 py-10 sm:px-6 lg:grid-cols-[340px_minmax(0,1fr)] lg:px-8 lg:py-14">
        <aside className="overflow-hidden rounded-[28px] border border-[#e2e8f0] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.06)] lg:sticky lg:top-[110px] lg:self-start">
          <div className="bg-[#111827] px-6 py-7 text-white">
            <p className="text-[12px] font-black uppercase tracking-[0.18em] text-[#ffb267]">
              Conversation
            </p>

            <h1 className="mt-3 text-[28px] font-black leading-tight tracking-[-0.04em]">
              Chat theo booking
            </h1>

            <p className="mt-3 text-[13px] font-medium leading-6 text-white/70">
              Khách và photographer trao đổi concept, lịch chụp và yêu cầu
              trước buổi chụp.
            </p>
          </div>

          <div className="p-5">
            <form onSubmit={handleSearch} className="grid gap-4">
              <label className="grid gap-2 text-[13px] font-extrabold text-[#0f172a]">
                Mã booking
                <input
                  value={bookingCode}
                  onChange={(event) => setBookingCode(event.target.value)}
                  placeholder="BK..."
                  className="min-h-[46px] rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] px-4 text-[14px] font-bold outline-none transition-all focus:border-[#ff8d28] focus:bg-white"
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="rounded-[14px] bg-[#ff8d28] px-4 py-3 text-[13px] font-black text-white shadow-[0_10px_24px_rgba(255,141,40,0.18)] transition-all hover:bg-[#e0751b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Đang tải..." : "Mở hội thoại"}
              </button>
            </form>

            {booking ? (
              <div className="mt-5 rounded-[18px] border border-[#eef2f7] bg-[#fbfcff] p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#94a3b8]">
                  Thông tin booking
                </p>

                <h2 className="mt-2 text-[18px] font-black leading-tight tracking-[-0.03em]">
                  {booking.service_name}
                </h2>

                <div className="mt-4 grid gap-2 text-[13px] font-semibold text-[#475569]">
                  <p>
                    Photographer:{" "}
                    <span className="font-black text-[#0f172a]">
                      {booking.photographer_name}
                    </span>
                  </p>

                  <p>
                    Khách:{" "}
                    <span className="font-black text-[#0f172a]">
                      {booking.customer_full_name}
                    </span>
                  </p>

                  <p>
                    Lịch:{" "}
                    <span className="font-black text-[#0f172a]">
                      {booking.shoot_date || "Chưa chọn"} ·{" "}
                      {booking.shoot_time || "Chưa chọn"}
                    </span>
                  </p>

                  <p>
                    Trạng thái:{" "}
                    <span className="font-black text-[#ff8d28]">
                      {booking.status}
                    </span>
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </aside>

        <section className="overflow-hidden rounded-[28px] border border-[#e2e8f0] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
          <div className="border-b border-[#eef2f7] bg-[#fbfcff] px-6 py-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[12px] font-black uppercase tracking-[0.16em] text-[#ff8d28]">
                  Messages
                </p>

                <h2 className="mt-1 text-[24px] font-black tracking-[-0.03em]">
                  {title}
                </h2>
              </div>

              <Link
                href="/bookings"
                className="inline-flex w-fit rounded-[12px] border border-[#e2e8f0] bg-white px-4 py-3 text-[13px] font-black text-[#334155] transition-all hover:border-[#ffcfaa] hover:text-[#ff8d28]"
              >
                Xem booking
              </Link>
            </div>
          </div>

          <div className="p-5">
            <div className="grid gap-4 rounded-[22px] border border-[#eef2f7] bg-[#f8fafc] p-4 sm:grid-cols-[minmax(0,1fr)_170px]">
              <label className="grid gap-2 text-[13px] font-extrabold text-[#0f172a]">
                Tên người gửi
                <input
                  value={senderName}
                  onChange={(event) => setSenderName(event.target.value)}
                  placeholder="Ví dụ: Minh Anh"
                  className="min-h-[44px] rounded-[14px] border border-[#e2e8f0] bg-white px-4 text-[14px] font-bold outline-none transition-all focus:border-[#ff8d28]"
                />
              </label>

              <label className="grid gap-2 text-[13px] font-extrabold text-[#0f172a]">
                Vai trò
                <select
                  value={senderRole}
                  onChange={(event) => setSenderRole(event.target.value)}
                  className="min-h-[44px] rounded-[14px] border border-[#e2e8f0] bg-white px-4 text-[14px] font-bold outline-none transition-all focus:border-[#ff8d28]"
                >
                  <option value="customer">Khách hàng</option>
                  <option value="photographer">Photographer</option>
                </select>
              </label>
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

            <div className="mt-5 h-[520px] overflow-y-auto rounded-[24px] border border-[#eef2f7] bg-[#fbfcff] p-4">
              {loading ? (
                <ChatSkeleton />
              ) : messages.length === 0 ? (
                <div className="grid h-full place-items-center text-center">
                  <div>
                    <h3 className="text-[22px] font-black tracking-[-0.03em]">
                      Chưa có tin nhắn
                    </h3>

                    <p className="mx-auto mt-2 max-w-[360px] text-[14px] font-semibold leading-6 text-[#64748b]">
                      Mở một booking và gửi tin nhắn đầu tiên để bắt đầu trao
                      đổi.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-3">
                  {messages.map((item) => {
                    const isMe =
                      item.sender_name.trim().toLowerCase() ===
                        senderName.trim().toLowerCase() &&
                      item.sender_role === senderRole;

                    return (
                      <div
                        key={item.id}
                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[78%] rounded-[20px] px-4 py-3 shadow-sm ${
                            isMe
                              ? "rounded-br-[6px] bg-[#ff8d28] text-white"
                              : "rounded-bl-[6px] border border-[#e2e8f0] bg-white text-[#0f172a]"
                          }`}
                        >
                          <div className="mb-1 flex items-center gap-2">
                            <span
                              className={`text-[11px] font-black ${
                                isMe ? "text-white/85" : "text-[#64748b]"
                              }`}
                            >
                              {item.sender_name}
                            </span>

                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                                isMe
                                  ? "bg-white/20 text-white"
                                  : "bg-[#f1f5f9] text-[#64748b]"
                              }`}
                            >
                              {item.sender_role}
                            </span>
                          </div>

                          <p className="whitespace-pre-wrap text-[14px] font-semibold leading-6">
                            {item.message}
                          </p>

                          <p
                            className={`mt-2 text-[10px] font-bold ${
                              isMe ? "text-white/70" : "text-[#94a3b8]"
                            }`}
                          >
                            {formatDateTime(item.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  <div ref={bottomRef} />
                </div>
              )}
            </div>

            <form onSubmit={handleSend} className="mt-4 flex gap-3">
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Nhập tin nhắn..."
                rows={2}
                className="min-h-[58px] flex-1 resize-none rounded-[18px] border border-[#e2e8f0] bg-white px-4 py-3 text-[14px] font-semibold outline-none transition-all focus:border-[#ff8d28]"
              />

              <button
                type="submit"
                disabled={sending}
                className="rounded-[18px] bg-[#111827] px-6 text-[13px] font-black text-white transition-all hover:bg-[#0f172a] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sending ? "Gửi..." : "Gửi"}
              </button>
            </form>
          </div>
        </section>
      </section>
    </main>
  );
}

function ChatSkeleton() {
  return (
    <div className="grid gap-4">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className={`h-[78px] animate-pulse rounded-[20px] bg-[#eef2f7] ${
            item % 2 === 0 ? "ml-auto w-[62%]" : "w-[70%]"
          }`}
        />
      ))}
    </div>
  );
}