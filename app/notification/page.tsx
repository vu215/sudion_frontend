"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/auth-context";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const AUTO_REFRESH_MS = 8000;

type NotificationItem = {
  id: number;
  user_id: string | null;
  user_email: string | null;
  title: string;
  message: string;
  type: string;
  target_url: string | null;
  is_read: number;
  created_at: string;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  error?: unknown;
};

const tabs = [
  { id: "all", label: "Tất cả" },
  { id: "unread", label: "Chưa đọc" },
  { id: "read", label: "Đã đọc" },
];

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("vi-VN");
}

async function getNotifications(email: string) {
  const response = await fetch(
    `${API_URL}/notifications/user/${encodeURIComponent(email)}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  const json: ApiResponse<NotificationItem[]> = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.message || "Không thể lấy thông báo.");
  }

  return json.data;
}

async function markNotificationRead(id: number) {
  const response = await fetch(`${API_URL}/notifications/${id}/read`, {
    method: "PATCH",
  });

  const json: ApiResponse<unknown> = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.message || "Không thể đánh dấu đã đọc.");
  }
}

async function getPhotographerEmail(photographerId: string) {
  const response = await fetch(
    `${API_URL}/photographers/${encodeURIComponent(photographerId)}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  const json: ApiResponse<{
    id: number;
    email: string;
    full_name: string;
  }> = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.message || "Không thể lấy email photographer.");
  }

  return json.data.email;
}

