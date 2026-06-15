"use client";

import { useMemo, useState } from "react";
import AdminLayout from "../_components/admin-layout";
import { AdminIcon, IconButton } from "../_components/admin-icons";

type BookingStatus = "Chờ xác nhận" | "Đã xác nhận" | "Đang thực hiện" | "Hoàn thành" | "Đã hủy";
type PaymentStatus = "Chưa thanh toán" | "Đã thanh toán cọc" | "Đã thanh toán đủ" | "Đã hoàn tiền";
type Booking = { id: string; customer: string; phone: string; email: string; customerAvatar: string; photographer: string; photographerAvatar: string; service: string; shootDate: string; createdAt: string; amount: number; status: BookingStatus; payment: PaymentStatus; place: string; time: string; packageName: string; note: string; history: string[] };

const seed: Booking[] = [
  { id: "#BK20241125", customer: "Nguyễn Thị Mai", phone: "0901 234 567", email: "mainguyen@gmail.com", customerAvatar: "/logo_sudion.jpg", photographer: "Minh Tuấn Studio", photographerAvatar: "/Overlay+Shadow.png", service: "Chụp ảnh cưới", shootDate: "15/12/2024", createdAt: "25/11/2024 10:30", amount: 12500000, status: "Chờ xác nhận", payment: "Đã thanh toán cọc", place: "TP. Hồ Chí Minh", time: "08:00 - 12:00 (4 giờ)", packageName: "Gói Premium", note: "Khách muốn chụp ở Landmark 81, Nhà thờ Đức Bà.", history: ["25/11/2024 10:30 · Tạo booking", "25/11/2024 10:31 · Thanh toán cọc thành công", "25/11/2024 10:32 · Chờ xác nhận"] },
  { id: "#BK20241124", customer: "Trần Văn Phong", phone: "0932 111 222", email: "phongtran@gmail.com", customerAvatar: "/screen%201.png", photographer: "Elena Studio", photographerAvatar: "/logo_sudion.jpg", service: "Chụp ảnh đôi", shootDate: "10/12/2024", createdAt: "24/11/2024 16:20", amount: 3200000, status: "Đã xác nhận", payment: "Đã thanh toán đủ", place: "Hà Nội", time: "14:00 - 17:00", packageName: "Gói Standard", note: "Chụp trong studio.", history: ["24/11/2024 · Tạo booking", "24/11/2024 · Đã xác nhận"] },
  { id: "#BK20241123", customer: "Phạm Hồng Ngọc", phone: "0899 888 999", email: "ngocpham@gmail.com", customerAvatar: "/Overlay+Border+Shadow.png", photographer: "Khang Pham", photographerAvatar: "/screen%201.png", service: "Kỷ yếu", shootDate: "05/12/2024", createdAt: "23/11/2024 14:15", amount: 4800000, status: "Đang thực hiện", payment: "Đã thanh toán cọc", place: "Đà Lạt", time: "07:00 - 11:00", packageName: "Gói lớp", note: "Chụp nhóm lớp.", history: ["23/11/2024 · Tạo booking", "24/11/2024 · Đang thực hiện"] },
  { id: "#BK20241122", customer: "Lê Quang Huy", phone: "0777 666 555", email: "huy.le@gmail.com", customerAvatar: "/logo_sudion_remove.png", photographer: "May Studio", photographerAvatar: "/Overlay+Border+Shadow.png", service: "Sự kiện", shootDate: "20/12/2024", createdAt: "22/11/2024 11:05", amount: 8000000, status: "Hoàn thành", payment: "Đã thanh toán đủ", place: "Đà Nẵng", time: "18:00 - 22:00", packageName: "Event Pro", note: "Sự kiện khai trương.", history: ["22/11/2024 · Tạo booking", "20/12/2024 · Hoàn thành"] },
  { id: "#BK20241121", customer: "Vũ Minh Anh", phone: "0988 765 432", email: "minhanh@gmail.com", customerAvatar: "/Overlay+Shadow.png", photographer: "David Lee", photographerAvatar: "/logo_sudion_remove.png", service: "Chụp sản phẩm", shootDate: "28/11/2024", createdAt: "21/11/2024 09:45", amount: 2500000, status: "Đã hủy", payment: "Đã hoàn tiền", place: "Nha Trang", time: "09:00 - 11:00", packageName: "Product", note: "Khách đổi lịch.", history: ["21/11/2024 · Tạo booking", "21/11/2024 · Đã hủy"] },
];

