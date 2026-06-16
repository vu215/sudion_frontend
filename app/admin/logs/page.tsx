"use client";

import { useMemo, useState } from "react";
import AdminLayout from "../_components/admin-layout";
import { AdminIcon, IconButton } from "../_components/admin-icons";

type LogLevel = "INFO" | "WARNING" | "ERROR" | "DEBUG";
type LogCategory = "Auth" | "Booking" | "Payment" | "User" | "System" | "API" | "AI";

type Log = {
  id: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  detail: string;
  ip: string;
  user: string;
  userId: string;
  time: string;
  duration: number;
  statusCode: number;
  trace: string[];
};

const seed: Log[] = [
  { id: "LOG_001", level: "ERROR", category: "Payment", message: "Payment gateway timeout - MoMo", detail: "Giao dịch #TXN_20241130_001 bị timeout sau 30s. Khách hàng Nguyễn Thị Mai không nhận được xác nhận.", ip: "103.1.148.22", user: "Nguyễn Thị Mai", userId: "USR_2291", time: "30/11/2024 10:32:15", duration: 30412, statusCode: 504, trace: ["10:32:15 · Request sent to MoMo gateway", "10:32:45 · Timeout after 30s", "10:32:45 · Rollback transaction initiated"] },
  { id: "LOG_002", level: "WARNING", category: "Auth", message: "Multiple failed login attempts", detail: "IP 203.113.132.44 đã thử đăng nhập thất bại 5 lần liên tiếp trong vòng 2 phút.", ip: "203.113.132.44", user: "Unknown", userId: "—", time: "30/11/2024 09:15:02", duration: 120, statusCode: 401, trace: ["09:13:02 · Login attempt 1 - failed", "09:14:10 · Login attempt 2 - failed", "09:15:02 · Login attempt 5 - account temporarily locked"] },
  { id: "LOG_003", level: "INFO", category: "Booking", message: "Booking #BK20241130 created successfully", detail: "Booking mới được tạo bởi khách hàng Trần Văn Phong. Dịch vụ: Chụp ảnh cưới. Photographer: Minh Tuấn Studio.", ip: "27.72.105.88", user: "Trần Văn Phong", userId: "USR_3345", time: "30/11/2024 08:45:33", duration: 342, statusCode: 201, trace: ["08:45:33 · Booking created", "08:45:33 · Email notification sent", "08:45:34 · Photographer notified"] },
  { id: "LOG_004", level: "ERROR", category: "API", message: "Database connection pool exhausted", detail: "Số lượng kết nối DB đạt giới hạn 100/100. Các request mới đang bị xếp hàng chờ.", ip: "10.0.0.1", user: "SYSTEM", userId: "SYS", time: "30/11/2024 08:30:00", duration: 0, statusCode: 500, trace: ["08:30:00 · Connection pool at 100/100", "08:30:00 · New requests queued", "08:30:05 · Alert sent to admin"] },
  { id: "LOG_005", level: "INFO", category: "AI", message: "AI moderation scan completed", detail: "Quét tự động hoàn tất: 48 nội dung mới. Phát hiện 3 vi phạm mức Cao, 7 Trung bình.", ip: "10.0.0.2", user: "AI_BOT", userId: "BOT_001", time: "29/11/2024 23:00:00", duration: 8420, statusCode: 200, trace: ["23:00:00 · Scan started (48 items)", "23:01:20 · 3 HIGH violations flagged", "23:02:10 · Scan completed"] },
  { id: "LOG_006", level: "WARNING", category: "System", message: "High CPU usage detected", detail: "CPU usage đạt 87% trong 5 phút liên tục. Server instance i-0abc123def đang bị quá tải.", ip: "10.0.0.1", user: "SYSTEM", userId: "SYS", time: "29/11/2024 20:15:44", duration: 300000, statusCode: 200, trace: ["20:10:44 · CPU spike detected (87%)", "20:15:44 · Alert triggered", "20:16:00 · Auto-scaling initiated"] },
  { id: "LOG_007", level: "DEBUG", category: "User", message: "User profile updated - avatar", detail: "Người dùng Lê Quang Huy cập nhật ảnh đại diện mới. File: avatar_USR_4412.jpg (256KB).", ip: "171.225.183.12", user: "Lê Quang Huy", userId: "USR_4412", time: "29/11/2024 19:30:22", duration: 512, statusCode: 200, trace: ["19:30:22 · Upload request received", "19:30:22 · Image validated and resized", "19:30:22 · Profile updated"] },
  { id: "LOG_008", level: "INFO", category: "Payment", message: "Refund processed - BK20241118", detail: "Hoàn tiền 6.300.000đ cho booking #BK20241118. Khách hàng: Đặng Quốc Bảo. Phương thức: VNPAY.", ip: "10.0.0.3", user: "Admin Phương", userId: "ADM_001", time: "29/11/2024 17:22:10", duration: 1240, statusCode: 200, trace: ["17:22:10 · Refund initiated by admin", "17:22:11 · VNPAY refund request sent", "17:22:12 · Refund confirmed"] },
  { id: "LOG_009", level: "ERROR", category: "Auth", message: "JWT token validation failed", detail: "Token hết hạn hoặc không hợp lệ từ IP 14.177.244.88. User bị đăng xuất tự động.", ip: "14.177.244.88", user: "Unknown", userId: "—", time: "29/11/2024 14:55:37", duration: 12, statusCode: 403, trace: ["14:55:37 · Token validation failed", "14:55:37 · Session terminated", "14:55:37 · Client redirected to login"] },
  { id: "LOG_010", level: "INFO", category: "System", message: "Scheduled backup completed", detail: "Backup database hàng ngày hoàn tất. Size: 2.4GB. Lưu tại S3 bucket sudion-backup-prod.", ip: "10.0.0.1", user: "SYSTEM", userId: "SYS", time: "29/11/2024 03:00:15", duration: 45200, statusCode: 200, trace: ["03:00:00 · Backup started", "03:00:15 · 2.4GB exported to S3", "03:00:15 · Backup verified OK"] },
  { id: "LOG_011", level: "WARNING", category: "API", message: "Rate limit approaching - /api/search", detail: "Endpoint /api/search nhận 480/500 req/min từ IP 103.200.22.11. Sắp đạt rate limit.", ip: "103.200.22.11", user: "Unknown", userId: "—", time: "28/11/2024 15:12:08", duration: 0, statusCode: 429, trace: ["15:12:08 · 480/500 req/min threshold reached", "15:12:08 · Warning logged"] },
  { id: "LOG_012", level: "DEBUG", category: "Booking", message: "Booking status transition: Confirmed → In Progress", detail: "Booking #BK20241123 chuyển trạng thái. Photographer: Khang Pham bắt đầu buổi chụp.", ip: "27.79.45.101", user: "Khang Pham", userId: "PHO_1122", time: "28/11/2024 07:05:19", duration: 88, statusCode: 200, trace: ["07:05:19 · Status updated", "07:05:19 · Customer notified via SMS"] },
];

