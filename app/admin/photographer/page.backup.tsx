"use client";

import { useMemo, useState } from "react";
import AdminLayout from "../_components/admin-layout";
import { AdminIcon, IconButton } from "../_components/admin-icons";

type Status = "Đã xác minh" | "Chờ duyệt" | "Bị từ chối" | "Bị khóa";
type Photographer = {
  id: number;
  studio: string;
  name: string;
  email: string;
  phone: string;
  region: string;
  avatar: string;
  services: string[];
  rating: number;
  reviews: number;
  bookings: number;
  status: Status;
  joined: string;
  birthday: string;
  gender: string;
  bio: string;
  documents: string[];
};

const avatars = ["/Overlay+Shadow.png", "/logo_sudion.jpg", "/screen%201.png", "/Overlay+Border+Shadow.png", "/logo_sudion_remove.png"];
const seed: Photographer[] = [
  { id: 1, studio: "Minh Tuấn Studio", name: "Nguyễn Minh Tuấn", email: "tuanminh@gmail.com", phone: "0901234567", region: "TP. Hồ Chí Minh", avatar: avatars[0], services: ["Chụp cưới", "Chụp đơn", "Pre-wedding", "Sự kiện"], rating: 4.9, reviews: 128, bookings: 156, status: "Đã xác minh", joined: "12/01/2024", birthday: "15/06/1992", gender: "Nam", bio: "Nhiếp ảnh gia với hơn 5 năm kinh nghiệm trong lĩnh vực chụp ảnh cưới và chân dung. Phong cách tự nhiên, cảm xúc.", documents: ["CCCD / CMND", "Giấy phép kinh doanh", "Tài khoản ngân hàng"] },
  { id: 2, studio: "Elena Studio", name: "Trần Thu Hà", email: "elena.studio@gmail.com", phone: "0934567890", region: "Hà Nội", avatar: avatars[1], services: ["Chụp cưới", "Chụp đơn", "Kỷ yếu"], rating: 4.8, reviews: 98, bookings: 132, status: "Đã xác minh", joined: "05/02/2024", birthday: "09/08/1994", gender: "Nữ", bio: "Studio chuyên chân dung, ảnh cưới và kỷ yếu với màu ảnh trong trẻo, nhẹ nhàng.", documents: ["CCCD / CMND", "Giấy phép kinh doanh"] },
  { id: 3, studio: "Khang Pham", name: "Phạm Quốc Khang", email: "khangpham@gmail.com", phone: "0967890123", region: "Đà Lạt", avatar: avatars[2], services: ["Travel", "Chụp đơn"], rating: 4.7, reviews: 74, bookings: 98, status: "Đã xác minh", joined: "18/02/2024", birthday: "21/11/1990", gender: "Nam", bio: "Tập trung ảnh du lịch, ảnh cá nhân ngoài trời và các concept tự nhiên.", documents: ["CCCD / CMND", "Tài khoản ngân hàng"] },
  { id: 4, studio: "May Studio", name: "Mai Anh", email: "may.studio@gmail.com", phone: "0987654321", region: "Đà Nẵng", avatar: avatars[3], services: ["Kỷ yếu", "Chụp đơn"], rating: 4.9, reviews: 112, bookings: 143, status: "Đã xác minh", joined: "22/02/2024", birthday: "02/04/1993", gender: "Nữ", bio: "Nhóm chụp trẻ, mạnh về kỷ yếu và ảnh cá nhân với quy trình xử lý nhanh.", documents: ["CCCD / CMND", "Giấy phép kinh doanh", "Tài khoản ngân hàng"] },
  { id: 5, studio: "David Lee", name: "David Lee", email: "davidlee@gmail.com", phone: "0912345678", region: "Nha Trang", avatar: avatars[4], services: ["Travel", "Chụp đơn"], rating: 4.6, reviews: 61, bookings: 77, status: "Chờ duyệt", joined: "25/02/2024", birthday: "18/07/1991", gender: "Nam", bio: "Photographer tự do chuyên ảnh du lịch, ảnh cá nhân ven biển và lifestyle.", documents: ["CCCD / CMND"] },
  { id: 6, studio: "Linh Nguyễn", name: "Linh Nguyễn", email: "linhnguyen@gmail.com", phone: "0908765432", region: "Hải Phòng", avatar: avatars[1], services: ["Chụp cưới", "Chụp đơn"], rating: 4.5, reviews: 43, bookings: 56, status: "Chờ duyệt", joined: "28/02/2024", birthday: "27/12/1995", gender: "Nữ", bio: "Ưu tiên ánh sáng tự nhiên, concept tối giản và ảnh gia đình.", documents: ["CCCD / CMND"] },
  { id: 7, studio: "Sun Studio", name: "Đặng Quốc Bảo", email: "sunstudio@gmail.com", phone: "0976543210", region: "TP. Hồ Chí Minh", avatar: avatars[0], services: ["Sự kiện", "Chụp đơn"], rating: 4.3, reviews: 29, bookings: 41, status: "Bị từ chối", joined: "01/03/2024", birthday: "11/03/1991", gender: "Nam", bio: "Studio sự kiện, hội nghị và ảnh doanh nghiệp.", documents: ["CCCD / CMND"] },
];

