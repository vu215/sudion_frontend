"use client";

import { useMemo, useState } from "react";
import AdminLayout from "../_components/admin-layout";
import { AdminIcon, IconButton } from "../_components/admin-icons";

type RefundStatus = "Chờ duyệt" | "Đang xử lý" | "Đã hoàn tiền" | "Từ chối";
type RefundMethod = "MoMo" | "VNPAY" | "Chuyển khoản" | "ZaloPay";

type Refund = {
  id: string;
  customer: string;
  customerAvatar: string;
  customerId: string;
  phone: string;
  email: string;
  bookingId: string;
  photographer: string;
  service: string;
  originalAmount: number;
  refundAmount: number;
  method: RefundMethod;
  reason: string;
  description: string;
  status: RefundStatus;
  createdAt: string;
  updatedAt: string;
  adminNote: string;
  bankInfo: string;
  history: string[];
};

const avatars = ["/Overlay+Shadow.png", "/logo_sudion.jpg", "/screen%201.png", "/Overlay+Border+Shadow.png"];

const seed: Refund[] = [
  { id: "RF_001", customer: "Nguyễn Thị Mai", customerAvatar: avatars[0], customerId: "USR_2291", phone: "0901234567", email: "mainguyen@gmail.com", bookingId: "BK20241201", photographer: "Minh Tuấn Studio", service: "Chụp ảnh cưới", originalAmount: 12500000, refundAmount: 8500000, method: "MoMo", reason: "Photographer hủy lịch", description: "Photographer hủy buổi chụp trước 3 ngày, khách yêu cầu hoàn 100% đặt cọc và 70% còn lại.", status: "Chờ duyệt", createdAt: "30/11/2024 10:15", updatedAt: "30/11/2024 10:15", adminNote: "", bankInfo: "MoMo: 0901234567", history: ["30/11/2024 10:15 · Yêu cầu hoàn tiền được tạo"] },
  { id: "RF_002", customer: "Trần Văn Phong", customerAvatar: avatars[1], customerId: "USR_3345", phone: "0932111222", email: "phongtran@gmail.com", bookingId: "BK20241128", photographer: "Elena Studio", service: "Chụp ảnh đôi", originalAmount: 3200000, refundAmount: 3200000, method: "VNPAY", reason: "Giao ảnh không đúng thỏa thuận", description: "Ảnh giao chỉ đạt 50% số lượng cam kết, chất lượng thấp. Yêu cầu hoàn toàn bộ.", status: "Đang xử lý", createdAt: "28/11/2024 15:30", updatedAt: "29/11/2024 09:00", adminNote: "Đang xác minh với photographer.", bankInfo: "VNPAY - STK: 123456789 - MB Bank", history: ["28/11/2024 15:30 · Yêu cầu tạo", "29/11/2024 09:00 · Admin đang xử lý"] },
  { id: "RF_003", customer: "Lê Nhật Minh", customerAvatar: avatars[2], customerId: "USR_4456", phone: "0967890123", email: "minhle@gmail.com", bookingId: "BK20241125", photographer: "Khang Pham", service: "Travel", originalAmount: 4600000, refundAmount: 2000000, method: "Chuyển khoản", reason: "Khách hủy trước 7 ngày", description: "Khách hủy trước hạn chính sách, được hoàn 50% theo điều khoản dịch vụ.", status: "Đã hoàn tiền", createdAt: "25/11/2024 14:00", updatedAt: "26/11/2024 17:22", adminNote: "Đã xử lý theo chính sách hủy.", bankInfo: "STK: 987654321 - Vietcombank", history: ["25/11/2024 14:00 · Yêu cầu tạo", "25/11/2024 16:00 · Admin duyệt", "26/11/2024 17:22 · Đã chuyển khoản thành công"] },
  { id: "RF_004", customer: "Phạm Hồng Ngọc", customerAvatar: avatars[3], customerId: "USR_5567", phone: "0899888999", email: "ngocpham@gmail.com", bookingId: "BK20241120", photographer: "May Studio", service: "Kỷ yếu", originalAmount: 4800000, refundAmount: 4750000, method: "ZaloPay", reason: "Lỗi hệ thống thanh toán trùng", description: "Khách bị trừ tiền 2 lần do lỗi kỹ thuật. Yêu cầu hoàn lại khoản trùng 4.750.000đ.", status: "Chờ duyệt", createdAt: "20/11/2024 11:20", updatedAt: "20/11/2024 11:20", adminNote: "", bankInfo: "ZaloPay: 0899888999", history: ["20/11/2024 11:20 · Yêu cầu tạo"] },
  { id: "RF_005", customer: "Đặng Quốc Bảo", customerAvatar: avatars[0], customerId: "USR_6678", phone: "0976543210", email: "baodang@gmail.com", bookingId: "BK20241118", photographer: "Sun Studio", service: "Sự kiện", originalAmount: 8000000, refundAmount: 6300000, method: "Chuyển khoản", reason: "Khách hủy trước 5 ngày", description: "Khách hủy trước 5 ngày, được hoàn 80% theo chính sách dịch vụ.", status: "Đã hoàn tiền", createdAt: "18/11/2024 09:00", updatedAt: "19/11/2024 17:00", adminNote: "Đã duyệt và chuyển khoản.", bankInfo: "STK: 111222333 - ACB", history: ["18/11/2024 09:00 · Yêu cầu tạo", "18/11/2024 14:00 · Admin duyệt", "19/11/2024 17:00 · Đã hoàn tiền"] },
  { id: "RF_006", customer: "Vũ Minh Anh", customerAvatar: avatars[1], customerId: "USR_7789", phone: "0988765432", email: "minhanh@gmail.com", bookingId: "BK20241115", photographer: "David Lee", service: "Chụp đơn", originalAmount: 2500000, refundAmount: 1250000, method: "MoMo", reason: "Khách hủy trước 2 ngày", description: "Khách hủy trước 2 ngày, hoàn 50% theo chính sách hủy trễ.", status: "Từ chối", createdAt: "15/11/2024 16:40", updatedAt: "16/11/2024 10:00", adminNote: "Từ chối vì khách yêu cầu hoàn 100% nhưng không đủ điều kiện theo chính sách.", bankInfo: "MoMo: 0988765432", history: ["15/11/2024 16:40 · Yêu cầu tạo", "16/11/2024 10:00 · Từ chối - không đủ điều kiện"] },
];

