"use client";

import { useMemo, useState } from "react";
import AdminLayout from "../_components/admin-layout";
import { AdminIcon, IconButton } from "../_components/admin-icons";

type NotiType = "Hệ thống" | "Booking" | "Thanh toán" | "Vi phạm" | "Người dùng";
type NotiStatus = "Chưa đọc" | "Đã đọc";

type Notification = {
  id: string;
  type: NotiType;
  title: string;
  body: string;
  status: NotiStatus;
  time: string;
  target: string;
  targetId: string;
  icon: "calendar" | "credit" | "shield" | "user" | "settings";
};

const seed: Notification[] = [
  { id: "NTF_001", type: "Booking", title: "Booking mới #BK20241130", body: "Nguyễn Thị Mai vừa tạo booking chụp ảnh cưới với Minh Tuấn Studio. Giá trị 12.500.000đ.", status: "Chưa đọc", time: "30/11/2024 10:32", target: "Minh Tuấn Studio", targetId: "PHO_1023", icon: "calendar" },
  { id: "NTF_002", type: "Thanh toán", title: "Thanh toán cọc thành công", body: "Trần Văn Phong đã thanh toán cọc 960.000đ cho booking #BK20241124 qua MoMo.", status: "Chưa đọc", time: "30/11/2024 09:18", target: "Trần Văn Phong", targetId: "USR_3345", icon: "credit" },
  { id: "NTF_003", type: "Vi phạm", title: "AI phát hiện nội dung vi phạm", body: "Ảnh portfolio IMG_12987.jpg của Minh Tuấn Studio có điểm nhạy cảm 96%. Cần kiểm duyệt.", status: "Chưa đọc", time: "29/11/2024 23:02", target: "Minh Tuấn Studio", targetId: "PHO_1023", icon: "shield" },
  { id: "NTF_004", type: "Người dùng", title: "Yêu cầu xác minh photographer mới", body: "David Lee (PHO_5078) vừa nộp hồ sơ xác minh. Cần duyệt trong vòng 48 giờ.", status: "Chưa đọc", time: "29/11/2024 20:10", target: "David Lee", targetId: "PHO_5078", icon: "user" },
  { id: "NTF_005", type: "Hệ thống", title: "CPU usage cao bất thường", body: "Server instance i-0abc123def đạt 87% CPU trong 5 phút. Auto-scaling đã được kích hoạt.", status: "Đã đọc", time: "29/11/2024 20:15", target: "SYSTEM", targetId: "SYS", icon: "settings" },
  { id: "NTF_006", type: "Thanh toán", title: "Yêu cầu hoàn tiền mới", body: "Nguyễn Thị Mai yêu cầu hoàn 8.500.000đ cho booking #BK20241201. Lý do: Photographer hủy.", status: "Đã đọc", time: "29/11/2024 18:44", target: "Nguyễn Thị Mai", targetId: "USR_2291", icon: "credit" },
  { id: "NTF_007", type: "Vi phạm", title: "5 báo cáo mới cần xử lý", body: "Có 5 khiếu nại mới từ người dùng liên quan đến chất lượng dịch vụ và hành vi photographer.", status: "Đã đọc", time: "29/11/2024 16:30", target: "Multiple", targetId: "—", icon: "shield" },
  { id: "NTF_008", type: "Booking", title: "Booking #BK20241122 hoàn thành", body: "Lê Quang Huy xác nhận dịch vụ hoàn thành. Đánh giá 5 sao cho May Studio.", status: "Đã đọc", time: "29/11/2024 14:20", target: "May Studio", targetId: "PHO_3344", icon: "calendar" },
  { id: "NTF_009", type: "Hệ thống", title: "Backup hàng ngày hoàn tất", body: "Database backup 2.4GB đã được lưu trữ thành công trên S3 bucket sudion-backup-prod.", status: "Đã đọc", time: "29/11/2024 03:00", target: "SYSTEM", targetId: "SYS", icon: "settings" },
  { id: "NTF_010", type: "Người dùng", title: "Tài khoản bị đăng nhập bất thường", body: "IP 203.113.132.44 thử đăng nhập thất bại 5 lần. Tài khoản đã bị tạm khóa tự động.", status: "Đã đọc", time: "28/11/2024 09:15", target: "Unknown", targetId: "—", icon: "user" },
];

const typeColors: Record<NotiType, string> = {
  "Hệ thống": "bg-[#f0f2f8] text-[#536078]",
  "Booking": "bg-blue-50 text-blue-600",
  "Thanh toán": "bg-emerald-50 text-emerald-700",
  "Vi phạm": "bg-red-50 text-red-600",
  "Người dùng": "bg-[#fff3e8] text-[#ff8d28]",
};

