"use client";

import { useEffect, useState } from "react";
import AdminLayout from "../_components/admin-layout";
import { AdminIcon, IconButton } from "../_components/admin-icons";
import { api } from "@/lib/api";

type Article = {
  id: number;
  slug: string;
  title: string;
  content: string;
  excerpt?: string;
  category: string;
  category_color?: string;
  author: string;
  author_avatar?: string;
  image?: string;
  read_time?: string;
  featured: boolean | number;
  created_at: string;
};

const COMMON_CATEGORIES = [
  { name: "Công nghệ", color: "bg-violet-100 text-violet-700" },
  { name: "Cưới hỏi", color: "bg-rose-100 text-rose-700" },
  { name: "Kinh nghiệm", color: "bg-emerald-100 text-emerald-700" },
  { name: "Thiết bị", color: "bg-sky-100 text-sky-700" },
  { name: "Hậu kỳ", color: "bg-amber-100 text-amber-700" },
  { name: "Thương mại", color: "bg-orange-100 text-orange-700" },
  { name: "Sáng tạo", color: "bg-pink-100 text-pink-700" },
  { name: "Nghệ thuật", color: "bg-fuchsia-100 text-fuchsia-700" },
  { name: "Kinh doanh", color: "bg-cyan-100 text-cyan-700" },
  { name: "Truyền thông", color: "bg-indigo-100 text-indigo-700" }
];