const levelColors: Record<LogLevel, string> = {
  ERROR: "bg-red-50 text-red-600",
  WARNING: "bg-amber-50 text-amber-600",
  INFO: "bg-blue-50 text-blue-600",
  DEBUG: "bg-[#f0f2f8] text-[#536078]",
};

const levelDotColors: Record<LogLevel, string> = {
  ERROR: "bg-red-500",
  WARNING: "bg-amber-400",
  INFO: "bg-blue-500",
  DEBUG: "bg-[#8a93a5]",
};

export default function SystemLogPage() {
  const [items] = useState(seed);
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<LogLevel | "Tất cả">("Tất cả");
  const [category, setCategory] = useState<LogCategory | "Tất cả">("Tất cả");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [toast, setToast] = useState("");

  const selected = items.find((item) => item.id === selectedId) ?? items[0];

  const filtered = useMemo(() => items.filter((item) => {
    const text = [item.id, item.level, item.category, item.message, item.user, item.ip, item.userId].join(" ").toLowerCase();
    return text.includes(query.toLowerCase())
      && (level === "Tất cả" || item.level === level)
      && (category === "Tất cả" || item.category === category);
  }), [items, query, level, category]);

  const stats = {
    total: items.length,
    error: items.filter((item) => item.level === "ERROR").length,
    warning: items.filter((item) => item.level === "WARNING").length,
    info: items.filter((item) => item.level === "INFO").length,
  };

  function notify(text: string) {
    setToast(text);
    setTimeout(() => setToast(""), 1800);
  }

  function openDetail(id: string) {
    setSelectedId(id);
    window.requestAnimationFrame(() => setDetailOpen(true));
  }

  function closeDetail() {
    setDetailOpen(false);
    window.setTimeout(() => setSelectedId(null), 220);
  }

  function exportLogs() {
    const rows = [
      ["id", "level", "category", "message", "user", "ip", "statusCode", "duration_ms", "time"],
      ...filtered.map((item) => [item.id, item.level, item.category, item.message, item.user, item.ip, String(item.statusCode), String(item.duration), item.time]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "system-logs.csv";
    link.click();
    URL.revokeObjectURL(url);
    notify("Đã xuất log thành công.");
  }

  return (
    <AdminLayout active="System Log" search={query} onSearch={setQuery}>
      {toast ? <Toast text={toast} /> : null}
      <div className="min-w-0">
        <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h1 className="text-[24px] font-semibold">System Log</h1>
            <p className="mt-1 text-[13px] text-[#697086]">Theo dõi toàn bộ hoạt động và sự kiện hệ thống</p>
          </div>
          <div className="flex gap-2">
            <button onClick={exportLogs} className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#ffd2ad] bg-white px-4 text-[13px] text-[#ff8d28] hover:bg-[#fff8f1]">
              <AdminIcon name="download" /> Xuất Log
            </button>
            <button onClick={() => notify("Đã xóa log cũ hơn 30 ngày.")} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#ff8d28] px-4 text-[13px] font-medium text-white shadow-[0_10px_20px_rgba(255,141,40,0.22)] hover:bg-[#f47f16]">
              <AdminIcon name="delete" /> Xóa log cũ
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Tổng log hôm nay" value={String(stats.total)} note="↑ 12.4% so với hôm qua" tone="blue" icon="log" />
          <StatCard title="Lỗi (ERROR)" value={String(stats.error)} note="Cần xử lý ngay" tone="red" icon="close" />
          <StatCard title="Cảnh báo (WARNING)" value={String(stats.warning)} note="Theo dõi thêm" tone="amber" icon="filter" />
          <StatCard title="Thông tin (INFO)" value={String(stats.info)} note="Hoạt động bình thường" tone="green" icon="check" />
        </div>

        <Panel className="mt-4">
          <div className="mb-3 grid items-center gap-2 xl:grid-cols-[minmax(280px,1.25fr)_160px_160px_160px_40px]">
            <label className="relative !block min-w-0">
              <AdminIcon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8a93a5]" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} className="!h-10 !min-h-0 w-full rounded-xl border border-[#dfe3ec] bg-white !py-0 !pl-10 !pr-3 !text-[12px] !font-normal outline-none focus:border-[#ff8d28] focus:ring-2 focus:ring-[#ff8d28]/10" placeholder="Tìm theo message, IP, user, ID..." />
            </label>
            <Select value={level} options={["Tất cả", "ERROR", "WARNING", "INFO", "DEBUG"]} onChange={(v) => setLevel(v as LogLevel | "Tất cả")} prefix="Level:" />
            <Select value={category} options={["Tất cả", "Auth", "Booking", "Payment", "User", "System", "API", "AI"]} onChange={(v) => setCategory(v as LogCategory | "Tất cả")} prefix="Module:" />
            <button className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#ffd2ad] bg-white px-3 !text-[12px] !font-normal text-[#ff8d28] hover:bg-[#fff8f1]">
              <AdminIcon name="calendar" className="h-3.5 w-3.5 shrink-0" /> 01/11 - 30/11
            </button>
            <IconButton label="Đặt lại bộ lọc" icon="filter" size="md" onClick={() => { setQuery(""); setLevel("Tất cả"); setCategory("Tất cả"); }} />
          </div>

          <div className="mb-3 flex gap-6 overflow-x-auto border-b border-[#edf0f5]">
            {(["Tất cả", "ERROR", "WARNING", "INFO", "DEBUG"] as const).map((tab) => (
              <button key={tab} onClick={() => setLevel(tab === "Tất cả" ? "Tất cả" : tab)} className={`shrink-0 border-b-2 px-2 py-3 text-[12px] font-medium ${level === tab ? "border-[#ff8d28] text-[#ff8d28]" : "border-transparent text-[#536078]"}`}>
                {tab} {tab === "Tất cả" ? `(${items.length})` : `(${items.filter((item) => item.level === tab).length})`}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#e6e9f1]">
            <table className="w-full min-w-[1080px] text-left text-[12px]">
              <thead className="bg-[#fbfcfe] text-[#536078]">
                <tr>
                  {["Level", "Module", "Message", "User / IP", "Status", "Duration", "Thời gian", ""].map((h) => (
                    <th key={h} className="px-3 py-3 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf0f5]">
                {filtered.map((item) => (
                  <tr key={item.id} onClick={() => openDetail(item.id)} className={`cursor-pointer hover:bg-[#fff8f1] ${selectedId === item.id ? "bg-[#fff3e8]" : "bg-white"}`}>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${levelColors[item.level]}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${levelDotColors[item.level]}`} />
                        {item.level}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="rounded-lg bg-[#f0f2f8] px-2.5 py-1 text-[11px] font-medium text-[#536078]">{item.category}</span>
                    </td>
                    <td className="px-3 py-3">
                      <b className="block font-medium">{item.message}</b>
                      <p className="mt-0.5 max-w-[280px] truncate text-[#697086]">{item.detail}</p>
                    </td>
                    <td className="px-3 py-3">
                      <span className="font-medium">{item.user}</span>
                      <p className="text-[#697086]">{item.ip}</p>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`font-semibold ${item.statusCode >= 500 ? "text-red-500" : item.statusCode >= 400 ? "text-amber-500" : "text-emerald-600"}`}>{item.statusCode}</span>
                    </td>
                    <td className="px-3 py-3 text-[#697086]">{item.duration > 1000 ? `${(item.duration / 1000).toFixed(1)}s` : `${item.duration}ms`}</td>
                    <td className="px-3 py-3 text-[#697086]">{item.time}</td>
                    <td className="px-3 py-3">
                      <IconButton label="Xem chi tiết" icon="eye" onClick={(e) => { e.stopPropagation(); openDetail(item.id); }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center justify-between text-[12px] text-[#697086]">
            <span>Hiển thị 1 - {filtered.length} của {items.length} log</span>
            <span className="rounded-xl border border-[#dfe3ec] px-3 py-2">20 / trang</span>
          </div>
        </Panel>
      </div>

      {selectedId !== null ? (
        <div className={`fixed inset-0 z-50 bg-[#0f172a]/45 backdrop-blur-[3px] transition-opacity duration-200 ${detailOpen ? "opacity-100" : "opacity-0"}`} onClick={closeDetail}>
          <aside className={`absolute right-0 top-0 h-full w-full min-w-0 overflow-y-auto border-l border-[#e6e9f1] bg-white px-5 py-5 shadow-[-24px_0_48px_rgba(12,18,32,0.2)] transition-transform duration-300 ease-out sm:w-[460px] ${detailOpen ? "translate-x-0" : "translate-x-full"}`} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-semibold">Chi tiết Log</h2>
              <IconButton label="Đóng" icon="close" onClick={closeDetail} />
            </div>
            <div className="mt-4 flex items-center gap-3">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${levelColors[selected.level]}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${levelDotColors[selected.level]}`} />
                {selected.level}
              </span>
              <span className="rounded-lg bg-[#f0f2f8] px-2.5 py-1 text-[11px] font-medium text-[#536078]">{selected.category}</span>
              <span className="text-[12px] text-[#697086]">{selected.id}</span>
            </div>
            <h3 className="mt-5 text-[14px] font-semibold">{selected.message}</h3>
            <p className="mt-2 text-[12px] leading-5 text-[#536078]">{selected.detail}</p>
            <div className="mt-5 border-t border-[#edf0f5] pt-5">
              <h3 className="text-[14px] font-semibold">Thông tin kỹ thuật</h3>
              <div className="mt-3 space-y-3 text-[12px]">
                <InfoRow label="Log ID" value={selected.id} />
                <InfoRow label="Thời gian" value={selected.time} />
                <InfoRow label="User" value={`${selected.user} (${selected.userId})`} />
                <InfoRow label="IP Address" value={selected.ip} />
                <InfoRow label="Status Code" value={String(selected.statusCode)} />
                <InfoRow label="Duration" value={selected.duration > 1000 ? `${(selected.duration / 1000).toFixed(1)}s` : `${selected.duration}ms`} />
              </div>
            </div>
            <div className="mt-5 border-t border-[#edf0f5] pt-5">
              <h3 className="text-[14px] font-semibold">Stack Trace</h3>
              <div className="mt-3 rounded-xl bg-[#f7f8fb] p-3">
                {selected.trace.map((line) => (
                  <p key={line} className="font-mono text-[11px] leading-6 text-[#536078]">&gt; {line}</p>
                ))}
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2 border-t border-[#edf0f5] pt-5">
              <IconButton label="Copy log" icon="copy" onClick={() => notify("Đã copy log.")} />
              <IconButton label="Đánh dấu đã xử lý" icon="check" onClick={() => notify("Đã đánh dấu xử lý.")} />
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

function StatCard({ title, value, note, tone, icon }: { title: string; value: string; note: string; tone: "blue" | "red" | "amber" | "green"; icon: "log" | "close" | "filter" | "check" }) {
  const cls = tone === "red" ? "bg-red-50 text-red-500" : tone === "amber" ? "bg-amber-50 text-amber-500" : tone === "green" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600";
  return (
    <Panel>
      <div className="flex items-center gap-4">
        <div className={`grid h-12 w-12 place-items-center rounded-2xl ${cls}`}>
          <AdminIcon name={icon} className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[12px] text-[#697086]">{title}</p>
          <b className="mt-1 block text-[20px] font-semibold">{value}</b>
          <p className="mt-1 text-[11px] text-[#697086]">{note}</p>
        </div>
      </div>
    </Panel>
  );
}

function Select({ value, options, onChange, prefix = "" }: { value: string; options: string[]; onChange: (v: string) => void; prefix?: string }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="!h-10 !min-h-0 !w-full rounded-xl !border !border-[#ffd2ad] bg-white !px-3 !py-0 !text-[12px] !font-normal text-[#ff8d28] !shadow-none outline-none focus:!border-[#ff8d28] focus:ring-2 focus:ring-[#ff8d28]/10">
      {options.map((o) => <option key={o} value={o}>{prefix ? `${prefix} ${o}` : o}</option>)}
    </select>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-3">
      <span className="text-[#697086]">{label}</span>
      <b className="font-medium">{value}</b>
    </div>
  );
}

function Toast({ text }: { text: string }) {
  return <div className="fixed right-6 top-20 z-50 rounded-xl border bg-white px-4 py-3 font-medium text-emerald-700 shadow-xl">{text}</div>;
}
