"use client";

import { useRef, useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/app/auth-context";

type Tab = "Thông tin" | "Đổi mật khẩu" | "Thông báo" | "Đăng ký thợ ảnh";

type ServiceCategory = {
  id: number;
  name: string;
  slug: string;
};

type PhotographerApplication = {
  verification_status?: "pending" | "verified" | "rejected" | string;
  active_area?: string;
  bio?: string;
  photographer_type?: string;
  min_price?: number;
  started_year?: number;
  documents?: string[];
};

type CustomerProfile = {
  fullName?: string | null;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  birthday?: string | null;
  gender?: "male" | "female" | "other" | string | null;
  city?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
};

type ServicePackageForm = {
  id: string;
  categoryId: string;
  name: string;
  price: string;
  description: string;
  duration: string;
  workerCount: string;
  maxCustomerCount: string;
  addOns: string[];
  addOnDraft: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://sudion-backend-production-453b.up.railway.app/api";
const ASSET_URL = API_URL.replace(/\/api\/?$/, "");

function authHeaders() {
  const token = typeof window !== "undefined" ? window.localStorage.getItem("sudion_token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function resolveAssetUrl(url: string) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url) || url.startsWith("data:")) return url;
  return `${ASSET_URL}${url.startsWith("/") ? url : `/${url}`}`;
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#eef2ff] p-8 text-center text-slate-500 font-bold">Đang tải hồ sơ...</div>}>
      <ProfileContent />
    </Suspense>
  );
}

function ProfileContent() {
  const searchParams = useSearchParams();
  const { session, refresh } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const loadedPhotoProfileForRef = useRef("");
  const loadingPhotoProfileForRef = useRef("");

  const [avatar, setAvatar]     = useState<string | null>(session?.avatar_url ?? null);
  const [fullName, setFullName] = useState(session?.fullName ?? "Người dùng");
  const [phone, setPhone]       = useState("");
  const [birthday, setBirthday] = useState("");
  const [gender, setGender]     = useState("");
  const [address, setAddress]   = useState("");
  const [bio, setBio]           = useState("");
  const [editMode, setEditMode] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [cfPw,  setCfPw]  = useState("");

  const [notifBooking, setNotifBooking] = useState(true);
  const [notifPromo,   setNotifPromo]   = useState(true);
  const [notifEmail,   setNotifEmail]   = useState(true);
  const [notifSms,     setNotifSms]     = useState(false);

  const [tab, setTab]     = useState<Tab>("Thông tin");
  const [toast, setToast] = useState("");

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "photographer" || tabParam === "Thông tin") {
      setTab("Thông tin");
    }
  }, [searchParams]);

  const [photoProfile, setPhotoProfile] = useState<PhotographerApplication | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);

  // Form states for photographer registration
  const [regActiveArea, setRegActiveArea] = useState("TP. Hồ Chí Minh");
  const [regBio, setRegBio] = useState("");
  const [regType, setRegType] = useState("freelance");
  const [regMinPrice, setRegMinPrice] = useState("1500000");
  const [regStartedYear, setRegStartedYear] = useState(new Date().getFullYear().toString());
  const [regCategories, setRegCategories] = useState<string[]>([]);
  const [regPackages, setRegPackages] = useState<ServicePackageForm[]>([]);
  const [regDocuments, setRegDocuments] = useState<string[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [submittingReg, setSubmittingReg] = useState(false);

  const isPhotographerAccount = session?.role === "photographer";
  const accountRoleLabel =
    session?.role === "admin"
      ? "Quản trị viên"
      : isPhotographerAccount
        ? "Photographer"
        : "Khách hàng";

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (session?.fullName) {
      setFullName(session.fullName);
    }
    if (session?.avatar_url) {
      setAvatar(session.avatar_url);
    }
  }, [session?.fullName, session?.avatar_url]);

  useEffect(() => {
    if (!session?.userId || !window.localStorage.getItem("sudion_token")) return;

    const controller = new AbortController();

    async function loadCustomerProfile() {
      try {
        const response = await fetch(`${API_URL}/auth/me/profile`, {
          headers: authHeaders(),
          cache: "no-store",
          signal: controller.signal,
        });
        const json = await response.json();

        if (!response.ok || !json.success) {
          throw new Error(json.message || "Không thể tải thông tin hồ sơ.");
        }

        const profile = (json.data?.profile || json.data?.user || json.data) as CustomerProfile;
        setFullName(profile.fullName ?? profile.full_name ?? session.fullName ?? "Người dùng");
        setPhone(profile.phone ?? "");
        setBirthday(profile.birthday ? String(profile.birthday).slice(0, 10) : "");
        setGender(profile.gender ?? "");
        setAddress(profile.city ?? "");
        setBio(profile.bio ?? "");
        if (profile.avatar_url) setAvatar(profile.avatar_url);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          notify(error instanceof Error ? error.message : "Không thể tải thông tin hồ sơ.");
        }
      }
    }

    void loadCustomerProfile();

    return () => controller.abort();
  }, [session?.userId]);

  useEffect(() => {
    if (!session?.userId) return;

    const userKey = String(session.userId);

    if (
      loadedPhotoProfileForRef.current === userKey ||
      loadingPhotoProfileForRef.current === userKey
    ) {
      return;
    }

    loadingPhotoProfileForRef.current = userKey;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 8000);
    
    async function loadPhotoProfile() {
      try {
        const response = await fetch(`${API_URL}/auth/photographer-application`, {
          headers: authHeaders(),
          cache: "no-store",
          signal: controller.signal,
        });
        const json = await response.json();
        if (json.success && json.data) {
          setPhotoProfile(json.data);
          setRegActiveArea(json.data.active_area || "TP. Hồ Chí Minh");
          setRegBio(json.data.bio || "");
          setRegType(json.data.photographer_type || "freelance");
          setRegMinPrice(String(json.data.min_price || 1500000));
          setRegStartedYear(String(json.data.started_year || new Date().getFullYear()));
          setRegDocuments(
            Array.isArray(json.data.documents)
              ? json.data.documents.map((url: string) => resolveAssetUrl(url))
              : []
          );
        }
        loadedPhotoProfileForRef.current = userKey;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }

        loadedPhotoProfileForRef.current = "";
        console.error("Error loading photo profile:", err);
      } finally {
        if (loadingPhotoProfileForRef.current === userKey) {
          loadingPhotoProfileForRef.current = "";
        }
        window.clearTimeout(timeoutId);
        setLoadingProfile(false);
      }
    }
    
    loadPhotoProfile();

    return () => {
      if (loadingPhotoProfileForRef.current === userKey) {
        loadingPhotoProfileForRef.current = "";
      }
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [session?.userId]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetch(`${API_URL}/services`, { cache: "no-store" });
        const json = await response.json();
        if (json.success && Array.isArray(json.data)) {
          setCategories(json.data);
        }
      } catch (err) {
        console.error("Error loading service categories:", err);
      }
    }

    loadCategories();
  }, []);

  function notify(msg: string) { setToast(msg); setTimeout(() => setToast(""), 2200); }

  const initials = fullName.split(" ").filter(Boolean)
    .map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  function createPackageForm(categoryId: string): ServicePackageForm {
    const category = categories.find((item) => String(item.id) === categoryId);
    const categoryName = category?.name || "Dịch vụ";

    return {
      id: `pkg-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      categoryId,
      name: `Gói cơ bản - ${categoryName}`,
      price: regMinPrice || "1500000",
      description: "",
      duration: "120",
      workerCount: "1",
      maxCustomerCount: "1",
      addOns: [],
      addOnDraft: "",
    };
  }

  function toggleRegistrationCategory(category: ServiceCategory) {
    const categoryId = String(category.id);
    const selectedCategory = regCategories.includes(categoryId);

    if (selectedCategory) {
      setRegCategories((prev) => prev.filter((id) => id !== categoryId));
      setRegPackages((prev) => prev.filter((item) => item.categoryId !== categoryId));
      return;
    }

    setRegCategories((prev) => [...prev, categoryId]);
    setRegPackages((prev) =>
      prev.some((item) => item.categoryId === categoryId)
        ? prev
        : [...prev, createPackageForm(categoryId)]
    );
  }

  function addRegistrationPackage() {
    if (!regCategories.length) {
      notify("Vui lòng chọn danh mục trước khi tạo gói dịch vụ.");
      return;
    }

    setRegPackages((prev) => [...prev, createPackageForm(regCategories[0])]);
  }

  function updateRegistrationPackage(
    packageId: string,
    updates: Partial<ServicePackageForm>
  ) {
    setRegPackages((prev) =>
      prev.map((item) => (item.id === packageId ? { ...item, ...updates } : item))
    );
  }

  function addPackageAddOn(packageId: string) {
    setRegPackages((prev) =>
      prev.map((item) => {
        if (item.id !== packageId) return item;

        const addOn = item.addOnDraft.trim();
        if (!addOn || item.addOns.includes(addOn)) {
          return { ...item, addOnDraft: "" };
        }

        return {
          ...item,
          addOns: [...item.addOns, addOn],
          addOnDraft: "",
        };
      })
    );
  }

  function removePackageAddOn(packageId: string, addOnIndex: number) {
    setRegPackages((prev) =>
      prev.map((item) =>
        item.id === packageId
          ? {
              ...item,
              addOns: item.addOns.filter((_, index) => index !== addOnIndex),
            }
          : item
      )
    );
  }

  function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAvatar(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleSavePw() {
    if (!oldPw || !newPw || !cfPw) { notify("Vui lòng điền đầy đủ."); return; }
    if (newPw !== cfPw) { notify("Mật khẩu xác nhận chưa khớp."); return; }
    setOldPw(""); setNewPw(""); setCfPw("");
    notify("Đã cập nhật mật khẩu thành công.");
  }

  async function handleSaveProfile() {
    try {
      setSavingProfile(true);
      const response = await fetch(`${API_URL}/auth/me/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: phone.trim() || null,
          birthday: birthday || null,
          gender: gender || null,
          city: address.trim() || null,
          bio: bio.trim() || null,
        }),
      });
      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || "Không thể cập nhật hồ sơ.");
      }

      const profile = (json.data?.profile || json.data?.user || json.data) as CustomerProfile | undefined;
      if (profile) {
        setFullName(profile.fullName ?? profile.full_name ?? fullName);
        setPhone(profile.phone ?? "");
        setBirthday(profile.birthday ? String(profile.birthday).slice(0, 10) : "");
        setGender(profile.gender ?? "");
        setAddress(profile.city ?? "");
        setBio(profile.bio ?? "");
      }
      setEditMode(false);
      notify("Đã cập nhật thông tin hồ sơ.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Không thể cập nhật hồ sơ.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleDocumentUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingDoc(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_URL}/uploads`, {
        method: "POST",
        headers: authHeaders(),
        body: formData,
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || "Không thể tải tài liệu.");
      }

      setRegDocuments((prev) => [...prev, resolveAssetUrl(json.data.url)]);
      notify("Đã tải tài liệu lên.");
      event.target.value = "";
    } catch (error) {
      notify(error instanceof Error ? error.message : "Không thể tải tài liệu.");
    } finally {
      setUploadingDoc(false);
    }
  }

  async function handleSubmitPhotographerApplication() {
    if (!session) {
      notify("Vui lòng đăng nhập để gửi hồ sơ.");
      return;
    }

    if (!regBio.trim()) {
      notify("Vui lòng nhập phần giới thiệu kinh nghiệm.");
      return;
    }

    if (!regCategories.length) {
      notify("Vui lòng chọn ít nhất một danh mục dịch vụ.");
      return;
    }

    const validPackages = regPackages
      .map((item) => ({
        categoryId: Number(item.categoryId),
        name: item.name.trim(),
        price: Number(item.price),
        description: item.description.trim(),
        duration: Number(item.duration || 120),
        workerCount: Number(item.workerCount || 1),
        maxCustomerCount: Number(item.maxCustomerCount || 1),
        addOns: item.addOns.map((addOn) => addOn.trim()).filter(Boolean),
      }))
      .filter(
        (item) =>
          Number.isFinite(item.categoryId) &&
          item.categoryId > 0 &&
          item.name &&
          Number.isFinite(item.price) &&
          item.price > 0
      );

    if (!validPackages.length) {
      notify("Vui lòng tạo ít nhất một gói dịch vụ có danh mục, tên và giá.");
      return;
    }

    if (!regDocuments.length) {
      notify("Vui lòng tải lên giấy tờ cá nhân hoặc portfolio.");
      return;
    }

    try {
      setSubmittingReg(true);

      const response = await fetch(`${API_URL}/auth/become-photographer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({
          activeArea: regActiveArea,
          bio: regBio,
          photographerType: regType,
          minPrice: Number(regMinPrice || 1500000),
          startedYear: Number(regStartedYear || new Date().getFullYear()),
          categoryIds: regCategories.map(Number),
          packages: validPackages,
          documents: regDocuments,
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || "Không thể gửi hồ sơ.");
      }

      notify("Đã gửi hồ sơ. Vui lòng chờ admin duyệt.");
      setPhotoProfile({
        verification_status: "pending",
        active_area: regActiveArea,
        bio: regBio,
        photographer_type: regType,
        min_price: Number(regMinPrice || 1500000),
        started_year: Number(regStartedYear || new Date().getFullYear()),
        documents: regDocuments,
      });
    } catch (error) {
      notify(error instanceof Error ? error.message : "Không thể gửi hồ sơ.");
    } finally {
      setSubmittingReg(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#eef2ff]">

      {/* Toast */}
      {toast && (
        <div className="fixed right-6 top-6 z-50 flex items-center gap-2.5 rounded-2xl bg-[#0e111d] px-5 py-3.5 text-[13px] font-bold text-white shadow-2xl">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#ff8d28] text-[10px]">✓</span>
          {toast}
        </div>
      )}

      {/* Hero banner */}
      <div className="relative h-52 w-full overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#111827]">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#fb923c]/20 blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 h-64 w-64 rounded-full bg-[#fb923c]/10 blur-3xl" />
        <div className="absolute left-6 top-6 flex items-center gap-2 text-sm font-semibold text-white/60 sm:left-10">
          <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
          <span>/</span>
          <span className="text-white/80">Hồ sơ</span>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1100px] px-5 pb-16 sm:px-8">

        {/* Profile header card */}
        <div className="relative -mt-16 rounded-[28px] border border-[#e8eaf1] bg-white px-6 pt-6 pb-5 shadow-[0_24px_80px_rgba(15,23,42,0.09)] sm:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end">

            {/* Avatar */}
            <div className="relative -mt-14 shrink-0 sm:-mt-16">
              <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-gradient-to-br from-[#ff8d28] to-[#f97316] shadow-xl sm:h-28 sm:w-28">
                {avatar ? (
                  <img src={avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-white/10" />
                )}
              </div>
              <button onClick={() => fileRef.current?.click()}
                className="absolute bottom-0.5 right-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#ff8d28] shadow-md hover:bg-[#e0751b] transition-colors"
                aria-label="Đổi ảnh đại diện">
                <svg className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <circle cx="12" cy="13" r="3" />
                </svg>
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
            </div>

            {/* Name & bio */}
            <div className="min-w-0 flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[22px] font-black tracking-[-0.02em] text-[#0e111d]">{fullName}</h1>
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                  isPhotographerAccount
                    ? "bg-emerald-100 text-emerald-700"
                    : session?.role === "admin"
                      ? "bg-slate-100 text-slate-700"
                      : "bg-orange-100 text-orange-600"
                }`}>{accountRoleLabel}</span>
              </div>
              <p className="mt-0.5 text-[13px] text-[#6b7280]">{session?.email ?? "user@email.com"}</p>
              {bio && <p className="mt-2 max-w-[560px] text-[13px] leading-5 text-[#475569]">{bio}</p>}
            </div>

            {/* Edit toggle */}
            <div className="shrink-0 pb-1">
              {editMode ? (
                <div className="flex gap-2">
                  <button onClick={handleSaveProfile} disabled={savingProfile}
                    className="rounded-xl bg-[#ff8d28] px-5 py-2.5 text-[13px] font-black text-white shadow-[0_8px_20px_rgba(255,141,40,0.25)] hover:bg-[#e0751b] transition-all">
                    {savingProfile ? "Đang lưu..." : "Lưu"}
                  </button>
                  <button onClick={() => setEditMode(false)}
                    className="rounded-xl border border-[#e8eaf1] px-5 py-2.5 text-[13px] font-bold text-[#6b7280] hover:bg-[#f8fafc] transition-all">
                    Hủy
                  </button>
                </div>
              ) : (
                <button onClick={() => setEditMode(true)}
                  className="flex items-center gap-2 rounded-xl border border-[#e8eaf1] px-5 py-2.5 text-[13px] font-bold text-[#374151] hover:border-[#ff8d28] hover:text-[#ff8d28] transition-all">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Chỉnh sửa
                </button>
              )}
            </div>
          </div>

          {/* Stats — chỉ hiện khi có dữ liệu thật, không phải mock */}
        </div>

        {/* Tabs */}
        <div className="mt-5 flex gap-1 bg-white px-1 py-1 rounded-2xl w-fit shadow-sm border border-[#e8eaf1]">
          {(["Thông tin", "Đổi mật khẩu", "Thông báo", "Đăng ký thợ ảnh"] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`rounded-xl px-4 py-2 text-[13px] font-bold transition-all ${
                tab === t
                  ? "bg-[#ff8d28] text-white"
                  : "text-[#6b7280] hover:text-[#0e111d]"
              }`}>
              {t}
            </button>
          ))}
        </div>

        {/* ── Tab: Thông tin ── */}
        {tab === "Thông tin" && (
          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">

            {/* Left: personal info */}
            <div className="rounded-[24px] border border-[#e8eaf1] bg-white p-6 shadow-sm sm:p-7">
              <h2 className="flex items-center gap-2 text-[15px] font-black text-[#0e111d]">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-orange-50 text-[#ff8d28]">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </span>
                Thông tin cá nhân
              </h2>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <InfoField label="Họ và tên" value={fullName} editing={editMode} onChange={setFullName} placeholder="Nguyễn Thị Mai"
                  icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>} />
                <InfoField label="Email" value={session?.email ?? ""} editing={false} onChange={() => {}} placeholder="" note="Không thể thay đổi"
                  icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>} />
                <InfoField label="Số điện thoại" value={phone} editing={editMode} onChange={setPhone} placeholder="0901 234 567"
                  icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>} />
                <InfoField label="Ngày sinh" value={birthday} editing={editMode} onChange={setBirthday} placeholder="" type="date"
                  icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-[#9ca3af]">Giới tính</label>
                  {editMode ? (
                    <select value={gender} onChange={(e) => setGender(e.target.value)}
                      className="h-11 w-full rounded-xl border border-[#e0e3ec] bg-[#fafbfc] px-3.5 text-[13px] font-semibold text-[#0e111d] outline-none focus:border-[#ff8d28] focus:bg-white transition-all">
                      <option value="">Chưa cập nhật</option><option value="male">Nam</option><option value="female">Nữ</option><option value="other">Khác</option>
                    </select>
                  ) : (
                    <div className="flex h-11 items-center gap-2.5 rounded-xl border border-[#eef0f5] bg-[#fafbfc] px-3.5">
                      <svg className="h-4 w-4 shrink-0 text-[#ff8d28]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path strokeLinecap="round" d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>
                      <span className="text-[13px] font-semibold text-[#0e111d]">{gender ? ({ male: "Nam", female: "Nữ", other: "Khác" }[gender] || gender) : "Chưa cập nhật"}</span>
                    </div>
                  )}
                </div>
                <InfoField label="Thành phố" value={address} editing={editMode} onChange={setAddress} placeholder="TP. Hồ Chí Minh"
                  icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
              </div>

              <div className="mt-4">
                <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-[#9ca3af]">Giới thiệu bản thân</label>
                {editMode ? (
                  <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
                    className="w-full resize-none rounded-xl border border-[#e0e3ec] bg-[#fafbfc] px-3.5 py-3 text-[13px] font-semibold text-[#0e111d] outline-none focus:border-[#ff8d28] focus:bg-white transition-all"
                    placeholder="Vài dòng về bạn..." />
                ) : (
                  <p className="min-h-[66px] rounded-xl border border-[#eef0f5] bg-[#fafbfc] px-3.5 py-3 text-[13px] font-semibold leading-6 text-[#475569]">
                    {bio || <span className="text-[#9ca3af]">Chưa có giới thiệu.</span>}
                  </p>
                )}
              </div>
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-5">

              {/* Membership card */}
              <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#0e111d] to-[#1e2a45] p-6 text-white shadow-lg">
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#ff8d28]/20 blur-2xl" />
                <div className="relative">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#ff8d28]">Gói thành viên</p>
                  <p className="mt-1 text-[20px] font-black tracking-tight">
                    {isPhotographerAccount ? "Tài khoản Photographer" : "Khách hàng Thường"}
                  </p>
                  <p className="mt-1.5 text-[12px] leading-5 text-white/60">Tích lũy thêm booking để lên hạng Bạc và nhận ưu đãi.</p>
                  <div className="mt-4">
                    <div className="mb-1 flex justify-between text-[11px] font-bold text-white/50">
                      <span>Tiến độ lên hạng Bạc</span><span>9 / 15</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/10">
                      <div className="h-2 rounded-full bg-gradient-to-r from-[#ff8d28] to-[#f97316]" style={{ width: "60%" }} />
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {["Giảm 5% dịch vụ", "Ưu tiên booking", "Hỗ trợ 24/7"].map((b) => (
                      <span key={b} className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-white/80">{b}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick actions */}
              <div className="rounded-[24px] border border-[#e8eaf1] bg-white p-5 shadow-sm">
                <h2 className="flex items-center gap-2 text-[14px] font-black text-[#0e111d]">
                  <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-orange-50 text-[#ff8d28]">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </span>
                  Truy cập nhanh
                </h2>
                <div className="mt-4 grid gap-2">
                  {[
                    {
                      label: "Lịch đặt của tôi",
                      sub: "Xem & quản lý lịch chụp",
                      href: "/bookings",
                      note: "12 booking",
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
                      note: "3 chưa đọc",
                      noteCls: "bg-emerald-50 text-emerald-600",
                      icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
                    },
                    {
                      label: "Thông báo",
                      sub: "Cập nhật & tin tức mới",
                      href: "/notification",
                      note: "5 mới",
                      noteCls: "bg-red-50 text-red-500",
                      icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
                    },
                  ].map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="group flex items-center gap-3 rounded-2xl border border-[#f0f2f7] bg-[#fafbfc] px-4 py-3 transition-all hover:border-[#ffd4a8] hover:bg-[#fff8f1] hover:shadow-[0_4px_16px_rgba(255,141,40,0.08)]"
                    >
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white shadow-sm text-[#ff8d28] transition-all group-hover:bg-[#ff8d28] group-hover:text-white">
                        <svg className="h-4.5 w-4.5 h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-bold text-[#0e111d] leading-none">{item.label}</p>
                        <p className="mt-0.5 text-[11px] text-[#9ca3af]">{item.sub}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${item.noteCls}`}>
                        {item.note}
                      </span>
                      <svg className="h-4 w-4 shrink-0 text-[#d1d5db] transition-transform group-hover:translate-x-0.5 group-hover:text-[#ff8d28]" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: Đổi mật khẩu ── */}
        {tab === "Đổi mật khẩu" && (
          <div className="mt-5 max-w-[500px]">
            <div className="rounded-[24px] border border-[#e8eaf1] bg-white p-6 shadow-sm sm:p-7">
              <h2 className="flex items-center gap-2 text-[15px] font-black text-[#0e111d]">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-orange-50 text-[#ff8d28]">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path strokeLinecap="round" d="M7 11V7a5 5 0 0110 0v4" /></svg>
                </span>
                Đổi mật khẩu
              </h2>
              <p className="mt-2 text-[13px] text-[#6b7280]">Mật khẩu mới cần ít nhất 8 ký tự, gồm chữ hoa, số và ký tự đặc biệt.</p>
              <div className="mt-5 grid gap-4">
                <PwField label="Mật khẩu hiện tại" value={oldPw} onChange={setOldPw} />
                <PwField label="Mật khẩu mới"      value={newPw} onChange={setNewPw} />
                <PwField label="Xác nhận mật khẩu" value={cfPw}  onChange={setCfPw}  />
                {newPw && cfPw && newPw !== cfPw && (
                  <p className="text-[12px] font-bold text-red-500">Mật khẩu xác nhận chưa khớp.</p>
                )}
              </div>
              <button onClick={handleSavePw}
                className="mt-6 w-full rounded-xl bg-[#ff8d28] py-3 text-[13px] font-black text-white shadow-[0_8px_20px_rgba(255,141,40,0.25)] hover:bg-[#e0751b] transition-all">
                Cập nhật mật khẩu
              </button>
            </div>
          </div>
        )}

        {/* ── Tab: Thông báo ── */}
        {tab === "Thông báo" && (
          <div className="mt-5 max-w-[540px]">
            <div className="rounded-[24px] border border-[#e8eaf1] bg-white p-6 shadow-sm sm:p-7">
              <h2 className="flex items-center gap-2 text-[15px] font-black text-[#0e111d]">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-orange-50 text-[#ff8d28]">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                </span>
                Tùy chọn thông báo
              </h2>
              <p className="mt-2 text-[13px] text-[#6b7280]">Chọn loại thông báo bạn muốn nhận.</p>
              <div className="mt-5 divide-y divide-[#f0f2f7]">
                {[
                  { label: "Thông báo booking",   sub: "Xác nhận, hủy, nhắc lịch chụp",     value: notifBooking, set: setNotifBooking },
                  { label: "Khuyến mãi & ưu đãi", sub: "Voucher, flash sale, sự kiện",       value: notifPromo,   set: setNotifPromo },
                  { label: "Nhận qua email",       sub: session?.email ?? "user@email.com",   value: notifEmail,   set: setNotifEmail },
                  { label: "Nhận qua SMS",         sub: phone || "Chưa có số điện thoại",     value: notifSms,     set: setNotifSms },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-4 py-4">
                    <div>
                      <p className="text-[14px] font-bold text-[#0e111d]">{item.label}</p>
                      <p className="text-[12px] text-[#9ca3af]">{item.sub}</p>
                    </div>
                    <Toggle value={item.value} onChange={item.set} />
                  </div>
                ))}
              </div>
              <button onClick={() => notify("Đã lưu tùy chọn thông báo.")}
                className="mt-5 w-full rounded-xl bg-[#ff8d28] py-3 text-[13px] font-black text-white shadow-[0_8px_20px_rgba(255,141,40,0.25)] hover:bg-[#e0751b] transition-all">
                Lưu tùy chọn
              </button>
            </div>
          </div>
        )}

        {/* ── Tab: Đăng ký thợ ảnh ── */}
        {tab === "Đăng ký thợ ảnh" && (
          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
            <div className="rounded-[24px] border border-[#e8eaf1] bg-white p-6 shadow-sm sm:p-7">
              <div className="flex flex-col gap-3 border-b border-[#f0f2f7] pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="flex items-center gap-2 text-[15px] font-black text-[#0e111d]">
                    <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-orange-50 text-[#ff8d28]">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <circle cx="12" cy="13" r="3" />
                      </svg>
                    </span>
                    Hồ sơ trở thành photographer
                  </h2>
                  <p className="mt-2 text-[13px] leading-6 text-[#6b7280]">
                    Hồ sơ sau khi gửi sẽ ở trạng thái chờ duyệt. Admin xác minh giấy tờ và portfolio trước khi mở dashboard photographer cho bạn.
                  </p>
                </div>
                <ApplicationBadge status={photoProfile?.verification_status} loading={loadingProfile} />
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <RegField label="Khu vực hoạt động" value={regActiveArea} onChange={setRegActiveArea} placeholder="TP. Hồ Chí Minh" />
                <RegField label="Giá khởi điểm" value={regMinPrice} onChange={setRegMinPrice} placeholder="1500000" type="number" />
                <RegField label="Năm bắt đầu" value={regStartedYear} onChange={setRegStartedYear} placeholder="2022" type="number" />
                <div>
                  <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-[#9ca3af]">Hình thức làm việc</label>
                  <select
                    value={regType}
                    onChange={(event) => setRegType(event.target.value)}
                    className="h-11 w-full rounded-xl border border-[#e0e3ec] bg-[#fafbfc] px-3.5 text-[13px] font-semibold text-[#0e111d] outline-none transition-all focus:border-[#ff8d28] focus:bg-white"
                  >
                    <option value="freelance">Freelance</option>
                    <option value="studio">Studio</option>
                    <option value="agency">Agency</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-[#9ca3af]">Kinh nghiệm và phong cách</label>
                <textarea
                  value={regBio}
                  onChange={(event) => setRegBio(event.target.value)}
                  rows={5}
                  className="w-full resize-none rounded-xl border border-[#e0e3ec] bg-[#fafbfc] px-3.5 py-3 text-[13px] font-semibold leading-6 text-[#0e111d] outline-none transition-all focus:border-[#ff8d28] focus:bg-white"
                  placeholder="Mô tả kinh nghiệm chụp ảnh, phong cách, thiết bị, các dự án từng thực hiện..."
                />
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-[11px] font-black uppercase tracking-wider text-[#9ca3af]">Danh mục dịch vụ muốn nhận</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => {
                    const selectedCategory = regCategories.includes(String(category.id));
                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => toggleRegistrationCategory(category)}
                        className={`rounded-full border px-3.5 py-2 text-[12px] font-bold transition ${
                          selectedCategory
                            ? "border-[#ff8d28] bg-[#ff8d28] text-white"
                            : "border-[#e8eaf1] bg-white text-[#536078] hover:border-[#ff8d28] hover:text-[#ff8d28]"
                        }`}
                      >
                        {category.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <label className="block text-[11px] font-black uppercase tracking-wider text-[#9ca3af]">Gói dịch vụ</label>
                  <button
                    type="button"
                    onClick={addRegistrationPackage}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#ffd2ad] bg-[#fff8f1] px-3.5 py-2 text-[12px] font-bold text-[#ff8d28] transition hover:bg-[#fff3e8]"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Thêm gói
                  </button>
                </div>

                <div className="mt-3 grid gap-3">
                  {regPackages.map((servicePackage, index) => (
                    <div key={servicePackage.id} className="rounded-2xl border border-[#e8eaf1] bg-[#fafbfc] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[13px] font-black text-[#0e111d]">Gói {index + 1}</p>
                        <button
                          type="button"
                          onClick={() =>
                            setRegPackages((prev) =>
                              prev.filter((item) => item.id !== servicePackage.id)
                            )
                          }
                          className="grid h-8 w-8 place-items-center rounded-full border border-red-100 bg-white text-[18px] leading-none text-red-500 transition hover:bg-red-50"
                          aria-label="Xóa gói dịch vụ"
                        >
                          ×
                        </button>
                      </div>

                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-[#9ca3af]">Danh mục</label>
                          <select
                            value={servicePackage.categoryId}
                            onChange={(event) =>
                              updateRegistrationPackage(servicePackage.id, {
                                categoryId: event.target.value,
                              })
                            }
                            className="h-11 w-full rounded-xl border border-[#e0e3ec] bg-white px-3.5 text-[13px] font-semibold text-[#0e111d] outline-none transition-all focus:border-[#ff8d28]"
                          >
                            {regCategories.map((categoryId) => {
                              const category = categories.find(
                                (item) => String(item.id) === categoryId
                              );

                              return (
                                <option key={categoryId} value={categoryId}>
                                  {category?.name || "Danh mục dịch vụ"}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                        <RegField
                          label="Tên gói"
                          value={servicePackage.name}
                          onChange={(value) =>
                            updateRegistrationPackage(servicePackage.id, { name: value })
                          }
                          placeholder="Gói chụp cơ bản"
                        />
                        <RegField
                          label="Giá gói"
                          value={servicePackage.price}
                          onChange={(value) =>
                            updateRegistrationPackage(servicePackage.id, { price: value })
                          }
                          placeholder="1500000"
                          type="number"
                        />
                        <RegField
                          label="Thời lượng phút"
                          value={servicePackage.duration}
                          onChange={(value) =>
                            updateRegistrationPackage(servicePackage.id, {
                              duration: value,
                            })
                          }
                          placeholder="120"
                          type="number"
                        />
                        <RegField
                          label="Số thợ"
                          value={servicePackage.workerCount}
                          onChange={(value) =>
                            updateRegistrationPackage(servicePackage.id, {
                              workerCount: value,
                            })
                          }
                          placeholder="1"
                          type="number"
                        />
                        <RegField
                          label="Số khách tối đa"
                          value={servicePackage.maxCustomerCount}
                          onChange={(value) =>
                            updateRegistrationPackage(servicePackage.id, {
                              maxCustomerCount: value,
                            })
                          }
                          placeholder="1"
                          type="number"
                        />
                      </div>

                      <div className="mt-3">
                        <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-[#9ca3af]">Mô tả gói</label>
                        <textarea
                          value={servicePackage.description}
                          onChange={(event) =>
                            updateRegistrationPackage(servicePackage.id, {
                              description: event.target.value,
                            })
                          }
                          rows={3}
                          className="w-full resize-none rounded-xl border border-[#e0e3ec] bg-white px-3.5 py-3 text-[13px] font-semibold leading-6 text-[#0e111d] outline-none transition-all focus:border-[#ff8d28]"
                          placeholder="Ví dụ: chụp 2 giờ, chỉnh màu cơ bản, giao ảnh online..."
                        />
                      </div>

                      <div className="mt-3">
                        <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-[#9ca3af]">Dịch vụ đi kèm</label>
                        <div className="flex gap-2">
                          <input
                            value={servicePackage.addOnDraft}
                            onChange={(event) =>
                              updateRegistrationPackage(servicePackage.id, {
                                addOnDraft: event.target.value,
                              })
                            }
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault();
                                addPackageAddOn(servicePackage.id);
                              }
                            }}
                            placeholder="Trang điểm, flycam, album in..."
                            className="h-11 min-w-0 flex-1 rounded-xl border border-[#e0e3ec] bg-white px-3.5 text-[13px] font-semibold text-[#0e111d] outline-none transition-all focus:border-[#ff8d28]"
                          />
                          <button
                            type="button"
                            onClick={() => addPackageAddOn(servicePackage.id)}
                            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#ff8d28] text-white shadow-[0_8px_20px_rgba(255,141,40,0.2)] transition hover:bg-[#e0751b]"
                            aria-label="Thêm dịch vụ đi kèm"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                        {!!servicePackage.addOns.length && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {servicePackage.addOns.map((addOn, addOnIndex) => (
                              <span
                                key={`${addOn}-${addOnIndex}`}
                                className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[12px] font-bold text-[#536078] ring-1 ring-[#e8eaf1]"
                              >
                                {addOn}
                                <button
                                  type="button"
                                  onClick={() =>
                                    removePackageAddOn(servicePackage.id, addOnIndex)
                                  }
                                  className="text-[#9ca3af] transition hover:text-red-500"
                                  aria-label="Xóa dịch vụ đi kèm"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {!regPackages.length && (
                    <div className="rounded-2xl border border-dashed border-[#dfe3ec] bg-[#fafbfc] px-4 py-8 text-center text-[13px] font-semibold text-[#9ca3af]">
                      Chưa có gói dịch vụ nào.
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between gap-3">
                  <label className="block text-[11px] font-black uppercase tracking-wider text-[#9ca3af]">Giấy tờ và portfolio</label>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#ffd2ad] bg-[#fff8f1] px-3.5 py-2 text-[12px] font-bold text-[#ff8d28] hover:bg-[#fff3e8]">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    {uploadingDoc ? "Đang tải..." : "Tải ảnh"}
                    <input type="file" accept="image/*" className="hidden" disabled={uploadingDoc} onChange={handleDocumentUpload} />
                  </label>
                </div>
                <p className="mt-1 text-[12px] leading-5 text-[#8a93a5]">
                  Tải CCCD/CMND, giấy phép studio nếu có, hoặc ảnh portfolio chứng minh năng lực. Hỗ trợ JPG, PNG, WEBP.
                </p>

                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  {regDocuments.map((doc, index) => (
                    <div key={`${doc}-${index}`} className="group relative overflow-hidden rounded-2xl border border-[#e8eaf1] bg-[#fafbfc]">
                      <img src={resolveAssetUrl(doc)} alt={`Tài liệu ${index + 1}`} className="h-32 w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setRegDocuments((prev) => prev.filter((_, idx) => idx !== index))}
                        className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100"
                        aria-label="Xóa tài liệu"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {!regDocuments.length && (
                    <div className="col-span-full rounded-2xl border border-dashed border-[#dfe3ec] bg-[#fafbfc] px-4 py-8 text-center text-[13px] font-semibold text-[#9ca3af]">
                      Chưa có tài liệu nào được tải lên.
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                disabled={submittingReg || photoProfile?.verification_status === "verified"}
                onClick={handleSubmitPhotographerApplication}
                className="mt-6 w-full rounded-xl bg-[#ff8d28] py-3 text-[13px] font-black text-white shadow-[0_8px_20px_rgba(255,141,40,0.25)] transition-all hover:bg-[#e0751b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submittingReg
                  ? "Đang gửi hồ sơ..."
                  : photoProfile?.verification_status === "pending"
                    ? "Cập nhật hồ sơ chờ duyệt"
                    : photoProfile?.verification_status === "verified"
                      ? "Hồ sơ đã được duyệt"
                      : "Gửi hồ sơ cho admin duyệt"}
              </button>
            </div>

            <div className="rounded-[24px] border border-[#e8eaf1] bg-white p-6 shadow-sm">
              <h3 className="text-[15px] font-black text-[#0e111d] mb-5">Quy trình duyệt</h3>
              <div className="relative space-y-0">
                {[
                  ["1", "Gửi hồ sơ",      "Điền thông tin nghề nghiệp và tải giấy tờ cá nhân.",                    "bg-[#ff8d28] text-white"],
                  ["2", "Admin xác minh", "Admin kiểm tra danh tính, portfolio và thông tin dịch vụ.",               "bg-orange-100 text-[#ff8d28]"],
                  ["3", "Mở dashboard",   "Khi được duyệt, tài khoản chuyển sang photographer.",                     "bg-orange-100 text-[#ff8d28]"],
                ].map(([step, title, desc, badgeCls], i, arr) => (
                  <div key={step} className="relative flex gap-4 pb-5 last:pb-0">
                    {/* Vertical line */}
                    {i < arr.length - 1 && (
                      <div className="absolute left-[15px] top-8 h-full w-px bg-[#f0e8ff]" />
                    )}
                    {/* Step badge */}
                    <span className={`relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full text-[12px] font-black shadow-sm ${badgeCls}`}>
                      {step}
                    </span>
                    {/* Content */}
                    <div className="flex-1 pt-1">
                      <p className="text-[13px] font-black text-[#0e111d] leading-snug">{title}</p>
                      <p className="mt-1 text-[12px] leading-5 text-[#9ca3af]">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              {photoProfile?.verification_status === "rejected" && (
                <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-4 text-[12px] leading-5 text-red-600">
                  Hồ sơ trước đó bị từ chối. Bạn có thể cập nhật thông tin và gửi lại để admin duyệt.
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}

/* ─── Sub-components ────────────────────────────────────── */

function InfoField({ label, value, editing, onChange, placeholder, icon, note, type = "text" }: {
  label: string; value: string; editing: boolean;
  onChange: (v: string) => void; placeholder: string;
  icon: React.ReactNode; note?: string; type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-[#9ca3af]">{label}</label>
      {editing && !note ? (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className="h-11 w-full rounded-xl border border-[#e0e3ec] bg-[#fafbfc] px-3.5 text-[13px] font-semibold text-[#0e111d] outline-none focus:border-[#ff8d28] focus:bg-white transition-all" />
      ) : (
        <div className="flex h-11 items-center gap-2.5 rounded-xl border border-[#eef0f5] bg-[#fafbfc] px-3.5">
          <span className="shrink-0 text-[#ff8d28]">{icon}</span>
          <span className="flex-1 truncate text-[13px] font-semibold text-[#0e111d]">
            {value || <span className="text-[#9ca3af]">Chưa cập nhật</span>}
          </span>
          {note && <span className="text-[11px] text-[#9ca3af]">{note}</span>}
        </div>
      )}
    </div>
  );
}

function PwField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-[#9ca3af]">{label}</label>
      <div className="relative">
        <input type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          className="h-11 w-full rounded-xl border border-[#e0e3ec] bg-[#fafbfc] px-3.5 pr-10 text-[13px] font-semibold text-[#0e111d] outline-none focus:border-[#ff8d28] focus:bg-white transition-all" />
        <button type="button" onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#ff8d28] transition-colors">
          {show
            ? <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
            : <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          }
        </button>
      </div>
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!value)} aria-pressed={value}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ${value ? "bg-[#ff8d28]" : "bg-[#e0e3ec]"}`}>
      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${value ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

function RegField({ label, value, onChange, placeholder, type = "text" }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-[#9ca3af]">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-[#e0e3ec] bg-[#fafbfc] px-3.5 text-[13px] font-semibold text-[#0e111d] outline-none transition-all focus:border-[#ff8d28] focus:bg-white"
      />
    </div>
  );
}

function ApplicationBadge({ status, loading }: { status?: string; loading: boolean }) {
  if (loading) {
    return <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-black text-slate-500">Đang tải</span>;
  }

  if (status === "verified") {
    return <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-black text-emerald-600">Đã duyệt</span>;
  }

  if (status === "pending") {
    return <span className="rounded-full bg-orange-50 px-3 py-1.5 text-[11px] font-black text-orange-600">Chờ admin duyệt</span>;
  }

  if (status === "rejected") {
    return <span className="rounded-full bg-red-50 px-3 py-1.5 text-[11px] font-black text-red-600">Bị từ chối</span>;
  }

  return <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-black text-slate-500">Chưa gửi</span>;
}

function CameraDecor() {
  return (
    <svg width="120" height="100" viewBox="0 0 120 100" fill="none" className="text-white">
      <rect x="10" y="30" width="100" height="65" rx="12" stroke="currentColor" strokeWidth="3" />
      <circle cx="60" cy="60" r="22" stroke="currentColor" strokeWidth="3" />
      <circle cx="60" cy="60" r="12" stroke="currentColor" strokeWidth="2" />
      <path d="M40 30 L50 15 L70 15 L80 30" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="92" cy="43" r="5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
