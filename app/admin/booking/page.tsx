"use client";

import { useMemo, useState, useEffect } from "react";
import AdminLayout from "../_components/admin-layout";
import { AdminIcon, IconButton } from "../_components/admin-icons";
import { api } from "@/lib/api";

type BookingStatus = "Chờ xác nhận" | "Đã xác nhận" | "Đang thực hiện" | "Hoàn thành" | "Đã hủy";
type PaymentStatus = "Chưa thanh toán" | "Đã thanh toán cọc" | "Đã thanh toán đủ" | "Đã hoàn tiền";
type Booking = { id: string; customer: string; phone: string; email: string; customerAvatar: string; photographer: string; photographerAvatar: string; service: string; shootDate: string; createdAt: string; amount: number; status: BookingStatus; payment: PaymentStatus; place: string; time: string; packageName: string; note: string; history: string[] };

export default function BookingPage() {
  const [items, setItems] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<BookingStatus | "Tất cả">("Tất cả");
  const [service, setService] = useState("Tất cả");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: "",
    photographer_id: "",
    package_id: "",
    shoot_date: "",
    shoot_time: "",
    location: "",
    concept: "",
    num_people: 1,
  });

  const services = useMemo(() => ["Tất cả", ...Array.from(new Set(items.map((i) => i.service)))], [items]);
  const tabs: Array<BookingStatus | "Tất cả"> = ["Tất cả", "Chờ xác nhận", "Đã xác nhận", "Đang thực hiện", "Hoàn thành", "Đã hủy"];
  const filtered = useMemo(() => items.filter((i) => [i.id, i.customer, i.phone, i.email, i.photographer, i.service, i.status].join(" ").toLowerCase().includes(query.toLowerCase()) && (status === "Tất cả" || i.status === status) && (service === "Tất cả" || i.service === service)), [items, query, service, status]);
  const selected = items.find((i) => i.id === selectedId) ?? filtered[0] ?? items[0];

  // Map backend status to frontend status
  const mapStatus = (backendStatus: string): BookingStatus => {
    const statusMap: Record<string, BookingStatus> = {
      "awaiting_payment": "Chờ xác nhận",
      "accepted": "Đã xác nhận",
      "confirmed": "Đang thực hiện",
      "completed": "Hoàn thành",
      "fully_paid": "Hoàn thành",
      "cancelled": "Đã hủy",
      "rejected": "Đã hủy",
    };
    return statusMap[backendStatus] || "Chờ xác nhận";
  };

  // Map backend payment status to frontend
  const mapPayment = (backendStatus: string): PaymentStatus => {
    const paymentMap: Record<string, PaymentStatus> = {
      "awaiting_payment": "Chưa thanh toán",
      "accepted": "Chưa thanh toán",
      "confirmed": "Đã thanh toán cọc",
      "completed": "Đã thanh toán cọc",
      "fully_paid": "Đã thanh toán đủ",
      "cancelled": "Đã hoàn tiền",
    };
    return paymentMap[backendStatus] || "Chưa thanh toán";
  };

  // Load bookings from API
  useEffect(() => {
    async function loadBookings() {
      setLoading(true);
      const result = await api.bookings.getAll({ page, pageSize: 10 });
      
      if (result.success && result.data) {
        // Transform backend data to frontend format
        const transformedData = result.data.map((booking: any) => ({
          id: booking.booking_code,
          customer: booking.customer_full_name,
          phone: booking.customer_phone,
          email: booking.customer_email,
          customerAvatar: "/logo_sudion.jpg",
          photographer: booking.photographer_name,
          photographerAvatar: "/Overlay+Shadow.png",
          service: booking.service_name,
          shootDate: booking.shoot_date,
          createdAt: new Date(booking.created_at).toLocaleString("vi-VN"),
          amount: booking.estimated_total || 0,
          status: mapStatus(booking.status),
          payment: mapPayment(booking.status),
          place: booking.location || "N/A",
          time: `${booking.shoot_time || "N/A"}`,
          packageName: booking.service_name,
          note: booking.concept || "",
          history: [`${new Date(booking.created_at).toLocaleDateString("vi-VN")} · Tạo booking`],
        }));
        
        setItems(transformedData);
        setPagination(result.pagination);
      }
      setLoading(false);
    }

    loadBookings();
  }, [page]);

  // Load stats
  useEffect(() => {
    async function loadStats() {
      const result = await api.bookings.getStats();
      if (result.success) {
        setStats(result.data);
      }
    }
    loadStats();
  }, []);

  function notify(text: string) { setToast(text); setTimeout(() => setToast(""), 1800); }
  
  function patch(id: string, value: Partial<Booking>) { 
    setItems((list) => list.map((item) => item.id === id ? { ...item, ...value } : item)); 
  }
  
  async function handleUpdateStatus(bookingCode: string, newStatus: BookingStatus) {
    // Map frontend status back to backend
    const backendStatusMap: Record<BookingStatus, string> = {
      "Chờ xác nhận": "awaiting_payment",
      "Đã xác nhận": "accepted",
      "Đang thực hiện": "confirmed",
      "Hoàn thành": "completed",
      "Đã hủy": "cancelled",
    };

    const result = await api.bookings.updateStatus(bookingCode, backendStatusMap[newStatus]);
    
    if (result.success) {
      patch(bookingCode, { status: newStatus });
      notify(`Đã cập nhật trạng thái booking.`);
    } else {
      notify(`Lỗi: ${result.error || "Không thể cập nhật"}`);
    }
  }
  
  function createBooking() { 
    setFormData({
      customer_id: "",
      photographer_id: "",
      package_id: "",
      shoot_date: "",
      shoot_time: "",
      location: "",
      concept: "",
      num_people: 1,
    });
    setAddModalOpen(true);
  }

  async function handleCreateBooking() {
    // Validate required fields
    if (!formData.customer_id || !formData.photographer_id || !formData.package_id || !formData.shoot_date) {
      notify("Vui lòng nhập đầy đủ thông tin bắt buộc!");
      return;
    }

    try {
      const result = await api.bookings.create(formData);
      
      if (result.success) {
        notify("Đã tạo booking thành công!");
        setAddModalOpen(false);
        window.location.reload();
      } else {
        notify(`Lỗi: ${result.message || result.error || "Không thể tạo"}`);
      }
    } catch (error) {
      notify("Lỗi khi tạo booking");
      console.error(error);
    }
  }

  if (loading && items.length === 0) {
    return (
      <AdminLayout active="Booking" search={query} onSearch={setQuery}>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mb-4 text-2xl">🔄</div>
            <p className="text-gray-600">Đang tải dữ liệu...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout active="Booking" search={query} onSearch={setQuery}>
      {toast ? <Toast text={toast} /> : null}
      <div className="min-w-0">
        <div className="min-w-0">
          <PageHead title="Quản lý Booking" action="Tạo booking" onAction={createBooking} />
          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
            <Stat title="Tổng booking" value={stats?.total?.toString() || "0"} />
            <Stat title="Chờ xác nhận" value={stats?.pending?.toString() || "0"} />
            <Stat title="Đã xác nhận" value={stats?.confirmed?.toString() || "0"} />
            <Stat title="Đang thực hiện" value={stats?.inProgress?.toString() || "0"} />
            <Stat title="Hoàn thành" value={stats?.completed?.toString() || "0"} />
            <Stat title="Đã hủy" value={stats?.cancelled?.toString() || "0"} />
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
              {tabs.map((tab) => <button key={tab} onClick={() => setStatus(tab)} className={`shrink-0 border-b-2 px-3 py-2 text-[12px] font-medium ${status === tab ? "border-[#ff8d28] text-[#ff8d28]" : "border-transparent text-[#536078]"}`}>{tab} <span className="rounded-full bg-[#eef1f7] px-2 py-0.5 text-[10px]">{tab === "Tất cả" ? (stats?.total || items.length) : items.filter((i) => i.status === tab).length}</span></button>)}
            </div>
            <div className="overflow-x-auto rounded-xl border border-[#e6e9f1]">
              <table className="w-full min-w-[1040px] text-left text-[12px]">
                <thead className="bg-[#fbfcfe] text-[#536078]"><tr>{["Booking ID", "Khách hàng", "Photographer", "Dịch vụ", "Ngày chụp", "Tổng tiền", "Trạng thái", "Thanh toán", "Thao tác"].map((h) => <th key={h} className="px-3 py-3 font-semibold">{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-[#edf0f5]">
                  {filtered.length === 0 ? (
                    <tr><td colSpan={9} className="px-3 py-8 text-center text-gray-500">Không có booking nào</td></tr>
                  ) : (
                    filtered.map((item) => <tr key={item.id} onClick={() => setSelectedId(item.id)} className={`cursor-pointer hover:bg-[#fff8f1] ${selectedId === item.id ? "bg-[#fff3e8]" : "bg-white"}`}><td className="px-3 py-3 font-medium text-[#ff8d28]">{item.id}<p className="text-[#697086]">{item.createdAt}</p></td><td className="px-3 py-3"><b>{item.customer}</b><p className="text-[#697086]">{item.phone}</p></td><td className="px-3 py-3"><div className="flex items-center gap-2"><img src={item.photographerAvatar} alt="" className="h-8 w-8 rounded-full object-cover" />{item.photographer}</div></td><td className="px-3 py-3">{item.service}</td><td className="px-3 py-3">{item.shootDate}</td><td className="px-3 py-3 font-semibold">{money(item.amount)}</td><td className="px-3 py-3"><Badge text={item.status} /></td><td className="px-3 py-3"><Badge text={item.payment} /></td><td className="px-3 py-3"><div className="flex gap-2"><IconButton label="Xem chi tiết" icon="eye" onClick={(e) => { e.stopPropagation(); setSelectedId(item.id); }} /><IconButton label="Xác nhận" icon="check" onClick={(e) => { e.stopPropagation(); handleUpdateStatus(item.id, "Đã xác nhận"); setSelectedId(item.id); }} /></div></td></tr>)
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-center justify-between text-[12px] text-[#697086]">
              <span>Hiển thị {filtered.length} của {pagination?.total || items.length} booking</span>
              <div className="flex gap-2">
                {pagination && pagination.page > 1 && (
                  <button onClick={() => setPage(page - 1)} className="rounded-xl border px-3 py-2 hover:bg-gray-50">Trước</button>
                )}
                <span className="rounded-xl border px-3 py-2">
                  Trang {pagination?.page || 1} / {pagination?.totalPages || 1}
                </span>
                {pagination && pagination.page < pagination.totalPages && (
                  <button onClick={() => setPage(page + 1)} className="rounded-xl border px-3 py-2 hover:bg-gray-50">Sau</button>
                )}
              </div>
            </div>
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
          <div className="mt-6 flex justify-end gap-2"><IconButton label="Xác nhận" icon="check" onClick={() => { handleUpdateStatus(selected.id, "Đã xác nhận"); }} /><IconButton label="Từ chối" icon="close" tone="danger" onClick={() => { handleUpdateStatus(selected.id, "Đã hủy"); }} /><IconButton label="Liên hệ" icon="mail" onClick={() => notify("Đã mở liên hệ khách.")} /></div>
        </aside>
        </div> : null}

        {/* Add Booking Modal */}
        {addModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/45 backdrop-blur-[3px]"
            onClick={() => setAddModalOpen(false)}
          >
            <div
              className="relative w-full max-w-2xl rounded-2xl border border-[#e6e9f1] bg-white p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[18px] font-semibold">Tạo Booking Mới</h2>
                <IconButton
                  label="Đóng"
                  icon="close"
                  onClick={() => setAddModalOpen(false)}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Customer ID */}
                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-[#536078]">
                    Customer ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.customer_id}
                    onChange={(e) =>
                      setFormData({ ...formData, customer_id: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#dfe3ec] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#ff8d28] focus:ring-2 focus:ring-[#ff8d28]/10"
                    placeholder="ID khách hàng"
                  />
                </div>

                {/* Photographer ID */}
                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-[#536078]">
                    Photographer ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.photographer_id}
                    onChange={(e) =>
                      setFormData({ ...formData, photographer_id: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#dfe3ec] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#ff8d28] focus:ring-2 focus:ring-[#ff8d28]/10"
                    placeholder="ID photographer"
                  />
                </div>

                {/* Package ID */}
                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-[#536078]">
                    Package ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.package_id}
                    onChange={(e) =>
                      setFormData({ ...formData, package_id: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#dfe3ec] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#ff8d28] focus:ring-2 focus:ring-[#ff8d28]/10"
                    placeholder="ID gói dịch vụ"
                  />
                </div>

                {/* Shoot Date */}
                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-[#536078]">
                    Ngày chụp <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.shoot_date}
                    onChange={(e) =>
                      setFormData({ ...formData, shoot_date: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#dfe3ec] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#ff8d28] focus:ring-2 focus:ring-[#ff8d28]/10"
                  />
                </div>

                {/* Shoot Time */}
                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-[#536078]">
                    Giờ chụp
                  </label>
                  <input
                    type="time"
                    value={formData.shoot_time}
                    onChange={(e) =>
                      setFormData({ ...formData, shoot_time: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#dfe3ec] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#ff8d28] focus:ring-2 focus:ring-[#ff8d28]/10"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-[#536078]">
                    Địa điểm
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#dfe3ec] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#ff8d28] focus:ring-2 focus:ring-[#ff8d28]/10"
                    placeholder="Địa điểm chụp"
                  />
                </div>

                {/* Number of People */}
                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-[#536078]">
                    Số người
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.num_people}
                    onChange={(e) =>
                      setFormData({ ...formData, num_people: parseInt(e.target.value) || 1 })
                    }
                    className="w-full rounded-xl border border-[#dfe3ec] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#ff8d28] focus:ring-2 focus:ring-[#ff8d28]/10"
                  />
                </div>

                {/* Concept */}
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-[12px] font-medium text-[#536078]">
                    Concept / Ghi chú
                  </label>
                  <textarea
                    value={formData.concept}
                    onChange={(e) =>
                      setFormData({ ...formData, concept: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#dfe3ec] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#ff8d28] focus:ring-2 focus:ring-[#ff8d28]/10"
                    placeholder="Mô tả concept, yêu cầu đặc biệt..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => setAddModalOpen(false)}
                  className="rounded-xl border border-[#dfe3ec] bg-white px-4 py-2 text-[13px] font-medium text-[#536078] hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreateBooking}
                  className="rounded-xl bg-[#ff8d28] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#f47f16]"
                >
                  Tạo Booking
                </button>
              </div>
            </div>
          </div>
        )}
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
