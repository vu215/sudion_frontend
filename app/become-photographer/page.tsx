"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type Category = {
  id: number;
  name: string;
  slug?: string;
  description?: string;
};

type PackageForm = {
  id: string;
  categoryId: string;
  name: string;
  price: string;
  description: string;
  duration: string;
  portfolioImages: string[];
};

const fallbackCategories: Category[] = [
  { id: 1, name: "Chụp ảnh cưới", slug: "wedding" },
  { id: 2, name: "Chụp ảnh gia đình", slug: "family" },
  { id: 3, name: "Chụp ảnh du lịch", slug: "travel" },
  { id: 4, name: "Chụp ảnh kỷ yếu", slug: "yearbook" },
  { id: 5, name: "Chụp ảnh chân dung", slug: "portrait" },
  { id: 6, name: "Chụp ảnh sự kiện", slug: "event" },
];

function uid() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function createDefaultPackage(categoryId = ""): PackageForm {
  return {
    id: uid(),
    categoryId,
    name: "",
    price: "",
    description: "",
    duration: "120",
    portfolioImages: [],
  };
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

function readAllLocalStorageObjects() {
  if (typeof window === "undefined") return [];

  const result: any[] = [];

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key) continue;

    const raw = window.localStorage.getItem(key);
    if (!raw) continue;

    result.push({ key, raw });

    try {
      result.push({ key, raw, parsed: JSON.parse(raw) });
    } catch {
      // bỏ qua string thường
    }
  }

  return result;
}

function getAuthToken() {
  if (typeof window === "undefined") return "";

  const directKeys = [
    "sudion_token",
    "sudion_auth_token",
    "sudion_access_token",
    "auth_token",
    "access_token",
    "token",
    "accessToken",
    "jwt",
  ];

  for (const key of directKeys) {
    const value = window.localStorage.getItem(key);
    if (value) return value.trim();
  }

  for (const item of readAllLocalStorageObjects()) {
    if (typeof item.raw === "string") {
      const raw = item.raw.trim();

      if (raw.startsWith("eyJ") && raw.split(".").length === 3) {
        return raw;
      }
    }

    if (item.parsed) {
      const token = findDeepValue(item.parsed, [
        "token",
        "accessToken",
        "access_token",
        "authToken",
        "jwt",
      ]);

      if (token) return token;
    }
  }

  return "";
}

function getStoredValue(keys: string[]) {
  if (typeof window === "undefined") return "";

  for (const key of keys) {
    const value = window.localStorage.getItem(key);
    if (value) return value;
  }

  for (const item of readAllLocalStorageObjects()) {
    if (!item.parsed) continue;

    const found = findDeepValue(item.parsed, keys);
    if (found) return found;
  }

  return "";
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Không đọc được file ảnh."));
    reader.readAsDataURL(file);
  });
}

function formatMoney(value: string | number) {
  return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
}

function isRemoteImageUrl(value: string) {
  return /^https?:\/\//i.test(String(value || "")) && value.length < 900;
}

