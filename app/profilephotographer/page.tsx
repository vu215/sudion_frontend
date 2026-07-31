"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/app/auth-context";
import { useToast } from "@/app/toast-context";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function authHeaders() {
  const token = typeof window !== "undefined" ? window.localStorage.getItem("sudion_token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}
function resolveUrl(url: string) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url) || url.startsWith("data:")) return url;
  return `${API_URL.replace(/\/api\/?$/, "")}${url.startsWith("/") ? url : `/${url}`}`;
}
function fmt(v: number) { return Number(v || 0).toLocaleString("vi-VN"); }

const FALLBACK_AVATAR = "https://images.pexels.com/photos/1983037/pexels-photo-1983037.jpeg?auto=compress&cs=tinysrgb&w=200";
const FALLBACK_COVER  = "https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=1400";

const SAMPLE_SERVICE_SUGGESTIONS = [
  { name: "Gói cưới Premium", category_name: "Cưới", price: 4500000, duration: 180 },
  { name: "Chụp portfolio cá nhân", category_name: "Portrait", price: 2500000, duration: 90 },
  { name: "Sự kiện doanh nghiệp", category_name: "Sự kiện", price: 3800000, duration: 120 },
  { name: "Chụp gia đình trọn gói", category_name: "Gia đình", price: 3200000, duration: 120 },
  { name: "Album sản phẩm thương mại", category_name: "Sản phẩm", price: 4200000, duration: 150 },
  { name: "Kỷ yếu năng động", category_name: "Kỷ yếu", price: 2800000, duration: 100 },
];

const SAMPLE_PORTFOLIO_IMAGES = [
  "https://images.pexels.com/photos/3775532/pexels-photo-3775532.jpeg?auto=compress&cs=tinysrgb&w=900",
  "https://images.pexels.com/photos/248280/pexels-photo-248280.jpeg?auto=compress&cs=tinysrgb&w=900",
  "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=900",
  "https://images.pexels.com/photos/212372/pexels-photo-212372.jpeg?auto=compress&cs=tinysrgb&w=900",
  "https://images.pexels.com/photos/296055/pexels-photo-296055.jpeg?auto=compress&cs=tinysrgb&w=900",
  "https://images.pexels.com/photos/1124466/pexels-photo-1124466.jpeg?auto=compress&cs=tinysrgb&w=900",
];

