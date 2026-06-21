"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Article, articles } from "./articles";

const categories = ["Tất cả", "Công nghệ", "Cưới hỏi", "Kinh nghiệm", "Thiết bị", "Hậu kỳ", "Thương mại"];

const containerClass = "w-full max-w-[1280px] mx-auto px-6 md:px-12 lg:px-20";

/* ─── icons ──────────────────────────────────────────────────── */
function IconSearch({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M14 14L17 17" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="8.5" cy="8.5" r="5.75" stroke="currentColor" strokeWidth="2.2" />
    </svg>
  );
}
function IconClock({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
function IconArrow({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}
function IconSparkle({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M10 2.5L11.9 8.1L17.5 10L11.9 11.9L10 17.5L8.1 11.9L2.5 10L8.1 8.1L10 2.5Z" />
    </svg>
  );
}

/* ─── featured card ──────────────────────────────────────────── */
function FeaturedCard({ article }: { article: Article }) {
  return (
    <article className="group relative overflow-hidden rounded-3xl bg-[#0e111d] shadow-2xl">
      <div className="absolute inset-0">
        <img
          src={article.image}
          alt={article.title}
          className="h-full w-full object-cover opacity-50 transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e111d] via-[#0e111d]/60 to-transparent" />
      </div>

      <div className="relative z-10 flex h-full min-h-[440px] flex-col justify-end p-8 lg:p-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="rounded-full bg-[#ff8d28] px-3 py-1 text-[11px] font-bold text-white">
            Nổi bật
          </span>
          <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${article.categoryColor}`}>
            {article.category}
          </span>
        </div>

        <h2 className="text-[26px] sm:text-[32px] lg:text-[36px] font-black leading-[1.15] text-white max-w-[720px]">
          {article.title}
        </h2>
        <p className="mt-3 text-[14px] leading-relaxed text-gray-300 max-w-[600px] line-clamp-2">
          {article.excerpt}
        </p>

        <div className="mt-6 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <img src={article.authorAvatar} alt={article.author} className="h-9 w-9 rounded-full object-cover border-2 border-white/20" />
            <div>
              <p className="text-[13px] font-bold text-white">{article.author}</p>
              <p className="text-[11px] text-gray-400">{article.date}</p>
            </div>
          </div>
          <Link
            href={`/news/${article.id}`}
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur border border-white/20 px-5 py-2.5 text-[13px] font-bold text-white transition hover:bg-[#ff8d28] hover:border-[#ff8d28]"
          >
            Đọc bài viết <IconArrow className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

/* ─── article card ───────────────────────────────────────────── */
function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
      <div className="relative h-[200px] overflow-hidden bg-slate-100">
        <img
          src={article.image}
          alt={article.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold ${article.categoryColor}`}>
          {article.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="text-[15px] font-bold leading-snug text-[#0e111d] line-clamp-2 group-hover:text-[#ff8d28] transition-colors">
          {article.title}
        </h3>
        <p className="text-[12px] leading-relaxed text-slate-500 line-clamp-3 flex-1">
          {article.excerpt}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <img src={article.authorAvatar} alt={article.author} className="h-7 w-7 rounded-full object-cover" />
            <div>
              <p className="text-[11px] font-bold text-slate-700">{article.author}</p>
              <p className="text-[10px] text-slate-400">{article.date}</p>
            </div>
          </div>
          <span className="flex items-center gap-1 text-[10px] text-slate-400">
            <IconClock className="h-3.5 w-3.5" />
            {article.readTime}
          </span>
        </div>

        <Link
          href={`/news/${article.id}`}
          className="mt-1 inline-flex items-center gap-1.5 text-[12px] font-bold text-[#ff8d28] hover:gap-2.5 transition-all"
        >
          Đọc tiếp <IconArrow className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}

/* ─── sidebar latest ─────────────────────────────────────────── */
function SidebarLatest({ items }: { items: Article[] }) {
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="font-bold text-[#0e111d] mb-4">Mới nhất</h3>
      <ul className="space-y-4">
        {items.map((article, i) => (
          <li key={article.id}>
            <Link href={`/news/${article.id}`} className="flex gap-3 group">
              <img
                src={article.image}
                alt={article.title}
                className="h-16 w-16 rounded-xl object-cover shrink-0 group-hover:brightness-90 transition"
              />
              <div className="min-w-0">
                <span className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-bold mb-1 ${article.categoryColor}`}>
                  {article.category}
                </span>
                <p className="text-[12px] font-semibold text-slate-800 leading-snug line-clamp-2 group-hover:text-[#ff8d28] transition-colors">
                  {article.title}
                </p>
                <p className="mt-1 text-[10px] text-slate-400">{article.date}</p>
              </div>
            </Link>
            {i < items.length - 1 && <div className="mt-4 border-t border-slate-100" />}
          </li>
        ))}
      </ul>
    </aside>
  );
}

/* ─── newsletter box ─────────────────────────────────────────── */
function Newsletter() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <aside className="rounded-2xl bg-[#0e111d] p-6 text-white">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ff8d28]/15 mb-3">
        <IconSparkle className="h-5 w-5 text-[#ff8d28]" />
      </div>
      <h3 className="font-bold text-lg leading-snug">Nhận bài viết mới nhất</h3>
      <p className="mt-1.5 text-[12px] text-gray-400 leading-relaxed">
        Mỗi tuần một bài chọn lọc về nhiếp ảnh, công nghệ và xu hướng ngành.
      </p>
      {sent ? (
        <p className="mt-4 rounded-xl bg-emerald-500/15 px-4 py-3 text-[13px] font-semibold text-emerald-400">
          ✓ Đăng ký thành công! Cảm ơn bạn.
        </p>
      ) : (
        <form
          onSubmit={(e) => { e.preventDefault(); if (email) setSent(true); }}
          className="mt-4 space-y-2"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email của bạn"
            required
            className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-2.5 text-[13px] text-white placeholder:text-gray-500 outline-none focus:border-[#ff8d28]/50 focus:ring-1 focus:ring-[#ff8d28]/30 transition"
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-[#ff8d28] py-2.5 text-[13px] font-bold text-white hover:bg-[#e07820] transition"
          >
            Đăng ký nhận tin
          </button>
        </form>
      )}
    </aside>
  );
}

/* ─── page ───────────────────────────────────────────────────── */
export default function NewsPage() {
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  const featured = articles.find((a) => a.featured)!;
  const rest = articles.filter((a) => !a.featured);

  const filtered = rest.filter((a) => {
    const matchCat = activeCategory === "Tất cả" || a.category === activeCategory;
    const matchSearch =
      !search.trim() ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.excerpt.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const latest = [...articles].slice(0, 4);

  return (
    <div className="min-h-screen bg-[#f8f9fd] text-[#0e111d]">
      {/* ── hero ── */}
      <section className="bg-white border-b border-slate-100 py-12">
        <div className={containerClass}>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#ff8d28] mb-3">
            Blog & Tin tức
          </p>
          <h1 className="text-[36px] sm:text-[48px] font-black leading-[1.1] text-[#0e111d]">
            Khám phá thế giới
            <br />
            <span className="text-[#ff8d28]">nhiếp ảnh chuyên nghiệp</span>
          </h1>
          <p className="mt-4 max-w-[540px] text-[15px] text-slate-500 leading-relaxed font-medium">
            Kiến thức, xu hướng và câu chuyện từ cộng đồng nhiếp ảnh gia Studion — cập nhật hàng tuần.
          </p>

          {/* search — icon only, expand on click */}
          <div ref={searchRef} className="mt-6 flex items-center">
            <div className={`flex items-center overflow-hidden rounded-xl border bg-white shadow-sm transition-all duration-300 ${searchOpen ? "w-[340px] border-[#ff8d28] ring-2 ring-[#ff8d28]/10" : "w-11 border-slate-200"}`}>
              <button
                type="button"
                aria-label="Tìm kiếm"
                onClick={() => setSearchOpen(true)}
                className="flex h-11 w-11 shrink-0 items-center justify-center text-slate-400 hover:text-[#ff8d28] transition-colors"
              >
                <IconSearch className="h-5 w-5" />
              </button>
              <input
                ref={inputRef}
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm bài viết..."
                className={`h-11 flex-1 bg-transparent pr-4 text-[14px] text-slate-800 outline-none placeholder:text-slate-400 transition-all duration-300 ${searchOpen ? "opacity-100 w-full" : "opacity-0 w-0 pointer-events-none"}`}
              />
            </div>
          </div>
        </div>
      </section>

      <div className={`${containerClass} py-10`}>
        {/* ── featured ── */}
        {!search && activeCategory === "Tất cả" && (
          <div className="mb-10">
            <FeaturedCard article={featured} />
          </div>
        )}

        {/* ── category tabs ── */}
        <div className="flex items-center gap-2 flex-wrap mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`rounded-xl px-4 py-2 text-[12px] font-bold transition border ${
                activeCategory === cat
                  ? "bg-[#ff8d28] border-[#ff8d28] text-white shadow-sm"
                  : "bg-white border-slate-200 text-slate-600 hover:border-[#ff8d28]/40 hover:text-[#ff8d28]"
              }`}
            >
              {cat}
              {cat !== "Tất cả" && (
                <span className="ml-1.5 opacity-60">
                  ({articles.filter((a) => a.category === cat).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── main grid + sidebar ── */}
        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          {/* articles */}
          <div>
            {filtered.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                <p className="font-bold text-slate-600">Không tìm thấy bài viết nào</p>
                <p className="mt-1 text-sm text-slate-400">Thử từ khóa hoặc danh mục khác nhé.</p>
                <button
                  type="button"
                  onClick={() => { setSearch(""); setActiveCategory("Tất cả"); }}
                  className="mt-4 rounded-lg bg-[#ff8d28] px-5 py-2 text-sm font-bold text-white hover:bg-[#e07820] transition"
                >
                  Xem tất cả
                </button>
              </div>
            )}
          </div>

          {/* sidebar */}
          <div className="space-y-6">
            <SidebarLatest items={latest} />
            <Newsletter />

            {/* topics cloud */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-bold text-[#0e111d] mb-4">Chủ đề</h3>
              <div className="flex flex-wrap gap-2">
                {categories.filter((c) => c !== "Tất cả").map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold transition border ${
                      activeCategory === cat
                        ? "bg-[#ff8d28] border-[#ff8d28] text-white"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:border-orange-200 hover:text-[#ff8d28]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CTA strip ── */}
      <section className="bg-[#0e111d] py-14 text-center mt-6">
        <div className={containerClass}>
          <h2 className="text-[28px] sm:text-[34px] font-black text-white">
            Bạn là nhiếp ảnh gia?
          </h2>
          <p className="mt-2 text-[14px] text-gray-400 font-medium">
            Chia sẻ câu chuyện và kinh nghiệm của bạn với cộng đồng Studion.
          </p>
          <Link
            href="/register"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#ff8d28] px-7 py-3.5 text-[14px] font-bold text-white hover:bg-[#e07820] transition hover:-translate-y-0.5 shadow-lg"
          >
            Tham gia ngay <IconArrow className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
