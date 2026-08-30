"use client";

import { useEffect, useState } from "react";
import AdminLayout from "../../_components/admin-layout";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api } from "../_campaign-api";

type CampaignDetails = {
  id: string;
  name: string;
  description: string;
  campaign_type: "service" | "product" | "hybrid";
  start_at: string;
  end_at: string;
  status: "DRAFT" | "AI_GENERATED" | "PENDING_APPROVAL" | "REJECTED" | "APPROVED" | "SCHEDULED" | "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED" | "FAILED";
  created_by: string;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  predicted_reach?: number;
  predicted_clicks?: number;
  predicted_revenue?: number;
  contents: Array<{
    content_type: string;
    title: string;
    content: string;
    image_url?: string;
    ai_generated?: boolean;
  }>;
  promotions: Array<{
    discount_type: string;
    discount_value: number;
    target_type: string;
    target_ids: string;
  }>;
  schedules: Array<{
    id?: string | number;
    action_type: string;
    scheduled_at: string;
    executed_at: string | null;
    status: "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED" | "CANCELLED";
    error_message?: string | null;
    attempts?: number;
    max_attempts?: number;
    result?: any;
  }>;
  audience: {
    audience_type: string;
    conditions: string;
  };
  metrics: {
    views: number;
    clicks: number;
    bookings: number;
    orders: number;
    revenue: number;
    conversion_rate: number;
  };
};

type CampaignReport = {
  executive_summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string;
};

const statusConfig: Record<CampaignDetails["status"], { label: string; bg: string; text: string }> = {
  DRAFT: { label: "Bản nháp", bg: "bg-slate-100", text: "text-slate-700" },
  AI_GENERATED: { label: "AI Đề xuất", bg: "bg-indigo-50", text: "text-indigo-700" },
  PENDING_APPROVAL: { label: "Chờ duyệt", bg: "bg-amber-50", text: "text-amber-700" },
  REJECTED: { label: "Bị từ chối", bg: "bg-red-50", text: "text-red-700" },
  APPROVED: { label: "Đã duyệt", bg: "bg-emerald-50", text: "text-emerald-700" },
  SCHEDULED: { label: "Đã lên lịch", bg: "bg-blue-50", text: "text-blue-700" },
  ACTIVE: { label: "Đang chạy", bg: "bg-pink-50 text-pink-700 animate-pulse", text: "text-pink-700" },
  PAUSED: { label: "Tạm dừng", bg: "bg-yellow-50", text: "text-yellow-700" },
  COMPLETED: { label: "Đã hoàn thành", bg: "bg-purple-50", text: "text-purple-700" },
  CANCELLED: { label: "Đã hủy", bg: "bg-gray-150", text: "text-gray-600" },
  FAILED: { label: "Đăng lỗi", bg: "bg-red-50", text: "text-red-700" },
};

const actionLabels: Record<string, string> = {
  PUBLISH_BANNER: "Đăng Banner Trang Chủ",
  PUBLISH_POST: "Đăng Bài Viết Blog",
  PUBLISH_CONTENT: "Đăng Nội dung Nội bộ",
  ACTIVATE_DISCOUNT: "Kích Hoạt Mã Giảm Giá",
  SEND_NOTIFICATION: "Gửi Thông Báo Hệ Thống",
  SEND_EMAIL: "Gửi Email Quảng Bá",
  DEACTIVATE_DISCOUNT: "Gỡ Bỏ Ưu Đãi Giảm Giá",
  REMOVE_BANNER: "Gỡ Banner Trang Chủ",
};

