/**
 * Simple API Client for Frontend
 * Calls to Backend Admin API
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export const api = {
  // Admin Booking APIs
  bookings: {
    getAll: (params?: Record<string, any>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return request(`/admin/bookings${query}`);
    },
    getStats: () => request('/admin/bookings/stats'),
    getById: (id: string) => request(`/admin/bookings/${id}`),
    create: (data: any) => request('/admin/bookings', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request(`/admin/bookings/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    updateStatus: (id: string, status: string) =>
      request(`/admin/bookings/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    delete: (id: string) => request(`/admin/bookings/${id}`, { method: 'DELETE' }),
  },

  // Admin Photographer APIs
  photographers: {
    getAll: (params?: Record<string, any>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return request(`/admin/photographers${query}`);
    },
    getStats: () => request('/admin/photographers/stats'),
    getById: (id: number) => request(`/admin/photographers/${id}`),
    create: (data: any) => request('/admin/photographers', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => request(`/admin/photographers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    updateStatus: (id: number, status: string) =>
      request(`/admin/photographers/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    verify: (id: number) => request(`/admin/photographers/${id}/verify`, { method: 'POST' }),
    reject: (id: number, reason?: string) => request(`/admin/photographers/${id}/reject`, { 
      method: 'POST',
      body: JSON.stringify({ reason })
    }),
    lock: (id: number, reason?: string) => request(`/admin/photographers/${id}/lock`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    }),
    unlock: (id: number) => request(`/admin/photographers/${id}/unlock`, { method: 'POST' }),
    delete: (id: number) => request(`/admin/photographers/${id}`, { method: 'DELETE' }),
    getPortfolio: (id: number) => request(`/admin/photographers/${id}/portfolio`),
    getServices: (id: number) => request(`/admin/photographers/${id}/services`),
    getReviews: (id: number) => request(`/admin/photographers/${id}/reviews`),
    getBookings: (id: number) => request(`/admin/photographers/${id}/bookings`),
  },

  // Admin Notification APIs
  notifications: {
    getAll: (params?: Record<string, any>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return request(`/admin/notifications${query}`);
    },
    getStats: () => request('/admin/notifications/stats'),
    getById: (id: string) => request(`/admin/notifications/${id}`),
    create: (data: any) => request('/admin/notifications', { method: 'POST', body: JSON.stringify(data) }),
    markAsRead: (id: string) =>
      request(`/admin/notifications/${id}/read`, { method: 'PATCH' }),
    markAsUnread: (id: string) =>
      request(`/admin/notifications/${id}/unread`, { method: 'PATCH' }),
    markAllAsRead: () =>
      request('/admin/notifications/mark-all-read', { method: 'POST' }),
    delete: (id: string) => request(`/admin/notifications/${id}`, { method: 'DELETE' }),
    bulkDelete: (ids: string[]) => request('/admin/notifications/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ ids })
    }),
  },

  // Admin Payment APIs
  payments: {
    getAll: (params?: Record<string, any>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return request(`/admin/payments${query}`);
    },
    getStats: () => request('/admin/payments/stats'),
    getById: (id: string) => request(`/admin/payments/${id}`),
    getByBooking: (bookingId: string) => request(`/admin/payments/booking/${bookingId}`),
    processRefund: (paymentId: string, amount: number, reason: string) =>
      request(`/admin/payments/${paymentId}/refund`, {
        method: 'POST',
        body: JSON.stringify({ amount, reason })
      }),
  },

  // Admin Report APIs
  reports: {
    getAll: (params?: Record<string, any>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return request(`/admin/reports${query}`);
    },
    getStats: () => request('/admin/reports/stats'),
    getById: (id: string) => request(`/admin/reports/${id}`),
    updateStatus: (id: string, status: string, admin_note?: string) =>
      request(`/admin/reports/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, admin_note })
      }),
    resolve: (id: string, resolution_note: string, action_taken: string) =>
      request(`/admin/reports/${id}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ resolution_note, action_taken })
      }),
    reject: (id: string, reason: string) =>
      request(`/admin/reports/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason })
      }),
    delete: (id: string) => request(`/admin/reports/${id}`, { method: 'DELETE' }),
  },

  // Admin Log APIs
  logs: {
    getAll: (params?: Record<string, any>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return request(`/admin/logs${query}`);
    },
    getStats: () => request('/admin/logs/stats'),
    getById: (id: string) => request(`/admin/logs/${id}`),
    getByUser: (userId: string) => request(`/admin/logs/user/${userId}`),
    getErrors: () => request('/admin/logs/errors'),
    deleteOld: (days: number) =>
      request('/admin/logs/delete-old', {
        method: 'POST',
        body: JSON.stringify({ days })
      }),
  },

  // Admin Service APIs
  services: {
    getAll: (params?: Record<string, any>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return request(`/admin/services${query}`);
    },
    getStats: () => request('/admin/services/stats'),
    getById: (id: number) => request(`/admin/services/${id}`),
    create: (data: any) => request('/admin/services', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => request(`/admin/services/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    updateStatus: (id: number, status: string) =>
      request(`/admin/services/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    delete: (id: number) => request(`/admin/services/${id}`, { method: 'DELETE' }),
  },
};
