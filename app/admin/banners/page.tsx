"use client";

import { useEffect, useState } from "react";
import AdminLayout from "../_components/admin-layout";
import { AdminIcon, IconButton } from "../_components/admin-icons";
import { api } from "@/lib/api";

type Banner = {
  id: number;
  image_url: string;
  link_url?: string;
  title: string;
  position: string;
  start_date?: string;
  end_date?: string;
  price_paid: number;
  status: "active" | "inactive";
  created_at: string;
};

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    loadBanners();
  }, []);

  async function loadBanners() {
    setLoading(true);
    try {
      const result = (await api.banners.getAll()) as any;
      if (result.success && result.data) {
        setBanners(result.data);
      }
    } catch (error) {
      console.error("Error loading banners:", error);
    } finally {
      setLoading(false);
    }
  }

  function notify(text: string) {
    setToast(text);
    setTimeout(() => setToast(""), 2000);
  }

  function handleEdit(banner: Banner) {
    setSelectedBanner(banner);
    setEditModalOpen(true);
  }

  async function handleDelete(id: number) {
    if (!confirm("Bạn có chắc chắn muốn xóa banner quảng cáo này?")) return;
    try {
      const result = (await api.banners.delete(id)) as any;
      if (result.success) {
        notify("Đoạn banner quảng cáo đã bị xóa");
        loadBanners();
      } else {
        alert(result.message || "Lỗi khi xóa banner");
      }
    } catch (error) {
      notify("Lỗi kết nối");
    }
  }

  return (
    <AdminLayout active="Banner">
      {toast && <Toast text={toast} />}
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#ff8d28]">
            Kinh doanh quảng cáo
          </p>
          <h1 className="mt-2 text-[28px] font-semibold tracking-tight text-[#0f172a]">
            Banner Quảng cáo
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[#596174]">
            Thiết lập, bán vị trí banner quảng cáo ngoài trang chủ để tối ưu doanh thu cho sàn.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#ff8d28] px-4 text-[13px] font-semibold text-white shadow-[0_14px_30px_rgba(255,141,40,0.16)] transition hover:bg-[#f47f16]"
          >
            <AdminIcon name="add" className="h-4 w-4" />
            Thêm Banner mới
          </button>
          <IconButton label="Làm mới" icon="refresh" size="md" onClick={loadBanners} />
        </div>
      </div>

      <div className="mt-5">
        <section className="rounded-[28px] border border-[#e7e9f1] bg-white p-5 shadow-[0_14px_34px_rgba(12,18,32,0.05)]">
          {loading ? (
            <div className="py-12 text-center text-[#697086]">Đang tải danh sách banner...</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-0 text-left text-[13px]">
                  <thead className="bg-[#f8fafc] text-[11px] uppercase tracking-[0.18em] text-[#596174]">
                    <tr>
                      <th className="py-4 pr-4 pl-5">Thông tin Banner</th>
                      <th className="py-4 pr-4">Vị trí</th>
                      <th className="py-4 pr-4">Thời gian chạy</th>
                      <th className="py-4 pr-4 text-right">Doanh thu bán</th>
                      <th className="py-4 pr-4">Trạng thái</th>
                      <th className="py-4 pr-5 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#edf0f5]">
                    {banners.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500">
                          Chưa có banner quảng cáo nào được thiết lập.
                        </td>
                      </tr>
                    ) : (
                      banners.map((banner) => (
                        <tr key={banner.id} className="transition hover:bg-[#fff8ef]">
                          <td className="py-4 pr-4 pl-5">
                            <div className="flex items-center gap-3.5">
                              <img
                                src={banner.image_url}
                                alt={banner.title}
                                className="h-12 w-24 rounded-lg object-cover border"
                              />
                              <div className="min-w-0 max-w-[280px]">
                                <p className="font-semibold text-[#0f172a] truncate">{banner.title}</p>
                                <p className="text-[11px] text-gray-500 truncate">{banner.link_url || "Không có link"}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 pr-4 font-semibold text-gray-700">{banner.position}</td>
                          <td className="py-4 pr-4 text-[#596174]">
                            {banner.start_date ? new Date(banner.start_date).toLocaleDateString("vi-VN") : "Bất đầu"}
                            {" - "}
                            {banner.end_date ? new Date(banner.end_date).toLocaleDateString("vi-VN") : "Vô thời hạn"}
                          </td>
                          <td className="py-4 pr-4 text-right font-bold text-emerald-600">
                            {new Intl.NumberFormat("vi-VN").format(banner.price_paid)}đ
                          </td>
                          <td className="py-4 pr-4">
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                              banner.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-700"
                            }`}>
                              {banner.status === "active" ? "Đang chạy" : "Tạm dừng"}
                            </span>
                          </td>
                          <td className="py-4 pr-5 text-right">
                            <div className="flex justify-end gap-2">
                              <IconButton
                                label="Sửa"
                                icon="edit"
                                size="sm"
                                onClick={() => handleEdit(banner)}
                              />
                              <IconButton
                                label="Xóa"
                                icon="delete"
                                size="sm"
                                onClick={() => handleDelete(banner.id)}
                              />
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </div>

      {createModalOpen && (
        <CreateBannerModal
          onClose={() => setCreateModalOpen(false)}
          onSuccess={() => {
            setCreateModalOpen(false);
            loadBanners();
            notify("Đã tạo banner quảng cáo thành công!");
          }}
        />
      )}

      {editModalOpen && selectedBanner && (
        <EditBannerModal
          banner={selectedBanner}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedBanner(null);
          }}
          onSuccess={() => {
            setEditModalOpen(false);
            setSelectedBanner(null);
            loadBanners();
            notify("Đã cập nhật banner quảng cáo thành công!");
          }}
        />
      )}
    </AdminLayout>
  );
}

function CreateBannerModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    title: "",
    image_url: "",
    link_url: "",
    position: "home_hero",
    start_date: "",
    end_date: "",
    price_paid: "",
    status: "active",
  });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = (await api.banners.create(formData)) as any;
      if (result.success) {
        onSuccess();
      } else {
        alert(result.message || "Lỗi khi tạo banner");
      }
    } catch (_) {
      alert("Lỗi kết nối");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Tạo Banner mới</h2>
          <IconButton label="Đóng" icon="close" onClick={onClose} />
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Tiêu đề quảng cáo <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:border-orange-500"
              placeholder="Ví dụ: Giảm giá album cưới mùa hè..."
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">URL hình ảnh <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:border-orange-500"
              placeholder="https://images.unsplash.com/..."
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Link điều hướng (URL)</label>
            <input
              type="text"
              value={formData.link_url}
              onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:border-orange-500"
              placeholder="/photographer?category=wedding"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Vị trí</label>
              <select
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none"
              >
                <option value="home_hero">Home Hero Banner</option>
                <option value="home_sidebar">Home Sidebar</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Giá bán (VND)</label>
              <input
                type="number"
                value={formData.price_paid}
                onChange={(e) => setFormData({ ...formData, price_paid: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none"
                placeholder="2000000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Bắt đầu</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Kết thúc</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Trạng thái</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none"
            >
              <option value="active">Đang chạy (Active)</option>
              <option value="inactive">Tạm dừng (Inactive)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-[#ff8d28] px-4 py-2 text-sm font-medium text-white hover:bg-[#e0751b] disabled:opacity-50"
            >
              {submitting ? "Đang tạo..." : "Tạo Banner"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditBannerModal({ banner, onClose, onSuccess }: { banner: Banner; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    title: banner.title,
    image_url: banner.image_url,
    link_url: banner.link_url || "",
    position: banner.position,
    start_date: banner.start_date ? banner.start_date.substring(0, 10) : "",
    end_date: banner.end_date ? banner.end_date.substring(0, 10) : "",
    price_paid: banner.price_paid.toString(),
    status: banner.status,
  });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = (await api.banners.update(banner.id, formData)) as any;
      if (result.success) {
        onSuccess();
      } else {
        alert(result.message || "Lỗi khi cập nhật banner");
      }
    } catch (_) {
      alert("Lỗi kết nối");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Chỉnh sửa Banner</h2>
          <IconButton label="Đóng" icon="close" onClick={onClose} />
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Tiêu đề quảng cáo <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">URL hình ảnh <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Link điều hướng (URL)</label>
            <input
              type="text"
              value={formData.link_url}
              onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Vị trí</label>
              <select
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none"
              >
                <option value="home_hero">Home Hero Banner</option>
                <option value="home_sidebar">Home Sidebar</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Giá bán (VND)</label>
              <input
                type="number"
                value={formData.price_paid}
                onChange={(e) => setFormData({ ...formData, price_paid: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Bắt đầu</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Kết thúc</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Trạng thái</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none"
            >
              <option value="active">Đang chạy (Active)</option>
              <option value="inactive">Tạm dừng (Inactive)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-[#ff8d28] px-4 py-2 text-sm font-medium text-white hover:bg-[#e0751b] disabled:opacity-50"
            >
              {submitting ? "Đang cập nhật..." : "Cập nhật"}
            </button>
          </div>
        </form>
      </div>
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
