"use client";

import { useMemo, useState } from "react";
import AdminLayout from "../_components/admin-layout";
import { AdminIcon, IconButton } from "../_components/admin-icons";

type Status = "Chờ xử lý" | "Vi phạm" | "Đã xử lý";
type Severity = "Cao" | "Trung bình" | "Thấp";
type Alert = {
  id: string;
  title: string;
  type: string;
  source: string;
  author: string;
  authorId: string;
  severity: Severity;
  score: number;
  time: string;
  status: Status;
  image: string;
  reason: string;
  history: string[];
};

const seed: Alert[] = [
  { id: "IMG_12987.jpg", title: "Ảnh trong portfolio", type: "Nội dung nhạy cảm", source: "Portfolio", author: "Minh Tuấn Studio", authorId: "PHO_1023", severity: "Cao", score: 96, time: "25/11/2024 10:30", status: "Chờ xử lý", image: "/screen%201.png", reason: "Phát hiện nội dung có yếu tố nhạy cảm (Skin exposure).", history: ["25/11/2024 10:30 · AI phát hiện và tạo cảnh báo"] },
  { id: "MSG_55621", title: "Tin nhắn chat", type: "Spam", source: "Tin nhắn", author: "User: Trần Văn A", authorId: "USR_3345", severity: "Trung bình", score: 72, time: "25/11/2024 09:15", status: "Chờ xử lý", image: "/Overlay+Shadow.png", reason: "Nội dung lặp lại nhiều lần và có dấu hiệu quảng cáo.", history: ["25/11/2024 09:15 · AI phát hiện spam"] },
  { id: "BK_8891_IMG3.jpg", title: "Ảnh trong booking", type: "Bạo lực / Máu me", source: "Booking", author: "Elena Studio", authorId: "PHO_2045", severity: "Cao", score: 93, time: "24/11/2024 16:45", status: "Vi phạm", image: "/Overlay+Border+Shadow.png", reason: "Ảnh có dấu hiệu bạo lực hoặc máu me vượt ngưỡng an toàn.", history: ["24/11/2024 16:45 · AI phát hiện", "24/11/2024 17:10 · Admin xác nhận vi phạm"] },
  { id: "REV_3321", title: "Bình luận đánh giá", type: "Ngôn từ thù hận", source: "Đánh giá", author: "User: Nguyễn B", authorId: "USR_2211", severity: "Trung bình", score: 68, time: "24/11/2024 15:20", status: "Chờ xử lý", image: "/logo_sudion.jpg", reason: "Bình luận chứa từ khóa có khả năng công kích hoặc thù hận.", history: ["24/11/2024 15:20 · AI phát hiện"] },
  { id: "IMG_7789.jpg", title: "Ảnh vi phạm bản quyền", type: "Bản quyền", source: "Portfolio", author: "Khang Pham", authorId: "PHO_1122", severity: "Cao", score: 89, time: "24/11/2024 11:05", status: "Vi phạm", image: "/logo_sudion_remove.png", reason: "Ảnh trùng khớp với nội dung đã được báo cáo bản quyền.", history: ["24/11/2024 11:05 · AI phát hiện", "24/11/2024 11:30 · Đánh dấu vi phạm"] },
  { id: "MSG_55432", title: "Tin nhắn chat", type: "Quảng cáo trái phép", source: "Tin nhắn", author: "User: Lê C", authorId: "USR_9987", severity: "Thấp", score: 45, time: "23/11/2024 21:30", status: "Đã xử lý", image: "/Overlay+Shadow.png", reason: "Tin nhắn chứa liên kết quảng cáo ngoài nền tảng.", history: ["23/11/2024 21:30 · AI phát hiện", "23/11/2024 21:45 · Đã xử lý"] },
  { id: "IMG_66772.jpg", title: "Ảnh trong portfolio", type: "Nội dung nhạy cảm", source: "Portfolio", author: "May Studio", authorId: "PHO_3344", severity: "Cao", score: 97, time: "23/11/2024 18:20", status: "Vi phạm", image: "/Overlay+Border+Shadow.png", reason: "Điểm nhạy cảm vượt ngưỡng kiểm duyệt tự động.", history: ["23/11/2024 18:20 · AI phát hiện"] },
  { id: "REV_2210", title: "Bình luận đánh giá", type: "Spam", source: "Đánh giá", author: "User: Phạm D", authorId: "USR_6677", severity: "Thấp", score: 40, time: "23/11/2024 17:00", status: "Đã xử lý", image: "/logo_sudion.jpg", reason: "Nội dung đánh giá lặp từ nhiều tài khoản.", history: ["23/11/2024 17:00 · AI phát hiện", "23/11/2024 17:20 · Đã xử lý"] },
];

