"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export type NotificationType = "booking" | "payment" | "refund" | "system";

export interface Notification {
  id: string | number;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  metadata?: {
    booking_id?: string | number;
    page_url?: string;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  loadNotifications: () => Promise<void>;
  markAsRead: (id: string | number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string | number) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  function authHeaders() {
    const token = typeof window !== "undefined" ? window.localStorage.getItem("sudion_token") : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  const loadNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/notifications`, {
        headers: authHeaders(),
        cache: "no-store",
      });

      if (!response.ok) {
        console.error("Failed to load notifications:", response.status);
        return;
      }

      const json = await response.json();
      if (json.success && Array.isArray(json.data)) {
        // Sort by created_at descending (newest first)
        const sorted = (json.data as Notification[]).sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setNotifications(sorted);
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, [API_URL]);

  const markAsRead = useCallback(
    async (id: string | number) => {
      try {
        const response = await fetch(`${API_URL}/notifications/${id}/read`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
          },
        });

        if (response.ok) {
          setNotifications((prev) =>
            prev.map((notif) => (notif.id === id ? { ...notif, is_read: true } : notif))
          );
        }
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    },
    [API_URL]
  );

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/notifications/read-all`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
      });

      if (response.ok) {
        setNotifications((prev) => prev.map((notif) => ({ ...notif, is_read: true })));
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  }, [API_URL]);

  const deleteNotification = useCallback(
    async (id: string | number) => {
      try {
        const response = await fetch(`${API_URL}/notifications/${id}`, {
          method: "DELETE",
          headers: authHeaders(),
        });

        if (response.ok) {
          setNotifications((prev) => prev.filter((notif) => notif.id !== id));
        }
      } catch (error) {
        console.error("Error deleting notification:", error);
      }
    },
    [API_URL]
  );

  // Load notifications on mount
  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        loadNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
}
