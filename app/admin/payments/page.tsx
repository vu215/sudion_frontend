"use client";

import { useMemo, useState, useEffect, type FormEvent } from "react";
import AdminLayout from "../_components/admin-layout";
import { AdminIcon, IconButton } from "../_components/admin-icons";
import { api } from "@/lib/api";

type PayStatus = "Thành công" | "Thất bại" | "Đang xử lý" | "Hoàn tiền";
type Payment = {
  id: string;
  transaction_id: string;
  booking_code: string;
  amount: number;
  platform_fee: number;
  net_amount: number;
  payment_method: string;
  payment_type: string;
  status: PayStatus;
  created_at: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080/api";

function adminAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};

  const token =
    window.localStorage.getItem("sudion_token") ||
    window.localStorage.getItem("token") ||
    window.localStorage.getItem("accessToken");

  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState<"payments" | "payouts" | "manual">("payments");
  const [items, setItems] = useState<Payment[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [payoutsLoading, setPayoutsLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<PayStatus | "Tất cả">("Tất cả");
  const [payoutStatus, setPayoutStatus] = useState<string>("Tất cả");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [payoutPagination, setPayoutPagination] = useState<any>(null);

  const [manualBookingCode, setManualBookingCode] = useState("");
  const [manualPaymentType, setManualPaymentType] = useState<"deposit" | "final">("deposit");
  const [manualAmount, setManualAmount] = useState("");
  const [manualTransactionCode, setManualTransactionCode] = useState("");
  const [manualNote, setManualNote] = useState("");
  const [manualSubmitting, setManualSubmitting] = useState(false);
  const [manualResult, setManualResult] = useState<any>(null);

  const mapStatus = (backendStatus: string): PayStatus => {
    const statusMap: Record<string, PayStatus> = {
      completed: "Thành công",
      failed: "Thất bại",
      pending: "Đang xử lý",
      refunded: "Hoàn tiền",
    };
    return statusMap[backendStatus] || "Đang xử lý";
  };

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const text = [item.transaction_id, item.booking_code, item.payment_method, item.status]
        .join(" ")
        .toLowerCase();
      return (
        text.includes(query.toLowerCase()) &&
        (status === "Tất cả" || item.status === status)
      );
    });
  }, [items, query, status]);

  const filteredPayouts = useMemo(() => {
    return payouts.filter((item) => {
      const text = [item.booking_code, item.photographer_name, item.customer_full_name]
        .join(" ")
        .toLowerCase();
      const statusText = item.payout_status === "paid" ? "Đã thanh toán" : "Chờ thanh toán";
      return (
        text.includes(query.toLowerCase()) &&
        (payoutStatus === "Tất cả" || statusText === payoutStatus)
      );
    });
  }, [payouts, query, payoutStatus]);

  const selected = items.find((item) => item.id === selectedId) ?? filtered[0];

  // Load payments from API
  useEffect(() => {
    if (activeTab !== "payments") return;
    async function loadPayments() {
      setLoading(true);
      try {
        const result = (await api.payments.getAll({ page, pageSize: 20 })) as any;

        if (result.success && result.data) {
          const transformedData = (result.data as any).map((payment: any) => ({
            ...payment,
            status: mapStatus(payment.status),
          }));
          setItems(transformedData);
          setPagination(result.pagination);
        }
      } catch (error) {
        console.error("Error loading payments:", error);
      }
      setLoading(false);
    }

    loadPayments();
  }, [page, activeTab]);

  // Load payouts
  useEffect(() => {
    if (activeTab !== "payouts") return;
    async function loadPayouts() {
      setPayoutsLoading(true);
      try {
        const result = (await api.payments.getPayouts({ page, pageSize: 20 })) as any;
        if (result.success && result.data) {
          setPayouts(result.data);
          setPayoutPagination(result.pagination);
        }
      } catch (error) {
        console.error("Error loading payouts:", error);
      }
      setPayoutsLoading(false);
    }
    loadPayouts();
  }, [page, activeTab]);

  // Load stats
  useEffect(() => {
    async function loadStats() {
      const result = (await api.payments.getStats()) as any;
      if (result.success) {
        setStats(result.data);
      }
    }
    loadStats();
  }, []);

  async function handleConfirmPayout(bookingCode: string) {
    if (!window.confirm(`Xác nhận đã chuyển khoản thanh toán đối soát cho thợ ảnh của booking ${bookingCode}?`)) return;
    try {
      const result = (await api.payments.confirmPayout(bookingCode)) as any;
      if (result.success) {
        notify("Đối soát thanh toán thành công!");
        // Refresh payouts list
        const res = (await api.payments.getPayouts({ page, pageSize: 20 })) as any;
        if (res.success && res.data) {
          setPayouts(res.data);
        }
      } else {
        alert(result.message || "Lỗi khi thực hiện đối soát.");
      }
    } catch (err: any) {
      alert("Lỗi kết nối: " + err.message);
    }
  }

  async function handleManualBankConfirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const bookingCode = manualBookingCode.trim();
    const transactionCode = manualTransactionCode.trim();
    const amount = Math.round(Number(manualAmount.replace(/[^0-9]/g, "")));

    if (!bookingCode || !transactionCode || !amount) {
      alert("Nhập đủ Booking code, số tiền thực nhận và mã giao dịch ngân hàng.");
      return;
    }

    if (!window.confirm(
      `Xác nhận giao dịch ${transactionCode}\nBooking: ${bookingCode}\nSố tiền: ${money(amount)}\n\nSau bước này backend sẽ cập nhật payment/booking và gửi email.`
    )) {
      return;
    }

    try {
      setManualSubmitting(true);
      setManualResult(null);

      const response = await fetch(`${API_URL}/admin/payments/manual-bank-confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...adminAuthHeaders(),
        },
        body: JSON.stringify({
          bookingCode,
          paymentType: manualPaymentType,
          amount,
          transactionCode,
          note: manualNote.trim(),
        }),
      });

      const json = await response.json().catch(() => ({}));

      if (!response.ok || json?.success === false) {
        const expected = Number(json?.data?.expected_amount || 0);
        const suffix = expected > 0 ? ` Số tiền hệ thống yêu cầu: ${money(expected)}.` : "";
        throw new Error((json?.message || "Không thể xác nhận giao dịch.") + suffix);
      }

      setManualResult(json?.data || { success: true });
      notify("Đã xác nhận chuyển khoản thủ công!");
      setManualTransactionCode("");
      setManualNote("");

      // Refresh stats để tab lịch sử thấy giao dịch mới ngay khi quay lại.
      try {
        const statResult = (await api.payments.getStats()) as any;
        if (statResult.success) setStats(statResult.data);
      } catch (_) {}
    } catch (error: any) {
      alert(error?.message || "Lỗi khi xác nhận chuyển khoản thủ công.");
    } finally {
      setManualSubmitting(false);
    }
  }

  function notify(text: string) {
    setToast(text);
    setTimeout(() => setToast(""), 1800);
  }

  if (loading && items.length === 0 && activeTab === "payments") {
    return (
      <AdminLayout active="Thanh toán" search={query} onSearch={setQuery}>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mb-4 text-2xl"></div>
            <p className="text-gray-600">Đang tải dữ liệu...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout active="Thanh toán" search={query} onSearch={setQuery}>
      {toast ? <Toast text={toast} /> : null}
      <div className="min-w-0">
        <PageHead />

        {/* Tab switching buttons */}
        <div className="mb-6 flex border-b border-[#edf0f5]">
          <button
            onClick={() => {
              setActiveTab("payments");
              setQuery("");
              setPage(1);
            }}
            className={`pb-3.5 px-4 text-[14px] font-extrabold transition-all border-b-2 ${
              activeTab === "payments"
                ? "border-[#ff8d28] text-[#ff8d28]"
                : "border-transparent text-[#697086] hover:text-[#0e111d]"
            }`}
          >
            Lịch sử Giao dịch
          </button>
          <button
            onClick={() => {
              setActiveTab("payouts");
              setQuery("");
              setPage(1);
            }}
            className={`pb-3.5 px-4 text-[14px] font-extrabold transition-all border-b-2 ${
              activeTab === "payouts"
                ? "border-[#ff8d28] text-[#ff8d28]"
                : "border-transparent text-[#697086] hover:text-[#0e111d]"
            }`}
          >
            Đối soát & Hoa hồng Thợ ảnh
          </button>
          <button
            onClick={() => {
              setActiveTab("manual");
              setQuery("");
              setPage(1);
            }}
            className={`pb-3.5 px-4 text-[14px] font-extrabold transition-all border-b-2 ${
              activeTab === "manual"
                ? "border-[#ff8d28] text-[#ff8d28]"
                : "border-transparent text-[#697086] hover:text-[#0e111d]"
            }`}
          >
            Xác nhận CK thủ công
          </button>
        </div>

        {activeTab === "payments" ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <Stat title="Tổng giao dịch" value={stats?.total?.toString() || "0"} />
              <Stat title="Thành công" value={stats?.completed?.toString() || "0"} />
              <Stat title="Thất bại" value={stats?.failed?.toString() || "0"} />
              <Stat title="Đang xử lý" value={stats?.pending?.toString() || "0"} />
              <Stat title="Hoàn tiền" value={stats?.refunded?.toString() || "0"} />
            </div>

            <Panel className="mt-4">
              <div className="mb-3 grid gap-2 md:grid-cols-[minmax(0,1fr)_150px_40px]">
                <label className="relative !block">
                  <AdminIcon
                    name="search"
                    className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8a93a5]"
                  />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="!h-10 !min-h-0 w-full rounded-xl border border-[#dfe3ec] !py-0 !pl-10 !pr-3 !text-[12px] !font-normal outline-none focus:border-[#ff8d28]"
                    placeholder="Tìm kiếm theo mã giao dịch, booking..."
                  />
                </label>
                <Select
                  value={status}
                  options={["Tất cả", "Thành công", "Thất bại", "Đang xử lý", "Hoàn tiền"]}
                  onChange={(v) => setStatus(v as PayStatus | "Tất cả")}
                />
                <IconButton
                  label="Đặt lại"
                  icon="filter"
                  size="md"
                  onClick={() => {
                    setQuery("");
                    setStatus("Tất cả");
                  }}
                />
              </div>

              <div className="overflow-x-auto rounded-xl border border-[#e6e9f1]">
                <table className="w-full min-w-[1000px] text-left text-[12px]">
                  <thead className="bg-[#fbfcfe] text-[#536078]">
                    <tr>
                      {[
                        "Mã GD",
                        "Booking",
                        "Số tiền",
                        "Phí nền tảng",
                        "Thực nhận",
                        "Phương thức",
                        "Loại",
                        "Trạng thái",
                        "Ngày GD",
                      ].map((h) => (
                        <th key={h} className="px-3 py-3 font-semibold">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#edf0f5]">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-3 py-8 text-center text-gray-500">
                          Không có giao dịch nào
                        </td>
                      </tr>
                    ) : (
                      filtered.map((item) => (
                        <tr
                          key={item.id}
                          onClick={() => setSelectedId(item.id)}
                          className={`cursor-pointer hover:bg-[#fff8f1] ${selectedId === item.id ? "bg-[#fff3e8]" : "bg-white"
                            }`}
                        >
                          <td className="px-3 py-3 font-medium text-[#ff8d28]">
                            {item.transaction_id}
                          </td>
                          <td className="px-3 py-3">{item.booking_code || "N/A"}</td>
                          <td className="px-3 py-3 font-semibold">{money(item.amount)}</td>
                          <td className="px-3 py-3">{money(item.platform_fee)}</td>
                          <td className="px-3 py-3 font-semibold text-emerald-600">
                            {money(item.net_amount)}
                          </td>
                          <td className="px-3 py-3">{item.payment_method}</td>
                          <td className="px-3 py-3">{item.payment_type}</td>
                          <td className="px-3 py-3">
                            <Badge text={item.status} />
                          </td>
                          <td className="px-3 py-3">
                            {new Date(item.created_at).toLocaleDateString("vi-VN")}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex items-center justify-between text-[12px] text-[#697086]">
                <span>
                  Hiển thị {filtered.length} của {pagination?.total || items.length} giao dịch
                </span>
                <div className="flex gap-2">
                  {pagination && pagination.page > 1 && (
                    <button
                      onClick={() => setPage(page - 1)}
                      className="rounded-xl border px-3 py-2 hover:bg-gray-50"
                    >
                      Trước
                    </button>
                  )}
                  <span className="rounded-xl border px-3 py-2">
                    Trang {pagination?.page || 1} / {pagination?.totalPages || 1}
                  </span>
                  {pagination && pagination.page < pagination.totalPages && (
                    <button
                      onClick={() => setPage(page + 1)}
                      className="rounded-xl border px-3 py-2 hover:bg-gray-50"
                    >
                      Sau
                    </button>
                  )}
                </div>
              </div>
            </Panel>
          </>
        ) : activeTab === "payouts" ? (
          <Panel>
            <div className="mb-3 grid gap-2 md:grid-cols-[minmax(0,1fr)_160px_40px]">
              <label className="relative !block">
                <AdminIcon
                  name="search"
                  className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8a93a5]"
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="!h-10 !min-h-0 w-full rounded-xl border border-[#dfe3ec] !py-0 !pl-10 !pr-3 !text-[12px] !font-normal outline-none focus:border-[#ff8d28]"
                  placeholder="Tìm kiếm theo mã booking, thợ ảnh, khách hàng..."
                />
              </label>
              <Select
                value={payoutStatus}
                options={["Tất cả", "Chờ thanh toán", "Đã thanh toán"]}
                onChange={(v) => setPayoutStatus(v)}
              />
              <IconButton
                label="Đặt lại"
                icon="filter"
                size="md"
                onClick={() => {
                  setQuery("");
                  setPayoutStatus("Tất cả");
                }}
              />
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#e6e9f1]">
              <table className="w-full min-w-[1000px] text-left text-[12px]">
                <thead className="bg-[#fbfcfe] text-[#536078]">
                  <tr>
                    {[
                      "Mã Booking",
                      "Thợ chụp hình",
                      "Khách hàng",
                      "Tổng số tiền",
                      "Hoa hồng sàn",
                      "Thực trả thợ ảnh",
                      "Trạng thái đối soát",
                      "Thao tác",
                    ].map((h) => (
                      <th key={h} className="px-3 py-3 font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf0f5]">
                  {payoutsLoading ? (
                    <tr>
                      <td colSpan={8} className="px-3 py-8 text-center text-gray-500">
                        Đang tải danh sách đối soát...
                      </td>
                    </tr>
                  ) : filteredPayouts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-3 py-8 text-center text-gray-500">
                        Không có lịch sử đối soát nào
                      </td>
                    </tr>
                  ) : (
                    filteredPayouts.map((item) => (
                      <tr key={item.id} className="hover:bg-[#fff8f1]">
                        <td className="px-3 py-3 font-medium text-[#ff8d28]">
                          {item.booking_code}
                        </td>
                        <td className="px-3 py-3 font-semibold text-gray-800">{item.photographer_name}</td>
                        <td className="px-3 py-3">{item.customer_full_name}</td>
                        <td className="px-3 py-3 font-semibold">{money(item.estimated_total)}</td>
                        <td className="px-3 py-3 text-red-600 font-medium">-{money(item.commission_amount)}</td>
                        <td className="px-3 py-3 font-bold text-emerald-600">
                          {money(item.net_payout)}
                        </td>
                        <td className="px-3 py-3">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${
                            item.payout_status === "paid" ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700"
                          }`}>
                            {item.payout_status === "paid" ? "Đã thanh toán" : "Chờ thanh toán"}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          {item.payout_status === "paid" ? (
                            <span className="text-gray-400 font-medium">Hoàn tất</span>
                          ) : (
                            <button
                              onClick={() => handleConfirmPayout(item.booking_code)}
                              className="rounded-lg bg-[#ff8d28] hover:bg-[#e0751b] px-3 py-1.5 font-bold text-white transition-colors"
                            >
                              Đã chuyển tiền
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between text-[12px] text-[#697086]">
              <span>
                Hiển thị {filteredPayouts.length} của {payoutPagination?.total || payouts.length} buổi chụp
              </span>
              <div className="flex gap-2">
                {payoutPagination && payoutPagination.page > 1 && (
                  <button
                    onClick={() => setPage(page - 1)}
                    className="rounded-xl border px-3 py-2 hover:bg-gray-50"
                  >
                    Trước
                  </button>
                )}
                <span className="rounded-xl border px-3 py-2">
                  Trang {payoutPagination?.page || 1} / {payoutPagination?.totalPages || 1}
                </span>
                {payoutPagination && payoutPagination.page < payoutPagination.totalPages && (
                  <button
                    onClick={() => setPage(page + 1)}
                    className="rounded-xl border px-3 py-2 hover:bg-gray-50"
                  >
                    Sau
                  </button>
                )}
              </div>
            </div>
          </Panel>
        ) : (
          <Panel>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
              <form onSubmit={handleManualBankConfirm} className="space-y-4">
                <div>
                  <h2 className="text-[18px] font-semibold text-[#0e111d]">
                    Xác nhận chuyển khoản dự phòng
                  </h2>
                  <p className="mt-1 text-[12px] leading-5 text-[#697086]">
                    Chỉ Admin có quyền xác nhận. Backend kiểm tra booking, loại thanh toán,
                    đúng số tiền và mã giao dịch chưa từng được sử dụng trước khi cập nhật paid.
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-[12px] font-semibold text-[#536078]">
                      Booking code
                    </span>
                    <input
                      value={manualBookingCode}
                      onChange={(e) => setManualBookingCode(e.target.value)}
                      placeholder="VD: BK17881557178631219"
                      className="h-11 w-full rounded-xl border border-[#dfe3ec] px-3 text-[13px] outline-none focus:border-[#ff8d28]"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-[12px] font-semibold text-[#536078]">
                      Loại thanh toán
                    </span>
                    <select
                      value={manualPaymentType}
                      onChange={(e) => setManualPaymentType(e.target.value as "deposit" | "final")}
                      className="h-11 w-full rounded-xl border border-[#dfe3ec] bg-white px-3 text-[13px] outline-none focus:border-[#ff8d28]"
                    >
                      <option value="deposit">Tiền cọc</option>
                      <option value="final">Phần còn lại</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-[12px] font-semibold text-[#536078]">
                      Số tiền thực nhận
                    </span>
                    <input
                      value={manualAmount}
                      onChange={(e) => setManualAmount(e.target.value)}
                      inputMode="numeric"
                      placeholder="VD: 7500"
                      className="h-11 w-full rounded-xl border border-[#dfe3ec] px-3 text-[13px] outline-none focus:border-[#ff8d28]"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-[12px] font-semibold text-[#536078]">
                      Mã giao dịch ngân hàng
                    </span>
                    <input
                      value={manualTransactionCode}
                      onChange={(e) => setManualTransactionCode(e.target.value)}
                      placeholder="Nhập từ biên lai/app ngân hàng"
                      className="h-11 w-full rounded-xl border border-[#dfe3ec] px-3 text-[13px] outline-none focus:border-[#ff8d28]"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="mb-1.5 block text-[12px] font-semibold text-[#536078]">
                    Ghi chú kiểm tra (không bắt buộc)
                  </span>
                  <textarea
                    value={manualNote}
                    onChange={(e) => setManualNote(e.target.value)}
                    rows={3}
                    placeholder="VD: Đã đối chiếu biên lai trên app ngân hàng"
                    className="w-full rounded-xl border border-[#dfe3ec] px-3 py-2.5 text-[13px] outline-none focus:border-[#ff8d28]"
                  />
                </label>

                <button
                  type="submit"
                  disabled={manualSubmitting}
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-[#ff8d28] px-5 text-[13px] font-extrabold text-white transition hover:bg-[#e0751b] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {manualSubmitting ? "Đang kiểm tra & xác nhận..." : "Kiểm tra và xác nhận đã thanh toán"}
                </button>
              </form>

              <div className="rounded-2xl border border-[#fde2c8] bg-[#fff9f3] p-5">
                <h3 className="text-[14px] font-semibold text-[#0e111d]">Luồng sau khi Admin xác nhận</h3>
                <div className="mt-3 space-y-2 text-[12px] leading-5 text-[#697086]">
                  <p>1. Kiểm tra Booking code và số tiền từ DB.</p>
                  <p>2. Chặn mã giao dịch đã được dùng trước đó.</p>
                  <p>3. Ghi payment với provider <b>admin_manual_bank</b>.</p>
                  <p>4. Cọc → booking <b>confirmed</b>.</p>
                  <p>5. Thanh toán cuối → <b>fully_paid</b> + settlement.</p>
                  <p>6. Gửi notification/email bằng flow payment hiện tại.</p>
                </div>

                {manualResult ? (
                  <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-[12px] text-emerald-800">
                    <b>Đã xử lý thành công.</b>
                    <div className="mt-1">
                      Payment: {manualResult?.payment_code || "đã tạo"} · Booking:{" "}
                      {manualResult?.booking?.booking_code || manualBookingCode}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </Panel>
        )}

        {/* Detail Sidebar */}
        {selectedId !== null && selected && activeTab === "payments" ? (
          <div
            className="fixed inset-0 z-50 bg-[#0f172a]/35 backdrop-blur-[2px]"
            onClick={() => setSelectedId(null)}
          >
            <aside
              className="absolute right-0 top-0 h-full w-full min-w-0 overflow-y-auto border-l border-[#e6e9f1] bg-white p-5 shadow-[-18px_0_38px_rgba(12,18,32,0.16)] sm:w-[430px]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-[16px] font-semibold">Chi tiết giao dịch</h2>
                <IconButton label="Đóng" icon="close" onClick={() => setSelectedId(null)} />
              </div>

              <div className="mt-5">
                <div className="flex items-center gap-2">
                  <h3 className="text-[17px] font-semibold">{selected.transaction_id}</h3>
                  <Badge text={selected.status} />
                </div>
                <p className="mt-1 text-[#697086]">
                  {new Date(selected.created_at).toLocaleString("vi-VN")}
                </p>
              </div>

              <div className="mt-5 space-y-4 text-[12px]">
                <h3 className="text-[14px] font-semibold">Thông tin giao dịch</h3>
                <Info label="Booking" value={selected.booking_code || "N/A"} />
                <Info label="Số tiền" value={money(selected.amount)} />
                <Info label="Phí nền tảng" value={money(selected.platform_fee)} />
                <Info label="Thực nhận" value={money(selected.net_amount)} />
                <Info label="Phương thức" value={selected.payment_method} />
                <Info label="Loại thanh toán" value={selected.payment_type} />
                <Info label="Trạng thái" value={selected.status} />
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => notify("Xem chi tiết booking")}
                  className="rounded-xl border border-[#dfe3ec] bg-white px-4 py-2 text-[13px] font-medium hover:bg-gray-50"
                >
                  Xem Booking
                </button>
              </div>
            </aside>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
}

function PageHead() {
  return (
    <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <h1 className="text-[24px] font-semibold">Quản lý Thanh toán</h1>
        <p className="mt-1 text-[13px] text-[#697086]">
          Theo dõi giao dịch và doanh thu nền tảng
        </p>
      </div>
      <div className="flex gap-2">
        <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#ffd2ad] bg-white px-4 text-[13px] text-[#ff8d28] hover:bg-[#fff8f1]">
          <AdminIcon name="download" /> Xuất Excel
        </button>
      </div>
    </div>
  );
}

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section
      className={`rounded-2xl border border-[#e7e9f1] bg-white p-4 shadow-[0_14px_34px_rgba(12,18,32,0.04)] ${className}`}
    >
      {children}
    </section>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <Panel>
      <p className="text-[#697086]">{title}</p>
      <b className="mt-1 block text-[22px]">{value}</b>
      <p className="text-[11px] text-[#697086]">giao dịch</p>
    </Panel>
  );
}

function Select({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="!h-10 !min-h-0 !w-full rounded-xl !border !border-[#ffd2ad] bg-white !px-3 !py-0 !text-[12px] !font-normal text-[#ff8d28] !shadow-none outline-none focus:!border-[#ff8d28]"
    >
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  );
}

function Badge({ text }: { text: string }) {
  const statusColors: Record<string, string> = {
    "Thành công": "bg-emerald-50 text-emerald-700",
    "Thất bại": "bg-red-50 text-red-600",
    "Đang xử lý": "bg-blue-50 text-blue-700",
    "Hoàn tiền": "bg-orange-50 text-orange-700",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${statusColors[text] || "bg-gray-50 text-gray-700"
        }`}
    >
      {text}
    </span>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-3">
      <span className="text-[#697086]">{label}</span>
      <b className="font-medium">{value}</b>
    </div>
  );
}

function Toast({ text }: { text: string }) {
  return (
    <div className="fixed right-6 top-20 z-50 rounded-xl border bg-white px-4 py-3 font-medium text-emerald-700 shadow-xl">
      {text}
    </div>
  );
}

function money(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value) + "đ";
}
