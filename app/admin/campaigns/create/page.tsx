"use client";

import { useState, useMemo, Suspense } from "react";
import AdminLayout from "../../_components/admin-layout";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "../_campaign-api";

type CampaignPlan = {
  name: string;
  description: string;
  campaign_type: string;
  start_at: string;
  end_at: string;
  discount_value: number;
  target_group: string;
  projection: {
    views: number;
    clicks: number;
    bookings: number;
    orders: number;
    revenue: number;
    conversion_rate: number;
  };
  contents: Array<{
    content_type: string;
    title: string;
    content: string;
    cta_text?: string;
    cta_url?: string;
    image_url?: string;
    publish_at?: string;
    remove_at?: string;
  }>;
  schedules: Array<{
    action_type: string;
    scheduled_at: string;
  }>;
};

function CreateCampaignForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isManual = searchParams.get("mode") === "manual";

  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<CampaignPlan | null>(null);
  const [error, setError] = useState("");

  // Editable fields in state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [discountValue, setDiscountValue] = useState(0);
  const [campaignType, setCampaignType] = useState("service");
  const [submitting, setSubmitting] = useState(false);
  const [uploadingBannerIndex, setUploadingBannerIndex] = useState<number | null>(null);

  const previewSchedules = useMemo(() => {
    if (!plan) return [];

    const jobs: Array<{ action_type: string; scheduled_at: string }> = [];
    const startMs = new Date(startAt).getTime();
    const endMs = new Date(endAt).getTime();

    const clamp = (value: string | undefined, fallback: string) => {
      const valueMs = new Date(value || "").getTime();
      if (!Number.isFinite(valueMs) || !Number.isFinite(startMs) || !Number.isFinite(endMs)) {
        return fallback;
      }
      return valueMs < startMs || valueMs > endMs ? fallback : String(value);
    };

    for (const content of plan.contents || []) {
      const type = String(content.content_type || "IN_APP_POST").toUpperCase();
      const publishAt = clamp(content.publish_at, startAt);
      const removeAt = clamp(content.remove_at, endAt);

      if (type === "BANNER") {
        jobs.push({ action_type: "PUBLISH_BANNER", scheduled_at: publishAt });
        jobs.push({ action_type: "REMOVE_BANNER", scheduled_at: removeAt });
      } else if (type === "NOTIFICATION") {
        jobs.push({ action_type: "SEND_NOTIFICATION", scheduled_at: publishAt });
      } else if (type === "EMAIL") {
        jobs.push({ action_type: "SEND_EMAIL", scheduled_at: publishAt });
      } else {
        jobs.push({ action_type: "PUBLISH_CONTENT", scheduled_at: publishAt });
      }
    }

    if (discountValue > 0) {
      jobs.push({ action_type: "ACTIVATE_DISCOUNT", scheduled_at: startAt });
      jobs.push({ action_type: "DEACTIVATE_DISCOUNT", scheduled_at: endAt });
    }

    return jobs.filter((job) => job.scheduled_at);
  }, [plan, startAt, endAt, discountValue]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");
    setPlan(null);
    try {
      const res = await (api.campaigns as any).generate(prompt);
      if (res.success && res.data) {
        const data = res.data as CampaignPlan;
        setPlan(data);
        setName(data.name);
        setDescription(data.description);
        setStartAt(data.start_at);
        setEndAt(data.end_at);
        setDiscountValue(data.discount_value);
      } else {
        setError(res.error || "Không thể phân tích yêu cầu này.");
      }
    } catch (err) {
      console.error(err);
      setError("Đã xảy ra lỗi khi gọi AI lập kế hoạch.");
    } finally {
      setLoading(false);
    }
  };

  const handleBannerUpload = async (index: number, file?: File | null) => {
    if (!file) return;
    setUploadingBannerIndex(index);
    setError("");
    try {
      const res = await (api.campaigns as any).uploadBanner(file);
      const imageUrl = String(res?.data?.image_url || res?.data?.url || "");
      if (!imageUrl) throw new Error("Backend không trả về URL ảnh.");
      setPlan((prev) => prev ? ({
        ...prev,
        contents: prev.contents.map((content, idx) =>
          idx === index ? { ...content, image_url: imageUrl } : content
        ),
      }) : prev);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Không thể upload ảnh banner.");
    } finally {
      setUploadingBannerIndex(null);
    }
  };

  const handleSave = async (status: "DRAFT" | "SCHEDULED") => {
    if (!isManual && !plan) return;
    if (status === "SCHEDULED" && plan?.contents?.some((item) => item.content_type === "BANNER" && !item.image_url?.trim())) {
      alert("Banner cần có Image URL trước khi phê duyệt & lên lịch.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name,
        description,
        campaign_type: isManual ? campaignType : plan?.campaign_type || "service",
        start_at: startAt,
        end_at: endAt,
        discount_value: discountValue,
        status,
        sourceType: isManual ? "MANUAL" : "AI",
        prompt,
        plan,
      };

      const res = await (api.campaigns as any).create(payload);
      if (res.success) {
        alert(status === "SCHEDULED" ? "Chiến dịch đã được duyệt và lên lịch thành công!" : "Chiến dịch đã được lưu dưới dạng Bản nháp.");
        router.push("/admin/campaigns");
      } else {
        alert("Lưu chiến dịch thất bại: " + res.error);
      }
    } catch (err) {
      console.error(err);
      alert("Đã xảy ra lỗi khi lưu chiến dịch.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout active="Chiến dịch AI">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/admin/campaigns"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-indigo-600 transition"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-[20px] font-semibold text-slate-900">
            {isManual ? "Tạo Chiến dịch thủ công" : "Tạo Chiến dịch bằng Trợ lý AI"}
          </h1>
          <p className="text-[12px] text-slate-500 mt-0.5">
            {isManual 
              ? "Điền thông tin chi tiết bên dưới để tạo chiến dịch tiếp thị mà không cần AI." 
              : "Nhập mô tả thô bằng ngôn ngữ tự nhiên để AI tự động cấu trúc sự kiện quảng bá."}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px] items-start">
        {/* Main Content Area */}
        <div className="space-y-6">
          {/* Prompt Entry Box (Only if not manual) */}
          {!isManual && (
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <form onSubmit={handleGenerate}>
                <label className="block text-[13px] font-bold text-slate-700 mb-2">Bạn mong muốn tạo sự kiện khuyến mãi như thế nào?</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ví dụ: Sắp tới có Flash Sale ngày 10/8, giảm 20% gói chụp cưới và 15% combo máy ảnh. Hãy lên kế hoạch giúp tôi."
                  className="w-full min-h-[100px] p-4 rounded-xl border border-slate-200 text-[13px] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-y"
                  disabled={loading || submitting}
                />
                <div className="flex justify-between items-center mt-3">
                  <span className="text-[11px] text-slate-400 font-medium"> Gợi ý: Ghi rõ ngày giờ, phần trăm giảm giá và loại sản phẩm để AI nhận diện tối ưu.</span>
                  <button
                    type="submit"
                    disabled={loading || !prompt.trim() || submitting}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-[13px] font-bold text-white shadow-md hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
                  >
                    {loading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        AI đang phân tích...
                      </>
                    ) : (
                      <>
                        Lập kế hoạch bằng AI
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl border border-red-100 bg-red-50 text-[12px] font-semibold text-red-600">
              {error}
            </div>
          )}

          {/* Configuration Form (Always shown if manual mode, or after AI generates a plan) */}
          {(isManual || plan) && (
            <div className="space-y-6 animate-fade-in-up">
              {/* Campaign configuration card */}
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="text-[14px] font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                  <svg className="h-4.5 w-4.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Thông tin kế hoạch chiến dịch
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Tên chiến dịch <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nhập tên chiến dịch..."
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-800 focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Mô tả chương trình <span className="text-red-500">*</span></label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Mô tả mục tiêu, hình thức áp dụng..."
                      className="w-full min-h-[60px] p-3 rounded-xl border border-slate-200 text-[13px] font-medium text-slate-600 focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Mốc giờ bắt đầu <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={startAt}
                      onChange={(e) => setStartAt(e.target.value)}
                      placeholder="Ví dụ: 2026-08-10 00:00"
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-[13px] text-slate-700 focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Mốc giờ kết thúc <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={endAt}
                      onChange={(e) => setEndAt(e.target.value)}
                      placeholder="Ví dụ: 2026-08-20 23:59"
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-[13px] text-slate-700 focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Mức giảm ưu đãi</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={discountValue}
                        onChange={(e) => {
                          const nextValue = Number(e.target.value);
                          setDiscountValue(nextValue);
                          setPlan((prev) => prev ? ({
                            ...prev,
                            discount_value: nextValue,
                            contents: prev.contents.map((content) => ({
                              ...content,
                              title: String(content.title || "").replace(/\b\d{1,3}(?:[.,]\d+)?\s*%/g, `${nextValue}%`),
                              content: String(content.content || "").replace(/\b\d{1,3}(?:[.,]\d+)?\s*%/g, `${nextValue}%`),
                            })),
                          }) : prev);
                        }}
                        className="w-full h-10 pl-3.5 pr-8 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-800 focus:border-indigo-500 outline-none"
                      />
                      <span className="absolute right-3.5 top-2.5 text-[13px] font-bold text-slate-400">
                        {isManual ? '%' : plan?.campaign_type === 'product' ? 'VND' : '%'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Phân loại áp dụng</label>
                    {isManual ? (
                      <select
                        value={campaignType}
                        onChange={(e) => setCampaignType(e.target.value)}
                        className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-[13px] text-slate-700 focus:border-indigo-500 outline-none font-medium"
                      >
                        <option value="service">Dịch vụ chụp ảnh</option>
                        <option value="product">Sản phẩm mua bán</option>
                        <option value="mixed">Hỗn hợp</option>
                      </select>
                    ) : (
                      <div className="h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[13px] text-slate-700 flex items-center font-medium capitalize">
                        {plan?.campaign_type === 'service' ? 'Dịch vụ chụp ảnh' : plan?.campaign_type === 'product' ? 'Sản phẩm mua bán' : 'Hỗn hợp'}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* AI Materials Card (only if plan exists) */}
              {!isManual && plan && (
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                  <h3 className="text-[14px] font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                    Nội dung bài đăng đề xuất (AI viết)
                  </h3>
                  <div className="space-y-4">
                    {plan.contents.map((item, index) => (
                      <div key={index} className="rounded-xl border border-slate-150 p-4 bg-slate-50/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="inline-flex rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 tracking-wider">
                            {item.content_type}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">AI Generated</span>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Tiêu đề</label>
                            <input
                              value={item.title}
                              onChange={(e) => setPlan((prev) => prev ? ({
                                ...prev,
                                contents: prev.contents.map((content, idx) => idx === index ? { ...content, title: e.target.value } : content),
                              }) : prev)}
                              className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-[12px] font-bold text-slate-800 outline-none focus:border-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Nội dung</label>
                            <textarea
                              value={item.content}
                              onChange={(e) => setPlan((prev) => prev ? ({
                                ...prev,
                                contents: prev.contents.map((content, idx) => idx === index ? { ...content, content: e.target.value } : content),
                              }) : prev)}
                              className="w-full min-h-[110px] p-3 rounded-lg border border-slate-200 bg-white text-[12px] leading-6 text-slate-600 outline-none focus:border-indigo-500 resize-y"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Ảnh / Banner</label>
                            <div className="flex flex-col gap-2 sm:flex-row">
                              <input
                                value={item.image_url || ""}
                                placeholder={item.content_type === "BANNER" ? "URL ảnh hoặc upload từ máy" : "Tùy chọn"}
                                onChange={(e) => setPlan((prev) => prev ? ({
                                  ...prev,
                                  contents: prev.contents.map((content, idx) => idx === index ? { ...content, image_url: e.target.value } : content),
                                }) : prev)}
                                className="min-w-0 flex-1 h-9 px-3 rounded-lg border border-slate-200 bg-white text-[12px] outline-none focus:border-indigo-500"
                              />
                              {item.content_type === "BANNER" && (
                                <label className="inline-flex h-9 cursor-pointer items-center justify-center rounded-lg bg-slate-900 px-3 text-[11px] font-bold text-white hover:bg-indigo-600 transition">
                                  {uploadingBannerIndex === index ? "Đang upload..." : "Chọn ảnh từ máy"}
                                  <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    disabled={uploadingBannerIndex !== null}
                                    onChange={(e) => {
                                      const file = e.target.files?.[0] || null;
                                      void handleBannerUpload(index, file);
                                      e.currentTarget.value = "";
                                    }}
                                  />
                                </label>
                              )}
                            </div>
                            {item.image_url && item.content_type === "BANNER" && (
                              <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                                <img src={item.image_url} alt="Banner preview" className="h-32 w-full object-cover" />
                              </div>
                            )}
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">CTA</label>
                              <input
                                value={item.cta_text || ""}
                                placeholder="VD: Đặt lịch ngay"
                                onChange={(e) => setPlan((prev) => prev ? ({
                                  ...prev,
                                  contents: prev.contents.map((content, idx) => idx === index ? { ...content, cta_text: e.target.value } : content),
                                }) : prev)}
                                className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-[12px] outline-none focus:border-indigo-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Đường dẫn CTA</label>
                              <input
                                value={item.cta_url || ""}
                                placeholder="VD: /photographer"
                                onChange={(e) => setPlan((prev) => prev ? ({
                                  ...prev,
                                  contents: prev.contents.map((content, idx) => idx === index ? { ...content, cta_url: e.target.value } : content),
                                }) : prev)}
                                className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-[12px] outline-none focus:border-indigo-500"
                              />
                            </div>
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Giờ đăng</label>
                              <input
                                type="datetime-local"
                                value={(item.publish_at || "").replace(" ", "T").slice(0, 16)}
                                onChange={(e) => setPlan((prev) => prev ? ({
                                  ...prev,
                                  contents: prev.contents.map((content, idx) => idx === index ? { ...content, publish_at: e.target.value } : content),
                                }) : prev)}
                                className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-[12px] outline-none focus:border-indigo-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Giờ gỡ</label>
                              <input
                                type="datetime-local"
                                value={(item.remove_at || "").replace(" ", "T").slice(0, 16)}
                                onChange={(e) => setPlan((prev) => prev ? ({
                                  ...prev,
                                  contents: prev.contents.map((content, idx) => idx === index ? { ...content, remove_at: e.target.value } : content),
                                }) : prev)}
                                className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-[12px] outline-none focus:border-indigo-500"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Schedules Card (only if plan exists) */}
              {!isManual && plan && (
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                  <h3 className="text-[14px] font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                    Lịch trình công việc tự động (Job Schedules)
                  </h3>
                  <div className="relative border-l border-slate-200 ml-3.5 pl-5 space-y-5 py-2">
                    {previewSchedules.map((job, idx) => (
                      <div key={idx} className="relative">
                        <span className="absolute -left-[27px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-indigo-600 shadow-sm" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] font-bold text-slate-800">{job.action_type}</span>
                            <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">Pending</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">Mốc chạy: {job.scheduled_at}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Info Panels */}
        <aside className="space-y-6">
          {/* Target groups (only for AI plan) */}
          {!isManual && plan && (
            <div className="rounded-2xl border border-slate-100 bg-slate-900 text-white p-5 shadow-md relative overflow-hidden">
              <div className="absolute right-[-40px] top-[-40px] h-[120px] w-[120px] rounded-full bg-indigo-500/20 blur-2xl" />
              <h4 className="text-[12px] font-black uppercase tracking-wider text-indigo-300"> Khách hàng mục tiêu</h4>
              <p className="text-[13px] font-bold mt-3 leading-snug">{plan.target_group}</p>
              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">Bộ lọc điều kiện đã được AI biên dịch sang quy tắc SQL để gửi email/thông báo chính xác.</p>
            </div>
          )}

          {/* Predictions block (only for AI plan) */}
          {!isManual && plan && (
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <h4 className="text-[12px] font-bold uppercase tracking-wider text-slate-400 mb-3.5"> Dự báo hiệu quả (Kỳ vọng)</h4>
              <div className="space-y-3.5">
                {[
                  { label: "Lượt hiển thị dự kiến", value: plan.projection.views.toLocaleString() },
                  { label: "Lượt click dự kiến", value: plan.projection.clicks.toLocaleString() },
                  { label: "Tỷ lệ chuyển đổi", value: `${plan.projection.conversion_rate}%` },
                  { label: "Số lượng đơn hàng/booking", value: plan.campaign_type === 'product' ? plan.projection.orders : plan.campaign_type === 'service' ? plan.projection.bookings : `${plan.projection.bookings} bookings + ${plan.projection.orders} orders` },
                  { label: "Doanh thu dự tính", value: `${plan.projection.revenue.toLocaleString()}đ`, highlight: true }
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-baseline border-b border-slate-50 pb-2.5 last:border-0 last:pb-0">
                    <span className="text-[11px] text-slate-500 font-medium">{item.label}</span>
                    <span className={`text-[13px] font-bold ${item.highlight ? "text-[#ff8d28]" : "text-slate-800"}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action panels */}
          {isManual || plan ? (
            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm space-y-2">
              <button
                type="button"
                onClick={() => handleSave("SCHEDULED")}
                disabled={submitting}
                className="w-full inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 text-white text-[13px] font-bold shadow-md hover:bg-indigo-700 transition disabled:opacity-60"
              >
                {submitting ? "Đang xử lý..." : isManual ? "Kích hoạt & Lên lịch" : "Phê duyệt & Lên lịch (Scheduled)"}
              </button>
              <button
                type="button"
                onClick={() => handleSave("DRAFT")}
                disabled={submitting}
                className="w-full inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-[13px] font-bold hover:bg-slate-50 transition disabled:opacity-60"
              >
                {submitting ? "Đang xử lý..." : "Lưu bản nháp (Draft)"}
              </button>
              {!isManual && (
                <button
                  type="button"
                  onClick={() => {
                    setPlan(null);
                    setError("");
                  }}
                  disabled={submitting}
                  className="w-full inline-flex h-10 items-center justify-center gap-2 rounded-xl text-red-600 text-[13px] font-bold hover:bg-red-50 transition disabled:opacity-60"
                >
                  Hủy bỏ & Viết lại prompt
                </button>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm text-center">
              <h5 className="text-[13px] font-bold text-slate-800">Quy tắc an toàn</h5>
              <p className="text-[11px] leading-relaxed text-slate-400 mt-1.5">Hệ thống Scheduler chỉ tự động kích hoạt đăng banner và áp dụng giảm giá khi chiến dịch ở trạng thái APPROVED/SCHEDULED (Đã được Admin duyệt).</p>
            </div>
          )}
        </aside>
      </div>
    </AdminLayout>
  );
}

export default function CreateCampaignPage() {
  return (
    <Suspense fallback={
      <AdminLayout active="Chiến dịch AI">
        <div className="py-20 text-center text-slate-500">Đang tải dữ liệu...</div>
      </AdminLayout>
    }>
      <CreateCampaignForm />
    </Suspense>
  );
}
