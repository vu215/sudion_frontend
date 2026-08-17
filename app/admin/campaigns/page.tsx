"use client";

import { useState, useEffect, useMemo } from "react";
import AdminLayout from "../_components/admin-layout";
import { AdminIcon } from "../_components/admin-icons";
import Link from "next/link";
import { api } from "./_campaign-api";

type Campaign = {
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
};

const statusConfig: Record<Campaign["status"], { label: string; bg: string; text: string }> = {
  DRAFT: { label: "Bản nháp", bg: "bg-slate-100", text: "text-slate-700" },
  AI_GENERATED: { label: "AI Đề xuất", bg: "bg-indigo-50", text: "text-indigo-700" },
  PENDING_APPROVAL: { label: "Chờ duyệt", bg: "bg-amber-50", text: "text-amber-700" },
  REJECTED: { label: "Bị từ chối", bg: "bg-red-50", text: "text-red-700" },
  APPROVED: { label: "Đã duyệt", bg: "bg-emerald-50", text: "text-emerald-700" },
  SCHEDULED: { label: "Đã lên lịch", bg: "bg-blue-50", text: "text-blue-700" },
  ACTIVE: { label: "Đang chạy", bg: "bg-pink-50 text-pink-700 animate-pulse", text: "text-pink-700" },
  PAUSED: { label: "Tạm dừng", bg: "bg-yellow-50", text: "text-yellow-700" },
  COMPLETED: { label: "Đã hoàn thành", bg: "bg-purple-50", text: "text-purple-700" },
  CANCELLED: { label: "Đã hủy", bg: "bg-gray-100", text: "text-gray-600" },
  FAILED: { label: "Đăng lỗi", bg: "bg-red-50", text: "text-red-700" },
};

const typeLabels = {
  service: "Dịch vụ",
  product: "Sản phẩm",
  hybrid: "Hỗn hợp",
};

export default function CampaignsListPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const res = await (api.campaigns as any).getAll();
      if (res.success && res.data) {
        setCampaigns(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Bạn có chắc chắn muốn xóa chiến dịch này không?")) return;
    try {
      const res = await (api.campaigns as any).delete(id);
      if (res.success) {
        loadCampaigns();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // KPI Calculations
  const stats = useMemo(() => {
    return {
      total: campaigns.length,
      scheduled: campaigns.filter(c => c.status === "SCHEDULED" || c.status === "APPROVED").length,
      active: campaigns.filter(c => c.status === "ACTIVE").length,
      pending: campaigns.filter(c => c.status === "PENDING_APPROVAL").length,
      completed: campaigns.filter(c => c.status === "COMPLETED").length,
    };
  }, [campaigns]);

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(c => {
      const matchesStatus = filterStatus === "ALL" || c.status === filterStatus;
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [campaigns, filterStatus, searchTerm]);

  return (
    <AdminLayout active="Chiến dịch AI">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[24px] font-semibold text-slate-900">Chiến dịch tiếp thị AI & Tự động hoá</h1>
          <p className="text-[13px] text-slate-500 mt-1">Lên lịch các chương trình khuyến mãi, đăng banner và gửi tin thông báo hàng loạt qua AI.</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/admin/campaigns/create"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-[13px] font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition"
          >
            Tạo chiến dịch bằng AI
          </Link>
          <Link
            href="/admin/campaigns/create?mode=manual"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Tạo thủ công
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-5 mb-6">
        {[
          { label: "Tổng chiến dịch", value: stats.total, color: "bg-slate-50 text-slate-800" },
          { label: "Chờ duyệt", value: stats.pending, color: "bg-amber-50 text-amber-700" },
          { label: "Đã lên lịch", value: stats.scheduled, color: "bg-blue-50 text-blue-700" },
          { label: "Đang chạy", value: stats.active, color: "bg-pink-50 text-pink-700" },
          { label: "Hoàn thành", value: stats.completed, color: "bg-purple-50 text-purple-700" },
        ].map((item, idx) => (
          <div key={idx} className={`rounded-2xl p-4 border border-slate-100 bg-white shadow-sm flex flex-col justify-between min-h-[90px]`}>
            <span className="text-[12px] text-slate-500 font-medium">{item.label}</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-[24px] font-bold tracking-tight">{item.value}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.color}`}>KPI</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filtering and search bar */}
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex flex-wrap gap-1">
          {["ALL", "PENDING_APPROVAL", "SCHEDULED", "ACTIVE", "COMPLETED", "DRAFT"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3.5 py-1.5 rounded-xl text-[12px] font-semibold transition ${filterStatus === status
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-50"
                }`}
            >
              {status === "ALL" ? "Tất cả" : statusConfig[status as Campaign["status"]]?.label || status}
            </button>
          ))}
        </div>
        <div className="relative min-w-[280px]">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm chiến dịch..."
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 text-[12px] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            style={{ paddingLeft: '36px' }}
          />
          <svg className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Table grid */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mx-auto"></div>
              <p className="mt-3 text-slate-500 text-[12px]">Đang tải danh sách chiến dịch...</p>
            </div>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center p-6 text-center">
            <h3 className="text-[14px] font-semibold text-slate-800">Không tìm thấy chiến dịch</h3>
            <p className="text-slate-500 text-[12px] max-w-sm mt-1">Chưa có chiến dịch tiếp thị nào phù hợp với bộ lọc hiện tại của bạn.</p>
            <Link href="/admin/campaigns/create" className="mt-4 inline-flex h-9 items-center justify-center rounded-xl bg-indigo-600 px-4 text-[12px] font-bold text-white shadow-md hover:bg-indigo-700 transition">
              Tạo chiến dịch đầu tiên
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3.5">Mã / Tên chiến dịch</th>
                  <th className="px-5 py-3.5">Phân loại</th>
                  <th className="px-5 py-3.5">Thời gian diễn ra</th>
                  <th className="px-5 py-3.5">Trạng thái</th>
                  <th className="px-5 py-3.5">Người duyệt / Ghi chú</th>
                  <th className="px-5 py-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[12px]">
                {filteredCampaigns.map((camp) => {
                  const status = statusConfig[camp.status] || { label: camp.status, bg: "bg-slate-100", text: "text-slate-700" };
                  return (
                    <tr key={camp.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-5 py-4">
                        <Link href={`/admin/campaigns/${camp.id}`} className="block group">
                          <b className="text-slate-900 group-hover:text-indigo-600 transition truncate block max-w-xs">{camp.name}</b>
                          <span className="text-slate-400 text-[11px] block mt-0.5 max-w-xs truncate">{camp.description}</span>
                        </Link>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                          <span className={`h-1.5 w-1.5 rounded-full ${camp.campaign_type === 'service' ? 'bg-indigo-500' : camp.campaign_type === 'product' ? 'bg-amber-500' : 'bg-emerald-500'
                            }`} />
                          {typeLabels[camp.campaign_type]}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-800">{camp.start_at}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">đến {camp.end_at}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${status.bg} ${status.text}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {camp.approved_by ? (
                          <div>
                            <span className="font-semibold">{camp.approved_by}</span>
                            <span className="block text-[10px] text-slate-400 mt-0.5">{camp.approved_at}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Chưa phê duyệt</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/campaigns/${camp.id}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50 transition"
                            title="Xem chi tiết & Báo cáo"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>
                          <button
                            onClick={(e) => handleDelete(camp.id, e)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-red-600 hover:border-red-100 hover:bg-red-50 transition"
                            title="Xóa chiến dịch"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
