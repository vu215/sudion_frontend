"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";

type PortfolioItem = {
  id: string;
  url: string;
  title: string;
  category: string;
  isFeatured: boolean;
};

type ServiceItem = {
  id: string;
  tag: string;
  name: string;
  price: string;
  unit: string;
  desc: string;
  delivery: string;
  active: boolean;
};

type PhotographerProfile = {
  name: string;
  title: string;
  location: string;
  image: string;
  bio: string;
  equipment: string[];
  languages: string[];
  portfolio: PortfolioItem[];
  services: ServiceItem[];
};

const STORAGE_KEY = "sudion_photographer_profile_v1";

const defaultProfile: PhotographerProfile = {
  name: "Markus Andersen",
  title: "Nhiếp ảnh gia Thương mại & Kiến trúc",
  location: "TP. Hồ Chí Minh, Việt Nam",
  image:
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
  bio: "Với hơn 10 năm kinh nghiệm trong lĩnh vực nhiếp ảnh thương mại, tôi tập trung vào việc khai thác những khung hình có chiều sâu, tôn vinh ánh sáng tự nhiên và đường nét kiến trúc.",
  equipment: ["Sony A7R IV", "Canon 5D Mark IV", "24-70mm f/2.8 GM"],
  languages: ["Tiếng Việt", "Tiếng Anh"],
  portfolio: [
    {
      id: "p1",
      url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=900&q=80",
      title: "Ảnh thương mại",
      category: "Commercial",
      isFeatured: true,
    },
    {
      id: "p2",
      url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80",
      title: "Ẩm thực",
      category: "Food",
      isFeatured: false,
    },
    {
      id: "p3",
      url: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=900&q=80",
      title: "Lifestyle",
      category: "Lifestyle",
      isFeatured: false,
    },
  ],
  services: [
    {
      id: "s1",
      tag: "Cơ bản",
      name: "Chụp ảnh Bất động sản Cao cấp",
      price: "450000",
      unit: "/buổi",
      desc: "Gói tiêu chuẩn bao gồm ảnh đã qua chỉnh sửa, phù hợp cho căn hộ, studio hoặc biệt thự.",
      delivery: "Giao file trong 48h",
      active: true,
    },
    {
      id: "s2",
      tag: "Thương mại",
      name: "Chụp ảnh Sản phẩm Editorial",
      price: "800000",
      unit: "/ngày",
      desc: "Dịch vụ cho chiến dịch quảng cáo, lookbook, sản phẩm thương mại và truyền thông.",
      delivery: "Giao file trong 72h",
      active: true,
    },
  ],
};

const emptyPortfolioForm: PortfolioItem = {
  id: "",
  url: "",
  title: "",
  category: "",
  isFeatured: false,
};

const emptyServiceForm: ServiceItem = {
  id: "",
  tag: "Cơ bản",
  name: "",
  price: "",
  unit: "/buổi",
  desc: "",
  delivery: "Giao file trong 48h",
  active: true,
};

function uid(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function formatMoney(value: string) {
  const numberValue = Number(value || 0);
  return `${numberValue.toLocaleString("vi-VN")}đ`;
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Không đọc được file ảnh."));
    reader.readAsDataURL(file);
  });
}

function loadProfileFromStorage(): PhotographerProfile {
  if (typeof window === "undefined") return defaultProfile;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProfile;

    const parsed = JSON.parse(raw);

    return {
      ...defaultProfile,
      ...parsed,
      equipment: Array.isArray(parsed?.equipment)
        ? parsed.equipment
        : defaultProfile.equipment,
      languages: Array.isArray(parsed?.languages)
        ? parsed.languages
        : defaultProfile.languages,
      portfolio: Array.isArray(parsed?.portfolio)
        ? parsed.portfolio
        : defaultProfile.portfolio,
      services: Array.isArray(parsed?.services)
        ? parsed.services
        : defaultProfile.services,
    };
  } catch {
    return defaultProfile;
  }
}

function saveProfileToStorage(profile: PhotographerProfile) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

/* ─── Icons ─────────────────────────────────────────────── */

