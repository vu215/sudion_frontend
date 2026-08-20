"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, getToken, type AuthSession } from "../auth-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const ORDERS_PER_PAGE = 5;
const TIP_BANK_BIN = process.env.NEXT_PUBLIC_TIP_BANK_BIN || "";
const TIP_BANK_ACCOUNT = process.env.NEXT_PUBLIC_TIP_BANK_ACCOUNT || "";
const TIP_BANK_NAME = process.env.NEXT_PUBLIC_TIP_BANK_NAME || "STUDION";

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
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelNote, setCancelNote] = useState("");
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [selectedRating, setSelectedRating] = useState(0);
  const [selectedTip, setSelectedTip] = useState<number | null>(null);
  const [customTip, setCustomTip] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [detailNotice, setDetailNotice] = useState("");
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
  const tipQrUrl = selectedTip && TIP_BANK_BIN && TIP_BANK_ACCOUNT
    ? `https://img.vietqr.io/image/${TIP_BANK_BIN}-${TIP_BANK_ACCOUNT}-compact2.png?amount=${selectedTip}&addInfo=${encodeURIComponent(`TIP DON ${selectedOrder?.id || ""}`)}&accountName=${encodeURIComponent(TIP_BANK_NAME)}`
    : "";

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

  async function handleSubmitReview() {
    if (!selectedOrder || reviewSubmitting || reviewSubmitted) return;

    if (!selectedRating && !reviewText.trim() && !selectedTip) {
      router.push(`/review-success?orderId=${encodeURIComponent(selectedOrder.id)}&skipped=1`);
      return;
    }

    const products = Array.isArray(selectedOrder.items) ? selectedOrder.items : [];
    try {
      setReviewSubmitting(true);
      setDetailNotice("");
      const headers = { "Content-Type": "application/json", ...authHeaders() };
      if (selectedRating || reviewText.trim()) {
        for (const product of products) {
          const productId = product.productId || product.id;
          if (!productId) continue;

          const reviewResponse = await fetch(`${API_URL}/orders/${selectedOrder.id}/review`, {
            method: "POST",
            headers,
            body: JSON.stringify({
              productId,
              productName: product.ten_san_pham || "Sản phẩm trong đơn hàng",
              rating: selectedRating || 0,
              comment: reviewText.trim(),
            }),
          });
          const reviewJson = await reviewResponse.json().catch(() => ({}));
          if (!reviewResponse.ok || reviewJson.success === false) {
            throw new Error(reviewJson.message || "Không thể gửi đánh giá sản phẩm.");
          }
        }
      }
      if (selectedTip) {
        const tipResponse = await fetch(`${API_URL}/orders/${selectedOrder.id}/tip`, {
          method: "POST",
          headers,
          body: JSON.stringify({ amount: selectedTip }),
        });
        const tipJson = await tipResponse.json().catch(() => ({}));
        if (!tipResponse.ok || tipJson.success === false) {
          throw new Error(tipJson.message || "Không thể tạo yêu cầu tip.");
        }
      }
      setReviewSubmitted(true);
      router.push(`/review-success?orderId=${encodeURIComponent(selectedOrder.id)}&productName=${encodeURIComponent(products.map((product: any) => product.ten_san_pham).filter(Boolean).join(", ") || "Sản phẩm trong đơn hàng")}&tipAmount=${selectedTip || 0}`);
    } catch (err) {
      setDetailNotice(err instanceof Error ? err.message : "Không thể kết nối đến máy chủ.");
    } finally {
      setReviewSubmitting(false);
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
              <h1 className="text-xl font-black text-slate-900">
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
                              onClick={() => { setSelectedOrder(order); setShowCancelForm(false); setCancelReason(""); setCancelNote(""); setCancelError(""); setDetailNotice(""); setReviewSubmitted(false); setReviewSubmitting(false); }}
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
        <div className="fixed inset-x-0 bottom-0 top-[76px] z-[100] overflow-y-auto bg-[#f8fafc] p-3 sm:top-[88px] sm:p-5" onClick={() => { setSelectedOrder(null); setShowCancelForm(false); }}>
          <div className="mx-auto min-h-full w-full max-w-[1240px]" onClick={(event) => event.stopPropagation()}>
            <div className="mb-2 flex items-center gap-2 px-1 text-[10px] text-slate-500">
              <span>Trang chủ</span><span>›</span><span>Đơn hàng của tôi</span><span>›</span><span className="font-semibold text-slate-700">Chi tiết đơn hàng #{selectedOrder.id}</span>
            </div>
            <div className="rounded-[18px] border border-slate-200 bg-[#f8fafc] p-1 shadow-sm sm:p-1.5">
            <div className="mb-2 flex items-start justify-between rounded-xl border border-slate-200 bg-white p-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#ff8d28]">Đơn hàng #{selectedOrder.id}</p>
                <h2 className="mt-0.5 text-lg font-black text-slate-900">{selectedOrder.items?.[0]?.ten_san_pham || "Chi tiết đơn hàng"}</h2>
                <p className="mt-0.5 text-[11px] text-slate-500">Đặt lúc {selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleString("vi-VN") : "chưa có thời gian"}</p>
              </div>
              <button type="button" onClick={() => { setSelectedOrder(null); setShowCancelForm(false); }} className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-xl text-slate-500 hover:bg-orange-50 hover:text-[#ff8d28]">×</button>
            </div>

            {detailNotice ? <div className="mb-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] font-bold text-emerald-700">{detailNotice}</div> : null}
            <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="grid content-start gap-2.5 md:grid-cols-2 md:[&>section:nth-child(1)]:col-span-2 md:[&>section:nth-child(2)]:col-span-2">
                <section className="self-start rounded-xl border border-slate-200 bg-white p-3">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-base font-black text-slate-900">Trạng thái đơn hàng</h3>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-600">{selectedOrder.status === "completed" ? "Đã hoàn thành" : selectedOrder.status === "shipping" ? "Đang giao" : "Đang xử lý"}</span>
                  </div>
                  <div className="mt-3 grid grid-cols-5 gap-1">
                    {["Đặt hàng", "Xác nhận", "Đang giao", "Đã giao", "Hoàn thành"].map((step, index) => {
                      const done = selectedOrder.status === "completed" ? true : index === 0;
                      return <div key={step} className="relative text-center"><div className={`mx-auto grid h-9 w-9 place-items-center rounded-full border-2 text-xs font-black ${done ? "border-[#ff8d28] bg-orange-50 text-[#ff8d28]" : "border-slate-200 bg-white text-slate-300"}`}>{done ? "✓" : index + 1}</div><p className={`mt-2 text-[10px] font-bold ${done ? "text-slate-700" : "text-slate-400"}`}>{step}</p>{index < 4 ? <span className={`absolute left-[60%] top-4 h-0.5 w-[80%] ${done ? "bg-orange-300" : "bg-slate-200"}`} /> : null}</div>;
                    })}
                  </div>
                  <button type="button" onClick={() => setDetailNotice("Tính năng theo dõi đơn hàng đang được cập nhật.")} className="mt-3 flex w-full items-center justify-between rounded-lg border border-orange-200 bg-orange-50/40 px-3 py-2.5 text-xs font-black text-[#ff8d28]">Theo dõi đơn hàng <span className="text-base">›</span></button>
                </section>

                <section className="self-start rounded-xl border border-slate-200 bg-white p-3">
                  <h3 className="text-base font-black text-slate-900">Sản phẩm</h3>
                  <div className="mt-3 grid gap-2">
                    {selectedOrder.items?.map((item: any, index: number) => <div key={`${item.productId}-${index}`} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">{item.hinh_anh ? <img src={resolveProductImageUrl(item.hinh_anh)} alt="" className="h-14 w-14 rounded-lg object-cover" /> : <div className="h-14 w-14 rounded-lg bg-slate-200" />}<div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-slate-800">{item.ten_san_pham}</p><p className="text-xs text-slate-500">{item.bien_the || "Phiên bản mặc định"} · x{item.so_luong}</p></div><p className="text-sm font-black text-slate-800">{formatCurrency(Number(item.gia_ban || 0) * Number(item.so_luong || 0))}</p></div>)}
                  </div>
                </section>

                <div className="grid content-start justify-items-stretch gap-2.5 md:grid-cols-1 [&>section]:!w-full [&>section]:!self-stretch [&>section:nth-child(2)]:hidden">
                  <section className="self-start rounded-xl border border-slate-200 bg-white p-3"><h3 className="text-sm font-black text-slate-900">Thông tin giao hàng</h3><div className="mt-2 grid gap-2 text-xs"><Detail label="Người nhận" value={selectedOrder.customerInfo?.name || selectedOrder.customer_name} /><Detail label="Số điện thoại" value={selectedOrder.customerInfo?.phone || selectedOrder.customer_phone} /><Detail label="Địa chỉ" value={selectedOrder.customerInfo?.address || selectedOrder.customer_address} /></div></section>
                  <section className="self-start rounded-xl border border-slate-200 bg-white p-3"><div className="flex items-center justify-between"><h3 className="text-sm font-black text-slate-900">Đánh giá &amp; Tip</h3><span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-[#ff8d28]">Tùy chọn</span></div><p className="mt-1 text-xs text-slate-500">Bạn có thể đánh giá, tip shipper hoặc bỏ qua cả hai.</p><div className="mt-1 flex gap-1">{[1,2,3,4,5].map((star) => <button key={star} type="button" onClick={() => setSelectedRating(star)} className={`text-2xl ${star <= selectedRating ? "text-[#ff8d28]" : "text-slate-200"}`}>☆</button>)}</div><textarea value={reviewText} onChange={(event) => setReviewText(event.target.value.slice(0, 200))} rows={2} placeholder="Chia sẻ trải nghiệm của bạn về shipper..." className="mt-1 w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-[11px] outline-none focus:border-[#ff8d28]" /><p className="text-right text-[10px] text-slate-400">{reviewText.length}/200</p><p className="mt-1 text-[11px] text-slate-400">Tip shipper (không bắt buộc)</p><div className="mt-1 grid grid-cols-3 gap-1.5">{[20000,50000,100000].map((amount) => <button key={amount} type="button" onClick={() => setSelectedTip(amount)} className={`rounded-lg border px-2 py-1.5 text-[10px] font-bold ${selectedTip === amount ? "border-[#ff8d28] bg-orange-50 text-[#ff8d28]" : "border-slate-200 text-slate-600"}`}>{formatCurrency(amount)}</button>)}</div><button type="button" onClick={() => setSelectedTip(null)} className={`mt-1 w-full rounded-lg border px-3 py-1.5 text-[10px] font-bold ${selectedTip === null ? "border-slate-400 bg-slate-100 text-slate-700" : "border-slate-200 text-slate-500"}`}>Không tip / Bỏ qua</button><button type="button" onClick={() => setDetailNotice(selectedRating || reviewText.trim() ? "Đánh giá của bạn đã được ghi nhận." : "Bạn có thể bỏ qua đánh giá.")} className="mt-2 w-full rounded-xl bg-[#ff8d28] px-3 py-2 text-xs font-black text-white">Gửi đánh giá{selectedTip ? " & tip" : ""}</button></section>
                </div>
                <section className="self-start rounded-xl border border-slate-200 bg-white p-3 md:col-span-1">
                  <h3 className="text-sm font-black text-slate-900">Cần hỗ trợ?</h3>
                  <div className="mt-2 grid gap-2 text-[10px] leading-4"><p><b>ⓘ Gặp vấn đề với đơn hàng</b><br /><span className="text-[#ff8d28]">Liên hệ chúng tôi</span></p><p><b>◌ Chat với Studion</b><br /><span className="text-[#ff8d28]">Trò chuyện ngay</span></p><p><b>☎ Hotline</b><br /><span className="text-slate-500">1900 1234</span></p></div>
                </section>
                <section className="rounded-xl border border-dashed border-orange-300 bg-orange-50/20 p-4 md:col-span-2">
                  <div className="flex items-start justify-between gap-3 border-b border-orange-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black uppercase text-slate-900">Đánh giá &amp; Tip shipper</h3>
                        <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[9px] font-black text-[#ff8d28]">Mới</span>
                      </div>
                      <p className="mt-1 text-[10px] text-slate-500">Cảm ơn bạn đã mua hàng tại Studion!</p>
                      <p className="text-[10px] text-slate-500">Bạn có hài lòng với trải nghiệm giao hàng?</p>
                    </div>
                    <span className="text-lg leading-none text-[#ff8d28]">♥</span>
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-[120px_minmax(0,1fr)_minmax(0,1fr)]">
                    <div>
                      <p className="text-[10px] font-bold text-slate-700">Đánh giá shipper <span className="font-normal text-slate-400">(tùy chọn)</span></p>
                      <div className="mt-2 flex gap-0.5">{[1,2,3,4,5].map((star) => <button key={star} type="button" onClick={() => setSelectedRating(star)} aria-label={`Đánh giá ${star} sao`} className={`text-xl leading-none ${star <= selectedRating ? "text-[#ff8d28]" : "text-slate-300"}`}>☆</button>)}</div>
                      <p className="mt-2 text-[9px] text-slate-400">Chọn sao để đánh giá</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-700">Nhận xét <span className="font-normal text-slate-400">(tùy chọn)</span></p>
                      <textarea value={reviewText} onChange={(event) => setReviewText(event.target.value.slice(0, 200))} rows={4} placeholder="Chia sẻ trải nghiệm của bạn về shipper..." className="mt-2 w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-[10px] outline-none focus:border-[#ff8d28]" />
                      <p className="text-right text-[9px] text-slate-400">{reviewText.length}/200</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-700">Tip shipper <span className="font-normal text-slate-400">(tùy chọn)</span></p>
                      <div className="mt-2 grid grid-cols-3 gap-1">{[20000,50000,100000].map((amount) => <button key={amount} type="button" onClick={() => setSelectedTip(amount)} className={`rounded-lg border px-1 py-2 text-[10px] font-bold whitespace-nowrap ${selectedTip === amount ? "border-[#ff8d28] bg-orange-50 text-[#ff8d28]" : "border-slate-200 text-slate-700"}`}>{formatCurrency(amount)}</button>)}</div>
                      <button type="button" onClick={() => setSelectedTip(null)} className="mt-2 w-full rounded-lg border border-orange-200 px-3 py-2 text-[10px] font-bold text-[#ff8d28]">Tùy chọn khác</button>
                      <p className="mt-2 text-[9px] leading-4 text-slate-400">Tip là khoản tự nguyện dành cho shipper. 100% tiền tip sẽ được chuyển đến shipper.</p>
                    </div>
                  </div>
                  <button type="button" disabled={reviewSubmitting || reviewSubmitted} onClick={handleSubmitReview} className="mt-4 w-full rounded-lg bg-[#ff8d28] px-4 py-2.5 text-xs font-black text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60 md:mx-auto md:block md:max-w-[260px]">{reviewSubmitting ? "Đang gửi..." : reviewSubmitted ? "Đã gửi đánh giá & tip" : "Gửi đánh giá & tip"}</button>
                </section>
              </div>

              <aside className="grid content-start gap-2">
                <section className="rounded-xl border border-slate-200 bg-white p-3">
                  <h3 className="text-sm font-black uppercase text-slate-900">Luồng hiển thị</h3>
                  <div className="mt-4 grid grid-cols-4 gap-1 text-center">
                    {["Đặt hàng", "Giao hàng", "Đã nhận hàng", "Đánh giá & tip"].map((label, index) => (
                      <div key={label} className="relative">
                        <div className={`mx-auto grid h-10 w-10 place-items-center rounded-full border ${index < 3 ? "border-[#ff8d28] bg-orange-50 text-[#ff8d28]" : "border-slate-200 bg-white text-slate-300"}`}>
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
                            {index === 0 ? <><path strokeLinecap="round" strokeLinejoin="round" d="M7 3h10v18H7z" /><path strokeLinecap="round" d="M9 7h6M9 11h6M9 15h4" /></> : null}
                            {index === 1 ? <><path strokeLinecap="round" strokeLinejoin="round" d="M3 16V6h11v10M14 10h4l3 3v3h-7M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm12 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" /></> : null}
                            {index === 2 ? <><path strokeLinecap="round" strokeLinejoin="round" d="M5 12a7 7 0 1 0 14 0 7 7 0 0 0-14 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-4" /></> : null}
                            {index === 3 ? <><path strokeLinecap="round" strokeLinejoin="round" d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" /></> : null}
                          </svg>
                        </div>
                        <p className="mt-2 text-[9px] font-bold leading-3 text-slate-500">{label}</p>
                        {index < 3 ? <span className="absolute left-[65%] top-5 h-px w-[70%] bg-orange-200" /> : null}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-[10px] leading-4 text-slate-600">
                    Chỉ hiển thị phần đánh giá và tip shipper khi đơn hàng đã được giao thành công.
                  </div>
                </section>
                <section className="rounded-xl border border-slate-200 bg-white p-3"><h3 className="text-sm font-black text-slate-900">Tóm tắt đơn hàng</h3><div className="mt-3 grid gap-2 text-sm"><div className="flex justify-between"><span className="text-slate-500">Tạm tính</span><b>{formatCurrency(selectedOrder.total_amount ?? selectedOrder.totalAmount)}</b></div><div className="flex justify-between"><span className="text-slate-500">Phí vận chuyển</span><b>Miễn phí</b></div><div className="border-t border-slate-100 pt-2 flex justify-between"><span className="font-bold">Tổng thanh toán</span><b className="text-lg text-[#ff8d28]">{formatCurrency(selectedOrder.total_amount ?? selectedOrder.totalAmount)}</b></div></div><button type="button" onClick={() => setDetailNotice("Tính năng mua lại đang được cập nhật.")} className="mt-3 w-full rounded-xl border border-orange-300 px-3 py-2 text-xs font-bold text-[#ff8d28]">Mua lại</button></section>
                <section className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-900">Tip shipper</h3>
                    <span className="text-slate-400">×</span>
                  </div>
                  <p className="mt-2 text-[10px] text-slate-500">Chọn số tiền muốn gửi tặng shipper <span className="font-semibold text-[#ff8d28]">(không bắt buộc)</span>.</p>
                  <div className="mt-2 grid min-w-0 grid-cols-3 gap-1">
                    {[20000, 50000, 100000].map((amount) => <button key={amount} type="button" onClick={() => { setSelectedTip(amount); setCustomTip(""); }} className={`flex min-w-0 items-center justify-center rounded-lg border px-1 py-2 text-[11px] font-bold leading-none whitespace-nowrap ${selectedTip === amount ? "border-[#ff8d28] bg-orange-50 text-[#ff8d28]" : "border-slate-200 text-slate-700"}`}>{formatCurrency(amount)}</button>)}
                  </div>
                  <label className="mt-2 !flex h-12 min-w-0 flex-row items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-400 transition focus-within:border-[#ff8d28] focus-within:ring-2 focus-within:ring-orange-100"><input aria-label="Nhập số tiền tip khác" inputMode="numeric" value={customTip} onChange={(event) => { const digits = event.target.value.replace(/\D/g, ""); setCustomTip(digits); setSelectedTip(digits ? Number(digits) : null); }} placeholder="Nhập số tiền khác" className="!h-10 !min-h-0 !w-0 min-w-0 flex-1 border-0 bg-transparent px-0 py-0 font-semibold text-slate-700 outline-none ring-0 placeholder:font-semibold placeholder:text-slate-400 focus:border-0 focus:outline-none focus:ring-0 focus-visible:outline-none" /><span className="shrink-0 font-bold text-slate-700">đ</span></label>
                  {selectedTip ? (
                    <div className="mt-3 rounded-xl border border-orange-100 bg-orange-50/60 p-3 text-center">
                      <p className="text-[10px] font-bold text-slate-700">Quét QR để tip {formatCurrency(selectedTip)}</p>
                      {tipQrUrl ? <img src={tipQrUrl} alt={`QR chuyển khoản tip ${formatCurrency(selectedTip)}`} className="mx-auto mt-2 h-36 w-36 rounded-lg bg-white object-contain p-1" /> : <p className="mt-2 text-[10px] text-rose-600">Chưa cấu hình tài khoản nhận tip.</p>}
                      <p className="mt-2 text-[9px] leading-4 text-slate-500">Nội dung chuyển khoản: <b>TIP DON {selectedOrder.id}</b></p>
                    </div>
                  ) : null}
                  <p className="mt-2 text-[10px] leading-4 text-slate-500">ⓘ 100% số tiền tip sẽ được chuyển đến shipper.</p>
                  <button type="button" onClick={() => { setSelectedTip(null); setCustomTip(""); }} className="mt-2 w-full rounded-lg bg-[#ff8d28] px-3 py-2 text-xs font-black text-white">{selectedTip ? `Xác nhận tip ${formatCurrency(selectedTip)}` : "Bỏ qua tip"}</button>
                </section>
                <section className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="grid gap-4 sm:grid-cols-2 [&>div:first-child]:hidden">
                    <div>
                      <h3 className="text-sm font-black text-slate-900">Cần hỗ trợ?</h3>
                      <div className="mt-2 grid gap-2 text-[10px] leading-4"><p><b>ⓘ Gặp vấn đề với đơn hàng</b><br /><span className="text-[#ff8d28]">Liên hệ chúng tôi</span></p><p><b>◌ Chat với Studion</b><br /><span className="text-[#ff8d28]">Trò chuyện ngay</span></p><p><b>☎ Hotline</b><br /><span className="text-slate-500">1900 1234</span></p></div>
                    </div>
                    <div>
                      <h3 className="text-sm font-black uppercase text-slate-900">Ghi chú</h3>
                      <ul className="mt-2 grid gap-2 text-[10px] leading-4 text-slate-600"><li>◉ Tip shipper là tùy chọn.</li><li>◉ Có thể chỉ đánh giá, chỉ tip hoặc cả hai.</li><li>◉ Lịch sử tip và đánh giá được lưu trong đơn hàng.</li></ul>
                    </div>
                  </div>
                </section>
              </aside>
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
        </div>
      ) : null}
    </main>
  );
}

function Detail({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="border-b border-slate-100 py-2 last:border-b-0">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{value || "Chưa cập nhật"}</p>
    </div>
  );
}
