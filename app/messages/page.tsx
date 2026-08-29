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
import { io, Socket } from "socket.io-client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function authHeaders() {
  const token = typeof window !== "undefined" ? window.localStorage.getItem("sudion_token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

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
  location?: string | null;
  people_scale?: string | null;
  concept?: string | null;
  estimated_total: number;
  deposit_amount: number;
  remaining_amount: number;
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
    label: "Chờ thợ xác nhận",
    description: "Photographer chưa xác nhận lịch nên chưa thể chat.",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },
  accepted: {
    label: "Chờ khách cọc",
    description: "Photographer đã xác nhận. Khách cần thanh toán cọc.",
    className: "border-blue-200 bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
  },
  confirmed: {
    label: "Đã cọc",
    description: "Lịch chụp đã được giữ. Hai bên có thể nhắn tin trao đổi.",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  completed: {
    label: "Chờ trả còn lại",
    description: "Buổi chụp đã hoàn thành. Khách cần thanh toán phần còn lại.",
    className: "border-purple-200 bg-purple-50 text-purple-700",
    dot: "bg-purple-500",
  },
  fully_paid: {
    label: "Đã thanh toán 100%",
    description: "Đã thanh toán đủ. Hai bên có thể nhắn tin trao đổi.",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  rejected: {
    label: "Đã từ chối",
    description: "Booking bị từ chối nên không thể mở chat.",
    className: "border-red-200 bg-red-50 text-red-700",
    dot: "bg-red-500",
  },
  cancelled: {
    label: "Đã hủy",
    description: "Booking đã hủy nên không thể mở chat.",
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

function extractPhotoDriveLink(location: string | null | undefined): string {
  if (!location) return "";
  const match = String(location).match(/\[Photos:\s*(https?:\/\/[^\]]+)\]/i);
  if (match?.[1]) return match[1].trim();
  if (String(location).includes("drive.google.com")) {
    const urlMatch = String(location).match(/(https?:\/\/[^\s\]]+)/i);
    if (urlMatch?.[1]) return urlMatch[1].trim();
  }
  return "";
}

function formatDate(value: string | null) {
  if (!value) return "Chưa chọn";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("vi-VN");
}

function formatTime(value: string | null, endValue?: string | null) {
  if (!value) return "Chưa chọn";

  const text = String(value).trim();
  const endText = endValue ? String(endValue).trim() : "";
  const rangeMatch = text.match(/(\d{1,2}:\d{2})\s*(?:-|–|—|đến|to)\s*(\d{1,2}:\d{2})/i);
  if (rangeMatch) {
    return `${rangeMatch[1]} - ${rangeMatch[2]}`;
  }

  if (endText && /\d{1,2}:\d{2}/.test(endText)) {
    return `${text} - ${endText}`;
  }

  return text.slice(0, 5);
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

function formatCurrency(val: number | string | undefined | null) {
  return `${Number(val || 0).toLocaleString("vi-VN")} VND`;
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
      headers: authHeaders(),
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
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });
  const json: ApiResponse<ChatMessage> = await response.json();
  if (!response.ok || !json.success) {
    throw new Error(json.message || "Không thể gửi tin nhắn.");
  }
  return json.data;
}

