"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/app/auth-context";
import { useToast } from "@/app/toast-context";
import { getPhotographerProfile, updatePhotographerProfile, type PhotographerProfile } from "../api";

const SERVICE_OPTIONS = ["Chân dung cá nhân","Cặp đôi","Cưới hỏi","Kỷ yếu","Sự kiện","Food & Product","Travel"];
const PAYMENT_OPTIONS = ["Chuyển khoản","Momo","VNPay","Tiền mặt"];

type ProfileState = {
  displayName: string;
  title: string;
  location: string;
  email: string;
  phone: string;
  bio: string;
  services: string[];
  isProfileActive: boolean;
  acceptMessages: boolean;
  noticeBeforeBooking: string;
  maxBookingsPerDay: number;
  bufferMinutes: number;
  priceFrom: number;
  priceTo: number;
  payoutAccount: string;
  payoutName: string;
  password: string;
  newPassword: string;
  confirmPassword: string;
  notifications: { bookingRequests: boolean; messages: boolean; reviews: boolean; promotions: boolean };
};

const NOTIFY_LABELS: Record<string, string> = {
  bookingRequests: "Yêu cầu booking",
  messages: "Tin nhắn",
  reviews: "Đánh giá",
  promotions: "Khuyến mãi",
};

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${on ? "bg-orange-500" : "bg-slate-200"}`}>
      <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-4" : "translate-x-1"}`} />
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold text-slate-500">{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text" }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-orange-400 focus:bg-white transition" />
  );
}

