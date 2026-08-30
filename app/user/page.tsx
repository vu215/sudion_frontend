"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSession, getToken, type AuthSession } from "../auth-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const ORDERS_PER_PAGE = 5;

function resolveProductImageUrl(path: string) {
  if (!path) return "/default-product.png";
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  const backendHost = API_URL.replace(/\/api\/?$/, "");
  if (path.startsWith("/")) return `${backendHost}${path}`;
  return `${backendHost}/uploads/${path}`;
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function formatCurrency(value: number | string | null | undefined) {
  return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
}

export default function UserPage() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelNote, setCancelNote] = useState("");
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const current = getSession();
    setSession(current);

    async function load() {
      if (!current?.email) {
        setLoading(false);
        setError("Bạn chưa đăng nhập. Vui lòng đăng nhập để xem lịch của bạn.");
        return;
      }

      try {
        setLoading(true);
        setError("");
        
        // Load orders
        const ordersResponse = await fetch(`${API_URL}/orders/my-orders`, {
          headers: authHeaders(),
          cache: "no-store",
        });
        const ordersJson = await ordersResponse.json();
        {
          const serverOrders = ordersResponse.ok && Array.isArray(ordersJson) ? ordersJson : [];
          let cachedOrders: any[] = [];
          try {
            const accountKey = String(current.userId || current.email).toLowerCase();
            const historyKey = `sudion-order-history:${accountKey}`;
            const rawHistory = window.localStorage.getItem(historyKey);
            cachedOrders = rawHistory ? JSON.parse(rawHistory) : [];

            // Tương thích với đơn gần nhất được tạo trước khi có danh sách lịch sử.
            const raw = window.sessionStorage.getItem("sudion-last-order");
            const recentOrder = raw ? JSON.parse(raw) : null;
            if (recentOrder && !recentOrder.created_at) {
              recentOrder.created_at = new Date().toISOString();
              window.sessionStorage.setItem("sudion-last-order", JSON.stringify(recentOrder));
            }
            if (recentOrder && !cachedOrders.some((order: any) => String(order.id) === String(recentOrder.id))) {
              cachedOrders.unshift(recentOrder);
            }
          } catch { /* ignore invalid cached order */ }

          const merged = [...serverOrders, ...(Array.isArray(cachedOrders) ? cachedOrders : [])]
            .filter((order, index, all) => all.findIndex((item) => String(item.id) === String(order.id)) === index)
            .map((order) => ({ ...order, status: order.status || "pending" }))
            .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
          setOrders(merged);
          setCurrentPage(1);

          // Đồng bộ cache bằng dữ liệu đã hợp nhất để lần mở sau vẫn đủ đơn.
          try {
            const accountKey = String(current.userId || current.email).toLowerCase();
            window.localStorage.setItem(`sudion-order-history:${accountKey}`, JSON.stringify(merged));
          } catch { /* ignore storage quota/privacy errors */ }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Không thể tải lịch đặt.");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  const avatarText = (session?.fullName || session?.email || "U").slice(0, 1).toUpperCase();
  const totalPages = Math.max(1, Math.ceil(orders.length / ORDERS_PER_PAGE));
  const paginatedOrders = orders.slice((currentPage - 1) * ORDERS_PER_PAGE, currentPage * ORDERS_PER_PAGE);
  const paginationStart = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
  const pageNumbers = Array.from({ length: Math.min(5, totalPages) }, (_, index) => paginationStart + index);

  async function handleCancelOrder() {
    if (!selectedOrder || !cancelReason) {
      setCancelError("Vui lòng chọn lý do hủy đơn.");
      return;
    }
    if (!window.confirm(`Xác nhận hủy đơn #DH${selectedOrder.id}? Thao tác này không thể hoàn tác.`)) return;

    try {
      setCancelling(true);
      setCancelError("");
      const fullReason = cancelNote.trim() ? `${cancelReason} - Ghi chú: ${cancelNote.trim()}` : cancelReason;
      const response = await fetch(`${API_URL}/orders/my-orders/${selectedOrder.id}/cancel`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ reason: fullReason }),
      });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.message || "Không thể hủy đơn hàng.");

      const cancelledOrder = { ...selectedOrder, ...json.data, status: "cancelled" };
      const updatedOrders = orders.map((order) => String(order.id) === String(selectedOrder.id) ? cancelledOrder : order);
      setOrders(updatedOrders);
      setSelectedOrder(cancelledOrder);
      setCancelReason("");
      setCancelNote("");
      setShowCancelForm(false);
      if (session) {
        const accountKey = String(session.userId || session.email).toLowerCase();
        window.localStorage.setItem(`sudion-order-history:${accountKey}`, JSON.stringify(updatedOrders));
      }
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : "Không thể hủy đơn hàng.");
    } finally {
      setCancelling(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-orange-50 to-white/95 px-4 py-8 sm:px-6 lg:px-12">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-20 w-20 place-items-center rounded-full border-2 border-white bg-[#ff8d28] text-3xl font-black text-white shadow-md">
              {avatarText}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                {session?.fullName || "Tài khoản khách hàng"}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {session?.email || "Chưa đăng nhập"} · {session?.role || "customer"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/notification"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Thông báo
            </Link>
            <Link
              href="/products"
              className="rounded-2xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-orange-600"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </header>

        {error ? (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="lg:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-500">Mua sắm</p>
                  <h3 className="text-lg font-semibold text-slate-900">Đơn mua hàng của bạn</h3>
                </div>
              </div>

              <div className="mt-4">
                {loading ? (
                  <div className="grid gap-2">
                    {Array.from({ length: 2 }).map((_, index) => (
                      <div key={index} className="h-16 animate-pulse rounded-lg bg-slate-100" />
                    ))}
                  </div>
                ) : orders.length ? (
                  <ul className="space-y-2">
                    {paginatedOrders.map((order) => {
                      const statusMap: Record<string, { label: string; cls: string }> = {
                        pending: { label: "Chờ xử lý", cls: "bg-amber-100 text-amber-700" },
                        shipping: { label: "Đang giao", cls: "bg-blue-100 text-blue-700" },
                        completed: { label: "Đã hoàn thành", cls: "bg-emerald-100 text-emerald-700" },
                        cancelled: { label: "Đã hủy", cls: "bg-rose-100 text-rose-700" }
                      };
                      const statusInfo = statusMap[order.status || "pending"] || { label: order.status, cls: "bg-slate-100 text-slate-700" };
                      
                      return (
                        <li
                          key={order.id}
                          className="rounded-lg border border-slate-100 bg-slate-50 p-3"
                        >
                          <div className="flex items-center justify-between border-b border-slate-200/60 pb-2 mb-2">
                            <div>
                              <p className="text-xs font-semibold text-slate-500">MÃ ĐƠN HÀNG: <span className="text-slate-900">#DH{order.id}</span></p>
                              <p className="text-[10px] text-slate-400">
                                {order.created_at
                                  ? new Date(order.created_at).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" })
                                  : "Chưa có thời gian đặt"}
                              </p>
                            </div>
                            <div className="mt-2 sm:mt-0 flex items-center gap-2">
                              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${statusInfo.cls}`}>
                                {statusInfo.label}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            {order.items?.slice(0, 2).map((item: any, idx: number) => (
                              <div key={idx} className="flex gap-3 items-center">
                                {item.hinh_anh ? (
                                  <img 
                                    src={resolveProductImageUrl(item.hinh_anh)} 
                                    alt="" 
                                    className="h-8 w-8 rounded-md object-cover bg-slate-100"
                                  />
                                ) : (
                                  <div className="h-8 w-8 rounded-md bg-slate-200 flex items-center justify-center text-[9px] text-slate-400 font-bold">ẢNH</div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-slate-800 truncate">{item.ten_san_pham}</p>
                                  {item.bien_the && <p className="text-[10px] text-slate-400 font-medium">{item.bien_the}</p>}
                                </div>
                                <div className="text-right">
                                  <p className="text-xs font-bold text-slate-700">{formatCurrency(item.gia_ban)}</p>
                                  <p className="text-[10px] text-slate-400 font-bold">x{item.so_luong}</p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {order.items?.length > 2 ? <p className="mt-1 text-[10px] text-slate-400">+{order.items.length - 2} sản phẩm khác</p> : null}

                          <div className="mt-2 flex items-center justify-between border-t border-slate-200/60 pt-2">
                            <button
                              type="button"
                              onClick={() => { setSelectedOrder(order); setShowCancelForm(false); setCancelReason(""); setCancelNote(""); setCancelError(""); }}
                              className="text-xs font-bold text-slate-600 transition hover:text-[#ff8d28]"
                            >
                              Xem chi tiết
                            </button>
                            <div className="text-xs font-black text-[#ff8d28] whitespace-nowrap">
                              Tổng cộng: {formatCurrency(order.total_amount ?? order.totalAmount)}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                    {totalPages > 1 ? (
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                        <p className="text-xs text-slate-500">
                          Hiển thị {(currentPage - 1) * ORDERS_PER_PAGE + 1}–{Math.min(currentPage * ORDERS_PER_PAGE, orders.length)} trong {orders.length} đơn
                        </p>
                        <div className="flex items-center gap-1.5">
                          <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:border-orange-300 hover:text-orange-500 disabled:cursor-not-allowed disabled:opacity-40">
                            Trước
                          </button>
                          {pageNumbers.map((page) => (
                            <button key={page} type="button" onClick={() => setCurrentPage(page)} className={`h-8 min-w-8 rounded-lg px-2 text-xs font-bold transition ${currentPage === page ? "bg-[#ff8d28] text-white" : "border border-slate-200 text-slate-600 hover:border-orange-300 hover:text-orange-500"}`}>
                              {page}
                            </button>
                          ))}
                          <button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:border-orange-300 hover:text-orange-500 disabled:cursor-not-allowed disabled:opacity-40">
                            Sau
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </ul>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                    Bạn chưa có đơn đặt hàng sản phẩm nào. Hãy mua sắm máy ảnh hoặc phụ kiện ngay!
                  </div>
                )}
              </div>
            </div>
          </section>

          <aside>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Thông tin cá nhân</h2>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div>
                  <p className="text-xs text-slate-400">Họ và tên</p>
                  <p className="mt-1 font-semibold text-slate-800">{session?.fullName || "Chưa cập nhật"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Email</p>
                  <p className="mt-1 break-all font-semibold text-slate-800">{session?.email || "Chưa cập nhật"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Vai trò</p>
                  <p className="mt-1 font-semibold capitalize text-slate-800">{session?.role || "customer"}</p>
                </div>
              </div>
              <Link
                href="/profile"
                className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Cập nhật hồ sơ
              </Link>
            </div>
          </aside>
        </div>
      </div>

      {selectedOrder ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-4" onClick={() => { setSelectedOrder(null); setShowCancelForm(false); }}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Chi tiết đơn mua hàng</p>
                <h2 className="mt-1 text-xl font-black text-slate-900">#DH{selectedOrder.id}</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Đặt lúc {selectedOrder.created_at
                    ? new Date(selectedOrder.created_at).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" })
                    : "chưa có thời gian đặt"}
                </p>
              </div>
              <button type="button" onClick={() => { setSelectedOrder(null); setShowCancelForm(false); }} className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-xl text-slate-500 hover:bg-slate-200">×</button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Detail label="Người nhận" value={selectedOrder.customerInfo?.name || selectedOrder.customer_name} />
              <Detail label="Số điện thoại" value={selectedOrder.customerInfo?.phone || selectedOrder.customer_phone} />
              <div className="sm:col-span-2">
                <Detail label="Địa chỉ giao hàng" value={selectedOrder.customerInfo?.address || selectedOrder.customer_address} />
              </div>
              <Detail label="Giao hàng" value={selectedOrder.shipping_method === "express" || selectedOrder.customerInfo?.shippingMethod === "express" ? "Giao nhanh" : "Giao tiêu chuẩn"} />
              <Detail label="Thanh toán" value={selectedOrder.payment_method || selectedOrder.customerInfo?.paymentMethod || "COD"} />
              {(selectedOrder.note || selectedOrder.customerInfo?.note) ? <div className="sm:col-span-2"><Detail label="Ghi chú" value={selectedOrder.note || selectedOrder.customerInfo?.note} /></div> : null}
            </div>

            <div className="mt-5 border-t border-slate-100 pt-4">
              <h3 className="text-sm font-black text-slate-900">Sản phẩm</h3>
              <div className="mt-3 space-y-3">
                {selectedOrder.items?.map((item: any, index: number) => (
                  <div key={`${item.productId}-${index}`} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                    {item.hinh_anh ? <img src={resolveProductImageUrl(item.hinh_anh)} alt="" className="h-12 w-12 rounded-lg object-cover" /> : null}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-800">{item.ten_san_pham}</p>
                      <p className="text-xs text-slate-500">{item.bien_the || "Phiên bản mặc định"} · Số lượng {item.so_luong}</p>
                    </div>
                    <p className="text-sm font-black text-slate-800">{formatCurrency(Number(item.gia_ban || 0) * Number(item.so_luong || 0))}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-sm font-bold text-slate-600">Tổng thanh toán</span>
                <span className="text-lg font-black text-[#ff8d28]">{formatCurrency(selectedOrder.total_amount ?? selectedOrder.totalAmount)}</span>
              </div>
            </div>

            {(!selectedOrder.status || selectedOrder.status === "pending") ? (
              <div className="mt-5 rounded-xl border border-rose-100 bg-rose-50 p-4">
                {!showCancelForm ? (
                  <button type="button" onClick={() => setShowCancelForm(true)} className="w-full rounded-xl border border-rose-500 px-4 py-2.5 text-sm font-bold text-rose-600 transition hover:bg-rose-600 hover:text-white">
                    Hủy đơn hàng
                  </button>
                ) : (
                  <>
                    <h3 className="text-sm font-black text-rose-700">Lý do hủy đơn</h3>
                    <p className="mt-1 text-xs text-rose-600">Đơn đã hủy không thể khôi phục. Sản phẩm sẽ được hoàn lại kho.</p>
                    <select value={cancelReason} onChange={(event) => { setCancelReason(event.target.value); setCancelError(""); }} className="mt-3 w-full rounded-xl border border-rose-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-rose-400">
                      <option value="">Chọn lý do hủy đơn</option>
                      <option value="Muốn thay đổi địa chỉ nhận hàng">Muốn thay đổi địa chỉ nhận hàng</option>
                      <option value="Muốn thay đổi sản phẩm hoặc phiên bản">Muốn thay đổi sản phẩm hoặc phiên bản</option>
                      <option value="Tìm được giá tốt hơn">Tìm được giá tốt hơn</option>
                      <option value="Không còn nhu cầu mua">Không còn nhu cầu mua</option>
                      <option value="Đặt nhầm hoặc trùng đơn">Đặt nhầm hoặc trùng đơn</option>
                    </select>
                    <textarea value={cancelNote} onChange={(event) => setCancelNote(event.target.value)} rows={3} maxLength={300} placeholder="Ghi chú thêm (không bắt buộc)" className="mt-3 w-full resize-none rounded-xl border border-rose-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-rose-400" />
                    {cancelError ? <p className="mt-2 text-xs font-semibold text-rose-600">{cancelError}</p> : null}
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => { setShowCancelForm(false); setCancelError(""); }} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600">Quay lại</button>
                      <button type="button" disabled={cancelling} onClick={handleCancelOrder} className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50">
                        {cancelling ? "Đang hủy..." : "Xác nhận hủy đơn"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : selectedOrder.status === "cancelled" ? (
              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-600">Đơn hàng này đã được hủy.</div>
            ) : null}
          </div>
        </div>
      ) : null}
    </main>
  );
}

function Detail({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{value || "Chưa cập nhật"}</p>
    </div>
  );
}
