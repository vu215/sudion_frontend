"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/app/auth-context";
import { useToast } from "@/app/toast-context";
import { getPortfolioByPhotographer, uploadPortfolioItem, updatePortfolioItemCaption, deletePortfolioItem, type PortfolioItem } from "../api";

export default function PhotographerPortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [caption, setCaption] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [editId, setEditId] = useState<string | number | null>(null);
  const [editCaption, setEditCaption] = useState("");
  const [lightbox, setLightbox] = useState<PortfolioItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const { session, isPhotographer } = useAuth();

  const photographerId = useMemo(() => {
    if (isPhotographer && session?.photographerId) return session.photographerId;
    if (typeof window !== "undefined") return window.localStorage.getItem("sudion_photographer_id") ?? "";
    return "";
  }, [isPhotographer, session]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(f);
  }

  useEffect(() => {
    if (!photographerId) return;
    setLoading(true);
    setError("");

    getPortfolioByPhotographer(photographerId)
      .then((items) => setItems(items))
      .catch((error) => setError(error instanceof Error ? error.message : "Không thể tải portfolio."))
      .finally(() => setLoading(false));
  }, [photographerId]);

  async function handleAdd() {
    if (!preview || !file) return;
    if (!photographerId) {
      setError("Không xác định Photographer ID.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("caption", caption);

      const item = await uploadPortfolioItem(photographerId, formData);
      setItems((cur) => [item, ...cur]);
      setPreview(null);
      setFile(null);
      setCaption("");
      if (inputRef.current) inputRef.current.value = "";
      toast.success("Thêm ảnh", "Ảnh đã được tải lên portfolio.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể tải ảnh lên.";
      setError(message);
      toast.error("Lỗi upload", message);
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string | number) {
    if (!window.confirm("Bạn có chắc muốn xoá ảnh này khỏi portfolio?")) return;
    try {
      await deletePortfolioItem(String(id));
      setItems((cur) => cur.filter((i) => i.id !== id));
      toast.success("Xoá ảnh", "Ảnh đã được xoá.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể xoá ảnh.";
      setError(message);
      toast.error("Lỗi xoá", message);
    }
  }

  async function handleSaveEdit(id: string | number) {
    try {
      const updated = await updatePortfolioItemCaption(String(id), editCaption);
      setItems((cur) => cur.map((i) => (i.id === id ? updated : i)));
      setEditId(null);
      toast.success("Cập nhật chú thích", "Chú thích đã được cập nhật.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể cập nhật chú thích.";
      setError(message);
      toast.error("Lỗi cập nhật", message);
    }
  }

  return (
    <div className="px-5 py-6 lg:px-8">
      <div className="mx-auto max-w-[1100px] space-y-6 pb-10">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-orange-500">Portfolio</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-800">Quản lý ảnh mẫu</h1>
            <p className="mt-1 text-sm text-slate-400">Thêm ảnh để khách hàng tham khảo phong cách của bạn.</p>
          </div>
          <button
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-orange-600 transition"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Thêm ảnh mới
          </button>
        </div>

        {/* Upload form */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="mb-3 text-sm font-bold text-slate-700">Thêm ảnh vào portfolio</p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            {/* Drop zone */}
            <div
              onClick={() => inputRef.current?.click()}
              className="flex h-36 w-40 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 hover:border-orange-300 hover:bg-orange-50 transition"
            >
              {preview ? (
                <img src={preview} alt="preview" className="h-full w-full object-cover" />
              ) : (
                <div className="text-center p-3">
                  <svg className="mx-auto h-8 w-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="mt-1 text-[11px] text-slate-400">Chọn ảnh</p>
                </div>
              )}
            </div>
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            <div className="flex flex-1 flex-col gap-3">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-500">Chú thích (tuỳ chọn)</label>
                <input
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Mô tả ngắn về ảnh này..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-orange-400 focus:bg-white transition"
                />
              </div>
              <button
                onClick={handleAdd}
                disabled={!preview || uploading}
                className="self-start rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-50 transition"
              >
                {uploading ? "Đang thêm..." : "Thêm vào portfolio"}
              </button>
            </div>
          </div>
        </div>

        {/* Grid */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-16 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-orange-100">
              <svg className="h-7 w-7 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-base font-bold text-slate-700">Chưa có ảnh nào</p>
            <p className="mt-1 text-sm text-slate-400">Nhấn "Thêm ảnh mới" để bắt đầu xây dựng portfolio.</p>
          </div>
        ) : (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <article key={item.id} className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                <div
                  className="relative h-48 cursor-pointer overflow-hidden bg-slate-100"
                  onClick={() => setLightbox(item)}
                >
                  <img src={item.url} alt={item.caption} className="h-full w-full object-cover transition group-hover:scale-105 duration-300" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition" />
                </div>
                <div className="p-3">
                  {editId === item.id ? (
                    <div className="flex gap-2">
                      <input
                        value={editCaption}
                        onChange={(e) => setEditCaption(e.target.value)}
                        className="flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs outline-none focus:border-orange-400"
                        autoFocus
                      />
                      <button onClick={() => handleSaveEdit(item.id)}
                        className="rounded-lg bg-emerald-500 px-2 py-1 text-xs font-bold text-white">✓</button>
                      <button onClick={() => setEditId(null)}
                        className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-500">✕</button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-xs font-medium text-slate-600">{item.caption || "Không có chú thích"}</p>
                      <div className="flex shrink-0 gap-1">
                        <button onClick={() => { setEditId(item.id); setEditCaption(item.caption); }}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition">
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => handleDelete(item.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 transition">
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </section>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <img src={lightbox.url} alt={lightbox.caption} className="max-h-[80vh] rounded-2xl object-contain" />
            {lightbox.caption && (
              <p className="mt-2 text-center text-sm text-white/80">{lightbox.caption}</p>
            )}
            <button
              onClick={() => setLightbox(null)}
              className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-700 shadow-lg hover:bg-slate-100"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
