"use client";

import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../_components/admin-layout";
import { AdminIcon, IconButton } from "../_components/admin-icons";
import { api } from "@/lib/api";

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
  const [items, setItems] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<LogLevel | "Tất cả">("Tất cả");
  const [category, setCategory] = useState<LogCategory | "Tất cả">("Tất cả");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [stats, setStats] = useState({ total: 0, error: 0, warning: 0, info: 0 });

  useEffect(() => {
    loadLogs();
    loadStats();
  }, [level, category]);

  async function loadLogs() {
    setLoading(true);
    try {
      const params: Record<string, any> = { page: 1, pageSize: 100 };
      if (level !== "Tất cả") params.level = level;
      if (category !== "Tất cả") params.category = category;
      
      const result = await api.logs.getAll(params);
      if (result.success && result.data) {
        setItems(result.data);
      }
    } catch (error) {
      console.error("Failed to load logs:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    try {
      const result = await api.logs.getStats();
      if (result.success && result.data) {
        setStats(result.data);
      }
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  }

  const selected = items.find((item) => item.id === selectedId) ?? items[0];

  const filtered = useMemo(() => items.filter((item) => {
    const text = [item.id, item.level, item.category, item.message, item.user, item.ip, item.userId].join(" ").toLowerCase();
    return text.includes(query.toLowerCase());
  }), [items, query]);

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

  async function deleteOldLogs() {
    try {
      const result = await api.logs.deleteOld(30);
      if (result.success) {
        notify(result.message || "Đã xóa log cũ hơn 30 ngày.");
        loadLogs();
        loadStats();
      }
    } catch (error) {
      notify("Lỗi khi xóa log.");
    }
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
            <button onClick={deleteOldLogs} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#ff8d28] px-4 text-[13px] font-medium text-white shadow-[0_10px_20px_rgba(255,141,40,0.22)] hover:bg-[#f47f16]">
              <AdminIcon name="delete" /> Xóa log cũ
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Tổng log hôm nay" value={String(stats.total)} note="Hoạt động hệ thống" tone="blue" icon="log" />
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
              <AdminIcon name="calendar" className="h-3.5 w-3.5 shrink-0" /> Hôm nay
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

          {loading ? (
            <div className="py-12 text-center text-[#697086]">Đang tải...</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-[#697086]">Không có log nào</div>
          ) : (
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
          )}
          <div className="mt-4 flex items-center justify-between text-[12px] text-[#697086]">
            <span>Hiển thị 1 - {filtered.length} của {items.length} log</span>
            <span className="rounded-xl border border-[#dfe3ec] px-3 py-2">100 / trang</span>
          </div>
        </Panel>
      </div>

      {selectedId !== null && selected ? (
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
            {selected.trace && selected.trace.length > 0 && (
              <div className="mt-5 border-t border-[#edf0f5] pt-5">
                <h3 className="text-[14px] font-semibold">Device Info</h3>
                <div className="mt-3 rounded-xl bg-[#f7f8fb] p-3">
                  {selected.trace.map((line, i) => (
                    <p key={i} className="font-mono text-[11px] leading-6 text-[#536078]">&gt; {line}</p>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-6 flex justify-end gap-2 border-t border-[#edf0f5] pt-5">
              <IconButton label="Copy log" icon="copy" onClick={() => notify("Đã copy log.")} />
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
