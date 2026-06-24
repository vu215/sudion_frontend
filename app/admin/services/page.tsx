"use client";

import { useMemo, useState, useEffect } from "react";
import AdminLayout from "../_components/admin-layout";
import { AdminIcon, IconButton } from "../_components/admin-icons";
import { api } from "@/lib/api";

type Status = "Hoạt động" | "Tạm ẩn";
type Service = {
  id: number;
  name: string;
  slug: string;
  description: string;
  photographers: number;
  packages: number;
  bookings: number;
  status: Status;
  updated_at: string;
};

export default function ServicesPage() {
  const [items, setItems] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [tab, setTab] = useState("Thông tin");
  const [toast, setToast] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const filtered = useMemo(() => items, [items]);
  const selected = items.find((i) => i.id === selectedId) ?? filtered[0];

  // Load services from API
  useEffect(() => {
    async function loadServices() {
      setLoading(true);
      try {
        const params: any = { page, pageSize: 10 };
        
        if (query) params.query = query;

        const result = await api.services.getAll(params);

        if (result.success && result.data) {
          setItems(result.data);
          setPagination(result.pagination);
        }
      } catch (error) {
        console.error("Error loading services:", error);
      }
      setLoading(false);
    }

    loadServices();
  }, [page, query]);

  // Load stats
  useEffect(() => {
    async function loadStats() {
      const result = await api.services.getStats();
      if (result.success) {
        setStats(result.data);
      }
    }
    loadStats();
  }, []);

  function notify(text: string) {
    setToast(text);
    setTimeout(() => setToast(""), 1800);
  }

  function patch(id: number, value: Partial<Service>) {
    setItems((list) =>
      list.map((item) => (item.id === id ? { ...item, ...value } : item))
    );
  }

  async function handleUpdateStatus(id: number, newStatus: Status) {
    // Status toggle is disabled since database doesn't support it
    notify("Tính năng này tạm thời không khả dụng");
    return;
  }

  function openAddModal() {
    setFormData({ name: "", description: "" });
    setAddModalOpen(true);
  }

  function openEditModal() {
    if (selected) {
      setFormData({
        name: selected.name,
        description: selected.description,
      });
      setEditModalOpen(true);
    }
  }

  async function handleCreate() {
    if (!formData.name) {
      notify("Vui lòng nhập tên dịch vụ!");
      return;
    }

    try {
      const result = await api.services.create(formData);

      if (result.success) {
        notify("Đã tạo dịch vụ thành công!");
        setAddModalOpen(false);
        setFormData({ name: "", description: "" });
        window.location.reload();
      } else {
        notify(`Lỗi: ${result.message || result.error || "Không thể tạo"}`);
      }
    } catch (error) {
      notify("Lỗi khi tạo dịch vụ");
      console.error(error);
    }
  }

  async function handleUpdate() {
    if (!selected) return;

    if (!formData.name) {
      notify("Vui lòng nhập tên dịch vụ!");
      return;
    }

    try {
      const result = await api.services.update(selected.id, formData);

      if (result.success) {
        notify("Đã cập nhật dịch vụ thành công!");
        setEditModalOpen(false);
        window.location.reload();
      } else {
        notify(`Lỗi: ${result.message || result.error || "Không thể cập nhật"}`);
      }
    } catch (error) {
      notify("Lỗi khi cập nhật dịch vụ");
      console.error(error);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Bạn có chắc muốn xóa dịch vụ này?")) return;

    try {
      const result = await api.services.delete(id);

      if (result.success) {
        notify("Đã xóa dịch vụ thành công!");
        setSelectedId(null);
        window.location.reload();
      } else {
        notify(`Lỗi: ${result.message || result.error || "Không thể xóa"}`);
      }
    } catch (error) {
      notify("Lỗi khi xóa dịch vụ");
      console.error(error);
    }
  }

  if (loading && items.length === 0) {
    return (
      <AdminLayout active="Dịch vụ" search={query} onSearch={setQuery}>
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
    <AdminLayout active="Dịch vụ" search={query} onSearch={setQuery}>
      {toast ? <Toast text={toast} /> : null}
      <div className="min-w-0">
        <div className="min-w-0">
          <PageHead onAdd={openAddModal} />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Stat title="Tổng danh mục" value={stats?.total?.toString() || "0"} />
            <Stat title="Photographer cung cấp" value={stats?.photographers?.toString() || "0"} />
            <Stat title="Gói dịch vụ" value={stats?.packages?.toString() || "0"} />
            <Stat title="Hoạt động" value={stats?.active?.toString() || "0"} />
          </div>
          <Panel className="mt-4">
            <div className="mb-3 grid gap-2 md:grid-cols-[minmax(0,1fr)_40px]">
              <label className="relative !block">
                <AdminIcon
                  name="search"
                  className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8a93a5]"
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="!h-10 !min-h-0 w-full rounded-xl border border-[#dfe3ec] !py-0 !pl-10 !pr-3 !text-[12px] !font-normal outline-none focus:border-[#ff8d28]"
                  placeholder="Tìm kiếm dịch vụ..."
                />
              </label>
              <IconButton
                label="Đặt lại bộ lọc"
                icon="filter"
                size="md"
                onClick={() => {
                  setQuery("");
                }}
              />
            </div>
            <div className="overflow-x-auto rounded-xl border border-[#e6e9f1]">
              <table className="w-full min-w-[900px] text-left text-[12px]">
                <thead className="bg-[#fbfcfe] text-[#536078]">
                  <tr>
                    {["#", "Danh mục dịch vụ", "Slug", "Số photographer", "Số gói dịch vụ", "Trạng thái", "Thao tác"].map(
                      (h) => (
                        <th key={h} className="px-3 py-3 font-semibold">
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf0f5]">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-3 py-8 text-center text-gray-500">
                        Không có dịch vụ nào
                      </td>
                    </tr>
                  ) : (
                    filtered.map((item) => (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedId(item.id)}
                        className={`cursor-pointer hover:bg-[#fff8f1] ${
                          selectedId === item.id ? "bg-[#fff3e8]" : "bg-white"
                        }`}
                      >
                        <td className="px-3 py-3 text-[#ff8d28]">{item.id}</td>
                        <td className="px-3 py-3">
                          <div>
                            <b>{item.name}</b>
                            <p className="max-w-[260px] truncate text-[#697086]">
                              {item.description}
                            </p>
                          </div>
                        </td>
                        <td className="px-3 py-3">{item.slug}</td>
                        <td className="px-3 py-3">{item.photographers} photographer</td>
                        <td className="px-3 py-3">{item.packages} gói</td>
                        <td className="px-3 py-3">
                          <Badge text={item.status} />
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex gap-2">
                            <IconButton
                              label="Xem chi tiết"
                              icon="eye"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedId(item.id);
                              }}
                            />
                            <IconButton
                              label="Ẩn/hiện"
                              icon="refresh"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateStatus(
                                  item.id,
                                  item.status === "Hoạt động" ? "Tạm ẩn" : "Hoạt động"
                                );
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-center justify-between text-[12px] text-[#697086]">
              <span>
                Hiển thị {filtered.length} của {pagination?.total || items.length} dịch vụ
              </span>
              <div className="flex gap-2">
                {pagination && pagination.page > 1 && (
                  <button
                    onClick={() => setPage(page - 1)}
                    className="rounded-xl border px-3 py-2 hover:bg-gray-50"
                  >
                    Trước
                  </button>
                )}
                <span className="rounded-xl border px-3 py-2">
                  Trang {pagination?.page || 1} / {pagination?.totalPages || 1}
                </span>
                {pagination && pagination.page < pagination.totalPages && (
                  <button
                    onClick={() => setPage(page + 1)}
                    className="rounded-xl border px-3 py-2 hover:bg-gray-50"
                  >
                    Sau
                  </button>
                )}
              </div>
            </div>
          </Panel>
        </div>

        {/* Detail Sidebar */}
        {selectedId !== null && selected ? (
          <div
            className="fixed inset-0 z-50 bg-[#0f172a]/35 backdrop-blur-[2px]"
            onClick={() => setSelectedId(null)}
          >
            <aside
              className="absolute right-0 top-0 h-full w-full min-w-0 overflow-y-auto border-l border-[#e6e9f1] bg-white p-5 shadow-[-18px_0_38px_rgba(12,18,32,0.16)] sm:w-[430px]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-[16px] font-semibold">Chi tiết dịch vụ</h2>
                <IconButton
                  label="Đóng"
                  icon="close"
                  onClick={() => setSelectedId(null)}
                />
              </div>
              <div className="mt-5">
                <div className="flex items-center gap-2">
                  <h3 className="text-[17px] font-semibold">{selected.name}</h3>
                  <Badge text={selected.status} />
                </div>
                <p className="mt-1 text-[#697086]">Slug: {selected.slug}</p>
                <p className="mt-1 text-[#697086]">
                  Cập nhật: {new Date(selected.updated_at).toLocaleString("vi-VN")}
                </p>
              </div>
              <div className="mt-5 flex border-b border-[#edf0f5]">
                {["Thông tin", "Thống kê"].map((name) => (
                  <button
                    key={name}
                    onClick={() => setTab(name)}
                    className={`flex-1 border-b-2 px-2 py-3 text-[12px] font-medium ${
                      tab === name
                        ? "border-[#ff8d28] text-[#ff8d28]"
                        : "border-transparent text-[#697086]"
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
              {tab === "Thông tin" ? (
                <div className="mt-5 space-y-5 text-[12px]">
                  <h3 className="text-[14px] font-semibold">Thông tin cơ bản</h3>
                  <Info label="Tên dịch vụ" value={selected.name} />
                  <Info label="Slug" value={selected.slug} />
                  <div>
                    <p className="text-[#697086]">Mô tả</p>
                    <p className="mt-1 leading-5">{selected.description || "Chưa có mô tả"}</p>
                  </div>
                  <Info label="Số photographer" value={selected.photographers.toString()} />
                  <Info label="Số gói dịch vụ" value={selected.packages.toString()} />
                  <Info label="Số booking" value={selected.bookings.toString()} />
                </div>
              ) : (
                <div className="py-10 text-center text-[#697086]">
                  Nội dung {tab} đang được phát triển.
                </div>
              )}
              <div className="mt-6 flex justify-end gap-2">
                <IconButton
                  label="Xóa"
                  icon="delete"
                  tone="danger"
                  onClick={() => handleDelete(selected.id)}
                />
                <IconButton label="Sửa" icon="edit" onClick={openEditModal} />
              </div>
            </aside>
          </div>
        ) : null}

        {/* Add Service Modal */}
        {addModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/45 backdrop-blur-[3px]"
            onClick={() => setAddModalOpen(false)}
          >
            <div
              className="relative w-full max-w-md rounded-2xl border border-[#e6e9f1] bg-white p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[18px] font-semibold">Thêm Dịch Vụ Mới</h2>
                <IconButton
                  label="Đóng"
                  icon="close"
                  onClick={() => setAddModalOpen(false)}
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-[#536078]">
                    Tên dịch vụ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#dfe3ec] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#ff8d28] focus:ring-2 focus:ring-[#ff8d28]/10"
                    placeholder="VD: Chụp ảnh cưới"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-[#536078]">
                    Mô tả
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#dfe3ec] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#ff8d28] focus:ring-2 focus:ring-[#ff8d28]/10"
                    placeholder="Mô tả ngắn gọn về dịch vụ"
                    rows={3}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => setAddModalOpen(false)}
                  className="rounded-xl border border-[#dfe3ec] bg-white px-4 py-2 text-[13px] font-medium text-[#536078] hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreate}
                  className="rounded-xl bg-[#ff8d28] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#f47f16]"
                >
                  Tạo Dịch Vụ
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Service Modal */}
        {editModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/45 backdrop-blur-[3px]"
            onClick={() => setEditModalOpen(false)}
          >
            <div
              className="relative w-full max-w-md rounded-2xl border border-[#e6e9f1] bg-white p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[18px] font-semibold">Sửa Dịch Vụ</h2>
                <IconButton
                  label="Đóng"
                  icon="close"
                  onClick={() => setEditModalOpen(false)}
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-[#536078]">
                    Tên dịch vụ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#dfe3ec] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#ff8d28] focus:ring-2 focus:ring-[#ff8d28]/10"
                    placeholder="VD: Chụp ảnh cưới"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-[#536078]">
                    Mô tả
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#dfe3ec] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#ff8d28] focus:ring-2 focus:ring-[#ff8d28]/10"
                    placeholder="Mô tả ngắn gọn về dịch vụ"
                    rows={3}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="rounded-xl border border-[#dfe3ec] bg-white px-4 py-2 text-[13px] font-medium text-[#536078] hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleUpdate}
                  className="rounded-xl bg-[#ff8d28] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#f47f16]"
                >
                  Cập Nhật
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function PageHead({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <h1 className="text-[24px] font-semibold">Quản lý dịch vụ</h1>
      </div>
      <div className="flex gap-2">
        <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#ffd2ad] bg-white px-4 text-[#ff8d28]">
          <AdminIcon name="download" /> Xuất Excel
        </button>
        <button
          onClick={onAdd}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#ff8d28] px-4 text-white"
        >
          <AdminIcon name="add" /> Thêm dịch vụ
        </button>
      </div>
    </div>
  );
}
function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section
      className={`rounded-2xl border border-[#e7e9f1] bg-white p-4 shadow-[0_14px_34px_rgba(12,18,32,0.04)] ${className}`}
    >
      {children}
    </section>
  );
}
function Stat({ title, value }: { title: string; value: string }) {
  return (
    <Panel>
      <p className="text-[#697086]">{title}</p>
      <b className="mt-1 block text-[22px]">{value}</b>
      <p className="text-[11px] text-[#697086]">đang hoạt động</p>
    </Panel>
  );
}
function Select({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="!h-10 !min-h-0 !w-full rounded-xl !border !border-[#ffd2ad] bg-white !px-3 !py-0 !text-[12px] !font-normal text-[#ff8d28] !shadow-none outline-none focus:!border-[#ff8d28]"
    >
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  );
}
function Badge({ text }: { text: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${
        text === "Hoạt động" ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700"
      }`}
    >
      {text}
    </span>
  );
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-3">
      <span className="text-[#697086]">{label}</span>
      <b className="font-medium">{value}</b>
    </div>
  );
}
function Toast({ text }: { text: string }) {
  return (
    <div className="fixed right-6 top-20 z-50 rounded-xl border bg-white px-4 py-3 font-medium text-emerald-700 shadow-xl">
      {text}
    </div>
  );
}
