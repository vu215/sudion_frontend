"use client";

import { useMemo, useState } from "react";
import AdminLayout from "../_components/admin-layout";
import { AdminIcon, IconButton } from "../_components/admin-icons";

type ReportStatus = "Chờ xử lý" | "Đang xem xét" | "Đã xử lý" | "Từ chối";
type ReportCategory = "Chất lượng dịch vụ" | "Hành vi không phù hợp" | "Gian lận" | "Bản quyền" | "Spam" | "Khác";

type Report = {
  id: string;
  reporter: string;
  reporterAvatar: string;
  reporterId: string;
  target: string;
  targetType: "Photographer" | "Booking" | "User";
  targetId: string;
  category: ReportCategory;
  description: string;
  evidence: string[];
  status: ReportStatus;
  priority: "Cao" | "Trung bình" | "Thấp";
  createdAt: string;
  updatedAt: string;
  adminNote: string;
  history: string[];
};

const avatars = ["/Overlay+Shadow.png", "/logo_sudion.jpg", "/screen%201.png", "/Overlay+Border+Shadow.png", "/logo_sudion_remove.png"];

const seed: Report[] = [
  { id: "RPT_001", reporter: "Nguyễn Thu Hà", reporterAvatar: avatars[1], reporterId: "USR_1122", target: "Minh Tuấn Studio", targetType: "Photographer", targetId: "PHO_1023", category: "Chất lượng dịch vụ", description: "Photographer giao ảnh trễ hơn 2 tuần so với hợp đồng. Ảnh chất lượng thấp, nhiều ảnh bị mờ không chỉnh sửa được. Đã liên hệ nhưng không phản hồi.", evidence: [avatars[0], avatars[2]], status: "Chờ xử lý", priority: "Cao", createdAt: "30/11/2024 10:15", updatedAt: "30/11/2024 10:15", adminNote: "", history: ["30/11/2024 10:15 · Báo cáo được tạo"] },
  { id: "RPT_002", reporter: "Trần Minh Quân", reporterAvatar: avatars[0], reporterId: "USR_2233", target: "Khang Pham", targetType: "Photographer", targetId: "PHO_1122", category: "Gian lận", description: "Photographer yêu cầu thanh toán ngoài nền tảng để tránh phí. Đã gửi ảnh screenshot cuộc trò chuyện.", evidence: [avatars[1], avatars[3]], status: "Đang xem xét", priority: "Cao", createdAt: "29/11/2024 15:30", updatedAt: "30/11/2024 09:00", adminNote: "Đang liên hệ photographer để làm rõ.", history: ["29/11/2024 15:30 · Báo cáo được tạo", "30/11/2024 09:00 · Admin đang xem xét"] },
  { id: "RPT_003", reporter: "Lê Phương Anh", reporterAvatar: avatars[2], reporterId: "USR_3344", target: "#BK20241124", targetType: "Booking", targetId: "BK20241124", category: "Hành vi không phù hợp", description: "Photographer có hành vi thiếu chuyên nghiệp trong buổi chụp. Nói chuyện thiếu tôn trọng và từ chối thực hiện các yêu cầu hợp lý.", evidence: [], status: "Đã xử lý", priority: "Trung bình", createdAt: "28/11/2024 18:20", updatedAt: "29/11/2024 12:00", adminNote: "Đã cảnh cáo photographer và ghi nhận vào hồ sơ.", history: ["28/11/2024 18:20 · Báo cáo được tạo", "29/11/2024 10:00 · Admin xem xét", "29/11/2024 12:00 · Đã xử lý - cảnh cáo photographer"] },
  { id: "RPT_004", reporter: "Phạm Quốc Huy", reporterAvatar: avatars[3], reporterId: "USR_4455", target: "May Studio", targetType: "Photographer", targetId: "PHO_3344", category: "Spam", description: "Studio liên tục gửi tin nhắn quảng cáo dịch vụ mặc dù đã yêu cầu dừng nhiều lần.", evidence: [avatars[4]], status: "Chờ xử lý", priority: "Thấp", createdAt: "28/11/2024 11:05", updatedAt: "28/11/2024 11:05", adminNote: "", history: ["28/11/2024 11:05 · Báo cáo được tạo"] },
  { id: "RPT_005", reporter: "Võ Thị Lan", reporterAvatar: avatars[4], reporterId: "USR_5566", target: "Elena Studio", targetType: "Photographer", targetId: "PHO_2045", category: "Bản quyền", description: "Studio đăng ảnh của tôi lên mạng xã hội của họ mà không có sự đồng ý. Đã gửi bằng chứng ảnh gốc và watermark.", evidence: [avatars[0], avatars[1], avatars[2]], status: "Đang xem xét", priority: "Cao", createdAt: "27/11/2024 14:45", updatedAt: "28/11/2024 09:30", adminNote: "Đang xác minh quyền sở hữu ảnh.", history: ["27/11/2024 14:45 · Báo cáo được tạo", "28/11/2024 09:30 · Đang xem xét bằng chứng"] },
  { id: "RPT_006", reporter: "Nguyễn Bảo Long", reporterAvatar: avatars[1], reporterId: "USR_6677", target: "David Lee", targetType: "Photographer", targetId: "PHO_5078", category: "Chất lượng dịch vụ", description: "Photographer hủy booking vào phút chót (2 giờ trước buổi chụp) mà không có lý do chính đáng.", evidence: [], status: "Từ chối", priority: "Thấp", createdAt: "26/11/2024 09:00", updatedAt: "27/11/2024 10:00", adminNote: "Báo cáo từ chối do đây là trường hợp hủy hợp lệ theo chính sách.", history: ["26/11/2024 09:00 · Báo cáo được tạo", "27/11/2024 10:00 · Từ chối - theo chính sách hủy"] },
];

