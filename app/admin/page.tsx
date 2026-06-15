"use client";

import { useMemo, useState } from "react";
import AdminLayout from "./_components/admin-layout";
import { AdminIcon, IconButton } from "./_components/admin-icons";

type BookingStatus = "Chờ xác nhận" | "Đã xác nhận" | "Đang thực hiện" | "Hoàn thành" | "Đã hủy";
type Booking = { id: string; customer: string; service: string; photographer: string; date: string; amount: number; status: BookingStatus; avatar: string };
type Refund = { id: string; customer: string; bookingId: string; amount: number; date: string; status: "Chờ duyệt" | "Đã duyệt" | "Từ chối"; avatar: string };
type Activity = { title: string; subtitle: string; tone: "orange" | "green" | "red" };

const avatarPool = ["/Overlay+Shadow.png", "/logo_sudion.jpg", "/screen%201.png", "/Overlay+Border+Shadow.png"];

const bookings: Booking[] = [
  { id: "BK20241130", customer: "Nguyễn Hoàng Nam", service: "Chụp ảnh cưới", photographer: "Minh Tuấn Studio", date: "2024-11-30", amount: 12450000, status: "Chờ xác nhận", avatar: avatarPool[0] },
  { id: "BK20241129", customer: "Trần Thu Hà", service: "Chụp ảnh đôi", photographer: "Elena Studio", date: "2024-11-29", amount: 3200000, status: "Chờ xác nhận", avatar: avatarPool[1] },
  { id: "BK20241128", customer: "Lê Quang Huy", service: "Chụp ảnh kỷ yếu", photographer: "Khang Pham", date: "2024-11-28", amount: 2800000, status: "Chờ xác nhận", avatar: avatarPool[2] },
  { id: "BK20241127", customer: "Phạm Thanh Tâm", service: "Chụp ảnh đơn", photographer: "May Studio", date: "2024-11-27", amount: 1500000, status: "Đã xác nhận", avatar: avatarPool[3] },
  { id: "BK20241126", customer: "Vũ Minh Anh", service: "Chụp sự kiện", photographer: "ABC Studio", date: "2024-11-26", amount: 8900000, status: "Đang thực hiện", avatar: avatarPool[0] },
  { id: "BK20241124", customer: "Lê Phương Anh", service: "Travel", photographer: "Sun Studio", date: "2024-11-24", amount: 4600000, status: "Hoàn thành", avatar: avatarPool[1] },
  { id: "BK20241120", customer: "Nguyễn Thị Mai", service: "Chụp ảnh cưới", photographer: "Minh Tuấn Studio", date: "2024-11-20", amount: 18500000, status: "Hoàn thành", avatar: avatarPool[2] },
  { id: "BK20241115", customer: "Đặng Quốc Bảo", service: "Sự kiện", photographer: "May Studio", date: "2024-11-15", amount: 6300000, status: "Đã hủy", avatar: avatarPool[3] },
  { id: "BK20241018", customer: "Hoàng Tú Anh", service: "Chụp đơn", photographer: "Elena Studio", date: "2024-10-18", amount: 4200000, status: "Hoàn thành", avatar: avatarPool[0] },
  { id: "BK20240912", customer: "Nguyễn Gia Hân", service: "Chụp ảnh cưới", photographer: "Khang Pham", date: "2024-09-12", amount: 16200000, status: "Hoàn thành", avatar: avatarPool[1] },
  { id: "BK20240822", customer: "Võ Minh Khoa", service: "Chụp sản phẩm", photographer: "ABC Studio", date: "2024-08-22", amount: 9800000, status: "Đã xác nhận", avatar: avatarPool[2] },
  { id: "BK20240718", customer: "Linh Đan", service: "Kỷ yếu", photographer: "May Studio", date: "2024-07-18", amount: 7600000, status: "Hoàn thành", avatar: avatarPool[3] },
  { id: "BK20240614", customer: "Phạm Quốc Huy", service: "Travel", photographer: "Sun Studio", date: "2024-06-14", amount: 5200000, status: "Đã xác nhận", avatar: avatarPool[0] },
  { id: "BK20240509", customer: "Trần Bảo Ngọc", service: "Chụp đơn", photographer: "Elena Studio", date: "2024-05-09", amount: 2500000, status: "Hoàn thành", avatar: avatarPool[1] },
];

