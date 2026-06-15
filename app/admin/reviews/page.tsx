"use client";

import { useMemo, useState } from "react";
import AdminLayout from "../_components/admin-layout";
import { AdminIcon, IconButton } from "../_components/admin-icons";

type ReviewStatus = "Hiển thị" | "Đã ẩn";
type Review = {
  id: number;
  user: string;
  email: string;
  avatar: string;
  booking: string;
  photographer: string;
  photographerAvatar: string;
  service: string;
  rating: number;
  content: string;
  status: ReviewStatus;
  date: string;
  report: number;
  helpful: number;
  images: string[];
  note: string;
};

const imgs = ["/Overlay+Shadow.png", "/logo_sudion.jpg", "/screen%201.png", "/Overlay+Border+Shadow.png", "/logo_sudion_remove.png"];
const seed: Review[] = [
  { id: 1, user: "Nguyễn Thị Mai", email: "mainguyen@gmail.com", avatar: imgs[1], booking: "#BK20241125", photographer: "Minh Tuấn Studio", photographerAvatar: imgs[0], service: "Chụp ảnh cưới", rating: 5, content: "Chụp rất đẹp, photographer nhiệt tình, hướng dẫn tạo dáng tốt. Ảnh chỉnh sửa rất ưng ý.", status: "Hiển thị", date: "25/11/2024 10:30", report: 0, helpful: 9, images: imgs.slice(0, 4), note: "" },
  { id: 2, user: "Trần Văn Phong", email: "phongtran@gmail.com", avatar: imgs[0], booking: "#BK20241124", photographer: "Elena Studio", photographerAvatar: imgs[1], service: "Chụp ảnh đôi", rating: 4, content: "Ảnh đẹp, chỉnh sửa nhanh, sẽ ủng hộ lại.", status: "Hiển thị", date: "24/11/2024 16:20", report: 1, helpful: 5, images: imgs.slice(0, 2), note: "" },
  { id: 3, user: "Phạm Hồng Ngọc", email: "ngocpham@gmail.com", avatar: imgs[2], booking: "#BK20241123", photographer: "Khang Pham", photographerAvatar: imgs[2], service: "Chụp kỷ yếu", rating: 5, content: "Rất hài lòng với buổi chụp kỷ yếu của lớp.", status: "Hiển thị", date: "23/11/2024 14:15", report: 0, helpful: 11, images: imgs.slice(1, 3), note: "" },
  { id: 4, user: "Lê Quang Huy", email: "huy.le@gmail.com", avatar: imgs[3], booking: "#BK20241122", photographer: "May Studio", photographerAvatar: imgs[3], service: "Sự kiện", rating: 3, content: "Ảnh tạm ổn nhưng thời gian giao hơi lâu.", status: "Hiển thị", date: "21/11/2024 11:05", report: 2, helpful: 2, images: imgs.slice(0, 3), note: "" },
  { id: 5, user: "Vũ Minh Anh", email: "minhanh@gmail.com", avatar: imgs[3], booking: "#BK20241121", photographer: "David Lee", photographerAvatar: imgs[3], service: "Chụp sản phẩm", rating: 1, content: "Không hài lòng, photographer đến trễ.", status: "Đã ẩn", date: "21/11/2024 09:45", report: 5, helpful: 0, images: imgs.slice(0, 1), note: "Đã ẩn do có nhiều report." },
];

