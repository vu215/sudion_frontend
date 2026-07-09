"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useAuth } from "@/app/auth-context";

type Tab = "Thông tin" | "Đổi mật khẩu" | "Thông báo";
type AppRole = "customer" | "photographer";

function safeParseJson(value: string | null) {
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function decodeJwtPayload(token: string) {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(normalized)
        .split("")
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join("")
    );

    return JSON.parse(json);
  } catch {
    return null;
  }
}

function findDeepValue(obj: any, keys: string[]): string {
  if (!obj || typeof obj !== "object") return "";

  for (const key of keys) {
    const value = obj?.[key];

    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }

  for (const value of Object.values(obj)) {
    if (value && typeof value === "object") {
      const found = findDeepValue(value, keys);
      if (found) return found;
    }
  }

  return "";
}

function readStoredAuthData() {
  if (typeof window === "undefined") return [];

  const result: any[] = [];

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key) continue;

    const raw = window.localStorage.getItem(key);
    if (!raw) continue;

    const parsed = safeParseJson(raw);

    result.push({
      key,
      raw,
      parsed,
    });

    if (raw.startsWith("eyJ") && raw.split(".").length === 3) {
      const jwtPayload = decodeJwtPayload(raw);

      if (jwtPayload) {
        result.push({
          key: `${key}:jwt`,
          raw,
          parsed: jwtPayload,
        });
      }
    }

    if (parsed) {
      const token = findDeepValue(parsed, [
        "token",
        "accessToken",
        "access_token",
        "authToken",
        "jwt",
      ]);

      if (token) {
        const jwtPayload = decodeJwtPayload(token);

        if (jwtPayload) {
          result.push({
            key: `${key}:tokenPayload`,
            raw: token,
            parsed: jwtPayload,
          });
        }
      }
    }
  }

  return result;
}

function normalizeRole(value: unknown): AppRole {
  const role = String(value || "").toLowerCase();

  if (
    role.includes("photographer") ||
    role.includes("photo") ||
    role.includes("nhiếp") ||
    role.includes("nhiep")
  ) {
    return "photographer";
  }

  return "customer";
}

function getRealRole(session: any): AppRole {
  const sessionRole =
    session?.role ||
    session?.user?.role ||
    session?.data?.role ||
    session?.account?.role;

  if (sessionRole) return normalizeRole(sessionRole);

  const storedItems = readStoredAuthData();

  for (const item of storedItems) {
    if (!item.parsed) continue;

    const role = findDeepValue(item.parsed, [
      "role",
      "user_role",
      "account_role",
    ]);

    if (role) return normalizeRole(role);
  }

  return "customer";
}

function getRealFullName(session: any) {
  const fromSession =
    session?.fullName ||
    session?.full_name ||
    session?.name ||
    session?.user?.fullName ||
    session?.user?.full_name ||
    session?.user?.name;

  if (fromSession) return fromSession;

  for (const item of readStoredAuthData()) {
    if (!item.parsed) continue;

    const name = findDeepValue(item.parsed, [
      "fullName",
      "full_name",
      "name",
      "user_name",
    ]);

    if (name) return name;
  }

  return "Người dùng";
}

function getRealEmail(session: any) {
  const fromSession =
    session?.email ||
    session?.user?.email ||
    session?.data?.email ||
    session?.account?.email;

  if (fromSession) return fromSession;

  for (const item of readStoredAuthData()) {
    if (!item.parsed) continue;

    const email = findDeepValue(item.parsed, [
      "email",
      "user_email",
      "customer_email",
    ]);

    if (email) return email;
  }

  return "user@email.com";
}