const refunds: Refund[] = [
  { id: "RF20241201", customer: "Nguyễn Thị Mai", bookingId: "BK20241201", amount: 8500000, date: "2024-11-30", status: "Chờ duyệt", avatar: avatarPool[0] },
  { id: "RF20241128", customer: "Trần Văn Phong", bookingId: "BK20241128", amount: 3200000, date: "2024-11-28", status: "Chờ duyệt", avatar: avatarPool[1] },
  { id: "RF20241125", customer: "Lê Nhật Minh", bookingId: "BK20241125", amount: 2000000, date: "2024-11-25", status: "Chờ duyệt", avatar: avatarPool[2] },
  { id: "RF20241120", customer: "Phạm Hồng Ngọc", bookingId: "BK20241120", amount: 4750000, date: "2024-11-20", status: "Chờ duyệt", avatar: avatarPool[3] },
  { id: "RF20241118", customer: "Đặng Quốc Bảo", bookingId: "BK20241118", amount: 6300000, date: "2024-11-18", status: "Chờ duyệt", avatar: avatarPool[0] },
];

const reports = [
  ["Báo cáo từ Nguyễn Thu Hà", "Liên quan booking #BK20241130", "10 phút trước"],
  ["Báo cáo từ Trần Minh Quân", "Liên quan photographer #PH125", "1 giờ trước"],
  ["Báo cáo từ Lê Phương Anh", "Liên quan booking #BK20241124", "2 giờ trước"],
];

const activities: Activity[] = [
  { title: "Admin Phương duyệt hoàn tiền cho booking #BK20241115", subtitle: "15 phút trước", tone: "green" },
  { title: "Photographer Minh Tuấn Studio đã được xác minh", subtitle: "1 giờ trước", tone: "green" },
  { title: "Có 5 booking mới được tạo", subtitle: "2 giờ trước", tone: "orange" },
  { title: "AI đã phát hiện 12 nội dung cần kiểm duyệt", subtitle: "3 giờ trước", tone: "red" },
];

const statusColors: Record<BookingStatus, string> = {
  "Chờ xác nhận": "#fbbf24",
  "Đã xác nhận": "#35b86f",
  "Đang thực hiện": "#5799ee",
  "Hoàn thành": "#bd4bd3",
  "Đã hủy": "#ef4455",
};

const periods = [
  { label: "Tháng 11/2024", start: "2024-11-01", end: "2024-11-30" },
  { label: "Tháng 10/2024", start: "2024-10-01", end: "2024-10-31" },
  { label: "Quý 4/2024", start: "2024-10-01", end: "2024-12-31" },
  { label: "Năm 2024", start: "2024-01-01", end: "2024-12-31" },
];

