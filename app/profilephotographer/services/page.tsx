"use client";

import { useState } from "react";

type Service = {
  id: string;
  name: string;
  category: string;
  duration: string;
  price: number;
  description: string;
  active: boolean;
};

const CATEGORIES = ["Cưới hỏi","Kỷ yếu","Chân dung","Food & Product","Sự kiện","Travel","Cặp đôi","Khác"];

const EMPTY: Omit<Service, "id" | "active"> = { name: "", category: "Cưới hỏi", duration: "2 giờ", price: 0, description: "" };

export default function PhotographerServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY });
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function openNew() { setForm({ ...EMPTY }); setEditId(null); setShowForm(true); }
  function openEdit(s: Service) { setForm({ name: s.name, category: s.category, duration: s.duration, price: s.price, description: s.description }); setEditId(s.id); setShowForm(true); }

  function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);
    setTimeout(() => {
      if (editId) {
        setServices((cur) => cur.map((s) => s.id === editId ? { ...s, ...form } : s));
      } else {
        setServices((cur) => [...cur, { id: Date.now().toString(), active: true, ...form }]);
      }
      setShowForm(false);
      setEditId(null);
      setSaving(false);
    }, 500);
  }

  function handleToggle(id: string) {
    setServices((cur) => cur.map((s) => s.id === id ? { ...s, active: !s.active } : s));
  }

  function handleDelete(id: string) {
    setServices((cur) => cur.filter((s) => s.id !== id));
  }

  return (
    <div className="px-5 py-6 lg:px-8">
      <div className="mx-auto max-w-[1100px] space-y-6 pb-10">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-orange-500">Dịch vụ</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-800">Dịch vụ của tôi</h1>
            <p className="mt-1 text-sm text-slate-400">Tạo và quản lý các gói chụp cho khách hàng đặt lịch.</p>
          </div>
          <button
            onClick={openNew}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-orange-600 transition"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tạo dịch vụ mới
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-bold text-slate-800">{editId ? "Chỉnh sửa dịch vụ" : "Tạo dịch vụ mới"}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-500">Tên dịch vụ *</label>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Vd: Gói chụp cưới Premium"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:bg-white transition" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-500">Danh mục</label>
                <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:bg-white transition">
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-500">Thời lượng</label>
                <input value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                  placeholder="Vd: 2 giờ"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:bg-white transition" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-500">Giá (VNĐ)</label>
                <input type="number" min={0} value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
                  placeholder="Vd: 2000000"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:bg-white transition" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-bold text-slate-500">Mô tả</label>
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3} placeholder="Mô tả ngắn về gói dịch vụ này..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:bg-white resize-none transition" />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={handleSave} disabled={saving || !form.name.trim()}
                className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-50 transition">
                {saving ? "Đang lưu..." : editId ? "Lưu thay đổi" : "Tạo dịch vụ"}
              </button>
              <button onClick={() => setShowForm(false)}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition">
                Huỷ
              </button>
            </div>
          </div>
        )}

        {/* List */}
        {services.length === 0 && !showForm ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-16 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-orange-100">
              <svg className="h-7 w-7 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-base font-bold text-slate-700">Chưa có dịch vụ nào</p>
            <p className="mt-1 text-sm text-slate-400">Nhấn "Tạo dịch vụ mới" để thêm gói chụp của bạn.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <article key={s.id} className={`rounded-2xl border bg-white shadow-sm transition ${s.active ? "border-slate-100" : "border-slate-100 opacity-60"}`}>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="inline-block rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-500">{s.category}</span>
                      <h3 className="mt-1.5 text-sm font-bold text-slate-800">{s.name}</h3>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${s.active ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                      {s.active ? "Đang chạy" : "Tạm ẩn"}
                    </span>
                  </div>
                  {s.description && <p className="mt-2 text-xs text-slate-400 line-clamp-2">{s.description}</p>}
                  <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {s.duration}
                    </span>
                    <span className="font-bold text-slate-700">{s.price.toLocaleString("vi-VN")}đ</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 border-t border-slate-50 px-4 py-2.5">
                  <button onClick={() => openEdit(s)}
                    className="flex-1 rounded-lg py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition">
                    Chỉnh sửa
                  </button>
                  <div className="h-4 w-px bg-slate-100" />
                  <button onClick={() => handleToggle(s.id)}
                    className="flex-1 rounded-lg py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition">
                    {s.active ? "Ẩn" : "Hiện"}
                  </button>
                  <div className="h-4 w-px bg-slate-100" />
                  <button onClick={() => handleDelete(s.id)}
                    className="flex-1 rounded-lg py-1.5 text-xs font-semibold text-red-400 hover:bg-red-50 hover:text-red-600 transition">
                    Xoá
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
