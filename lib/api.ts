/**
 * Simple API Client for Frontend
 * Calls to Backend Admin API
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://sudion-backend-production-453b.up.railway.app/api';

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
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('sudion_token') : null;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options?.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
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

  photographerApprovals: {
    getAll: (params?: Record<string, any>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return request(`/admin/photographer-approvals${query}`);
    },
    getById: (id: number) => request(`/admin/photographer-approvals/${id}`),
    approve: (id: number, note?: string) =>
      request(`/admin/photographer-approvals/${id}/approve`, {
        method: 'POST',
        body: JSON.stringify({ note }),
      }),
    reject: (id: number, reason?: string) =>
      request(`/admin/photographer-approvals/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
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
    getPayouts: (params?: Record<string, any>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return request(`/admin/payments/payouts${query}`);
    },
    confirmPayout: (bookingCode: string) =>
      request(`/admin/payments/payouts/${bookingCode}/pay`, { method: 'POST' }),
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

  // Admin Review APIs
  reviews: {
    getAll: (params?: Record<string, any>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return request(`/admin/reviews${query}`);
    },
    getStats: () => request('/admin/reviews/stats'),
    getById: (id: number) => request(`/admin/reviews/${id}`),
    update: (id: number, data: any) => request(`/admin/reviews/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    toggleHide: (id: number, isHidden: boolean) => request(`/admin/reviews/${id}/hide`, {
      method: 'PATCH',
      body: JSON.stringify({ is_hidden: isHidden })
    }),
    delete: (id: number) => request(`/admin/reviews/${id}`, { method: 'DELETE' }),
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
    updateStatus: (id: string, status: string) =>
      request(`/admin/refunds/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    approve: (id: string, adminNote?: string) => request(`/admin/refunds/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ admin_note: adminNote })
    }),
    process: (id: string, adminNote?: string, refundTransactionCode?: string) => request(`/admin/refunds/${id}/process`, {
      method: 'POST',
      body: JSON.stringify({ admin_note: adminNote, refund_transaction_code: refundTransactionCode })
    }),
    reject: (id: string, reason: string) =>
      request(`/admin/refunds/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason, admin_note: reason }),
      }),
    delete: (id: string) => request(`/admin/refunds/${id}`, { method: 'DELETE' }),
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
    updateDecision: (id: string, decision: string, note?: string) =>
      request(`/admin/ai-moderation/${id}/decision`, {
        method: 'PUT',
        body: JSON.stringify({ decision, note }),
      }),
    bulkUpdate: (data: { ids: string[]; decision: string; note?: string }) =>
      request('/admin/ai-moderation/bulk-update', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    delete: (id: string) => request(`/admin/ai-moderation/${id}`, { method: 'DELETE' }),
  },

  // Admin Settings APIs
  settings: {
    getAll: () => request('/admin/settings'),
    getPayment: () => request('/admin/settings/payment'),
    updatePayment: (data: any) => request('/admin/settings/payment', { method: 'PUT', body: JSON.stringify(data) }),
    getByCategory: (category: string) => request(`/admin/settings/category/${category}`),
    reset: () => request('/admin/settings/reset', { method: 'POST' }),
    bulkUpdate: (data: any) => request('/admin/settings/bulk-update', { method: 'POST', body: JSON.stringify(data) }),
    getByKey: (key: string) => request(`/admin/settings/${key}`),
    update: (key: string, value: any) => request(`/admin/settings/${key}`, { method: 'PUT', body: JSON.stringify({ value }) }),
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

  // Promotion APIs
  promotion: {
    createPayment: (packageType: '7_days' | '30_days') =>
      request('/payments/promote', {
        method: 'POST',
        body: JSON.stringify({ packageType }),
      }),
  },

  // Admin Voucher APIs
  vouchers: {
    getAll: (params?: Record<string, any>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return request(`/admin/vouchers${query}`);
    },
    getById: (id: number) => request(`/admin/vouchers/${id}`),
    create: (data: any) => request('/admin/vouchers', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => request(`/admin/vouchers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request(`/admin/vouchers/${id}`, { method: 'DELETE' }),
  },

  // Profile APIs
  profile: {
    becomePhotographer: (data: any) =>
      request('/auth/become-photographer', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Mock Campaign APIs (để chạy giao diện không cần BE)
  campaigns: {
    getAll: async () => {
      await new Promise(r => setTimeout(r, 600));
      if (typeof window === 'undefined') return { success: true, data: [] };
      const data = localStorage.getItem('sudion_campaigns');
      if (!data) {
        const defaultCampaigns = [
          {
            id: "CP001",
            name: "Flash Sale 8/8",
            description: "Giảm giá 20% dịch vụ chụp ảnh cưới",
            campaign_type: "service",
            start_at: "2026-08-08 08:00",
            end_at: "2026-08-09 23:59",
            status: "SCHEDULED",
            created_by: "Super Admin",
            approved_by: "Admin A",
            approved_at: "2026-07-28 14:00",
            created_at: "2026-07-28 10:00"
          },
          {
            id: "CP002",
            name: "Khuyến mãi máy ảnh Sony",
            description: "Khuyến mãi 15% combo body + lens kit Sony",
            campaign_type: "product",
            start_at: "2026-08-15 09:00",
            end_at: "2026-08-18 22:00",
            status: "PENDING_APPROVAL",
            created_by: "Super Admin",
            approved_by: null,
            approved_at: null,
            created_at: "2026-07-29 11:30"
          },
          {
            id: "CP003",
            name: "Mùa Cưới Rực Rỡ 2026",
            description: "Mở rộng mùa cưới 2026 với ưu đãi trọn gói",
            campaign_type: "hybrid",
            start_at: "2026-07-20 00:00",
            end_at: "2026-07-25 23:59",
            status: "COMPLETED",
            created_by: "Super Admin",
            approved_by: "Admin B",
            approved_at: "2026-07-19 15:00",
            created_at: "2026-07-19 09:00"
          }
        ];
        localStorage.setItem('sudion_campaigns', JSON.stringify(defaultCampaigns));
        return { success: true, data: defaultCampaigns };
      }
      return { success: true, data: JSON.parse(data) };
    },
    getById: async (id: string) => {
      await new Promise(r => setTimeout(r, 400));
      if (typeof window === 'undefined') return { success: false, error: 'SSR' };
      const raw = localStorage.getItem('sudion_campaigns') || '[]';
      const campaigns = JSON.parse(raw);
      const camp = campaigns.find((c: any) => c.id === id);
      if (!camp) return { success: false, error: 'Không tìm thấy chiến dịch' };

      // Get additional mock detail elements
      const mockContents = [
        { campaign_id: id, content_type: "BANNER_COPY", title: "Ưu đãi Flash Sale", content: camp.description, image_url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80", ai_generated: true },
        { campaign_id: id, content_type: "EMAIL_BODY", title: "Thư mời ưu đãi", content: `Chào bạn, cơ hội duy nhất giảm giá sâu dịch vụ của Sudion trong chiến dịch ${camp.name}! Đặt lịch ngay kẻo lỡ.`, ai_generated: true },
        { campaign_id: id, content_type: "NOTIFICATION_BODY", title: "Thông báo in-app", content: `🎁 ${camp.name} đã được kích hoạt! Giảm ngay dịch vụ & sản phẩm hot.`, ai_generated: true }
      ];

      const mockPromotions = [
        { discount_type: camp.campaign_type === 'product' ? 'fixed_amount' : 'percentage', discount_value: camp.campaign_type === 'product' ? 1500000 : 20, target_type: camp.campaign_type === 'product' ? 'product' : 'category', target_ids: camp.campaign_type === 'product' ? 'Máy ảnh Sony A7C' : 'Chụp ảnh cưới' }
      ];

      const mockSchedules = [
        { action_type: "PUBLISH_BANNER", scheduled_at: camp.start_at, executed_at: camp.status === "COMPLETED" || camp.status === "ACTIVE" ? camp.start_at : null, status: camp.status === "COMPLETED" || camp.status === "ACTIVE" ? "SUCCESS" : "PENDING" },
        { action_type: "ACTIVATE_DISCOUNT", scheduled_at: camp.start_at, executed_at: camp.status === "COMPLETED" || camp.status === "ACTIVE" ? camp.start_at : null, status: camp.status === "COMPLETED" || camp.status === "ACTIVE" ? "SUCCESS" : "PENDING" },
        { action_type: "SEND_NOTIFICATION", scheduled_at: camp.start_at, executed_at: camp.status === "COMPLETED" || camp.status === "ACTIVE" ? camp.start_at : null, status: camp.status === "COMPLETED" || camp.status === "ACTIVE" ? "SUCCESS" : "PENDING" },
        { action_type: "DEACTIVATE_DISCOUNT", scheduled_at: camp.end_at, executed_at: camp.status === "COMPLETED" ? camp.end_at : null, status: camp.status === "COMPLETED" ? "SUCCESS" : "PENDING" },
        { action_type: "REMOVE_BANNER", scheduled_at: camp.end_at, executed_at: camp.status === "COMPLETED" ? camp.end_at : null, status: camp.status === "COMPLETED" ? "SUCCESS" : "PENDING" }
      ];

      const mockAudience = {
        audience_type: "Tất cả khách hàng quan tâm",
        conditions: camp.campaign_type === 'product' ? "Khách hàng đã xem máy ảnh trong 30 ngày qua" : "Cặp đôi đang tìm dịch vụ cưới tại Hà Nội và TP.HCM"
      };

      const mockMetrics = camp.status === "COMPLETED" ? {
        views: 15420,
        clicks: 2135,
        bookings: 148,
        orders: 45,
        revenue: 284500000,
        conversion_rate: 13.8
      } : camp.status === "ACTIVE" ? {
        views: 3420,
        clicks: 458,
        bookings: 23,
        orders: 8,
        revenue: 42000000,
        conversion_rate: 13.4
      } : {
        views: 0,
        clicks: 0,
        bookings: 0,
        orders: 0,
        revenue: 0,
        conversion_rate: 0
      };

      return {
        success: true,
        data: {
          ...camp,
          contents: mockContents,
          promotions: mockPromotions,
          schedules: mockSchedules,
          audience: mockAudience,
          metrics: mockMetrics
        }
      };
    },
    generate: async (prompt: string) => {
      await new Promise(r => setTimeout(r, 2200)); // Simulate AI calculation

      const isProduct = prompt.toLowerCase().includes('máy ảnh') || prompt.toLowerCase().includes('sản phẩm');
      const isService = prompt.toLowerCase().includes('cưới') || prompt.toLowerCase().includes('couple') || prompt.toLowerCase().includes('chụp');

      let campaign_type = "hybrid";
      if (isProduct && !isService) campaign_type = "product";
      if (isService && !isProduct) campaign_type = "service";

      const today = new Date();
      const start = new Date(today);
      start.setDate(today.getDate() + 3);
      const end = new Date(start);
      end.setDate(start.getDate() + 2);

      const formatDateStr = (d: Date, hour = "08:00") => {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${hour}`;
      };

      const plan = {
        name: isProduct && isService ? "Flash Sale Mùa Cưới & Máy Ảnh" : isProduct ? "Ngày Hội Công Nghệ Ảnh" : "Ưu Đãi Trọn Gói Mùa Cưới",
        description: isProduct && isService
          ? "Giảm 20% gói chụp cưới và 15% combo máy ảnh phụ kiện."
          : isProduct
            ? "Khuyến mãi 15% thiết bị quay chụp máy ảnh Sony và lens kit."
            : "Khuyến mãi 20% tất cả gói chụp cưới ngoại cảnh và ảnh đôi.",
        campaign_type,
        start_at: formatDateStr(start, "08:00"),
        end_at: formatDateStr(end, "23:59"),
        discount_value: isService ? 20 : 15,
        target_group: isProduct && isService
          ? "Khách hàng quan tâm máy ảnh Sony và cặp đôi chuẩn bị cưới tại Hà Nội, TP.HCM."
          : isProduct
            ? "Người dùng đã xem danh mục camera, lens hoặc có thiết bị trong giỏ hàng."
            : "Người dùng thích chụp ảnh ngoại cảnh, cặp đôi đã lưu nhiếp ảnh gia yêu thích.",
        projection: {
          views: 12000,
          clicks: 1500,
          bookings: campaign_type === 'product' ? 0 : 120,
          orders: campaign_type === 'service' ? 0 : 85,
          revenue: campaign_type === 'product' ? 120000000 : campaign_type === 'service' ? 240000000 : 360000000,
          conversion_rate: 12.5
        },
        contents: [
          {
            content_type: "BANNER_COPY",
            title: isProduct && isService ? "SIÊU HỘI FLASH SALE MÙA CƯỚI" : isProduct ? "TUẦN LỄ THIẾT BỊ HÌNH ẢNH" : "UYÊN ƯƠNG SÁNH ĐÔI - ƯU ĐÃI TRỌN GÓI",
            content: isProduct && isService
              ? "Cơ hội có một không hai! Giảm ngay 20% tất cả gói chụp cưới chuyên nghiệp từ Studio hàng đầu và giảm 15% combo máy ảnh phụ kiện chính hãng Sony. Giữ lịch ngay chỉ với 50% cọc."
              : isProduct
                ? "Nâng cấp bộ đồ nghề chụp ảnh của bạn ngay hôm nay! Giảm 15% body Sony Alpha và tặng kèm thẻ nhớ 64GB tốc độ cao."
                : "Lưu giữ khoảnh khắc hạnh phúc trọn vẹn tại Đà Lạt, Nha Trang. Giảm giá 20% khi đăng ký đặt lịch dịch vụ cưới ngoại cảnh trọn gói."
          },
          {
            content_type: "NOTIFICATION_BODY",
            title: "Ưu đãi giới hạn vừa kích hoạt! ",
            content: isProduct && isService
              ? "Flash sale giảm giá 20% gói chụp cưới và 15% combo thiết bị Sony đã chính thức bắt đầu. Đặt lịch và mua sắm ngay!"
              : isProduct
                ? "Tuần lễ thiết bị bắt đầu! Giảm 15% combo máy ảnh & lens Sony. Số lượng có hạn!"
                : "Lưu giữ câu chuyện tình yêu của bạn với ưu đãi giảm 20% gói chụp cưới ngoại cảnh. Số lượng photographer tài trợ có hạn!"
          },
          {
            content_type: "EMAIL_BODY",
            title: " [Sudion] Bật mí chương trình ưu đãi Flash Sale lớn nhất mùa",
            content: `Kính gửi quý khách hàng,\n\nChúng tôi xin gửi tới bạn thông tin sự kiện ưu đãi đặc quyền sắp tới tại Sudion Studio.\n\nThông tin chi tiết:\n- Tên sự kiện: ${isProduct && isService ? "Flash Sale Mùa Cưới & Máy Ảnh" : isProduct ? "Ngày Hội Công Nghệ Ảnh" : "Ưu Đãi Trọn Gói Mùa Cưới"}\n- Thời gian áp dụng: Từ ngày ${formatDateStr(start, "08:00")} đến hết ${formatDateStr(end, "23:59")}.\n- Ưu đãi: Giảm ngay đến ${isService ? "20%" : "15%"} chi phí khi đặt chỗ.\n\nĐừng bỏ lỡ cơ hội giữ chỗ photographer chuyên nghiệp yêu thích nhất của bạn!\n\nTrân trọng,\nĐội ngũ Sudion.`
          }
        ],
        schedules: [
          { action_type: "PUBLISH_BANNER", scheduled_at: formatDateStr(start, "08:00") },
          { action_type: "ACTIVATE_DISCOUNT", scheduled_at: formatDateStr(start, "08:00") },
          { action_type: "SEND_NOTIFICATION", scheduled_at: formatDateStr(start, "08:00") },
          { action_type: "SEND_EMAIL", scheduled_at: formatDateStr(start, "08:00") },
          { action_type: "DEACTIVATE_DISCOUNT", scheduled_at: formatDateStr(end, "23:59") },
          { action_type: "REMOVE_BANNER", scheduled_at: formatDateStr(end, "23:59") }
        ]
      };
      return { success: true, data: plan };
    },
    create: async (data: any) => {
      await new Promise(r => setTimeout(r, 500));
      if (typeof window === 'undefined') return { success: false, error: 'SSR' };
      const raw = localStorage.getItem('sudion_campaigns') || '[]';
      const campaigns = JSON.parse(raw);
      const newCamp = {
        id: `CP${String(campaigns.length + 1).padStart(3, '0')}`,
        name: data.name,
        description: data.description,
        campaign_type: data.campaign_type || "service",
        start_at: data.start_at,
        end_at: data.end_at,
        status: data.status || "DRAFT",
        created_by: "Super Admin",
        approved_by: data.status === "SCHEDULED" ? "Super Admin" : null,
        approved_at: data.status === "SCHEDULED" ? new Date().toISOString().replace('T', ' ').slice(0, 19) : null,
        created_at: new Date().toISOString().replace('T', ' ').slice(0, 19)
      };
      campaigns.unshift(newCamp);
      localStorage.setItem('sudion_campaigns', JSON.stringify(campaigns));
      return { success: true, data: newCamp };
    },
    approve: async (id: string) => {
      await new Promise(r => setTimeout(r, 400));
      if (typeof window === 'undefined') return { success: false, error: 'SSR' };
      const raw = localStorage.getItem('sudion_campaigns') || '[]';
      const campaigns = JSON.parse(raw);
      const campIndex = campaigns.findIndex((c: any) => c.id === id);
      if (campIndex === -1) return { success: false, error: 'Không tìm thấy chiến dịch' };
      campaigns[campIndex].status = "SCHEDULED";
      campaigns[campIndex].approved_by = "Super Admin";
      campaigns[campIndex].approved_at = new Date().toISOString().replace('T', ' ').slice(0, 19);
      localStorage.setItem('sudion_campaigns', JSON.stringify(campaigns));
      return { success: true, data: campaigns[campIndex] };
    },
    delete: async (id: string) => {
      await new Promise(r => setTimeout(r, 400));
      if (typeof window === 'undefined') return { success: false, error: 'SSR' };
      const raw = localStorage.getItem('sudion_campaigns') || '[]';
      let campaigns = JSON.parse(raw);
      campaigns = campaigns.filter((c: any) => c.id !== id);
      localStorage.setItem('sudion_campaigns', JSON.stringify(campaigns));
      return { success: true };
    },
    getReport: async (id: string) => {
      await new Promise(r => setTimeout(r, 1500));
      if (typeof window === 'undefined') return { success: false, error: 'SSR' };
      const raw = localStorage.getItem('sudion_campaigns') || '[]';
      const campaigns = JSON.parse(raw);
      const camp = campaigns.find((c: any) => c.id === id);
      if (!camp) return { success: false, error: 'Không tìm thấy chiến dịch' };

      const report = {
        executive_summary: `Chiến dịch "${camp.name}" đã hoàn thành xuất sắc mục tiêu đề ra. Việc áp dụng giảm giá tạm thời kết hợp gửi thông báo in-app và email vào khung giờ vàng (8:00 sáng) mang lại tỷ lệ chuyển đổi cao vượt kỳ vọng.`,
        strengths: [
          `Lượt tiếp cận và click đạt mức cao nhờ tiêu đề đánh trúng tâm lý khách hàng mùa cưới.`,
          `Tỷ lệ chuyển đổi booking chụp ảnh cưới đạt 13.8%, vượt mức trung bình ngành (khoảng 10%).`,
          `Doanh thu ghi nhận tăng trưởng vượt bậc trong suốt 3 ngày diễn ra chương trình.`
        ],
        weaknesses: [
          `Khung giờ tối muộn ghi nhận lượt click mua sắm thiết bị máy ảnh giảm nhẹ, cho thấy nhóm đối tượng công nghệ ưa thích tương tác ban ngày.`,
          `Một số photographer có lượt đặt lịch tăng đột biến dẫn đến quá tải lịch chụp tạm thời.`
        ],
        recommendations: `Đối với chiến dịch tiếp theo, khuyến nghị tăng cường cá nhân hóa email tiếp thị tới nhóm khách hàng đã thêm sản phẩm vào danh sách yêu thích hơn 14 ngày. Đồng thời, cấu hình thêm bộ lọc giới hạn số lượng booking tối đa trên mỗi photographer trong ngày để tránh quá tải.`
      };

      return { success: true, data: report };
    }
  },

  // Mock Revenue & 2-stage Payment APIs
  revenue: {
    getPolicy: async () => {
      await new Promise(r => setTimeout(r, 300));
      if (typeof window === 'undefined') return { success: true, data: { enabled: true, stage1_pct: 40, stage2_pct: 60 } };
      const data = localStorage.getItem('sudion_revenue_policy');
      if (!data) {
        const defaultPolicy = { enabled: true, stage1_pct: 40, stage2_pct: 60 };
        localStorage.setItem('sudion_revenue_policy', JSON.stringify(defaultPolicy));
        return { success: true, data: defaultPolicy };
      }
      return { success: true, data: JSON.parse(data) };
    },
    updatePolicy: async (policy: { enabled: boolean; stage1_pct: number; stage2_pct: number }) => {
      await new Promise(r => setTimeout(r, 500));
      if (typeof window === 'undefined') return { success: false };
      localStorage.setItem('sudion_revenue_policy', JSON.stringify(policy));

      const rawBookings = localStorage.getItem('sudion_revenue_bookings_v2');
      if (rawBookings) {
        const bookings = JSON.parse(rawBookings);
        const updated = bookings.map((b: any) => {
          b.deposit_pct = policy.stage1_pct;
          return b;
        });
        localStorage.setItem('sudion_revenue_bookings_v2', JSON.stringify(updated));
      }
      return { success: true, data: policy };
    },
    getBookingsRevenue: async () => {
      if (typeof window === 'undefined') return { success: true, data: [] };

      try {
        // Try to fetch bookings from actual backend
        const bookingsRes = await api.bookings.getAll({ page: 1, pageSize: 100 });
        if (bookingsRes.success && bookingsRes.data) {
          const rawBookings = bookingsRes.data as any[];

          let paymentsList: any[] = [];
          try {
            const paymentsRes = await api.payments.getAll({ page: 1, pageSize: 200 });
            if (paymentsRes.success && paymentsRes.data) {
              paymentsList = paymentsRes.data as any[];
            }
          } catch (_) {
            // Ignore payments fetch error and use status fallback
          }

          const policyRaw = localStorage.getItem('sudion_revenue_policy');
          const policy = policyRaw ? JSON.parse(policyRaw) : { enabled: true, stage1_pct: 30, stage2_pct: 70 };
          const defaultPct = policy.stage1_pct || 30;

          const calculated = rawBookings.map((b: any) => {
            const id = b.booking_code || b.id;
            const total_amount = Number(b.estimated_total || b.base_price || 0);

            // Find payments for this booking
            const bookingPayments = paymentsList.filter((p: any) => p.booking_code === id && p.status === 'completed');

            // Compute customer_paid based on actual payments
            let customer_paid = bookingPayments.reduce((sum, p) => sum + Number(p.amount), 0);

            // Fallback: If no payments records exist in db, infer paid amount from booking status to ensure functional UI
            if (customer_paid === 0) {
              if (b.status === 'fully_paid' || b.status === 'completed') {
                customer_paid = total_amount;
              } else if (b.status === 'confirmed' || b.status === 'accepted') {
                const depAmount = Number(b.deposit_amount || 0);
                customer_paid = depAmount > 0 ? depAmount : Math.round(total_amount * (defaultPct / 100));
              }
            }

            const depAmount = Number(b.deposit_amount || 0);
            const deposit_pct = depAmount > 0 && total_amount > 0 ? Math.round((depAmount / total_amount) * 100) : defaultPct;
            const required_deposit = depAmount > 0 ? depAmount : Math.round(total_amount * deposit_pct / 100);

            let deposit_status = "NOT_PAID";
            if (customer_paid >= required_deposit) {
              deposit_status = "PAID";
            } else if (customer_paid > 0) {
              deposit_status = "PARTIALLY_PAID";
            }

            let booking_status: "FULLY_PAID" | "CONFIRMED" | "PENDING_PAYMENT" = "PENDING_PAYMENT";
            if (b.status === 'fully_paid' || b.status === 'completed' || customer_paid >= total_amount) {
              booking_status = "FULLY_PAID";
            } else if (b.status === 'confirmed' || b.status === 'accepted' || customer_paid >= required_deposit) {
              booking_status = "CONFIRMED";
            }

            const platform_fee_required = Math.round(total_amount * 0.1);
            const platform_fee_collected = customer_paid >= platform_fee_required ? platform_fee_required : customer_paid;

            const photographer_total = Math.round(total_amount * 0.9);
            const photographer_held = Math.max(customer_paid - platform_fee_collected, 0);

            const isPhotographerPaid = b.payout_status === 'paid';
            const photographer_paid_amount = isPhotographerPaid ? photographer_total : 0;
            const photographer_remaining = Math.max(photographer_total - photographer_paid_amount, 0);

            return {
              id,
              customer: b.customer_full_name || "Khách hàng",
              service: b.service_name || "Dịch vụ chụp ảnh",
              total_amount,
              deposit_pct,
              customer_paid,
              photographer_paid_amount,
              created_at: b.created_at || new Date().toISOString(),
              required_deposit,
              deposit_status,
              booking_status,
              platform_fee_required,
              platform_fee_collected,
              photographer_total,
              photographer_held,
              photographer_remaining,
              remaining_to_pay: Math.max(total_amount - customer_paid, 0)
            };
          });

          return { success: true, data: calculated };
        }
      } catch (err) {
        console.warn("Backend API not reachable or unauthorized. Falling back to mock data.", err);
      }

      // FALLBACK TO LOCAL STORAGE MOCK DATA IF BACKEND CALL FAILS
      let data = localStorage.getItem('sudion_revenue_bookings_v2');
      if (!data) {
        const policyRaw = localStorage.getItem('sudion_revenue_policy');
        const policy = policyRaw ? JSON.parse(policyRaw) : { enabled: true, stage1_pct: 30, stage2_pct: 70 };
        const defaultBookings = [
          { id: "BK001", customer: "Lê Minh Tuấn", service: "Chụp ảnh cưới Đà Lạt trọn gói", total_amount: 10000000, deposit_pct: 30, customer_paid: 3000000, photographer_paid_amount: 0, created_at: "2026-07-10 10:00" },
          { id: "BK002", customer: "Nguyễn Thị Mai", service: "Chụp ảnh kỷ yếu cá nhân studio", total_amount: 8000000, deposit_pct: 50, customer_paid: 4000000, photographer_paid_amount: 0, created_at: "2026-07-05 09:00" },
          { id: "BK003", customer: "Phạm Minh Hoàng", service: "Chụp ảnh cưới Couple Phim Trường", total_amount: 5000000, deposit_pct: 100, customer_paid: 5000000, photographer_paid_amount: 0, created_at: "2026-06-25 15:30" },
          { id: "BK004", customer: "Đỗ Vân Anh", service: "Chụp ảnh gia đình dã ngoại ngoại cảnh", total_amount: 10000000, deposit_pct: 30, customer_paid: 2000000, photographer_paid_amount: 0, created_at: "2026-07-15 08:30" },
          { id: "BK005", customer: "Trần Huy Hoàng", service: "Chụp ảnh sản phẩm commercial", total_amount: 6000000, deposit_pct: 50, customer_paid: 0, photographer_paid_amount: 0, created_at: "2026-07-20 14:00" }
        ];
        localStorage.setItem('sudion_revenue_bookings_v2', JSON.stringify(defaultBookings));
        data = JSON.stringify(defaultBookings);
      }

      const parsedBookings = JSON.parse(data);
      const calculated = parsedBookings.map((b: any) => {
        const required_deposit = Math.round(b.total_amount * b.deposit_pct / 100);
        let deposit_status = "NOT_PAID";
        if (b.customer_paid >= required_deposit) {
          deposit_status = "PAID";
        } else if (b.customer_paid > 0) {
          deposit_status = "PARTIALLY_PAID";
        }

        let booking_status = "PENDING_PAYMENT";
        if (b.customer_paid >= b.total_amount) {
          booking_status = "FULLY_PAID";
        } else if (b.customer_paid >= required_deposit) {
          booking_status = "CONFIRMED";
        }

        const platform_fee_required = Math.round(b.total_amount * 0.1);
        const platform_fee_collected = b.customer_paid >= platform_fee_required ? platform_fee_required : b.customer_paid;

        const photographer_total = Math.round(b.total_amount * 0.9);
        const photographer_held = Math.max(b.customer_paid - platform_fee_collected, 0);
        const photographer_remaining = Math.max(photographer_total - b.photographer_paid_amount, 0);

        return {
          ...b,
          required_deposit,
          deposit_status,
          booking_status,
          platform_fee_required,
          platform_fee_collected,
          photographer_total,
          photographer_held,
          photographer_remaining,
          remaining_to_pay: Math.max(b.total_amount - b.customer_paid, 0)
        };
      });
      return { success: true, data: calculated };
    },
    collectPayment: async (bookingId: string, amount: number) => {
      try {
        const bookingRes = await api.bookings.getById(bookingId);
        if (bookingRes.success && bookingRes.data) {
          const b = bookingRes.data as any;
          const total_amount = Number(b.estimated_total || b.base_price || 0);
          const depAmount = Number(b.deposit_amount || 0);
          const required_deposit = depAmount > 0 ? depAmount : Math.round(total_amount * 0.3);

          let currentPaid = 0;
          if (b.status === 'fully_paid' || b.status === 'completed') {
            currentPaid = total_amount;
          } else if (b.status === 'confirmed' || b.status === 'accepted') {
            currentPaid = required_deposit;
          }

          const newPaid = currentPaid + amount;
          let nextStatus = b.status;
          if (newPaid >= total_amount) {
            nextStatus = "fully_paid";
          } else if (newPaid >= required_deposit) {
            nextStatus = "confirmed";
          }

          const res = await api.bookings.updateStatus(bookingId, nextStatus);
          if (res.success) return res;
        }
      } catch (_) {
        // Fall back to local storage
      }

      if (typeof window === 'undefined') return { success: false };
      const raw = localStorage.getItem('sudion_revenue_bookings_v2');
      if (!raw) return { success: false, error: 'Không tìm thấy dữ liệu' };
      const bookings = JSON.parse(raw);
      const bIndex = bookings.findIndex((b: any) => b.id === bookingId);
      if (bIndex === -1) return { success: false, error: 'Không tìm thấy booking' };

      bookings[bIndex].customer_paid = Math.min(bookings[bIndex].customer_paid + amount, bookings[bIndex].total_amount);
      localStorage.setItem('sudion_revenue_bookings_v2', JSON.stringify(bookings));
      return { success: true };
    },
    payoutPhotographer: async (bookingId: string) => {
      try {
        const res = await api.payments.confirmPayout(bookingId);
        if (res.success) return res;
      } catch (_) {
        // Fall back to local storage
      }

      if (typeof window === 'undefined') return { success: false };
      const raw = localStorage.getItem('sudion_revenue_bookings_v2');
      if (!raw) return { success: false, error: 'Không tìm thấy dữ liệu' };
      const bookings = JSON.parse(raw);
      const bIndex = bookings.findIndex((b: any) => b.id === bookingId);
      if (bIndex === -1) return { success: false, error: 'Không tìm thấy booking' };

      const photographer_total = Math.round(bookings[bIndex].total_amount * 0.9);
      bookings[bIndex].photographer_paid_amount = photographer_total;
      localStorage.setItem('sudion_revenue_bookings_v2', JSON.stringify(bookings));
      return { success: true };
    },
    sendRemindEmail: async (bookingId: string) => {
      await new Promise(r => setTimeout(r, 600));
      return { success: true, message: `Đã gửi email thông báo thanh toán thành công cho Booking ${bookingId}!` };
    }
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
};