export default function AdminDashboardPage() {
  const [periodIndex, setPeriodIndex] = useState(0);
  const [chartMode, setChartMode] = useState<"month" | "day">("month");
  const period = periods[periodIndex];
  const filteredBookings = useMemo(() => bookings.filter((item) => inRange(item.date, period.start, period.end)), [period]);
  const filteredRefunds = useMemo(() => refunds.filter((item) => inRange(item.date, period.start, period.end)), [period]);
  const chartData = useMemo(() => buildChartData(chartMode, period, chartMode === "month" ? bookings : filteredBookings), [chartMode, filteredBookings, period]);
  const totalRevenue = filteredBookings.reduce((sum, item) => sum + item.amount, 0);
  const confirmedBookings = filteredBookings.filter((item) => item.status === "Chờ xác nhận");
  const kpis = [
    { title: "Tổng người dùng", value: formatNumber(12548 + filteredBookings.length * 2), trend: "12.5%", tone: "orange", icon: "users" },
    { title: "Photographer", value: formatNumber(1248), trend: "8.7%", tone: "orange", icon: "camera" },
    { title: "Tổng booking", value: formatNumber(filteredBookings.length), trend: "15.3%", tone: "green", icon: "calendar" },
    { title: "Doanh thu (VNĐ)", value: money(totalRevenue), trend: "18.6%", tone: "orange", icon: "dollar" },
  ];

  function exportCsv() {
    const rows = [
      ["metric", "value"],
      ["period", period.label],
      ["bookings", String(filteredBookings.length)],
      ["revenue", String(totalRevenue)],
      ["refund_requests", String(filteredRefunds.length)],
      [],
      ["booking_id", "customer", "service", "photographer", "date", "status", "amount"],
      ...filteredBookings.map((item) => [item.id, item.customer, item.service, item.photographer, item.date, item.status, String(item.amount)]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `pixora-dashboard-${period.start}-${period.end}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AdminLayout active="Dashboard">
      <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-[24px] font-semibold tracking-normal">Dashboard</h1>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <label className="relative !block">
            <AdminIcon name="calendar" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#ff8d28]" />
            <select value={periodIndex} onChange={(event) => setPeriodIndex(Number(event.target.value))} className="!h-10 !min-h-0 !w-[200px] shrink-0 rounded-xl !border !border-[#ffd2ad] bg-white !py-0 !pl-9 !pr-3 !text-[12px] !font-normal text-[#ff8d28] !shadow-none outline-none hover:bg-[#fff8f1] focus:!border-[#ff8d28] focus:ring-2 focus:ring-[#ff8d28]/10">
              {periods.map((item, index) => <option key={item.label} value={index}>{item.start} - {item.end}</option>)}
            </select>
          </label>
          <button onClick={exportCsv} className="inline-flex h-10 w-[170px] items-center justify-center gap-2.5 rounded-xl bg-[#ff8d28] px-4 text-[13px] font-medium text-white shadow-[0_10px_20px_rgba(255,141,40,0.22)] hover:bg-[#f47f16]">
            <AdminIcon name="download" /> Xuất báo cáo
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((item) => (
          <section key={item.title} className="flex min-h-[112px] items-center gap-4 rounded-2xl border border-[#e7e9f1] bg-white p-4 shadow-[0_14px_34px_rgba(12,18,32,0.04)]">
            <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${item.tone === "green" ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-500"}`}><KpiIcon name={item.icon} /></div>
            <div className="min-w-0">
              <p className="text-[13px] text-[#697086]">{item.title}</p>
              <div className="mt-1 flex items-end gap-2">
                <p className="truncate text-[22px] font-semibold leading-none">{item.value}</p>
                <p className="whitespace-nowrap text-[12px] font-medium text-emerald-600">↑ {item.trend}</p>
              </div>
              <p className="mt-2 text-[12px] text-[#697086]">So với tháng trước</p>
            </div>
          </section>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(360px,0.85fr)]">
        <Panel>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-[16px] font-semibold">Doanh thu</h2>
            <select value={chartMode} onChange={(event) => setChartMode(event.target.value as "month" | "day")} className="!h-8 !min-h-0 !w-[104px] shrink-0 rounded-lg !border !border-[#ffd2ad] bg-white !px-2 !py-0 !text-[12px] text-[#ff8d28] !shadow-none outline-none hover:bg-[#fff8f1]">
              <option value="month">Theo tháng</option>
              <option value="day">Theo ngày</option>
            </select>
          </div>
          <div className="flex gap-5 text-[11px] font-medium"><span className="text-[#ff8d28]">━ Doanh thu</span><span className="text-[#5799ee]">━ Booking</span></div>
          <RevenueChart data={chartData} />
        </Panel>

        <Panel>
          <h2 className="text-[16px] font-semibold">Booking theo trạng thái</h2>
          <BookingDonut bookings={filteredBookings} />
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(360px,0.9fr)]">
        <Panel title="Booking chờ xác nhận">
          <div className="divide-y divide-[#edf0f5]">{confirmedBookings.slice(0, 5).map((item, index) => <BookingRow key={item.id} item={item} index={index} />)}</div>
        </Panel>
        <Panel title="Yêu cầu hoàn tiền">
          <div className="divide-y divide-[#edf0f5]">{filteredRefunds.slice(0, 5).map((item) => <RefundRow key={item.id} item={item} />)}</div>
        </Panel>
        <div className="grid gap-4">
          <Panel title="Report mới">
            <div className="divide-y divide-[#edf0f5]">{reports.map((item) => <EventRow key={item[0]} item={item} color="orange" />)}</div>
          </Panel>
          <Panel title="Hoạt động hệ thống">
            <div className="divide-y divide-[#edf0f5]">{activities.map((item) => <EventRow key={item.title} item={[item.title, item.subtitle]} color={item.tone} />)}</div>
          </Panel>
        </div>
      </div>
    </AdminLayout>
  );
}

