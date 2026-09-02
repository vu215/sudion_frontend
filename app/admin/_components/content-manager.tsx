"use client";

import { useEffect, useMemo, useState } from "react";

type Field = {
  key: string;
  label: string;
  type?: "text" | "textarea";
  placeholder?: string;
};

type Item = { id: string; published?: boolean;[key: string]: string | boolean | undefined };

type Props = {
  title: string;
  description: string;
  storageKey: string;
  fields: Field[];
  initialItems: Item[];
  addLabel: string;
};

export default function ContentManager({ title, description, storageKey, fields, initialItems, addLabel }: Props) {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [isLoaded, setIsLoaded] = useState(false);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<Record<string, string> | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed);
        }
      } catch {
        setItems(initialItems);
      }
    } else {
      window.localStorage.setItem(storageKey, JSON.stringify(initialItems));
    }
    setIsLoaded(true);
  }, [initialItems, storageKey]);

  useEffect(() => {
    if (isLoaded) {
      window.localStorage.setItem(storageKey, JSON.stringify(items));
    }
  }, [items, storageKey, isLoaded]);

  const visibleItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return items;
    return items.filter((item) => fields.some((field) => String(item[field.key] || "").toLowerCase().includes(normalized)));
  }, [fields, items, query]);

  function openCreate() {
    setEditingId(null);
    setDraft(Object.fromEntries(fields.map((field) => [field.key, ""])));
  }

  function openEdit(item: Item) {
    setEditingId(item.id);
    setDraft(Object.fromEntries(fields.map((field) => [field.key, String(item[field.key] || "")])));
  }

  function closeEditor() {
    setDraft(null);
    setEditingId(null);
  }

  function save() {
    if (!draft) return;
    if (editingId) {
      setItems((current) => current.map((item) => item.id === editingId ? { ...item, ...draft } : item));
    } else {
      setItems((current) => [{ id: `${storageKey}-${Date.now()}`, ...draft, published: true }, ...current]);
    }
    closeEditor();
  }

  function remove(id: string) {
    if (window.confirm("Bạn có chắc muốn xóa mục này không?")) setItems((current) => current.filter((item) => item.id !== id));
  }

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="mt-2 text-[25px] font-black tracking-tight text-slate-900">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <button type="button" onClick={openCreate} className="h-10 rounded-xl bg-[#ff8d28] px-4 text-xs font-black text-white hover:bg-orange-600">+ {addLabel}</button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm kiếm..." className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#ff8d28]" />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">{fields[0].label}</th>{fields.slice(1, 3).map((field) => <th key={field.key} className="px-4 py-3">{field.label}</th>)}<th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3">Thao tác</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {visibleItems.map((item) => <tr key={item.id} className="hover:bg-orange-50/40"><td className="max-w-[320px] truncate px-4 py-4 font-bold text-slate-900">{String(item[fields[0].key] || "Chưa có tiêu đề")}</td>{fields.slice(1, 3).map((field) => <td key={field.key} className="px-4 py-4 text-slate-600">{String(item[field.key] || "-")}</td>)}<td className="px-4 py-4"><button type="button" onClick={() => setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, published: entry.published === false } : entry))} className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${item.published === false ? "bg-slate-100 text-slate-500" : "bg-emerald-50 text-emerald-700"}`}>{item.published === false ? "Bản nháp" : "Đang xuất bản"}</button></td><td className="px-4 py-4"><button type="button" onClick={() => openEdit(item)} className="mr-2 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold">Sửa</button><button type="button" onClick={() => remove(item.id)} className="rounded-lg border border-red-100 px-2.5 py-1.5 text-xs font-bold text-red-600">Xóa</button></td></tr>)}
            {visibleItems.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-500">Chưa có dữ liệu phù hợp.</td></tr>}
          </tbody>
        </table>
      </div>

      {draft ? <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4" onClick={closeEditor}><div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-between"><h2 className="text-lg font-black text-slate-900">{editingId ? "Chỉnh sửa" : addLabel}</h2><button type="button" onClick={closeEditor} className="text-xl text-slate-400">×</button></div><div className="mt-5 grid gap-4">{fields.map((field) => <label key={field.key} className="grid gap-1.5 text-xs font-bold text-slate-700">{field.label}{field.type === "textarea" ? <textarea value={draft[field.key] || ""} onChange={(event) => setDraft({ ...draft, [field.key]: event.target.value })} placeholder={field.placeholder} rows={5} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal outline-none focus:border-[#ff8d28]" /> : <input value={draft[field.key] || ""} onChange={(event) => setDraft({ ...draft, [field.key]: event.target.value })} placeholder={field.placeholder} className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-normal outline-none focus:border-[#ff8d28]" />}</label>)}</div><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={closeEditor} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold">Hủy</button><button type="button" onClick={save} className="rounded-xl bg-[#ff8d28] px-4 py-2 text-xs font-bold text-white">Lưu thay đổi</button></div></div></div> : null}
    </div>
  );
}
