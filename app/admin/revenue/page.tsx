"use client";

import { useState, useEffect, useMemo } from "react";
import AdminLayout from "../_components/admin-layout";
import { api } from "@/lib/api";

type BookingRevenueV2 = {
  id: string;
  customer: string;
  service: string;
  total_amount: number;
  deposit_pct: number;
  customer_paid: number;
  photographer_paid_amount: number;
  created_at: string;
  
  // Computed on API
  required_deposit: number;
  deposit_status: "PAID" | "PARTIALLY_PAID" | "NOT_PAID";
  booking_status: "FULLY_PAID" | "CONFIRMED" | "PENDING_PAYMENT";
  platform_fee_required: number;
  platform_fee_collected: number;
  photographer_total: number;
  photographer_held: number;
  photographer_remaining: number;
  remaining_to_pay: number;
};

type Policy = {
  enabled: boolean;
  stage1_pct: number;
  stage2_pct: number;
};

const statusConfig = {
  FULLY_PAID: {
    label: "Đã thanh toán đủ",
    bg: "bg-emerald-50 text-emerald-600 border-emerald-100",
    icon: (
      <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  CONFIRMED: {
    label: "Đã xác nhận",
    bg: "bg-blue-50 text-blue-600 border-blue-100",
    icon: (
      <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z" />
      </svg>
    )
  },
  PENDING_PAYMENT: {
    label: "Chờ thanh toán",
    bg: "bg-amber-50 text-amber-600 border-amber-100",
    icon: (
      <svg className="h-4.5 w-4.5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
};

const depositStatusLabels = {
  PAID: "Đã cọc đủ",
  PARTIALLY_PAID: "Mới cọc một phần",
  NOT_PAID: "Chưa đặt cọc",
};

export default function RevenuePage() {
  const [bookings, setBookings] = useState<BookingRevenueV2[]>([]);
  const [policy, setPolicy] = useState<Policy>({ enabled: true, stage1_pct: 30, stage2_pct: 70 });
  const [loading, setLoading] = useState(true);
  const [policyLoading, setPolicyLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Pagination & Search query states
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    setPage(1);
  }, [query]);

  // Filter based on search query
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const text = [b.id, b.customer, b.service, b.booking_status].join(" ").toLowerCase();
      return text.includes(query.toLowerCase());
    });
  }, [bookings, query]);

  // Paginated bookings slice
  const paginatedBookings = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return filteredBookings.slice(startIndex, startIndex + pageSize);
  }, [filteredBookings, page]);

  const totalPages = Math.ceil(filteredBookings.length / pageSize);

  // Configuration preset and open state
  const [selectedPct, setSelectedPct] = useState<30 | 50 | 100>(30);
  const [policyEnabled, setPolicyEnabled] = useState(true);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  
  // Active selected booking details in Drawer
  const [activeBooking, setActiveBooking] = useState<BookingRevenueV2 | null>(null);
  
  // Action state values
  const [collectAmount, setCollectAmount] = useState<string>("");
  const [processingAction, setProcessingAction] = useState(false);

  // Calculated pct2 based on selectedPct
  const pct2 = useMemo(() => {
    return 100 - selectedPct;
  }, [selectedPct]);

  const loadData = async () => {
    setLoading(true);
    try {
      const policyRes = await (api.revenue as any).getPolicy();
      if (policyRes.success && policyRes.data) {
        setPolicy(policyRes.data);
        setPolicyEnabled(policyRes.data.enabled);
        const pct1Val = policyRes.data.stage1_pct;
        if (pct1Val === 30 || pct1Val === 50 || pct1Val === 100) {
          setSelectedPct(pct1Val);
        } else {
          setSelectedPct(30); // fallback
        }
      }

      const bookingsRes = await (api.revenue as any).getBookingsRevenue();
      if (bookingsRes.success && bookingsRes.data) {
        setBookings(bookingsRes.data);
        
        // If drawer is open, update active booking content as well
        if (activeBooking) {
          const currentActive = (bookingsRes.data as BookingRevenueV2[]).find(b => b.id === activeBooking.id);
          if (currentActive) setActiveBooking(currentActive);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setPolicyLoading(true);
    try {
      const res = await (api.revenue as any).updatePolicy({
        enabled: policyEnabled,
        stage1_pct: selectedPct,
        stage2_pct: pct2
      });
      if (res.success) {
        showToast("Đã lưu cấu hình chính sách thu tiền thành công!");
        setIsConfigOpen(false); // Close settings modal
        const bookingsRes = await (api.revenue as any).getBookingsRevenue();
        if (bookingsRes.success && bookingsRes.data) {
          setBookings(bookingsRes.data);
        }
      } else {
        showToast("Lưu cấu hình chính sách thất bại", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Lỗi hệ thống khi lưu chính sách", "error");
    } finally {
      setPolicyLoading(false);
    }
  };

  const handleCollectPayment = async (bookingId: string, amount: number) => {
    if (amount <= 0) return;
    setProcessingAction(true);
    try {
      const res = await (api.revenue as any).collectPayment(bookingId, amount);
      if (res.success) {
        showToast(`Đã ghi nhận thanh toán ${amount.toLocaleString()}đ thành công và tự động gửi email biên lai đến khách hàng!`);
        setCollectAmount("");
        
        const bookingsRes = await (api.revenue as any).getBookingsRevenue();
        if (bookingsRes.success && bookingsRes.data) {
          setBookings(bookingsRes.data);
          const currentActive = (bookingsRes.data as BookingRevenueV2[]).find(b => b.id === bookingId);
          if (currentActive) setActiveBooking(currentActive);
        }
      } else {
        showToast(res.error || "Ghi nhận thanh toán thất bại", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Lỗi hệ thống khi thu tiền", "error");
    } finally {
      setProcessingAction(false);
    }
  };

  const handlePayoutPhotographer = async (bookingId: string) => {
    setProcessingAction(true);
    try {
      const res = await (api.revenue as any).payoutPhotographer(bookingId);
      if (res.success) {
        showToast(`Đã thanh toán đối soát hoàn tất cho Photographer của Booking ${bookingId}!`);
        const bookingsRes = await (api.revenue as any).getBookingsRevenue();
        if (bookingsRes.success && bookingsRes.data) {
          setBookings(bookingsRes.data);
          const currentActive = (bookingsRes.data as BookingRevenueV2[]).find(b => b.id === bookingId);
          if (currentActive) setActiveBooking(currentActive);
        }
      }
    } catch (err) {
      console.error(err);
      showToast("Lỗi hệ thống đối soát", "error");
    } finally {
      setProcessingAction(false);
    }
  };

  const handleSendReminder = async (bookingId: string) => {
    try {
      const res = await (api.revenue as any).sendRemindEmail(bookingId);
      if (res.success) {
        showToast("Đã gửi lại email hóa đơn và biên lai thành công!");
      }
    } catch (err) {
      console.error(err);
      showToast("Không thể gửi nhắc nhở", "error");
    }
  };

  // KPI calculations
  const metrics = useMemo(() => {
    let expected = 0;
    let stage1 = 0;
    let fees = 0;
    let remaining = 0;

    bookings.forEach(b => {
      expected += b.total_amount;
      stage1 += b.customer_paid;
      fees += b.platform_fee_collected;
      remaining += b.remaining_to_pay;
    });

    return { expected, stage1, fees, remaining };
  }, [bookings]);

  return (
    <AdminLayout active="Quản lý Doanh thu" search={query} onSearch={setQuery}>
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed right-6 top-6 z-[60] flex items-center gap-2.5 rounded-xl px-4 py-3 text-[13px] font-semibold text-white shadow-xl animate-fade-in-down ${
          toast.type === "success" ? "bg-emerald-600 shadow-emerald-600/10" : "bg-red-600 shadow-red-600/10"
        }`}>
          {toast.type === "success" ? (
            <svg className="h-4.5 w-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="h-4.5 w-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header section with configurations integration */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[24px] font-semibold text-slate-900">Quản lý Doanh thu & Chính sách cọc</h1>
          <p className="text-[13px] text-slate-500 mt-1">
            Theo dõi dòng tiền đặt cọc 2 giai đoạn, phân bổ doanh thu nền tảng và đối soát với photographer.
          </p>
        </div>
        <button 
          onClick={() => setIsConfigOpen(true)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-[13px] font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition shadow-xs"
        >
          <svg className="h-4.5 w-4.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Cấu hình đợt cọc
        </button>
      </div>

      {/* Main Full Width Dashboard Content */}
      <div className="space-y-6 w-full max-w-full overflow-hidden">
        {/* KPI Metrics row */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full">
          {[
            { label: "Doanh thu dự tính", value: metrics.expected, desc: "Tổng cộng các booking", color: "text-slate-800" },
            { label: "Khách đã thanh toán", value: metrics.stage1, desc: "Cọc + Thu thêm", color: "text-indigo-600" },
            { label: "Đã thu phí nền tảng", value: metrics.fees, desc: "Phí 10% đã giữ", color: "text-emerald-600" },
            { label: "Nợ cần thu còn lại", value: metrics.remaining, desc: "Chưa thanh toán để lấy ảnh", color: "text-red-500 font-bold" }
          ].map((card, idx) => (
            <div key={idx} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{card.label}</span>
              <div className="text-[20px] font-black tracking-tight mt-1.5" style={{ color: "inherit" }}>
                <span className={card.color}>{card.value.toLocaleString()}đ</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">{card.desc}</span>
            </div>
          ))}
        </div>

        {/* Bookings table container - FULL WIDTH */}
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden w-full max-w-full">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-[14px] font-bold text-slate-800">Theo dõi tiến độ thanh toán</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Khách hàng cần thanh toán nốt Đợt 2 (Còn lại) sau khi chụp xong để lấy ảnh</p>
            </div>
            <span className="text-[11px] text-indigo-600 bg-indigo-50 font-bold px-2.5 py-0.5 rounded-full">
              {filteredBookings.length} Bookings
            </span>
          </div>

          {/* Table Search Row */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/20 flex gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm kiếm booking theo ID, tên khách, dịch vụ..."
                className="w-full h-10 pr-3 rounded-xl border border-slate-200 text-[12px] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
                style={{ paddingLeft: '38px' }}
              />
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center text-slate-400 text-[12px]">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mx-auto mb-3"></div>
              Đang tải dữ liệu doanh thu...
            </div>
          ) : bookings.length === 0 ? (
            <div className="py-20 text-center text-slate-400 text-[12px]">
              Chưa ghi nhận booking nào trong hệ thống.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto w-full scrollbar-thin">
                <table className="w-full text-left border-collapse min-w-[700px] table-fixed">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="px-3 py-3 w-[240px]">Khách hàng & Gói chụp</th>
                      <th className="px-3 py-3 text-right w-[110px]">Tổng tiền</th>
                      <th className="px-3 py-3 text-right w-[135px]">Tiền cọc</th>
                      <th className="px-3 py-3 text-right w-[135px]">Phí nền tảng (10%)</th>
                      <th className="px-3 py-3 text-right w-[110px]">Còn lại</th>
                      <th className="px-3 py-3 text-center w-[100px]">Trạng thái / Xem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[12px]">
                    {paginatedBookings.map(b => {
                      const status = statusConfig[b.booking_status] || {
                        label: b.booking_status,
                        bg: "bg-slate-100 text-slate-700",
                        icon: (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                          </svg>
                        )
                      };
                      
                      return (
                        <tr key={b.id} className="hover:bg-slate-50/30 transition">
                          <td className="px-3 py-3.5">
                            <span className="font-bold text-slate-800 block truncate max-w-[220px]" title={b.customer}>{b.customer}</span>
                            <span className="text-slate-400 text-[11px] block truncate max-w-[220px] mt-0.5" title={b.service}>{b.service}</span>
                            <span className="text-slate-300 text-[9px] font-mono block mt-1 select-all">{b.id}</span>
                          </td>
                          <td className="px-3 py-3.5 text-right">
                            <span className="font-semibold text-slate-800 block">{b.total_amount.toLocaleString()}đ</span>
                            <span className="text-slate-400 text-[10px] block mt-0.5">Cọc {b.deposit_pct}%</span>
                          </td>
                          <td className="px-3 py-3.5 text-right">
                            <div className="text-slate-600 text-[11px]"><span className="text-slate-400 font-normal">Y/c:</span> {b.required_deposit.toLocaleString()}đ</div>
                            <div className={`text-[11.5px] font-bold mt-0.5 ${
                              b.deposit_status === 'PAID' ? 'text-emerald-600' :
                              b.deposit_status === 'PARTIALLY_PAID' ? 'text-amber-500' : 'text-slate-400'
                            }`}>
                              <span className="text-slate-400 font-normal">Đã trả:</span> {b.customer_paid.toLocaleString()}đ
                            </div>
                          </td>
                          <td className="px-3 py-3.5 text-right">
                            <div className="text-slate-500 text-[11px]"><span className="text-slate-400 font-normal">Y/c:</span> {b.platform_fee_required.toLocaleString()}đ</div>
                            <div className={`text-[11.5px] font-bold mt-0.5 ${
                              b.platform_fee_collected >= b.platform_fee_required ? 'text-emerald-600' : 'text-slate-400'
                            }`}>
                              <span className="text-slate-400 font-normal">Đã thu:</span> {b.platform_fee_collected.toLocaleString()}đ
                            </div>
                          </td>
                          <td className="px-3 py-3.5 text-right font-bold text-slate-700">
                            {b.remaining_to_pay.toLocaleString()}đ
                          </td>
                          <td className="px-3 py-3.5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <span className={`inline-flex rounded-xl p-1 border ${status.bg}`} title={status.label}>
                                {status.icon}
                              </span>
                              <button
                                onClick={() => {
                                  setActiveBooking(b);
                                  setCollectAmount("");
                                }}
                                className="inline-flex h-7.5 w-7.5 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50 transition shadow-2xs"
                                title="Xem chi tiết & đối soát"
                              >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination Controls */}
              {filteredBookings.length > 0 && (
                <div className="mt-4 px-5 py-4 border-t border-slate-100 flex items-center justify-between text-[12px] text-slate-500 bg-slate-50/20">
                  <span>
                    Hiển thị {Math.min((page - 1) * pageSize + 1, filteredBookings.length)} - {Math.min(page * pageSize, filteredBookings.length)} của {filteredBookings.length} bookings
                  </span>
                  <div className="flex gap-2">
                    {page > 1 && (
                      <button 
                        onClick={() => setPage(page - 1)} 
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 hover:bg-slate-50 transition font-bold text-slate-700 shadow-2xs"
                      >
                        Trước
                      </button>
                    )}
                    <span className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-1.5 font-bold text-slate-700">
                      Trang {page} / {totalPages || 1}
                    </span>
                    {page < totalPages && (
                      <button 
                        onClick={() => setPage(page + 1)} 
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 hover:bg-slate-50 transition font-bold text-slate-700 shadow-2xs"
                      >
                        Sau
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Settings Modal (Cấu hình chính sách cọc) */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          {/* Backdrop overlay */}
          <div 
            onClick={() => setIsConfigOpen(false)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-fade-in" 
          />
          {/* Modal Body */}
          <div className="relative transform bg-white rounded-2xl p-6 shadow-2xl transition-all max-w-sm w-full animate-scale-up space-y-4 z-10">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <h3 className="text-[15px] font-bold text-slate-900 flex items-center gap-2">
                <svg className="h-4.5 w-4.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Cấu hình đợt cọc
              </h3>
              <button 
                onClick={() => setIsConfigOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form content */}
            <form onSubmit={handleSavePolicy} className="space-y-4">
              {/* Enabled Toggle */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-50">
                <div>
                  <span className="text-[13px] font-bold text-slate-700 block">Chính sách 2 giai đoạn</span>
                  <span className="text-[10px] text-slate-400">Yêu cầu thu cọc đợt 1 để đặt lịch.</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={policyEnabled}
                    onChange={(e) => setPolicyEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* Presets */}
              {policyEnabled && (
                <div className="space-y-3">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">Tỷ lệ cọc Đợt 1</label>
                  <div className="grid grid-cols-3 gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-100">
                    {([30, 50, 100] as const).map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setSelectedPct(preset)}
                        className={`h-9 rounded-lg text-[12px] font-bold transition flex flex-col items-center justify-center ${
                          selectedPct === preset 
                            ? "bg-white text-indigo-600 shadow-sm border border-indigo-50" 
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        <span>{preset}%</span>
                        <span className="text-[8px] opacity-75 font-normal">
                          {preset === 100 ? "Trả trước" : "Đặt cọc"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview */}
              {policyEnabled && (
                <div className="rounded-xl border border-slate-100 p-3 bg-slate-50/50 space-y-2">
                  <div className="flex justify-between text-[12px]">
                    <span className="text-slate-500">Đợt 1 (Tiền cọc):</span>
                    <b className="text-slate-800">{selectedPct}%</b>
                  </div>
                  <div className="flex justify-between text-[12px]">
                    <span className="text-slate-500">Đợt 2 (Lấy ảnh):</span>
                    <b className="text-slate-800">{pct2}%</b>
                  </div>
                  <div className="h-px bg-slate-200 my-1" />
                  <div className="flex justify-between text-[12px] text-emerald-800 font-bold">
                    <span>Tổng cộng:</span>
                    <span>100% / 100%</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={!policyEnabled || policyLoading}
                className="w-full inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 text-white text-[13px] font-bold hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition shadow-md shadow-indigo-600/10"
              >
                {policyLoading ? "Đang lưu..." : "Lưu cấu hình"}
              </button>
            </form>

            {/* Quick rules guide */}
            <div className="rounded-xl border border-slate-100 bg-slate-900 text-white p-4 shadow-sm text-[11px] space-y-1.5 leading-relaxed relative overflow-hidden">
              <div className="absolute right-[-20px] top-[-20px] h-[60px] w-[60px] rounded-full bg-indigo-500/20 blur-xl" />
              <h4 className="font-black text-indigo-300 uppercase tracking-wide">Quy tắc bàn giao</h4>
              <p>* Đợt 1: Khách thanh toán cọc (30% hoặc 50%) để đặt lịch, hoặc trả 100%.</p>
              <p>* Đợt 2: Khách bắt buộc đóng nốt số tiền còn lại sau chụp thì mới được tải ảnh gốc.</p>
            </div>
          </div>
        </div>
      )}

      {/* Booking Reconciliation Detail Drawer */}
      {activeBooking && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop overlay */}
          <div 
            onClick={() => setActiveBooking(null)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-fade-in" 
          />
          
          <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
            <div className="w-screen max-w-md transform bg-white p-6 shadow-2xl transition-all flex flex-col h-full animate-slide-in-right z-10">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[16px] font-bold text-slate-900">Chi tiết đối soát dòng tiền</h2>
                    <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 uppercase">
                      {activeBooking.id}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Khách hàng: {activeBooking.customer}</p>
                </div>
                <button 
                  onClick={() => setActiveBooking(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto py-5 space-y-6 scrollbar-thin">
                {/* block 1: THANH TOÁN CỦA KHÁCH */}
                <div className="rounded-xl border border-slate-100 bg-white p-4.5 shadow-xs">
                  <h4 className="text-[12px] font-extrabold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                    <svg className="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Thanh toán của khách
                  </h4>
                  <div className="space-y-2.5 text-[12px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tổng booking:</span>
                      <b className="text-slate-800">{activeBooking.total_amount.toLocaleString()}đ</b>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Kiểu cọc:</span>
                      <span className="font-semibold text-slate-700">{activeBooking.deposit_pct}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Đã thanh toán:</span>
                      <span className="font-bold text-indigo-600">{activeBooking.customer_paid.toLocaleString()}đ</span>
                    </div>
                    <div className="h-px bg-slate-100 my-1" />
                    <div className="flex justify-between font-bold text-[13px]">
                      <span className="text-slate-800">Còn lại:</span>
                      <span className="text-slate-900">{activeBooking.remaining_to_pay.toLocaleString()}đ</span>
                    </div>
                  </div>
                  
                  {/* Status Indicator */}
                  <div className="mt-3.5 flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                    <span>Trạng thái cọc:</span>
                    <span className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-black uppercase ${
                      activeBooking.deposit_status === 'PAID' ? 'bg-emerald-50 text-emerald-700' : activeBooking.deposit_status === 'PARTIALLY_PAID' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-600'
                    }`}>
                      {depositStatusLabels[activeBooking.deposit_status]}
                    </span>
                  </div>
                </div>

                {/* block 2: DOANH THU NỀN TẢNG */}
                <div className="rounded-xl border border-slate-100 bg-white p-4.5 shadow-xs">
                  <h4 className="text-[12px] font-extrabold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                    <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    Doanh thu nền tảng
                  </h4>
                  <div className="space-y-2.5 text-[12px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Phí áp dụng:</span>
                      <span className="font-semibold text-slate-700">10%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Phí cần thu:</span>
                      <b className="text-slate-800">{activeBooking.platform_fee_required.toLocaleString()}đ</b>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Đã thu:</span>
                      <span className="font-bold text-emerald-600">{activeBooking.platform_fee_collected.toLocaleString()}đ</span>
                    </div>
                    <div className="h-px bg-slate-100 my-1" />
                    <div className="flex justify-between font-bold text-[12px]">
                      <span className="text-slate-800">Trạng thái phí:</span>
                      <span className={activeBooking.platform_fee_collected === activeBooking.platform_fee_required ? "text-emerald-600" : "text-amber-600"}>
                        {activeBooking.platform_fee_collected === activeBooking.platform_fee_required ? "Đã thu đủ" : "Chưa thu đủ"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* block 3: ĐỐI SOÁT PHOTOGRAPHER */}
                <div className="rounded-xl border border-slate-100 bg-white p-4.5 shadow-xs">
                  <h4 className="text-[12px] font-extrabold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                    <svg className="h-4 w-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h3m4 0h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Đối soát photographer
                  </h4>
                  <div className="space-y-2.5 text-[12px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Photographer được nhận (90%):</span>
                      <b className="text-slate-800">{activeBooking.photographer_total.toLocaleString()}đ</b>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Đã thu tạm giữ:</span>
                      <span className="font-semibold text-slate-700">{activeBooking.photographer_held.toLocaleString()}đ</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Đã thanh toán Photographer:</span>
                      <span className="font-bold text-emerald-600">{activeBooking.photographer_paid_amount.toLocaleString()}đ</span>
                    </div>
                    <div className="h-px bg-slate-100 my-1" />
                    <div className="flex justify-between font-bold text-[13px]">
                      <span className="text-slate-800">Còn phải thanh toán:</span>
                      <span className="text-red-500">{activeBooking.photographer_remaining.toLocaleString()}đ</span>
                    </div>
                  </div>
                </div>

                {/* Interactive Payment Collection Panel */}
                {activeBooking.remaining_to_pay > 0 && (
                  <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                    <h5 className="text-[12px] font-bold text-slate-700 mb-2">Thu thêm tiền thanh toán</h5>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Nhập số tiền thu (VND)..."
                        value={collectAmount}
                        onChange={(e) => setCollectAmount(e.target.value)}
                        className="flex-1 h-9 px-3 rounded-lg border border-slate-200 text-[12px] font-semibold outline-none focus:border-indigo-500 bg-white"
                      />
                      <button
                        onClick={() => handleCollectPayment(activeBooking.id, Number(collectAmount || 0))}
                        disabled={processingAction || !collectAmount}
                        className="h-9 rounded-lg bg-indigo-600 px-4 text-[12px] font-bold text-white hover:bg-indigo-700 transition disabled:opacity-50"
                      >
                        Ghi nhận
                      </button>
                    </div>
                    
                    {/* Quick collect presets */}
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      <button
                        onClick={() => handleCollectPayment(activeBooking.id, activeBooking.remaining_to_pay)}
                        disabled={processingAction}
                        className="text-[10px] text-indigo-600 bg-indigo-50 hover:bg-indigo-100 font-semibold px-2 py-1 rounded transition"
                      >
                        Thu nốt toàn bộ ({activeBooking.remaining_to_pay.toLocaleString()}đ)
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer Footer Actions */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                {activeBooking.photographer_remaining > 0 && (
                  <button
                    onClick={() => handlePayoutPhotographer(activeBooking.id)}
                    disabled={processingAction}
                    className="w-full inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 text-white text-[13px] font-bold hover:bg-emerald-700 transition shadow-sm"
                  >
                    <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Xác nhận thanh toán cho Photographer
                  </button>
                )}
                
                <button
                  onClick={() => handleSendReminder(activeBooking.id)}
                  className="w-full inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-[13px] font-bold hover:bg-slate-50 transition"
                >
                  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-2.25-1.5a2 2 0 00-2.22 0l-2.25 1.5" />
                  </svg>
                  Gửi lại email hóa đơn
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