export default function BookingPage() {
  const [items, setItems] = useState(seed);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<BookingStatus | "Tất cả">("Tất cả");
  const [service, setService] = useState("Tất cả");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const services = useMemo(() => ["Tất cả", ...Array.from(new Set(items.map((i) => i.service)))], [items]);
  const tabs: Array<BookingStatus | "Tất cả"> = ["Tất cả", "Chờ xác nhận", "Đã xác nhận", "Đang thực hiện", "Hoàn thành", "Đã hủy"];
  const filtered = useMemo(() => items.filter((i) => [i.id, i.customer, i.phone, i.email, i.photographer, i.service, i.status].join(" ").toLowerCase().includes(query.toLowerCase()) && (status === "Tất cả" || i.status === status) && (service === "Tất cả" || i.service === service)), [items, query, service, status]);
  const selected = items.find((i) => i.id === selectedId) ?? filtered[0] ?? items[0];

  function notify(text: string) { setToast(text); setTimeout(() => setToast(""), 1800); }
  function patch(id: string, value: Partial<Booking>) { setItems((list) => list.map((item) => item.id === id ? { ...item, ...value } : item)); }
  function createBooking() { const next = { ...seed[0], id: `#BK${Date.now().toString().slice(-8)}`, customer: "Khách hàng mới", status: "Chờ xác nhận" as BookingStatus }; setItems([next, ...items]); setSelectedId(next.id); notify("Đã tạo booking mẫu."); }

  return (
    <AdminLayout active="Booking" search={query} onSearch={setQuery}>
      {toast ? <Toast text={toast} /> : null}
      <div className="min-w-0">
        <div className="min-w-0">
          <PageHead title="Quản lý Booking" action="Tạo booking" onAction={createBooking} />
          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
            <Stat title="Tổng booking" value="3.782" /><Stat title="Chờ xác nhận" value="892" /><Stat title="Đã xác nhận" value="1.652" /><Stat title="Đang thực hiện" value="726" /><Stat title="Hoàn thành" value="412" /><Stat title="Đã hủy" value="100" />
          </div>
          <Panel className="mt-4">
            <div className="mb-3 grid gap-2 md:grid-cols-[minmax(0,1fr)_150px_150px_150px_40px]">
              <label className="relative !block">
                <AdminIcon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8a93a5]" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} className="!h-10 !min-h-0 w-full rounded-xl border border-[#dfe3ec] !py-0 !pl-10 !pr-3 !text-[12px] !font-normal outline-none focus:border-[#ff8d28]" placeholder="Tìm theo mã booking, tên, SĐT, email..." />
              </label>
              <Select value={status} options={tabs} onChange={(v) => setStatus(v as BookingStatus | "Tất cả")} />
              <Select value={service} options={services} onChange={setService} />
              <button className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#ffd2ad] bg-white px-3 !text-[12px] !font-normal text-[#ff8d28]"><AdminIcon name="calendar" className="h-3.5 w-3.5 shrink-0" /> Khoảng ngày</button>
              <IconButton label="Đặt lại bộ lọc" icon="filter" size="md" onClick={() => { setQuery(""); setStatus("Tất cả"); setService("Tất cả"); }} />
            </div>
            <div className="mb-3 flex gap-4 overflow-x-auto border-b border-[#edf0f5]">
              {tabs.map((tab) => <button key={tab} onClick={() => setStatus(tab)} className={`shrink-0 border-b-2 px-3 py-2 text-[12px] font-medium ${status === tab ? "border-[#ff8d28] text-[#ff8d28]" : "border-transparent text-[#536078]"}`}>{tab} <span className="rounded-full bg-[#eef1f7] px-2 py-0.5 text-[10px]">{tab === "Tất cả" ? "3.782" : items.filter((i) => i.status === tab).length}</span></button>)}
            </div>
            <div className="overflow-x-auto rounded-xl border border-[#e6e9f1]">
              <table className="w-full min-w-[1040px] text-left text-[12px]">
                <thead className="bg-[#fbfcfe] text-[#536078]"><tr>{["Booking ID", "Khách hàng", "Photographer", "Dịch vụ", "Ngày chụp", "Tổng tiền", "Trạng thái", "Thanh toán", "Thao tác"].map((h) => <th key={h} className="px-3 py-3 font-semibold">{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-[#edf0f5]">{filtered.map((item) => <tr key={item.id} onClick={() => setSelectedId(item.id)} className={`cursor-pointer hover:bg-[#fff8f1] ${selectedId === item.id ? "bg-[#fff3e8]" : "bg-white"}`}><td className="px-3 py-3 font-medium text-[#ff8d28]">{item.id}<p className="text-[#697086]">{item.createdAt}</p></td><td className="px-3 py-3"><b>{item.customer}</b><p className="text-[#697086]">{item.phone}</p></td><td className="px-3 py-3"><div className="flex items-center gap-2"><img src={item.photographerAvatar} alt="" className="h-8 w-8 rounded-full object-cover" />{item.photographer}</div></td><td className="px-3 py-3">{item.service}</td><td className="px-3 py-3">{item.shootDate}</td><td className="px-3 py-3 font-semibold">{money(item.amount)}</td><td className="px-3 py-3"><Badge text={item.status} /></td><td className="px-3 py-3"><Badge text={item.payment} /></td><td className="px-3 py-3"><div className="flex gap-2"><IconButton label="Xem chi tiết" icon="eye" onClick={(e) => { e.stopPropagation(); setSelectedId(item.id); }} /><IconButton label="Xác nhận" icon="check" onClick={(e) => { e.stopPropagation(); patch(item.id, { status: "Đã xác nhận" }); setSelectedId(item.id); notify("Đã xác nhận booking."); }} /></div></td></tr>)}</tbody>
              </table>
            </div>
            <div className="mt-4 flex items-center justify-between text-[12px] text-[#697086]"><span>Hiển thị 1 - {filtered.length} của 3.782 booking</span><span className="rounded-xl border px-3 py-2">10 / trang</span></div>
          </Panel>
        </div>
        {selectedId !== null ? <div className="fixed inset-0 z-50 bg-[#0f172a]/35 backdrop-blur-[2px]" onClick={() => setSelectedId(null)}>
        <aside className="absolute right-0 top-0 h-full w-full min-w-0 overflow-y-auto border-l border-[#e6e9f1] bg-white p-5 shadow-[-18px_0_38px_rgba(12,18,32,0.16)] sm:w-[430px]" onClick={(event) => event.stopPropagation()}>
          <div className="flex items-center justify-between"><h2 className="text-[16px] font-semibold">Chi tiết booking</h2><IconButton label="Đóng" icon="close" onClick={() => setSelectedId(null)} /></div>
          <div className="mt-5 border-b border-[#edf0f5] pb-5"><div className="flex items-center gap-2"><b className="text-[16px]">{selected.id}</b><Badge text={selected.status} /></div><p className="mt-2 text-[12px] text-[#697086]">Ngày tạo: {selected.createdAt}</p></div>
          <SectionTitle>Thông tin khách hàng</SectionTitle><div className="mt-3 flex items-center gap-3"><img src={selected.customerAvatar} alt="" className="h-12 w-12 rounded-full object-cover" /><div><b>{selected.customer}</b><p className="text-[#697086]">{selected.phone}</p><p className="text-[#697086]">{selected.email}</p></div><div className="ml-auto"><IconButton label="Xem profile" icon="user" /></div></div>
          <InfoBlock title="Thông tin booking" rows={[["Photographer", selected.photographer], ["Dịch vụ", selected.service], ["Ngày chụp", selected.shootDate], ["Địa điểm", selected.place], ["Thời gian", selected.time], ["Gói dịch vụ", selected.packageName], ["Ghi chú", selected.note]]} />
          <InfoBlock title="Thanh toán" rows={[["Tổng tiền", money(selected.amount)], ["Đã thanh toán (cọc)", money(selected.amount * 0.3)], ["Còn lại", money(selected.amount * 0.7)], ["Phương thức", "MoMo"], ["Trạng thái thanh toán", selected.payment]]} />
          <SectionTitle>Lịch sử trạng thái</SectionTitle><div className="mt-3 space-y-2 text-[12px] text-[#536078]">{selected.history.map((h) => <p key={h}>○ {h}</p>)}</div>
          <div className="mt-6 flex justify-end gap-2"><IconButton label="Xác nhận" icon="check" onClick={() => { patch(selected.id, { status: "Đã xác nhận" }); notify("Đã xác nhận booking."); }} /><IconButton label="Từ chối" icon="close" tone="danger" onClick={() => { patch(selected.id, { status: "Đã hủy" }); notify("Đã từ chối booking."); }} /><IconButton label="Liên hệ" icon="mail" onClick={() => notify("Đã mở liên hệ khách.")} /></div>
        </aside>
        </div> : null}
      </div>
    </AdminLayout>
  );
}

function PageHead({ title,  action, onAction }: { title: string;  action: string; onAction: () => void }) { return <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
  <div>
    <h1 className="text-[24px] font-semibold">{title}</h1>
    </div>
    <div className="flex gap-2">
      <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#ffd2ad] bg-white px-4 text-[#ff8d28]">
        <AdminIcon name="download" /> Xuất Excel</button>
        <button onClick={onAction} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#ff8d28] px-4 text-white">
          <AdminIcon name="add" /> {action}</button>
          </div>
          </div>; }
function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) { return <section className={`rounded-2xl border border-[#e7e9f1] bg-white p-4 shadow-[0_14px_34px_rgba(12,18,32,0.04)] ${className}`}>{children}</section>; }
function Stat({ title, value }: { title: string; value: string }) { return <Panel><p className="text-[#697086]">{title}</p><b className="mt-1 block text-[22px]">{value}</b><p className="text-[11px] text-[#697086]">tổng số</p></Panel>; }
function Select({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) { return <select value={value} onChange={(e) => onChange(e.target.value)} className="!h-10 !min-h-0 !w-full rounded-xl !border !border-[#ffd2ad] bg-white !px-3 !py-0 !text-[12px] !font-normal text-[#ff8d28] !shadow-none outline-none focus:!border-[#ff8d28]">{options.map((o) => <option key={o}>{o}</option>)}</select>; }
function Badge({ text }: { text: string }) { const cls = text.includes("Đã") || text === "Hoàn thành" ? "bg-emerald-50 text-emerald-700" : text.includes("Chờ") || text.includes("Đang") ? "bg-orange-50 text-orange-700" : "bg-red-50 text-red-600"; return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${cls}`}>{text}</span>; }
function InfoBlock({ title, rows }: { title: string; rows: string[][] }) { return <div className="mt-5 border-t border-[#edf0f5] pt-5"><SectionTitle>{title}</SectionTitle><div className="mt-3 space-y-3 text-[12px]">{rows.map(([l, v]) => <div key={l} className="grid grid-cols-[118px_minmax(0,1fr)] gap-3"><span className="text-[#697086]">{l}</span><b className="font-medium">{v}</b></div>)}</div></div>; }
function SectionTitle({ children }: { children: React.ReactNode }) { return <h3 className="mt-5 text-[14px] font-semibold">{children}</h3>; }
function Toast({ text }: { text: string }) { return <div className="fixed right-6 top-20 z-50 rounded-xl border bg-white px-4 py-3 font-medium text-emerald-700 shadow-xl">{text}</div>; }
function money(value: number) { return new Intl.NumberFormat("vi-VN").format(value) + "đ"; }
