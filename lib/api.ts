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
    update: (id: string, data: any) => request(`/admin/reports/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
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

  // Admin User APIs
  users: {
    getAll: (params?: Record<string, any>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return request(`/admin/users${query}`);
    },
    getStats: () => request('/admin/users/stats'),
    getById: (id: string) => request(`/admin/users/${id}`),
    create: (data: any) => request('/admin/users', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    updateStatus: (id: string, status: string) =>
      request(`/admin/users/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    resetPassword: (id: string, newPassword: string) =>
      request(`/admin/users/${id}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ newPassword }),
      }),
    delete: (id: string) => request(`/admin/users/${id}`, { method: 'DELETE' }),
  },

  // Admin Refund APIs
  refunds: {
    getAll: (params?: Record<string, any>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return request(`/admin/refunds${query}`);
    },
    getStats: () => request('/admin/refunds/stats'),
    getById: (id: string) => request(`/admin/refunds/${id}`),
    create: (data: any) => request('/admin/refunds', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request(`/admin/refunds/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    updateStatus: (id: string, status: string, admin_note?: string) =>
      request(`/admin/refunds/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, admin_note }),
      }),
    approve: (id: string, admin_note?: string) =>
      request(`/admin/refunds/${id}/approve`, {
        method: 'POST',
        body: JSON.stringify({ admin_note }),
      }),
    process: (id: string, admin_note?: string, refund_transaction_code?: string) =>
      request(`/admin/refunds/${id}/process`, {
        method: 'POST',
        body: JSON.stringify({ admin_note, refund_transaction_code }),
      }),
    reject: (id: string, admin_note: string) =>
      request(`/admin/refunds/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ admin_note }),
      }),
    delete: (id: string) => request(`/admin/refunds/${id}`, { method: 'DELETE' }),
  },

  // Admin Review APIs
  reviews: {
    getAll: (params?: Record<string, any>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return request(`/admin/reviews${query}`);
    },
    getStats: () => request('/admin/reviews/stats'),
    getById: (id: number) => request(`/admin/reviews/${id}`),
    update: (id: number, data: any) => request(`/admin/reviews/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    toggleHide: (id: number, is_hidden: boolean) =>
      request(`/admin/reviews/${id}/hide`, {
        method: 'PATCH',
        body: JSON.stringify({ is_hidden }),
      }),
    delete: (id: number) => request(`/admin/reviews/${id}`, { method: 'DELETE' }),
  },

  // Admin AI Moderation APIs
  aiModeration: {
    getAll: (params?: Record<string, any>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return request(`/admin/ai-moderation${query}`);
    },
    getStats: () => request('/admin/ai-moderation/stats'),
    getFlagged: () => request('/admin/ai-moderation/flagged'),
    getById: (id: string) => request(`/admin/ai-moderation/${id}`),
    updateDecision: (id: string, decision: string, review_note?: string, reviewed_by?: string) =>
      request(`/admin/ai-moderation/${id}/decision`, {
        method: 'PUT',
        body: JSON.stringify({ decision, review_note, reviewed_by }),
      }),
    bulkUpdate: (ids: string[], decision: string, review_note?: string) =>
      request('/admin/ai-moderation/bulk-update', {
        method: 'POST',
        body: JSON.stringify({ ids, decision, review_note }),
      }),
    delete: (id: string) => request(`/admin/ai-moderation/${id}`, { method: 'DELETE' }),
  },

  // Admin Settings APIs
  settings: {
    getAll: () => request('/admin/settings'),
    getByKey: (key: string) => request(`/admin/settings/${key}`),
    getByCategory: (category: string) => request(`/admin/settings/category/${category}`),
    getPaymentSettings: () => request('/admin/settings/payment'),
    update: (key: string, value: any, description?: string, category?: string, value_type?: string) =>
      request(`/admin/settings/${key}`, {
        method: 'PUT',
        body: JSON.stringify({ value, description, category, value_type }),
      }),
    updatePaymentSettings: (data: any) =>
      request('/admin/settings/payment', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    bulkUpdate: (settings: any[]) =>
      request('/admin/settings/bulk-update', {
        method: 'POST',
        body: JSON.stringify({ settings }),
      }),
    resetToDefaults: (category?: string) =>
      request('/admin/settings/reset', {
        method: 'POST',
        body: JSON.stringify({ category }),
      }),
    delete: (key: string) => request(`/admin/settings/${key}`, { method: 'DELETE' }),
  },

  // Banner APIs
  banners: {
    getActive: () => request('/banners/active'),
    getAll: () => request('/admin/banners'),
    create: (data: any) => request('/admin/banners', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => request(`/admin/banners/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request(`/admin/banners/${id}`, { method: 'DELETE' }),
  },

  // News / Article APIs
  news: {
    getAll: (params?: Record<string, any>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return request(`/admin/news${query}`);
    },
    getById: (id: string | number) => request(`/admin/news/${id}`),
    create: (data: any) => request('/admin/news', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string | number, data: any) => request(`/admin/news/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string | number) => request(`/admin/news/${id}`, { method: 'DELETE' }),
    toggleFeatured: (id: string | number) => request(`/admin/news/${id}/featured`, { method: 'PATCH' }),
  },

  publicNews: {
    getAll: (params?: Record<string, any>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return request(`/news${query}`);
    },
    getById: (id: string | number) => request(`/news/${id}`),
  },

  // Promotion APIs
  promotion: {
    createPayment: (packageType: '7_days' | '30_days') =>
      request('/payments/promote', {
        method: 'POST',
        body: JSON.stringify({ packageType }),
      }),
  },
};
