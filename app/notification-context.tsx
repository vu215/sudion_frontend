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
      const token = typeof window !== "undefined" ? window.localStorage.getItem("sudion_token") : null;
      const sessionRaw = typeof window !== "undefined" ? window.localStorage.getItem("sudion_session") : null;

      // If user is not logged in, clear notifications and don't make unnecessary request
      if (!token && !sessionRaw) {
        setNotifications([]);
        return;
      }

      setIsLoading(true);

      let endpoint = `${API_URL}/notifications/me`;
      let headers: Record<string, string> = {};

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      } else if (sessionRaw) {
        try {
          const session = JSON.parse(sessionRaw);
          if (session?.userId) {
            endpoint = `${API_URL}/notifications/id/${session.userId}`;
          } else if (session?.email) {
            endpoint = `${API_URL}/notifications/user/${session.email}`;
          }
        } catch {
          // ignore
        }
      }

      const response = await fetch(endpoint, {
        headers,
        cache: "no-store",
      });

      if (!response.ok) {
        if (response.status !== 401 && response.status !== 404) {
          console.error("Failed to load notifications:", response.status);
        }
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
        const token = typeof window !== "undefined" ? window.localStorage.getItem("sudion_token") : null;
        const endpoint = token ? `${API_URL}/notifications/me/${id}/read` : `${API_URL}/notifications/${id}/read`;
        const response = await fetch(endpoint, {
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

  // Load immediately, then refresh in the background so campaign/system notifications
  // appear while the user keeps the page open.
  useEffect(() => {
    void loadNotifications();

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void loadNotifications();
      }
    }, 8000);

    const refresh = () => {
      if (document.visibilityState === "visible") {
        void loadNotifications();
      }
    };

    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
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
