"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useNotifications, type NotificationType } from "@/app/notification-context";
import { useToast } from "@/app/toast-context";

export function NotificationBell() {
  const router = useRouter();
  const toast = useToast();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const bellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredNotifications = notifications.filter((n) =>
    activeTab === "unread" ? !n.is_read : true
  );

  const displayNotifications = filteredNotifications.slice(0, 8);

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "booking":
        return (
          <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 7V3m8 4V3m4 6h-1v2h1v10a2 2 0 01-2 2H5a2 2 0 01-2-2V9h1V7a1 1 0 011-1h2a1 1 0 011-1h6a1 1 0 011 1h2a1 1 0 011 1z" />
          </svg>
        );
      case "payment":
        return (
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case "refund":
        return (
          <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 7h6m0 10v-3m-3 3v-5m-3 5v-7M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case "system":
      default:
        return (
          <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getNotificationLink = (notification: typeof notifications[0]) => {
    const { metadata } = notification;
    if (metadata?.page_url) return metadata.page_url;

    switch (notification.type) {
      case "booking":
        return metadata?.booking_id ? `/bookings/${metadata.booking_id}` : "/bookings";
      case "payment":
        return "/bookings";
      case "refund":
        return "/bookings";
      case "system":
      default:
        return "/";
    }
  };

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    if (!notification.is_read) {
      void markAsRead(notification.id);
    }
    const link = getNotificationLink(notification);
    router.push(link);
    setIsOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    toast.success("Đã đánh dấu", "Tất cả thông báo đã được đánh dấu là đã đọc.");
  };

  return (
    <div ref={bellRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#e8eaf1] text-[#4b5563] hover:border-[#ff8d28] hover:text-[#ff8d28] transition-colors"
        aria-label="Thông báo"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#ff8d28] text-[10px] font-black text-white border-2 border-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 rounded-2xl border border-[#e8eaf1] bg-white shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="border-b border-[#e8eaf1] p-4">
            <h3 className="text-sm font-bold text-[#0e111d]">Thông báo</h3>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[#e8eaf1]">
            <button
              onClick={() => setActiveTab("all")}
              className={`flex-1 px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === "all"
                  ? "border-[#ff8d28] text-[#ff8d28]"
                  : "border-transparent text-gray-600 hover:text-[#0e111d]"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setActiveTab("unread")}
              className={`flex-1 px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === "unread"
                  ? "border-[#ff8d28] text-[#ff8d28]"
                  : "border-transparent text-gray-600 hover:text-[#0e111d]"
              }`}
            >
              Chưa đọc {unreadCount > 0 && <span className="text-[#ff8d28]">({unreadCount})</span>}
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {displayNotifications.length > 0 ? (
              <ul className="divide-y divide-[#e8eaf1]">
                {displayNotifications.map((notif) => (
                  <li key={notif.id}>
                    <button
                      onClick={() => handleNotificationClick(notif)}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors relative ${
                        !notif.is_read ? "bg-[#fffbf5]" : ""
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notif.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#0e111d] line-clamp-1">
                            {notif.title}
                          </p>
                          <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                            {notif.message}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-1">
                            {new Date(notif.created_at).toLocaleString("vi-VN")}
                          </p>
                        </div>
                        {!notif.is_read && (
                          <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[#ff8d28] mt-1.5" />
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center">
                <svg
                  className="w-12 h-12 mx-auto mb-2 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0018 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <p className="text-sm text-gray-500">
                  {activeTab === "unread" ? "Không có thông báo chưa đọc" : "Không có thông báo"}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.some((n) => !n.is_read) && (
            <div className="border-t border-[#e8eaf1] p-3">
              <button
                onClick={handleMarkAllAsRead}
                className="w-full text-center px-4 py-2 text-xs font-semibold text-[#ff8d28] hover:bg-[#fff9f4] rounded-lg transition-colors"
              >
                Đánh dấu tất cả là đã đọc
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
