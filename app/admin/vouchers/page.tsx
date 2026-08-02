"use client";

import { useEffect, useState } from "react";
import AdminLayout from "../_components/admin-layout";
import { AdminIcon, IconButton } from "../_components/admin-icons";
import { api } from "@/lib/api";

type Voucher = {
  id: number;
  code: string;
  name: string;
  description?: string;
  type: "platform" | "shop" | "shared";
  discount_type: "percentage" | "fixed";
  discount_value: number;
  max_discount_amount?: number | null;
  min_booking_value: number;
  photographer_id?: string | null;
  photographer_name?: string | null;
  platform_share_percent: number;
  shop_share_percent: number;
  quantity: number;
  used_quantity: number;
  start_date: string;
  end_date: string;
  is_active: number;
  created_at: string;
};

export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterActive, setFilterActive] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    loadVouchers();
  }, [page, filterType, filterActive]);

  async function loadVouchers(isResetPage = false) {
    setLoading(true);
    const currentPage = isResetPage ? 1 : page;
    if (isResetPage) setPage(1);

    try {
      const params = {
        page: currentPage,
        pageSize: 10,
        search,
        type: filterType,
        isActive: filterActive
      };
      const result = (await api.vouchers.getAll(params)) as any;
      if (result.success && result.data) {
        setVouchers(result.data);
        if (result.pagination) {
          setTotalPages(result.pagination.totalPages || 1);
        }
      }
    } catch (error) {
      console.error("Error loading vouchers:", error);
    } finally {
      setLoading(false);
    }
  }

  function notify(text: string) {
    setToast(text);
    setTimeout(() => setToast(""), 2500);
  }

  function handleEdit(voucher: Voucher) {
    setSelectedVoucher(voucher);
    setEditModalOpen(true);
  }

  async function handleDelete(id: number) {
    if (!confirm("Bạn có chắc chắn muốn xóa voucher này? Thao tác này sẽ xóa vĩnh viễn dữ liệu liên quan.")) return;
    try {
      const result = (await api.vouchers.delete(id)) as any;
      if (result.success) {
        notify("Voucher đã bị xóa thành công");
        loadVouchers();
      } else {
        alert(result.message || "Lỗi khi xóa voucher");
      }
    } catch (error) {
      notify("Lỗi kết nối");
    }
  }

  async function handleToggleActive(voucher: Voucher) {
    try {
      const newStatus = voucher.is_active === 1 ? 0 : 1;
      const result = (await api.vouchers.update(voucher.id, {
        ...voucher,
        is_active: newStatus,
        start_date: voucher.start_date.substring(0, 19).replace("T", " "),
        end_date: voucher.end_date.substring(0, 19).replace("T", " ")
      })) as any;

      if (result.success) {
        notify(`Đã ${newStatus === 1 ? "kích hoạt" : "hủy kích hoạt"} voucher thành công!`);
        loadVouchers();
      } else {
        alert(result.message || "Lỗi khi cập nhật trạng thái");
      }
    } catch (error) {
      notify("Lỗi kết nối");
    }
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
  };

  return (
    <AdminLayout active="Voucher">
      {toast && <Toast text={toast} />}
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#ff8d28]">
            Khuyến mãi & Ưu đãi
          </p>
          <h1 className="mt-2 text-[28px] font-semibold tracking-tight text-[#0f172a]">
            Quản lý Voucher
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[#596174]">
            Thiết lập các chiến dịch giảm giá của Sàn, Shop, hoặc Đồng tài trợ để thu hút người dùng đặt lịch chụp ảnh.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#ff8d28] px-4 text-[13px] font-semibold text-white shadow-[0_14px_30px_rgba(255,141,40,0.16)] transition hover:bg-[#f47f16]"
          >
            <AdminIcon name="add" className="h-4 w-4" />
            Tạo Voucher mới
          </button>
          <IconButton label="Làm mới" icon="refresh" size="md" onClick={() => loadVouchers(false)} />
        </div>
      </div>

      {/* Filter Options */}
      <div className="grid grid-cols-1 gap-4 rounded-3xl border border-[#e7e9f1] bg-white p-5 shadow-[0_8px_30px_rgba(12,18,32,0.02)] md:grid-cols-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-500">Tìm kiếm theo mã/tên</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nhập mã hoặc tên..."
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-medium focus:border-orange-400 focus:outline-none"
            />
            <button
              onClick={() => loadVouchers(true)}
              className="rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200"
            >
              Tìm
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-500">Loại Voucher</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-medium focus:outline-none"
          >
            <option value="">Tất cả loại</option>
            <option value="platform">Voucher Sàn</option>
            <option value="shop">Voucher Shop</option>
            <option value="shared">Voucher Đồng tài trợ</option>
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-500">Trạng thái</label>
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-medium focus:outline-none"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="1">Đang hoạt động</option>
            <option value="0">Ngưng hoạt động</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={() => {
              setSearch("");
              setFilterType("");
              setFilterActive("");
              setPage(1);
              // reset inputs via loading
              setTimeout(() => loadVouchers(true), 50);
            }}
            className="w-full rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-50 transition"
          >
            Xóa bộ lọc
          </button>
        </div>
      </div>

      <div className="mt-5">
        <section className="rounded-[28px] border border-[#e7e9f1] bg-white p-5 shadow-[0_14px_34px_rgba(12,18,32,0.05)]">
          {loading ? (
            <div className="py-12 text-center text-[#697086]">Đang tải danh sách voucher...</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-0 text-left text-[13px]">
                  <thead className="bg-[#f8fafc] text-[11px] uppercase tracking-[0.18em] text-[#596174]">
                    <tr>
                      <th className="py-4 pr-4 pl-5">Thông tin Voucher</th>
                      <th className="py-4 pr-4">Loại Voucher</th>
                      <th className="py-4 pr-4">Mức giảm giá</th>
                      <th className="py-4 pr-4">Đơn tối thiểu</th>
                      <th className="py-4 pr-4">Đã dùng / Tổng</th>
                      <th className="py-4 pr-4">Hạn sử dụng</th>
                      <th className="py-4 pr-4">Trạng thái</th>
                      <th className="py-4 pr-5 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#edf0f5]">
                    {vouchers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-gray-500">
                          Không tìm thấy voucher giảm giá nào.
                        </td>
                      </tr>
                    ) : (
                      vouchers.map((voucher) => (
                        <tr key={voucher.id} className="transition hover:bg-[#fff8ef]">
                          <td className="py-4 pr-4 pl-5">
                            <div className="min-w-0 max-w-[240px]">
                              <p className="font-black text-[#ff8d28] uppercase text-sm tracking-wide">{voucher.code}</p>
                              <p className="mt-0.5 font-semibold text-[#0f172a] truncate">{voucher.name}</p>
                              {voucher.description && <p className="text-[11px] text-gray-400 truncate">{voucher.description}</p>}
                            </div>
                          </td>
                          <td className="py-4 pr-4">
                            {voucher.type === "platform" && (
                              <span className="inline-flex rounded-full bg-purple-50 px-2.5 py-1 text-[11px] font-semibold text-purple-700">
                                Sàn tài trợ 100%
                              </span>
                            )}
                            {voucher.type === "shop" && (
                              <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                                Shop tài trợ 100%
                              </span>
                            )}
                            {voucher.type === "shared" && (
                              <span className="inline-flex rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-semibold text-teal-700">
                                Sàn {voucher.platform_share_percent}% - Shop {voucher.shop_share_percent}%
                              </span>
                            )}
                            {voucher.photographer_name && (
                              <p className="mt-1 text-[10px] text-slate-500 font-medium">Thợ ảnh: {voucher.photographer_name}</p>
                            )}
                          </td>
                          <td className="py-4 pr-4 font-bold text-slate-800">
                            {voucher.discount_type === "percentage" ? (
                              <span>Giảm {voucher.discount_value}% {voucher.max_discount_amount ? `(Tối đa ${formatCurrency(voucher.max_discount_amount)})` : ""}</span>
                            ) : (
                              <span>Giảm {formatCurrency(voucher.discount_value)}</span>
                            )}
                          </td>
                          <td className="py-4 pr-4 font-medium text-slate-600">
                            Từ {formatCurrency(voucher.min_booking_value)}
                          </td>
                          <td className="py-4 pr-4 font-semibold text-slate-700">
                            {voucher.used_quantity} / {voucher.quantity === -1 ? "∞" : voucher.quantity}
                          </td>
                          <td className="py-4 pr-4 text-[#596174] text-xs">
                            <div>Bắt đầu: {new Date(voucher.start_date).toLocaleDateString("vi-VN")}</div>
                            <div className="mt-0.5">Kết thúc: {new Date(voucher.end_date).toLocaleDateString("vi-VN")}</div>
                          </td>
                          <td className="py-4 pr-4">
                            <button
                              onClick={() => handleToggleActive(voucher)}
                              className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold transition hover:opacity-85 ${
                                voucher.is_active === 1 ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"
                              }`}
                            >
                              {voucher.is_active === 1 ? "Đang chạy" : "Tạm dừng"}
                            </button>
                          </td>
                          <td className="py-4 pr-5 text-right">
                            <div className="flex justify-end gap-2">
                              <IconButton
                                label="Sửa"
                                icon="edit"
                                size="sm"
                                onClick={() => handleEdit(voucher)}
                              />
                              <IconButton
                                label="Xóa"
                                icon="delete"
                                size="sm"
                                onClick={() => handleDelete(voucher.id)}
                              />
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between border-t border-[#f1f3f7] pt-4">
                  <span className="text-xs text-slate-500 font-medium">Trang {page} / {totalPages}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(p - 1, 1))}
                      disabled={page === 1}
                      className="rounded-xl border px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      Trước
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                      disabled={page === totalPages}
                      className="rounded-xl border px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {createModalOpen && (
        <CreateVoucherModal
          onClose={() => setCreateModalOpen(false)}
          onSuccess={() => {
            setCreateModalOpen(false);
            loadVouchers();
            notify("Đã tạo chiến dịch voucher thành công!");
          }}
        />
      )}

      {editModalOpen && selectedVoucher && (
        <EditVoucherModal
          voucher={selectedVoucher}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedVoucher(null);
          }}
          onSuccess={() => {
            setEditModalOpen(false);
            setSelectedVoucher(null);
            loadVouchers();
            notify("Đã cập nhật thông tin voucher thành công!");
          }}
        />
      )}
    </AdminLayout>
  );
}

function CreateVoucherModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    type: "platform",
    discount_type: "percentage",
    discount_value: "",
    max_discount_amount: "",
    min_booking_value: "0",
    platform_share_percent: "100",
    shop_share_percent: "0",
    quantity: "-1",
    photographer_id: "",
    start_date: "",
    end_date: "",
    is_active: "1",
  });
  const [submitting, setSubmitting] = useState(false);

  // Auto-adjust platform/shop splits based on type
  useEffect(() => {
    if (formData.type === "platform") {
      setFormData((prev) => ({
        ...prev,
        platform_share_percent: "100",
        shop_share_percent: "0",
        photographer_id: ""
      }));
    } else if (formData.type === "shop") {
      setFormData((prev) => ({
        ...prev,
        platform_share_percent: "0",
        shop_share_percent: "100"
      }));
    } else if (formData.type === "shared") {
      setFormData((prev) => ({
        ...prev,
        platform_share_percent: "50",
        shop_share_percent: "50"
      }));
    }
  }, [formData.type]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validations
    if (formData.type === "shared") {
      const sum = Number(formData.platform_share_percent) + Number(formData.shop_share_percent);
      if (sum !== 100) {
        alert("Voucher đồng tài trợ phải có tổng tỷ lệ chia sẻ của Sàn và Shop bằng 100%!");
        return;
      }
    }
    if ((formData.type === "shop" || formData.type === "shared") && !formData.photographer_id) {
      alert("Đối với voucher của Shop hoặc Đồng tài trợ, vui lòng nhập Photographer ID áp dụng!");
      return;
    }

    setSubmitting(true);
    try {
      const result = (await api.vouchers.create({
        ...formData,
        max_discount_amount: formData.max_discount_amount ? Number(formData.max_discount_amount) : null,
        photographer_id: formData.photographer_id || null,
        start_date: formData.start_date + " 00:00:00",
        end_date: formData.end_date + " 23:59:59"
      })) as any;

      if (result.success) {
        onSuccess();
      } else {
        alert(result.message || "Lỗi khi tạo voucher");
      }
    } catch (_) {
      alert("Lỗi kết nối");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto" onClick={onClose}>
      <div className="my-8 w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Tạo Voucher giảm giá mới</h2>
          <IconButton label="Đóng" icon="close" onClick={onClose} />
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">Mã Code <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:border-orange-500 uppercase font-black"
                placeholder="VÍ DỤ: APEXSUMMER10"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">Tên chiến dịch <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:border-orange-500"
                placeholder="Giảm 10% mùa cưới..."
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">Mô tả / Điều khoản</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:border-orange-500 h-16 resize-none"
              placeholder="Nhập ghi chú hoặc điều khoản áp dụng mã..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">Loại Voucher</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm focus:outline-none"
              >
                <option value="platform">Voucher Sàn (Sàn chịu 100%)</option>
                <option value="shop">Voucher Shop (Shop chịu 100%)</option>
                <option value="shared">Shared Voucher (Sàn & Shop đóng góp %)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">Photographer ID áp dụng</label>
              <input
                type="text"
                disabled={formData.type === "platform"}
                required={formData.type !== "platform"}
                value={formData.photographer_id}
                onChange={(e) => setFormData({ ...formData, photographer_id: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none disabled:bg-gray-100 disabled:text-gray-400"
                placeholder={formData.type === "platform" ? "Không áp dụng" : "Ví dụ: 3"}
              />
            </div>
          </div>

          {formData.type === "shared" && (
            <div className="grid grid-cols-2 gap-3.5 rounded-2xl bg-orange-50/50 p-3 border border-orange-100">
              <div>
                <label className="mb-1 block text-xs font-semibold text-orange-800">Sàn tài trợ (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={formData.platform_share_percent}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setFormData({
                      ...formData,
                      platform_share_percent: e.target.value,
                      shop_share_percent: String(100 - val)
                    });
                  }}
                  className="w-full rounded-xl border border-orange-200 px-4 py-1.5 text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-orange-800">Shop tài trợ (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={formData.shop_share_percent}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setFormData({
                      ...formData,
                      shop_share_percent: e.target.value,
                      platform_share_percent: String(100 - val)
                    });
                  }}
                  className="w-full rounded-xl border border-orange-200 px-4 py-1.5 text-sm focus:outline-none"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3.5">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">Loại giảm giá</label>
              <select
                value={formData.discount_type}
                onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as any })}
                className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm focus:outline-none"
              >
                <option value="percentage">Phần trăm (%)</option>
                <option value="fixed">Số tiền cố định (đ)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">Trị giá giảm <span className="text-red-500">*</span></label>
              <input
                type="number"
                required
                min="1"
                value={formData.discount_value}
                onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none"
                placeholder={formData.discount_type === "percentage" ? "10" : "100000"}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">Giảm tối đa (VND)</label>
              <input
                type="number"
                disabled={formData.discount_type === "fixed"}
                value={formData.max_discount_amount}
                onChange={(e) => setFormData({ ...formData, max_discount_amount: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none disabled:bg-gray-100"
                placeholder="200000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">Đơn tối thiểu (VND)</label>
              <input
                type="number"
                required
                value={formData.min_booking_value}
                onChange={(e) => setFormData({ ...formData, min_booking_value: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none"
                placeholder="500000"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">Lượt sử dụng (-1 = vô hạn)</label>
              <input
                type="number"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none"
                placeholder="100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">Ngày bắt đầu</label>
              <input
                type="date"
                required
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">Ngày kết thúc</label>
              <input
                type="date"
                required
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-[#ff8d28] px-5 py-2 text-sm font-bold text-white hover:bg-[#e0751b] disabled:opacity-50"
            >
              {submitting ? "Đang tạo..." : "Tạo Voucher"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditVoucherModal({ voucher, onClose, onSuccess }: { voucher: Voucher; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    code: voucher.code,
    name: voucher.name,
    description: voucher.description || "",
    type: voucher.type,
    discount_type: voucher.discount_type,
    discount_value: voucher.discount_value.toString(),
    max_discount_amount: voucher.max_discount_amount ? voucher.max_discount_amount.toString() : "",
    min_booking_value: voucher.min_booking_value.toString(),
    platform_share_percent: voucher.platform_share_percent.toString(),
    shop_share_percent: voucher.shop_share_percent.toString(),
    quantity: voucher.quantity.toString(),
    photographer_id: voucher.photographer_id || "",
    start_date: voucher.start_date.substring(0, 10),
    end_date: voucher.end_date.substring(0, 10),
    is_active: voucher.is_active.toString(),
  });
  const [submitting, setSubmitting] = useState(false);

  // Auto-adjust platform/shop splits based on type
  useEffect(() => {
    if (formData.type === "platform") {
      setFormData((prev) => ({
        ...prev,
        platform_share_percent: "100",
        shop_share_percent: "0",
        photographer_id: ""
      }));
    } else if (formData.type === "shop") {
      setFormData((prev) => ({
        ...prev,
        platform_share_percent: "0",
        shop_share_percent: "100"
      }));
    }
  }, [formData.type]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validations
    if (formData.type === "shared") {
      const sum = Number(formData.platform_share_percent) + Number(formData.shop_share_percent);
      if (sum !== 100) {
        alert("Voucher đồng tài trợ phải có tổng tỷ lệ chia sẻ của Sàn và Shop bằng 100%!");
        return;
      }
    }
    if ((formData.type === "shop" || formData.type === "shared") && !formData.photographer_id) {
      alert("Đối với voucher của Shop hoặc Đồng tài trợ, vui lòng nhập Photographer ID áp dụng!");
      return;
    }

    setSubmitting(true);
    try {
      const result = (await api.vouchers.update(voucher.id, {
        ...formData,
        max_discount_amount: formData.max_discount_amount ? Number(formData.max_discount_amount) : null,
        photographer_id: formData.photographer_id || null,
        start_date: formData.start_date + " 00:00:00",
        end_date: formData.end_date + " 23:59:59"
      })) as any;

      if (result.success) {
        onSuccess();
      } else {
        alert(result.message || "Lỗi khi cập nhật voucher");
      }
    } catch (_) {
      alert("Lỗi kết nối");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto" onClick={onClose}>
      <div className="my-8 w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Chỉnh sửa Voucher</h2>
          <IconButton label="Đóng" icon="close" onClick={onClose} />
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">Mã Code <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:border-orange-500 uppercase font-black"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">Tên chiến dịch <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">Mô tả / Điều khoản</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:border-orange-500 h-16 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">Loại Voucher</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm focus:outline-none"
              >
                <option value="platform">Voucher Sàn (Sàn chịu 100%)</option>
                <option value="shop">Voucher Shop (Shop chịu 100%)</option>
                <option value="shared">Shared Voucher (Sàn & Shop đóng góp %)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">Photographer ID áp dụng</label>
              <input
                type="text"
                disabled={formData.type === "platform"}
                required={formData.type !== "platform"}
                value={formData.photographer_id}
                onChange={(e) => setFormData({ ...formData, photographer_id: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none disabled:bg-gray-100 disabled:text-gray-400"
              />
            </div>
          </div>

          {formData.type === "shared" && (
            <div className="grid grid-cols-2 gap-3.5 rounded-2xl bg-orange-50/50 p-3 border border-orange-100">
              <div>
                <label className="mb-1 block text-xs font-semibold text-orange-800">Sàn tài trợ (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={formData.platform_share_percent}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setFormData({
                      ...formData,
                      platform_share_percent: e.target.value,
                      shop_share_percent: String(100 - val)
                    });
                  }}
                  className="w-full rounded-xl border border-orange-200 px-4 py-1.5 text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-orange-800">Shop tài trợ (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={formData.shop_share_percent}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setFormData({
                      ...formData,
                      shop_share_percent: e.target.value,
                      platform_share_percent: String(100 - val)
                    });
                  }}
                  className="w-full rounded-xl border border-orange-200 px-4 py-1.5 text-sm focus:outline-none"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3.5">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">Loại giảm giá</label>
              <select
                value={formData.discount_type}
                onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as any })}
                className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm focus:outline-none"
              >
                <option value="percentage">Phần trăm (%)</option>
                <option value="fixed">Số tiền cố định (đ)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">Trị giá giảm <span className="text-red-500">*</span></label>
              <input
                type="number"
                required
                min="1"
                value={formData.discount_value}
                onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">Giảm tối đa (VND)</label>
              <input
                type="number"
                disabled={formData.discount_type === "fixed"}
                value={formData.max_discount_amount}
                onChange={(e) => setFormData({ ...formData, max_discount_amount: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none disabled:bg-gray-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">Đơn tối thiểu (VND)</label>
              <input
                type="number"
                required
                value={formData.min_booking_value}
                onChange={(e) => setFormData({ ...formData, min_booking_value: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">Lượt sử dụng (-1 = vô hạn)</label>
              <input
                type="number"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">Ngày bắt đầu</label>
              <input
                type="date"
                required
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">Ngày kết thúc</label>
              <input
                type="date"
                required
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">Trạng thái</label>
            <select
              value={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm focus:outline-none"
            >
              <option value="1">Đang hoạt động (Active)</option>
              <option value="0">Ngưng hoạt động (Inactive)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-[#ff8d28] px-5 py-2 text-sm font-bold text-white hover:bg-[#e0751b] disabled:opacity-50"
            >
              {submitting ? "Đang cập nhật..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Toast({ text }: { text: string }) {
  return (
    <div className="fixed right-6 top-20 z-50 rounded-xl border border-green-200 bg-green-50 px-4 py-3 font-bold text-green-800 shadow-xl">
      {text}
    </div>
  );
}
