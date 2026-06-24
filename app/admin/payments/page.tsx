"use client";

import { useMemo, useState, useEffect } from "react";
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

export default function PaymentsPage() {
  const [items, setItems] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<PayStatus | "Tất cả">("Tất cả");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

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

  const selected = items.find((item) => item.id === selectedId) ?? filtered[0];

  // Load payments from API
  useEffect(() => {
    async function loadPayments() {
      setLoading(true);
      try {
        const result = await api.payments.getAll({ page, pageSize: 20 });

        if (result.success && result.data) {
          const transformedData = result.data.map((payment: any) => ({
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
  }, [page, query, status]);

  // Load stats
  useEffect(() => {
    async function loadStats() {
      const result = await api.payments.getStats();
      if (result.success) {
        setStats(result.data);
      }
    }
    loadStats();
  }, []);

  function notify(text: string) {
    setToast(text);
    setTimeout(() => setToast(""), 1800);
  }

  if (loading && items.length === 0) {
    return (
      <AdminLayout active="Thanh toán" search={query} onSearch={setQuery}>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mb-4 text-2xl">🔄</div>
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
                      className={`cursor-pointer hover:bg-[#fff8f1] ${
                        selectedId === item.id ? "bg-[#fff3e8]" : "bg-white"
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

        {/* Detail Sidebar */}
        {selectedId !== null && selected ? (
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
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${
        statusColors[text] || "bg-gray-50 text-gray-700"
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