export default function NotificationPage() {
  const { session } = useAuth();

  const [email, setEmail] = useState("");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeTab, setActiveTab] = useState("all");

  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let ignore = false;
    let timer: number | undefined;

    async function startAutoRefresh() {
      try {
        let finalEmail = session?.email || "";

        if (session?.role === "photographer" && session.photographerId) {
          finalEmail = await getPhotographerEmail(session.photographerId);
        }

        if (!finalEmail) {
          finalEmail = window.localStorage.getItem("sudion_booking_email") || "";
        }

        if (!finalEmail || ignore) return;

        setEmail(finalEmail);
        void handleLoadNotifications(finalEmail);

        timer = window.setInterval(async () => {
          try {
            const data = await getNotifications(finalEmail);
            setNotifications(data);
            window.localStorage.setItem("sudion_booking_email", finalEmail);
          } catch (error) {
            console.error("Auto refresh notifications failed:", error);
          }
        }, AUTO_REFRESH_MS);
      } catch (error) {
        console.error("Không thể bật auto refresh notification:", error);
      }
    }

    void startAutoRefresh();

    return () => {
      ignore = true;

      if (timer) {
        window.clearInterval(timer);
      }
    };
  }, [session?.email, session?.role, session?.photographerId]);

  const stats = useMemo(() => {
    return {
      total: notifications.length,
      unread: notifications.filter((item) => Number(item.is_read) === 0).length,
      read: notifications.filter((item) => Number(item.is_read) === 1).length,
    };
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    if (activeTab === "unread") {
      return notifications.filter((item) => Number(item.is_read) === 0);
    }

    if (activeTab === "read") {
      return notifications.filter((item) => Number(item.is_read) === 1);
    }

    return notifications;
  }, [activeTab, notifications]);

  async function handleLoadNotifications(targetEmail = email) {
    try {
      const finalEmail = targetEmail.trim();

      if (!finalEmail) {
        setPageError("Vui lòng nhập email để xem thông báo.");
        return;
      }

      setLoading(true);
      setPageError("");
      setSuccessMessage("");

      const data = await getNotifications(finalEmail);

      setNotifications(data);
      window.localStorage.setItem("sudion_booking_email", finalEmail);
    } catch (error) {
      console.error("Lỗi lấy thông báo:", error);

      setNotifications([]);
      setPageError(
        error instanceof Error ? error.message : "Không thể lấy thông báo."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await handleLoadNotifications();
  }

  async function handleMarkRead(item: NotificationItem) {
    try {
      setPageError("");
      setSuccessMessage("");

      await markNotificationRead(item.id);

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === item.id
            ? { ...notification, is_read: 1 }
            : notification
        )
      );

      setSuccessMessage("Đã đánh dấu thông báo là đã đọc.");
    } catch (error) {
      console.error("Lỗi đánh dấu thông báo:", error);

      setPageError(
        error instanceof Error
          ? error.message
          : "Không thể đánh dấu thông báo."
      );
    }
  }

  async function handleMarkAllRead() {
    const unreadItems = notifications.filter(
      (item) => Number(item.is_read) === 0
    );

    if (unreadItems.length === 0) {
      return;
    }

    try {
      setPageError("");
      setSuccessMessage("");

      await Promise.all(unreadItems.map((item) => markNotificationRead(item.id)));

      setNotifications((current) =>
        current.map((item) => ({ ...item, is_read: 1 }))
      );

      setSuccessMessage("Đã đánh dấu tất cả thông báo là đã đọc.");
    } catch (error) {
      console.error("Lỗi đánh dấu tất cả:", error);
      setPageError("Không thể đánh dấu tất cả thông báo.");
    }
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#0f172a]">
      <section className="mx-auto w-full max-w-[1180px] px-5 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="overflow-hidden rounded-[30px] border border-[#e2e8f0] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
          <div className="relative overflow-hidden bg-[#111827] px-6 py-8 text-white sm:px-8 lg:px-10">
            <div className="absolute right-[-100px] top-[-100px] h-[280px] w-[280px] rounded-full bg-[#ff8d28]/25 blur-3xl" />
            <div className="absolute bottom-[-140px] left-[25%] h-[280px] w-[280px] rounded-full bg-white/10 blur-3xl" />

            <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-end">
              <div>
                <p className="text-[12px] font-black uppercase tracking-[0.18em] text-[#ffb267]">
                  Notifications
                </p>

                <h1 className="mt-3 text-[34px] font-black leading-[1.05] tracking-[-0.04em] sm:text-[46px]">
                  Trung tâm thông báo
                </h1>

                <p className="mt-4 max-w-[680px] text-[14px] font-medium leading-7 text-white/70">
                  Theo dõi trạng thái booking, lịch đã nhận, lịch bị hủy và các
                  cập nhật quan trọng từ STUDION.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="rounded-[20px] border border-white/10 bg-white/10 p-3 backdrop-blur-md"
              >
                <label className="grid gap-2">
                  <span className="px-1 text-[12px] font-extrabold text-white/80">
                    Email nhận thông báo
                  </span>

                  <span className="flex gap-2 rounded-[14px] bg-white p-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@email.com"
                      className="min-h-[44px] flex-1 border-0 bg-transparent px-3 text-[14px] font-bold text-[#111827] outline-none placeholder:text-[#9ca3af]"
                    />

                    <button
                      type="submit"
                      disabled={loading}
                      className="rounded-[12px] bg-[#ff8d28] px-4 text-[13px] font-black text-white shadow-[0_10px_24px_rgba(255,141,40,0.3)] transition-all hover:bg-[#e0751b] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? "Đang tải" : "Xem"}
                    </button>
                  </span>
                </label>
              </form>
            </div>
          </div>

          <div className="grid gap-4 border-b border-[#eef2f7] bg-[#fbfcff] px-6 py-5 sm:grid-cols-3 lg:px-8">
            <StatCard label="Tổng thông báo" value={stats.total} />
            <StatCard label="Chưa đọc" value={stats.unread} />
            <StatCard label="Đã đọc" value={stats.read} />
          </div>

          <div className="px-6 py-6 lg:px-8">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-[24px] font-black tracking-[-0.03em]">
                  Danh sách thông báo
                </h2>

                <p className="mt-1 text-[13px] font-semibold text-[#64748b]">
                  Các thông báo được tạo khi booking thay đổi trạng thái.
                </p>
              </div>

              <button
                type="button"
                onClick={handleMarkAllRead}
                className="inline-flex w-fit items-center justify-center rounded-[12px] border border-[#e2e8f0] bg-white px-4 py-3 text-[13px] font-black text-[#334155] transition-all hover:border-[#ffcfaa] hover:text-[#ff8d28]"
              >
                Đánh dấu tất cả đã đọc
              </button>
            </div>

            <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
              {tabs.map((tab) => {
                const active = tab.id === activeTab;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`shrink-0 rounded-full border px-4 py-2 text-[12px] font-black transition-all ${
                      active
                        ? "border-[#ff8d28] bg-[#fff7ed] text-[#ff8d28]"
                        : "border-[#e2e8f0] bg-white text-[#64748b] hover:border-[#ffcfaa] hover:text-[#ff8d28]"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
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

            {loading ? (
              <NotificationSkeleton />
            ) : filteredNotifications.length === 0 ? (
              <EmptyNotification hasEmail={Boolean(email.trim())} />
            ) : (
              <div className="mt-5 grid gap-3">
                {filteredNotifications.map((item) => (
                  <NotificationCard
                    key={item.id}
                    item={item}
                    onMarkRead={() => handleMarkRead(item)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[18px] border border-[#eef2f7] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.035)]">
      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#94a3b8]">
        {label}
      </p>

      <p className="mt-2 text-[28px] font-black tracking-[-0.04em] text-[#0f172a]">
        {value}
      </p>
    </div>
  );
}

function NotificationCard({
  item,
  onMarkRead,
}: {
  item: NotificationItem;
  onMarkRead: () => void;
}) {
  const unread = Number(item.is_read) === 0;

  return (
    <article
      className={`rounded-[22px] border p-5 transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_46px_rgba(15,23,42,0.075)] ${
        unread
          ? "border-[#ffcfaa] bg-[#fff7ed]"
          : "border-[#e2e8f0] bg-white"
      }`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1.5 text-[11px] font-black ${
                unread
                  ? "bg-[#ff8d28] text-white"
                  : "bg-[#f1f5f9] text-[#64748b]"
              }`}
            >
              {unread ? "Mới" : "Đã đọc"}
            </span>

            <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-black text-[#64748b]">
              {item.type}
            </span>
          </div>

          <h3 className="mt-4 text-[20px] font-black tracking-[-0.03em] text-[#0f172a]">
            {item.title}
          </h3>

          <p className="mt-2 text-[14px] font-semibold leading-6 text-[#475569]">
            {item.message}
          </p>

          <p className="mt-3 text-[12px] font-bold text-[#94a3b8]">
            {formatDateTime(item.created_at)}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          {item.target_url ? (
            <Link
              href={item.target_url}
              className="rounded-[12px] bg-[#111827] px-4 py-3 text-[13px] font-black text-white transition-all hover:bg-[#0f172a]"
            >
              Mở
            </Link>
          ) : null}

          {unread ? (
            <button
              type="button"
              onClick={onMarkRead}
              className="rounded-[12px] border border-[#e2e8f0] bg-white px-4 py-3 text-[13px] font-black text-[#334155] transition-all hover:border-[#ffcfaa] hover:text-[#ff8d28]"
            >
              Đã đọc
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function EmptyNotification({ hasEmail }: { hasEmail: boolean }) {
  return (
    <div className="mt-5 rounded-[24px] border border-dashed border-[#cbd5e1] bg-[#fbfcff] px-6 py-12 text-center">
      <h3 className="text-[22px] font-black tracking-[-0.03em] text-[#0f172a]">
        {hasEmail ? "Chưa có thông báo" : "Nhập email để xem thông báo"}
      </h3>

      <p className="mx-auto mt-2 max-w-[460px] text-[14px] font-semibold leading-6 text-[#64748b]">
        {hasEmail
          ? "Hiện tại email này chưa có thông báo nào."
          : "Thông báo sẽ xuất hiện khi booking được xác nhận, nhận lịch, hủy hoặc hoàn thành."}
      </p>
    </div>
  );
}

function NotificationSkeleton() {
  return (
    <div className="mt-5 grid gap-3">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="animate-pulse rounded-[22px] border border-[#e2e8f0] bg-white p-5"
        >
          <div className="h-6 w-[180px] rounded-full bg-[#eef2f7]" />
          <div className="mt-5 h-7 w-[60%] rounded-full bg-[#eef2f7]" />
          <div className="mt-3 h-5 w-[80%] rounded-full bg-[#eef2f7]" />
        </div>
      ))}
    </div>
  );
}