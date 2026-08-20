"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useToast } from "@/app/toast-context";
import {
  createPhotographerPackage,
  deletePhotographerPackage,
  formatCurrency,
  getMyPhotographerProfile,
  getPhotographerPublicProfile,
  updatePhotographerPackage,
  type PhotographerPackage,
} from "../photographer-api";

type PackageForm = {
  name: string;
  price: string;
  duration: string;
  description: string;
};

const emptyForm: PackageForm = { name: "", price: "", duration: "120", description: "" };

export default function PhotographerServicesPage() {
  const [packages, setPackages] = useState<PhotographerPackage[]>([]);
  const [photographerId, setPhotographerId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState<PackageForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setFormOpen(true);
  }

  function openEdit(item: PhotographerPackage) {
    setEditingId(item.id);
    setForm({
      name: item.name || "",
      price: String(item.price || ""),
      duration: String(item.duration || Number.parseInt(item.duration_text || "120", 10) || 120),
      description: item.description || "",
    });
    setFormOpen(true);
  }

  async function savePackage() {
    const price = Number(form.price);
    const duration = Number(form.duration);
    if (!form.name.trim() || !Number.isFinite(price) || price <= 0 || !Number.isFinite(duration) || duration <= 0) {
      toast.warning("Thiếu thông tin", "Vui lòng nhập tên, giá và thời lượng hợp lệ.");
      return;
    }

    try {
      setSaving(true);
      const payload = { name: form.name.trim(), price, duration, description: form.description.trim() };
      const saved = editingId
        ? await updatePhotographerPackage(editingId, payload)
        : await createPhotographerPackage(payload);
      setPackages((current) => editingId
        ? current.map((item) => item.id === editingId ? { ...item, ...saved } : item)
        : [...current, saved]);
      setFormOpen(false);
      toast.success("Đã lưu", editingId ? "Gói dịch vụ đã được cập nhật." : "Gói dịch vụ đã được thêm.");
    } catch (err) {
      toast.error("Lỗi", err instanceof Error ? err.message : "Không thể lưu gói dịch vụ.");
    } finally {
      setSaving(false);
    }
  }

  async function removePackage(item: PhotographerPackage) {
    if (!window.confirm(`Xóa gói “${item.name}”?`)) return;
    try {
      await deletePhotographerPackage(item.id);
      setPackages((current) => current.filter((entry) => entry.id !== item.id));
      toast.success("Đã xóa", "Gói dịch vụ đã được xóa.");
    } catch (err) {
      toast.error("Lỗi", err instanceof Error ? err.message : "Không thể xóa gói dịch vụ.");
    }
  }

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        setError("");
        const me = await getMyPhotographerProfile();
        const id = String(me.photographer_id || me.photographer?.id || "");
        const publicProfile = id ? await getPhotographerPublicProfile(id) : null;
        if (!alive) return;
        setPhotographerId(id);
        setPackages(publicProfile?.packages || []);
      } catch (err) {
        if (alive) setError(err instanceof Error ? err.message : "Không thể tải dịch vụ.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    void load();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <main className="px-6 py-7 lg:px-8 xl:px-10">
      <div className="mx-auto max-w-[1080px] space-y-6 pb-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1a1a2e]">Dịch vụ</h1>
            <p className="mt-1 text-sm text-slate-500">
              Danh sách gói chụp đang hiển thị cho khách hàng.
            </p>
          </div>
          <Link
            href="/profile"
            onClick={(event) => { event.preventDefault(); openCreate(); }}
            className="rounded-xl bg-[#ff8d28] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#e07820]"
          >
            + Thêm dịch vụ
          </Link>
        </div>

        {formOpen ? (
          <section className="rounded-3xl border border-orange-200 bg-orange-50/50 p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">{editingId ? "Sửa gói dịch vụ" : "Thêm gói dịch vụ"}</h2>
              <button type="button" onClick={() => setFormOpen(false)} className="text-sm font-semibold text-slate-500">Hủy</button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Tên gói dịch vụ" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-400" />
              <input type="number" min="1" value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} placeholder="Giá (VNĐ)" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-400" />
              <input type="number" min="1" value={form.duration} onChange={(event) => setForm((current) => ({ ...current, duration: event.target.value }))} placeholder="Thời lượng (phút)" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-400" />
              <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Mô tả gói dịch vụ" className="min-h-12 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-400 sm:col-span-2" />
            </div>
            <button type="button" disabled={saving} onClick={() => void savePackage()} className="mt-4 rounded-xl bg-[#ff8d28] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60">{saving ? "Đang lưu..." : "Lưu dịch vụ"}</button>
          </section>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">
            {error}
          </div>
        ) : null}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          {loading ? (
            <div className="grid gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
              ))}
            </div>
          ) : packages.length ? (
            <div className="grid gap-4">
              {packages.map((item) => (
                <article
                  key={item.id}
                  className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:grid-cols-[1fr_auto]"
                >
                  <div>
                    <p className="text-base font-bold text-slate-900">{item.name}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {item.category?.name || "Dịch vụ"} · {item.duration_text || "Theo gói"}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {item.description || "Chưa có mô tả chi tiết."}
                    </p>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-lg font-black text-[#ff8d28]">{formatCurrency(item.price)}</p>
                    <div className="mt-3 flex justify-end gap-2">
                      <button type="button" onClick={() => openEdit(item)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:border-orange-200 hover:text-[#ff8d28]">Sửa</button>
                      <button type="button" onClick={() => void removePackage(item)} className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600">Xóa</button>
                    </div>
                    {photographerId ? (
                      <Link
                        href={`/photographer/${photographerId}`}
                        className="mt-3 inline-flex rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-orange-200 hover:text-[#ff8d28]"
                      >
                        Xem public profile
                      </Link>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-slate-600">
              Chưa có gói dịch vụ nào. Hãy cập nhật hồ sơ photographer để khách có thể đặt lịch.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
