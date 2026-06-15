"use client";

import { useMemo, useState } from "react";
import AdminLayout from "../_components/admin-layout";
import { AdminIcon, IconButton } from "../_components/admin-icons";

type Status = "Hoạt động" | "Tạm ẩn";
type Service = { id: number; name: string; slug: string; description: string; image: string; photographers: number; packages: number; bookings: number; status: Status; updatedAt: string; options: string[] };
const images = ["/Overlay+Shadow.png", "/logo_sudion.jpg", "/screen%201.png", "/Overlay+Border+Shadow.png", "/logo_sudion_remove.png"];
const seed: Service[] = [
  { id: 1, name: "Chụp ảnh cưới", slug: "chup-anh-cuoi", description: "Chụp ảnh cưới trọn gói, album cưới, tiệc cưới, ảnh phóng sự và ảnh chân dung cô dâu chú rể.", image: images[0], photographers: 685, packages: 1248, bookings: 3542, status: "Hoạt động", updatedAt: "20/11/2024 14:20", options: ["Makeup", "Album", "Pre-wedding", "Flycam"] },
  { id: 2, name: "Chụp ảnh đôi", slug: "chup-anh-doi", description: "Chụp ảnh couple, kỷ niệm, yêu thương với nhiều concept trong nhà và ngoài trời.", image: images[1], photographers: 742, packages: 1102, bookings: 2650, status: "Hoạt động", updatedAt: "18/11/2024 09:30", options: ["Retouch", "Studio", "Ngoại cảnh"] },
  { id: 3, name: "Chụp kỷ yếu", slug: "chup-ky-yeu", description: "Chụp kỷ yếu lớp, nhóm, profile học sinh sinh viên.", image: images[2], photographers: 512, packages: 631, bookings: 1420, status: "Hoạt động", updatedAt: "14/11/2024 11:00", options: ["Makeup", "Áo dài", "Flycam"] },
  { id: 4, name: "Chụp sự kiện", slug: "chup-su-kien", description: "Hội nghị, tiệc, khai trương, concert và sự kiện doanh nghiệp.", image: images[3], photographers: 418, packages: 425, bookings: 1180, status: "Hoạt động", updatedAt: "12/11/2024 15:10", options: ["Video", "Livestream", "Ảnh nhanh"] },
  { id: 5, name: "Chụp sản phẩm", slug: "chup-san-pham", description: "Chụp sản phẩm, quảng cáo, thương mại điện tử và catalog.", image: images[4], photographers: 326, packages: 356, bookings: 940, status: "Hoạt động", updatedAt: "09/11/2024 08:30", options: ["Styling", "Retouch", "Concept"] },
  { id: 6, name: "Chụp gia đình", slug: "chup-gia-dinh", description: "Gia đình, em bé, kỷ niệm gia đình và ảnh tại nhà.", image: images[0], photographers: 451, packages: 298, bookings: 760, status: "Tạm ẩn", updatedAt: "02/11/2024 13:05", options: ["Studio", "Album", "In ảnh"] },
];