const statusColors: Record<ReportStatus, string> = {
  "Chờ xử lý": "bg-orange-50 text-orange-700",
  "Đang xem xét": "bg-blue-50 text-blue-700",
  "Đã xử lý": "bg-emerald-50 text-emerald-700",
  "Từ chối": "bg-[#f0f2f8] text-[#536078]",
};

export default function ReportsPage() {
  const [items, setItems] = useState(seed);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ReportStatus | "Tất cả">("Tất cả");
  const [priority, setPriority] = useState("Tất cả");
  const [category, setCategory] = useState("Tất cả");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [toast, setToast] = useState("");

  const selected = items.find((item) => item.id === selectedId) ?? items[0];

  const filtered = useMemo(() => items.filter((item) => {
    const text = [item.id, item.reporter, item.target, item.category, item.description, item.status].join(" ").toLowerCase();
    return text.includes(query.toLowerCase())
      && (status === "Tất cả" || item.status === status)
      && (priority === "Tất cả" || item.priority === priority)
      && (category === "Tất cả" || item.category === category);
  }), [items, query, status, priority, category]);

  function notify(text: string) { setToast(text); setTimeout(() => setToast(""), 1800); }

  function patch(id: string, value: Partial<Report>) {
    setItems((list) => list.map((item) => item.id === id ? {
      ...item, ...value,
      history: value.status ? [...item.history, `15/06/2026 · ${value.status}`] : item.history,
      updatedAt: "15/06/2026",
    } : item));
  }

  function openDetail(id: string) {
    const report = items.find((item) => item.id === id);
    setSelectedId(id);
    setAdminNote(report?.adminNote ?? "");
    window.requestAnimationFrame(() => setDetailOpen(true));
  }

  function closeDetail() {
    setDetailOpen(false);
    window.setTimeout(() => setSelectedId(null), 220);
  }

  return (
    <AdminLayout active="Report / Khiếu nại" search={query} onSearch={setQuery}>
      {toast ? <Toast text={toast} /> : null}
      <div className="min-w-0">
        <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h1 className="text-[24px] font-semibold">Report / Khiếu nại</h1>
            <p className="mt-1 text-[13px] text-[#697086]">Quản lý khiếu nại và báo cáo từ người dùng</p>
          </div>
          <div className="flex gap-2">
            <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#ffd2ad] bg-white px-4 text-[13px] text-[#ff8d28] hover:bg-[#fff8f1]">
              <AdminIcon name="download" /> Xuất Excel
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Tổng khiếu nại" value={String(items.length)} note="↑ 8.3% so với tháng trước" tone="orange" />
          <StatCard title="Chờ xử lý" value={String(items.filter((i) => i.status === "Chờ xử lý").length)} note="Cần xử lý sớm" tone="amber" />
          <StatCard title="Đang xem xét" value={String(items.filter((i) => i.status === "Đang xem xét").length)} note="Đang điều tra" tone="blue" />
          <StatCard title="Đã xử lý" value={String(items.filter((i) => i.status === "Đã xử lý").length)} note="Hoàn tất" tone="green" />
        </div>

        <Panel className="mt-4">
          <div className="mb-3 flex gap-6 overflow-x-auto border-b border-[#edf0f5]">
            {(["Tất cả", "Chờ xử lý", "Đang xem xét", "Đã xử lý", "Từ chối"] as const).map((tab) => (
              <button key={tab} onClick={() => setStatus(tab)} className={`shrink-0 border-b-2 px-2 py-3 text-[12px] font-medium ${status === tab ? "border-[#ff8d28] text-[#ff8d28]" : "border-transparent text-[#536078]"}`}>
                {tab} ({tab === "Tất cả" ? items.length : items.filter((i) => i.status === tab).length})
              </button>
            ))}
          </div>
          <div className="mb-3 grid items-center gap-2 xl:grid-cols-[minmax(280px,1.25fr)_180px_150px_150px_40px]">
            <label className="relative !block min-w-0">
              <AdminIcon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8a93a5]" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} className="!h-10 !min-h-0 w-full rounded-xl border border-[#dfe3ec] bg-white !py-0 !pl-10 !pr-3 !text-[12px] !font-normal outline-none focus:border-[#ff8d28]" placeholder="Tìm người báo cáo, đối tượng, ID..." />
            </label>
            <Select value={category} options={["Tất cả", "Chất lượng dịch vụ", "Hành vi không phù hợp", "Gian lận", "Bản quyền", "Spam", "Khác"]} onChange={setCategory} prefix="Loại:" />
            <Select value={priority} options={["Tất cả", "Cao", "Trung bình", "Thấp"]} onChange={setPriority} prefix="Ưu tiên:" />
            <button className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#ffd2ad] bg-white px-3 !text-[12px] !font-normal text-[#ff8d28]">
              <AdminIcon name="calendar" className="h-3.5 w-3.5 shrink-0" /> Khoảng ngày
            </button>
            <IconButton label="Đặt lại" icon="filter" size="md" onClick={() => { setQuery(""); setStatus("Tất cả"); setPriority("Tất cả"); setCategory("Tất cả"); }} />
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#e6e9f1]">
            <table className="w-full min-w-[1040px] text-left text-[12px]">
              <thead className="bg-[#fbfcfe] text-[#536078]">
                <tr>{["", "Người báo cáo", "Đối tượng", "Loại khiếu nại", "Ưu tiên", "Trạng thái", "Ngày tạo", "Cập nhật", ""].map((h, i) => <th key={i} className="px-3 py-3 font-semibold">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-[#edf0f5]">
                {filtered.map((item) => (
                  <tr key={item.id} onClick={() => openDetail(item.id)} className={`cursor-pointer hover:bg-[#fff8f1] ${selectedId === item.id ? "bg-[#fff3e8]" : "bg-white"}`}>
                    <td className="px-3 py-3"><input type="checkbox" onClick={(e) => e.stopPropagation()} className="h-4 w-4 rounded border-[#d6dbe7] accent-[#ff8d28]" /></td>
                    <td className="px-3 py-3"><div className="flex items-center gap-3"><img src={item.reporterAvatar} alt="" className="h-9 w-9 rounded-full object-cover" /><div><b className="font-semibold">{item.reporter}</b><p className="text-[#697086]">{item.reporterId}</p></div></div></td>
                    <td className="px-3 py-3"><b className="font-semibold">{item.target}</b><p className="text-[#697086]">{item.targetType} · {item.targetId}</p></td>
                    <td className="px-3 py-3"><span className="rounded-lg bg-[#f0f2f8] px-2.5 py-1 text-[11px]">{item.category}</span></td>
                    <td className="px-3 py-3"><PriorityBadge text={item.priority} /></td>
                    <td className="px-3 py-3"><span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${statusColors[item.status]}`}>{item.status}</span></td>
                    <td className="px-3 py-3 text-[#697086]">{item.createdAt}</td>
                    <td className="px-3 py-3 text-[#697086]">{item.updatedAt}</td>
                    <td className="px-3 py-3"><div className="flex gap-2"><IconButton label="Xem" icon="eye" onClick={(e) => { e.stopPropagation(); openDetail(item.id); }} /></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center justify-between text-[12px] text-[#697086]">
            <span>Hiển thị 1 - {filtered.length} của {items.length} báo cáo</span>
            <span className="rounded-xl border border-[#dfe3ec] px-3 py-2">10 / trang</span>
          </div>
        </Panel>
      </div>

      {selectedId !== null ? (
        <div className={`fixed inset-0 z-50 bg-[#0f172a]/45 backdrop-blur-[3px] transition-opacity duration-200 ${detailOpen ? "opacity-100" : "opacity-0"}`} onClick={closeDetail}>
          <aside className={`absolute right-0 top-0 h-full w-full min-w-0 overflow-y-auto border-l border-[#e6e9f1] bg-white px-5 py-5 shadow-[-24px_0_48px_rgba(12,18,32,0.2)] transition-transform duration-300 ease-out sm:w-[460px] ${detailOpen ? "translate-x-0" : "translate-x-full"}`} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-semibold">Chi tiết khiếu nại</h2>
              <IconButton label="Đóng" icon="close" onClick={closeDetail} />
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${statusColors[selected.status]}`}>{selected.status}</span>
              <PriorityBadge text={selected.priority} />
              <span className="text-[12px] text-[#697086]">{selected.id}</span>
            </div>
            <div className="mt-5 flex items-center gap-3 border-b border-[#edf0f5] pb-5">
              <img src={selected.reporterAvatar} alt="" className="h-12 w-12 rounded-full object-cover" />
              <div>
                <b className="text-[14px]">{selected.reporter}</b>
                <p className="text-[12px] text-[#697086]">{selected.reporterId}</p>
                <p className="mt-1 text-[12px] text-[#697086]">Ngày tạo: {selected.createdAt}</p>
              </div>
            </div>
            <div className="mt-5 space-y-3 text-[12px]">
              <InfoRow label="Đối tượng" value={`${selected.target} (${selected.targetId})`} />
              <InfoRow label="Loại đối tượng" value={selected.targetType} />
              <InfoRow label="Loại khiếu nại" value={selected.category} />
            </div>
            <div className="mt-5 border-t border-[#edf0f5] pt-5">
              <h3 className="text-[13px] font-semibold">Mô tả khiếu nại</h3>
              <p className="mt-2 text-[12px] leading-6 text-[#536078]">{selected.description}</p>
            </div>
            {selected.evidence.length > 0 && (
              <div className="mt-5 border-t border-[#edf0f5] pt-5">
                <h3 className="text-[13px] font-semibold">Bằng chứng đính kèm</h3>
                <div className="mt-3 grid grid-cols-3 gap-2">{selected.evidence.map((img) => <img key={img} src={img} alt="" className="h-20 w-full rounded-xl object-cover" />)}</div>
              </div>
            )}
            <div className="mt-5 border-t border-[#edf0f5] pt-5">
              <h3 className="text-[13px] font-semibold">Lịch sử xử lý</h3>
              <div className="mt-3 space-y-2 text-[12px] text-[#536078]">{selected.history.map((h) => <p key={h}>○ {h}</p>)}</div>
            </div>
            <div className="mt-5 border-t border-[#edf0f5] pt-5">
              <h3 className="text-[13px] font-semibold">Ghi chú Admin</h3>
              <textarea value={adminNote} onChange={(e) => setAdminNote(e.target.value)} className="mt-2 w-full min-h-[80px] rounded-xl border border-[#dfe3ec] p-3 text-[12px] outline-none focus:border-[#ff8d28]" placeholder="Nhập ghi chú xử lý..." />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button onClick={() => { patch(selected.id, { status: "Đang xem xét", adminNote }); notify("Đang xem xét."); }} className="h-10 rounded-xl border border-blue-200 bg-blue-50 text-[12px] font-medium text-blue-700 hover:bg-blue-100">Đang xem xét</button>
              <button onClick={() => { patch(selected.id, { status: "Đã xử lý", adminNote }); notify("Đã xử lý khiếu nại."); }} className="h-10 rounded-xl border border-emerald-200 bg-emerald-50 text-[12px] font-medium text-emerald-700 hover:bg-emerald-100">Đã xử lý</button>
              <button onClick={() => { patch(selected.id, { status: "Từ chối", adminNote }); notify("Đã từ chối khiếu nại."); }} className="h-10 rounded-xl border border-[#dfe3ec] bg-white text-[12px] font-medium text-[#536078] hover:bg-[#f7f8fb]">Từ chối</button>
              <button onClick={() => { patch(selected.id, { adminNote }); notify("Đã lưu ghi chú."); }} className="h-10 rounded-xl bg-[#ff8d28] text-[12px] font-medium text-white hover:bg-[#f47f16]">Lưu ghi chú</button>
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

function StatCard({ title, value, note, tone }: { title: string; value: string; note: string; tone: "orange" | "amber" | "blue" | "green" }) {
  const cls = tone === "orange" ? "bg-[#fff3e8] text-[#ff8d28]" : tone === "amber" ? "bg-amber-50 text-amber-500" : tone === "blue" ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600";
  return <Panel><div className="flex items-center gap-4"><div className={`grid h-12 w-12 place-items-center rounded-2xl text-[18px] ${cls}`}><AdminIcon name="policy" className="h-5 w-5" /></div><div><p className="text-[12px] text-[#697086]">{title}</p><b className="mt-1 block text-[20px] font-semibold">{value}</b><p className="mt-1 text-[11px] text-[#697086]">{note}</p></div></div></Panel>;
}

function Select({ value, options, onChange, prefix = "" }: { value: string; options: string[]; onChange: (v: string) => void; prefix?: string }) {
  return <select value={value} onChange={(e) => onChange(e.target.value)} className="!h-10 !min-h-0 !w-full rounded-xl !border !border-[#ffd2ad] bg-white !px-3 !py-0 !text-[12px] !font-normal text-[#ff8d28] !shadow-none outline-none focus:!border-[#ff8d28]">{options.map((o) => <option key={o} value={o}>{prefix ? `${prefix} ${o}` : o}</option>)}</select>;
}

function PriorityBadge({ text }: { text: string }) {
  return <span className={`font-semibold text-[12px] ${text === "Cao" ? "text-red-500" : text === "Trung bình" ? "text-amber-500" : "text-emerald-600"}`}>{text}</span>;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-3"><span className="text-[#697086]">{label}</span><b className="font-medium">{value}</b></div>;
}

function Toast({ text }: { text: string }) {
  return <div className="fixed right-6 top-20 z-50 rounded-xl border bg-white px-4 py-3 font-medium text-emerald-700 shadow-xl">{text}</div>;
}