export default function CampaignDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<CampaignDetails | null>(null);
  const [report, setReport] = useState<CampaignReport | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const loadDetails = async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const res = await (api.campaigns as any).getById(id);
      if (res.success && res.data) {
        setDetails(res.data);
        if (res.data.status === "COMPLETED") {
          loadReport();
        }
      } else {
        alert("Lỗi tải chi tiết: " + res.error);
        router.push("/admin/campaigns");
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  const loadReport = async () => {
    setLoadingReport(true);
    try {
      const res = await (api.campaigns as any).getReport(id);
      if (res.success && res.data) {
        setReport(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingReport(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    void loadDetails(true);

    const refresh = () => {
      if (document.visibilityState === "visible") void loadDetails(false);
    };
    const intervalId = window.setInterval(refresh, 5000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [id]);

  const handleReplaceBanner = async (file?: File) => {
    if (!details || !file) return;
    setUploadingBanner(true);
    try {
      const res = await (api.campaigns as any).uploadBannerForCampaign(details.id, file);
      if (!res?.success) throw new Error(res?.message || res?.error || "Không thể cập nhật ảnh banner.");
      await loadDetails(false);
      alert("Đã cập nhật ảnh banner. Nếu chiến dịch đang chạy, ảnh mới sẽ được áp dụng ngay.");
    } catch (err: any) {
      alert(err?.message || "Không thể cập nhật ảnh banner.");
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleApprove = async () => {
    if (!details) return;
    setActionLoading(true);
    try {
      const res = await (api.campaigns as any).approve(details.id);
      if (res.success) {
        alert("Chiến dịch đã được duyệt và chuyển sang trạng thái SCHEDULED (Đã lên lịch) thành công!");
        void loadDetails(false);
      } else {
        alert("Duyệt thất bại: " + res.error);
      }
    } catch (err) {
      console.error(err);
      alert("Đã xảy ra lỗi khi duyệt.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout active="Chiến dịch AI">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-slate-500 text-[13px]">Đang tải thông tin chi tiết chiến dịch...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!details) return null;
  const status = statusConfig[details.status] || { label: details.status, bg: "bg-slate-100", text: "text-slate-700" };

  return (
    <AdminLayout active="Chiến dịch AI">
      {/* Header section */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-150 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/campaigns"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-indigo-600 transition"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[20px] font-semibold text-slate-900">{details.name}</h1>
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${status.bg} ${status.text}`}>
                {status.label}
              </span>
            </div>
            <p className="text-[12px] text-slate-500 mt-0.5">{details.description}</p>
          </div>
        </div>

        {/* Quick approval action controls */}
        {details.status === "PENDING_APPROVAL" && (
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleApprove}
              disabled={actionLoading}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-indigo-600 px-5 text-[13px] font-bold text-white shadow-md hover:bg-indigo-700 transition disabled:opacity-60"
            >
              {actionLoading ? "Đang xử lý..." : "Duyệt & Lên lịch (Scheduled)"}
            </button>
            <button
              onClick={async () => {
                if (confirm("Bạn có muốn từ chối chiến dịch này không?")) {
                  await (api.campaigns as any).delete(details.id);
                  router.push("/admin/campaigns");
                }
              }}
              disabled={actionLoading}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-[13px] font-bold text-red-600 hover:bg-red-50 transition disabled:opacity-60"
            >
              Từ chối / Xóa
            </button>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px] items-start">
        {/* Left main area */}
        <div className="space-y-6">
          {/* Post-Campaign Report Block */}
          {details.status === "COMPLETED" && (
            <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-white to-indigo-50/20 p-5 shadow-sm relative overflow-hidden">
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-indigo-500/10 blur-xl" />
              <h3 className="text-[15px] font-bold text-indigo-950 border-b border-indigo-100/50 pb-3 mb-4 flex items-center gap-2">
                Báo cáo đánh giá bằng AI (Post-Campaign Insights)
              </h3>

              {loadingReport ? (
                <div className="py-8 text-center text-slate-500 text-[12px]">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent mx-auto mb-2"></div>
                  AI đang tổng hợp và phân tích dữ liệu chiến dịch...
                </div>
              ) : report ? (
                <div className="space-y-4 text-[12px] text-slate-700 leading-relaxed">
                  <div>
                    <h4 className="font-bold text-indigo-900 mb-1"> Tóm tắt chiến dịch</h4>
                    <p className="text-slate-600 bg-white/70 p-3 rounded-xl border border-slate-100">{report.executive_summary}</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <h4 className="font-bold text-emerald-800 mb-1 flex items-center gap-1"> Điểm mạnh đạt được</h4>
                      <ul className="list-disc list-inside space-y-1 text-slate-600 bg-white/70 p-3 rounded-xl border border-slate-100 h-full">
                        {report.strengths.map((str, idx) => <li key={idx}>{str}</li>)}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-800 mb-1 flex items-center gap-1"> Điểm yếu / Hạn chế</h4>
                      <ul className="list-disc list-inside space-y-1 text-slate-600 bg-white/70 p-3 rounded-xl border border-slate-100 h-full">
                        {report.weaknesses.map((weak, idx) => <li key={idx}>{weak}</li>)}
                      </ul>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-indigo-900 mb-1"> Khuyến nghị cho chiến dịch tới</h4>
                    <p className="text-slate-600 bg-white/70 p-3 rounded-xl border border-slate-100">{report.recommendations}</p>
                  </div>
                </div>
              ) : (
                <p className="text-[12px] text-slate-500 italic">Không tìm thấy báo cáo phân tích.</p>
              )}
            </div>
          )}

          {/* Actual vs Projected Performance Metrics Graphs */}
          {details.status === "COMPLETED" && (
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <h3 className="text-[14px] font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                So sánh hiệu quả thực tế với dự báo AI
              </h3>

              <div className="grid gap-5 sm:grid-cols-3">
                {[
                  { label: "Lượt hiển thị (Views)", actual: details.metrics.views, projected: Number(details.predicted_reach || 0) },
                  { label: "Lượt tương tác (Clicks)", actual: details.metrics.clicks, projected: Number(details.predicted_clicks || 0) },
                  { label: "Doanh thu đem lại", actual: details.metrics.revenue, projected: Number(details.predicted_revenue || 0), money: true }
                ].map((item, index) => {
                  const pct = item.projected > 0 ? Math.min(Math.round((item.actual / item.projected) * 100), 180) : 0;
                  return (
                    <div key={index} className="rounded-xl border border-slate-100 p-4 bg-slate-50/20">
                      <span className="text-[11px] text-slate-500 font-medium">{item.label}</span>
                      <div className="mt-3 space-y-2">
                        <div>
                          <div className="flex justify-between text-[11px] text-slate-400 font-semibold mb-1">
                            <span>Dự báo AI</span>
                            <span>{item.money ? `${item.projected.toLocaleString()}đ` : item.projected.toLocaleString()}</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-slate-300 rounded-full" style={{ width: "100%" }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-[11px] font-bold text-indigo-700 mb-1">
                            <span>Thực tế</span>
                            <span>{item.money ? `${item.actual.toLocaleString()}đ` : item.actual.toLocaleString()} ({pct}%)</span>
                          </div>
                          <div className="h-1.5 w-full bg-indigo-50 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${Math.min(pct, 100)}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Marketing Content list */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h3 className="text-[14px] font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
              Tư liệu truyền thông (Marketing Copywriting)
            </h3>
            <div className="space-y-4">
              {details.contents.map((item, index) => (
                <div key={index} className="rounded-xl border border-slate-150 p-4 bg-slate-50/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex rounded bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 tracking-wider">
                      {item.content_type}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {item.ai_generated ? " AI Generated" : "Chỉnh sửa thủ công"}
                    </span>
                  </div>
                  {["BANNER", "EMAIL"].includes(String(item.content_type).toUpperCase()) && item.image_url && (
                    <div className="mb-3">
                      <img
                        src={item.image_url}
                        alt={item.title || (String(item.content_type).toUpperCase() === "EMAIL" ? "Campaign email" : "Campaign banner")}
                        className="h-40 w-full rounded-xl border border-slate-100 object-cover"
                      />
                      {String(item.content_type).toUpperCase() === "EMAIL" && (
                        <p className="mt-1.5 text-[10px] text-slate-400">Ảnh được nhúng vào template Email Studion.</p>
                      )}
                    </div>
                  )}
                  <h4 className="text-[13px] font-bold text-slate-800 mb-1.5">{item.title}</h4>
                  <p className="text-[12px] leading-6 text-slate-600 whitespace-pre-line">{item.content}</p>
                  {item.content_type === "BANNER" && (
                    <label className="mt-3 inline-flex cursor-pointer items-center rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-[11px] font-bold text-indigo-700 transition hover:bg-indigo-100">
                      {uploadingBanner ? "Đang tải ảnh..." : "Cập nhật ảnh banner từ máy"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        disabled={uploadingBanner}
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) void handleReplaceBanner(file);
                          event.currentTarget.value = "";
                        }}
                      />
                    </label>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar details */}
        <aside className="space-y-6">
          {/* Campaign summary info card */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h4 className="text-[12px] font-bold uppercase tracking-wider text-slate-400 mb-3.5"> Thông tin chung</h4>
            <div className="space-y-3.5 text-[12px]">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Người khởi tạo:</span>
                <span className="font-bold text-slate-800">{details.created_by}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Bắt đầu:</span>
                <span className="font-bold text-slate-800">{details.start_at}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Kết thúc:</span>
                <span className="font-bold text-slate-800">{details.end_at}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Phân loại áp dụng:</span>
                <span className="font-bold text-slate-800 capitalize">
                  {details.campaign_type === 'service' ? 'Dịch vụ' : details.campaign_type === 'product' ? 'Thiết bị' : 'Hỗn hợp'}
                </span>
              </div>
              {details.promotions[0] && (
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">Ưu đãi kích hoạt:</span>
                  <span className="font-black text-indigo-600">
                    Giảm {details.promotions[0].discount_value}{details.promotions[0].discount_type === 'percentage' ? '%' : 'đ'} ({details.promotions[0].target_ids})
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* target audience */}
          <div className="rounded-2xl border border-slate-100 bg-slate-900 text-white p-5 shadow-md">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-indigo-300"> Tệp khách hàng mục tiêu</h4>
            <div className="mt-3 space-y-2 text-[12px]">
              <div className="font-bold">{details.audience.audience_type}</div>
              <p className="text-slate-400 leading-normal text-[11px]">{details.audience.conditions}</p>
            </div>
          </div>

          {/* Job Scheduler logs */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h4 className="text-[12px] font-bold uppercase tracking-wider text-slate-400 mb-3.5"> Tiến trình chạy tự động (Scheduler Log)</h4>
            {(() => {
              const finished = details.schedules.filter((job) => job.status === "SUCCESS").length;
              const total = details.schedules.length;
              const pct = total ? Math.round((finished / total) * 100) : 0;
              return (
                <>
                  <div className="mb-4">
                    <div className="mb-1 flex items-center justify-between text-[10px] font-bold text-slate-500">
                      <span>Đã hoàn tất {finished}/{total} tác vụ</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-indigo-600 transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="relative border-l border-slate-200 ml-3 pl-4 space-y-4 py-1 text-[12px]">
                    {details.schedules.map((job, idx) => {
                      const label =
                        job.status === "SUCCESS" ? "Đã xong" :
                        job.status === "PROCESSING" ? "Đang chạy" :
                        job.status === "FAILED" ? "Lỗi" :
                        job.status === "CANCELLED" ? "Đã hủy" : "Chờ chạy";
                      const dotClass =
                        job.status === "SUCCESS" ? "bg-emerald-600" :
                        job.status === "PROCESSING" ? "bg-indigo-600 animate-pulse" :
                        job.status === "FAILED" ? "bg-red-500" :
                        job.status === "CANCELLED" ? "bg-slate-400" : "bg-slate-300";
                      const badgeClass =
                        job.status === "SUCCESS" ? "bg-emerald-50 text-emerald-700" :
                        job.status === "PROCESSING" ? "bg-indigo-50 text-indigo-700" :
                        job.status === "FAILED" ? "bg-red-50 text-red-700" :
                        "bg-slate-100 text-slate-600";

                      return (
                        <div key={job.id || idx} className="relative">
                          <span className={`absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border border-white ${dotClass}`} />
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <div className="font-bold text-slate-800 leading-tight">{actionLabels[job.action_type] || job.action_type}</div>
                              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-black ${badgeClass}`}>{label}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5">Đặt lịch: {job.scheduled_at}</p>
                            {job.executed_at && (
                              <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Đã chạy: {job.executed_at}</p>
                            )}
                            {job.status === "PROCESSING" && (
                              <p className="text-[10px] text-indigo-600 font-semibold mt-0.5">Worker đang xử lý tác vụ này...</p>
                            )}
                            {job.error_message && (
                              <p className="mt-1 rounded-md bg-red-50 px-2 py-1 text-[10px] text-red-700">{job.error_message}</p>
                            )}
                            {job.result?.recipients !== undefined && (
                              <p className="mt-1 text-[10px] text-slate-500">Đối tượng: {job.result.recipients} · Thành công: {job.result.inserted ?? job.result.sent ?? "-"}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}
          </div>
        </aside>
      </div>
    </AdminLayout>
  );
}