function IconCamera({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function IconWrench({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

function IconPin({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function IconUpload({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function IconPlus({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function IconEdit({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

function IconTrash({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 15H6L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

function IconStar({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

/* ─── Main Page ─────────────────────────────────────────────── */

export default function ProfilePhotographerPage() {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const portfolioFileRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<PhotographerProfile>(defaultProfile);
  const [savedProfile, setSavedProfile] =
    useState<PhotographerProfile>(defaultProfile);

  const [toast, setToast] = useState("");
  const [equipmentInput, setEquipmentInput] = useState("");
  const [languageInput, setLanguageInput] = useState("");

  const [portfolioModalOpen, setPortfolioModalOpen] = useState(false);
  const [portfolioForm, setPortfolioForm] =
    useState<PortfolioItem>(emptyPortfolioForm);

  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [serviceForm, setServiceForm] =
    useState<ServiceItem>(emptyServiceForm);

  const featuredImage = useMemo(() => {
    return profile.portfolio.find((item) => item.isFeatured) || profile.portfolio[0];
  }, [profile.portfolio]);

  const sideImages = useMemo(() => {
    return profile.portfolio
      .filter((item) => item.id !== featuredImage?.id)
      .slice(0, 2);
  }, [featuredImage?.id, profile.portfolio]);

  useEffect(() => {
    const data = loadProfileFromStorage();
    setProfile(data);
    setSavedProfile(data);
  }, []);

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  }

  function updateProfile<K extends keyof PhotographerProfile>(
    key: K,
    value: PhotographerProfile[K]
  ) {
    setProfile((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleSaveAll() {
    saveProfileToStorage(profile);
    setSavedProfile(profile);
    notify("Đã lưu thay đổi hồ sơ photographer.");
  }

  function handleCancelAll() {
    setProfile(savedProfile);
    setEquipmentInput("");
    setLanguageInput("");
    notify("Đã hoàn tác thay đổi.");
  }

  async function handleAvatarUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      notify("Chỉ được chọn file ảnh.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      notify("Ảnh tối đa 5MB.");
      return;
    }

    const dataUrl = await readFileAsDataUrl(file);
    updateProfile("image", dataUrl);
    notify("Đã cập nhật ảnh đại diện.");

    event.currentTarget.value = "";
  }

  function addEquipment() {
    const value = equipmentInput.trim();
    if (!value) return;

    if (profile.equipment.includes(value)) {
      setEquipmentInput("");
      return;
    }

    updateProfile("equipment", [...profile.equipment, value]);
    setEquipmentInput("");
  }

  function removeEquipment(item: string) {
    updateProfile(
      "equipment",
      profile.equipment.filter((current) => current !== item)
    );
  }

  function addLanguage() {
    const value = languageInput.trim();
    if (!value) return;

    if (profile.languages.includes(value)) {
      setLanguageInput("");
      return;
    }

    updateProfile("languages", [...profile.languages, value]);
    setLanguageInput("");
  }

  function removeLanguage(item: string) {
    updateProfile(
      "languages",
      profile.languages.filter((current) => current !== item)
    );
  }

  function openCreatePortfolio() {
    setPortfolioForm(emptyPortfolioForm);
    setPortfolioModalOpen(true);
  }

  function openEditPortfolio(item: PortfolioItem) {
    setPortfolioForm(item);
    setPortfolioModalOpen(true);
  }

  async function handlePortfolioFileUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      notify("Chỉ được chọn file ảnh.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      notify("Ảnh tối đa 5MB.");
      return;
    }

    const dataUrl = await readFileAsDataUrl(file);

    setPortfolioForm((current) => ({
      ...current,
      url: dataUrl,
    }));

    event.currentTarget.value = "";
  }

  function submitPortfolio() {
    const url = portfolioForm.url.trim();

    if (!url) {
      notify("Vui lòng nhập link ảnh hoặc upload ảnh.");
      return;
    }

    const finalItem: PortfolioItem = {
      ...portfolioForm,
      id: portfolioForm.id || uid("portfolio"),
      url,
      title: portfolioForm.title.trim() || "Ảnh portfolio",
      category: portfolioForm.category.trim() || "Chưa phân loại",
    };

    setProfile((current) => {
      const exists = current.portfolio.some((item) => item.id === finalItem.id);

      let nextPortfolio = exists
        ? current.portfolio.map((item) =>
            item.id === finalItem.id ? finalItem : item
          )
        : [...current.portfolio, finalItem];

      if (finalItem.isFeatured) {
        nextPortfolio = nextPortfolio.map((item) => ({
          ...item,
          isFeatured: item.id === finalItem.id,
        }));
      }

      if (!nextPortfolio.some((item) => item.isFeatured)) {
        nextPortfolio = nextPortfolio.map((item, index) => ({
          ...item,
          isFeatured: index === 0,
        }));
      }

      return {
        ...current,
        portfolio: nextPortfolio,
      };
    });

    setPortfolioModalOpen(false);
    setPortfolioForm(emptyPortfolioForm);
    notify(portfolioForm.id ? "Đã sửa ảnh portfolio." : "Đã thêm ảnh portfolio.");
  }

  function deletePortfolio(id: string) {
    const ok = window.confirm("Xóa ảnh này khỏi portfolio?");
    if (!ok) return;

    setProfile((current) => {
      let nextPortfolio = current.portfolio.filter((item) => item.id !== id);

      if (nextPortfolio.length && !nextPortfolio.some((item) => item.isFeatured)) {
        nextPortfolio = nextPortfolio.map((item, index) => ({
          ...item,
          isFeatured: index === 0,
        }));
      }

      return {
        ...current,
        portfolio: nextPortfolio,
      };
    });

    notify("Đã xóa ảnh portfolio.");
  }

  function setFeaturedPortfolio(id: string) {
    setProfile((current) => ({
      ...current,
      portfolio: current.portfolio.map((item) => ({
        ...item,
        isFeatured: item.id === id,
      })),
    }));

    notify("Đã đặt ảnh chính.");
  }

  function openCreateService() {
    setServiceForm(emptyServiceForm);
    setServiceModalOpen(true);
  }

  function openEditService(service: ServiceItem) {
    setServiceForm(service);
    setServiceModalOpen(true);
  }

  function submitService() {
    if (!serviceForm.name.trim()) {
      notify("Vui lòng nhập tên dịch vụ.");
      return;
    }

    if (!serviceForm.price.trim()) {
      notify("Vui lòng nhập giá dịch vụ.");
      return;
    }

    const finalService: ServiceItem = {
      ...serviceForm,
      id: serviceForm.id || uid("service"),
      tag: serviceForm.tag.trim() || "Cơ bản",
      name: serviceForm.name.trim(),
      price: serviceForm.price.trim(),
      unit: serviceForm.unit.trim() || "/buổi",
      desc: serviceForm.desc.trim() || "Chưa có mô tả dịch vụ.",
      delivery: serviceForm.delivery.trim() || "Giao file trong 48h",
    };

    setProfile((current) => {
      const exists = current.services.some((item) => item.id === finalService.id);

      return {
        ...current,
        services: exists
          ? current.services.map((item) =>
              item.id === finalService.id ? finalService : item
            )
          : [...current.services, finalService],
      };
    });

    setServiceModalOpen(false);
    setServiceForm(emptyServiceForm);
    notify(serviceForm.id ? "Đã sửa dịch vụ." : "Đã thêm dịch vụ.");
  }

  function deleteService(id: string) {
    const ok = window.confirm("Xóa dịch vụ này?");
    if (!ok) return;

    setProfile((current) => ({
      ...current,
      services: current.services.filter((item) => item.id !== id),
    }));

    notify("Đã xóa dịch vụ.");
  }

  return (
    <main className="px-6 py-7 lg:px-8 xl:px-10">
      {toast ? (
        <div className="fixed right-6 top-6 z-[9999] rounded-2xl bg-[#111827] px-5 py-3 text-sm font-bold text-white shadow-2xl">
          {toast}
        </div>
      ) : null}

      <div className="mx-auto w-full max-w-[1080px] space-y-5 pb-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1a1a2e]">
              Hồ Sơ Nhiếp Ảnh Gia
            </h1>
            <p className="mt-1 text-[13px] text-slate-500">
              Quản lý cách bạn xuất hiện trước khách hàng trên Studion.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCancelAll}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Hủy
            </button>

            <button
              type="button"
              onClick={handleSaveAll}
              className="flex items-center gap-1.5 rounded-lg bg-[#ff8d28] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#e07820]"
            >
              <IconUpload className="h-4 w-4" />
              Lưu thay đổi
            </button>
          </div>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50 text-[#ff8d28]">
              <IconCamera className="h-4 w-4" />
            </span>
            <h2 className="font-bold text-[#1a1a2e]">Thông tin cơ bản</h2>
          </div>

          <div className="flex flex-col gap-6 sm:flex-row">
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div className="relative">
                <img
                  src={profile.image}
                  alt={profile.name}
                  className="h-[100px] w-[100px] rounded-full object-cover border-2 border-orange-100"
                />

                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  aria-label="Đổi ảnh đại diện"
                  className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-[#ff8d28] text-white shadow"
                >
                  <IconCamera className="h-3.5 w-3.5" />
                </button>

                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>

              <p className="text-center text-[11px] text-slate-400 leading-tight">
                JPG, PNG
                <br />
                Tối đa 5MB
              </p>
            </div>

            <div className="flex-1 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Tên hiển thị"
                  value={profile.name}
                  onChange={(value) => updateProfile("name", value)}
                  placeholder="Tên hiển thị"
                />

                <Field
                  label="Chức danh chuyên môn"
                  value={profile.title}
                  onChange={(value) => updateProfile("title", value)}
                  placeholder="VD: Nhiếp ảnh gia cưới"
                />
              </div>

              <Field
                label="Vị trí hoạt động chính"
                value={profile.location}
                onChange={(value) => updateProfile("location", value)}
                placeholder="VD: TP. Hồ Chí Minh"
              />

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-slate-500">
                    Tiểu sử
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {profile.bio.length}/500
                  </span>
                </div>

                <textarea
                  value={profile.bio}
                  onChange={(event) => updateProfile("bio", event.target.value)}
                  rows={4}
                  maxLength={500}
                  className="w-full resize-none rounded-lg border border-slate-200 bg-[#f8f8fb] px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-300 focus:ring-1 focus:ring-orange-100"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50 text-[#ff8d28]">
              <IconWrench className="h-4 w-4" />
            </span>
            <h2 className="font-bold text-[#1a1a2e]">Thông tin chuyên môn</h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 mb-2">
                Danh sách thiết bị
              </p>

              <TagEditor
                items={profile.equipment}
                input={equipmentInput}
                placeholder="Thêm thiết bị..."
                onInput={setEquipmentInput}
                onAdd={addEquipment}
                onRemove={removeEquipment}
              />
            </div>

            <div>
              <p className="text-[11px] font-semibold text-slate-500 mb-2">
                Vị trí hoạt động
              </p>

              <div className="rounded-lg border border-slate-200 bg-[#f8f8fb] p-3">
                <div className="flex items-center gap-1.5 text-sm text-slate-700">
                  <IconPin className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>{profile.location}</span>
                </div>

                <div className="mt-3 flex items-center gap-1.5 text-[12px] text-slate-500">
                  <span className="inline-block h-2 w-2 rounded-full bg-orange-400 shrink-0" />
                  Sẵn sàng đi công tác xa
                </div>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold text-slate-500 mb-2">
                Ngôn ngữ
              </p>

              <TagEditor
                items={profile.languages}
                input={languageInput}
                placeholder="Thêm ngôn ngữ..."
                tone="orange"
                onInput={setLanguageInput}
                onAdd={addLanguage}
                onRemove={removeLanguage}
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50 text-[#ff8d28]">
                <IconCamera className="h-4 w-4" />
              </span>

              <div>
                <h2 className="font-bold text-[#1a1a2e]">
                  Ảnh nổi bật Portfolio
                </h2>
                <p className="text-[12px] text-slate-500">
                  Thêm, sửa, xóa ảnh mẫu để khách hàng tham khảo.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={openCreatePortfolio}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#1a1a2e] px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
            >
              <IconPlus className="h-3.5 w-3.5" />
              Thêm ảnh mới
            </button>
          </div>

          {profile.portfolio.length === 0 ? (
            <div className="flex min-h-[220px] items-center justify-center rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
              Chưa có ảnh portfolio. Bấm “Thêm ảnh mới” để thêm.
            </div>
          ) : (
            <>
              <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr]">
                <PortfolioPreviewCard
                  item={featuredImage}
                  large
                  onEdit={openEditPortfolio}
                  onDelete={deletePortfolio}
                  onFeatured={setFeaturedPortfolio}
                />

                <div className="grid gap-3">
                  {sideImages.map((item) => (
                    <PortfolioPreviewCard
                      key={item.id}
                      item={item}
                      onEdit={openEditPortfolio}
                      onDelete={deletePortfolio}
                      onFeatured={setFeaturedPortfolio}
                    />
                  ))}

                  {sideImages.length < 2 ? (
                    <button
                      type="button"
                      onClick={openCreatePortfolio}
                      className="flex min-h-[124px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-sm font-semibold text-slate-500 transition hover:border-orange-300 hover:text-[#ff8d28]"
                    >
                      + Thêm ảnh
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {profile.portfolio.map((item) => (
                  <div
                    key={item.id}
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                  >
                    <img
                      src={item.url}
                      alt={item.title}
                      className="h-[150px] w-full object-cover"
                    />

                    <div className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-[#1a1a2e]">
                            {item.title}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {item.category}
                          </p>
                        </div>

                        {item.isFeatured ? (
                          <span className="rounded-full bg-orange-50 px-2 py-1 text-[10px] font-bold text-[#ff8d28]">
                            Chính
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-3 flex gap-2">
                        <SmallButton onClick={() => openEditPortfolio(item)}>
                          Sửa
                        </SmallButton>

                        <SmallButton
                          tone="dark"
                          onClick={() => setFeaturedPortfolio(item.id)}
                        >
                          Ảnh chính
                        </SmallButton>

                        <SmallButton
                          tone="danger"
                          onClick={() => deletePortfolio(item.id)}
                        >
                          Xóa
                        </SmallButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50 text-[#ff8d28]">
                <IconStar className="h-4 w-4" />
              </span>

              <h2 className="font-bold text-[#1a1a2e]">Các gói dịch vụ</h2>
            </div>

            <button
              type="button"
              onClick={openCreateService}
              className="text-sm font-semibold text-[#ff8d28] transition hover:text-orange-600"
            >
              + Thêm dịch vụ mới
            </button>
          </div>

          {profile.services.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-12 text-center">
              <p className="text-sm font-semibold text-slate-500">
                Chưa có dịch vụ nào.
              </p>

              <button
                type="button"
                onClick={openCreateService}
                className="mt-3 rounded-lg bg-[#ff8d28] px-4 py-2 text-sm font-bold text-white"
              >
                Thêm dịch vụ đầu tiên
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {profile.services.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onEdit={openEditService}
                  onDelete={deleteService}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {portfolioModalOpen ? (
        <Modal
          title={portfolioForm.id ? "Sửa ảnh portfolio" : "Thêm ảnh portfolio"}
          onClose={() => setPortfolioModalOpen(false)}
        >
          <div className="grid gap-4">
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-500">
                Link ảnh hoặc upload ảnh
              </label>

              <div className="flex gap-2">
                <input
                  value={portfolioForm.url}
                  onChange={(event) =>
                    setPortfolioForm((current) => ({
                      ...current,
                      url: event.target.value,
                    }))
                  }
                  placeholder="https://..."
                  className="h-11 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-[#ff8d28]"
                />

                <button
                  type="button"
                  onClick={() => portfolioFileRef.current?.click()}
                  className="rounded-xl border border-orange-200 bg-orange-50 px-3 text-sm font-bold text-[#ff8d28]"
                >
                  Upload
                </button>

                <input
                  ref={portfolioFileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePortfolioFileUpload}
                />
              </div>
            </div>

            {portfolioForm.url ? (
              <img
                src={portfolioForm.url}
                alt=""
                className="h-[190px] w-full rounded-2xl object-cover"
              />
            ) : null}

            <Field
              label="Tên ảnh"
              value={portfolioForm.title}
              onChange={(value) =>
                setPortfolioForm((current) => ({ ...current, title: value }))
              }
              placeholder="VD: Chụp ảnh cưới ngoài trời"
            />

            <Field
              label="Danh mục"
              value={portfolioForm.category}
              onChange={(value) =>
                setPortfolioForm((current) => ({ ...current, category: value }))
              }
              placeholder="VD: Wedding, Studio, Event..."
            />

            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={portfolioForm.isFeatured}
                onChange={(event) =>
                  setPortfolioForm((current) => ({
                    ...current,
                    isFeatured: event.target.checked,
                  }))
                }
              />
              Đặt làm ảnh chính
            </label>

            <div className="mt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPortfolioModalOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600"
              >
                Hủy
              </button>

              <button
                type="button"
                onClick={submitPortfolio}
                className="rounded-xl bg-[#ff8d28] px-4 py-2 text-sm font-bold text-white"
              >
                Lưu ảnh
              </button>
            </div>
          </div>
        </Modal>
      ) : null}

      {serviceModalOpen ? (
        <Modal
          title={serviceForm.id ? "Sửa dịch vụ" : "Thêm dịch vụ mới"}
          onClose={() => setServiceModalOpen(false)}
        >
          <div className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label="Tên dịch vụ"
                value={serviceForm.name}
                onChange={(value) =>
                  setServiceForm((current) => ({ ...current, name: value }))
                }
                placeholder="VD: Chụp ảnh cưới"
              />

              <Field
                label="Tag"
                value={serviceForm.tag}
                onChange={(value) =>
                  setServiceForm((current) => ({ ...current, tag: value }))
                }
                placeholder="VD: Cơ bản"
              />

              <Field
                label="Giá"
                value={serviceForm.price}
                onChange={(value) =>
                  setServiceForm((current) => ({ ...current, price: value }))
                }
                placeholder="VD: 1500000"
              />

              <Field
                label="Đơn vị"
                value={serviceForm.unit}
                onChange={(value) =>
                  setServiceForm((current) => ({ ...current, unit: value }))
                }
                placeholder="/buổi"
              />
            </div>

            <Field
              label="Thời gian giao file"
              value={serviceForm.delivery}
              onChange={(value) =>
                setServiceForm((current) => ({ ...current, delivery: value }))
              }
              placeholder="VD: Giao file trong 48h"
            />

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-500">
                Mô tả
              </label>

              <textarea
                value={serviceForm.desc}
                onChange={(event) =>
                  setServiceForm((current) => ({
                    ...current,
                    desc: event.target.value,
                  }))
                }
                rows={4}
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-[#ff8d28]"
                placeholder="Mô tả dịch vụ..."
              />
            </div>

            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={serviceForm.active}
                onChange={(event) =>
                  setServiceForm((current) => ({
                    ...current,
                    active: event.target.checked,
                  }))
                }
              />
              Đang hoạt động
            </label>

            <div className="mt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setServiceModalOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600"
              >
                Hủy
              </button>

              <button
                type="button"
                onClick={submitService}
                className="rounded-xl bg-[#ff8d28] px-4 py-2 text-sm font-bold text-white"
              >
                Lưu dịch vụ
              </button>
            </div>
          </div>
        </Modal>
      ) : null}
    </main>
  );
}

/* ─── Components ─────────────────────────────────────────────── */

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-semibold text-slate-500">
        {label}
      </label>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-200 bg-[#f8f8fb] px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-300 focus:ring-1 focus:ring-orange-100"
      />
    </div>
  );
}

function TagEditor({
  items,
  input,
  placeholder,
  tone = "slate",
  onInput,
  onAdd,
  onRemove,
}: {
  items: string[];
  input: string;
  placeholder: string;
  tone?: "slate" | "orange";
  onInput: (value: string) => void;
  onAdd: () => void;
  onRemove: (item: string) => void;
}) {
  return (
    <div className="min-h-[120px] rounded-lg border border-slate-200 bg-[#f8f8fb] p-3 flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span
            key={item}
            className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs shadow-sm ${
              tone === "orange"
                ? "border-orange-200 bg-orange-50 text-orange-700"
                : "border-slate-200 bg-white text-slate-700"
            }`}
          >
            {item}
            <button
              type="button"
              onClick={() => onRemove(item)}
              className="ml-0.5 text-slate-400 hover:text-red-400 leading-none"
            >
              ×
            </button>
          </span>
        ))}
      </div>

      <div className="mt-auto flex gap-1">
        <input
          value={input}
          onChange={(event) => onInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onAdd();
            }
          }}
          placeholder={placeholder}
          className="flex-1 rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 outline-none focus:border-orange-300"
        />

        <button
          type="button"
          onClick={onAdd}
          className="rounded border border-orange-200 bg-orange-50 px-2 py-1 text-xs text-orange-600 transition hover:bg-orange-100"
        >
          +
        </button>
      </div>
    </div>
  );
}

function PortfolioPreviewCard({
  item,
  large,
  onEdit,
  onDelete,
  onFeatured,
}: {
  item?: PortfolioItem;
  large?: boolean;
  onEdit: (item: PortfolioItem) => void;
  onDelete: (id: string) => void;
  onFeatured: (id: string) => void;
}) {
  if (!item) {
    return (
      <div className="flex min-h-[124px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
        Chưa có ảnh
      </div>
    );
  }

  return (
    <div
      className={`group relative overflow-hidden rounded-xl bg-slate-100 ${
        large ? "min-h-[260px]" : "min-h-[124px]"
      }`}
    >
      <img src={item.url} alt={item.title} className="h-full w-full object-cover" />

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white">
        <p className="text-sm font-bold">{item.title}</p>
        <p className="text-xs text-white/75">{item.category}</p>
      </div>

      {item.isFeatured ? (
        <span className="absolute left-3 top-3 rounded-md bg-black/55 px-2 py-0.5 text-[11px] font-bold text-white backdrop-blur-sm">
          Ảnh chính
        </span>
      ) : null}

      <div className="absolute right-3 top-3 hidden gap-2 group-hover:flex">
        <button
          type="button"
          onClick={() => onEdit(item)}
          className="grid h-8 w-8 place-items-center rounded-lg bg-white text-slate-700 shadow"
        >
          <IconEdit className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => onFeatured(item.id)}
          className="grid h-8 w-8 place-items-center rounded-lg bg-white text-orange-500 shadow"
        >
          <IconStar className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => onDelete(item.id)}
          className="grid h-8 w-8 place-items-center rounded-lg bg-white text-red-500 shadow"
        >
          <IconTrash className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function ServiceCard({
  service,
  onEdit,
  onDelete,
}: {
  service: ServiceItem;
  onEdit: (service: ServiceItem) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-[#f8f8fb] p-4 flex flex-col gap-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <span className="mb-1.5 inline-block rounded-md bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-[#ff8d28]">
            {service.tag}
          </span>

          <h3 className="text-sm font-bold text-[#1a1a2e] leading-snug">
            {service.name}
          </h3>

          <p className="mt-0.5 text-[#ff8d28] font-bold text-base">
            {formatMoney(service.price)}
            <span className="text-[11px] font-medium text-slate-500">
              {service.unit}
            </span>
          </p>
        </div>

        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={() => onEdit(service)}
            className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-[#ff8d28]"
          >
            <IconEdit className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(service.id)}
            className="grid h-8 w-8 place-items-center rounded-lg border border-red-100 bg-white text-red-500"
          >
            <IconTrash className="h-4 w-4" />
          </button>
        </div>
      </div>

      <p className="text-[12px] text-slate-500 leading-relaxed">
        {service.desc}
      </p>

      <div className="flex items-center justify-between text-[11px] font-semibold">
        <span className="text-slate-500">📦 {service.delivery}</span>

        <span className="flex items-center gap-1">
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full ${
              service.active ? "bg-green-500" : "bg-slate-400"
            }`}
          />
          <span className={service.active ? "text-green-600" : "text-slate-500"}>
            {service.active ? "Đang hoạt động" : "Đang tắt"}
          </span>
        </span>
      </div>
    </div>
  );
}

function SmallButton({
  children,
  tone = "default",
  onClick,
}: {
  children: React.ReactNode;
  tone?: "default" | "danger" | "dark";
  onClick: () => void;
}) {
  const className =
    tone === "danger"
      ? "border-red-100 bg-red-50 text-red-600 hover:bg-red-100"
      : tone === "dark"
      ? "border-slate-800 bg-slate-900 text-white hover:bg-slate-700"
      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition ${className}`}
    >
      {children}
    </button>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[9998] grid place-items-center bg-black/45 px-4 backdrop-blur-sm">
      <div className="w-full max-w-[620px] rounded-3xl bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-lg font-black text-[#1a1a2e]">{title}</h2>

          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"
          >
            ×
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}