function Panel({ children, title }: { children: React.ReactNode; title?: string }) {
  return <section className="rounded-2xl border border-[#e7e9f1] bg-white p-4 shadow-[0_14px_34px_rgba(12,18,32,0.04)]">{title ? <div className="mb-3 flex items-center justify-between"><h2 className="text-[16px] font-semibold">{title}</h2><IconButton label="Xem tất cả" icon="eye" /></div> : null}{children}</section>;
}

function RevenueChart({ data }: { data: { label: string; revenue: number; bookings: number }[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const activeIndex = hovered === null ? null : Math.min(hovered, Math.max(data.length - 1, 0));
  const maxRevenue = Math.max(...data.map((item) => item.revenue), 1);
  const maxBookings = Math.max(...data.map((item) => item.bookings), 1);
  const points = data.map((item, index) => {
    const x = data.length === 1 ? 360 : (index / (data.length - 1)) * 720;
    return { x, revenueY: 188 - (item.revenue / maxRevenue) * 150, bookingY: 188 - (item.bookings / maxBookings) * 130 };
  });
  const revenuePath = linePath(points.map((item) => [item.x, item.revenueY]));
  const bookingPath = linePath(points.map((item) => [item.x, item.bookingY]));
  const active = activeIndex === null ? null : data[activeIndex];
  const activePoint = activeIndex === null ? null : points[activeIndex];

  return (
    <div className="relative mt-3 h-[276px] overflow-hidden" onMouseLeave={() => setHovered(null)}>
      <div className="absolute inset-x-0 top-1 bottom-7 flex flex-col justify-between text-[11px] text-[#697086]">{["100%", "80%", "60%", "40%", "20%", "0"].map((label) => <div key={label} className="flex items-center gap-3"><span className="w-9">{label}</span><span className="h-px flex-1 border-t border-dashed border-[#dfe3ec]" /></div>)}</div>
      <svg viewBox="0 0 760 220" className="absolute left-11 right-3 top-5 h-[190px] w-[calc(100%-56px)] overflow-visible">
        <path d={revenuePath} fill="none" stroke="#ff8d28" strokeWidth="3" />
        <path d={bookingPath} fill="none" stroke="#5799ee" strokeWidth="3" />
        {points.map((point, index) => <rect key={`${data[index].label}-hit`} x={point.x - 36} y="0" width="72" height="210" fill="transparent" className="cursor-pointer" onMouseEnter={() => setHovered(index)} onClick={() => setHovered(index)} />)}
        {points.map((point, index) => <circle key={data[index].label} cx={point.x} cy={point.revenueY} r={activeIndex === index ? "7" : "4"} fill="#ff8d28" stroke={activeIndex === index ? "white" : "#ff8d28"} strokeWidth={activeIndex === index ? "3" : "0"} className="cursor-pointer" onMouseEnter={() => setHovered(index)} />)}
        {activePoint ? <line x1={activePoint.x} y1="0" x2={activePoint.x} y2="210" stroke="#cfd6e3" /> : null}
      </svg>
      {active && activePoint ? (
        <div className="absolute rounded-xl border border-[#dfe3ec] bg-white p-3 text-[12px] shadow-lg" style={{ left: `min(calc(44px + ${(activePoint.x / 760) * 100}%), calc(100% - 190px))`, top: 74 }}>
          <b>{active.label}</b>
          <p className="mt-2"><span className="text-[#ff8d28]">●</span> Doanh thu: {money(active.revenue)}</p>
          <p className="mt-1"><span className="text-[#5799ee]">●</span> Booking: {active.bookings}</p>
        </div>
      ) : null}
      <div className="absolute bottom-9 left-11 right-3 flex justify-between text-[11px] text-[#596174]">{data.map((item, index) => <button key={item.label} onMouseEnter={() => setHovered(index)} className={`rounded-full px-2 py-1 transition ${activeIndex === index ? "bg-[#fff3e8] text-[#ff8d28]" : "hover:bg-[#fff8f1]"}`}>{item.label}</button>)}</div>
      <p className="absolute bottom-1 left-11 text-[11px] text-[#697086]">Di chuột vào điểm hoặc nhãn thời gian để xem thông số.</p>
    </div>
  );
}

function BookingDonut({ bookings: list }: { bookings: Booking[] }) {
  const total = list.length || 1;
  const rows = (Object.keys(statusColors) as BookingStatus[]).map((status) => {
    const count = list.filter((item) => item.status === status).length;
    return { status, count, pct: Math.round((count / total) * 1000) / 10, color: statusColors[status] };
  });
  let cursor = 0;
  const gradient = rows.map((row) => {
    const start = cursor;
    cursor += row.pct;
    return `${row.color} ${start}% ${cursor}%`;
  }).join(", ");

  return (
    <div className="mt-5 grid items-center gap-5 md:grid-cols-[190px_1fr]">
      <div className="relative mx-auto h-[190px] w-[190px] rounded-full" style={{ background: `conic-gradient(${gradient || "#edf0f5 0% 100%"})` }}>
        <div className="absolute inset-[45px] grid place-items-center rounded-full bg-white text-center"><div><b className="text-[22px]">{formatNumber(list.length)}</b><p className="text-[12px] text-[#697086]">Tổng</p></div></div>
      </div>
      <div className="space-y-4 text-[12px]">
        {rows.map((row) => <div key={row.status} className="grid grid-cols-[14px_1fr_auto] items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: row.color }} /><span>{row.status}</span><b className="font-medium">{row.count} ({row.pct}%)</b></div>)}
      </div>
    </div>
  );
}

function KpiIcon({ name }: { name: string }) {
  const paths: Record<string, string[]> = {
    users: ["M16 19v-1.2a4.8 4.8 0 00-4.8-4.8H8.8A4.8 4.8 0 004 17.8V19", "M12.5 7.5a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0z", "M20 19v-1a4 4 0 00-3-3.9"],
    camera: ["M4 8h3l1.5-2h7L17 8h3v10H4z", "M12 16a3.5 3.5 0 100-7 3.5 3.5 0 000 7z"],
    calendar: ["M7 3v3M17 3v3M4 8h16M6 5h12a2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2z", "M9 14l2 2 4-5"],
    dollar: ["M12 3v18", "M16 7.5A4 4 0 0012 6c-2.2 0-4 1.1-4 2.7 0 4.1 8 2.1 8 6.2 0 1.6-1.8 3.1-4 3.1a5 5 0 01-4.2-1.9"],
  };

  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">{paths[name].map((path) => <path key={path} d={path} />)}</svg>;
}

function BookingRow({ item }: { item: Booking; index: number }) {
  return <div className="grid grid-cols-[36px_minmax(0,1.1fr)_minmax(0,1fr)_auto] items-center gap-3 py-3 text-[12px]"><img src={item.avatar} alt="" className="h-9 w-9 rounded-lg object-cover" /><div className="min-w-0"><b className="block truncate font-medium">{item.customer}</b><p className="truncate text-[#697086]">{item.service}</p></div><div className="min-w-0"><b className="block truncate font-medium">{item.photographer}</b><p className="truncate text-[#697086]">{formatDate(item.date)}</p></div><b className="whitespace-nowrap font-medium text-[#ff8d28]">{money(item.amount)}</b></div>;
}

function RefundRow({ item }: { item: Refund }) {
  return <div className="grid grid-cols-[36px_minmax(0,1fr)_auto_auto] items-center gap-3 py-3 text-[12px]"><img src={item.avatar} alt="" className="h-9 w-9 rounded-full object-cover" /><div className="min-w-0"><b className="block truncate font-medium">{item.customer}</b><p className="truncate text-[#697086]">Booking #{item.bookingId}</p></div><b className="font-medium">{money(item.amount)}</b><span className="rounded-full bg-[#fff0c9] px-2.5 py-1 text-[11px] text-[#ce8a00]">{item.status}</span></div>;
}

function EventRow({ item, color }: { item: string[]; color: string }) {
  return <div className="grid grid-cols-[24px_minmax(0,1fr)_auto] items-center gap-3 py-3 text-[12px]"><AdminIcon name={color === "red" ? "close" : color === "green" ? "check" : "filter"} className={color === "red" ? "h-4 w-4 text-red-500" : color === "green" ? "h-4 w-4 text-emerald-600" : "h-4 w-4 text-[#ff8d28]"} /><div className="min-w-0"><b className="block truncate font-medium">{item[0]}</b>{item[1] ? <p className="truncate text-[#697086]">{item[1]}</p> : null}</div><span className="whitespace-nowrap text-[11px] text-[#697086]">{item[2]}</span></div>;
}

function buildChartData(mode: "month" | "day", period: { start: string; end: string }, list: Booking[]) {
  if (mode === "day") {
    return eachWeekBucket(period.start, period.end).map(({ label, start, end }) => {
      const dayBookings = list.filter((item) => inRange(item.date, start, end));
      return { label, revenue: dayBookings.reduce((sum, item) => sum + item.amount, 0), bookings: dayBookings.length };
    });
  }

  return lastMonths(period.end, 7).map((month) => {
    const monthBookings = list.filter((item) => item.date.startsWith(month));
    return { label: `Tháng ${Number(month.slice(5))}`, revenue: monthBookings.reduce((sum, item) => sum + item.amount, 0), bookings: monthBookings.length };
  });
}

function linePath(points: number[][]) {
  return points.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x} ${y}`).join(" ");
}

function eachMonth(start: string, end: string) {
  const result: string[] = [];
  const current = new Date(`${start}T00:00:00`);
  const last = new Date(`${end}T00:00:00`);
  current.setDate(1);
  while (current <= last) {
    result.push(`${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`);
    current.setMonth(current.getMonth() + 1);
  }
  return result;
}

function eachDay(start: string, end: string) {
  const result: string[] = [];
  const current = new Date(`${start}T00:00:00`);
  const last = new Date(`${end}T00:00:00`);
  while (current <= last) {
    result.push(current.toISOString().slice(0, 10));
    current.setDate(current.getDate() + 1);
  }
  return result;
}

function eachWeekBucket(start: string, end: string) {
  const days = eachDay(start, end);
  const buckets = [];
  for (let index = 0; index < days.length; index += 5) {
    const bucketStart = days[index];
    const bucketEnd = days[Math.min(index + 4, days.length - 1)];
    buckets.push({ label: `${formatShortDate(bucketStart)}-${formatShortDate(bucketEnd)}`, start: bucketStart, end: bucketEnd });
  }
  return buckets;
}

function lastMonths(end: string, count: number) {
  const result: string[] = [];
  const current = new Date(`${end}T00:00:00`);
  current.setDate(1);
  current.setMonth(current.getMonth() - count + 1);
  for (let index = 0; index < count; index += 1) {
    result.push(`${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`);
    current.setMonth(current.getMonth() + 1);
  }
  return result;
}

function inRange(date: string, start: string, end: string) {
  return date >= start && date <= end;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value);
}

function money(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value) + "đ";
}

function formatDate(date: string) {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

function formatShortDate(date: string) {
  const [, month, day] = date.split("-");
  return `${day}/${month}`;
}