export default function ServicesPage() {
  const [items, setItems] = useState(seed);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<Status | "Tất cả">("Tất cả");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [tab, setTab] = useState("Thông tin");
  const [toast, setToast] = useState("");
  const filtered = useMemo(() => items.filter((i) => [i.name, i.slug, i.description, i.status].join(" ").toLowerCase().includes(query.toLowerCase()) && (status === "Tất cả" || i.status === status)), [items, query, status]);
  const selected = items.find((i) => i.id === selectedId) ?? filtered[0] ?? items[0];
  function notify(text: string) { setToast(text); setTimeout(() => setToast(""), 1800); }
  function patch(id: number, value: Partial<Service>) { setItems((list) => list.map((item) => item.id === id ? { ...item, ...value } : item)); }
  function addService() { const id = Math.max(...items.map((i) => i.id)) + 1; const next = { ...seed[0], id, name: `Dịch vụ mới ${id}`, slug: `dich-vu-moi-${id}` }; setItems([next, ...items]); setSelectedId(id); notify("Đã thêm dịch vụ mới."); }

  return (
    <AdminLayout active="Dịch vụ" search={query} onSearch={setQuery}>
      {toast ? <Toast text={toast} /> : null}
      <div className="min-w-0">
        <div className="min-w-0">
          <PageHead onAdd={addService} />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><Stat title="Tổng danh mục" value="12" /><Stat title="Photographer cung cấp" value="1.248" /><Stat title="Gói dịch vụ" value="3.562" /><Stat title="Tùy chọn đi kèm" value="24" /></div>
          <Panel className="mt-4">
            <div className="mb-3 grid gap-2 md:grid-cols-[minmax(0,390px)_160px_40px]"><label className="relative !block"><AdminIcon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8a93a5]" /><input value={query} onChange={(e) => setQuery(e.target.value)} className="!h-10 !min-h-0 w-full rounded-xl border border-[#dfe3ec] !py-0 !pl-10 !pr-3 !text-[12px] !font-normal outline-none focus:border-[#ff8d28]" placeholder="Tìm kiếm dịch vụ..." /></label><Select value={status} options={["Tất cả", "Hoạt động", "Tạm ẩn"]} onChange={(v) => setStatus(v as Status | "Tất cả")} /><IconButton label="Đặt lại bộ lọc" icon="filter" size="md" onClick={() => { setQuery(""); setStatus("Tất cả"); }} /></div>
            <div className="overflow-x-auto rounded-xl border border-[#e6e9f1]">
              <table className="w-full min-w-[900px] text-left text-[12px]">
                <thead className="bg-[#fbfcfe] text-[#536078]"><tr>{["#", "Danh mục dịch vụ", "Slug", "Số photographer", "Số gói dịch vụ", "Trạng thái", "Thao tác"].map((h) => <th key={h} className="px-3 py-3 font-semibold">{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-[#edf0f5]">{filtered.map((item) => <tr key={item.id} onClick={() => setSelectedId(item.id)} className={`cursor-pointer hover:bg-[#fff8f1] ${selectedId === item.id ? "bg-[#fff3e8]" : "bg-white"}`}><td className="px-3 py-3 text-[#ff8d28]">{item.id}</td><td className="px-3 py-3"><div className="flex items-center gap-3"><img src={item.image} alt="" className="h-11 w-11 rounded-xl object-cover" /><div><b>{item.name}</b><p className="max-w-[260px] truncate text-[#697086]">{item.description}</p></div></div></td><td className="px-3 py-3">{item.slug}</td><td className="px-3 py-3">{item.photographers} photographer</td><td className="px-3 py-3">{item.packages} gói</td><td className="px-3 py-3"><Badge text={item.status} /></td><td className="px-3 py-3"><div className="flex gap-2"><IconButton label="Xem chi tiết" icon="eye" onClick={(e) => { e.stopPropagation(); setSelectedId(item.id); }} /><IconButton label="Ẩn/hiện" icon="refresh" onClick={(e) => { e.stopPropagation(); patch(item.id, { status: item.status === "Hoạt động" ? "Tạm ẩn" : "Hoạt động" }); setSelectedId(item.id); notify("Đã cập nhật trạng thái dịch vụ."); }} /></div></td></tr>)}</tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-between text-[12px] text-[#697086]"><span>Hiển thị 1 - {filtered.length} của 12 danh mục</span><span className="rounded-xl border px-3 py-2">10 / trang</span></div>
          </Panel>
        </div>
        {selectedId !== null ? <div className="fixed inset-0 z-50 bg-[#0f172a]/35 backdrop-blur-[2px]" onClick={() => setSelectedId(null)}>
        <aside className="absolute right-0 top-0 h-full w-full min-w-0 overflow-y-auto border-l border-[#e6e9f1] bg-white p-5 shadow-[-18px_0_38px_rgba(12,18,32,0.16)] sm:w-[430px]" onClick={(event) => event.stopPropagation()}>
          <div className="flex items-center justify-between"><h2 className="text-[16px] font-semibold">Chi tiết dịch vụ</h2><IconButton label="Đóng" icon="close" onClick={() => setSelectedId(null)} /></div>
          <div className="mt-5 flex gap-4"><img src={selected.image} alt="" className="h-20 w-20 rounded-xl object-cover" /><div><div className="flex items-center gap-2"><h3 className="text-[17px] font-semibold">{selected.name}</h3><Badge text={selected.status} /></div><p className="mt-1 text-[#697086]">Slug: {selected.slug}</p><p className="mt-1 text-[#697086]">Cập nhật: {selected.updatedAt}</p></div></div>
          <div className="mt-5 flex border-b border-[#edf0f5]">{["Thông tin", "Gói dịch vụ", "Tùy chọn", "Thống kê"].map((name) => <button key={name} onClick={() => setTab(name)} className={`flex-1 border-b-2 px-2 py-3 text-[12px] font-medium ${tab === name ? "border-[#ff8d28] text-[#ff8d28]" : "border-transparent text-[#697086]"}`}>{name}</button>)}</div>
          {tab === "Thông tin" ? <div className="mt-5 space-y-5 text-[12px]"><h3 className="text-[14px] font-semibold">Thông tin cơ bản</h3><Info label="Tên dịch vụ" value={selected.name} /><Info label="Slug" value={selected.slug} /><div><p className="text-[#697086]">Mô tả</p><p className="mt-1 leading-5">{selected.description}</p></div><div><p className="mb-2 text-[#697086]">Ảnh đại diện</p><div className="flex gap-3"><img src={selected.image} alt="" className="h-28 w-28 rounded-xl object-cover" /><button className="grid h-28 w-28 place-items-center rounded-xl border border-dashed text-center text-[#697086]" aria-label="Thêm ảnh" title="Thêm ảnh"><AdminIcon name="add" /></button></div></div><Select value={selected.status} options={["Hoạt động", "Tạm ẩn"]} onChange={(v) => patch(selected.id, { status: v as Status })} /></div> : <div className="py-10 text-center text-[#697086]">Nội dung {tab} đang được mô phỏng ở frontend.</div>}
          <div className="mt-6 flex justify-end gap-2"><IconButton label="Hủy" icon="close" onClick={() => setSelectedId(null)} /><IconButton label="Xóa" icon="delete" tone="danger" onClick={() => notify("Đã xóa mô phỏng frontend.")} /><IconButton label="Lưu thay đổi" icon="check" onClick={() => notify("Đã lưu thay đổi.")} /></div>
        </aside>
        </div> : null}
      </div>
    </AdminLayout>
  );
}

function PageHead({ onAdd }: { onAdd: () => void }) 
{ return <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between"><div><h1 className="text-[24px] font-semibold">Quản lý dịch vụ</h1></div><div className="flex gap-2"><button className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#ffd2ad] bg-white px-4 text-[#ff8d28]"><AdminIcon name="download" /> Xuất Excel</button><button onClick={onAdd} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#ff8d28] px-4 text-white"><AdminIcon name="add" /> Thêm dịch vụ</button></div></div>; }
function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) { return <section className={`rounded-2xl border border-[#e7e9f1] bg-white p-4 shadow-[0_14px_34px_rgba(12,18,32,0.04)] ${className}`}>{children}</section>; }
function Stat({ title, value }: { title: string; value: string }) { return <Panel><p className="text-[#697086]">{title}</p><b className="mt-1 block text-[22px]">{value}</b><p className="text-[11px] text-[#697086]">đang hoạt động</p></Panel>; }
function Select({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) { return <select value={value} onChange={(e) => onChange(e.target.value)} className="!h-10 !min-h-0 !w-full rounded-xl !border !border-[#ffd2ad] bg-white !px-3 !py-0 !text-[12px] !font-normal text-[#ff8d28] !shadow-none outline-none focus:!border-[#ff8d28]">{options.map((o) => <option key={o}>{o}</option>)}</select>; }
function Badge({ text }: { text: string }) { return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${text === "Hoạt động" ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700"}`}>{text}</span>; }
function Info({ label, value }: { label: string; value: string }) { return <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-3"><span className="text-[#697086]">{label}</span><b className="font-medium">{value}</b></div>; }
function Toast({ text }: { text: string }) { return <div className="fixed right-6 top-20 z-50 rounded-xl border bg-white px-4 py-3 font-medium text-emerald-700 shadow-xl">{text}</div>; }
