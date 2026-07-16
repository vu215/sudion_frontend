"use client";

import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../_components/admin-layout";
import { useToast } from "@/app/toast-context";

type OrderStatus = "completed" | "shipping" | "pending" | "cancelled";

interface OrderItem {
  productId: number;
  ten_san_pham: string;
  gia_ban: number;
  so_luong: number;
  hinh_anh: string;
  bien_the?: string;
}

interface AdminOrder {
  id: number;
  _id: number;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  items: OrderItem[];
  total_amount: number;
  totalAmount?: number;
  status: OrderStatus;
  payment_method: string;
  created_at: string;
}

const PAGE_SIZE = 6;
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function resolveProductImageUrl(path: string) {
  if (!path) return "/default-product.png";
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  const backendHost = API_URL.replace(/\/api\/?$/, "");
  if (path.startsWith("/")) return `${backendHost}${path}`;
  return `${backendHost}/uploads/${path}`;
}

function formatPrice(price: number) {
  if (price === undefined || price === null) return "0đ";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

function getStatusMeta(status: OrderStatus) {
  switch (status) {
    case "completed":
      return {
        label: "Hoàn thành",
        className: "bg-emerald-50 text-emerald-700 border border-emerald-100",
      };
    case "shipping":
      return {
        label: "Đang giao",
        className: "bg-orange-50 text-orange-700 border border-orange-100",
      };
    case "cancelled":
      return {
        label: "Đã hủy",
        className: "bg-rose-50 text-rose-700 border border-rose-100",
      };
    default:
      return {
        label: "Chờ xác nhận",
        className: "bg-amber-50 text-amber-700 border border-amber-100",
      };
  }
}

export default function AdminOrdersPage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<"all" | OrderStatus>("all");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = typeof window !== "undefined" ? window.localStorage.getItem("sudion_token") : null;
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_URL}/orders`, { headers });
      if (res.ok) {
        const data = await res.json();
        
        // Transform the total_amount to totalAmount for compatibility
        const formatted = data.map((o: any) => ({
          ...o,
          totalAmount: Number(o.total_amount || o.totalAmount || 0)
        }));
        setOrders(formatted);
      }
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: number, newStatus: OrderStatus) => {
    if (!confirm("Admin có chắc chắn muốn thay đổi trạng thái đơn hàng này?")) return;
    try {
      const token = typeof window !== "undefined" ? window.localStorage.getItem("sudion_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_URL}/orders/${orderId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        toast.success("Thành công", "Đã cập nhật trạng thái đơn hàng.");
      } else {
        toast.error("Lỗi", "Không thể cập nhật trạng thái đơn hàng.");
      }
    } catch (err) {
      toast.error("Lỗi", "Lỗi kết nối đến máy chủ.");
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesTab = activeTab === "all" || order.status === activeTab;
      const search = keyword.trim().toLowerCase();

      if (!search) return matchesTab;

      const haystacks = [
        String(order.id),
        order.customerInfo?.name || "",
        order.customerInfo?.email || "",
        order.customerInfo?.phone || "",
      ];

      return matchesTab && haystacks.some((value) => value.toLowerCase().includes(search));
    });
  }, [activeTab, keyword, orders]);

  const totalRevenue = useMemo(() => {
    return orders.reduce((sum, order) => sum + (order.status === 'completed' ? (order.totalAmount || 0) : 0), 0);
  }, [orders]);

  const completedCount = useMemo(() => orders.filter((order) => order.status === "completed").length, [orders]);
  const shippingCount = useMemo(() => orders.filter((order) => order.status === "shipping").length, [orders]);
  const pendingCount = useMemo(() => orders.filter((order) => order.status === "pending").length, [orders]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filteredOrders.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const tabs = [
    { key: "all" as const, label: "Tất cả đơn hàng", count: orders.length },
    { key: "pending" as const, label: "Chờ xử lý", count: pendingCount },
    { key: "shipping" as const, label: "Đang giao", count: shippingCount },
    { key: "completed" as const, label: "Đã hoàn thành", count: completedCount },
  ];

  return (
    <AdminLayout active="Đơn hàng Máy ảnh">
      <div className="flex flex-1 flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-[24px] font-black uppercase tracking-tight text-slate-900">
            Quản lý Đơn hàng máy ảnh
          </h1>
          <div className="rounded-xl border border-orange-100 bg-orange-50/20 p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#ff8d28]">Doanh thu hoàn thành</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{formatPrice(totalRevenue)}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_24px_rgba(12,18,32,0.02)]">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Đơn hàng mới</p>
            <p className="mt-2 text-3xl font-black text-slate-900">{orders.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_24px_rgba(12,18,32,0.02)]">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Chờ xử lý</p>
            <p className="mt-2 text-3xl font-black text-[#ff8d28]">{pendingCount}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_24px_rgba(12,18,32,0.02)]">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Đang giao hàng</p>
            <p className="mt-2 text-3xl font-black text-slate-900">{shippingCount}</p>
          </div>
        </div>

        {/* Main Panel */}
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_14px_34px_rgba(12,18,32,0.04)]">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-4 overflow-x-auto border-b border-slate-100 flex-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  className={`whitespace-nowrap pb-2.5 text-[11px] font-extrabold uppercase tracking-[0.18em] transition-all cursor-pointer ${
                    activeTab === tab.key ? "border-b-2 border-[#ff8d28] text-[#ff8d28]" : "text-slate-400 hover:text-[#ff8d28]"
                  }`}
                  onClick={() => { setActiveTab(tab.key); setPage(1); }}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            <label className="relative block w-full md:max-w-xs shrink-0">
              <span className="material-symbols-outlined pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                search
              </span>
              <input
                value={keyword}
                onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
                placeholder="Tìm ID, tên, SĐT..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-4 text-xs font-semibold outline-none focus:border-[#ff8d28] text-slate-800"
              />
            </label>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full min-w-[800px] border-collapse text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-slate-500">Mã đơn</th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-slate-500">Khách hàng</th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-slate-500">Sản phẩm</th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-slate-500">Tổng tiền</th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-slate-500 text-center">Trạng thái</th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-slate-500 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold">
                      Đang tải đơn hàng...
                    </td>
                  </tr>
                ) : pageItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold">
                      Không có đơn hàng nào.
                    </td>
                  </tr>
                ) : (
                  pageItems.map((order) => {
                    const statusMeta = getStatusMeta(order.status);
                    return (
                      <tr key={order.id} className="group hover:bg-slate-50/40 transition-colors">
                        <td className="px-5 py-4 font-mono text-[#ff8d28] font-bold">#{order.id}</td>
                        <td className="px-5 py-4">
                          <p className="text-slate-800 font-extrabold text-sm">{order.customerInfo?.name || "Khách vãng lai"}</p>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{order.customerInfo?.phone || "N/A"}</p>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                              {order.items?.length || 0} SP
                            </span>
                            <span className="truncate max-w-[150px] font-semibold text-slate-600">
                              {order.items?.[0]?.ten_san_pham || "Chi tiết sản phẩm"}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-bold text-slate-800 text-sm">{formatPrice(order.totalAmount || 0)}</td>
                        <td className="px-5 py-4 text-center">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${statusMeta.className}`}>
                            {statusMeta.label}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex justify-end gap-2.5 items-center">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="p-1.5 text-slate-500 hover:text-[#ff8d28] transition"
                              title="Xem chi tiết"
                            >
                              <span className="material-symbols-outlined text-sm">visibility</span>
                            </button>
                            <select
                              className="bg-white border border-slate-200 text-[10px] font-bold rounded-lg px-2 py-1 outline-none focus:border-[#ff8d28] cursor-pointer"
                              value={order.status}
                              onChange={(e) => handleUpdateStatus(order.id, e.target.value as OrderStatus)}
                              disabled={order.status === 'completed' || order.status === 'cancelled'}
                            >
                              {order.status === 'pending' && <option value="pending">Chờ xác nhận</option>}
                              {(order.status === 'pending' || order.status === 'shipping') && <option value="shipping">Đang giao</option>}
                              <option value="completed">Hoàn thành</option>
                              <option value="cancelled">Hủy đơn</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 text-xs text-slate-500">
            <span>Trang {safePage} / {totalPages}</span>
            <div className="flex items-center gap-1">
              <button
                disabled={safePage === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="flex size-8 items-center justify-center rounded-lg border border-slate-200 hover:bg-[#ff8d28] hover:text-white transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-sm font-black">chevron_left</span>
              </button>
              <button
                disabled={safePage === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="flex size-8 items-center justify-center rounded-lg border border-slate-200 hover:bg-[#ff8d28] hover:text-white transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-sm font-black">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Order Detail Drawer / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}>
          <div className="w-full max-w-2xl border border-slate-100 bg-white p-8 rounded-[28px] shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="mb-0.5 text-[10px] font-black uppercase tracking-[0.25em] text-[#ff8d28]">Chi tiết đơn hàng</p>
                <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900">Đơn hàng #{selectedOrder.id}</h2>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex size-9 items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:text-[#ff8d28] transition-colors"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <h4 className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Khách hàng</h4>
                  <div className="border border-slate-100 bg-slate-50/50 p-4 rounded-xl">
                    <p className="text-sm font-extrabold text-slate-800">{selectedOrder.customerInfo?.name || "Khách vãng lai"}</p>
                    <p className="text-xs text-slate-500 mt-1">{selectedOrder.customerInfo?.email}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{selectedOrder.customerInfo?.phone}</p>
                  </div>
                </div>
                <div>
                  <h4 className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Địa chỉ giao hàng</h4>
                  <div className="border border-slate-100 bg-slate-50/50 p-4 rounded-xl">
                    <p className="text-xs text-slate-600 leading-relaxed">{selectedOrder.customerInfo?.address || "Chưa có địa chỉ"}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Sản phẩm</h4>
                <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex gap-3 border-b border-slate-50 pb-2.5 items-center last:border-0 last:pb-0">
                      <div className="size-11 shrink-0 bg-slate-100 rounded overflow-hidden">
                        <img src={resolveProductImageUrl(item.hinh_anh)} className="size-full object-cover" alt="" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800 truncate">{item.ten_san_pham}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{item.so_luong} x {formatPrice(item.gia_ban)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 border-t border-slate-100 pt-4 flex justify-between items-end">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tổng thanh toán</p>
                  <p className="text-xl font-black text-[#ff8d28]">{formatPrice(selectedOrder.totalAmount || 0)}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-6">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 rounded-xl transition"
              >
                Đóng
              </button>
              <button
                className="bg-slate-900 px-6 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-md hover:bg-[#ff8d28] transition rounded-xl"
                onClick={() => {
                  window.print();
                }}
              >
                In hóa đơn
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
