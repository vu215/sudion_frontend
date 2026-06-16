"use client";

import { useMemo, useState } from "react";
import AdminLayout from "../_components/admin-layout";
import { AdminIcon, IconButton } from "../_components/admin-icons";

type PayStatus = "Thành công" | "Thất bại" | "Đang xử lý" | "Hoàn tiền";
type PayMethod = "MoMo" | "VNPAY" | "Chuyển khoản" | "ZaloPay" | "Visa/MC";
type PayType = "Đặt cọc" | "Thanh toán đủ" | "Hoàn tiền" | "Phí dịch vụ";

type Payment = {
  id: string;
  bookingId: string;
  customer: string;
  customerAvatar: string;
  customerId: string;
  photographer: string;
  service: string;
  amount: number;
  fee: number;
  net: number;
  method: PayMethod;
  type: PayType;
  status: PayStatus;
  gateway: string;
  gatewayTxnId: string;
  createdAt: string;
  note: string;
};

const avatars = ["/Overlay+Shadow.png", "/logo_sudion.jpg", "/screen%201.png", "/Overlay+Border+Shadow.png", "/logo_sudion_remove.png"];

const seed: Payment[] = [
  { id: "TXN_001", bookingId: "BK20241130", customer: "Nguyễn Thị Mai", customerAvatar: avatars[0], customerId: "USR_2291", photographer: "Minh Tuấn Studio", service: "Chụp ảnh cưới", amount: 3750000, fee: 75000, net: 3675000, method: "MoMo", type: "Đặt cọc", status: "Thành công", gateway: "MoMo Payment", gatewayTxnId: "MOMO2024113001", createdAt: "30/11/2024 10:32", note: "Đặt cọc 30%" },
  { id: "TXN_002", bookingId: "BK20241129", customer: "Trần Văn Phong", customerAvatar: avatars[1], customerId: "USR_3345", photographer: "Elena Studio", service: "Chụp ảnh đôi", amount: 3200000, fee: 64000, net: 3136000, method: "VNPAY", type: "Thanh toán đủ", status: "Thành công", gateway: "VNPAY Gateway", gatewayTxnId: "VNPAY20241129001", createdAt: "29/11/2024 16:20", note: "" },
  { id: "TXN_003", bookingId: "BK20241128", customer: "Phạm Hồng Ngọc", customerAvatar: avatars[2], customerId: "USR_4456", photographer: "Khang Pham", service: "Kỷ yếu", amount: 1440000, fee: 28800, net: 1411200, method: "ZaloPay", type: "Đặt cọc", status: "Thành công", gateway: "ZaloPay", gatewayTxnId: "ZALO202411280A1", createdAt: "28/11/2024 14:15", note: "Đặt cọc 30%" },
  { id: "TXN_004", bookingId: "BK20241127", customer: "Lê Quang Huy", customerAvatar: avatars[3], customerId: "USR_5567", photographer: "May Studio", service: "Sự kiện", amount: 8000000, fee: 160000, net: 7840000, method: "Visa/MC", type: "Thanh toán đủ", status: "Thành công", gateway: "Stripe VN", gatewayTxnId: "ch_3QB4ABCDEF", createdAt: "27/11/2024 11:05", note: "" },
  { id: "TXN_005", bookingId: "BK20241126", customer: "Vũ Minh Anh", customerAvatar: avatars[4], customerId: "USR_6678", photographer: "David Lee", service: "Chụp đơn", amount: 750000, fee: 15000, net: 735000, method: "MoMo", type: "Đặt cọc", status: "Thất bại", gateway: "MoMo Payment", gatewayTxnId: "MOMO2024112601", createdAt: "26/11/2024 09:45", note: "Lỗi timeout từ MoMo gateway" },
  { id: "TXN_006", bookingId: "BK20241125", customer: "Hoàng Tú Anh", customerAvatar: avatars[0], customerId: "USR_7789", photographer: "Minh Tuấn Studio", service: "Pre-wedding", amount: 5600000, fee: 112000, net: 5488000, method: "Chuyển khoản", type: "Thanh toán đủ", status: "Đang xử lý", gateway: "Ngân hàng", gatewayTxnId: "CK20241125001", createdAt: "25/11/2024 18:30", note: "Chờ xác nhận ngân hàng" },
  { id: "TXN_007", bookingId: "BK20241118", customer: "Đặng Quốc Bảo", customerAvatar: avatars[1], customerId: "USR_8890", photographer: "Sun Studio", service: "Sự kiện", amount: 6300000, fee: 0, net: -6300000, method: "Chuyển khoản", type: "Hoàn tiền", status: "Hoàn tiền", gateway: "Ngân hàng", gatewayTxnId: "RF20241119001", createdAt: "19/11/2024 17:00", note: "Hoàn tiền theo yêu cầu RF_005" },
  { id: "TXN_008", bookingId: "BK20241115", customer: "Nguyễn Gia Hân", customerAvatar: avatars[2], customerId: "USR_9901", photographer: "Khang Pham", service: "Chụp ảnh cưới", amount: 4860000, fee: 97200, net: 4762800, method: "VNPAY", type: "Đặt cọc", status: "Thành công", gateway: "VNPAY Gateway", gatewayTxnId: "VNPAY20241115001", createdAt: "15/11/2024 10:20", note: "" },
];