export default function AiModerationPage() {
  const [items, setItems] = useState(seed);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<Status | "Tất cả">("Tất cả");
  const [type, setType] = useState("Tất cả");
  const [severity, setSeverity] = useState<Severity | "Tất cả">("Tất cả");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [toast, setToast] = useState("");
  const types = useMemo(() => ["Tất cả", ...Array.from(new Set(items.map((item) => item.type)))], [items]);
  const selected = items.find((item) => item.id === selectedId) ?? items[0];
  const filtered = useMemo(() => items.filter((item) => {
    const text = [item.id, item.title, item.type, item.source, item.author, item.status].join(" ").toLowerCase();
    return text.includes(query.toLowerCase()) && (status === "Tất cả" || item.status === status) && (type === "Tất cả" || item.type === type) && (severity === "Tất cả" || item.severity === severity);
  }), [items, query, severity, status, type]);

  function notify(text: string) {
    setToast(text);
    setTimeout(() => setToast(""), 1800);
  }

  function patch(id: string, value: Partial<Alert>) {
    setItems((list) => list.map((item) => item.id === id ? { ...item, ...value, history: value.status ? [...item.history, `15/06/2026 · ${value.status}`] : item.history } : item));
  }

  function openDetail(id: string) {
    setSelectedId(id);
    window.requestAnimationFrame(() => setDetailOpen(true));
  }

  function closeDetail() {
    setDetailOpen(false);
    window.setTimeout(() => setSelectedId(null), 220);
  }

  return (
    <AdminLayout active="AI Moderation" search={query} onSearch={setQuery}>
      {toast ? <Toast text={toast} /> : null}
      <div className="min-w-0">
        <section className="min-w-0">
          <div className="mb-5">
            <div>
              <h1 className="text-[24px] font-semibold tracking-normal">AI Moderation</h1>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Stat title="Tổng cảnh báo" value="1.248" note="↑ 18.6% so với tuần trước" tone="orange" icon="filter" />
            <Stat title="Chờ xử lý" value="156" note="12.5% tổng số" tone="amber" icon="more" />
            <Stat title="Vi phạm xác nhận" value="892" note="71.5% tổng số" tone="red" icon="shield" />
            <Stat title="Đã xử lý" value="1.092" note="87.6% tổng số" tone="green" icon="check" />
          </div>

          <Panel className="mt-4">
            <div className="mb-3 flex gap-6 overflow-x-auto border-b border-[#edf0f5]">
              {(["Tất cả", "Chờ xử lý", "Vi phạm", "Đã xử lý"] as const).map((tab) => (
                <button key={tab} onClick={() => setStatus(tab)} className={`shrink-0 border-b-2 px-2 py-3 text-[12px] font-medium ${status === tab ? "border-[#ff8d28] text-[#ff8d28]" : "border-transparent text-[#536078]"}`}>
                  {tab} {tab === "Tất cả" ? "(1.248)" : tab === "Chờ xử lý" ? "(156)" : tab === "Vi phạm" ? "(892)" : "(1.092)"}
                </button>
              ))}
            </div>
            <div className="mb-3 grid items-center gap-2 xl:grid-cols-[minmax(280px,1.25fr)_150px_150px_150px_150px_170px_40px]">
              <label className="relative !block min-w-0">
                <AdminIcon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8a93a5]" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} className="!h-10 !min-h-0 w-full rounded-xl border border-[#dfe3ec] bg-white !py-0 !pl-10 !pr-3 !text-[12px] !font-normal leading-none outline-none focus:border-[#ff8d28] focus:ring-2 focus:ring-[#ff8d28]/10" placeholder="Tìm nội dung, người dùng, ID..." />
              </label>
              <Select value={type} options={types} onChange={setType} prefix="Loại vi phạm:" />
              <Select value="Tất cả" options={["Tất cả", "Ảnh", "Tin nhắn", "Đánh giá"]} onChange={() => undefined} prefix="Loại nội dung:" />
              <Select value={severity} options={["Tất cả", "Cao", "Trung bình", "Thấp"]} onChange={(value) => setSeverity(value as Severity | "Tất cả")} prefix="Mức độ:" />
              <Select value="Tất cả" options={["Tất cả", "Portfolio", "Booking", "Tin nhắn"]} onChange={() => undefined} prefix="Nguồn:" />
              <button className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#ffd2ad] bg-white px-3 text-left !text-[12px] !font-normal text-[#ff8d28] hover:bg-[#fff8f1]"><AdminIcon name="calendar" className="h-3.5 w-3.5 shrink-0" /> 01/11 - 30/11</button>
              <IconButton label="Đặt lại bộ lọc" icon="filter" size="md" onClick={() => { setQuery(""); setStatus("Tất cả"); setType("Tất cả"); setSeverity("Tất cả"); }} />
            </div>
            <div className="overflow-x-auto rounded-xl border border-[#e6e9f1]">
              <table className="w-full min-w-[1040px] text-left text-[12px]">
                <thead className="bg-[#fbfcfe] text-[#536078]">
                  <tr>{["", "Nội dung", "Loại vi phạm", "Nguồn", "Người đăng", "Mức độ", "AI Score", "Thời gian", "Trạng thái", ""].map((head, index) => <th key={`alert-head-${index}`} className="px-3 py-3 font-semibold">{head}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-[#edf0f5]">
                  {filtered.map((item) => (
                    <tr key={item.id} onClick={() => openDetail(item.id)} className={`cursor-pointer hover:bg-[#fff8f1] ${selectedId === item.id ? "bg-[#fff3e8]" : "bg-white"}`}>
                      <td className="px-3 py-3"><input type="checkbox" onClick={(event) => event.stopPropagation()} className="h-4 w-4 rounded border-[#d6dbe7] accent-[#ff8d28]" /></td>
                      <td className="px-3 py-3"><div className="flex items-center gap-3"><img src={item.image} alt="" className="h-10 w-10 rounded-lg object-cover" /><div><b className="font-semibold">{item.title}</b><p className="text-[#697086]">ID: {item.id}</p></div></div></td>
                      <td className="px-3 py-3"><Violation text={item.type} /></td>
                      <td className="px-3 py-3">{item.source}</td>
                      <td className="px-3 py-3">{item.author}<p className="text-[#697086]">ID: {item.authorId}</p></td>
                      <td className="px-3 py-3"><SeverityBadge text={item.severity} /></td>
                      <td className="px-3 py-3 font-semibold text-red-500">{item.score}%</td>
                      <td className="px-3 py-3">{item.time}</td>
                      <td className="px-3 py-3"><Badge text={item.status} /></td>
                      <td className="px-3 py-3"><div className="flex gap-2"><IconButton label="Xem chi tiết" icon="eye" onClick={(event) => { event.stopPropagation(); openDetail(item.id); }} /><IconButton label="Thao tác" icon="more" onClick={(event) => { event.stopPropagation(); openDetail(item.id); }} /></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-center justify-between text-[12px] text-[#697086]">
              <span>Hiển thị 1 - {filtered.length} của 156 cảnh báo</span>
              <span className="rounded-xl border border-[#dfe3ec] px-3 py-2">10 / trang</span>
            </div>
          </Panel>
        </section>

        {selectedId !== null ? (
        <div className={`fixed inset-0 z-50 bg-[#0f172a]/45 backdrop-blur-[3px] transition-opacity duration-200 ${detailOpen ? "opacity-100" : "opacity-0"}`} onClick={closeDetail}>
        <aside className={`absolute right-0 top-0 h-full w-full min-w-0 overflow-y-auto border-l border-[#e6e9f1] bg-white px-5 py-5 shadow-[-24px_0_48px_rgba(12,18,32,0.2)] transition-transform duration-300 ease-out sm:w-[430px] ${detailOpen ? "translate-x-0" : "translate-x-full"}`} onClick={(event) => event.stopPropagation()}>
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-semibold">Chi tiết cảnh báo</h2>
            <IconButton label="Đóng" icon="close" onClick={closeDetail} />
          </div>
          <div className="mt-5 flex items-center gap-2 text-[12px]"><Badge text={selected.status} /><span className="text-[#697086]">ID: {selected.id}</span></div>
          <h3 className="mt-6 text-[14px] font-semibold">Nội dung</h3>
          <div className="relative mt-3">
            <img src={selected.image} alt="" className="h-[200px] w-full rounded-xl object-cover" />
            <button className="absolute bottom-3 right-3 grid h-8 w-8 place-items-center rounded-lg bg-white/95 text-[#ff8d28] shadow" aria-label="Phóng to ảnh" title="Phóng to ảnh"><AdminIcon name="search" /></button>
          </div>
          <InfoBlock title="Thông tin cảnh báo" rows={[["Loại vi phạm", selected.type], ["Nguồn", selected.source], ["Người đăng", `${selected.author} (${selected.authorId})`], ["Ngày phát hiện", selected.time], ["AI Score", `${selected.score}%`], ["Lý do AI phát hiện", selected.reason]]} />
          <h3 className="mt-6 border-t border-[#edf0f5] pt-5 text-[14px] font-semibold">Lịch sử xử lý</h3>
          <div className="mt-3 space-y-2 text-[12px] text-[#536078]">{selected.history.map((item) => <p key={item}>○ {item}</p>)}</div>
          <div className="mt-6 flex justify-end gap-2 border-t border-[#edf0f5] pt-5">
            <IconButton label="Xác nhận vi phạm" icon="check" onClick={() => { patch(selected.id, { status: "Vi phạm" }); notify("Đã xác nhận vi phạm."); }} />
            <IconButton label="Bỏ qua cảnh báo" icon="close" onClick={() => { patch(selected.id, { status: "Đã xử lý" }); notify("Đã bỏ qua cảnh báo."); }} />
            <IconButton label="Xem profile người đăng" icon="user" onClick={() => notify("Đã mở profile người đăng.")} />
          </div>
        </aside>
        </div>
        ) : null}
      </div>
    </AdminLayout>
  );
}

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-[#e7e9f1] bg-white p-4 shadow-[0_14px_34px_rgba(12,18,32,0.04)] ${className}`}>{children}</section>;
}

function Stat({ title, value, note, tone, icon }: { title: string; value: string; note: string; tone: "orange" | "amber" | "red" | "green"; icon: "filter" | "more" | "shield" | "check" }) {
  const colors = tone === "orange" ? "bg-[#fff3e8] text-[#ff8d28]" : tone === "amber" ? "bg-amber-50 text-amber-500" : tone === "red" ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-600";
  return <Panel>
    <div className="flex items-center gap-4">
      <div className={`grid h-12 w-12 place-items-center rounded-2xl ${colors}`}>
        <AdminIcon name={icon} className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[12px] text-[#697086]">{title}</p>
          <b className="mt-1 block text-[20px] font-semibold">{value}</b>
          <p className="mt-1 text-[11px] text-[#697086]">{note}</p>
        </div>
        </div>
      </Panel>;
}

function Select({ value, options, onChange, prefix }: { value: string; options: string[]; onChange: (value: string) => void; prefix: string }) {
  return <select value={value} onChange={(event) => onChange(event.target.value)} className="!h-10 !min-h-0 !w-full rounded-xl !border !border-[#ffd2ad] bg-white !px-3 !py-0 !text-[12px] !font-normal text-[#ff8d28] !shadow-none outline-none focus:!border-[#ff8d28] focus:ring-2 focus:ring-[#ff8d28]/10">{options.map((item) => <option key={item}>{prefix} {item}</option>)}</select>;
}

function Badge({ text }: { text: string }) {
  const cls = text === "Đã xử lý" ? "bg-emerald-50 text-emerald-700" : text === "Vi phạm" ? "bg-red-50 text-red-600" : "bg-orange-50 text-orange-700";
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${cls}`}>{text}</span>;
}

function Violation({ text }: { text: string }) {
  const cls = text === "Spam" || text === "Quảng cáo trái phép" ? "bg-orange-50 text-orange-600" : text === "Bản quyền" || text === "Ngôn từ thù hận" ? "bg-[#fff3e8] text-[#ff8d28]" : "bg-red-50 text-red-600";
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${cls}`}>{text}</span>;
}

function SeverityBadge({ text }: { text: Severity }) {
  return <span className={text === "Cao" ? "font-semibold text-red-500" : text === "Trung bình" ? "font-semibold text-orange-500" : "font-semibold text-emerald-600"}>{text}</span>;
}

function InfoBlock({ title, rows }: { title: string; rows: string[][] }) {
  return <div className="mt-5 border-t border-[#edf0f5] pt-5">
    <h3 className="text-[14px] font-semibold">{title}</h3>
    <div className="mt-3 space-y-3 text-[12px]">{rows.map(([label, value]) => 
      <div key={label} className="grid grid-cols-[112px_minmax(0,1fr)] gap-3">
        <span className="text-[#697086]">{label}</span>
        <b className="font-medium leading-5">{value}</b>
        </div>)}
        </div>
        </div>;
}

function Toast({ text }: { text: string }) {
  return <div className="fixed right-6 top-20 z-50 rounded-xl border bg-white px-4 py-3 font-medium text-emerald-700 shadow-xl">{text}</div>;
}