const statusColors: Record<RefundStatus, string> = {
  "Chờ duyệt": "bg-orange-50 text-orange-700",
  "Đang xử lý": "bg-blue-50 text-blue-700",
  "Đã hoàn tiền": "bg-emerald-50 text-emerald-700",
  "Từ chối": "bg-red-50 text-red-600",
};

export default function RefundsPage() {
  const [items, setItems] = useState(seed);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<RefundStatus | "Tất cả">("Tất cả");
  const [method, setMethod] = useState("Tất cả");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [toast, setToast] = useState("");

  const selected = items.find((item) => item.id === selectedId) ?? items[0];

  const filtered = useMemo(() => items.filter((item) => {
    const text = [item.id, item.customer, item.bookingId, item.photographer, item.reason, item.status].join(" ").toLowerCase();
    return text.includes(query.toLowerCase())
      && (status === "Tất cả" || item.status === status)
      && (method === "Tất cả" || item.method === method);
  }), [items, query, status, method]);

  const totalPending = items.filter((i) => i.status === "Chờ duyệt").reduce((s, i) => s + i.refundAmount, 0);
  const totalRefunded = items.filter((i) => i.status === "Đã hoàn tiền").reduce((s, i) => s + i.refundAmount, 0);

  function notify(text: string) { setToast(text); setTimeout(() => setToast(""), 1800); }

  function patch(id: string, value: Partial<Refund>) {
    setItems((list) => list.map((item) => item.id === id ? {
      ...item, ...value,
      history: value.status ? [...item.history, `15/06/2026 · ${value.status}`] : item.history,
      updatedAt: "15/06/2026",
    } : item));
  }

  function openDetail(id: string) {
    const r = items.find((item) => item.id === id);
    setSelectedId(id);
    setAdminNote(r?.adminNote ?? "");
    window.requestAnimationFrame(() => setDetailOpen(true));
  }

  function closeDetail() {
    setDetailOpen(false);
    window.setTimeout(() => setSelectedId(null), 220);
  }

  return (
    <AdminLayout active="Hoàn tiền" search={query} onSearch={setQuery}>
      {toast ? <Toast text={toast} /> : null}
      <div className="min-w-0">
        <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h1 className="text-[24px] font-semibold">Quản lý Hoàn tiền</h1>
            <p className="mt-1 text-[13px] text-[#697086]">Duyệt và xử lý các yêu cầu hoàn tiền từ khách hàng</p>
          </div>
          <div className="flex gap-2">
            <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#ffd2ad] bg-white px-4 text-[13px] text-[#ff8d28] hover:bg-[#fff8f1]">
              <AdminIcon name="download" /> Xuất Excel
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Tổng yêu cầu" value={String(items.length)} note="↑ 5.2% so với tháng trước" tone="orange" />
          <StatCard title="Chờ duyệt" value={String(items.filter((i) => i.status === "Chờ duyệt").length)} note={`${money(totalPending)} đang chờ`} tone="amber" />
          <StatCard title="Đã hoàn tiền" value={String(items.filter((i) => i.status === "Đã hoàn tiền").length)} note={money(totalRefunded)} tone="green" />
          <StatCard title="Từ chối" value={String(items.filter((i) => i.status === "Từ chối").length)} note="Không đủ điều kiện" tone="red" />
        </div>

        <Panel className="mt-4">
          <div className="mb-3 flex gap-6 overflow-x-auto border-b border-[#edf0f5]">
            {(["Tất cả", "Chờ duyệt", "Đang xử lý", "Đã hoàn tiền", "Từ chối"] as const).map((tab) => (
              <button key={tab} onClick={() => setStatus(tab)} className={`shrink-0 border-b-2 px-2 py-3 text-[12px] font-medium ${status === tab ? "border-[#ff8d28] text-[#ff8d28]" : "border-transparent text-[#536078]"}`}>
                {tab} ({tab === "Tất cả" ? items.length : items.filter((i) => i.status === tab).length})
              </button>
            ))}
          </div>
          <div className="mb-3 grid items-center gap-2 xl:grid-cols-[minmax(280px,1.25fr)_160px_160px_40px]">
            <label className="relative !block min-w-0">
              <AdminIcon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8a93a5]" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} className="!h-10 !min-h-0 w-full rounded-xl border border-[#dfe3ec] bg-white !py-0 !pl-10 !pr-3 !text-[12px] !font-normal outline-none focus:border-[#ff8d28]" placeholder="Tìm khách hàng, booking ID, lý do..." />
            </label>
            <Select value={status} options={["Tất cả", "Chờ duyệt", "Đang xử lý", "Đã hoàn tiền", "Từ chối"]} onChange={(v) => setStatus(v as RefundStatus | "Tất cả")} prefix="Trạng thái:" />
            <Select value={method} options={["Tất cả", "MoMo", "VNPAY", "Chuyển khoản", "ZaloPay"]} onChange={setMethod} prefix="Phương thức:" />
            <IconButton label="Đặt lại" icon="filter" size="md" onClick={() => { setQuery(""); setStatus("Tất cả"); setMethod("Tất cả"); }} />
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#e6e9f1]">
            <table className="w-full min-w-[1040px] text-left text-[12px]">
              <thead className="bg-[#fbfcfe] text-[#536078]">
                <tr>{["", "Khách hàng", "Booking", "Lý do hoàn", "Số tiền gốc", "Hoàn tiền", "Phương thức", "Trạng thái", "Ngày tạo", ""].map((h, i) => <th key={i} className="px-3 py-3 font-semibold">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-[#edf0f5]">
                {filtered.map((item) => (
                  <tr key={item.id} onClick={() => openDetail(item.id)} className={`cursor-pointer hover:bg-[#fff8f1] ${selectedId === item.id ? "bg-[#fff3e8]" : "bg-white"}`}>
                    <td className="px-3 py-3"><input type="checkbox" onClick={(e) => e.stopPropagation()} className="h-4 w-4 rounded border-[#d6dbe7] accent-[#ff8d28]" /></td>
                    <td className="px-3 py-3"><div className="flex items-center gap-3"><img src={item.customerAvatar} alt="" className="h-9 w-9 rounded-full object-cover" /><div><b className="font-semibold">{item.customer}</b><p className="text-[#697086]">{item.phone}</p></div></div></td>
                    <td className="px-3 py-3"><b className="font-medium text-[#ff8d28]">#{item.bookingId}</b><p className="text-[#697086]">{item.photographer}</p></td>
                    <td className="px-3 py-3"><p className="max-w-[180px] truncate">{item.reason}</p></td>
                    <td className="px-3 py-3 text-[#697086]">{money(item.originalAmount)}</td>
                    <td className="px-3 py-3 font-semibold text-[#ff8d28]">{money(item.refundAmount)}</td>
                    <td className="px-3 py-3">{item.method}</td>
                    <td className="px-3 py-3"><span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${statusColors[item.status]}`}>{item.status}</span></td>
                    <td className="px-3 py-3 text-[#697086]">{item.createdAt}</td>
                    <td className="px-3 py-3"><div className="flex gap-2">
                      <IconButton label="Xem" icon="eye" onClick={(e) => { e.stopPropagation(); openDetail(item.id); }} />
                      {item.status === "Chờ duyệt" && <IconButton label="Duyệt" icon="check" onClick={(e) => { e.stopPropagation(); patch(item.id, { status: "Đang xử lý" }); notify("Đã duyệt yêu cầu."); }} />}
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center justify-between text-[12px] text-[#697086]">
            <span>Hiển thị 1 - {filtered.length} của {items.length} yêu cầu</span>
            <span className="rounded-xl border border-[#dfe3ec] px-3 py-2">10 / trang</span>
          </div>
        </Panel>
      </div>

      {selectedId !== null ? (
        <div className={`fixed inset-0 z-50 bg-[#0f172a]/45 backdrop-blur-[3px] transition-opacity duration-200 ${detailOpen ? "opacity-100" : "opacity-0"}`} onClick={closeDetail}>
          <aside className={`absolute right-0 top-0 h-full w-full min-w-0 overflow-y-auto border-l border-[#e6e9f1] bg-white px-5 py-5 shadow-[-24px_0_48px_rgba(12,18,32,0.2)] transition-transform duration-300 ease-out sm:w-[460px] ${detailOpen ? "translate-x-0" : "translate-x-full"}`} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-semibold">Chi tiết hoàn tiền</h2>
              <IconButton label="Đóng" icon="close" onClick={closeDetail} />
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${statusColors[selected.status]}`}>{selected.status}</span>
              <span className="text-[12px] text-[#697086]">{selected.id}</span>
            </div>
            <div className="mt-5 flex items-center gap-3 border-b border-[#edf0f5] pb-5">
              <img src={selected.customerAvatar} alt="" className="h-12 w-12 rounded-full object-cover" />
              <div>
                <b className="text-[14px]">{selected.customer}</b>
                <p className="text-[12px] text-[#697086]">{selected.phone} · {selected.email}</p>
                <p className="mt-1 text-[12px] text-[#697086]">{selected.customerId}</p>
              </div>
            </div>
            <div className="mt-5 space-y-3 border-b border-[#edf0f5] pb-5 text-[12px]">
              <InfoRow label="Booking" value={`#${selected.bookingId}`} />
              <InfoRow label="Photographer" value={selected.photographer} />
              <InfoRow label="Dịch vụ" value={selected.service} />
              <InfoRow label="Lý do" value={selected.reason} />
              <InfoRow label="Phương thức" value={selected.method} />
              <InfoRow label="Thông tin nhận" value={selected.bankInfo} />
            </div>
            <div className="mt-5 rounded-2xl bg-[#fff8f1] p-4 text-[12px]">
              <div className="flex items-center justify-between"><span className="text-[#697086]">Tổng tiền booking</span><b>{money(selected.originalAmount)}</b></div>
              <div className="mt-2 flex items-center justify-between text-red-500"><span>Số tiền hoàn</span><b className="text-[16px]">- {money(selected.refundAmount)}</b></div>
            </div>
            <div className="mt-5 border-t border-[#edf0f5] pt-5">
              <h3 className="text-[13px] font-semibold">Mô tả</h3>
              <p className="mt-2 text-[12px] leading-6 text-[#536078]">{selected.description}</p>
            </div>
            <div className="mt-5 border-t border-[#edf0f5] pt-5">
              <h3 className="text-[13px] font-semibold">Lịch sử xử lý</h3>
              <div className="mt-3 space-y-2 text-[12px] text-[#536078]">{selected.history.map((h) => <p key={h}>○ {h}</p>)}</div>
            </div>
            <div className="mt-5 border-t border-[#edf0f5] pt-5">
              <h3 className="text-[13px] font-semibold">Ghi chú Admin</h3>
              <textarea value={adminNote} onChange={(e) => setAdminNote(e.target.value)} className="mt-2 w-full min-h-[72px] rounded-xl border border-[#dfe3ec] p-3 text-[12px] outline-none focus:border-[#ff8d28]" placeholder="Nhập ghi chú xử lý..." />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button onClick={() => { patch(selected.id, { status: "Đang xử lý", adminNote }); notify("Đã duyệt, đang xử lý."); }} className="h-10 rounded-xl border border-blue-200 bg-blue-50 text-[12px] font-medium text-blue-700 hover:bg-blue-100">Duyệt</button>
              <button onClick={() => { patch(selected.id, { status: "Đã hoàn tiền", adminNote }); notify("Đã xác nhận hoàn tiền."); }} className="h-10 rounded-xl bg-[#ff8d28] text-[12px] font-medium text-white hover:bg-[#f47f16]">Đã hoàn tiền</button>
              <button onClick={() => { patch(selected.id, { status: "Từ chối", adminNote }); notify("Đã từ chối yêu cầu."); }} className="h-10 rounded-xl border border-red-200 bg-red-50 text-[12px] font-medium text-red-600 hover:bg-red-100">Từ chối</button>
              <button onClick={() => { patch(selected.id, { adminNote }); notify("Đã lưu ghi chú."); }} className="h-10 rounded-xl border border-[#dfe3ec] bg-white text-[12px] font-medium text-[#536078] hover:bg-[#f7f8fb]">Lưu ghi chú</button>
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

function StatCard({ title, value, note, tone }: { title: string; value: string; note: string; tone: "orange" | "amber" | "green" | "red" }) {
  const cls = tone === "orange" ? "bg-[#fff3e8] text-[#ff8d28]" : tone === "amber" ? "bg-amber-50 text-amber-500" : tone === "green" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500";
  return <Panel><div className="flex items-center gap-4"><div className={`grid h-12 w-12 place-items-center rounded-2xl ${cls}`}><AdminIcon name="credit" className="h-5 w-5" /></div><div><p className="text-[12px] text-[#697086]">{title}</p><b className="mt-1 block text-[20px] font-semibold">{value}</b><p className="mt-1 text-[11px] text-[#697086]">{note}</p></div></div></Panel>;
}

function Select({ value, options, onChange, prefix = "" }: { value: string; options: string[]; onChange: (v: string) => void; prefix?: string }) {
  return <select value={value} onChange={(e) => onChange(e.target.value)} className="!h-10 !min-h-0 !w-full rounded-xl !border !border-[#ffd2ad] bg-white !px-3 !py-0 !text-[12px] !font-normal text-[#ff8d28] !shadow-none outline-none focus:!border-[#ff8d28]">{options.map((o) => <option key={o} value={o}>{prefix ? `${prefix} ${o}` : o}</option>)}</select>;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-3"><span className="text-[#697086]">{label}</span><b className="font-medium">{value}</b></div>;
}

function Toast({ text }: { text: string }) {
  return <div className="fixed right-6 top-20 z-50 rounded-xl border bg-white px-4 py-3 font-medium text-emerald-700 shadow-xl">{text}</div>;
}

function money(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value) + "đ";
}
