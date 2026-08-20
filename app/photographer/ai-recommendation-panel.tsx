"use client";

import { useEffect, useState, type FormEvent } from "react";
import type {
  AiRecommendationPriority,
  AiRecommendationRequest,
} from "./ai-recommendation-api";

const priorityOptions: Array<{
  value: AiRecommendationPriority;
  label: string;
  description: string;
}> = [
  {
    value: "balanced",
    label: "Cân bằng",
    description: "Dịch vụ, giá, vị trí, rating và phong cách",
  },
  {
    value: "style",
    label: "Đúng phong cách",
    description: "Ưu tiên bio và tín hiệu phong cách chụp",
  },
  {
    value: "rating",
    label: "Rating cao",
    description: "Ưu tiên photographer có đánh giá tốt",
  },
  {
    value: "price",
    label: "Tối ưu ngân sách",
    description: "Ưu tiên gói dịch vụ nằm trong mức chi",
  },
  {
    value: "location",
    label: "Gần địa điểm",
    description: "Ưu tiên khu vực hoạt động phù hợp",
  },
];

export function AiRecommendationPanel({
  open,
  loading,
  error,
  categoryOptions,
  initialCategory,
  initialLocation,
  initialBudgetMillions,
  onClose,
  onSubmit,
}: {
  open: boolean;
  loading: boolean;
  error: string;
  categoryOptions: string[];
  initialCategory?: string;
  initialLocation?: string;
  initialBudgetMillions?: number;
  onClose: () => void;
  onSubmit: (payload: AiRecommendationRequest) => void | Promise<void>;
}) {
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [budgetMillions, setBudgetMillions] = useState("");
  const [shootDate, setShootDate] = useState("");
  const [priority, setPriority] =
    useState<AiRecommendationPriority>("balanced");

  useEffect(() => {
    if (!open) return;

    setCategory(
      initialCategory && initialCategory !== "all" ? initialCategory : "",
    );
    setLocation(
      initialLocation &&
        initialLocation !== "Tất cả địa điểm" &&
        initialLocation !== "Tất cả"
        ? initialLocation
        : "",
    );
    setBudgetMillions(
      initialBudgetMillions && initialBudgetMillions < 100
        ? String(initialBudgetMillions)
        : "",
    );
  }, [initialBudgetMillions, initialCategory, initialLocation, open]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) onClose();
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [loading, onClose, open]);

  if (!open) return null;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const budget = Number(String(budgetMillions).replace(",", "."));

    await onSubmit({
      message: message.trim(),
      category: category || undefined,
      location: location.trim() || undefined,
      budgetMax:
        Number.isFinite(budget) && budget > 0
          ? Math.round(budget * 1_000_000)
          : null,
      priority,
      shootDate: shootDate || undefined,
      maxResults: 9,
    });
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center px-4 py-6">
      <button
        type="button"
        aria-label="Đóng bảng AI"
        className="absolute inset-0 bg-[#17131f]/45 backdrop-blur-[3px]"
        onClick={() => {
          if (!loading) onClose();
        }}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-recommend-title"
        className="relative z-10 max-h-[92vh] w-full max-w-[760px] overflow-y-auto rounded-[28px] border border-white/80 bg-white shadow-[0_28px_90px_rgba(25,19,35,0.22)]"
      >
        <div className="border-b border-[#eee9f3] bg-[linear-gradient(135deg,#fff8f1_0%,#ffffff_52%,#f7f3ff_100%)] px-6 py-6 sm:px-8">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#ffd8b5] bg-white/90 px-3 py-1.5 text-[11px] font-black text-[#ff7d1a] shadow-sm">
                <span className="text-[14px]">✦</span>
                GEMINI + HYBRID SCORING
              </div>

              <h2
                id="ai-recommend-title"
                className="mt-3 text-[26px] font-black leading-tight text-[#171821] sm:text-[30px]"
              >
                Bạn đang muốn chụp gì?
              </h2>

              <p className="mt-2 max-w-[600px] text-[13px] font-medium leading-6 text-[#66616f]">
                AI chỉ hiểu nhu cầu bằng ngôn ngữ tự nhiên. Điểm Match được
                backend tính từ dữ liệu thật: dịch vụ, ngân sách, khu vực,
                rating, phong cách, lịch và lịch sử tài khoản.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#e8e2ed] bg-white text-lg font-bold text-[#615b69] transition hover:border-[#ffcfaa] hover:text-[#ff7d1a] disabled:opacity-50"
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-5 px-6 py-6 sm:px-8 sm:py-7">
          <label className="block">
            <span className="text-[13px] font-black text-[#292630]">
              Mô tả nhu cầu của bạn
            </span>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={4}
              placeholder="Ví dụ: Mình muốn chụp couple ở Đà Lạt, ngân sách khoảng 3 triệu, thích ảnh tự nhiên, ít tạo dáng và ưu tiên photographer rating cao."
              className="mt-2 w-full resize-none rounded-2xl border border-[#e3ddea] bg-[#fdfcff] px-4 py-3 text-[13px] font-medium leading-6 text-[#292630] outline-none transition placeholder:text-[#aaa4b1] focus:border-[#ffb273] focus:ring-4 focus:ring-[#ff8d28]/10"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-[12px] font-black text-[#39343f]">
                Dịch vụ
              </span>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="mt-2 h-11 w-full rounded-xl border border-[#e3ddea] bg-white px-3 text-[13px] font-bold text-[#4a4550] outline-none focus:border-[#ffb273]"
              >
                <option value="">Để AI tự hiểu</option>
                {categoryOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-[12px] font-black text-[#39343f]">
                Địa điểm
              </span>
              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Đà Lạt, TP.HCM, Hà Nội..."
                className="mt-2 h-11 w-full rounded-xl border border-[#e3ddea] bg-white px-3 text-[13px] font-bold text-[#4a4550] outline-none placeholder:font-medium placeholder:text-[#aaa4b1] focus:border-[#ffb273]"
              />
            </label>

            <label className="block">
              <span className="text-[12px] font-black text-[#39343f]">
                Ngân sách tối đa
              </span>
              <div className="relative mt-2">
                <input
                  inputMode="decimal"
                  value={budgetMillions}
                  onChange={(event) =>
                    setBudgetMillions(event.target.value.replace(/[^0-9.,]/g, ""))
                  }
                  placeholder="3"
                  className="h-11 w-full rounded-xl border border-[#e3ddea] bg-white px-3 pr-16 text-[13px] font-bold text-[#4a4550] outline-none placeholder:text-[#aaa4b1] focus:border-[#ffb273]"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-black text-[#918a99]">
                  TRIỆU
                </span>
              </div>
            </label>

            <label className="block">
              <span className="text-[12px] font-black text-[#39343f]">
                Ngày dự kiến
              </span>
              <input
                type="date"
                value={shootDate}
                onChange={(event) => setShootDate(event.target.value)}
                className="mt-2 h-11 w-full rounded-xl border border-[#e3ddea] bg-white px-3 text-[13px] font-bold text-[#4a4550] outline-none focus:border-[#ffb273]"
              />
            </label>
          </div>

          <div>
            <p className="text-[12px] font-black text-[#39343f]">
              Điều bạn ưu tiên nhất
            </p>

            <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {priorityOptions.map((option) => {
                const selected = priority === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPriority(option.value)}
                    className={`rounded-xl border px-3 py-3 text-left transition ${
                      selected
                        ? "border-[#ffb26f] bg-[#fff5eb] shadow-[0_8px_18px_rgba(255,141,40,0.08)]"
                        : "border-[#ebe6ef] bg-white hover:border-[#ffd5b2]"
                    }`}
                  >
                    <span
                      className={`block text-[12px] font-black ${
                        selected ? "text-[#e96f0f]" : "text-[#4a4550]"
                      }`}
                    >
                      {option.label}
                    </span>
                    <span className="mt-1 block text-[10px] font-medium leading-4 text-[#8c8592]">
                      {option.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {error ? (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-[12px] font-bold leading-5 text-red-600">
              {error}
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-2 border-t border-[#f0ebf4] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[10px] font-medium leading-4 text-[#96909c]">
              Gemini không được quyền tự tạo photographer hoặc tự đặt % Match.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#ff8d28] px-5 text-[13px] font-black text-white shadow-[0_10px_24px_rgba(255,141,40,0.2)] transition hover:-translate-y-0.5 hover:bg-[#e77818] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="text-base">✦</span>
              {loading ? "AI đang phân tích..." : "Tìm photographer bằng AI"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