export default function ProfilePage() {
  const { session } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [realRole, setRealRole] = useState<AppRole>("customer");
  const [displayEmail, setDisplayEmail] = useState("user@email.com");

  const [avatar, setAvatar] = useState<string | null>(null);
  const [fullName, setFullName] = useState("Người dùng");
  const [phone, setPhone] = useState("0901 234 567");
  const [birthday, setBirthday] = useState("1995-06-15");
  const [gender, setGender] = useState("Nữ");
  const [address, setAddress] = useState("TP. Hồ Chí Minh");
  const [bio, setBio] = useState(
    "Mình yêu thích chụp ảnh cưới và lưu giữ những khoảnh khắc đáng nhớ ✨"
  );
  const [editMode, setEditMode] = useState(false);

  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [cfPw, setCfPw] = useState("");

  const [notifBooking, setNotifBooking] = useState(true);
  const [notifPromo, setNotifPromo] = useState(true);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSms, setNotifSms] = useState(false);

  const [tab, setTab] = useState<Tab>("Thông tin");
  const [toast, setToast] = useState("");

  const isPhotographer = realRole === "photographer";

  useEffect(() => {
    const role = getRealRole(session);
    const name = getRealFullName(session);
    const email = getRealEmail(session);

    setRealRole(role);
    setDisplayEmail(email);
    setFullName(name);

    if (role === "photographer") {
      setBio(
        "Mình là nhiếp ảnh gia trên Studion, chuyên nhận lịch chụp và đồng hành cùng khách hàng trong từng khoảnh khắc."
      );
    }
  }, [session]);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  }

  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  function handleAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      setAvatar(readerEvent.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  function handleSavePw() {
    if (!oldPw || !newPw || !cfPw) {
      notify("Vui lòng điền đầy đủ.");
      return;
    }

    if (newPw !== cfPw) {
      notify("Mật khẩu xác nhận chưa khớp.");
      return;
    }

    setOldPw("");
    setNewPw("");
    setCfPw("");
    notify("Đã cập nhật mật khẩu thành công.");
  }

  const stats = isPhotographer
    ? [
        {
          label: "Booking",
          value: "0",
          color: "text-[#ff8d28]",
          bg: "bg-orange-50",
        },
        {
          label: "Hoàn thành",
          value: "0",
          color: "text-emerald-600",
          bg: "bg-emerald-50",
        },
        {
          label: "Đánh giá",
          value: "0",
          color: "text-amber-500",
          bg: "bg-amber-50",
        },
      ]
    : [
        {
          label: "Booking",
          value: "12",
          color: "text-[#ff8d28]",
          bg: "bg-orange-50",
        },
        {
          label: "Hoàn thành",
          value: "9",
          color: "text-emerald-600",
          bg: "bg-emerald-50",
        },
        {
          label: "Đánh giá",
          value: "8",
          color: "text-amber-500",
          bg: "bg-amber-50",
        },
      ];

  const quickActions = [
    ...(isPhotographer
      ? [
          {
            label: "Dashboard nhiếp ảnh gia",
            sub: "Quản lý đơn booking của bạn",
            href: "/profilephotographer/bookings",
            note: "Photo",
            noteCls: "bg-orange-50 text-orange-500",
            icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
          },
          {
            label: "Tin nhắn khách hàng",
            sub: "Chat theo từng booking",
            href: "/messages",
            note: "Chat",
            noteCls: "bg-emerald-50 text-emerald-600",
            icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
          },
          {
            label: "Hồ sơ photographer",
            sub: "Cập nhật thông tin hiển thị",
            href: "/profilephotographer",
            note: "Profile",
            noteCls: "bg-blue-50 text-blue-500",
            icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
          },
        ]
      : [
          {
            label: "Lịch đặt của tôi",
            sub: "Xem & quản lý lịch chụp",
            href: "/bookings",
            note: "Booking",
            noteCls: "bg-orange-50 text-orange-500",
            icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
          },
          {
            label: "Tìm photographer",
            sub: "Khám phá nhiếp ảnh gia",
            href: "/photographer",
            note: "Khám phá",
            noteCls: "bg-blue-50 text-blue-500",
            icon: "M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z",
          },
          {
            label: "Tin nhắn",
            sub: "Chat với photographer",
            href: "/messages",
            note: "Chat",
            noteCls: "bg-emerald-50 text-emerald-600",
            icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
          },
        ]),
    {
      label: "Thông báo",
      sub: "Cập nhật & tin tức mới",
      href: "/notification",
      note: "Mới",
      noteCls: "bg-red-50 text-red-500",
      icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
    },
  ];

  return (
    <main className="min-h-screen bg-[#f7f8fc]">
      {toast ? (
        <div className="fixed right-6 top-6 z-50 flex items-center gap-2.5 rounded-2xl bg-[#0e111d] px-5 py-3.5 text-[13px] font-bold text-white shadow-2xl">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#ff8d28] text-[10px]">
            ✓
          </span>
          {toast}
        </div>
      ) : null}

      <div className="relative h-52 w-full overflow-hidden bg-gradient-to-br from-[#0e111d] via-[#1a2340] to-[#0e111d]">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#ff8d28]/20 blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 h-64 w-64 rounded-full bg-[#ff8d28]/10 blur-3xl" />

        <div className="absolute left-6 top-6 flex items-center gap-2 text-[12px] font-semibold text-white/50 sm:left-10">
          <Link href="/" className="transition-colors hover:text-white">
            Trang chủ
          </Link>
          <span>/</span>
          <span className="text-white/80">Hồ sơ</span>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1100px] px-5 pb-16 sm:px-8">
        <div className="relative -mt-16 rounded-[28px] border border-[#e8eaf1] bg-white px-6 pb-5 pt-6 shadow-[0_24px_80px_rgba(15,23,42,0.09)] sm:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
            <div className="relative -mt-14 shrink-0 sm:-mt-16">
              <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-gradient-to-br from-[#ff8d28] to-[#f97316] shadow-xl sm:h-28 sm:w-28">
                {avatar ? (
                  <img src={avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-[30px] font-black text-white">
                    {initials || "SD"}
                  </span>
                )}
              </div>

              <button
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-0.5 right-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#ff8d28] shadow-md transition-colors hover:bg-[#e0751b]"
                aria-label="Đổi ảnh đại diện"
              >
                <svg
                  className="h-3.5 w-3.5 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <circle cx="12" cy="13" r="3" />
                </svg>
              </button>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatar}
              />
            </div>

            <div className="min-w-0 flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[22px] font-black tracking-[-0.02em] text-[#0e111d]">
                  {fullName}
                </h1>

                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                    isPhotographer
                      ? "bg-orange-100 text-orange-600"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {isPhotographer ? "Nhiếp ảnh gia" : "Khách hàng"}
                </span>
              </div>

              <p className="mt-0.5 text-[13px] text-[#6b7280]">
                {displayEmail}
              </p>

              {bio ? (
                <p className="mt-2 max-w-[560px] text-[13px] leading-5 text-[#475569]">
                  {bio}
                </p>
              ) : null}
            </div>

            <div className="shrink-0 pb-1">
              {editMode ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditMode(false);
                      notify("Đã lưu thông tin hồ sơ.");
                    }}
                    className="rounded-xl bg-[#ff8d28] px-5 py-2.5 text-[13px] font-black text-white shadow-[0_8px_20px_rgba(255,141,40,0.25)] transition-all hover:bg-[#e0751b]"
                  >
                    Lưu
                  </button>

                  <button
                    onClick={() => setEditMode(false)}
                    className="rounded-xl border border-[#e8eaf1] px-5 py-2.5 text-[13px] font-bold text-[#6b7280] transition-all hover:bg-[#f8fafc]"
                  >
                    Hủy
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-2 rounded-xl border border-[#e8eaf1] px-5 py-2.5 text-[13px] font-bold text-[#374151] transition-all hover:border-[#ff8d28] hover:text-[#ff8d28]"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Chỉnh sửa
                </button>
              )}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3 border-t border-[#f0f2f7] pt-5">
            {stats.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-2xl bg-[#f8f9fc] px-4 py-3"
              >
                <div
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${item.bg} ${item.color} text-lg font-black`}
                >
                  {item.value}
                </div>

                <p className="text-[12px] font-semibold text-[#6b7280]">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex w-fit gap-1 rounded-2xl border border-[#e8eaf1] bg-white p-1.5 shadow-sm">
          {(["Thông tin", "Đổi mật khẩu", "Thông báo"] as Tab[]).map((item) => (
            <button
              key={item}
              onClick={() => setTab(item)}
              className={`rounded-xl px-5 py-2.5 text-[13px] font-bold transition-all ${
                tab === item
                  ? "bg-[#ff8d28] text-white shadow-[0_6px_16px_rgba(255,141,40,0.3)]"
                  : "text-[#6b7280] hover:text-[#ff8d28]"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {tab === "Thông tin" ? (
          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
            <div className="rounded-[24px] border border-[#e8eaf1] bg-white p-6 shadow-sm sm:p-7">
              <h2 className="flex items-center gap-2 text-[15px] font-black text-[#0e111d]">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-orange-50 text-[#ff8d28]">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </span>
                Thông tin cá nhân
              </h2>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <InfoField
                  label="Họ và tên"
                  value={fullName}
                  editing={editMode}
                  onChange={setFullName}
                  placeholder="Nguyễn Thị Mai"
                  icon={
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  }
                />

                <InfoField
                  label="Email"
                  value={displayEmail}
                  editing={false}
                  onChange={() => {}}
                  placeholder=""
                  note="Không thể thay đổi"
                  icon={
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  }
                />

                <InfoField
                  label="Số điện thoại"
                  value={phone}
                  editing={editMode}
                  onChange={setPhone}
                  placeholder="0901 234 567"
                  icon={
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  }
                />

                <InfoField
                  label="Ngày sinh"
                  value={birthday}
                  editing={editMode}
                  onChange={setBirthday}
                  placeholder=""
                  type="date"
                  icon={
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  }
                />
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-[#9ca3af]">
                    Giới tính
                  </label>

                  {editMode ? (
                    <select
                      value={gender}
                      onChange={(event) => setGender(event.target.value)}
                      className="h-11 w-full rounded-xl border border-[#e0e3ec] bg-[#fafbfc] px-3.5 text-[13px] font-semibold text-[#0e111d] outline-none transition-all focus:border-[#ff8d28] focus:bg-white"
                    >
                      <option>Nam</option>
                      <option>Nữ</option>
                      <option>Khác</option>
                    </select>
                  ) : (
                    <div className="flex h-11 items-center gap-2.5 rounded-xl border border-[#eef0f5] bg-[#fafbfc] px-3.5">
                      <svg
                        className="h-4 w-4 shrink-0 text-[#ff8d28]"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <circle cx="12" cy="8" r="4" />
                        <path
                          strokeLinecap="round"
                          d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
                        />
                      </svg>

                      <span className="text-[13px] font-semibold text-[#0e111d]">
                        {gender}
                      </span>
                    </div>
                  )}
                </div>

                <InfoField
                  label="Thành phố"
                  value={address}
                  editing={editMode}
                  onChange={setAddress}
                  placeholder="TP. Hồ Chí Minh"
                  icon={
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  }
                />
              </div>

              <div className="mt-4">
                <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-[#9ca3af]">
                  Giới thiệu bản thân
                </label>

                {editMode ? (
                  <textarea
                    value={bio}
                    onChange={(event) => setBio(event.target.value)}
                    rows={3}
                    className="w-full resize-none rounded-xl border border-[#e0e3ec] bg-[#fafbfc] px-3.5 py-3 text-[13px] font-semibold text-[#0e111d] outline-none transition-all focus:border-[#ff8d28] focus:bg-white"
                    placeholder="Vài dòng về bạn..."
                  />
                ) : (
                  <p className="min-h-[66px] rounded-xl border border-[#eef0f5] bg-[#fafbfc] px-3.5 py-3 text-[13px] font-semibold leading-6 text-[#475569]">
                    {bio || (
                      <span className="text-[#9ca3af]">
                        Chưa có giới thiệu.
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#0e111d] to-[#1e2a45] p-6 text-white shadow-lg">
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#ff8d28]/20 blur-2xl" />

                <div className="relative">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#ff8d28]">
                    {isPhotographer ? "Tài khoản đối tác" : "Gói thành viên"}
                  </p>

                  <p className="mt-1 text-[20px] font-black tracking-tight">
                    {isPhotographer
                      ? "Photographer Partner"
                      : "Khách hàng Thường"}
                  </p>

                  <p className="mt-1.5 text-[12px] leading-5 text-white/60">
                    {isPhotographer
                      ? "Quản lý hồ sơ, lịch đặt, tin nhắn và doanh thu từ các buổi chụp."
                      : "Tích lũy thêm booking để lên hạng Bạc và nhận ưu đãi."}
                  </p>

                  <div className="mt-4">
                    <div className="mb-1 flex justify-between text-[11px] font-bold text-white/50">
                      <span>
                        {isPhotographer
                          ? "Độ hoàn thiện hồ sơ"
                          : "Tiến độ lên hạng Bạc"}
                      </span>
                      <span>{isPhotographer ? "80%" : "9 / 15"}</span>
                    </div>

                    <div className="h-2 w-full rounded-full bg-white/10">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-[#ff8d28] to-[#f97316]"
                        style={{ width: isPhotographer ? "80%" : "60%" }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {(isPhotographer
                      ? ["Nhận booking", "Chat khách", "Đối soát doanh thu"]
                      : ["Giảm 5% dịch vụ", "Ưu tiên booking", "Hỗ trợ 24/7"]
                    ).map((badge) => (
                      <span
                        key={badge}
                        className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-white/80"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-[#e8eaf1] bg-white p-5 shadow-sm">
                <h2 className="flex items-center gap-2 text-[14px] font-black text-[#0e111d]">
                  <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-orange-50 text-[#ff8d28]">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </span>
                  Truy cập nhanh
                </h2>

                <div className="mt-4 grid gap-2">
                  {quickActions.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="group flex items-center gap-3 rounded-2xl border border-[#f0f2f7] bg-[#fafbfc] px-4 py-3 transition-all hover:border-[#ffd4a8] hover:bg-[#fff8f1] hover:shadow-[0_4px_16px_rgba(255,141,40,0.08)]"
                    >
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-[#ff8d28] shadow-sm transition-all group-hover:bg-[#ff8d28] group-hover:text-white">
                        <svg
                          className="h-[18px] w-[18px]"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.9"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d={item.icon}
                          />
                        </svg>
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-bold leading-none text-[#0e111d]">
                          {item.label}
                        </p>
                        <p className="mt-0.5 text-[11px] text-[#9ca3af]">
                          {item.sub}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${item.noteCls}`}
                      >
                        {item.note}
                      </span>

                      <svg
                        className="h-4 w-4 shrink-0 text-[#d1d5db] transition-transform group-hover:translate-x-0.5 group-hover:text-[#ff8d28]"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {tab === "Đổi mật khẩu" ? (
          <div className="mt-5 max-w-[500px]">
            <div className="rounded-[24px] border border-[#e8eaf1] bg-white p-6 shadow-sm sm:p-7">
              <h2 className="flex items-center gap-2 text-[15px] font-black text-[#0e111d]">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-orange-50 text-[#ff8d28]">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path strokeLinecap="round" d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                </span>
                Đổi mật khẩu
              </h2>

              <p className="mt-2 text-[13px] text-[#6b7280]">
                Mật khẩu mới cần ít nhất 8 ký tự, gồm chữ hoa, số và ký tự đặc
                biệt.
              </p>

              <div className="mt-5 grid gap-4">
                <PwField
                  label="Mật khẩu hiện tại"
                  value={oldPw}
                  onChange={setOldPw}
                />

                <PwField
                  label="Mật khẩu mới"
                  value={newPw}
                  onChange={setNewPw}
                />

                <PwField
                  label="Xác nhận mật khẩu"
                  value={cfPw}
                  onChange={setCfPw}
                />

                {newPw && cfPw && newPw !== cfPw ? (
                  <p className="text-[12px] font-bold text-red-500">
                    Mật khẩu xác nhận chưa khớp.
                  </p>
                ) : null}
              </div>

              <button
                onClick={handleSavePw}
                className="mt-6 w-full rounded-xl bg-[#ff8d28] py-3 text-[13px] font-black text-white shadow-[0_8px_20px_rgba(255,141,40,0.25)] transition-all hover:bg-[#e0751b]"
              >
                Cập nhật mật khẩu
              </button>
            </div>
          </div>
        ) : null}

        {tab === "Thông báo" ? (
          <div className="mt-5 max-w-[540px]">
            <div className="rounded-[24px] border border-[#e8eaf1] bg-white p-6 shadow-sm sm:p-7">
              <h2 className="flex items-center gap-2 text-[15px] font-black text-[#0e111d]">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-orange-50 text-[#ff8d28]">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                </span>
                Tùy chọn thông báo
              </h2>

              <p className="mt-2 text-[13px] text-[#6b7280]">
                Chọn loại thông báo bạn muốn nhận.
              </p>

              <div className="mt-5 divide-y divide-[#f0f2f7]">
                {[
                  {
                    label: "Thông báo booking",
                    sub: isPhotographer
                      ? "Khách đặt lịch, hủy lịch, thanh toán"
                      : "Xác nhận, hủy, nhắc lịch chụp",
                    value: notifBooking,
                    set: setNotifBooking,
                  },
                  {
                    label: "Khuyến mãi & ưu đãi",
                    sub: "Voucher, flash sale, sự kiện",
                    value: notifPromo,
                    set: setNotifPromo,
                  },
                  {
                    label: "Nhận qua email",
                    sub: displayEmail,
                    value: notifEmail,
                    set: setNotifEmail,
                  },
                  {
                    label: "Nhận qua SMS",
                    sub: phone || "Chưa có số điện thoại",
                    value: notifSms,
                    set: setNotifSms,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between gap-4 py-4"
                  >
                    <div>
                      <p className="text-[14px] font-bold text-[#0e111d]">
                        {item.label}
                      </p>
                      <p className="text-[12px] text-[#9ca3af]">{item.sub}</p>
                    </div>

                    <Toggle value={item.value} onChange={item.set} />
                  </div>
                ))}
              </div>

              <button
                onClick={() => notify("Đã lưu tùy chọn thông báo.")}
                className="mt-5 w-full rounded-xl bg-[#ff8d28] py-3 text-[13px] font-black text-white shadow-[0_8px_20px_rgba(255,141,40,0.25)] transition-all hover:bg-[#e0751b]"
              >
                Lưu tùy chọn
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}

function InfoField({
  label,
  value,
  editing,
  onChange,
  placeholder,
  icon,
  note,
  type = "text",
}: {
  label: string;
  value: string;
  editing: boolean;
  onChange: (value: string) => void;
  placeholder: string;
  icon: ReactNode;
  note?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-[#9ca3af]">
        {label}
      </label>

      {editing && !note ? (
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="h-11 w-full rounded-xl border border-[#e0e3ec] bg-[#fafbfc] px-3.5 text-[13px] font-semibold text-[#0e111d] outline-none transition-all focus:border-[#ff8d28] focus:bg-white"
        />
      ) : (
        <div className="flex h-11 items-center gap-2.5 rounded-xl border border-[#eef0f5] bg-[#fafbfc] px-3.5">
          <span className="shrink-0 text-[#ff8d28]">{icon}</span>

          <span className="flex-1 truncate text-[13px] font-semibold text-[#0e111d]">
            {value || <span className="text-[#9ca3af]">Chưa cập nhật</span>}
          </span>

          {note ? (
            <span className="text-[11px] text-[#9ca3af]">{note}</span>
          ) : null}
        </div>
      )}
    </div>
  );
}

function PwField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [show, setShow] = useState(false);

  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-[#9ca3af]">
        {label}
      </label>

      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="••••••••"
          className="h-11 w-full rounded-xl border border-[#e0e3ec] bg-[#fafbfc] px-3.5 pr-10 text-[13px] font-semibold text-[#0e111d] outline-none transition-all focus:border-[#ff8d28] focus:bg-white"
        />

        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] transition-colors hover:text-[#ff8d28]"
        >
          {show ? (
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
              />
            </svg>
          ) : (
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

function Toggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      aria-pressed={value}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ${
        value ? "bg-[#ff8d28]" : "bg-[#e0e3ec]"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
          value ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}