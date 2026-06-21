"use client";

import Link from "next/link";
import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/auth-context";
import { useToast } from "@/app/toast-context";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const AUTO_REFRESH_MS = 3000;

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
  service_name: string;
  shoot_date: string | null;
  shoot_time: string | null;
  status: BookingStatus;
  customer_full_name: string;
  customer_email: string;
  customer_phone: string;
};

type ChatMessage = {
  id: number;
  booking_code: string;
  sender_id: string | null;
  sender_name: string;
  sender_role: "customer" | "photographer" | string;
  receiver_id: string | null;
  message: string;
  is_read: number;
  created_at: string;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  error?: unknown;
};

type StatusInfo = {
  label: string;
  description: string;
  className: string;
  dot: string;
};

const statusMap: Record<string, StatusInfo> = {
  awaiting_payment: {
    label: "Chờ xác nhận",
    description: "Photographer chưa xác nhận booking. Kiểm tra đơn và xử lý.",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },
  accepted: {
    label: "Đã đồng ý",
    description: "Booking đã được đồng ý. Chờ khách thanh toán cọc.",
    className: "border-blue-200 bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
  },
  confirmed: {
    label: "Đã cọc",
    description: "Khách đã thanh toán cọc. Chuẩn bị buổi chụp.",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  completed: {
    label: "Đã chụp xong",
    description: "Buổi chụp đã hoàn thành. Chờ khách thanh toán phần còn lại.",
    className: "border-purple-200 bg-purple-50 text-purple-700",
    dot: "bg-purple-500",
  },
  fully_paid: {
    label: "Đã thanh toán đủ",
    description: "Chat đã mở. Hai bên có thể trao đổi để hoàn tất dịch vụ.",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  rejected: {
    label: "Đã từ chối",
    description: "Booking bị từ chối nên không thể chat.",
    className: "border-red-200 bg-red-50 text-red-700",
    dot: "bg-red-500",
  },
  cancelled: {
    label: "Đã hủy",
    description: "Booking đã hủy. Chat không khả dụng.",
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

function formatDate(value: string | null) {
  if (!value) return "Chưa chọn";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("vi-VN");
}

function formatTime(value: string | null) {
  if (!value) return "Chưa chọn";
  return String(value).slice(0, 5);
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

async function getBooking(bookingCode: string) {
  const response = await fetch(`${API_URL}/bookings/${bookingCode}`, {
    method: "GET",
    cache: "no-store",
  });

  const json: ApiResponse<BackendBooking> = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.message || "Không thể lấy thông tin booking.");
  }

  return json.data;
}

async function getMessages(bookingCode: string) {
  const response = await fetch(
    `${API_URL}/messages/${encodeURIComponent(bookingCode)}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  const json: ApiResponse<ChatMessage[]> = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.message || "Không thể lấy tin nhắn.");
  }

  return json.data;
}

async function sendMessage(payload: {
  bookingCode: string;
  senderId: string;
  senderName: string;
  senderRole: "customer" | "photographer";
  receiverId?: string | null;
  message: string;
}) {
  const response = await fetch(`${API_URL}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const json: ApiResponse<ChatMessage> = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.message || "Không thể gửi tin nhắn.");
  }

  return json.data;
}

export default function PhotographerMessagesPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <MessagesContent />
    </Suspense>
  );
}

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const { session } = useAuth();

  const queryBookingCode = searchParams.get("booking") || "";

  const [bookingCode, setBookingCode] = useState(queryBookingCode);
  const [activeBookingCode, setActiveBookingCode] = useState(queryBookingCode);
  const [booking, setBooking] = useState<BackendBooking | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const [pageError, setPageError] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const currentRole: "customer" | "photographer" =
    session?.role === "photographer" ? "photographer" : "photographer";

  const senderName = session?.fullName || "Photographer";
  const senderId =
    session?.photographerId || session?.userId || session?.email || "photographer";

  const canChat = booking?.status === "fully_paid";

  const statusInfo = useMemo(
    () => getStatusInfo(booking?.status || "awaiting_payment"),
    [booking?.status]
  );

  const otherSideName = useMemo(
    () => booking?.customer_full_name || "Khách hàng",
    [booking]
  );

  const receiverId = useMemo(
    () => booking?.customer_email || null,
    [booking]
  );

  useEffect(() => {
    setBookingCode(queryBookingCode);
    setActiveBookingCode(queryBookingCode);
  }, [queryBookingCode]);

  useEffect(() => {
    if (!activeBookingCode) return;

    let active = true;

    async function loadData(showLoading = true) {
      try {
        if (showLoading) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setPageError("");

        const [bookingData, messageData] = await Promise.all([
          getBooking(activeBookingCode),
          getMessages(activeBookingCode),
        ]);

        if (!active) return;

        setBooking(bookingData);
        setMessages(messageData);
      } catch (error) {
        if (!active) return;
        console.error("Lỗi tải chat:", error);
        setBooking(null);
        setMessages([]);
        const message =
          error instanceof Error
            ? error.message
            : "Không thể tải phòng chat.";
        setPageError(message);
        toast.error("Không thể tải phòng chat", message);
      } finally {
        if (!active) return;
        setLoading(false);
        setRefreshing(false);
      }
    }

    void loadData(true);

    const timer = window.setInterval(() => {
      void loadData(false);
    }, AUTO_REFRESH_MS);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [activeBookingCode, toast]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  function handleSearchBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const finalCode = bookingCode.trim();

    if (!finalCode) {
      setPageError("Vui lòng nhập mã booking.");
      toast.warning("Thiếu mã booking", "Vui lòng nhập mã booking để mở chat.");
      return;
    }

    setActiveBookingCode(finalCode);
    router.push(`/profilephotographer/messages?booking=${encodeURIComponent(finalCode)}`);
  }

  async function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!booking) {
      setPageError("Chưa có booking để gửi tin nhắn.");
      toast.warning("Chưa có booking", "Vui lòng mở booking trước khi chat.");
      return;
    }

    if (!canChat) {
      setPageError("Chỉ có thể chat sau khi booking đã thanh toán đủ.");
      toast.warning(
        "Chat chưa mở",
        "Booking cần thanh toán đủ trước khi nhắn tin."
      );
      return;
    }

    const cleanMessage = messageText.trim();
    if (!cleanMessage) {
      setPageError("Vui lòng nhập nội dung tin nhắn.");
      return;
    }

    try {
      setSending(true);
      setPageError("");

      const newMessage = await sendMessage({
        bookingCode: booking.booking_code,
        senderId: String(senderId),
        senderName,
        senderRole: currentRole,
        receiverId,
        message: cleanMessage,
      });

      setMessages((current) => [...current, newMessage]);
      setMessageText("");
      toast.success("Đã gửi tin nhắn", "Tin nhắn của bạn đã được gửi.");
    } catch (error) {
      console.error("Lỗi gửi tin nhắn:", error);
      const message =
        error instanceof Error ? error.message : "Không thể gửi tin nhắn.";
      setPageError(message);
      toast.error("Gửi tin nhắn thất bại", message);
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#0f172a]">
      <section className="mx-auto w-full max-w-[1240px] px-5 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="overflow-hidden rounded-[32px] border border-[#e2e8f0] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.07)]">
          <HeaderSearch
            bookingCode={bookingCode}
            loading={loading}
            onBookingCodeChange={setBookingCode}
            onSubmit={handleSearchBooking}
          />

          {booking ? (
            <BookingInfoBar
              booking={booking}
              otherSideName={otherSideName}
              statusInfo={statusInfo}
              refreshing={refreshing}
            />
          ) : null}

          <div className="px-5 py-6 sm:px-6 lg:px-8">
            {pageError ? (
              <div className="mb-4 rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-bold text-red-600">
                {pageError}
              </div>
            ) : null}

            {!activeBookingCode ? (
              <EmptyChatState />
            ) : loading ? (
              <ChatSkeleton />
            ) : !booking ? (
              <EmptyChatState />
            ) : (
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_330px]">
                <section className="overflow-hidden rounded-[26px] border border-[#e2e8f0] bg-white">
                  <ChatHeader
                    otherSideName={otherSideName}
                    currentRole={currentRole}
                    canChat={canChat}
                    refreshing={refreshing}
                  />

                  <div className="h-[520px] overflow-y-auto bg-[#f8fafc] px-4 py-5 sm:px-5">
                    {messages.length === 0 ? (
                      <NoMessageState canChat={canChat} />
                    ) : (
                      <div className="grid gap-3">
                        {messages.map((item) => {
                          const isMine =
                            item.sender_role === currentRole &&
                            String(item.sender_id || "") === String(senderId);

                          return (
                            <MessageBubble
                              key={item.id}
                              message={item}
                              isMine={isMine}
                            />
                          );
                        })}
                        <div ref={bottomRef} />
                      </div>
                    )}
                  </div>

                  <ChatComposer
                    value={messageText}
                    canChat={canChat}
                    sending={sending}
                    onChange={setMessageText}
                    onSubmit={handleSend}
                  />
                </section>

                <ChatSidebar
                  booking={booking}
                  statusInfo={statusInfo}
                  canChat={canChat}
                />
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function HeaderSearch({
  bookingCode,
  loading,
  onBookingCodeChange,
  onSubmit,
}: {
  bookingCode: string;
  loading: boolean;
  onBookingCodeChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="relative overflow-hidden bg-[#111827] px-6 py-8 text-white sm:px-8 lg:px-10">
      <div className="absolute right-[-110px] top-[-110px] h-[300px] w-[300px] rounded-full bg-[#ff8d28]/25 blur-3xl" />
      <div className="absolute bottom-[-140px] left-[25%] h-[280px] w-[280px] rounded-full bg-white/10 blur-3xl" />

      <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-end">
        <div>
          <p className="text-[12px] font-black uppercase tracking-[0.18em] text-[#ffb267]">
            Booking chat
          </p>

          <h1 className="mt-3 max-w-[760px] text-[34px] font-black leading-[1.05] tracking-[-0.04em] sm:text-[46px]">
            Chat giữa khách và photographer
          </h1>

          <p className="mt-4 max-w-[680px] text-[14px] font-medium leading-7 text-white/70">
            Mở chat với khách ngay khi đơn đã thanh toán đủ và theo dõi lịch chụp.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-[22px] border border-white/10 bg-white/10 p-3 backdrop-blur-md"
        >
          <label className="grid gap-2">
            <span className="px-1 text-[12px] font-extrabold text-white/80">
              Mã booking
            </span>

            <span className="flex gap-2 rounded-[16px] bg-white p-2">
              <input
                value={bookingCode}
                onChange={(event) => onBookingCodeChange(event.target.value)}
                placeholder="Nhập mã BK..."
                className="min-h-[46px] flex-1 border-0 bg-transparent px-3 text-[14px] font-bold text-[#111827] outline-none placeholder:text-[#9ca3af]"
              />

              <button
                type="submit"
                disabled={loading}
                className="rounded-[13px] bg-[#ff8d28] px-4 text-[13px] font-black text-white shadow-[0_10px_24px_rgba(255,141,40,0.3)] transition-all hover:bg-[#e0751b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Đang tải" : "Mở chat"}
              </button>
            </span>
          </label>
        </form>
      </div>
    </div>
  );
}

function BookingInfoBar({
  booking,
  otherSideName,
  statusInfo,
  refreshing,
}: {
  booking: BackendBooking;
  otherSideName: string;
  statusInfo: StatusInfo;
  refreshing: boolean;
}) {
  return (
    <div className="grid gap-4 border-b border-[#eef2f7] bg-[#fbfcff] px-5 py-5 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
      <InfoBox label="Mã booking" value={booking.booking_code} />
      <InfoBox label="Đang chat với" value={otherSideName} />
      <InfoBox label="Dịch vụ" value={booking.service_name} />
      <div className="rounded-[18px] border border-[#eef2f7] bg-white p-4">
        <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#94a3b8]">
          Trạng thái
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <StatusBadge label={statusInfo.label} className={statusInfo.className} dot={statusInfo.dot} />
          {refreshing ? (
            <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black text-slate-500">
              Đang cập nhật
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ChatHeader({
  otherSideName,
  currentRole,
  canChat,
  refreshing,
}: {
  otherSideName: string;
  currentRole: "customer" | "photographer";
  canChat: boolean;
  refreshing: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#eef2f7] bg-white px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-full bg-[#111827] text-[14px] font-black text-white">
          {otherSideName ? otherSideName.charAt(0).toUpperCase() : "K"}
        </div>
        <div>
          <h2 className="text-[18px] font-black tracking-[-0.02em]">{otherSideName || "Cuộc trò chuyện"}</h2>
          <p className="mt-1 text-[12px] font-bold text-[#64748b]">Bạn đang dùng vai trò: Photographer</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {refreshing ? (
          <span className="rounded-full bg-slate-100 px-3 py-2 text-[11px] font-black text-slate-500">Sync...</span>
        ) : null}
        <span className={`rounded-full px-3 py-2 text-[12px] font-black ${canChat ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
          {canChat ? "Chat đang mở" : "Chat chưa mở"}
        </span>
      </div>
    </div>
  );
}

function ChatComposer({
  value,
  canChat,
  sending,
  onChange,
  onSubmit,
}: {
  value: string;
  canChat: boolean;
  sending: boolean;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="border-t border-[#eef2f7] bg-white p-4">
      <div className="flex gap-3">
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={canChat ? "Nhập tin nhắn..." : "Chat chỉ mở sau khi booking thanh toán đủ"}
          disabled={!canChat || sending}
          rows={1}
          className="min-h-[50px] flex-1 resize-none rounded-[16px] border border-[#e2e8f0] bg-[#fbfcff] px-4 py-3 text-[14px] font-semibold leading-6 text-[#111827] outline-none transition focus:border-[#ff8d28] focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!canChat || sending}
          className="rounded-[16px] bg-[#ff8d28] px-5 text-[13px] font-black text-white shadow-[0_10px_24px_rgba(255,141,40,0.22)] transition hover:bg-[#e0751b] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {sending ? "Đang gửi" : "Gửi"}
        </button>
      </div>
    </form>
  );
}

function ChatSidebar({
  booking,
  statusInfo,
  canChat,
}: {
  booking: BackendBooking;
  statusInfo: StatusInfo;
  canChat: boolean;
}) {
  return (
    <aside className="grid h-fit gap-4 rounded-[26px] border border-[#e2e8f0] bg-[#fbfcff] p-5">
      <div>
        <p className="text-[12px] font-black uppercase tracking-[0.16em] text-[#94a3b8]">Thông tin lịch</p>
        <div className="mt-4 grid gap-3">
          <InfoLine label="Ngày chụp" value={formatDate(booking.shoot_date)} />
          <InfoLine label="Giờ chụp" value={formatTime(booking.shoot_time)} />
          <InfoLine label="Khách hàng" value={booking.customer_full_name} />
          <InfoLine label="Liên hệ" value={booking.customer_phone || booking.customer_email || "Chưa có"} />
        </div>
      </div>
      <div className={`rounded-[18px] border p-4 ${statusInfo.className}`}>
        <p className="text-[13px] font-black">{statusInfo.label}</p>
        <p className="mt-2 text-[13px] font-semibold leading-6 opacity-90">{statusInfo.description}</p>
      </div>
      {canChat ? (
        <div className="rounded-[18px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] font-bold leading-6 text-emerald-700">
          Chat đang mở. Hai bên có thể trao đổi ngay.
        </div>
      ) : (
        <div className="rounded-[18px] border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] font-bold leading-6 text-amber-700">
          Chat sẽ mở khi booking đã thanh toán đủ.
        </div>
      )}
      <div className="grid gap-2">
        <Link href="/profilephotographer/bookings" className="rounded-[14px] border border-[#e2e8f0] bg-white px-4 py-3 text-center text-[13px] font-black text-[#334155] transition hover:border-[#ffcfaa] hover:text-[#ff8d28]">
          Về booking của tôi
        </Link>
        <Link href="/profilephotographer/dashboard" className="rounded-[14px] border border-[#e2e8f0] bg-white px-4 py-3 text-center text-[13px] font-black text-[#334155] transition hover:border-[#ffcfaa] hover:text-[#ff8d28]">
          Về dashboard photographer
        </Link>
      </div>
    </aside>
  );
}

function MessageBubble({
  message,
  isMine,
}: {
  message: ChatMessage;
  isMine: boolean;
}) {
  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[82%] rounded-[20px] px-4 py-3 shadow-sm ${
          isMine
            ? "rounded-br-[7px] bg-[#ff8d28] text-white"
            : "rounded-bl-[7px] border border-[#e2e8f0] bg-white text-[#0f172a]"
        }`}
      >
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className={`text-[11px] font-black ${isMine ? "text-white/90" : "text-[#ff8d28]"}`}>
            {message.sender_name}
          </span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${isMine ? "bg-white/15 text-white/70" : "bg-slate-100 text-[#94a3b8]"}`}>
            {message.sender_role === "photographer" ? "Photographer" : "Khách hàng"}
          </span>
        </div>
        <p className="whitespace-pre-line break-words text-[14px] font-semibold leading-6">{message.message}</p>
        <p className={`mt-2 text-right text-[10px] font-bold ${isMine ? "text-white/70" : "text-[#94a3b8]"}`}>
          {formatDateTime(message.created_at)}
        </p>
      </div>
    </div>
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
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-black ${className}`}>
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-[#eef2f7] bg-white p-4">
      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#94a3b8]">{label}</p>
      <p className="mt-2 break-words text-[14px] font-black text-[#0f172a]">{value}</p>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-[14px] bg-white px-4 py-3">
      <span className="text-[12px] font-bold text-[#64748b]">{label}</span>
      <span className="text-right text-[12px] font-black text-[#0f172a]">{value}</span>
    </div>
  );
}

function NoMessageState({ canChat }: { canChat: boolean }) {
  return (
    <div className="grid h-full place-items-center text-center">
      <div>
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white text-[22px] font-black text-[#ff8d28] shadow-sm">💬</div>
        <p className="mt-4 text-[18px] font-black text-[#0f172a]">Chưa có tin nhắn</p>
        <p className="mt-2 max-w-[430px] text-[13px] font-semibold leading-6 text-[#64748b]">
          {canChat ? "Bạn có thể bắt đầu cuộc trò chuyện đầu tiên tại đây." : "Sau khi booking thanh toán đủ, khách và photographer có thể trao đổi tại đây."}
        </p>
      </div>
    </div>
  );
}

function EmptyChatState() {
  return (
    <div className="rounded-[24px] border border-dashed border-[#dbe1ea] bg-[#fbfcff] px-6 py-16 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white text-[22px] font-black text-[#ff8d28] shadow-sm">BK</div>
      <p className="mt-4 text-[18px] font-black text-[#0f172a]">Nhập mã booking để mở phòng chat</p>
      <p className="mx-auto mt-2 max-w-[520px] text-[14px] font-semibold leading-6 text-[#64748b]">
        Bạn có thể mở chat từ nút Chat trong trang booking hoặc dashboard photographer.
      </p>
    </div>
  );
}

function LoadingScreen() {
  return (
    <main className="min-h-screen bg-[#f8fafc] px-5 py-12">
      <section className="mx-auto max-w-[1240px]">
        <div className="overflow-hidden rounded-[32px] border border-[#e2e8f0] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.07)]">
          <div className="h-[250px] animate-pulse bg-[#111827]" />
          <div className="grid gap-5 p-6 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="h-[90px] animate-pulse rounded-[18px] bg-[#eef2f7]" />
              <div className="h-[90px] animate-pulse rounded-[18px] bg-[#eef2f7]" />
              <div className="h-[90px] animate-pulse rounded-[18px] bg-[#eef2f7]" />
              <div className="h-[90px] animate-pulse rounded-[18px] bg-[#eef2f7]" />
            </div>
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_330px]">
              <div className="h-[620px] animate-pulse rounded-[26px] bg-[#eef2f7]" />
              <div className="h-[420px] animate-pulse rounded-[26px] bg-[#eef2f7]" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function ChatSkeleton() {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_330px]">
      <div className="h-[620px] animate-pulse rounded-[26px] bg-[#eef2f7]" />
      <div className="h-[420px] animate-pulse rounded-[26px] bg-[#eef2f7]" />
    </div>
  );
}