const typeIconBg: Record<NotiType, string> = {
  "Hệ thống": "bg-[#f0f2f8] text-[#536078]",
  "Booking": "bg-blue-50 text-blue-600",
  "Thanh toán": "bg-emerald-50 text-emerald-700",
  "Vi phạm": "bg-red-50 text-red-500",
  "Người dùng": "bg-[#fff3e8] text-[#ff8d28]",
};

export default function NotificationsPage() {
  const [items, setItems] = useState(seed);
  const [query, setQuery] = useState("");
  const [type, setType] = useState<NotiType | "Tất cả">("Tất cả");
  const [status, setStatus] = useState<NotiStatus | "Tất cả">("Tất cả");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [toast, setToast] = useState("");

  const selected = items.find((item) => item.id === selectedId) ?? items[0];
  const unreadCount = items.filter((item) => item.status === "Chưa đọc").length;

  const filtered = useMemo(() => items.filter((item) => {
    const text = [item.title, item.body, item.target, item.type].join(" ").toLowerCase();
    return text.includes(query.toLowerCase())
      && (type === "Tất cả" || item.type === type)
      && (status === "Tất cả" || item.status === status);
  }), [items, query, type, status]);

  function notify(text: string) { setToast(text); setTimeout(() => setToast(""), 1800); }

  function markRead(id: string) {
    setItems((list) => list.map((item) => item.id === id ? { ...item, status: "Đã đọc" } : item));
  }

  function markAllRead() {
    setItems((list) => list.map((item) => ({ ...item, status: "Đã đọc" })));
    notify("Đã đánh dấu tất cả là đã đọc.");
  }

  function openDetail(id: string) {
    setSelectedId(id);
    markRead(id);
    window.requestAnimationFrame(() => setDetailOpen(true));
  }

  function closeDetail() {
    setDetailOpen(false);
    window.setTimeout(() => setSelectedId(null), 220);
  }

  return (
    <AdminLayout active="Thông báo" search={query} onSearch={setQuery}>
      {toast ? <Toast text={toast} /> : null}
      <div className="min-w-0">
        <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-[24px] font-semibold">Thông báo</h1>
              {unreadCount > 0 && <span className="rounded-full bg-red-500 px-2.5 py-0.5 text-[12px] font-semibold text-white">{unreadCount} mới</span>}
            </div>
            <p className="mt-1 text-[13px] text-[#697086]">Trung tâm thông báo và cảnh báo hệ thống</p>
          </div>
          <div className="flex gap-2">
            <button onClick={markAllRead} className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#ffd2ad] bg-white px-4 text-[13px] text-[#ff8d28] hover:bg-[#fff8f1]">
              <AdminIcon name="check" /> Đánh dấu tất cả đã đọc
            </button>
            <button onClick={() => notify("Đã gửi thông báo mẫu.")} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#ff8d28] px-4 text-[13px] font-medium text-white shadow-[0_10px_20px_rgba(255,141,40,0.22)] hover:bg-[#f47f16]">
              <AdminIcon name="add" /> Gửi thông báo
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {(["Tất cả", "Booking", "Thanh toán", "Vi phạm", "Hệ thống"] as const).map((t) => (
            <button key={t} onClick={() => setType(t === "Tất cả" ? "Tất cả" : t as NotiType)} className={`rounded-2xl border p-4 text-left shadow-[0_14px_34px_rgba(12,18,32,0.04)] transition ${type === t ? "border-[#ff8d28] bg-[#fff8f1]" : "border-[#e7e9f1] bg-white hover:bg-[#fafbff]"}`}>
              <p className="text-[12px] text-[#697086]">{t === "Tất cả" ? "Tổng thông báo" : t}</p>
              <b className="mt-1 block text-[20px]">{t === "Tất cả" ? items.length : items.filter((item) => item.type === t).length}</b>
              <p className="mt-1 text-[11px] text-[#697086]">{t === "Tất cả" ? `${unreadCount} chưa đọc` : `${items.filter((item) => item.type === t && item.status === "Chưa đọc").length} chưa đọc`}</p>
            </button>
          ))}
        </div>

        <Panel className="mt-4">
          <div className="mb-3 grid items-center gap-2 xl:grid-cols-[minmax(280px,1fr)_160px_160px_40px]">
            <label className="relative !block min-w-0">
              <AdminIcon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8a93a5]" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} className="!h-10 !min-h-0 w-full rounded-xl border border-[#dfe3ec] bg-white !py-0 !pl-10 !pr-3 !text-[12px] !font-normal outline-none focus:border-[#ff8d28]" placeholder="Tìm tiêu đề, nội dung, đối tượng..." />
            </label>
            <Select value={type} options={["Tất cả", "Hệ thống", "Booking", "Thanh toán", "Vi phạm", "Người dùng"]} onChange={(v) => setType(v as NotiType | "Tất cả")} prefix="Loại:" />
            <Select value={status} options={["Tất cả", "Chưa đọc", "Đã đọc"]} onChange={(v) => setStatus(v as NotiStatus | "Tất cả")} prefix="Trạng thái:" />
            <IconButton label="Đặt lại" icon="filter" size="md" onClick={() => { setQuery(""); setType("Tất cả"); setStatus("Tất cả"); }} />
          </div>

          <div className="divide-y divide-[#edf0f5]">
            {filtered.map((item) => (
              <div key={item.id} onClick={() => openDetail(item.id)} className={`flex cursor-pointer items-start gap-4 py-4 transition hover:bg-[#fff8f1] ${item.status === "Chưa đọc" ? "bg-[#fffcf8]" : "bg-white"}`}>
                <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${typeIconBg[item.type]}`}>
                  <AdminIcon name={item.icon} className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {item.status === "Chưa đọc" && <span className="h-2 w-2 shrink-0 rounded-full bg-[#ff8d28]" />}
                    <b className="truncate text-[13px] font-semibold">{item.title}</b>
                    <span className={`ml-auto shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${typeColors[item.type]}`}>{item.type}</span>
                  </div>
                  <p className="mt-1 text-[12px] leading-5 text-[#697086]">{item.body}</p>
                  <p className="mt-1.5 text-[11px] text-[#8a93a5]">{item.time} · {item.target}</p>
                </div>
                <IconButton label="Xem" icon="eye" onClick={(e) => { e.stopPropagation(); openDetail(item.id); }} />
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="py-16 text-center text-[#697086]">Không tìm thấy thông báo phù hợp.</div>
            )}
          </div>
          <div className="mt-4 flex items-center justify-between text-[12px] text-[#697086]">
            <span>Hiển thị 1 - {filtered.length} của {items.length} thông báo</span>
            <span className="rounded-xl border border-[#dfe3ec] px-3 py-2">20 / trang</span>
          </div>
        </Panel>
      </div>

      {selectedId !== null ? (
        <div className={`fixed inset-0 z-50 bg-[#0f172a]/45 backdrop-blur-[3px] transition-opacity duration-200 ${detailOpen ? "opacity-100" : "opacity-0"}`} onClick={closeDetail}>
          <aside className={`absolute right-0 top-0 h-full w-full min-w-0 overflow-y-auto border-l border-[#e6e9f1] bg-white px-5 py-5 shadow-[-24px_0_48px_rgba(12,18,32,0.2)] transition-transform duration-300 ease-out sm:w-[430px] ${detailOpen ? "translate-x-0" : "translate-x-full"}`} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-semibold">Chi tiết thông báo</h2>
              <IconButton label="Đóng" icon="close" onClick={closeDetail} />
            </div>
            <div className={`mt-5 grid h-16 w-16 place-items-center rounded-2xl ${typeIconBg[selected.type]}`}>
              <AdminIcon name={selected.icon} className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-[15px] font-semibold">{selected.title}</h3>
            <p className="mt-2 text-[13px] leading-6 text-[#697086]">{selected.body}</p>
            <div className="mt-5 space-y-3 border-t border-[#edf0f5] pt-5 text-[12px]">
              <InfoRow label="Loại" value={selected.type} />
              <InfoRow label="Thời gian" value={selected.time} />
              <InfoRow label="Đối tượng" value={`${selected.target} (${selected.targetId})`} />
              <InfoRow label="Trạng thái" value={selected.status} />
            </div>
            <div className="mt-6 flex justify-end gap-2 border-t border-[#edf0f5] pt-5">
              <IconButton label="Đánh dấu đã đọc" icon="check" onClick={() => { markRead(selected.id); notify("Đã đánh dấu đã đọc."); }} />
              <IconButton label="Xóa thông báo" icon="delete" tone="danger" onClick={() => { setItems((list) => list.filter((item) => item.id !== selected.id)); closeDetail(); notify("Đã xóa thông báo."); }} />
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

function Select({ value, options, onChange, prefix = "" }: { value: string; options: string[]; onChange: (v: string) => void; prefix?: string }) {
  return <select value={value} onChange={(e) => onChange(e.target.value)} className="!h-10 !min-h-0 !w-full rounded-xl !border !border-[#ffd2ad] bg-white !px-3 !py-0 !text-[12px] !font-normal text-[#ff8d28] !shadow-none outline-none focus:!border-[#ff8d28] focus:ring-2 focus:ring-[#ff8d28]/10">{options.map((o) => <option key={o} value={o}>{prefix ? `${prefix} ${o}` : o}</option>)}</select>;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return <div className="grid grid-cols-[100px_minmax(0,1fr)] gap-3"><span className="text-[#697086]">{label}</span><b className="font-medium">{value}</b></div>;
}

function Toast({ text }: { text: string }) {
  return <div className="fixed right-6 top-20 z-50 rounded-xl border bg-white px-4 py-3 font-medium text-emerald-700 shadow-xl">{text}</div>;
}