function fallbackImageUrl(seed: string, size = "900/600") {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${size}`;
}

function normalizeYear(value: string) {
  const year = Number(value || new Date().getFullYear());

  if (!Number.isFinite(year)) return new Date().getFullYear();
  if (year < 1990) return 1990;
  if (year > new Date().getFullYear()) return new Date().getFullYear();

  return year;
}

export default function BecomePhotographerPage() {
  const router = useRouter();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>(fallbackCategories);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [activeArea, setActiveArea] = useState("TP. Hồ Chí Minh");
  const [startedYear, setStartedYear] = useState(
    String(new Date().getFullYear())
  );
  const [photographerType, setPhotographerType] = useState("freelance");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("");
  const [workHistory, setWorkHistory] = useState("");

  const [packages, setPackages] = useState<PackageForm[]>([
    createDefaultPackage(""),
  ]);

  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState("");
  const [toast, setToast] = useState("");

  const minPrice = useMemo(() => {
    const prices = packages
      .map((item) => Number(item.price || 0))
      .filter((value) => value > 0);

    if (!prices.length) return "0đ";

    return formatMoney(Math.min(...prices));
  }, [packages]);

  useEffect(() => {
    setFullName(
      getStoredValue(["fullName", "full_name", "name", "user_name"]) || ""
    );
    setPhone(getStoredValue(["phone", "user_phone"]) || "");

    async function loadCategories() {
      try {
        const response = await fetch(`${API_URL}/categories`, {
          cache: "no-store",
        });

        const json = await response.json().catch(() => null);

        if (response.ok && json?.success && Array.isArray(json.data)) {
          setCategories(json.data);
        } else if (Array.isArray(json)) {
          setCategories(json);
        } else {
          setCategories(fallbackCategories);
        }
      } catch {
        setCategories(fallbackCategories);
      }
    }

    void loadCategories();
  }, []);

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  function toggleCategory(categoryId: number) {
    const id = String(categoryId);

    setSelectedCategoryIds((current) => {
      const existed = current.includes(id);

      if (existed) {
        setPackages((list) =>
          list.map((item) =>
            item.categoryId === id ? { ...item, categoryId: "" } : item
          )
        );

        return current.filter((item) => item !== id);
      }

      setPackages((list) => {
        if (list.length === 1 && !list[0].categoryId && !list[0].name) {
          return [{ ...list[0], categoryId: id }];
        }

        return [...list, createDefaultPackage(id)];
      });

      return [...current, id];
    });
  }

  function updatePackage(
    packageId: string,
    key: keyof PackageForm,
    value: string | string[]
  ) {
    setPackages((current) =>
      current.map((item) =>
        item.id === packageId ? { ...item, [key]: value } : item
      )
    );
  }

  function addPackage() {
    const defaultCategoryId = selectedCategoryIds[0] || "";

    setPackages((current) => [
      ...current,
      createDefaultPackage(defaultCategoryId),
    ]);
  }

  function removePackage(packageId: string) {
    setPackages((current) => {
      if (current.length <= 1) return current;

      return current.filter((item) => item.id !== packageId);
    });
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
    setAvatarUrl(dataUrl);
    event.currentTarget.value = "";
  }

  async function handlePackageImageUpload(
    event: ChangeEvent<HTMLInputElement>,
    packageId: string
  ) {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    const validFiles = files.filter((file) => file.type.startsWith("image/"));

    if (!validFiles.length) {
      notify("Chỉ được chọn file ảnh.");
      return;
    }

    const dataUrls = await Promise.all(validFiles.map(readFileAsDataUrl));

    setPackages((current) =>
      current.map((item) =>
        item.id === packageId
          ? {
              ...item,
              portfolioImages: [...item.portfolioImages, ...dataUrls].slice(
                0,
                6
              ),
            }
          : item
      )
    );

    event.currentTarget.value = "";
  }

  function removePackageImage(packageId: string, imageIndex: number) {
    setPackages((current) =>
      current.map((item) =>
        item.id === packageId
          ? {
              ...item,
              portfolioImages: item.portfolioImages.filter(
                (_, index) => index !== imageIndex
              ),
            }
          : item
      )
    );
  }

  async function handleSubmit() {
    const token = getAuthToken();

    if (!token) {
      setPageError("Bạn cần đăng nhập trước khi đăng ký thành nhiếp ảnh gia.");
      router.push("/login");
      return;
    }

    if (!fullName.trim()) {
      setPageError("Vui lòng nhập tên hiển thị.");
      return;
    }

    if (!avatarUrl.trim()) {
      setPageError("Vui lòng tải ảnh đại diện photographer.");
      return;
    }

    if (!bio.trim()) {
      setPageError("Vui lòng nhập giới thiệu hồ sơ.");
      return;
    }

    if (!activeArea.trim()) {
      setPageError("Vui lòng nhập khu vực hoạt động.");
      return;
    }

    const cleanPackages = packages
      .map((item, packageIndex) => {
        const safeImages = item.portfolioImages.map((image, imageIndex) => {
          if (isRemoteImageUrl(image)) return image;

          return fallbackImageUrl(
            `portfolio-${fullName}-${Date.now()}-${packageIndex}-${imageIndex}`
          );
        });

        return {
          categoryId: Number(item.categoryId || 0),
          name: item.name.trim(),
          price: Number(item.price || 0),
          description: item.description.trim(),
          duration: Number(item.duration || 120),
          workerCount: 1,
          maxCustomerCount: 1,
          portfolioImages: safeImages,
        };
      })
      .filter((item) => item.categoryId && item.name && item.price > 0);

    if (!cleanPackages.length) {
      setPageError(
        "Vui lòng tạo ít nhất 1 gói dịch vụ có category, tên gói và giá."
      );
      return;
    }

    const safeAvatarUrl = isRemoteImageUrl(avatarUrl)
      ? avatarUrl
      : fallbackImageUrl(`avatar-${fullName}-${Date.now()}`, "500/500");

    try {
      setLoading(true);
      setPageError("");

      const payload = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        avatarUrl: safeAvatarUrl,
        bio: bio.trim(),
        activeArea: activeArea.trim(),
        workHistory: workHistory.trim(),
        photographerType,
        startedYear: normalizeYear(startedYear),
        packages: cleanPackages,
      };

      const response = await fetch(`${API_URL}/auth/become-photographer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await response.json().catch(() => null);

      if (!response.ok || json?.success === false) {
        const message =
          json?.message || "Không thể đăng ký thành nhiếp ảnh gia.";

        if (response.status === 401) {
          window.localStorage.removeItem("sudion_token");
          window.localStorage.removeItem("sudion_auth_token");
          window.localStorage.removeItem("sudion_session");
          window.localStorage.removeItem("sudion_user");
          window.localStorage.removeItem("sudion_role");

          throw new Error(
            "Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại."
          );
        }

        throw new Error(message);
      }

      notify(
        json?.message || "Đã gửi hồ sơ nhiếp ảnh gia. Vui lòng chờ admin duyệt."
      );

      window.setTimeout(() => {
        router.push("/profile");
      }, 1000);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Không thể đăng ký thành nhiếp ảnh gia.";

      setPageError(message);

      if (message.toLowerCase().includes("đăng nhập")) {
        window.setTimeout(() => {
          router.push("/login");
        }, 1200);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#0f172a]">
      {toast ? (
        <div className="fixed right-5 top-5 z-[9999] rounded-2xl bg-[#111827] px-5 py-3 text-sm font-bold text-white shadow-2xl">
          {toast}
        </div>
      ) : null}

      <section className="mx-auto max-w-[1180px] px-5 py-10">
        <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.07)]">
          <div className="relative overflow-hidden bg-[#111827] px-6 py-8 text-white md:px-10">
            <div className="absolute right-[-120px] top-[-120px] h-[300px] w-[300px] rounded-full bg-[#ff8d28]/25 blur-3xl" />

            <div className="relative">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ffb267]">
                Photographer onboarding
              </p>

              <h1 className="mt-3 max-w-[760px] text-[34px] font-black leading-tight md:text-[46px]">
                Hoàn thiện hồ sơ nhiếp ảnh gia
              </h1>

              <p className="mt-3 max-w-[760px] text-sm font-medium leading-7 text-white/70">
                Nhập hồ sơ, ảnh đại diện, thể loại chụp và gói dịch vụ. Sau khi
                gửi, hồ sơ sẽ chuyển sang trạng thái chờ duyệt. Khi admin duyệt,
                tài khoản mới chuyển thành photographer và dùng được dashboard
                photo.
              </p>
            </div>
          </div>

          <div className="grid gap-6 p-5 md:p-8">
            {pageError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                {pageError}
              </div>
            ) : null}

            <section className="rounded-3xl border border-slate-200 bg-white p-5">
              <div className="mb-5">
                <h2 className="text-lg font-black">1. Hồ sơ hiển thị</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Đây là thông tin admin sẽ duyệt trước khi hiển thị cho khách.
                </p>
              </div>

              <div className="grid gap-5 lg:grid-cols-[180px_minmax(0,1fr)]">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-orange-100 bg-slate-100">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Ảnh đại diện photographer"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-center text-sm font-bold text-slate-400">
                        Ảnh đại diện
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="rounded-xl bg-[#ff8d28] px-4 py-2 text-sm font-bold text-white"
                  >
                    Tải ảnh profile
                  </button>

                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />

                  <p className="max-w-[160px] text-center text-xs text-slate-400">
                    Ảnh này dùng để preview. Khi gửi API sẽ đổi thành URL ngắn
                    để tránh lỗi base64.
                  </p>
                </div>

                <div className="grid gap-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field
                      label="Tên hiển thị"
                      value={fullName}
                      onChange={setFullName}
                      placeholder="VD: Hào Lê Studio"
                    />

                    <Field
                      label="Số điện thoại"
                      value={phone}
                      onChange={setPhone}
                      placeholder="VD: 090..."
                    />

                    <Field
                      label="Khu vực hoạt động"
                      value={activeArea}
                      onChange={setActiveArea}
                      placeholder="VD: TP. Hồ Chí Minh"
                    />

                    <Field
                      label="Năm bắt đầu"
                      value={startedYear}
                      onChange={setStartedYear}
                      placeholder="VD: 2024"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-500">
                      Loại photographer
                    </label>

                    <select
                      value={photographerType}
                      onChange={(event) =>
                        setPhotographerType(event.target.value)
                      }
                      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold outline-none focus:border-[#ff8d28]"
                    >
                      <option value="freelance">Freelance</option>
                      <option value="studio">Studio</option>
                      <option value="agency">Agency</option>
                    </select>
                  </div>

                  <TextArea
                    label="Giới thiệu hồ sơ"
                    value={bio}
                    onChange={setBio}
                    placeholder="Giới thiệu kinh nghiệm, phong cách chụp..."
                  />

                  <TextArea
                    label="Kinh nghiệm / lịch sử làm việc"
                    value={workHistory}
                    onChange={setWorkHistory}
                    placeholder="VD: 3 năm chụp cưới, từng chụp kỷ yếu cho..."
                  />
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5">
              <div className="mb-5">
                <h2 className="text-lg font-black">2. Chọn thể loại chụp</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Bấm chọn category, hệ thống sẽ tự tạo gói dịch vụ tương ứng.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((category) => {
                  const active = selectedCategoryIds.includes(
                    String(category.id)
                  );

                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => toggleCategory(category.id)}
                      className={`rounded-2xl border px-4 py-4 text-left transition ${
                        active
                          ? "border-[#ff8d28] bg-orange-50 text-[#ff8d28]"
                          : "border-slate-200 bg-white text-slate-700 hover:border-orange-200"
                      }`}
                    >
                      <p className="font-black">{category.name}</p>
                      <p className="mt-1 text-xs opacity-70">
                        {category.slug || "service"}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-black">3. Gói dịch vụ & giá</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Mỗi gói sẽ được lưu vào service_packages. Giá thấp nhất hiện
                    tại: <b className="text-[#ff8d28]">{minPrice}</b>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addPackage}
                  className="rounded-xl bg-[#111827] px-4 py-2 text-sm font-bold text-white"
                >
                  + Thêm gói
                </button>
              </div>

              <div className="grid gap-4">
                {packages.map((item, index) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-black">Gói dịch vụ #{index + 1}</h3>

                      {packages.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => removePackage(item.id)}
                          className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600"
                        >
                          Xóa gói
                        </button>
                      ) : null}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-bold text-slate-500">
                          Thể loại
                        </label>

                        <select
                          value={item.categoryId}
                          onChange={(event) =>
                            updatePackage(
                              item.id,
                              "categoryId",
                              event.target.value
                            )
                          }
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-[#ff8d28]"
                        >
                          <option value="">Chọn thể loại</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <Field
                        label="Tên gói"
                        value={item.name}
                        onChange={(value) =>
                          updatePackage(item.id, "name", value)
                        }
                        placeholder="VD: Gói chụp kỷ yếu cơ bản"
                      />

                      <Field
                        label="Giá"
                        value={item.price}
                        onChange={(value) =>
                          updatePackage(item.id, "price", value)
                        }
                        placeholder="VD: 1500000"
                      />

                      <Field
                        label="Thời lượng phút"
                        value={item.duration}
                        onChange={(value) =>
                          updatePackage(item.id, "duration", value)
                        }
                        placeholder="VD: 120"
                      />
                    </div>

                    <div className="mt-4">
                      <TextArea
                        label="Mô tả gói"
                        value={item.description}
                        onChange={(value) =>
                          updatePackage(item.id, "description", value)
                        }
                        placeholder="Gói gồm bao nhiêu ảnh, thời gian chụp, chỉnh sửa..."
                      />
                    </div>

                    <div className="mt-4">
                      <label className="mb-2 block text-xs font-bold text-slate-500">
                        Ảnh mẫu của gói
                      </label>

                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(event) =>
                          void handlePackageImageUpload(event, item.id)
                        }
                        className="block w-full rounded-xl border border-dashed border-slate-300 bg-white px-3 py-3 text-sm"
                      />

                      {item.portfolioImages.length ? (
                        <div className="mt-3 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
                          {item.portfolioImages.map((image, imageIndex) => (
                            <div
                              key={`${item.id}_${imageIndex}`}
                              className="relative overflow-hidden rounded-xl border border-slate-200 bg-white"
                            >
                              <img
                                src={image}
                                alt={`Ảnh mẫu ${imageIndex + 1}`}
                                className="h-24 w-full object-cover"
                              />

                              <button
                                type="button"
                                onClick={() =>
                                  removePackageImage(item.id, imageIndex)
                                }
                                className="absolute right-1 top-1 rounded-full bg-black/70 px-2 py-0.5 text-xs font-bold text-white"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="flex flex-col gap-3 rounded-3xl border border-orange-100 bg-orange-50 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-black text-[#111827]">
                  Hoàn tất gửi hồ sơ photographer
                </h3>

                <p className="mt-1 text-sm text-slate-600">
                  Sau khi gửi, hồ sơ sẽ chuyển sang trạng thái chờ duyệt. Khi
                  admin duyệt, tài khoản mới chuyển thành photographer và dùng
                  được dashboard photo.
                </p>
              </div>

              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={loading}
                className="rounded-2xl bg-[#ff8d28] px-6 py-3 text-sm font-black text-white shadow-[0_10px_24px_rgba(255,141,40,0.25)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Đang gửi..." : "Gửi đăng ký nhiếp ảnh gia"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

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
      <label className="mb-1 block text-xs font-bold text-slate-500">
        {label}
      </label>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold outline-none focus:border-[#ff8d28]"
      />
    </div>
  );
}

function TextArea({
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
      <label className="mb-1 block text-xs font-bold text-slate-500">
        {label}
      </label>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold outline-none focus:border-[#ff8d28]"
      />
    </div>
  );
}