export default function ReviewsPage() {
  const [items, setItems] = useState(seed);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ReviewStatus | "Tất cả" | "Bị report">("Tất cả");
  const [rating, setRating] = useState("Tất cả");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [note, setNote] = useState("");
  const [toast, setToast] = useState("");
  const selected = items.find((item) => item.id === selectedId) ?? items[0];
  const filtered = useMemo(() => items.filter((item) => {
    const text = [item.user, item.email, item.booking, item.photographer, item.service, item.content, item.status].join(" ").toLowerCase();
    return text.includes(query.toLowerCase()) && (status === "Tất cả" || item.status === status || (status === "Bị report" && item.report > 0)) && (rating === "Tất cả" || item.rating === Number(rating));
  }), [items, query, rating, status]);

  function notify(text: string) {
    setToast(text);
    setTimeout(() => setToast(""), 1800);
  }

  function patch(id: number, value: Partial<Review>) {
    setItems((list) => list.map((item) => item.id === id ? { ...item, ...value } : item));
  }

  function openDetail(item: Review) {
    setSelectedId(item.id);
    setNote(item.note);
    window.requestAnimationFrame(() => setDetailOpen(true));
  }

  function closeDetail() {
    setDetailOpen(false);
    window.setTimeout(() => setSelectedId(null), 220);
  }

  return (
    <AdminLayout active="Đánh giá" search={query} onSearch={setQuery}>
      {toast ? <Toast text={toast} /> : null}
      <div className="min-w-0">
        <PageHead onClear={() => { setQuery(""); setStatus("Tất cả"); setRating("Tất cả"); }} />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Stat title="Tổng đánh giá" value="2.568" note="↑ 18.6% so với tháng trước" tone="orange" />
          <Stat title="Đã hiển thị" value="2.246" note="87.4% tổng số" tone="green" />
          <Stat title="Đã ẩn" value="235" note="9.2% tổng số" tone="red" />
          <Stat title="Bị report" value="87" note="3.4% tổng số" tone="red" />
        </div>

        <Panel className="mt-4">
          <div className="grid items-center gap-2 md:grid-cols-[minmax(280px,1.25fr)_170px_150px_132px_116px_40px]">
            <label className="relative !block min-w-0">
              <AdminIcon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8a93a5]" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} className="!h-10 !min-h-0 w-full rounded-xl border border-[#dfe3ec] bg-white !py-0 !pl-10 !pr-3 !text-[12px] !font-normal leading-none outline-none focus:border-[#ff8d28] focus:ring-2 focus:ring-[#ff8d28]/10" placeholder="Tìm nội dung, user, photographer..." />
            </label>
            <Select value={status} options={["Tất cả", "Hiển thị", "Đã ẩn", "Bị report"]} onChange={(value) => setStatus(value as ReviewStatus | "Tất cả" | "Bị report")} prefix="Trạng thái:" />
            <Select value={rating} options={["Tất cả", "5", "4", "3", "2", "1"]} onChange={setRating} prefix="Rating:" />
            <button className="inline-flex !h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#ffd2ad] bg-white px-3 text-left !text-[12px] !font-normal leading-none text-[#ff8d28] hover:bg-[#fff8f1]"><AdminIcon name="user" className="h-3.5 w-3.5 shrink-0" /><span>Tất cả</span></button>
            <button className="inline-flex !h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#ffd2ad] bg-white px-3 !text-[12px] !font-normal leading-none text-[#ff8d28] hover:bg-[#fff8f1]"><AdminIcon name="calendar" className="h-3.5 w-3.5 shrink-0" /><span>Tất cả</span></button>
            <button type="button" aria-label="Đặt lại bộ lọc" title="Đặt lại bộ lọc" onClick={() => { setQuery(""); setStatus("Tất cả"); setRating("Tất cả"); }} className="grid !h-10 !w-10 place-items-center rounded-full border border-[#ffd2ad] bg-white text-[#ff8d28] transition hover:bg-[#fff8f1]"><AdminIcon name="filter" /></button>
          </div>

          <div className="mt-4 flex gap-6 overflow-x-auto border-b border-[#edf0f5]">
            {(["Tất cả", "Hiển thị", "Đã ẩn", "Bị report"] as const).map((tab) => (
              <button key={tab} onClick={() => setStatus(tab)} className={`shrink-0 border-b-2 px-2 py-3 text-[12px] font-medium ${status === tab ? "border-[#ff8d28] text-[#ff8d28]" : "border-transparent text-[#536078]"}`}>
                {tab} {tab === "Tất cả" ? "(2.568)" : tab === "Hiển thị" ? "(2.246)" : tab === "Đã ẩn" ? "(235)" : "(87)"}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto rounded-b-xl border border-t-0 border-[#e6e9f1]">
            <table className="w-full min-w-[1040px] text-left text-[12px]">
              <thead className="bg-[#fbfcfe] text-[#536078]">
                <tr>{["", "Đánh giá", "Booking", "Photographer", "Dịch vụ", "Rating", "Trạng thái", "Ngày", "Report", "Thao tác"].map((head) => <th key={head} className="px-3 py-3 font-semibold">{head}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-[#edf0f5]">
                {filtered.map((item) => (
                  <tr key={item.id} onClick={() => openDetail(item)} className={`cursor-pointer hover:bg-[#fff8f1] ${selectedId === item.id ? "bg-[#fff3e8]" : "bg-white"}`}>
                    <td className="px-3 py-3"><input type="checkbox" onClick={(event) => event.stopPropagation()} className="h-4 w-4 rounded border-[#d6dbe7] accent-[#ff8d28]" /></td>
                    <td className="px-3 py-3"><div className="flex items-center gap-3"><img src={item.avatar} alt="" className="h-9 w-9 rounded-full object-cover" /><div><b className="font-semibold">{item.user} <Stars rating={item.rating} /></b><p className="max-w-[240px] truncate text-[#697086]">{item.content}</p></div></div></td>
                    <td className="px-3 py-3 font-medium text-[#ff8d28]">{item.booking}</td>
                    <td className="px-3 py-3"><div className="flex items-center gap-2"><img src={item.photographerAvatar} alt="" className="h-7 w-7 rounded-full object-cover" />{item.photographer}</div></td>
                    <td className="px-3 py-3">{item.service}</td>
                    <td className="px-3 py-3 text-[#f59e0b]">★ {item.rating}.0</td>
                    <td className="px-3 py-3"><Badge text={item.status} /></td>
                    <td className="px-3 py-3">{item.date}</td>
                    <td className="px-3 py-3">{item.report}</td>
                    <td className="px-3 py-3"><div className="flex gap-2"><IconButton label="Xem chi tiết" icon="eye" onClick={(event) => { event.stopPropagation(); openDetail(item); }} /><IconButton label="Ẩn/hiện" icon="refresh" onClick={(event) => { event.stopPropagation(); patch(item.id, { status: item.status === "Hiển thị" ? "Đã ẩn" : "Hiển thị" }); openDetail(item); notify("Đã cập nhật trạng thái đánh giá."); }} /></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center justify-between text-[12px] text-[#697086]">
            <span>Hiển thị 1 - {filtered.length} của 2.568 đánh giá</span>
            <span className="rounded-xl border border-[#dfe3ec] px-3 py-2">10 / trang</span>
          </div>
        </Panel>

        {selectedId !== null ? (
          <div className={`fixed inset-0 z-50 bg-[#0f172a]/45 backdrop-blur-[3px] transition-opacity duration-200 ${detailOpen ? "opacity-100" : "opacity-0"}`} onClick={closeDetail}>
            <aside className={`absolute right-0 top-0 h-full w-full min-w-0 overflow-y-auto border-l border-[#e6e9f1] bg-white p-5 shadow-[-24px_0_48px_rgba(12,18,32,0.2)] transition-transform duration-300 ease-out sm:w-[430px] ${detailOpen ? "translate-x-0" : "translate-x-full"}`} onClick={(event) => event.stopPropagation()}>
              <div className="flex justify-between"><h2 className="text-[16px] font-semibold">Chi tiết đánh giá</h2><IconButton label="Đóng" icon="close" onClick={closeDetail} /></div>
              <div className="mt-5 flex items-center gap-3 border-b border-[#edf0f5] pb-5"><img src={selected.avatar} alt="" className="h-14 w-14 rounded-full object-cover" /><div><b>{selected.user}</b><p className="text-[#697086]">{selected.email}</p><p className="mt-2 text-[#697086]">Tổng đánh giá: 12 · Hữu ích: {selected.helpful}</p></div></div>
              <InfoBlock title="Thông tin đánh giá" rows={[["Rating", "★".repeat(selected.rating) + ` ${selected.rating}.0`], ["Nội dung", selected.content], ["Booking", selected.booking], ["Dịch vụ", selected.service], ["Photographer", selected.photographer], ["Ngày đánh giá", selected.date]]} />
              <div className="mt-5"><p className="mb-2 text-[12px] text-[#697086]">Hình ảnh đính kèm</p><div className="grid grid-cols-4 gap-2">{selected.images.map((img) => <img key={img} src={img} alt="" className="h-14 rounded-lg object-cover" />)}</div></div>
              <div className="mt-5 grid gap-3 text-[12px]"><Select value={selected.status} options={["Hiển thị", "Đã ẩn"]} onChange={(value) => patch(selected.id, { status: value as ReviewStatus })} /><p>Số lượt report: <b>{selected.report} lượt</b></p><textarea value={note} onChange={(event) => setNote(event.target.value)} className="min-h-[72px] rounded-xl border border-[#dfe3ec] p-3 outline-none focus:border-[#ff8d28]" placeholder="Nhập ghi chú nếu có..." /></div>
              <div className="mt-6 flex justify-end gap-2"><IconButton label="Ẩn" icon="archive" onClick={() => patch(selected.id, { status: "Đã ẩn" })} /><IconButton label="Xóa" icon="delete" tone="danger" onClick={() => { setItems((list) => list.filter((item) => item.id !== selected.id)); setDetailOpen(false); window.setTimeout(() => setSelectedId(null), 220); notify("Đã xóa đánh giá."); }} /><IconButton label="Lưu" icon="check" onClick={() => { patch(selected.id, { note }); notify("Đã lưu thay đổi."); }} /></div>
            </aside>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
}

function PageHead({ onClear }: { onClear: () => void }) {
  return <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between"><div><h1 className="text-[24px] font-semibold">Quản lý đánh giá</h1></div><div className="flex gap-2"><button className="h-10 rounded-xl border border-[#ffd2ad] bg-white px-4 text-[13px] text-[#ff8d28] hover:bg-[#fff8f1]">Xuất Excel</button><button onClick={onClear} className="h-10 rounded-xl bg-[#ff8d28] px-4 text-[13px] text-white shadow-[0_10px_20px_rgba(255,141,40,0.18)] hover:bg-[#f47f16]">Bộ lọc</button></div></div>;
}

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) { return <section className={`rounded-2xl border border-[#e7e9f1] bg-white p-4 shadow-[0_14px_34px_rgba(12,18,32,0.04)] ${className}`}>{children}</section>; }
function Stat({ title, value, note, tone }: { title: string; value: string; note: string; tone: "orange" | "green" | "red" }) { const cls = tone === "green" ? "bg-emerald-50 text-emerald-600" : tone === "red" ? "bg-red-50 text-red-500" : "bg-[#fff3e8] text-[#ff8d28]"; return <Panel><div className="flex items-center gap-4"><div className={`grid h-12 w-12 place-items-center rounded-2xl text-[18px] ${cls}`}>☆</div><div><p className="text-[12px] text-[#697086]">{title}</p><b className="mt-1 block text-[20px] font-semibold">{value}</b><p className="mt-1 text-[11px] text-[#697086]">{note}</p></div></div></Panel>; }
function Select({ value, options, onChange, prefix = "" }: { value: string; options: string[]; onChange: (v: string) => void; prefix?: string }) { return <select value={value} onChange={(event) => onChange(event.target.value)} className="!h-10 !min-h-0 !w-full rounded-xl !border !border-[#ffd2ad] bg-white !px-3 !py-0 !text-[12px] !font-normal leading-none text-[#ff8d28] !shadow-none outline-none focus:!border-[#ff8d28] focus:ring-2 focus:ring-[#ff8d28]/10">{options.map((option) => <option key={option} value={option}>{prefix ? `${prefix} ${option}` : option}</option>)}</select>; }
function Badge({ text }: { text: string }) { return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${text === "Hiển thị" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>{text}</span>; }
function Stars({ rating }: { rating: number }) { return <span className="ml-1 text-[#f59e0b]">{"★".repeat(rating)}<span className="text-[#d5d9e2]">{"★".repeat(5 - rating)}</span></span>; }
function InfoBlock({ title, rows }: { title: string; rows: string[][] }) { return <div className="mt-5"><h3 className="text-[14px] font-semibold">{title}</h3><div className="mt-3 space-y-3 text-[12px]">{rows.map(([label, value]) => <div key={label} className="grid grid-cols-[94px_minmax(0,1fr)] gap-3"><span className="text-[#697086]">{label}</span><b className="font-medium leading-5">{value}</b></div>)}</div></div>; }
function Toast({ text }: { text: string }) { return <div className="fixed right-6 top-20 z-50 rounded-xl border border-[#dfe3ec] bg-white px-4 py-3 font-medium text-emerald-700 shadow-xl">{text}</div>; }
