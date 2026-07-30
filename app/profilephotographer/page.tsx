"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/auth-context";
import { useToast } from "@/app/toast-context";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function authHeaders() {
  const token = typeof window !== "undefined" ? window.localStorage.getItem("sudion_token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function resolveAssetUrl(url: string) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url) || url.startsWith("data:")) return url;
  const backendHost = API_URL.replace(/\/api\/?$/, "");
  return `${backendHost}${url.startsWith("/") ? url : `/${url}`}`;
}

const DEFAULT_PROFILE_IMAGE =
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80";

/* ─── icons ─────────────────────────────────────────────────── */
function IconCamera({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}
function IconWrench({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
    </svg>
  );
}
function IconPin({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
function IconSort({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 6h18M7 12h10M11 18h2" />
    </svg>
  );
}
function IconUpload({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}
function IconDots({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" />
    </svg>
  );
}
function IconStar({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

/* ─── main page ─────────────────────────────────────────────── */
export default function ProfilePhotographerPage() {
  const { session, isLoggedIn } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [activeArea, setActiveArea] = useState("");
  const [startedYear, setStartedYear] = useState<number>(2024);
  const [photographerType, setPhotographerType] = useState<string>("freelance");
  const [avatar, setAvatar] = useState("");
  const [portfolio, setPortfolio] = useState<string[]>([]);
  const [packages, setPackages] = useState<any[]>([]);

  const [equipment, setEquipment] = useState<string[]>([]);
  const [equipmentInput, setEquipmentInput] = useState("");
  const [languages, setLanguages] = useState<string[]>([]);
  const [languageInput, setLanguageInput] = useState("");

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const portfolioInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoggedIn || !session?.userId) {
      setLoading(false);
      return;
    }

    async function loadProfile() {
      try {
        setLoading(true);
        const meRes = await fetch(`${API_URL}/photographers/me`, {
          headers: authHeaders(),
          cache: "no-store",
        });
        const meJson = await meRes.json();

        if (!meRes.ok || !meJson.success) {
          throw new Error(meJson.message || "Không thể tải hồ sơ thợ ảnh.");
        }

        const photographerId =
          meJson.data?.photographer_id || meJson.data?.photographer?.id;

        const res = await fetch(`${API_URL}/photographers/${photographerId}/profile`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Không thể tải hồ sơ thợ ảnh.");
        const json = await res.json();
        if (json.success && json.data) {
          const { photographer, portfolio: portfolioImages, packages: pkgs } = json.data;
          setName(photographer.full_name || "");
          setPhone(photographer.phone || "");
          setBio(photographer.bio || "");
          setActiveArea(photographer.active_area || "");
          setStartedYear(Number(photographer.started_year || 2024));
          setPhotographerType(photographer.photographer_type || "freelance");
          setAvatar(photographer.avatar_url || "");
          setPortfolio(portfolioImages || []);
          setPackages(pkgs || []);
          setEquipment(Array.isArray(photographer.equipment) ? photographer.equipment : []);
          setLanguages(Array.isArray(photographer.languages) ? photographer.languages : []);
        }
      } catch (err) {
        toast.error("Lỗi", "Không thể lấy thông tin hồ sơ của bạn.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [isLoggedIn, session?.userId, toast]);

  const removeEquipment = (item: string) =>
    setEquipment((prev) => prev.filter((e) => e !== item));

  const addEquipment = () => {
    const val = equipmentInput.trim();
    if (val && !equipment.includes(val)) setEquipment((prev) => [...prev, val]);
    setEquipmentInput("");
  };

  const removeLanguage = (lang: string) =>
    setLanguages((prev) => prev.filter((l) => l !== lang));

  const addLanguage = () => {
    const value = languageInput.trim();
    if (value && !languages.includes(value)) {
      setLanguages((prev) => [...prev, value]);
    }
    setLanguageInput("");
  };

  const handleAvatarClick = () => {
    avatarInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);

      toast.success("Đang tải lên", "Đang tải ảnh đại diện lên máy chủ...");
      const res = await fetch(`${API_URL}/uploads`, {
        method: "POST",
        headers: authHeaders(),
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Tải ảnh thất bại.");
      }

      setAvatar(json.data.url);
      toast.success("Thành công", "Đã cập nhật ảnh đại diện tạm thời. Vui lòng bấm Lưu thay đổi.");
    } catch (error: any) {
      toast.error("Lỗi tải ảnh", error.message || "Có lỗi xảy ra khi tải ảnh.");
    }
  };

  const handlePortfolioClick = () => {
    portfolioInputRef.current?.click();
  };

  const handlePortfolioChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);

      toast.success("Đang tải lên", "Đang tải ảnh portfolio lên máy chủ...");
      const res = await fetch(`${API_URL}/uploads`, {
        method: "POST",
        headers: authHeaders(),
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Tải ảnh thất bại.");
      }

      setPortfolio((prev) => [...prev, json.data.url]);
      toast.success("Thành công", "Đã thêm ảnh portfolio tạm thời. Vui lòng bấm Lưu thay đổi.");
    } catch (error: any) {
      toast.error("Lỗi tải ảnh", error.message || "Có lỗi xảy ra khi tải ảnh.");
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = typeof window !== 'undefined' ? window.localStorage.getItem('sudion_token') : null;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_URL}/photographers/profile`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          name,
          phone,
          avatar_url: avatar,
          bio,
          active_area: activeArea,
          started_year: startedYear,
          photographer_type: photographerType,
          equipment,
          languages,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Cập nhật hồ sơ thất bại.");
      }

      toast.success("Thành công", "Đã lưu thay đổi hồ sơ nhiếp ảnh gia.");
    } catch (error: any) {
      toast.error("Lỗi lưu hồ sơ", error.message || "Có lỗi xảy ra.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white text-[#1a1a2e]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ff8d28] border-t-transparent" />
        <p className="mt-4 text-xs font-semibold text-slate-500">Đang tải hồ sơ...</p>
      </div>
    );
  }

  return (
    <main className="px-6 py-7 lg:px-8 xl:px-10">
      <div className="mx-auto w-full max-w-[860px] space-y-5 pb-10">
        
        {/* Hidden File Inputs */}
        <input
          type="file"
          ref={avatarInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleAvatarChange}
        />
        <input
          type="file"
          ref={portfolioInputRef}
          className="hidden"
          accept="image/*"
          onChange={handlePortfolioChange}
        />

        {/* ── Header ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1a1a2e]">Hồ Sơ Nhiếp Ảnh Gia</h1>
            <p className="mt-1 text-[13px] text-slate-500">
              Quản lý cách bạn xuất hiện trước khách hàng trên STUDION.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="flex items-center gap-1.5 rounded-lg bg-[#ff8d28] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#e07820] transition disabled:opacity-50"
            >
              <IconUpload className="h-4 w-4" />
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </div>

        {/* ── Thông tin cơ bản ── */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50 text-[#ff8d28]">
              <IconCamera className="h-4 w-4" />
            </span>
            <h2 className="font-bold text-[#1a1a2e]">Thông tin cơ bản</h2>
          </div>

          <div className="flex flex-col gap-6 sm:flex-row">
            {/* avatar */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div className="relative">
                <img
                  src={resolveAssetUrl(avatar) || DEFAULT_PROFILE_IMAGE}
                  alt={name || "Nhiếp ảnh gia"}
                  className="h-[100px] w-[100px] rounded-full object-cover border-2 border-orange-100"
                />
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  aria-label="Đổi ảnh đại diện"
                  className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-[#ff8d28] text-white shadow hover:bg-[#e07820] transition"
                >
                  <IconCamera className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="text-center text-[11px] text-slate-400 leading-tight">
                Định dạng JPG, PNG
                <br />
                Tối đa 5MB
              </p>
            </div>

            {/* fields */}
            <div className="flex-1 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* tên */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Tên hiển thị
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-[#f8f8fb] px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-300 focus:ring-1 focus:ring-orange-100"
                  />
                </div>
                {/* Số điện thoại */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-[#f8f8fb] px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-300 focus:ring-1 focus:ring-orange-100"
                  />
                </div>
              </div>

              {/* tiểu sử */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-slate-500">Tiểu sử</label>
                  <span className="text-[11px] text-slate-400">{bio.length}/500</span>
                </div>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  maxLength={500}
                  className="w-full resize-none rounded-lg border border-slate-200 bg-[#f8f8fb] px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-300 focus:ring-1 focus:ring-orange-100"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── Thông tin chuyên môn ── */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50 text-[#ff8d28]">
              <IconWrench className="h-4 w-4" />
            </span>
            <h2 className="font-bold text-[#1a1a2e]">Thông tin chuyên môn</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {/* thiết bị */}
            <div>
              <p className="text-[11px] font-semibold text-slate-500 mb-2">Danh sách thiết bị</p>
              <div className="min-h-[96px] rounded-lg border border-slate-200 bg-[#f8f8fb] p-3 flex flex-col gap-2">
                <div className="flex flex-wrap gap-1.5">
                  {equipment.length > 0 ? (
                    equipment.map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center gap-1 rounded-md bg-white border border-slate-200 px-2.5 py-1 text-xs text-slate-700 shadow-sm"
                      >
                        {item}
                        <button
                          type="button"
                          onClick={() => removeEquipment(item)}
                          aria-label={`Xóa ${item}`}
                          className="ml-0.5 text-slate-400 hover:text-red-400 leading-none"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">Chưa có thiết bị nào được nhập.</p>
                  )}
                </div>
                <div className="flex gap-1 mt-auto">
                  <input
                    value={equipmentInput}
                    onChange={(e) => setEquipmentInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addEquipment()}
                    placeholder="Thêm thiết bị..."
                    className="flex-1 rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 outline-none focus:border-orange-300"
                  />
                  <button
                    type="button"
                    onClick={addEquipment}
                    className="rounded border border-orange-200 bg-orange-50 px-2 py-1 text-xs text-orange-600 hover:bg-orange-100 transition"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* ngôn ngữ */}
            <div>
              <p className="text-[11px] font-semibold text-slate-500 mb-2">Ngôn ngữ</p>
              <div className="min-h-[96px] rounded-lg border border-slate-200 bg-[#f8f8fb] p-3 flex flex-col gap-2">
                <div className="flex flex-wrap gap-1.5">
                  {languages.length > 0 ? (
                    languages.map((lang) => (
                      <span
                        key={lang}
                        className="inline-flex items-center gap-1 rounded-md bg-white border border-slate-200 px-2.5 py-1 text-xs text-slate-700 shadow-sm"
                      >
                        {lang}
                        <button
                          type="button"
                          onClick={() => removeLanguage(lang)}
                          aria-label={`Xóa ${lang}`}
                          className="ml-0.5 text-slate-400 hover:text-red-400 leading-none"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">Chưa có ngôn ngữ nào được nhập.</p>
                  )}
                </div>
                <div className="flex gap-1 mt-auto">
                  <input
                    value={languageInput}
                    onChange={(e) => setLanguageInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addLanguage()}
                    placeholder="Thêm ngôn ngữ..."
                    className="flex-1 rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 outline-none focus:border-orange-300"
                  />
                  <button
                    type="button"
                    onClick={addLanguage}
                    className="rounded border border-orange-200 bg-orange-50 px-2 py-1 text-xs text-orange-600 hover:bg-orange-100 transition"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* vị trí */}
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-2">Vị trí hoạt động</label>
                <input
                  value={activeArea}
                  onChange={(e) => setActiveArea(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-[#f8f8fb] px-3 py-2 text-xs text-slate-900 outline-none focus:border-orange-300"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-2">Năm bắt đầu</label>
                <input
                  type="number"
                  value={startedYear}
                  onChange={(e) => setStartedYear(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 bg-[#f8f8fb] px-3 py-2 text-xs text-slate-900 outline-none focus:border-orange-300"
                />
              </div>
            </div>

            {/* Hình thức hoạt động */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-2">Hình thức thợ ảnh</label>
              <select
                value={photographerType}
                onChange={(e) => setPhotographerType(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-[#f8f8fb] px-3 py-2 text-xs text-slate-900 outline-none focus:border-orange-300"
              >
                <option value="freelance">Freelance (Tự do)</option>
                <option value="studio">Studio (Cửa hàng)</option>
              </select>
            </div>
          </div>
        </section>

        {/* ── Portfolio ── */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50 text-[#ff8d28]">
                <IconCamera className="h-4 w-4" />
              </span>
              <div>
                <h2 className="font-bold text-[#1a1a2e]">Ảnh nổi bật (Portfolio)</h2>
                <p className="text-[12px] text-slate-500">
                  Các bức ảnh làm nổi bật năng lực chụp ảnh của bạn.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handlePortfolioClick}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-[#1a1a2e] px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition"
              >
                <IconUpload className="h-3.5 w-3.5" />
                Tải lên ảnh mới
              </button>
            </div>
          </div>

          {/* grid hiển thị portfolio */}
          {portfolio.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 py-8 text-center text-xs text-slate-400 bg-slate-50">
              Chưa có ảnh portfolio nào được tải lên.
            </div>
          ) : (
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
              {portfolio.map((imgUrl, idx) => (
                <div key={idx} className="relative overflow-hidden rounded-xl bg-slate-100 aspect-square border border-slate-200">
                  <img
                    src={imgUrl}
                    alt={`Portfolio ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setPortfolio((prev) => prev.filter((_, i) => i !== idx))}
                    className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-red-500 text-white text-xs font-black shadow hover:bg-red-600 transition"
                    title="Xóa ảnh"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Gói dịch vụ ── */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50 text-[#ff8d28]">
                <IconStar className="h-4 w-4" />
              </span>
              <h2 className="font-bold text-[#1a1a2e]">Các gói dịch vụ</h2>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {packages.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 py-8 text-center text-xs text-slate-400 bg-slate-50 col-span-2">
                Chưa có gói dịch vụ nào được tạo.
              </div>
            ) : (
              packages.map((service) => (
                <div
                  key={service.id}
                  className="rounded-xl border border-slate-200 bg-[#f8f8fb] p-4 flex flex-col gap-3 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <span
                        className="inline-block rounded-md bg-[#e8f5e9] text-[#2e7d32] px-2 py-0.5 text-[10px] font-bold mb-1.5"
                      >
                        {service.category_name || "Dịch vụ"}
                      </span>
                      <h3 className="text-sm font-bold text-[#1a1a2e] leading-snug">{service.name}</h3>
                      <p className="mt-0.5 text-[#ff8d28] font-bold text-base">
                        {Number(service.price).toLocaleString("vi-VN")}
                        <span className="text-[11px] font-medium text-slate-500"> VND/buổi</span>
                      </p>
                    </div>
                  </div>

                  <p className="text-[12px] text-slate-500 leading-relaxed line-clamp-2">
                    {service.description}
                  </p>

                  <div className="flex items-center justify-between text-[11px] font-semibold">
                    <span className="text-slate-500">
                      ⏱ Thời lượng: {service.duration || 120} phút
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

      </div>
    </main>
  );
}