const UNSPLASH_PRESETS = [
  { name: "Máy ảnh/Thiết bị", url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80" },
  { name: "Công nghệ/AI", url: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&w=1200&q=80" },
  { name: "Cưới hỏi/Studio", url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80" },
  { name: "Portrait/Chân dung", url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80" },
  { name: "Lightroom/Hậu kỳ", url: "https://images.unsplash.com/photo-1609921212029-bb5a28e60960?auto=format&fit=crop&w=900&q=80" }
];

export default function AdminNewsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCatFilter, setSelectedCatFilter] = useState("");
  const [categories, setCategories] = useState<string[]>(COMMON_CATEGORIES.map(c => c.name));
  
  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    loadArticles();
  }, [searchQuery, selectedCatFilter]);

  async function loadArticles() {
    setLoading(true);
    try {
      const params: Record<string, any> = {};
      if (searchQuery) params.search = searchQuery;
      if (selectedCatFilter) params.category = selectedCatFilter;

      const result = (await api.news.getAll(params)) as any;
      if (result.success && result.data) {
        setArticles(result.data);
        if (!searchQuery && !selectedCatFilter) {
          const dbCats = (result.data as Article[]).map(a => a.category);
          const combined = Array.from(new Set([...COMMON_CATEGORIES.map(c => c.name), ...dbCats]));
          setCategories(combined);
        }
      }
    } catch (error) {
      console.error("Error loading articles:", error);
    } finally {
      setLoading(false);
    }
  }

  function notify(text: string) {
    setToast(text);
    setTimeout(() => setToast(""), 3000);
  }

  async function handleToggleFeatured(article: Article) {
    try {
      const result = (await api.news.toggleFeatured(article.id)) as any;
      if (result.success) {
        notify(`Đã cập nhật bài viết ${article.title} thành ${result.data.featured ? 'nổi bật' : 'thường'}`);
        // update local state
        setArticles(articles.map(a => a.id === article.id ? { ...a, featured: result.data.featured } : a));
      }
    } catch (error) {
      notify("Lỗi kết nối khi thay đổi nổi bật");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Bạn có chắc chắn muốn xóa bài viết này không? Hành động này không thể hoàn tác.")) return;
    try {
      const result = (await api.news.delete(id)) as any;
      if (result.success) {
        notify("Xóa bài viết thành công!");
        loadArticles();
      } else {
        alert(result.message || "Lỗi khi xóa bài viết");
      }
    } catch (error) {
      notify("Lỗi kết nối");
    }
  }

  function handleEdit(article: Article) {
    setSelectedArticle(article);
    setEditModalOpen(true);
  }

  // Thống kê nhanh
  const totalArticles = articles.length;
  const featuredCount = articles.filter(a => !!a.featured).length;
  const uniqueCategories = Array.from(new Set(articles.map(a => a.category))).length;

  return (
    <AdminLayout active="Quản lý Tin tức">
      {toast && <Toast text={toast} />}

      {/* Tiêu đề & Action */}
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#ff8d28] font-bold">
            Truyền thông & Tin tức
          </p>
          <h1 className="mt-2 text-[28px] font-semibold tracking-tight text-[#0f172a]">
            Quản lý Tin tức
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[#596174]">
            Đăng tải, chỉnh sửa các bài viết hướng dẫn, chia sẻ kinh nghiệm nhiếp ảnh và cập nhật xu hướng mới nhất trên Studion.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#ff8d28] px-5 text-[13px] font-semibold text-white shadow-[0_14px_30px_rgba(255,141,40,0.16)] transition hover:bg-[#f47f16]"
          >
            <AdminIcon name="add" className="h-4 w-4" />
            Viết bài mới
          </button>
          <IconButton label="Làm mới" icon="refresh" size="md" onClick={loadArticles} />
        </div>
      </div>

      {/* Thẻ thống kê */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-6">
        <div className="rounded-2xl border border-[#e7e9f1] bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-xl">
            📰
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">Tổng số bài viết</p>
            <h3 className="text-2xl font-bold text-slate-800">{totalArticles}</h3>
          </div>
        </div>

        <div className="rounded-2xl border border-[#e7e9f1] bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center font-bold text-xl">
            ⭐️
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">Bài viết nổi bật</p>
            <h3 className="text-2xl font-bold text-slate-800">{featuredCount}</h3>
          </div>
        </div>

        <div className="rounded-2xl border border-[#e7e9f1] bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold text-xl">
            🏷️
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400 font-bold">Số danh mục</p>
            <h3 className="text-2xl font-bold text-slate-800">{uniqueCategories}</h3>
          </div>
        </div>
      </div>

      {/* Bộ lọc tìm kiếm */}
      <div className="mb-3 grid gap-2 md:grid-cols-[minmax(0,1fr)_180px]">
        <label className="relative !block">
          <AdminIcon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8a93a5]" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tiêu đề, tóm tắt..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="!h-10 !min-h-0 w-full rounded-xl border border-[#dfe3ec] bg-white !py-0 !pl-10 !pr-3 !text-[12px] !font-normal outline-none focus:border-[#ff8d28]"
          />
        </label>

        <select
          value={selectedCatFilter}
          onChange={(e) => setSelectedCatFilter(e.target.value)}
          className="!h-10 !min-h-0 !w-full rounded-xl !border border-gray-300 bg-white !px-3 !py-0 !text-[12px] !font-normal outline-none focus:border-[#ff8d28]"
        >
          <option value="">Tất cả danh mục</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Danh sách */}
      <div className="mt-5">
        <section className="rounded-[28px] border border-[#e7e9f1] bg-white p-5 shadow-[0_14px_34px_rgba(12,18,32,0.05)]">
          {loading ? (
            <div className="py-12 text-center text-[#697086]">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#ff8d28] border-t-transparent mr-2" />
              Đang tải danh sách bài viết...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-0 text-left text-[13px]">
                <thead className="bg-[#f8fafc] text-[11px] uppercase tracking-[0.18em] text-[#596174]">
                  <tr>
                    <th className="py-4 pr-4 pl-5">Bài viết</th>
                    <th className="py-4 pr-4">Danh mục</th>
                    <th className="py-4 pr-4">Tác giả</th>
                    <th className="py-4 pr-4">Thời gian đọc</th>
                    <th className="py-4 pr-4">Nổi bật</th>
                    <th className="py-4 pr-4">Ngày đăng</th>
                    <th className="py-4 pr-5 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf0f5]">
                  {articles.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-500 font-medium">
                        Không tìm thấy bài viết nào phù hợp.
                      </td>
                    </tr>
                  ) : (
                    articles.map((article) => (
                      <tr key={article.id} className="transition hover:bg-[#fff8ef]/40">
                        <td className="py-4 pr-4 pl-5">
                          <div className="flex items-center gap-3.5">
                            <img
                              src={article.image || "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=90&q=80"}
                              alt={article.title}
                              className="h-12 w-20 rounded-lg object-cover border shrink-0 bg-slate-100"
                            />
                            <div className="min-w-0 max-w-[280px]">
                              <p className="font-semibold text-[#0f172a] truncate hover:text-[#ff8d28] transition">
                                <a href={`/news/${article.slug}`} target="_blank" rel="noreferrer">
                                  {article.title}
                                </a>
                              </p>
                              <p className="text-[11px] text-gray-500 truncate mt-0.5">{article.excerpt || "Không có tóm tắt"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${article.category_color || "bg-slate-100 text-slate-700"}`}>
                            {article.category}
                          </span>
                        </td>
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-2">
                            <img
                              src={article.author_avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=40&q=80"}
                              alt={article.author}
                              className="h-6 w-6 rounded-full object-cover border"
                            />
                            <span className="font-medium text-gray-700">{article.author}</span>
                          </div>
                        </td>
                        <td className="py-4 pr-4 text-gray-600 font-medium">{article.read_time || "5 phút đọc"}</td>
                        <td className="py-4 pr-4">
                          <button
                            onClick={() => handleToggleFeatured(article)}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              article.featured ? "bg-[#ff8d28]" : "bg-gray-200"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                article.featured ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </td>
                        <td className="py-4 pr-4 text-[#596174]">
                          {new Date(article.created_at).toLocaleDateString("vi-VN")}
                        </td>
                        <td className="py-4 pr-5 text-right">
                          <div className="flex justify-end gap-2">
                            <IconButton
                              label="Sửa"
                              icon="edit"
                              size="sm"
                              onClick={() => handleEdit(article)}
                            />
                            <IconButton
                              label="Xóa"
                              icon="delete"
                              tone="danger"
                              size="sm"
                              onClick={() => handleDelete(article.id)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* Modal tạo mới */}
      {createModalOpen && (
        <CreateArticleModal
          onClose={() => setCreateModalOpen(false)}
          onSuccess={() => {
            setCreateModalOpen(false);
            loadArticles();
            notify("Đăng bài viết mới thành công!");
          }}
        />
      )}

      {/* Modal chỉnh sửa */}
      {editModalOpen && selectedArticle && (
        <EditArticleModal
          article={selectedArticle}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedArticle(null);
          }}
          onSuccess={() => {
            setEditModalOpen(false);
            setSelectedArticle(null);
            loadArticles();
            notify("Cập nhật bài viết thành công!");
          }}
        />
      )}
    </AdminLayout>
  );
}

// ───── COMPONENT CREATE MODAL ────────────────────────────────
function CreateArticleModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "Công nghệ",
    excerpt: "",
    content: "",
    author: "Ban Biên Tập Studion",
    author_avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80",
    read_time: "5 phút đọc",
    featured: false
  });

  function handleCategoryChange(catName: string) {
    const matched = COMMON_CATEGORIES.find(c => c.name === catName);
    setFormData({
      ...formData,
      category: catName,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      alert("Vui lòng điền Tiêu đề và Nội dung bài viết.");
      return;
    }

    setSubmitting(true);
    try {
      const selectedColor = COMMON_CATEGORIES.find(c => c.name === formData.category)?.color || "bg-slate-100 text-slate-700";
      const payload = {
        ...formData,
        category_color: selectedColor,
      };

      const result = (await api.news.create(payload)) as any;
      if (result.success) {
        onSuccess();
      } else {
        alert(result.message || "Có lỗi xảy ra khi tạo bài viết.");
      }
    } catch (error) {
      console.error(error);
      alert("Lỗi kết nối mạng.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="w-full max-w-4xl rounded-3xl bg-white p-6 shadow-2xl my-8">
        <div className="flex items-center justify-between border-b pb-4 mb-4">
          <h2 className="text-xl font-bold text-slate-800">✍️ Soạn thảo bài viết mới</h2>
          <button onClick={onClose} className="rounded-xl p-2 hover:bg-gray-100 text-gray-400 hover:text-gray-700">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Tiêu đề bài viết <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ví dụ: Xu hướng nhiếp ảnh cưới năm 2026"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-[#ff8d28]"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Danh mục</label>
              <select
                value={formData.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-[#ff8d28] bg-white"
              >
                {COMMON_CATEGORIES.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">Tóm tắt ngắn (Excerpt)</label>
            <textarea
              rows={2}
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              placeholder="Viết một đoạn ngắn giới thiệu thu hút người đọc..."
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:border-[#ff8d28]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">Nội dung chi tiết <span className="text-red-500">*</span> (Hỗ trợ xuống dòng và định dạng văn bản)</label>
            <textarea
              rows={8}
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Nội dung bài viết viết tại đây..."
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-[#ff8d28] font-sans"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Tác giả</label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-[#ff8d28]"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Thời gian đọc (ví dụ: '5 phút đọc')</label>
              <input
                type="text"
                value={formData.read_time}
                onChange={(e) => setFormData({ ...formData, read_time: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-[#ff8d28]"
              />
            </div>

            <div className="flex items-center pt-8">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="h-4.5 w-4.5 rounded border-gray-300 text-[#ff8d28] focus:ring-[#ff8d28]"
                />
                <span className="text-sm font-semibold text-gray-700">Đánh dấu Nổi bật (Featured)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">Ảnh bìa (URL)</label>
            <input
              type="text"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-[#ff8d28]"
            />
            {/* Presets Unsplash */}
            <div className="mt-2 flex flex-wrap gap-2 items-center">
              <span className="text-[11px] text-gray-500 font-semibold">Chọn nhanh ảnh bìa Unsplash chất lượng cao:</span>
              {UNSPLASH_PRESETS.map((p) => (
                <button
                  type="button"
                  key={p.name}
                  onClick={() => setFormData({ ...formData, image: p.url })}
                  className="rounded-lg bg-gray-100 hover:bg-orange-50 hover:text-[#ff8d28] px-2.5 py-1 text-[11px] font-medium border text-gray-600 transition"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium hover:bg-gray-50 text-slate-700 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-[#ff8d28] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#e0751b] disabled:opacity-50 transition"
            >
              {submitting ? "Đang lưu..." : "Đăng bài viết"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ───── COMPONENT EDIT MODAL ──────────────────────────────────
function EditArticleModal({ article, onClose, onSuccess }: { article: Article; onClose: () => void; onSuccess: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: article.title,
    category: article.category,
    excerpt: article.excerpt || "",
    content: article.content,
    author: article.author,
    author_avatar: article.author_avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80",
    image: article.image || "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80",
    read_time: article.read_time || "5 phút đọc",
    featured: !!article.featured
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      alert("Vui lòng điền Tiêu đề và Nội dung bài viết.");
      return;
    }

    setSubmitting(true);
    try {
      const selectedColor = COMMON_CATEGORIES.find(c => c.name === formData.category)?.color || "bg-slate-100 text-slate-700";
      const payload = {
        ...formData,
        category_color: selectedColor,
      };

      const result = (await api.news.update(article.id, payload)) as any;
      if (result.success) {
        onSuccess();
      } else {
        alert(result.message || "Có lỗi xảy ra khi cập nhật bài viết.");
      }
    } catch (error) {
      console.error(error);
      alert("Lỗi mạng.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="w-full max-w-4xl rounded-3xl bg-white p-6 shadow-2xl my-8">
        <div className="flex items-center justify-between border-b pb-4 mb-4">
          <h2 className="text-xl font-bold text-slate-800">✏️ Chỉnh sửa bài viết</h2>
          <button onClick={onClose} className="rounded-xl p-2 hover:bg-gray-100 text-gray-400 hover:text-gray-700">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Tiêu đề bài viết <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-[#ff8d28]"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Danh mục</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-[#ff8d28] bg-white"
              >
                {COMMON_CATEGORIES.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">Tóm tắt ngắn (Excerpt)</label>
            <textarea
              rows={2}
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:border-[#ff8d28]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">Nội dung chi tiết <span className="text-red-500">*</span></label>
            <textarea
              rows={8}
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-[#ff8d28] font-sans"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Tác giả</label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-[#ff8d28]"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Thời gian đọc</label>
              <input
                type="text"
                value={formData.read_time}
                onChange={(e) => setFormData({ ...formData, read_time: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-[#ff8d28]"
              />
            </div>

            <div className="flex items-center pt-8">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="h-4.5 w-4.5 rounded border-gray-300 text-[#ff8d28] focus:ring-[#ff8d28]"
                />
                <span className="text-sm font-semibold text-gray-700">Đánh dấu Nổi bật (Featured)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">Ảnh bìa (URL)</label>
            <input
              type="text"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-[#ff8d28]"
            />
            {/* Presets Unsplash */}
            <div className="mt-2 flex flex-wrap gap-2 items-center">
              <span className="text-[11px] text-gray-500 font-semibold">Chọn nhanh ảnh bìa Unsplash chất lượng cao:</span>
              {UNSPLASH_PRESETS.map((p) => (
                <button
                  type="button"
                  key={p.name}
                  onClick={() => setFormData({ ...formData, image: p.url })}
                  className="rounded-lg bg-gray-100 hover:bg-orange-50 hover:text-[#ff8d28] px-2.5 py-1 text-[11px] font-medium border text-gray-600 transition"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium hover:bg-gray-50 text-slate-700 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-[#ff8d28] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#e0751b] disabled:opacity-50 transition"
            >
              {submitting ? "Đang lưu..." : "Cập nhật bài viết"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ───── HELPER TOAST & COMPONENT ──────────────────────────────
function Toast({ text }: { text: string }) {
  return (
    <div className="fixed right-6 top-20 z-50 rounded-2xl border border-emerald-100 bg-white px-5 py-3 font-semibold text-emerald-800 shadow-[0_12px_30px_rgba(16,185,129,0.15)] flex items-center gap-2 animate-bounce">
      <span className="text-lg">✅</span>
      <span>{text}</span>
    </div>
  );
}