export default function MessagesPage() {
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
  const { session, isLoggedIn } = useAuth();

  const queryBookingCode = searchParams.get("booking") || "";

  const [bookingCode, setBookingCode] = useState(queryBookingCode);
  const [activeBookingCode, setActiveBookingCode] = useState(queryBookingCode);

  const [booking, setBooking] = useState<BackendBooking | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userBookings, setUserBookings] = useState<BackendBooking[]>([]);
  const [searchFilter, setSearchFilter] = useState("");

  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const [pageError, setPageError] = useState("");
  const [showDrawer, setShowDrawer] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const currentRole: "customer" | "photographer" =
    session?.role === "photographer" ? "photographer" : "customer";

  const senderName =
    session?.fullName ||
    (currentRole === "photographer" ? "Photographer" : "Khách hàng");

  const senderId =
    currentRole === "photographer"
      ? session?.photographerId || session?.userId || "photographer"
      : session?.email || session?.userId || "guest";

  const canChat = ["accepted", "confirmed", "completed", "fully_paid"].includes(
    booking?.status || ""
  );

  const statusInfo = useMemo(() => {
    return getStatusInfo(booking?.status || "awaiting_payment");
  }, [booking?.status]);

  const otherSideName = useMemo(() => {
    if (!booking) return "";
    return currentRole === "photographer"
      ? booking.customer_full_name
      : booking.photographer_name;
  }, [booking, currentRole]);

  const receiverId = useMemo(() => {
    if (!booking) return null;
    return currentRole === "photographer"
      ? booking.customer_email
      : booking.photographer_id;
  }, [booking, currentRole]);

  // Load user/photographer bookings for sidebar
  useEffect(() => {
    if (!isLoggedIn) return;

    async function loadUserBookings() {
      try {
        let url = "";
        if (currentRole === "photographer") {
          const pId = session?.photographerId || session?.userId || "79";
          url = `${API_URL}/bookings/photographer/${encodeURIComponent(pId)}`;
        } else {
          if (!session?.email) return;
          url = `${API_URL}/bookings/customer/${encodeURIComponent(session.email)}`;
        }

        const res = await fetch(url, { headers: authHeaders(), cache: "no-store" });
        const json = await res.json();
        if (res.ok && json.success && Array.isArray(json.data)) {
          // Filter ONLY chat-eligible bookings (accepted, confirmed, completed, fully_paid)
          const chatEligible = json.data.filter((b: BackendBooking) =>
            ["accepted", "confirmed", "completed", "fully_paid"].includes(b.status)
          );
          setUserBookings(chatEligible);
          // If no active booking code selected yet, pick first booking
          if (!queryBookingCode && chatEligible.length > 0) {
            setActiveBookingCode(chatEligible[0].booking_code);
            setBookingCode(chatEligible[0].booking_code);
          }
        }
      } catch (err) {
        console.error("Lỗi tải danh sách booking cuộc trò chuyện:", err);
      }
    }

    void loadUserBookings();
  }, [isLoggedIn, currentRole, session, queryBookingCode]);

  useEffect(() => {
    if (queryBookingCode) {
      setBookingCode(queryBookingCode);
      setActiveBookingCode(queryBookingCode);
    }
  }, [queryBookingCode]);

  // WebSocket Connection
  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";
    const socket = io(socketUrl, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 8000,
    });
    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !activeBookingCode) return;

    socket.emit("join_room", activeBookingCode);

    const handleNewMessage = (msg: ChatMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => String(m.id || "") === String(msg.id || ""))) return prev;
        return [...prev, msg];
      });
    };

    socket.on("new_message", handleNewMessage);

    return () => {
      socket.emit("leave_room", activeBookingCode);
      socket.off("new_message", handleNewMessage);
    };
  }, [activeBookingCode]);

  // Load chat & active booking data
  useEffect(() => {
    if (!activeBookingCode) return;

    async function loadData() {
      try {
        setLoading(true);
        setPageError("");

        const [bookingData, messageData] = await Promise.all([
          getBooking(activeBookingCode),
          getMessages(activeBookingCode),
        ]);

        setBooking(bookingData);
        setMessages(messageData);
      } catch (error) {
        console.error("Lỗi tải chat:", error);
        setBooking(null);
        setMessages([]);
        const message = error instanceof Error ? error.message : "Không thể tải phòng chat.";
        setPageError(message);
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, [activeBookingCode]);

  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to bottom inside inner container only (prevents window scrolling shift)
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages.length, activeBookingCode]);

  // Auto polling refresh
  useEffect(() => {
    if (!activeBookingCode) return;

    const timer = window.setInterval(async () => {
      try {
        setRefreshing(true);
        const [bookingData, messageData] = await Promise.all([
          getBooking(activeBookingCode),
          getMessages(activeBookingCode),
        ]);

        setBooking(bookingData);
        setMessages(messageData);
      } catch (error) {
        console.error("Auto refresh chat failed:", error);
      } finally {
        setRefreshing(false);
      }
    }, AUTO_REFRESH_MS);

    return () => window.clearInterval(timer);
  }, [activeBookingCode]);

  const handleSelectBooking = (code: string) => {
    setActiveBookingCode(code);
    setBookingCode(code);
    router.replace(`/messages?booking=${encodeURIComponent(code)}`);
  };

  async function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!booking) return;

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

      setMessages((current) => {
        if (current.some((m) => String(m.id || "") === String(newMessage.id || ""))) {
          return current;
        }
        return [...current, newMessage];
      });
      setMessageText("");
    } catch (error) {
      console.error("Lỗi gửi tin nhắn:", error);
      const message = error instanceof Error ? error.message : "Không thể gửi tin nhắn.";
      setPageError(message);
      toast.error("Gửi tin nhắn thất bại", message);
    } finally {
      setSending(false);
    }
  }

  const [showSearchInput, setShowSearchInput] = useState(false);

  const filteredConversations = useMemo(() => {
    if (!searchFilter.trim()) return userBookings;
    const q = searchFilter.toLowerCase().trim();
    return userBookings.filter((b) => {
      const targetName = currentRole === "photographer" ? b.customer_full_name : b.photographer_name;
      return (
        (targetName && targetName.toLowerCase().includes(q)) ||
        (b.booking_code && b.booking_code.toLowerCase().includes(q)) ||
        (b.service_name && b.service_name.toLowerCase().includes(q))
      );
    });
  }, [userBookings, searchFilter, currentRole]);

  const backUrl = currentRole === "photographer" ? "/photographer-dashboard" : "/bookings";
  const backText = currentRole === "photographer" ? "Lịch nhận của tôi" : "Lịch đặt của tôi";

  return (
    <main className="h-[calc(100vh-76px)] lg:h-[calc(100vh-88px)] bg-[#f4f6fa] text-[#0f172a] flex flex-col overflow-hidden">
      <section className="mx-auto w-full max-w-[1360px] px-3 py-2.5 sm:px-6 lg:px-8 flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="overflow-hidden rounded-[26px] border border-[#e2e8f0] bg-white shadow-[0_16px_48px_rgba(15,23,42,0.05)] grid grid-cols-1 lg:grid-cols-[340px_minmax(0,1fr)] flex-1 min-h-0 h-full">

          {/* ── LEFT SIDEBAR: Conversations List ── */}
          <aside className="flex flex-col border-r border-[#eef2f7] bg-[#fcfdfe] min-h-0 h-full overflow-hidden">
            {/* Header with Title & Search Icon Toggle Button */}
            <div className="flex items-center justify-between border-b border-[#eef2f7] px-4 py-3.5 bg-white shrink-0">
              <div className="flex items-center gap-3">
                <Link
                  href={backUrl}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[#e2e8f0] bg-white text-[#475569] hover:border-[#ff8d28] hover:text-[#ff8d28] transition-all shadow-sm"
                  title={`Quay về ${backText}`}
                >
                  <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                </Link>
                <div>
                  <h1 className="text-[16px] font-black text-[#0f172a] tracking-tight">Trò chuyện</h1>
                  <p className="text-[10.5px] font-semibold text-[#64748b]">
                    {currentRole === "photographer" ? "Danh sách khách hàng" : "Danh sách nhiếp ảnh gia"}
                  </p>
                </div>
              </div>

              {/* Search Toggle Icon Button */}
              <button
                type="button"
                onClick={() => setShowSearchInput((prev) => !prev)}
                className={`grid h-9 w-9 place-items-center rounded-xl border transition-all ${showSearchInput || searchFilter
                  ? "border-[#ff8d28] bg-orange-50 text-[#ff8d28]"
                  : "border-[#e2e8f0] bg-white text-[#64748b] hover:border-[#ff8d28] hover:text-[#ff8d28]"
                  }`}
                title="Tìm kiếm cuộc trò chuyện"
              >
                <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>

            {/* Expandable Search Input (Only shown when Search Icon is clicked or search active) */}
            {(showSearchInput || searchFilter) && (
              <div className="px-4 py-2.5 border-b border-[#eef2f7] bg-[#fffbf7] shrink-0">
                <div className="relative">
                  <input
                    type="text"
                    autoFocus
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Nhập tên hoặc mã BK để tìm..."
                    className="w-full rounded-xl border border-[#ffcfaa] bg-white py-2 pl-9 pr-7 text-[12px] font-bold text-[#0f172a] outline-none focus:ring-2 focus:ring-[#ff8d28]/20"
                  />

                  {searchFilter && (
                    <button
                      type="button"
                      onClick={() => setSearchFilter("")}
                      className="absolute right-2.5 top-2.5 text-xs text-[#94a3b8] hover:text-[#0f172a]"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Conversation List Items (Internal Vertical Scroll Only) */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5 min-h-0">
              {filteredConversations.length === 0 ? (
                <div className="py-12 text-center text-xs font-semibold text-[#94a3b8]">
                  {searchFilter ? "Không tìm thấy cuộc trò chuyện phù hợp" : "Chưa có cuộc trò chuyện nào"}
                </div>
              ) : (
                filteredConversations.map((item) => {
                  const isSelected = item.booking_code === activeBookingCode;
                  const name = currentRole === "photographer" ? item.customer_full_name : item.photographer_name;
                  const itemStatus = getStatusInfo(item.status);

                  return (
                    <button
                      key={item.booking_code}
                      type="button"
                      onClick={() => handleSelectBooking(item.booking_code)}
                      className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-all ${isSelected
                        ? "bg-[#fff7ed] border border-[#ff8d28]/40 shadow-sm"
                        : "border border-transparent bg-white hover:border-[#e2e8f0] hover:bg-[#f8fafc]"
                        }`}
                    >
                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#111827] text-[13px] font-black text-white shadow-sm">
                        {name ? name.charAt(0).toUpperCase() : "S"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className="truncate text-[13.5px] font-black text-[#0f172a]">{name || "Khách hàng"}</p>
                          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9.5px] font-black ${itemStatus.className}`}>
                            {itemStatus.label}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-[11.5px] font-semibold text-[#ff8d28]">{item.booking_code}</p>
                        <p className="truncate text-[11px] font-medium text-[#64748b]">{item.service_name}</p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* ── RIGHT MAIN CHAT AREA ── */}
          <section className="flex flex-col min-w-0 bg-white relative h-full min-h-0 overflow-hidden">
            {!activeBookingCode || !booking ? (
              <EmptyChatState />
            ) : (
              <>
                {/* Chat Header with 3-Dots Button */}
                <div className="flex items-center justify-between border-b border-[#eef2f7] bg-white px-5 py-3.5 shrink-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#111827] text-[14px] font-black text-white">
                      {otherSideName ? otherSideName.charAt(0).toUpperCase() : "S"}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="truncate text-[16px] font-black text-[#0f172a] tracking-tight">
                          {otherSideName || "Cuộc trò chuyện"}
                        </h2>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10.5px] font-black ${statusInfo.className}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${statusInfo.dot}`} />
                          {statusInfo.label}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11.5px] font-semibold text-[#64748b]">
                        Mã đơn: <span className="font-black text-[#ff8d28]">{booking.booking_code}</span> • {booking.service_name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => router.back()}
                      className="flex items-center gap-1.5 rounded-xl border border-[#e2e8f0] bg-white px-3 py-2 text-[12px] font-black text-[#475569] hover:border-[#ff8d28] hover:text-[#ff8d28] transition shadow-sm"
                      title="Quay lại trang trước"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                      </svg>
                      <span>Quay lại</span>
                    </button>

                    {/* 3-Dots Menu Button for Booking Details */}
                    <button
                      type="button"
                      onClick={() => setShowDrawer(true)}
                      className="flex items-center gap-1.5 rounded-xl border border-[#e2e8f0] bg-white px-3 py-2 text-[12px] font-black text-[#334155] shadow-sm transition hover:border-[#ff8d28] hover:text-[#ff8d28] hover:bg-orange-50/50"
                      title="Xem chi tiết thông tin lịch chụp"
                    >
                      <span className="text-base font-black">⋮</span>
                      <span className="hidden sm:inline">Chi tiết lịch</span>
                    </button>
                  </div>
                </div>

                {/* Messages Body */}
                <div ref={messagesContainerRef} className="flex-1 overflow-y-auto bg-[#f8fafc] px-4 py-5 sm:px-6">
                  {messages.length === 0 ? (
                    <NoMessageState canChat={canChat} />
                  ) : (
                    <div className="space-y-3">
                      {messages.map((item, idx) => {
                        // Align Customer messages right if logged in as customer, Photographer messages right if logged in as photographer
                        const isMine = item.sender_role === currentRole;

                        return (
                          <MessageBubble
                            key={item.id ? `msg-${item.id}-${idx}` : `msg-temp-${idx}`}
                            message={item}
                            isMine={isMine}
                            currentRole={currentRole}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Chat Composer */}
                <ChatComposer
                  value={messageText}
                  canChat={canChat}
                  sending={sending}
                  onChange={setMessageText}
                  onSubmit={handleSend}
                />
              </>
            )}
          </section>
        </div>
      </section>

      {/* ── SLIDE-IN BOOKING DETAILS DRAWER ── */}
      {booking && (
        <BookingDetailsDrawer
          open={showDrawer}
          onClose={() => setShowDrawer(false)}
          booking={booking}
          statusInfo={statusInfo}
        />
      )}
    </main>
  );
}

/* ── Message Bubble Component ── */
function MessageBubble({
  message,
  isMine,
  currentRole,
}: {
  message: ChatMessage;
  isMine: boolean;
  currentRole: "customer" | "photographer";
}) {
  return (
    <div className={`flex w-full ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[82%] sm:max-w-[70%] rounded-[20px] px-4 py-3 shadow-sm ${isMine
          ? "rounded-br-[4px] bg-[#ff8d28] text-white"
          : "rounded-bl-[4px] border border-[#e2e8f0] bg-white text-[#0f172a]"
          }`}
      >
        <div className="mb-1.5 flex flex-wrap items-center justify-between gap-3 border-b border-black/5 pb-1">
          <div className="flex items-center gap-2">
            <span className={`text-[11.5px] font-black ${isMine ? "text-white/95" : "text-[#ff8d28]"}`}>
              {isMine ? "Bạn" : message.sender_name}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[9.5px] font-bold ${isMine ? "bg-white/20 text-white" : "bg-[#f1f5f9] text-[#64748b]"
                }`}
            >
              {message.sender_role === "photographer" ? "Photographer" : "Khách hàng"}
            </span>
          </div>
          <span className={`text-[10px] font-semibold ${isMine ? "text-white/80" : "text-[#94a3b8]"}`}>
            {formatDateTime(message.created_at)}
          </span>
        </div>

        <p className="whitespace-pre-line break-words text-[13.5px] font-medium leading-6">
          {message.message}
        </p>
      </div>
    </div>
  );
}

/* ── Chat Composer Component ── */
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
    <form onSubmit={onSubmit} className="border-t border-[#eef2f7] bg-white p-3.5 sm:p-4 shrink-0">
      <div className="flex gap-2.5 items-center">
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={
            canChat ? "Nhập nội dung tin nhắn..." : "Chỉ có thể nhắn tin sau khi lịch chụp được xác nhận"
          }
          disabled={!canChat || sending}
          className="min-h-[46px] flex-1 rounded-[16px] border border-[#e2e8f0] bg-[#f8fafc] px-4 py-2.5 text-[13.5px] font-medium text-[#111827] outline-none transition focus:border-[#ff8d28] focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!canChat || sending || !value.trim()}
          className="min-h-[46px] rounded-[16px] bg-[#ff8d28] px-5 text-[13.5px] font-black text-white shadow-[0_8px_20px_rgba(255,141,40,0.25)] transition hover:bg-[#e0751b] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sending ? "Đang gửi" : "Gửi ➔"}
        </button>
      </div>
    </form>
  );
}

/* ── Slide-in Booking Details Drawer (From Right) ── */
function BookingDetailsDrawer({
  open,
  onClose,
  booking,
  statusInfo,
}: {
  open: boolean;
  onClose: () => void;
  booking: BackendBooking;
  statusInfo: StatusInfo;
}) {
  if (!open) return null;

  const driveUrl = extractPhotoDriveLink(booking.location);
  const cleanLoc = booking.location ? booking.location.split(" [Photos:")[0] : "Chưa chọn";

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-[2px] transition-opacity">
      <div className="absolute inset-0" onClick={onClose} />

      <aside className="absolute right-0 top-0 bottom-0 w-full sm:w-[420px] bg-white p-6 shadow-2xl overflow-y-auto flex flex-col justify-between animate-in slide-in-from-right duration-300">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#eef2f7] pb-4">
            <h3 className="text-[17px] font-black text-[#0f172a]">Thông tin lịch chụp</h3>
            <button
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-full bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0] transition"
            >
              ✕
            </button>
          </div>

          {/* Status Badge */}
          <div className={`rounded-2xl border p-4 ${statusInfo.className}`}>
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${statusInfo.dot}`} />
              <span className="text-xs font-black uppercase tracking-wider">{statusInfo.label}</span>
            </div>
            <p className="mt-1.5 text-xs font-semibold leading-5 opacity-90">{statusInfo.description}</p>
          </div>

          {/* Info Details */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-[#94a3b8]">Chi tiết Booking</h4>
            <DrawerItem label="Mã booking" value={booking.booking_code} highlight />
            <DrawerItem label="Gói dịch vụ" value={booking.service_name} />
            <DrawerItem label="Ngày chụp" value={formatDate(booking.shoot_date)} />
            <DrawerItem label="Giờ chụp" value={formatTime(booking.shoot_time, booking.shoot_end_time)} />
            <DrawerItem label="Địa điểm" value={cleanLoc} />
            <DrawerItem label="Quy mô" value={booking.people_scale || "Chưa chọn"} />
            <DrawerItem label="Khách hàng" value={booking.customer_full_name} />
            <DrawerItem label="Photographer" value={booking.photographer_name} />
          </div>

          {/* Pricing */}
          <div className="rounded-2xl border border-[#eef2f7] bg-[#f8fafc] p-4 space-y-2.5">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-[#94a3b8] mb-1">Chi tiết thanh toán</h4>
            <div className="flex justify-between text-xs font-semibold text-[#64748b]">
              <span>Tổng chi phí:</span>
              <span className="font-black text-[#0f172a]">{formatCurrency(booking.estimated_total)}</span>
            </div>
            <div className="flex justify-between text-xs font-semibold text-[#64748b]">
              <span>Đã thanh toán cọc:</span>
              <span className="font-black text-emerald-600">{formatCurrency(booking.deposit_amount)}</span>
            </div>
            <div className="flex justify-between text-xs font-semibold text-[#64748b]">
              <span>Còn lại:</span>
              <span className="font-black text-[#ff8d28]">{formatCurrency(booking.remaining_amount)}</span>
            </div>
          </div>

          {/* Drive Link Card if present */}
          {driveUrl && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 space-y-2">
              <span className="text-[11px] font-black uppercase text-emerald-800 tracking-wider block">
                Link Google Drive Sản Phẩm
              </span>
              <a
                href={driveUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition"
              >
                Mở Google Drive xem ảnh ↗
              </a>
            </div>
          )}
        </div>

        <div className="mt-8 border-t border-[#eef2f7] pt-4">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-[#111827] py-3 text-xs font-black text-white hover:bg-black transition"
          >
            Đóng bảng thông tin
          </button>
        </div>
      </aside>
    </div>
  );
}

function DrawerItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 text-xs">
      <span className="font-bold text-[#64748b]">{label}:</span>
      <span className={`text-right font-black ${highlight ? "text-[#ff8d28]" : "text-[#0f172a]"}`}>{value}</span>
    </div>
  );
}

function NoMessageState({ canChat }: { canChat: boolean }) {
  return (
    <div className="grid h-full place-items-center text-center py-16">
      <div>
        <p className="mt-4 text-[17px] font-black text-[#0f172a]">Chưa có tin nhắn nào</p>
        <p className="mt-1.5 max-w-[380px] text-[12.5px] font-semibold text-[#64748b]">
          {canChat
            ? "Hãy bắt đầu cuộc trò chuyện với thợ ảnh hoặc khách hàng của bạn."
            : "Cuộc trò chuyện sẽ mở sau khi đơn hàng được xác nhận."}
        </p>
      </div>
    </div>
  );
}

function EmptyChatState() {
  return (
    <div className="grid h-full place-items-center text-center p-8">
      <div>
        <p className="mt-4 text-[18px] font-black text-[#0f172a]">Chọn cuộc trò chuyện bên trái</p>
        <p className="mt-1.5 max-w-[420px] text-[13px] font-semibold text-[#64748b]">
          Chọn một đơn đặt lịch từ danh sách bên trái để xem nội dung trò chuyện và trao đổi trực tiếp.
        </p>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <main className="min-h-screen bg-[#f8fafc] px-5 py-8">
      <div className="mx-auto max-w-[1360px] h-[700px] animate-pulse rounded-[28px] bg-[#eef2f7]" />
    </main>
  );
}
