"use client";

import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../_components/admin-layout";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type PhotographerApproval = {
  id: number;
  user_id: number;
  full_name: string;
  email: string;
  phone: string;
  avatar_url: string | null;
  bio: string | null;
  active_area: string | null;
  categories: string | null;
  min_price: number | string | null;
  package_count: number | string | null;
  verification_status: "pending" | "verified" | "rejected" | string;
  user_role?: string;
  user_email?: string;
  user_full_name?: string;
  created_at?: string;
};

type ServicePackage = {
  id: number;
  name?: string;
  package_name?: string;
  price?: number | string;
  base_price?: number | string;
  package_price?: number | string;
  description?: string;
  category_id?: number;
  service_category_id?: number;
  verified?: number;
};

type DetailData = {
  photographer: PhotographerApproval;
  packages: ServicePackage[];
};

function getToken() {
  if (typeof window === "undefined") return "";

  return (
    window.localStorage.getItem("sudion_token") ||
    window.localStorage.getItem("sudion_auth_token") ||
    window.localStorage.getItem("token") ||
    ""
  );
}

async function requestApi<T>(path: string, options: RequestInit = {}) {
  const token = getToken();

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    cache: "no-store",
  });

  const json = await response.json().catch(() => null);

  if (!response.ok || json?.success === false) {
    throw new Error(json?.message || "Lỗi API.");
  }

  return json.data as T;
}

function formatMoney(value?: number | string | null) {
  return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
}

function statusText(status: string) {
  if (status === "verified") return "Đã duyệt";
  if (status === "rejected") return "Từ chối";
  return "Chờ duyệt";
}

function statusClass(status: string) {
  if (status === "verified") return "bg-emerald-50 text-emerald-700";
  if (status === "rejected") return "bg-red-50 text-red-600";
  return "bg-orange-50 text-orange-700";
}

