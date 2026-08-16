"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "@/app/toast-context";
import {
  createPortfolioItem,
  deletePortfolioItem,
  getMyPortfolio,
  reorderPortfolioItems,
  resolveAssetUrl,
  updatePortfolioItem,
  type PhotographerPortfolioItem,
} from "../photographer-api";

const DEFAULT_CATEGORY = "Portrait";

export default function PhotographerPortfolioPage() {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [items, setItems] = useState<PhotographerPortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addForm, setAddForm] = useState({
    file: null as File | null,
    imageUrl: "",
    caption: "",
    category_name: DEFAULT_CATEGORY,
    is_featured: false,
  });
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [draggedId, setDraggedId] = useState<number | string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(true);

  const loadPortfolio = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getMyPortfolio();
      setItems(result);
    } catch (error) {
      toast.error("Lỗi", error instanceof Error ? error.message : "Không thể tải portfolio.");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadPortfolio();
  }, [loadPortfolio]);

  const sortedItems = [...items].sort((a, b) => {
    const aOrder = typeof a.sort_order === "number" ? a.sort_order : Number(a.order ?? 0);
    const bOrder = typeof b.sort_order === "number" ? b.sort_order : Number(b.order ?? 0);
    return aOrder - bOrder;
  });

  function handleFileSelected(file: File | null) {
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setAddForm((prev) => ({
      ...prev,
      file,
      imageUrl,
      caption: prev.caption || "",
      category_name: prev.category_name || DEFAULT_CATEGORY,
    }));
    setIsFormOpen(true);
  }

  async function handleCreatePortfolio() {
    if (!addForm.file && !addForm.imageUrl) {
      toast.warning("Thiếu ảnh", "Vui lòng chọn ảnh để thêm vào portfolio.");
      return;
    }

    try {
      setSaving(true);

      let imageUrl = addForm.imageUrl;
      if (addForm.file) {
        const uploadForm = new FormData();
        uploadForm.append("file", addForm.file);

        const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/uploads`, {
          method: "POST",
          headers: {
            ...(typeof window !== "undefined" && window.localStorage.getItem("sudion_token")
              ? { Authorization: `Bearer ${window.localStorage.getItem("sudion_token")}` }
              : {}),
          },
          body: uploadForm,
        });

        const uploadJson = await uploadRes.json();
        if (!uploadRes.ok || !uploadJson.success) {
          throw new Error(uploadJson.message || "Không thể tải ảnh lên.");
        }

        imageUrl = uploadJson.data?.url || uploadJson.data?.image_url || imageUrl;
      }

      const created = await createPortfolioItem({
        image_url: imageUrl,
        caption: addForm.caption.trim(),
        category_name: addForm.category_name.trim() || DEFAULT_CATEGORY,
        is_featured: addForm.is_featured,
      });

      setItems((prev) => [...prev, created]);
      setAddForm({
        file: null,
        imageUrl: "",
        caption: "",
        category_name: DEFAULT_CATEGORY,
        is_featured: false,
      });
      setIsFormOpen(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.success("Đã thêm ảnh", "Ảnh đã được đưa vào portfolio.");
    } catch (error) {
      toast.error("Lỗi", error instanceof Error ? error.message : "Không thể thêm ảnh.");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdatePortfolio(id: number | string, payload: Partial<PhotographerPortfolioItem>) {
    try {
      setSaving(true);
      const updated = await updatePortfolioItem(id, {
        caption: payload.caption ?? "",
        category_name: payload.category_name ?? "",
        is_featured: payload.is_featured ?? false,
        image_url: payload.image_url ?? payload.image ?? "",
      });

      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updated } : item)),
      );

      if (payload.is_featured) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === id
              ? { ...item, is_featured: true, featured: true }
              : { ...item, is_featured: false, featured: false },
          ),
        );
      }

      toast.success("Đã cập nhật", "Thông tin ảnh portfolio đã được lưu.");
      setEditingId(null);
    } catch (error) {
      toast.error("Lỗi", error instanceof Error ? error.message : "Không thể cập nhật ảnh.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeletePortfolio(id: number | string) {
    const confirmed = window.confirm("Bạn có chắc muốn xóa ảnh này khỏi portfolio?");
    if (!confirmed) return;

    try {
      setSaving(true);
      await deletePortfolioItem(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      toast.success("Đã xóa", "Ảnh đã được loại khỏi portfolio.");
    } catch (error) {
      toast.error("Lỗi", error instanceof Error ? error.message : "Không thể xóa ảnh.");
    } finally {
      setSaving(false);
    }
  }

  async function handleFeaturedToggle(item: PhotographerPortfolioItem, nextValue: boolean) {
    if (!nextValue) {
      await handleUpdatePortfolio(item.id, { ...item, is_featured: false, featured: false });
      return;
    }

    const nextItems = items.map((image) => ({
      ...image,
      is_featured: image.id === item.id,
      featured: image.id === item.id,
    }));

    setItems(nextItems);

    try {
      setSaving(true);
      await Promise.all(
        nextItems.map((entry) =>
          updatePortfolioItem(entry.id, {
            caption: entry.caption || "",
            category_name: entry.category_name || "",
            is_featured: entry.is_featured || false,
            image_url: entry.image_url || entry.image || "",
          }),
        ),
      );
      toast.success("Đã cập nhật ảnh nổi bật", "Ảnh này sẽ xuất hiện đầu tiên trên hồ sơ.");
    } catch (error) {
      toast.error("Lỗi", error instanceof Error ? error.message : "Không thể cập nhật ảnh nổi bật.");
    } finally {
      setSaving(false);
    }
  }

  async function handleReorder(sourceId: number | string, targetId: number | string) {
    if (sourceId === targetId) return;

    const nextItems = [...sortedItems];
    const sourceIndex = nextItems.findIndex((item) => item.id === sourceId);
    const targetIndex = nextItems.findIndex((item) => item.id === targetId);

    if (sourceIndex < 0 || targetIndex < 0) return;

    const [moved] = nextItems.splice(sourceIndex, 1);
    nextItems.splice(targetIndex, 0, moved);

    const normalized = nextItems.map((item, index) => ({
      ...item,
      sort_order: index + 1,
      order: index + 1,
    }));

    setItems(normalized);

    try {
      setSaving(true);
      await reorderPortfolioItems(normalized.map((item) => item.id));
      toast.success("Đã sắp xếp lại", "Thứ tự portfolio đã được lưu.");
    } catch (error) {
      toast.error("Lỗi", error instanceof Error ? error.message : "Không thể sắp xếp portfolio.");
      void loadPortfolio();
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="px-6 py-7 lg:px-8 xl:px-10">
      <div className="mx-auto max-w-[1100px] space-y-6 pb-12">
        <div className="flex flex-col gap-4 rounded-[28px] border border-[#edf0f5] bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#ff8d28]">Portfolio</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-[#101827]">Quản lý ảnh portfolio</h1>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsFormOpen(true);
              fileInputRef.current?.click();
            }}
            className="inline-flex cursor-pointer items-center justify-center rounded-2xl bg-[#ff8d28] px-5 py-3 text-sm font-black text-white shadow-[0_10px_25px_rgba(255,141,40,0.25)] transition hover:bg-[#e0771e]"
          >
            + Thêm ảnh
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              handleFileSelected(file);
              event.target.value = "";
            }}
          />
        </div>

        {isFormOpen ? (
          <div className="rounded-[28px] border border-dashed border-[#f4b07a] bg-[#fff9f4] p-5 shadow-[0_10px_30px_rgba(15,23,42,0.02)]">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-lg font-black text-[#101827]">Thêm ảnh mới</h2>
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  setAddForm({ file: null, imageUrl: "", caption: "", category_name: DEFAULT_CATEGORY, is_featured: false });
                }}
                className="text-sm font-semibold text-slate-500 hover:text-[#ff8d28]"
              >
                Hủy
              </button>
            </div>

            <div className="grid gap-5 md:grid-cols-[180px_1fr]">
              <div className="flex items-center justify-center overflow-hidden rounded-2xl border border-[#edf0f5] bg-white">
                {addForm.imageUrl ? (
                  <img
                    src={resolveAssetUrl(addForm.imageUrl)}
                    alt="Preview"
                    className="h-[180px] w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.src = "https://images.pexels.com/photos/3775532/pexels-photo-3775532.jpeg?auto=compress&cs=tinysrgb&w=900";
                    }}
                  />
                ) : (
                  <div className="flex h-[180px] w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                    Preview
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Mô tả ảnh</label>
                  <input
                    value={addForm.caption}
                    onChange={(event) => setAddForm((prev) => ({ ...prev, caption: event.target.value }))}
                    placeholder="Ví dụ: Chụp cưới tại Hà Nội"
                    className="w-full rounded-2xl border border-[#e5e7eb] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#ff8d28]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Phân loại</label>
                  <input
                    value={addForm.category_name}
                    onChange={(event) => setAddForm((prev) => ({ ...prev, category_name: event.target.value }))}
                    placeholder="Ví dụ: Portrait, Cưới, Sự kiện, Sản phẩm..."
                    className="w-full rounded-2xl border border-[#e5e7eb] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#ff8d28]"
                  />
                </div>

                <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={addForm.is_featured}
                    onChange={(event) => setAddForm((prev) => ({ ...prev, is_featured: event.target.checked }))}
                    className="h-4 w-4 accent-[#ff8d28]"
                  />
                  Chọn làm ảnh nổi bật
                </label>

                <div className="flex justify-end">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={handleCreatePortfolio}
                    className="rounded-2xl bg-[#ff8d28] px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#e0771e] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? "Đang xử lý..." : "Lưu ảnh"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-[280px] animate-pulse rounded-[26px] bg-slate-100" />
            ))}
          </div>
        ) : sortedItems.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {sortedItems.map((item, index) => {
              const isEditing = editingId === item.id;
              const imageUrl = resolveAssetUrl(item.image_url || item.image || item.url || "");

              return (
                <div
                  key={String(item.id)}
                  draggable
                  onDragStart={() => setDraggedId(item.id)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => {
                    if (draggedId && draggedId !== item.id) {
                      void handleReorder(draggedId, item.id);
                    }
                    setDraggedId(null);
                  }}
                  className="group overflow-hidden rounded-[28px] border border-[#edf0f5] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={imageUrl || "https://images.pexels.com/photos/3775532/pexels-photo-3775532.jpeg?auto=compress&cs=tinysrgb&w=900"}
                      alt={item.caption || `Portfolio ${index + 1}`}
                      className="h-[250px] w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    <div className="absolute left-3 top-3 flex items-center gap-2">
                      <span className="rounded-full border border-white/50 bg-slate-950/40 px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white">
                        #{index + 1}
                      </span>
                      {item.is_featured || item.featured ? (
                        <span className="rounded-full bg-[#ff8d28] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white">
                          Nổi bật
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="space-y-3 p-4">
                    {isEditing ? (
                      <div className="space-y-3">
                        <input
                          value={item.caption || ""}
                          onChange={(event) =>
                            setItems((prev) =>
                              prev.map((entry) =>
                                entry.id === item.id ? { ...entry, caption: event.target.value } : entry,
                              ),
                            )
                          }
                          className="w-full rounded-xl border border-[#e5e7eb] bg-[#fafafa] px-3 py-2 text-sm outline-none focus:border-[#ff8d28]"
                          placeholder="Caption"
                        />
                        <input
                          value={item.category_name || ""}
                          onChange={(event) =>
                            setItems((prev) =>
                              prev.map((entry) =>
                                entry.id === item.id ? { ...entry, category_name: event.target.value } : entry,
                              ),
                            )
                          }
                          className="w-full rounded-xl border border-[#e5e7eb] bg-[#fafafa] px-3 py-2 text-sm outline-none focus:border-[#ff8d28]"
                          placeholder="Category"
                        />
                        <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700">
                          <input
                            type="checkbox"
                            checked={Boolean(item.is_featured || item.featured)}
                            onChange={(event) =>
                              setItems((prev) =>
                                prev.map((entry) =>
                                  entry.id === item.id
                                    ? { ...entry, is_featured: event.target.checked, featured: event.target.checked }
                                    : { ...entry, is_featured: false, featured: false },
                                ),
                              )
                            }
                            className="h-4 w-4 accent-[#ff8d28]"
                          />
                          Ảnh nổi bật
                        </label>
                        <div className="flex gap-2 pt-1">
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() =>
                              void handleUpdatePortfolio(item.id, {
                                caption: item.caption || "",
                                category_name: item.category_name || "",
                                is_featured: Boolean(item.is_featured || item.featured),
                                image_url: item.image_url || item.image || item.url || "",
                              })
                            }
                            className="flex-1 rounded-xl bg-[#ff8d28] px-3 py-2 text-sm font-black text-white hover:bg-[#e0771e] disabled:opacity-60"
                          >
                            Lưu
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="rounded-xl border border-[#e5e7eb] px-3 py-2 text-sm font-semibold text-slate-600 hover:border-[#ff8d28] hover:text-[#ff8d28]"
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="min-h-[52px]">
                          <p className="line-clamp-2 text-sm font-bold text-[#101827]">
                            {item.caption || "Ảnh portfolio"}
                          </p>
                          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#ff8d28]">
                            {item.category_name || item.category || "Chưa phân loại"}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingId(item.id)}
                            className="rounded-xl border border-[#e5e7eb] bg-[#fafafa] px-3 py-2 text-xs font-bold text-slate-700 hover:border-[#ff8d28] hover:text-[#ff8d28]"
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleFeaturedToggle(item, !Boolean(item.is_featured || item.featured))}
                            className="rounded-xl border border-[#e5e7eb] bg-[#fafafa] px-3 py-2 text-xs font-bold text-slate-700 hover:border-[#ff8d28] hover:text-[#ff8d28]"
                          >
                            {item.is_featured || item.featured ? "Bỏ nổi bật" : "Nổi bật"}
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDeletePortfolio(item.id)}
                            className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100"
                          >
                            Xóa
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[28px] border border-dashed border-[#d7dce5] bg-white p-10 text-center shadow-sm">
            <p className="text-lg font-bold text-[#101827]">Chưa có ảnh nào trong portfolio.</p>
            <p className="mt-2 text-sm text-slate-500">Thêm ảnh đầu tiên để bắt đầu trưng bày phong cách của bạn.</p>
          </div>
        )}
      </div>
    </main>
  );
}