export default function ProfilePhotographerPage() {
  const { session, isLoggedIn } = useAuth();
  const toast = useToast();

  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [name,             setName]             = useState("");
  const [phone,            setPhone]            = useState("");
  const [bio,              setBio]              = useState("");
  const [activeArea,       setActiveArea]       = useState("");
  const [startedYear,      setStartedYear]      = useState(2020);
  const [photographerType, setPhotographerType] = useState("freelance");
  const [avatar,           setAvatar]           = useState("");
  const [portfolio,        setPortfolio]        = useState<string[]>([]);
  const [packages,         setPackages]         = useState<any[]>([]);
  const [equipment,        setEquipment]        = useState<string[]>(["Sony A7R IV", "Canon 5D Mark IV"]);
  const [equipInput,       setEquipInput]       = useState("");

  const avatarRef    = useRef<HTMLInputElement>(null);
  const portfolioRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoggedIn || !session?.userId) { setLoading(false); return; }
    (async () => {
      try {
        const meRes  = await fetch(`${API_URL}/photographers/me`, { headers: authHeaders(), cache: "no-store" });
        const meJson = await meRes.json();
        if (!meRes.ok || !meJson.success) throw new Error(meJson.message);
        const pid = meJson.data?.photographer_id || meJson.data?.photographer?.id;
        const res  = await fetch(`${API_URL}/photographers/${pid}/profile`, { cache: "no-store" });
        const json = await res.json();
        if (json.success && json.data) {
          const { photographer: p, portfolio: imgs, packages: pkgs } = json.data;
          setName(p.full_name || ""); setPhone(p.phone || ""); setBio(p.bio || "");
          setActiveArea(p.active_area || ""); setStartedYear(Number(p.started_year || 2020));
          setPhotographerType(p.photographer_type || "freelance");
          setAvatar(p.avatar_url || ""); setPortfolio(imgs || []); setPackages(pkgs || []);
        }
      } catch { toast.error("Lỗi", "Không thể tải hồ sơ."); }
      finally { setLoading(false); }
    })();
  }, [isLoggedIn, session?.userId, toast]);

  const uploadFile = async (file: File) => {
    const fd = new FormData(); fd.append("file", file);
    const res  = await fetch(`${API_URL}/uploads`, { method: "POST", headers: authHeaders(), body: fd });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message);
    return json.data.url as string;
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try { const url = await uploadFile(f); setAvatar(url); }
    catch (err: any) { toast.error("Lỗi", err.message); }
  };

  const handlePortfolioChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try { const url = await uploadFile(f); setPortfolio(p => [...p, url]); }
    catch (err: any) { toast.error("Lỗi", err.message); }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res  = await fetch(`${API_URL}/photographers/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ name, phone, avatar_url: avatar, bio, active_area: activeArea, started_year: startedYear, photographer_type: photographerType }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);
      toast.success("Đã lưu", "Hồ sơ cập nhật thành công."); setEditMode(false);
    } catch (err: any) { toast.error("Lỗi", err.message); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ff8d28] border-t-transparent" />
    </div>
  );

  const yearsExp   = Math.max(1, new Date().getFullYear() - startedYear);
  const displayAva = resolveUrl(avatar) || FALLBACK_AVATAR;

  return (
    <div className="bg-gradient-to-b from-slate-50 to-slate-100 min-h-full">

      {/* Hidden inputs */}
      <input ref={avatarRef}    type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
      <input ref={portfolioRef} type="file" accept="image/*" className="hidden" onChange={handlePortfolioChange} />

      {/* ── Hero cover ── */}
      <div className="relative overflow-hidden bg-[#0f172a] sm:h-[280px]">
        <img src={FALLBACK_COVER} alt="" className="absolute inset-0 h-full w-full object-cover brightness-75" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#020617]/95 via-[#0f172a]/70 to-[#0e111d]/65" />
        <div className="absolute inset-0 flex items-center px-6 sm:px-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">Quản lý hồ sơ, dịch vụ và portfolio chuyên nghiệp</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">Trang tổng quan dành cho nhiếp ảnh gia: cập nhật nhanh dịch vụ, quản lý booking và trưng bày portfolio đẹp mắt.</p>
          </div>
        </div>
        <div className="absolute right-6 top-5 flex gap-2">
          {editMode ? (
            <>
              <button onClick={() => setEditMode(false)} className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/20 transition backdrop-blur">Hủy</button>
              <button onClick={handleSave} disabled={saving} className="rounded-xl bg-[#ff8d28] px-4 py-2 text-xs font-bold text-white hover:bg-[#e0751b] transition disabled:opacity-50">
                {saving ? "Đang lưu..." : "💾 Lưu"}
              </button>
            </>
          ) : (
            <button onClick={() => setEditMode(true)} className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/20 transition backdrop-blur">✏️ Chỉnh sửa hồ sơ</button>
          )}
        </div>
      </div>

      <div className="px-6 pb-10 md:px-8">

        {/* ── Profile header card ── */}
        <div className="relative -mt-12 mb-6 overflow-hidden rounded-[32px] border border-transparent bg-white/95 p-5 shadow-[0_30px_80px_rgba(15,23,42,0.08)] sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">

            {/* Avatar */}
            <div className="relative -mt-14 sm:-mt-16 shrink-0">
              <div className="relative h-20 w-20 overflow-hidden rounded-2xl border-4 border-white shadow-lg sm:h-24 sm:w-24">
                <img src={displayAva} alt={name} className="h-full w-full object-cover" />
              </div>
              {editMode && (
                <button onClick={() => avatarRef.current?.click()}
                  className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#ff8d28] text-white shadow text-sm hover:bg-[#e0751b] transition">📷</button>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 pb-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                {editMode
                  ? <input value={name} onChange={e => setName(e.target.value)} className="rounded-xl border border-[#e0e3ec] bg-[#fafbfc] px-3 py-1.5 text-[18px] font-black outline-none focus:border-[#ff8d28] w-60" />
                  : <h1 className="text-[20px] font-black text-[#0e111d]">{name || "Nhiếp ảnh gia"}</h1>
                }
                <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-[11px] font-bold text-[#ff8d28] capitalize">{photographerType}</span>
              </div>

              {editMode
                ? <input value={activeArea} onChange={e => setActiveArea(e.target.value)} placeholder="Khu vực hoạt động" className="rounded-xl border border-[#e0e3ec] bg-[#fafbfc] px-3 py-1.5 text-[13px] outline-none focus:border-[#ff8d28] w-52" />
                : <p className="text-[13px] text-[#6b7280] font-medium">📍 {activeArea || "Toàn quốc"}</p>
              }
            </div>

          </div>

          {/* Bio */}
          <div className="mt-4 border-t border-[#f0f2f7] pt-4">
            {editMode
              ? <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} maxLength={500}
                  placeholder="Giới thiệu bản thân..."
                  className="w-full resize-none rounded-xl border border-[#e0e3ec] bg-[#fafbfc] px-3 py-2.5 text-[13px] outline-none focus:border-[#ff8d28]" />
              : <p className="text-[13px] text-[#475569] leading-6">{bio || <span className="text-[#9ca3af]">Chưa có giới thiệu. Nhấn chỉnh sửa để thêm.</span>}</p>
            }
          </div>
        </div>

        {/* ── Quick action cards ── */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { href: "/profilephotographer/bookings",  icon: "📅", label: "Booking mới",  val: "0",  color: "from-blue-500 to-blue-600"    },
            { href: "/profilephotographer/earnings",  icon: "💰", label: "Doanh thu",    val: "0đ", color: "from-emerald-500 to-emerald-600"},
            { href: "/profilephotographer/portfolio", icon: "🖼️", label: "Portfolio",    val: String(portfolio.length), color: "from-purple-500 to-purple-600" },
            { href: "/profilephotographer/messages",  icon: "💬", label: "Tin nhắn",     val: "0",  color: "from-[#ff8d28] to-[#f97316]"   },
          ].map(c => (
            <Link key={c.href} href={c.href}
              className="group rounded-[28px] border border-transparent bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#ff8d28]/25 hover:shadow-lg">
              <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${c.color} text-lg text-white shadow-sm`}>{c.icon}</div>
              <p className="text-2xl font-black text-[#0e111d]">{c.val}</p>
              <p className="mt-2 text-sm font-semibold text-[#6b7280]">{c.label}</p>
            </Link>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_300px]">

          {/* ── Left: Gói dịch vụ ── */}
          <div className="space-y-5">
            <section className="rounded-[28px] border border-[#e8eaf1] bg-white p-5 shadow-sm">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-[#ff8d28]">Dịch vụ</p>
                  <h2 className="mt-2 text-xl font-black text-[#0e111d]">Gói chụp ảnh của bạn</h2>
                </div>
                <Link href="/profilephotographer/services" className="inline-flex items-center gap-2 rounded-2xl bg-[#0e111d] px-4 py-2 text-xs font-black text-white hover:bg-[#1e2a45] transition">Quản lý →</Link>
              </div>

                <div className="grid gap-4 sm:grid-cols-2">
                {([...(packages || []), ...SAMPLE_SERVICE_SUGGESTIONS].slice(0, 4)).map((pkg, i) => (
                  <div key={pkg.id || pkg.name || i} className="group overflow-hidden rounded-[28px] border border-[#e8eaf1] bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                    <div className="mb-4 flex items-center justify-between gap-2">
                      <span className="inline-flex items-center rounded-full bg-[#fef3c7] px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-[#d97706]">{pkg.category_name || "Gợi ý"}</span>
                      {pkg.duration && <span className="text-[11px] text-[#64748b]">⏱ {pkg.duration} phút</span>}
                    </div>
                    <h3 className="text-lg font-black text-[#0f172a] leading-snug">{pkg.name}</h3>
                    <p className="mt-4 text-[22px] font-black text-[#ff8d28]">{fmt(pkg.price)}<span className="text-[13px] font-semibold text-[#64748b]">đ</span></p>
                    {i >= packages.length && <p className="mt-3 text-sm text-[#475569]">Gợi ý gói dịch vụ để khách dễ lựa chọn và đặt lịch.</p>}
                  </div>
                ))}
              </div>
              {!packages.length && (
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Link href="/profilephotographer/services" className="rounded-2xl bg-[#0f172a] px-4 py-2 text-sm font-black text-white transition hover:bg-[#1e2a45]">Tạo gói dịch vụ mới</Link>
                  <span className="text-sm text-[#64748b]">Hoặc cập nhật dịch vụ hiện có để khách hàng nhanh chóng thấy giá.</span>
                </div>
              )}
            </section>

            {/* Portfolio preview */}
            <section className="rounded-[28px] border border-[#e8eaf1] bg-white p-5 shadow-sm">
              <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-[#ff8d28]">Portfolio</p>
                  <h2 className="mt-2 text-xl font-black text-[#0e111d]">Ảnh nổi bật</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {editMode && (
                    <button onClick={() => portfolioRef.current?.click()} className="rounded-2xl bg-[#0e111d] px-4 py-2 text-xs font-black text-white hover:bg-[#1e2a45] transition">+ Thêm</button>
                  )}
                  <Link href="/profilephotographer/portfolio" className="rounded-2xl border border-[#e8eaf1] px-4 py-2 text-xs font-bold text-[#6b7280] hover:border-[#ff8d28] hover:text-[#ff8d28] transition">Xem tất cả →</Link>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {(portfolio.length ? portfolio.slice(0, 8) : SAMPLE_PORTFOLIO_IMAGES).map((url, i) => (
                  <div key={i} className="group relative overflow-hidden rounded-[24px] bg-[#f8fafc] shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                    <img src={url} alt="Portfolio" className="h-32 w-full object-cover transition duration-300 group-hover:scale-105" />
                    {editMode && portfolio.length > 0 && (
                      <button onClick={() => setPortfolio(p => p.filter((_, j) => j !== i))}
                        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white text-xs font-black shadow opacity-0 group-hover:opacity-100 transition">×</button>
                    )}
                    {!portfolio.length && (
                      <div className="absolute inset-x-0 bottom-0 bg-black/30 px-3 py-2 text-[11px] text-white">Ảnh mẫu đẹp để tham khảo</div>
                    )}
                  </div>
                ))}
              </div>
              {!portfolio.length && (
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button onClick={() => portfolioRef.current?.click()} className="rounded-2xl bg-[#ff8d28] px-4 py-2 text-sm font-black text-white transition hover:bg-[#e0751b]">Tải ảnh portfolio</button>
                  <span className="text-sm text-[#64748b]">Thêm ảnh để khách hàng thấy ngay phong cách của bạn.</span>
                </div>
              )}
            </section>
          </div>

          {/* ── Right sidebar ── */}
          <div className="space-y-5">

            {/* Thông tin */}
            <section className="rounded-[28px] border border-[#e8eaf1] bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-orange-50 text-lg">⚙️</span>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-[#ff8d28]">Thông tin</p>
                  <h3 className="text-base font-black text-[#0e111d]">Chi tiết hồ sơ</h3>
                </div>
              </div>
              <div className="space-y-3 text-[13px]">
                {[
                  { label: "Số điện thoại", val: phone,  set: setPhone,  ph: "0901 234 567" },
                  { label: "Khu vực",       val: activeArea, set: setActiveArea, ph: "TP. Hồ Chí Minh" },
                  { label: "Năm bắt đầu",   val: String(startedYear), set: (v: string) => setStartedYear(Number(v)), ph: "2020", type: "number" },
                ].map(f => (
                  <div key={f.label}>
                    <p className="text-[10px] font-black uppercase tracking-wider text-[#9ca3af] mb-0.5">{f.label}</p>
                    {editMode
                      ? <input type={(f as any).type || "text"} value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                          className="w-full rounded-xl border border-[#e0e3ec] bg-[#fafbfc] px-3 py-2 text-[12px] outline-none focus:border-[#ff8d28]" />
                      : <p className="font-semibold text-[#0e111d]">{f.val || <span className="text-[#d1d5db]">Chưa có</span>}</p>
                    }
                  </div>
                ))}
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#9ca3af] mb-0.5">Hình thức</p>
                  {editMode
                    ? <select value={photographerType} onChange={e => setPhotographerType(e.target.value)}
                        className="w-full rounded-xl border border-[#e0e3ec] bg-[#fafbfc] px-3 py-2 text-[12px] outline-none focus:border-[#ff8d28]">
                        <option value="freelance">Freelance</option>
                        <option value="studio">Studio</option>
                      </select>
                    : <p className="font-semibold text-[#0e111d] capitalize">{photographerType}</p>
                  }
                </div>
              </div>
            </section>

            {/* Thiết bị */}
            <section className="rounded-[28px] border border-[#e8eaf1] bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-sm font-black text-[#0e111d] flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-orange-50 text-base">📷</span>
                Thiết bị
              </h2>
              <div className="flex flex-wrap gap-2 mb-3">
                {equipment.map(item => (
                  <span key={item} className="inline-flex items-center gap-1 rounded-full border border-[#e8eaf1] bg-[#f8f9fc] px-3 py-1 text-[12px] font-semibold text-[#374151]">
                    {item}
                    {editMode && <button onClick={() => setEquipment(e => e.filter(x => x !== item))} className="text-[#cbd5e1] hover:text-red-400 ml-0.5">×</button>}
                  </span>
                ))}
              </div>
              {editMode && (
                <div className="flex gap-2">
                  <input value={equipInput} onChange={e => setEquipInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && equipInput.trim()) { setEquipment(eq => [...eq, equipInput.trim()]); setEquipInput(""); }}}
                    placeholder="Thêm thiết bị..." className="flex-1 rounded-xl border border-[#e0e3ec] bg-[#fafbfc] px-3 py-2 text-[12px] outline-none focus:border-[#ff8d28]" />
                  <button onClick={() => { if (equipInput.trim()) { setEquipment(eq => [...eq, equipInput.trim()]); setEquipInput(""); }}}
                    className="rounded-xl bg-[#ff8d28] px-3 py-2 text-xs font-black text-white hover:bg-[#e0751b]">+</button>
                </div>
              )}
            </section>

            {/* Trợ giúp nhanh */}
            <section className="rounded-2xl bg-gradient-to-br from-[#0e111d] to-[#1e2a45] p-5 text-white">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#ff8d28] mb-1">Hỗ trợ</p>
              <h3 className="text-[14px] font-black mb-3">Cần giúp đỡ?</h3>
              <p className="text-[12px] text-white/60 mb-4 leading-5">Liên hệ đội ngũ STUDION để được hỗ trợ nâng cấp hồ sơ và tăng lượt booking.</p>
              <a href="mailto:support@studion.vn" className="flex items-center justify-center gap-1.5 rounded-xl bg-[#ff8d28] py-2.5 text-xs font-black text-white hover:bg-[#e0751b] transition">
                📧 Liên hệ hỗ trợ
              </a>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