export default function PhotographerPage() {
  const [items, setItems] = useState(seed);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<Status | "Tất cả">("Tất cả");
  const [region, setRegion] = useState("Tất cả");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [tab, setTab] = useState("Thông tin");
  const [toast, setToast] = useState("");
  const regions = useMemo(() => ["Tất cả", ...Array.from(new Set(items.map((i) => i.region)))], [items]);
  const filtered = useMemo(() => items.filter((i) => {
    const text = [i.name, i.studio, i.email, i.phone, i.region, i.status, ...i.services].join(" ").toLowerCase();
    return text.includes(query.toLowerCase()) && (status === "Tất cả" || i.status === status) && (region === "Tất cả" || i.region === region);
  }), [items, query, region, status]);
  const selected = items.find((i) => i.id === selectedId) ?? filtered[0] ?? items[0];

  function notify(message: string) {
    setToast(message);
    setTimeout(() => setToast(""), 1800);
  }

  function patch(id: number, patchValue: Partial<Photographer>) {
    setItems((list) => list.map((item) => item.id === id ? { ...item, ...patchValue } : item));
  }

  function addPhotographer() {
    const id = Math.max(...items.map((i) => i.id)) + 1;
    const next = { ...seed[0], id, studio: `Studio mới ${id}`, name: "Photographer mới", status: "Chờ duyệt" as Status, joined: "15/06/2026" };
    setItems([next, ...items]);
    openDetail(id);
    notify("Đã thêm photographer mẫu.");
  }

  function openDetail(id: number) {
    setSelectedId(id);
    window.requestAnimationFrame(() => setDetailOpen(true));
  }

  function closeDetail() {
    setDetailOpen(false);
    window.setTimeout(() => setSelectedId(null), 220);
  }

  return (
    <AdminLayout active="Photographer" search={query} onSearch={setQuery}>
      {toast ? <Toast text={toast} /> : null}
      <div className="min-w-0">
        <div className="min-w-0">
          <PageHead title="Quản lý Photographer" action="Thêm Photographer" onAction={addPhotographer} />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Stat title="Tổng Photographer" value="1.248" note="↑ 8.5% so với tháng trước" tone="orange" />
            <Stat title="Chờ duyệt" value="24" note="12 hồ sơ mới hôm nay" tone="orange" />
            <Stat title="Đã xác minh" value="856" note="68.6% tổng số" tone="green" />
            <Stat title="Bị từ chối" value="36" note="2.9% tổng số" tone="red" />
          </div>
          <Panel className="mt-4">
            <div className="mb-3 grid gap-2 md:grid-cols-[minmax(0,1fr)_150px_150px_40px]">
              <label className="relative !block">
                <AdminIcon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8a93a5]" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} className="!h-10 !min-h-0 w-full rounded-xl border border-[#dfe3ec] bg-white !py-0 !pl-10 !pr-3 !text-[12px] !font-normal outline-none focus:border-[#ff8d28] focus:ring-2 focus:ring-[#ff8d28]/10" placeholder="Tìm kiếm theo tên, email, SĐT..." />
              </label>
              <Select value={status} options={["Tất cả", "Đã xác minh", "Chờ duyệt", "Bị từ chối", "Bị khóa"]} onChange={(v) => setStatus(v as Status | "Tất cả")} />
              <Select value={region} options={regions} onChange={setRegion} />
              <IconButton label="Đặt lại bộ lọc" icon="filter" size="md" onClick={() => { setQuery(""); setStatus("Tất cả"); setRegion("Tất cả"); }} />
            </div>
            <div className="overflow-x-auto rounded-xl border border-[#e6e9f1]">
              <table className="w-full min-w-[980px] text-left text-[12px]">
                <thead className="bg-[#fbfcfe] text-[#536078]"><tr>{["Photographer", "Liên hệ", "Khu vực", "Dịch vụ chính", "Rating", "Booking", "Trạng thái", "Thao tác"].map((h) => <th key={h} className="px-3 py-3 font-semibold">{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-[#edf0f5]">
                  {filtered.map((item) => (
                    <tr key={item.id} onClick={() => openDetail(item.id)} className={`cursor-pointer hover:bg-[#fff8f1] ${selectedId === item.id ? "bg-[#fff3e8]" : "bg-white"}`}>
                      <td className="px-3 py-3"><div className="flex items-center gap-3"><img src={item.avatar} alt="" className="h-10 w-10 rounded-full object-cover" /><div><b className="font-semibold">{item.studio}</b><p className="text-[#697086]">Tham gia: {item.joined}</p></div></div></td>
                      <td className="px-3 py-3">{item.phone}<p className="text-[#697086]">{item.email}</p></td>
                      <td className="px-3 py-3">{item.region}</td>
                      <td className="px-3 py-3">{item.services.slice(0, 2).map((s) => <span key={s} className="mr-1 rounded-lg bg-[#f0f2f8] px-2 py-1">{s}</span>)}{item.services.length > 2 ? <span className="rounded-lg bg-[#f0f2f8] px-2 py-1">+{item.services.length - 2}</span> : null}</td>
                      <td className="px-3 py-3 text-[#f59e0b]">★ <b className="text-[#111827]">{item.rating}</b><p className="text-[#697086]">({item.reviews})</p></td>
                      <td className="px-3 py-3 font-semibold">{item.bookings}</td>
                      <td className="px-3 py-3"><Badge text={item.status} /></td>
                      <td className="px-3 py-3"><div className="flex gap-2"><IconButton label="Xem chi tiết" icon="eye" onClick={(e) => { e.stopPropagation(); openDetail(item.id); }} /><IconButton label="Duyệt" icon="check" onClick={(e) => { e.stopPropagation(); patch(item.id, { status: "Đã xác minh" }); notify("Đã xác minh photographer."); }} /></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-center justify-between text-[12px] text-[#697086]"><span>Hiển thị 1 - {filtered.length} của 1248 photographer</span><span className="rounded-xl border px-3 py-2">10 / trang</span></div>
          </Panel>
        </div>

        {selectedId !== null ? <div className={`fixed inset-0 z-50 bg-[#0f172a]/45 backdrop-blur-[3px] transition-opacity duration-200 ${detailOpen ? "opacity-100" : "opacity-0"}`} onClick={closeDetail}>
        <aside className={`absolute right-0 top-0 h-full w-full min-w-0 overflow-y-auto border-l border-[#e6e9f1] bg-white p-5 shadow-[-24px_0_48px_rgba(12,18,32,0.2)] transition-transform duration-300 ease-out sm:w-[420px] ${detailOpen ? "translate-x-0" : "translate-x-full"}`} onClick={(event) => event.stopPropagation()}>
          <div className="flex justify-end"><IconButton label="Đóng" icon="close" onClick={closeDetail} /></div>
          <div className="text-center">
            <img src={selected.avatar} alt="" className="mx-auto h-24 w-24 rounded-full object-cover" />
            <div className="mt-4 flex items-center justify-center gap-2"><h2 className="text-[18px] font-semibold">{selected.studio}</h2><Badge text={selected.status} /></div>
            <p className="mt-2 text-[#697086]">{selected.region}</p>
            <p className="mt-2 text-[#697086]">★ {selected.rating} ({selected.reviews} đánh giá) · {selected.bookings} booking</p>
          </div>
          <div className="mt-5 flex border-b border-[#edf0f5]">{["Thông tin", "Portfolio", "Dịch vụ", "Đánh giá", "Lịch sử"].map((name) => <button key={name} onClick={() => setTab(name)} className={`flex-1 border-b-2 px-2 py-3 text-[12px] font-medium ${tab === name ? "border-[#ff8d28] text-[#ff8d28]" : "border-transparent text-[#697086]"}`}>{name}</button>)}</div>
          {tab === "Thông tin" ? (
            <div className="mt-5 space-y-4 text-[12px]">
              <h3 className="text-[14px] font-semibold">Thông tin cơ bản</h3>
              <Info label="Họ và tên" value={selected.name} /><Info label="Email" value={selected.email} /><Info label="Số điện thoại" value={selected.phone} /><Info label="Ngày sinh" value={selected.birthday} /><Info label="Giới tính" value={selected.gender} /><Info label="Khu vực hoạt động" value={selected.region} />
              <div><p className="mb-2 text-[#697086]">Dịch vụ chính</p>{selected.services.map((s) => <span key={s} className="mr-1 rounded-lg bg-[#f0f2f8] px-2.5 py-1">{s}</span>)}</div>
              <div><p className="text-[#697086]">Tiểu sử</p><p className="mt-1 leading-5">{selected.bio}</p></div>
              <h3 className="pt-4 text-[14px] font-semibold">Giấy tờ xác minh</h3>
              {selected.documents.map((doc) => <div key={doc} className="flex items-center justify-between border-b border-[#edf0f5] py-3"><span>{doc}</span><Badge text="Đã xác minh" /></div>)}
            </div>
          ) : <div className="py-10 text-center text-[#697086]">Nội dung {tab} đang được mô phỏng ở frontend.</div>}
          <div className="mt-6 flex justify-end gap-2"><IconButton label="Khóa" icon="lock" onClick={() => patch(selected.id, { status: "Bị khóa" })} /><IconButton label="Từ chối" icon="close" onClick={() => patch(selected.id, { status: "Bị từ chối" })} /><IconButton label="Lưu chỉnh sửa" icon="edit" onClick={() => { patch(selected.id, { status: "Đã xác minh" }); notify("Đã lưu thay đổi."); }} /></div>
        </aside>
        </div> : null}
      </div>
    </AdminLayout>
  );
}

function PageHead({ title, action, onAction }: { title: string;  action: string; onAction: () => void }) {
  return <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
    <div>
  <h1 className="text-[24px] font-semibold">{title}</h1>
  </div>
  <div className="flex gap-2">
    <button onClick={onAction} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#ff8d28] px-4 text-[13px] font-medium text-white shadow-[0_10px_20px_rgba(255,141,40,0.22)] hover:bg-[#f47f16]"><AdminIcon name="add" /> {action}</button><button className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#ffd2ad] bg-white px-4 text-[13px] font-medium text-[#ff8d28] hover:bg-[#fff8f1]"><AdminIcon name="download" /> Xuất Excel</button></div></div>;
}
function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) { return <section className={`rounded-2xl border border-[#e7e9f1] bg-white p-4 shadow-[0_14px_34px_rgba(12,18,32,0.04)] ${className}`}>{children}</section>; }
function Stat({ title, value, note, tone }: { title: string; value: string; note: string; tone: string }) { return <Panel><div className="flex items-center gap-4"><div className={`h-12 w-12 rounded-2xl ${tone === "orange" ? "bg-orange-50" : tone === "green" ? "bg-emerald-50" : "bg-red-50"}`} /><div><p className="text-[#697086]">{title}</p><b className="mt-1 block text-[22px]">{value}</b><p className="mt-1 text-[11px] text-[#697086]">{note}</p></div></div></Panel>; }
function Select({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) { return <select value={value} onChange={(e) => onChange(e.target.value)} className="!h-10 !min-h-0 !w-full rounded-xl !border !border-[#ffd2ad] bg-white !px-3 !py-0 !text-[12px] !font-normal text-[#ff8d28] !shadow-none outline-none focus:!border-[#ff8d28] focus:ring-2 focus:ring-[#ff8d28]/10">{options.map((o) => <option key={o}>{o}</option>)}</select>; }
function Badge({ text }: { text: string }) { return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${text === "Đã xác minh" ? "bg-emerald-50 text-emerald-700" : text === "Chờ duyệt" ? "bg-orange-50 text-orange-700" : "bg-red-50 text-red-600"}`}>{text}</span>; }
function Info({ label, value }: { label: string; value: string }) { return <div className="grid grid-cols-[118px_minmax(0,1fr)] gap-3"><span className="text-[#697086]">{label}</span><b className="font-medium">{value}</b></div>; }
function Toast({ text }: { text: string }) { return <div className="fixed right-6 top-20 z-50 rounded-xl border bg-white px-4 py-3 font-medium text-emerald-700 shadow-xl">{text}</div>; }