export default function PhotographerSettingsPage() {
  const [profile, setProfile] = useState<ProfileState>({
    displayName: "Nguyễn Văn A",
    title: "Nhiếp ảnh gia sự kiện & lifestyle",
    location: "TP.HCM",
    email: "nguyenvana@example.com",
    phone: "0909 123 456",
    bio: "Chuyên chụp ảnh cưới, sự kiện và food styling.",
    services: ["Cưới hỏi","Food & Product"],
    isProfileActive: true,
    acceptMessages: true,
    noticeBeforeBooking: "24 giờ",
    maxBookingsPerDay: 3,
    bufferMinutes: 60,
    priceFrom: 1200000,
    priceTo: 6500000,
    payoutAccount: "Vietcombank - 123456789",
    payoutName: "Nguyễn Văn A",
    password: "",
    newPassword: "",
    confirmPassword: "",
    notifications: { bookingRequests: true, messages: true, reviews: false, promotions: false },
  });

  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile"|"booking"|"payment"|"security">("profile");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const toast = useToast();
  const { session, isPhotographer } = useAuth();

  const photographerId = useMemo(() => {
    if (isPhotographer && session?.photographerId) return session.photographerId;
    if (typeof window !== "undefined") return window.localStorage.getItem("sudion_photographer_id") ?? "";
    return "";
  }, [isPhotographer, session]);

  const set = (field: string, value: unknown) => setProfile((p) => ({ ...p, [field]: value }));
  const toggleService = (s: string) => setProfile((p) => ({
    ...p,
    services: Array.isArray(p.services) ? (p.services.includes(s) ? p.services.filter((x) => x !== s) : [...p.services, s]) : [s],
  }));
  const toggleNotify = (k: keyof ProfileState["notifications"]) =>
    setProfile((p) => ({ ...p, notifications: { ...p.notifications, [k]: !p.notifications[k] } }));

  const selectedServices = useMemo(() => Array.isArray(profile.services) ? profile.services.join(" · ") : "", [profile.services]);

  useEffect(() => {
    if (!photographerId) return;
    setLoading(true);
    setError("");

      getPhotographerProfile(photographerId)
      .then((data) => {
        setProfile((prev) => ({
          ...prev,
          displayName: data.displayName ?? prev.displayName,
          title: data.title ?? prev.title,
          location: data.location ?? prev.location,
          email: data.email ?? prev.email,
          phone: data.phone ?? prev.phone,
          bio: data.bio ?? prev.bio,
          services: Array.isArray(data.services) ? data.services : prev.services,
          isProfileActive: data.isProfileActive ?? prev.isProfileActive,
          acceptMessages: data.acceptMessages ?? prev.acceptMessages,
          noticeBeforeBooking: data.noticeBeforeBooking ?? prev.noticeBeforeBooking,
          maxBookingsPerDay: data.maxBookingsPerDay ?? prev.maxBookingsPerDay,
          bufferMinutes: data.bufferMinutes ?? prev.bufferMinutes,
          priceFrom: data.priceFrom ?? prev.priceFrom,
          priceTo: data.priceTo ?? prev.priceTo,
          payoutAccount: data.payoutAccount ?? prev.payoutAccount,
          payoutName: data.payoutName ?? prev.payoutName,
          notifications: data.notifications ?? prev.notifications,
        }));
      })
      .catch((error) => {
        setError(error instanceof Error ? error.message : "Không thể tải hồ sơ.");
      })
      .finally(() => setLoading(false));
  }, [photographerId]);

  async function handleSave() {
    if (!photographerId) {
      setError("Không xác định Photographer ID.");
      return;
    }

    if (profile.newPassword && profile.newPassword !== profile.confirmPassword) {
      setError("Mật khẩu mới không khớp.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload: Partial<PhotographerProfile> & { password?: string } = {
        displayName: profile.displayName,
        title: profile.title,
        location: profile.location,
        email: profile.email,
        phone: profile.phone,
        bio: profile.bio,
        services: profile.services,
        isProfileActive: profile.isProfileActive,
        acceptMessages: profile.acceptMessages,
        noticeBeforeBooking: profile.noticeBeforeBooking,
        maxBookingsPerDay: profile.maxBookingsPerDay,
        bufferMinutes: profile.bufferMinutes,
        priceFrom: profile.priceFrom,
        priceTo: profile.priceTo,
        payoutAccount: profile.payoutAccount,
        payoutName: profile.payoutName,
        notifications: profile.notifications,
      };

      if (profile.newPassword) {
        payload.password = profile.newPassword;
      }

      await updatePhotographerProfile(photographerId, payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      if (profile.newPassword) {
        set("password", "");
        set("newPassword", "");
        set("confirmPassword", "");
      }
      toast.success("Lưu hồ sơ", "Thông tin đã được cập nhật.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Lưu hồ sơ thất bại.";
      setError(message);
      toast.error("Lỗi lưu", message);
    } finally {
      setSaving(false);
    }
  }

  const TABS = [
    { id: "profile", label: "Hồ sơ" },
    { id: "booking", label: "Booking" },
    { id: "payment", label: "Thanh toán" },
    { id: "security", label: "Bảo mật" },
  ] as const;

  return (
    <div className="px-5 py-6 lg:px-8">
      <div className="mx-auto max-w-[1100px] pb-10">
        {/* Header */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-orange-500">Cài đặt</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-800">Quản lý hồ sơ</h1>
            <p className="mt-1 text-sm text-slate-400">Cập nhật thông tin, lịch chụp và bảo mật tài khoản.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setProfile((p) => ({ ...p, password: "", newPassword: "", confirmPassword: "" }))}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition">
              Đặt lại
            </button>
            <button onClick={handleSave}
              className="rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-orange-600 transition">
              {saved ? "✓ Đã lưu" : "Lưu thay đổi"}
            </button>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
          {/* Sidebar profile card */}
          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm text-center">
              <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-2xl bg-orange-100 text-3xl font-bold text-orange-500">
                {profile.displayName?.charAt(0) ?? "P"}
              </div>
              <p className="text-sm font-bold text-slate-800">{profile.displayName ?? "Chưa đặt tên"}</p>
              <p className="text-xs text-slate-400">{profile.title}</p>
              <div className="mt-3 flex items-center justify-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${profile.isProfileActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                  {profile.isProfileActive ? "Đang hoạt động" : "Tạm ẩn"}
                </span>
                <Toggle on={profile.isProfileActive} onToggle={() => set("isProfileActive", !profile.isProfileActive)} />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Dịch vụ nổi bật</p>
              <p className="text-xs text-slate-600">{selectedServices || "Chưa chọn"}</p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Thông báo</p>
              <div className="space-y-2.5">
                {(Object.entries(profile.notifications) as [keyof ProfileState["notifications"], boolean][]).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">{NOTIFY_LABELS[k]}</span>
                    <Toggle on={v} onToggle={() => toggleNotify(k)} />
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-slate-100">
              {TABS.map((t) => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`flex-1 py-3 text-sm font-bold transition ${activeTab === t.id ? "border-b-2 border-orange-500 text-orange-500" : "text-slate-500 hover:text-slate-700"}`}>
                  {t.label}
                </button>
              ))}
            </div>

            <div className="p-5 space-y-4">
              {/* TAB: Hồ sơ */}
              {activeTab === "profile" && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Tên hiển thị"><Input value={profile.displayName} onChange={(v) => set("displayName", v)} /></Field>
                    <Field label="Tiêu đề nghề nghiệp"><Input value={profile.title} onChange={(v) => set("title", v)} /></Field>
                    <Field label="Địa điểm làm việc"><Input value={profile.location} onChange={(v) => set("location", v)} placeholder="TP.HCM" /></Field>
                    <Field label="Email liên hệ"><Input value={profile.email} onChange={(v) => set("email", v)} type="email" /></Field>
                    <Field label="Số điện thoại"><Input value={profile.phone} onChange={(v) => set("phone", v)} /></Field>
                  </div>
                  <Field label="Tiểu sử">
                    <textarea value={profile.bio} onChange={(e) => set("bio", e.target.value)} rows={4}
                      placeholder="Mô tả phong cách và kinh nghiệm của bạn..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-orange-400 focus:bg-white resize-none transition" />
                  </Field>
                  <Field label="Chấp nhận tin nhắn trực tiếp">
                    <div className="flex items-center gap-2">
                      <Toggle on={profile.acceptMessages} onToggle={() => set("acceptMessages", !profile.acceptMessages)} />
                      <span className="text-xs text-slate-500">{profile.acceptMessages ? "Khách có thể nhắn tin" : "Tắt tin nhắn"}</span>
                    </div>
                  </Field>
                </>
              )}

              {/* TAB: Booking */}
              {activeTab === "booking" && (
                <>
                  <div>
                    <p className="mb-3 text-sm font-bold text-slate-700">Danh mục dịch vụ</p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                      {SERVICE_OPTIONS.map((s) => (
                        <button key={s} type="button" onClick={() => toggleService(s)}
                          className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition ${(Array.isArray(profile.services) && profile.services.includes(s)) ? "border-orange-300 bg-orange-50 text-orange-600" : "border-slate-200 bg-slate-50 text-slate-500 hover:border-orange-200"}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Thông báo trước khi booking">
                      <Input value={profile.noticeBeforeBooking} onChange={(v) => set("noticeBeforeBooking", v)} placeholder="24 giờ" />
                    </Field>
                    <Field label="Số booking tối đa / ngày">
                      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                        <button type="button" onClick={() => set("maxBookingsPerDay", Math.max(1, profile.maxBookingsPerDay - 1))}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-sm font-bold text-slate-600 shadow-sm hover:bg-orange-50">−</button>
                        <span className="flex-1 text-center text-sm font-bold text-slate-700">{profile.maxBookingsPerDay}</span>
                        <button type="button" onClick={() => set("maxBookingsPerDay", Math.min(10, profile.maxBookingsPerDay + 1))}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-sm font-bold text-slate-600 shadow-sm hover:bg-orange-50">+</button>
                      </div>
                    </Field>
                    <Field label="Khoảng đệm mỗi booking (phút)">
                      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                        <button type="button" onClick={() => set("bufferMinutes", Math.max(30, profile.bufferMinutes - 30))}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-sm font-bold text-slate-600 shadow-sm hover:bg-orange-50">−</button>
                        <span className="flex-1 text-center text-sm font-bold text-slate-700">{profile.bufferMinutes} phút</span>
                        <button type="button" onClick={() => set("bufferMinutes", Math.min(240, profile.bufferMinutes + 30))}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-sm font-bold text-slate-600 shadow-sm hover:bg-orange-50">+</button>
                      </div>
                    </Field>
                  </div>
                </>
              )}

              {/* TAB: Thanh toán */}
              {activeTab === "payment" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Giá từ (VNĐ)">
                    <input type="number" min={0} value={profile.priceFrom}
                      onChange={(e) => set("priceFrom", Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:bg-white transition" />
                  </Field>
                  <Field label="Giá đến (VNĐ)">
                    <input type="number" min={0} value={profile.priceTo}
                      onChange={(e) => set("priceTo", Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:bg-white transition" />
                  </Field>
                  <Field label="Phương thức thanh toán">
                    <select className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:bg-white transition">
                      {PAYMENT_OPTIONS.map((p) => <option key={p}>{p}</option>)}
                    </select>
                  </Field>
                  <Field label="Số tài khoản nhận tiền">
                    <Input value={profile.payoutAccount} onChange={(v) => set("payoutAccount", v)} />
                  </Field>
                  <Field label="Tên chủ tài khoản">
                    <Input value={profile.payoutName} onChange={(v) => set("payoutName", v)} />
                  </Field>
                </div>
              )}

              {/* TAB: Bảo mật */}
              {activeTab === "security" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Mật khẩu hiện tại">
                    <Input type="password" value={profile.password} onChange={(v) => set("password", v)} placeholder="••••••••" />
                  </Field>
                  <Field label="Mật khẩu mới">
                    <Input type="password" value={profile.newPassword} onChange={(v) => set("newPassword", v)} placeholder="Nhập mật khẩu mới" />
                  </Field>
                  <Field label="Xác nhận mật khẩu mới">
                    <Input type="password" value={profile.confirmPassword} onChange={(v) => set("confirmPassword", v)} placeholder="Nhập lại mật khẩu mới" />
                  </Field>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-sm font-bold text-slate-700">Xác thực hai lớp (2FA)</p>
                    <p className="mt-1 text-xs text-slate-400">Bật thêm bảo mật đăng nhập để bảo vệ tài khoản.</p>
                    <button className="mt-3 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-orange-50 hover:text-orange-500 transition">
                      Kích hoạt 2FA
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
