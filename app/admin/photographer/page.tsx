"use client";

import { useMemo, useState, useEffect } from "react";
import AdminLayout from "../_components/admin-layout";
import { AdminIcon, IconButton } from "../_components/admin-icons";
import { api } from "@/lib/api";

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

export default function PhotographerPage() {
  const [items, setItems] = useState<Photographer[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<Status | "Tất cả">("Tất cả");
  const [region, setRegion] = useState("Tất cả");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [tab, setTab] = useState("Thông tin");
  const [toast, setToast] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [detailData, setDetailData] = useState<{
    portfolio: string[];
    services: any[];
    reviews: any[];
    bookings: any[];
  }>({ portfolio: [], services: [], reviews: [], bookings: [] });
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    active_area: "",
    bio: "",
    photographer_type: "freelance" as "freelance" | "studio" | "agency"
  });

  const regions = useMemo(() => ["Tất cả", ...Array.from(new Set(items.map((i) => i.region)))], [items]);
  const filtered = useMemo(() => {
    if (!items || items.length === 0) return [];
    
    return items.filter((i) => {
      // Search filter
      if (query) {
        const text = [i.name, i.studio, i.email, i.phone, i.region, i.status, ...(i.services || [])].join(" ").toLowerCase();
        if (!text.includes(query.toLowerCase())) return false;
      }
      
      // Status filter
      if (status !== "Tất cả" && i.status !== status) return false;
      
      // Region filter
      if (region !== "Tất cả" && i.region !== region) return false;
      
      return true;
    });
  }, [items, query, region, status]);
  const selected = items.find((i) => i.id === selectedId) ?? filtered[0] ?? items[0];

  // Map backend status to frontend
  const mapStatus = (backendStatus: string): Status => {
    const statusMap: Record<string, Status> = {
      "verified": "Đã xác minh",
      "pending": "Chờ duyệt",
      "rejected": "Bị từ chối",
      "locked": "Bị khóa",
    };
    return statusMap[backendStatus] || "Chờ duyệt";
  };

  // Load photographers from API
  useEffect(() => {
    async function loadPhotographers() {
      setLoading(true);
      try {
        const params: any = { 
          page: 1, 
          pageSize: 10,
        };
        
        const result = await api.photographerApprovals.getAll({
          status: "all",
          keyword: query,
        });
        
        if (result.success && result.data) {
          const transformedData = (result.data as any).map((p: any) => ({
            id: p.id,
            studio: p.full_name || p.name || p.user_full_name || "N/A",
            name: p.full_name || p.name || p.user_full_name || "N/A",
            email: p.email || p.user_email || "N/A",
            phone: p.phone || "N/A",
            region: p.region || p.active_area || "N/A",
            avatar: p.avatar_url || "/logo_sudion.jpg",
            services: String(p.categories || "")
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean),
            rating: parseFloat(p.rating || p.avg_rating) || 0,
            reviews: 0, // Not available
            bookings: parseInt(p.bookings || "0") || 0,
            status: mapStatus(p.verification_status || p.status || "pending"),
            joined: p.joined || p.created_at ? new Date(p.joined || p.created_at).toLocaleDateString("vi-VN") : "N/A",
            birthday: "N/A",
            gender: "N/A",
            bio: p.bio || "",
            documents: (() => {
              try {
                if (!p.documents) return [];
                const parsed = JSON.parse(p.documents);
                return Array.isArray(parsed) ? parsed : [p.documents];
              } catch (_) {
                return typeof p.documents === "string" ? [p.documents] : [];
              }
            })(),
          }));
          
          setItems(transformedData);
          setPagination(result.pagination);
        } else {
          console.error('API returned no data or failed:', result);
        }
      } catch (error) {
        console.error('Error loading photographers:', error);
      }
      setLoading(false);
    }

    loadPhotographers();
  }, [page, query, status, region]);

  // Load stats
  useEffect(() => {
    async function loadStats() {
      const result = await api.photographers.getStats();
      if (result.success) {
        setStats(result.data);
      }
    }
    loadStats();
  }, []);

  useEffect(() => {
    if (!selectedId) return;

    let alive = true;

    async function loadDetailData() {
      try {
        const [portfolio, services, reviews, bookings] = await Promise.all([
          api.photographers.getPortfolio(selectedId),
          api.photographers.getServices(selectedId),
          api.photographers.getReviews(selectedId),
          api.photographers.getBookings(selectedId),
        ]);

        if (!alive) return;

        setDetailData({
          portfolio: portfolio.success && Array.isArray(portfolio.data) ? portfolio.data as string[] : [],
          services: services.success && Array.isArray(services.data) ? services.data as any[] : [],
          reviews: reviews.success && Array.isArray(reviews.data) ? reviews.data as any[] : [],
          bookings: bookings.success && Array.isArray(bookings.data) ? bookings.data as any[] : [],
        });
      } catch (error) {
        console.error("Error loading photographer detail tabs:", error);
        if (alive) {
          setDetailData({ portfolio: [], services: [], reviews: [], bookings: [] });
        }
      }
    }

    void loadDetailData();

    return () => {
      alive = false;
    };
  }, [selectedId]);

  function notify(message: string) {
    setToast(message);
    setTimeout(() => setToast(""), 1800);
  }

  function patch(id: number, patchValue: Partial<Photographer>) {
    setItems((list) => list.map((item) => item.id === id ? { ...item, ...patchValue } : item));
  }

  async function handleUpdateStatus(id: number, newStatus: Status) {
    const oldStatus = items.find((item) => item.id === id)?.status;
    const backendStatusMap: Record<Status, string> = {
      "Đã xác minh": "verified",
      "Chờ duyệt": "pending",
      "Bị từ chối": "rejected",
      "Bị khóa": "locked",
    };

    const result =
      newStatus === "Đã xác minh"
        ? await api.photographerApprovals.approve(id)
        : newStatus === "Bị từ chối"
          ? await api.photographerApprovals.reject(id)
          : await api.photographers.updateStatus(id, backendStatusMap[newStatus]);
    
    if (result.success) {
      patch(id, { status: newStatus });
      setStats((current: any) => {
        if (!current || !oldStatus || oldStatus === newStatus) return current;

        const keyByStatus: Record<Status, string> = {
          "Đã xác minh": "verified",
          "Chờ duyệt": "pending",
          "Bị từ chối": "rejected",
          "Bị khóa": "locked",
        };
        const oldKey = keyByStatus[oldStatus];
        const newKey = keyByStatus[newStatus];

        return {
          ...current,
          [oldKey]: Math.max(0, Number(current[oldKey] || 0) - 1),
          [newKey]: Number(current[newKey] || 0) + 1,
        };
      });
      notify(`Đã cập nhật trạng thái photographer.`);
    } else {
      notify(`Lỗi: ${result.error || "Không thể cập nhật"}`);
    }
  }

  function addPhotographer() {
    setAddModalOpen(true);
  }

  async function handleCreatePhotographer() {
    // Validate
    if (!formData.name || !formData.email) {
      notify("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    try {
      const result = await api.photographers.create(formData);
      
      if (result.success) {
        notify("Đã tạo photographer thành công!");
        setAddModalOpen(false);
        setFormData({
          name: "",
          email: "",
          phone: "",
          active_area: "",
          bio: "",
          photographer_type: "freelance"
        });
        // Reload list
        window.location.reload();
      } else {
        notify(`Lỗi: ${result.message || result.error || "Không thể tạo"}`);
      }
    } catch (error) {
      notify("Lỗi khi tạo photographer");
      console.error(error);
    }
  }

  function openDetail(id: number) {
    setSelectedId(id);
    window.requestAnimationFrame(() => setDetailOpen(true));
  }

  function closeDetail() {
    setDetailOpen(false);
    window.setTimeout(() => setSelectedId(null), 220);
  }

  if (loading && items.length === 0) {
    return (
      <AdminLayout active="Photographer" search={query} onSearch={setQuery}>
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
    <AdminLayout active="Photographer" search={query} onSearch={setQuery}>
      {toast ? <Toast text={toast} /> : null}
      <div className="min-w-0">
        <div className="min-w-0">
          <PageHead title="Quản lý Photographer" action="Thêm Photographer" onAction={addPhotographer} />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Stat title="Tổng Photographer" value={stats?.total?.toString() || "0"} note="từ database" tone="orange" />
            <Stat title="Chờ duyệt" value={stats?.pending?.toString() || "0"} note="cần xử lý" tone="orange" />
            <Stat title="Đã xác minh" value={stats?.verified?.toString() || "0"} note="đang hoạt động" tone="green" />
            <Stat title="Bị từ chối" value={stats?.rejected?.toString() || "0"} note="không phê duyệt" tone="red" />
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
                  {filtered.length === 0 ? (
                    <tr><td colSpan={8} className="px-3 py-8 text-center text-gray-500">Không có photographer nào</td></tr>
                  ) : (
                    filtered.map((item) => (
                      <tr key={item.id} onClick={() => openDetail(item.id)} className={`cursor-pointer hover:bg-[#fff8f1] ${selectedId === item.id ? "bg-[#fff3e8]" : "bg-white"}`}>
                        <td className="px-3 py-3"><div className="flex items-center gap-3"><img src={item.avatar} alt="" className="h-10 w-10 rounded-full object-cover" /><div><b className="font-semibold">{item.studio}</b><p className="text-[#697086]">Tham gia: {item.joined}</p></div></div></td>
                        <td className="px-3 py-3">{item.phone}<p className="text-[#697086]">{item.email}</p></td>
                        <td className="px-3 py-3">{item.region}</td>
                        <td className="px-3 py-3">{item.services.slice(0, 2).map((s) => <span key={s} className="mr-1 rounded-lg bg-[#f0f2f8] px-2 py-1">{s}</span>)}{item.services.length > 2 ? <span className="rounded-lg bg-[#f0f2f8] px-2 py-1">+{item.services.length - 2}</span> : null}</td>
                        <td className="px-3 py-3 text-[#f59e0b]">★ <b className="text-[#111827]">{item.rating}</b><p className="text-[#697086]">({item.reviews})</p></td>
                        <td className="px-3 py-3 font-semibold">{item.bookings}</td>
                        <td className="px-3 py-3"><Badge text={item.status} /></td>
                        <td className="px-3 py-3">
                          <div className="flex gap-2">
                            <IconButton label="Xem chi tiết" icon="eye" onClick={(e) => { e.stopPropagation(); openDetail(item.id); }} />
                            <IconButton label="Duyệt" icon="check" onClick={(e) => { e.stopPropagation(); handleUpdateStatus(item.id, "Đã xác minh"); }} />
                            <IconButton label="Từ chối" icon="close" tone="danger" onClick={(e) => { e.stopPropagation(); handleUpdateStatus(item.id, "Bị từ chối"); }} />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-center justify-between text-[12px] text-[#697086]">
              <span>Hiển thị {filtered.length} của {pagination?.total || items.length} photographer</span>
              <div className="flex gap-2">
                {pagination && pagination.page > 1 && (
                  <button onClick={() => setPage(page - 1)} className="rounded-xl border px-3 py-2 hover:bg-gray-50">Trước</button>
                )}
                <span className="rounded-xl border px-3 py-2">Trang {pagination?.page || 1} / {pagination?.totalPages || 1}</span>
                {pagination && pagination.page < pagination.totalPages && (
                  <button onClick={() => setPage(page + 1)} className="rounded-xl border px-3 py-2 hover:bg-gray-50">Sau</button>
                )}
              </div>
            </div>
          </Panel>
        </div>

        {selectedId !== null && selected ? <div className={`fixed inset-0 z-50 bg-[#0f172a]/45 backdrop-blur-[3px] transition-opacity duration-200 ${detailOpen ? "opacity-100" : "opacity-0"}`} onClick={closeDetail}>
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
              <Info label="Họ và tên" value={selected.name} />
              <Info label="Email" value={selected.email} />
              <Info label="Số điện thoại" value={selected.phone} />
              <Info label="Khu vực hoạt động" value={selected.region} />
              <div><p className="mb-2 text-[#697086]">Dịch vụ chính</p>{selected.services.map((s) => <span key={s} className="mr-1 rounded-lg bg-[#f0f2f8] px-2.5 py-1">{s}</span>)}</div>
              {selected.bio && <div><p className="text-[#697086]">Tiểu sử</p><p className="mt-1 leading-5">{selected.bio}</p></div>}
              
              {selected.documents && selected.documents.length > 0 && (
                <div className="mt-4 pt-3 border-t">
                  <p className="text-[#697086] font-semibold mb-2">Tài liệu xác minh (CCCD / Portfolio)</p>
                  <div className="grid grid-cols-2 gap-2">
                    {selected.documents.map((docUrl, idx) => (
                      <a key={idx} href={docUrl} target="_blank" rel="noopener noreferrer" className="block border rounded-lg overflow-hidden bg-gray-50 hover:opacity-90 transition-opacity">
                        {docUrl.match(/\.(jpeg|jpg|gif|png|webp)/i) ? (
                          <img src={docUrl} alt={`Tài liệu ${idx + 1}`} className="h-24 w-full object-cover" />
                        ) : (
                          <div className="p-3 text-center text-[11px] text-blue-600 font-bold truncate">Tệp đính kèm {idx + 1}</div>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : tab === "Portfolio" ? (
            <div className="mt-5 grid grid-cols-2 gap-2">
              {detailData.portfolio.length ? detailData.portfolio.map((url, index) => (
                <a key={`${url}-${index}`} href={url} target="_blank" rel="noopener noreferrer" className="overflow-hidden rounded-lg border bg-gray-50">
                  <img src={url} alt={`Portfolio ${index + 1}`} className="h-28 w-full object-cover" />
                </a>
              )) : <EmptyDetail text="Photographer này chưa có ảnh portfolio." />}
            </div>
          ) : tab === "Dịch vụ" ? (
            <div className="mt-5 space-y-2 text-[12px]">
              {detailData.services.length ? detailData.services.map((service) => (
                <div key={service.id} className="rounded-xl border border-[#edf0f5] bg-[#fafbfc] p-3">
                  <p className="font-semibold">{service.name || service.package_name || "Gói dịch vụ"}</p>
                  <p className="mt-1 text-[#697086]">{service.category_name || "Chưa phân loại"} · {Number(service.price || service.base_price || 0).toLocaleString("vi-VN")}đ</p>
                </div>
              )) : <EmptyDetail text="Photographer này chưa có gói dịch vụ." />}
            </div>
          ) : tab === "Đánh giá" ? (
            <div className="mt-5 space-y-2 text-[12px]">
              {detailData.reviews.length ? detailData.reviews.map((review) => (
                <div key={review.id || review.booking_code} className="rounded-xl border border-[#edf0f5] bg-[#fafbfc] p-3">
                  <p className="font-semibold">★ {review.rating || 0} · {review.customer_full_name || "Khách hàng"}</p>
                  <p className="mt-1 text-[#697086]">{review.comment || review.content || "Không có nhận xét."}</p>
                </div>
              )) : <EmptyDetail text="Chưa có đánh giá." />}
            </div>
          ) : (
            <div className="mt-5 space-y-2 text-[12px]">
              {detailData.bookings.length ? detailData.bookings.slice(0, 8).map((booking) => (
                <div key={booking.booking_code || booking.id} className="rounded-xl border border-[#edf0f5] bg-[#fafbfc] p-3">
                  <p className="font-semibold">{booking.booking_code || `Booking #${booking.id}`}</p>
                  <p className="mt-1 text-[#697086]">{booking.service_name || "Dịch vụ"} · {booking.customer_full_name || "Khách hàng"} · {booking.status || "unknown"}</p>
                </div>
              )) : <EmptyDetail text="Chưa có lịch sử booking." />}
            </div>
          )}
          <div className="mt-6 flex justify-end gap-2">
            <IconButton label="Khóa" icon="lock" onClick={() => handleUpdateStatus(selected.id, "Bị khóa")} />
            <IconButton label="Từ chối" icon="close" onClick={() => handleUpdateStatus(selected.id, "Bị từ chối")} />
            <IconButton label="Xác minh" icon="check" onClick={() => handleUpdateStatus(selected.id, "Đã xác minh")} />
          </div>
        </aside>
        </div> : null}

        {/* Add Photographer Modal */}
        {addModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/45 backdrop-blur-[3px]" onClick={() => setAddModalOpen(false)}>
            <div className="relative w-full max-w-md rounded-2xl border border-[#e6e9f1] bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[18px] font-semibold">Thêm Photographer Mới</h2>
                <IconButton label="Đóng" icon="close" onClick={() => setAddModalOpen(false)} />
              </div>
              
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-[#536078]">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border border-[#dfe3ec] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#ff8d28] focus:ring-2 focus:ring-[#ff8d28]/10"
                    placeholder="Nhập họ và tên"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-[#536078]">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-xl border border-[#dfe3ec] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#ff8d28] focus:ring-2 focus:ring-[#ff8d28]/10"
                    placeholder="Nhập email"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-[#536078]">Số điện thoại</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-xl border border-[#dfe3ec] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#ff8d28] focus:ring-2 focus:ring-[#ff8d28]/10"
                    placeholder="Nhập số điện thoại"
                  />
                </div>

                {/* Active Area / Region */}
                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-[#536078]">Khu vực hoạt động</label>
                  <input
                    type="text"
                    value={formData.active_area}
                    onChange={(e) => setFormData({ ...formData, active_area: e.target.value })}
                    className="w-full rounded-xl border border-[#dfe3ec] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#ff8d28] focus:ring-2 focus:ring-[#ff8d28]/10"
                    placeholder="VD: Hà Nội, TP.HCM"
                  />
                </div>

                {/* Photographer Type */}
                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-[#536078]">Loại photographer</label>
                  <select
                    value={formData.photographer_type}
                    onChange={(e) => setFormData({ ...formData, photographer_type: e.target.value as "freelance" | "studio" | "agency" })}
                    className="w-full rounded-xl border border-[#dfe3ec] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#ff8d28] focus:ring-2 focus:ring-[#ff8d28]/10"
                  >
                    <option value="freelance">Freelance</option>
                    <option value="studio">Studio</option>
                    <option value="agency">Agency</option>
                  </select>
                </div>

                {/* Bio */}
                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-[#536078]">Tiểu sử</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full rounded-xl border border-[#dfe3ec] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#ff8d28] focus:ring-2 focus:ring-[#ff8d28]/10"
                    placeholder="Giới thiệu ngắn gọn về photographer"
                    rows={3}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => setAddModalOpen(false)}
                  className="rounded-xl border border-[#dfe3ec] bg-white px-4 py-2 text-[13px] font-medium text-[#536078] hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreatePhotographer}
                  className="rounded-xl bg-[#ff8d28] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#f47f16]"
                >
                  Tạo Photographer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function PageHead({ title, action, onAction }: { title: string;  action: string; onAction: () => void }) {
  return <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
    <div><h1 className="text-[24px] font-semibold">{title}</h1></div>
    <div className="flex gap-2">
      <button onClick={onAction} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#ff8d28] px-4 text-[13px] font-medium text-white shadow-[0_10px_20px_rgba(255,141,40,0.22)] hover:bg-[#f47f16]"><AdminIcon name="add" /> {action}</button>
      <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#ffd2ad] bg-white px-4 text-[13px] font-medium text-[#ff8d28] hover:bg-[#fff8f1]"><AdminIcon name="download" /> Xuất Excel</button>
    </div>
  </div>;
}
function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) { return <section className={`rounded-2xl border border-[#e7e9f1] bg-white p-4 shadow-[0_14px_34px_rgba(12,18,32,0.04)] ${className}`}>{children}</section>; }
function Stat({ title, value, note, tone }: { title: string; value: string; note: string; tone: string }) { return <Panel><div className="flex items-center gap-4"><div className={`h-12 w-12 rounded-2xl ${tone === "orange" ? "bg-orange-50" : tone === "green" ? "bg-emerald-50" : "bg-red-50"}`} /><div><p className="text-[#697086]">{title}</p><b className="mt-1 block text-[22px]">{value}</b><p className="mt-1 text-[11px] text-[#697086]">{note}</p></div></div></Panel>; }
function Select({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) { return <select value={value} onChange={(e) => onChange(e.target.value)} className="!h-10 !min-h-0 !w-full rounded-xl !border !border-[#ffd2ad] bg-white !px-3 !py-0 !text-[12px] !font-normal text-[#ff8d28] !shadow-none outline-none focus:!border-[#ff8d28] focus:ring-2 focus:ring-[#ff8d28]/10">{options.map((o) => <option key={o}>{o}</option>)}</select>; }
function Badge({ text }: { text: string }) { return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${text === "Đã xác minh" ? "bg-emerald-50 text-emerald-700" : text === "Chờ duyệt" ? "bg-orange-50 text-orange-700" : "bg-red-50 text-red-600"}`}>{text}</span>; }
function Info({ label, value }: { label: string; value: string }) { return <div className="grid grid-cols-[118px_minmax(0,1fr)] gap-3"><span className="text-[#697086]">{label}</span><b className="font-medium">{value}</b></div>; }
function EmptyDetail({ text }: { text: string }) { return <div className="col-span-full rounded-xl border border-dashed border-[#dfe3ec] bg-[#fafbfc] p-5 text-center text-[12px] text-[#697086]">{text}</div>; }
function Toast({ text }: { text: string }) { return <div className="fixed right-6 top-20 z-50 rounded-xl border bg-white px-4 py-3 font-medium text-emerald-700 shadow-xl">{text}</div>; }