const statusColors: Record<PayStatus, string> = {
  "Thành công": "bg-emerald-50 text-emerald-700",
  "Thất bại": "bg-red-50 text-red-600",
  "Đang xử lý": "bg-blue-50 text-blue-700",
  "Hoàn tiền": "bg-orange-50 text-orange-700",
};

export default function PaymentsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<PayStatus | "Tất cả">("Tất cả");
  const [method, setMethod] = useState("Tất cả");
  const [type, setType] = useState("Tất cả");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [toast, setToast] = useState("");

  const selected = seed.find((item) => item.id === selectedId) ?? seed[0];

  const filtered = useMemo(() => seed.filter((item) => {
    const text = [item.id, item.bookingId, item.customer, item.photographer, item.method, item.type, item.status].join(" ").toLowerCase();
    return text.includes(query.toLowerCase())
      && (status === "Tất cả" || item.status === status)
      && (method === "Tất cả" || item.method === method)
      && (type === "Tất cả" || item.type === type);
  }), [query, status, method, type]);

  const totalSuccess = seed.filter((i) => i.status === "Thành công").reduce((s, i) => s + i.amount, 0);
  const totalFee = seed.filter((i) => i.status === "Thành công").reduce((s, i) => s + i.fee, 0);

  function notify(text: string) { setToast(text); setTimeout(() => setToast(""), 1800); }

  function openDetail(id: string) {
    setSelectedId(id);
    window.requestAnimationFrame(() => setDetailOpen(true));
  }

  function closeDetail() {
    setDetailOpen(false);
    window.setTimeout(() => setSelectedId(null), 220);
  }

  return (
    <AdminLayout active="Thanh toán" search={query} onSearch={setQuery}>
      {toast ? <Toast text={toast} /> : null}
      <div className="min-w-0">
        <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h1 className="text-[24px] font-semibold">Quản lý Thanh toán</h1>
            <p className="mt-1 text-[13px] text-[#697086]">Theo dõi giao dịch và doanh thu nền tảng</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => notify("Đã xuất báo cáo giao dịch.")} className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#ffd2ad] bg-white px-4 text-[13px] text-[#ff8d28] hover:bg-[#fff8f1]">
              <AdminIcon name="download" /> Xuất Excel
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Tổng giao dịch" value={String(seed.length)} note="Tháng 11/2024" tone="orange" />
          <StatCard title="Thành công" value={String(seed.filter((i) => i.status === "Thành công").length)} note={money(totalSuccess)} tone="green" />
          <StatCard title="Doanh thu phí (2%)" value={money(totalFee)} note="Phí nền tảng" tone="blue" />
          <StatCard title="Thất bại / Đang xử lý" value={String(seed.filter((i) => i.status === "Thất bại" || i.status === "Đang xử lý").length)} note="Cần theo dõi" tone="red" />
        </div>

        <Panel className="mt-4">
          <div className="mb-3 flex gap-6 overflow-x-auto border-b border-[#edf0f5]">
            {(["Tất cả", "Thành công", "Đang xử lý", "Thất bại", "Hoàn tiền"] as const).map((tab) => (
              <button key={tab} onClick={() => setStatus(tab)} className={`shrink-0 border-b-2 px-2 py-3 text-[12px] font-medium ${status === tab ? "border-[#ff8d28] text-[#ff8d28]" : "border-transparent text-[#536078]"}`}>
                {tab} ({tab === "Tất cả" ? seed.length : seed.filter((i) => i.status === tab).length})
              </button>
            ))}
          </div>
          <div className="mb-3 grid items-center gap-2 xl:grid-cols-[minmax(280px,1.25fr)_160px_160px_160px_40px]">
            <label className="relative !block min-w-0">
              <AdminIcon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8a93a5]" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} className="!h-10 !min-h-0 w-full rounded-xl border border-[#dfe3ec] bg-white !py-0 !pl-10 !pr-3 !text-[12px] !font-normal outline-none focus:border-[#ff8d28]" placeholder="Tìm mã GD, booking, khách hàng..." />
            </label>
            <Select value={status} options={["Tất cả", "Thành công", "Đang xử lý", "Thất bại", "Hoàn tiền"]} onChange={(v) => setStatus(v as PayStatus | "Tất cả")} prefix="Trạng thái:" />
            <Select value={method} options={["Tất cả", "MoMo", "VNPAY", "Chuyển khoản", "ZaloPay", "Visa/MC"]} onChange={setMethod} prefix="Phương thức:" />
            <Select value={type} options={["Tất cả", "Đặt cọc", "Thanh toán đủ", "Hoàn tiền", "Phí dịch vụ"]} onChange={setType} prefix="Loại GD:" />
            <IconButton label="Đặt lại" icon="filter" size="md" onClick={() => { setQuery(""); setStatus("Tất cả"); setMethod("Tất cả"); setType("Tất cả"); }} />
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#e6e9f1]">
            <table className="w-full min-w-[1080px] text-left text-[12px]">
              <thead className="bg-[#fbfcfe] text-[#536078]">
                <tr>{["Mã GD", "Khách hàng", "Booking / Photographer", "Loại GD", "Số tiền", "Phí", "Phương thức", "Trạng thái", "Thời gian", ""].map((h, i) => <th key={i} className="px-3 py-3 font-semibold">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-[#edf0f5]">
                {filtered.map((item) => (
                  <tr key={item.id} onClick={() => openDetail(item.id)} className={`cursor-pointer hover:bg-[#fff8f1] ${selectedId === item.id ? "bg-[#fff3e8]" : "bg-white"}`}>
                    <td className="px-3 py-3 font-medium text-[#ff8d28]">{item.id}<p className="text-[#697086]">{item.type}</p></td>
                    <td className="px-3 py-3"><div className="flex items-center gap-2"><img src={item.customerAvatar} alt="" className="h-8 w-8 rounded-full object-cover" /><div><b>{item.customer}</b><p className="text-[#697086]">{item.customerId}</p></div></div></td>
                    <td className="px-3 py-3"><b className="font-medium">#{item.bookingId}</b><p className="text-[#697086]">{item.photographer}</p></td>
                    <td className="px-3 py-3"><span className="rounded-lg bg-[#f0f2f8] px-2.5 py-1 text-[11px]">{item.type}</span></td>
                    <td className="px-3 py-3 font-semibold">{money(item.amount)}</td>
                    <td className="px-3 py-3 text-[#697086]">{item.fee > 0 ? money(item.fee) : "—"}</td>
                    <td className="px-3 py-3">{item.method}</td>
                    <td className="px-3 py-3"><span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${statusColors[item.status]}`}>{item.status}</span></td>
                    <td className="px-3 py-3 text-[#697086]">{item.createdAt}</td>
                    <td className="px-3 py-3"><IconButton label="Xem" icon="eye" onClick={(e) => { e.stopPropagation(); openDetail(item.id); }} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center justify-between text-[12px] text-[#697086]">
            <span>Hiển thị 1 - {filtered.length} của {seed.length} giao dịch</span>
            <span className="rounded-xl border border-[#dfe3ec] px-3 py-2">10 / trang</span>
          </div>
        </Panel>
      </div>

      {selectedId !== null ? (
        <div className={`fixed inset-0 z-50 bg-[#0f172a]/45 backdrop-blur-[3px] transition-opacity duration-200 ${detailOpen ? "opacity-100" : "opacity-0"}`} onClick={closeDetail}>
          <aside className={`absolute right-0 top-0 h-full w-full min-w-0 overflow-y-auto border-l border-[#e6e9f1] bg-white px-5 py-5 shadow-[-24px_0_48px_rgba(12,18,32,0.2)] transition-transform duration-300 ease-out sm:w-[460px] ${detailOpen ? "translate-x-0" : "translate-x-full"}`} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-semibold">Chi tiết giao dịch</h2>
              <IconButton label="Đóng" icon="close" onClick={closeDetail} />
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${statusColors[selected.status]}`}>{selected.status}</span>
              <span className="font-mono text-[12px] text-[#697086]">{selected.id}</span>
            </div>
            <div className="mt-5 rounded-2xl bg-[#fff8f1] p-5 text-center">
              <p className="text-[12px] text-[#697086]">Số tiền giao dịch</p>
              <b className="mt-1 block text-[28px] text-[#ff8d28]">{money(selected.amount)}</b>
              <div className="mt-3 flex justify-center gap-8 text-[12px]">
                <div><p className="text-[#697086]">Phí nền tảng</p><b>- {money(selected.fee)}</b></div>
                <div><p className="text-[#697086]">Thực nhận</p><b className="text-emerald-600">{money(Math.abs(selected.net))}</b></div>
              </div>
            </div>
            <div className="mt-5 space-y-3 border-t border-[#edf0f5] pt-5 text-[12px]">
              <InfoRow label="Mã giao dịch" value={selected.id} />
              <InfoRow label="Booking" value={`#${selected.bookingId}`} />
              <InfoRow label="Khách hàng" value={`${selected.customer} (${selected.customerId})`} />
              <InfoRow label="Photographer" value={selected.photographer} />
              <InfoRow label="Dịch vụ" value={selected.service} />
              <InfoRow label="Loại GD" value={selected.type} />
              <InfoRow label="Phương thức" value={selected.method} />
              <InfoRow label="Cổng thanh toán" value={selected.gateway} />
              <InfoRow label="Mã GD cổng" value={selected.gatewayTxnId} />
              <InfoRow label="Thời gian" value={selected.createdAt} />
              {selected.note ? <InfoRow label="Ghi chú" value={selected.note} /> : null}
            </div>
            <div className="mt-6 flex justify-end gap-2 border-t border-[#edf0f5] pt-5">
              <IconButton label="Copy mã GD" icon="copy" onClick={() => notify("Đã copy mã giao dịch.")} />
              <IconButton label="Xuất hóa đơn" icon="download" onClick={() => notify("Đã xuất hóa đơn.")} />
            </div>
          </aside>
        </div>
      ) : null}
    </AdminLayout>
  );
}

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-[#e7e9f1] bg-white p-4 shadow-[0_14px_34px_rgba(12,18,32,0.04)] ${className}`}>{children}</section>;
}

function StatCard({ title, value, note, tone }: { title: string; value: string; note: string; tone: "orange" | "green" | "blue" | "red" }) {
  const cls = tone === "orange" ? "bg-[#fff3e8] text-[#ff8d28]" : tone === "green" ? "bg-emerald-50 text-emerald-600" : tone === "blue" ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-500";
  return <Panel><div className="flex items-center gap-4"><div className={`grid h-12 w-12 place-items-center rounded-2xl ${cls}`}><AdminIcon name="credit" className="h-5 w-5" /></div><div><p className="text-[12px] text-[#697086]">{title}</p><b className="mt-1 block text-[20px] font-semibold">{value}</b><p className="mt-1 text-[11px] text-[#697086]">{note}</p></div></div></Panel>;
}

function Select({ value, options, onChange, prefix = "" }: { value: string; options: string[]; onChange: (v: string) => void; prefix?: string }) {
  return <select value={value} onChange={(e) => onChange(e.target.value)} className="!h-10 !min-h-0 !w-full rounded-xl !border !border-[#ffd2ad] bg-white !px-3 !py-0 !text-[12px] !font-normal text-[#ff8d28] !shadow-none outline-none focus:!border-[#ff8d28]">{options.map((o) => <option key={o} value={o}>{prefix ? `${prefix} ${o}` : o}</option>)}</select>;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-3"><span className="text-[#697086]">{label}</span><b className="font-medium break-all">{value}</b></div>;
}

function Toast({ text }: { text: string }) {
  return <div className="fixed right-6 top-20 z-50 rounded-xl border bg-white px-4 py-3 font-medium text-emerald-700 shadow-xl">{text}</div>;
}

function money(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value) + "đ";
}