export default function PhotographerApprovalsPage() {
  const [items, setItems] = useState<PhotographerApproval[]>([]);
  const [status, setStatus] = useState("pending");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [detail, setDetail] = useState<DetailData | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionId, setActionId] = useState<number | null>(null);

  const stats = useMemo(() => {
    return {
      total: items.length,
      pending: items.filter((item) => item.verification_status === "pending")
        .length,
      verified: items.filter((item) => item.verification_status === "verified")
        .length,
      rejected: items.filter((item) => item.verification_status === "rejected")
        .length,
    };
  }, [items]);

  function notify(text: string) {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 2400);
  }

  async function loadData(nextStatus = status) {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.set("status", nextStatus);

      if (keyword.trim()) params.set("keyword", keyword.trim());

      const data = await requestApi<PhotographerApproval[]>(
        `/admin/photographer-approvals?${params.toString()}`
      );

      setItems(data || []);
    } catch (error) {
      notify(
        error instanceof Error
          ? error.message
          : "Không tải được danh sách duyệt photographer."
      );
    } finally {
      setLoading(false);
    }
  }

  async function openDetail(id: number) {
    try {
      setDetailLoading(true);

      const data = await requestApi<DetailData>(
        `/admin/photographer-approvals/${id}`
      );

      setDetail(data);
    } catch (error) {
      notify(
        error instanceof Error ? error.message : "Không tải được chi tiết."
      );
    } finally {
      setDetailLoading(false);
    }
  }

  async function approve(item: PhotographerApproval) {
    const ok = window.confirm(
      `Duyệt hồ sơ "${item.full_name}" và chuyển user này thành tài khoản photographer?`
    );

    if (!ok) return;

    try {
      setActionId(item.id);

      await requestApi(`/admin/photographer-approvals/${item.id}/approve`, {
        method: "PATCH",
        body: JSON.stringify({
          note: "Admin duyệt hồ sơ photographer.",
        }),
      });

      notify("Đã duyệt photographer. User đã được chuyển sang tài khoản photo.");
      setDetail(null);
      await loadData();
    } catch (error) {
      notify(error instanceof Error ? error.message : "Duyệt thất bại.");
    } finally {
      setActionId(null);
    }
  }

  async function reject(item: PhotographerApproval) {
    const reason = window.prompt("Nhập lý do từ chối:", "Hồ sơ chưa đạt yêu cầu.");

    if (reason === null) return;

    try {
      setActionId(item.id);

      await requestApi(`/admin/photographer-approvals/${item.id}/reject`, {
        method: "PATCH",
        body: JSON.stringify({
          reason,
        }),
      });

      notify("Đã từ chối hồ sơ photographer.");
      setDetail(null);
      await loadData();
    } catch (error) {
      notify(error instanceof Error ? error.message : "Từ chối thất bại.");
    } finally {
      setActionId(null);
    }
  }

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AdminLayout active="Duyệt photo" search={keyword} onSearch={setKeyword}>
      {message ? (
        <div className="fixed right-6 top-20 z-[9999] rounded-2xl bg-[#111827] px-5 py-3 text-sm font-bold text-white shadow-2xl">
          {message}
        </div>
      ) : null}

      <div>
        <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h1 className="text-[24px] font-semibold">
              Duyệt hồ sơ nhiếp ảnh gia
            </h1>
            <p className="mt-1 text-[12px] text-[#697086]">
              Admin duyệt/từ chối hồ sơ. Khi duyệt, user sẽ được chuyển sang
              role photographer và mở dashboard photo.
            </p>
          </div>

          <button
            onClick={() => void loadData()}
            className="h-10 rounded-xl bg-[#ff8d28] px-4 text-sm font-bold text-white"
          >
            Làm mới
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Stat title="Tổng hồ sơ" value={stats.total} />
          <Stat title="Chờ duyệt" value={stats.pending} tone="orange" />
          <Stat title="Đã duyệt" value={stats.verified} tone="green" />
          <Stat title="Từ chối" value={stats.rejected} tone="red" />
        </div>

        <section className="mt-4 rounded-2xl border border-[#e7e9f1] bg-white p-4 shadow-[0_14px_34px_rgba(12,18,32,0.04)]">
          <div className="mb-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_120px]">
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Tìm tên, email, category..."
              className="h-10 rounded-xl border border-[#dfe3ec] px-3 text-sm outline-none focus:border-[#ff8d28]"
            />

            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                void loadData(event.target.value);
              }}
              className="h-10 rounded-xl border border-[#ffd2ad] px-3 text-sm font-bold text-[#ff8d28] outline-none"
            >
              <option value="pending">Chờ duyệt</option>
              <option value="verified">Đã duyệt</option>
              <option value="rejected">Từ chối</option>
              <option value="all">Tất cả</option>
            </select>

            <button
              onClick={() => void loadData()}
              className="h-10 rounded-xl bg-[#111827] px-4 text-sm font-bold text-white"
            >
              Lọc
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#e6e9f1]">
            <table className="w-full min-w-[1000px] text-left text-[12px]">
              <thead className="bg-[#fbfcfe] text-[#536078]">
                <tr>
                  <th className="px-3 py-3">Photographer</th>
                  <th className="px-3 py-3">Liên hệ</th>
                  <th className="px-3 py-3">Khu vực</th>
                  <th className="px-3 py-3">Category</th>
                  <th className="px-3 py-3">Giá từ</th>
                  <th className="px-3 py-3">Role user</th>
                  <th className="px-3 py-3">Trạng thái</th>
                  <th className="px-3 py-3">Thao tác</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#edf0f5]">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-3 py-8 text-center">
                      Đang tải...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-3 py-8 text-center text-[#697086]"
                    >
                      Không có hồ sơ nào.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="bg-white hover:bg-[#fff8f1]">
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.avatar_url || "/Overlay+Shadow.png"}
                            alt=""
                            className="h-10 w-10 rounded-full object-cover"
                          />
                          <div>
                            <b>{item.full_name || item.user_full_name}</b>
                            <p className="text-[#697086]">ID #{item.id}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-3">
                        <p>{item.email || item.user_email || "—"}</p>
                        <p className="text-[#697086]">{item.phone || "—"}</p>
                      </td>

                      <td className="px-3 py-3">
                        {item.active_area || "—"}
                      </td>

                      <td className="px-3 py-3">
                        {item.categories || "—"}
                      </td>

                      <td className="px-3 py-3 font-bold text-[#ff8d28]">
                        {formatMoney(item.min_price)}
                      </td>

                      <td className="px-3 py-3">
                        {item.user_role || "—"}
                      </td>

                      <td className="px-3 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${statusClass(
                            item.verification_status
                          )}`}
                        >
                          {statusText(item.verification_status)}
                        </span>
                      </td>

                      <td className="px-3 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => void openDetail(item.id)}
                            className="rounded-lg border border-slate-200 px-3 py-2 font-bold text-slate-600 hover:bg-slate-50"
                          >
                            Xem
                          </button>

                          {item.verification_status !== "verified" ? (
                            <button
                              onClick={() => void approve(item)}
                              disabled={actionId === item.id}
                              className="rounded-lg bg-emerald-600 px-3 py-2 font-bold text-white disabled:opacity-60"
                            >
                              Duyệt
                            </button>
                          ) : null}

                          {item.verification_status !== "rejected" ? (
                            <button
                              onClick={() => void reject(item)}
                              disabled={actionId === item.id}
                              className="rounded-lg bg-red-50 px-3 py-2 font-bold text-red-600 disabled:opacity-60"
                            >
                              Từ chối
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {detail ? (
          <div
            className="fixed inset-0 z-50 bg-[#0f172a]/40 backdrop-blur-sm"
            onClick={() => setDetail(null)}
          >
            <aside
              className="absolute right-0 top-0 h-full w-full overflow-y-auto bg-white p-5 shadow-2xl sm:w-[520px]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black">Chi tiết hồ sơ</h2>

                <button
                  onClick={() => setDetail(null)}
                  className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100"
                >
                  ×
                </button>
              </div>

              {detailLoading ? (
                <p className="mt-6">Đang tải...</p>
              ) : (
                <>
                  <div className="mt-5 flex items-center gap-4">
                    <img
                      src={
                        detail.photographer.avatar_url || "/Overlay+Shadow.png"
                      }
                      alt=""
                      className="h-20 w-20 rounded-full object-cover"
                    />

                    <div>
                      <h3 className="text-lg font-black">
                        {detail.photographer.full_name}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {detail.photographer.email}
                      </p>
                      <span
                        className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${statusClass(
                          detail.photographer.verification_status
                        )}`}
                      >
                        {statusText(detail.photographer.verification_status)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-black uppercase text-slate-400">
                      Giới thiệu
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      {detail.photographer.bio || "Chưa có bio."}
                    </p>
                  </div>

                  <div className="mt-5 grid gap-3 text-sm">
                    <Info label="User ID" value={String(detail.photographer.user_id)} />
                    <Info label="Role hiện tại" value={detail.photographer.user_role || "—"} />
                    <Info label="Khu vực" value={detail.photographer.active_area || "—"} />
                    <Info label="Category" value={detail.photographer.categories || "—"} />
                    <Info label="Giá từ" value={formatMoney(detail.photographer.min_price)} />
                  </div>

                  <h3 className="mt-6 font-black">Gói dịch vụ</h3>

                  <div className="mt-3 grid gap-3">
                    {detail.packages.length === 0 ? (
                      <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                        Chưa có gói dịch vụ.
                      </p>
                    ) : (
                      detail.packages.map((pack) => (
                        <div
                          key={pack.id}
                          className="rounded-2xl border border-slate-200 bg-white p-4"
                        >
                          <p className="font-black">
                            {pack.name || pack.package_name || "Gói dịch vụ"}
                          </p>
                          <p className="mt-1 text-[#ff8d28] font-black">
                            {formatMoney(
                              pack.price || pack.base_price || pack.package_price
                            )}
                          </p>
                          <p className="mt-2 text-sm text-slate-500">
                            {pack.description || "Chưa có mô tả."}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="mt-6 flex justify-end gap-2">
                    <button
                      onClick={() => void reject(detail.photographer)}
                      className="rounded-xl bg-red-50 px-4 py-2 text-sm font-bold text-red-600"
                    >
                      Từ chối
                    </button>

                    <button
                      onClick={() => void approve(detail.photographer)}
                      className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white"
                    >
                      Duyệt hồ sơ
                    </button>
                  </div>
                </>
              )}
            </aside>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
}

function Stat({
  title,
  value,
  tone = "dark",
}: {
  title: string;
  value: number;
  tone?: "dark" | "orange" | "green" | "red";
}) {
  const color =
    tone === "orange"
      ? "text-[#ff8d28]"
      : tone === "green"
      ? "text-emerald-700"
      : tone === "red"
      ? "text-red-600"
      : "text-[#0f172a]";

  return (
    <section className="rounded-2xl border border-[#e7e9f1] bg-white p-4 shadow-[0_14px_34px_rgba(12,18,32,0.04)]">
      <p className="text-[#697086]">{title}</p>
      <b className={`mt-1 block text-[24px] ${color}`}>{value}</b>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3">
      <span className="text-slate-500">{label}</span>
      <b className="text-right">{value}</b>
    </div>
  );
}