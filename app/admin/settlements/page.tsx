"use client";

import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../_components/admin-layout";
import { AdminIcon, IconButton } from "../_components/admin-icons";
import {
  getSettlements,
  getSettlementSummary,
  markSettlementPaid,
  syncSettlementByBooking,
  type BookingSettlement,
  type SettlementSummary,
} from "../../services/settlement-api";

type SettlementFilterStatus = "Tất cả" | "Chờ chuyển tiền" | "Đã chuyển tiền" | "Đang chờ" | "Đã hủy";

function formatMoney(value?: number | string | null) {
  const numberValue = Number(value || 0);
  return new Intl.NumberFormat("vi-VN").format(numberValue) + "đ";
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleString("vi-VN");
  } catch {
    return value;
  }
}

function mapStatusToText(status?: string | null) {
  switch (status) {
    case "ready":
      return "Chờ chuyển tiền";
    case "paid":
      return "Đã chuyển tiền";
    case "pending":
      return "Đang chờ";
    case "cancelled":
      return "Đã hủy";
    default:
      return status || "Đang chờ";
  }
}

function mapTextToStatus(status: SettlementFilterStatus) {
  switch (status) {
    case "Chờ chuyển tiền":
      return "ready";
    case "Đã chuyển tiền":
      return "paid";
    case "Đang chờ":
      return "pending";
    case "Đã hủy":
      return "cancelled";
    default:
      return "";
  }
}

function badgeClass(text: string) {
  if (text === "Đã chuyển tiền") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (text === "Chờ chuyển tiền" || text === "Đang chờ") {
    return "bg-orange-50 text-orange-700";
  }

  if (text === "Đã hủy") {
    return "bg-red-50 text-red-600";
  }

  return "bg-slate-50 text-slate-600";
}

export default function AdminSettlementsPage() {
  const [items, setItems] = useState<BookingSettlement[]>([]);
  const [summary, setSummary] = useState<SettlementSummary | null>(null);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<SettlementFilterStatus>("Tất cả");
  const [bookingCode, setBookingCode] = useState("");

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [payingId, setPayingId] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [toast, setToast] = useState("");

  const tabs: SettlementFilterStatus[] = [
    "Tất cả",
    "Chờ chuyển tiền",
    "Đã chuyển tiền",
    "Đang chờ",
    "Đã hủy",
  ];

  const selected = items.find((item) => item.id === selectedId) ?? null;

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();

    return items.filter((item) => {
      const haystack = [
        item.booking_code,
        item.customer_full_name,
        item.customer_email,
        item.photographer_name,
        item.photographer_email,
        item.service_name,
        mapStatusToText(item.status),
      ]
        .join(" ")
        .toLowerCase();

      const matchSearch = !search || haystack.includes(search);
      const matchStatus =
        status === "Tất cả" || mapStatusToText(item.status) === status;

      return matchSearch && matchStatus;
    });
  }, [items, query, status]);

  const readyCount = useMemo(() => {
    return items.filter((item) => item.status === "ready").length;
  }, [items]);

  function notify(text: string) {
    setToast(text);
    window.setTimeout(() => setToast(""), 2200);
  }

  async function loadData() {
    try {
      setLoading(true);

      const [summaryData, settlementData] = await Promise.all([
        getSettlementSummary(),
        getSettlements({
          status: mapTextToStatus(status),
          keyword: query,
        }),
      ]);

      setSummary(summaryData);
      setItems(settlementData || []);
    } catch (error) {
      notify(
        error instanceof Error
          ? error.message
          : "Không tải được dữ liệu đối soát."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleFilter() {
    await loadData();
  }

  async function handleResetFilter() {
    setQuery("");
    setStatus("Tất cả");

    window.setTimeout(() => {
      void loadData();
    }, 0);
  }

  async function handleSync() {
    const code = bookingCode.trim();

    if (!code) {
      notify("Nhập mã booking trước.");
      return;
    }

    try {
      setSyncing(true);

      await syncSettlementByBooking(code);

      setBookingCode("");
      notify(`Đã tạo/cập nhật đối soát cho booking ${code}.`);

      await loadData();
    } catch (error) {
      notify(
        error instanceof Error ? error.message : "Không tạo được đối soát."
      );
    } finally {
      setSyncing(false);
    }
  }

  async function handleMarkPaid(item: BookingSettlement) {
    const ok = window.confirm(
      `Xác nhận đã chuyển ${formatMoney(
        item.photographer_payout_amount
      )} cho photographer của booking ${item.booking_code}?`
    );

    if (!ok) return;

    try {
      setPayingId(item.id);

      await markSettlementPaid(
        item.id,
        "Admin xác nhận đã chuyển tiền cho photographer."
      );

      notify(`Đã đánh dấu booking ${item.booking_code} là đã chuyển tiền.`);

      await loadData();
    } catch (error) {
      notify(
        error instanceof Error
          ? error.message
          : "Không cập nhật được trạng thái chuyển tiền."
      );
    } finally {
      setPayingId(null);
    }
  }

  return (
    <AdminLayout active="Đối soát" search={query} onSearch={setQuery}>
      {toast ? <Toast text={toast} /> : null}

      <div className="min-w-0">
        <PageHead
          title="Đối soát doanh thu"
          action="Làm mới"
          onAction={() => void loadData()}
        />

        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          <Stat
            title="Tổng đối soát"
            value={String(summary?.total_settlements || items.length || 0)}
            note="booking"
          />

          <Stat
            title="Chờ chuyển"
            value={String(summary?.ready_count || readyCount || 0)}
            note="cần xử lý"
            tone="orange"
          />

          <Stat
            title="Đã chuyển"
            value={String(summary?.paid_count || 0)}
            note="hoàn tất"
            tone="green"
          />

          <Stat
            title="Doanh thu"
            value={formatMoney(summary?.total_revenue)}
            note="tổng booking"
          />

          <Stat
            title="Phí sàn"
            value={formatMoney(summary?.total_platform_fee)}
            note="10% booking"
            tone="orange"
          />

          <Stat
            title="Trả photo"
            value={formatMoney(summary?.total_photographer_payout)}
            note="sau trừ phí"
            tone="green"
          />
        </div>

        <Panel className="mt-4">
          <div className="mb-3 grid gap-2 md:grid-cols-[minmax(0,1fr)_180px_150px_40px]">
            <label className="relative !block">
              <AdminIcon
                name="search"
                className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8a93a5]"
              />

              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="!h-10 !min-h-0 w-full rounded-xl border border-[#dfe3ec] !py-0 !pl-10 !pr-3 !text-[12px] !font-normal outline-none focus:border-[#ff8d28]"
                placeholder="Tìm mã booking, email khách, photographer..."
              />
            </label>

            <Select
              value={status}
              options={tabs}
              onChange={(value) => setStatus(value as SettlementFilterStatus)}
            />

            <button
              type="button"
              onClick={() => void handleFilter()}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#ff8d28] px-4 !text-[12px] !font-medium text-white hover:bg-[#f47f16]"
            >
              <AdminIcon name="filter" className="h-3.5 w-3.5" />
              Lọc
            </button>

            <IconButton
              label="Đặt lại bộ lọc"
              icon="filter"
              size="md"
              onClick={() => void handleResetFilter()}
            />
          </div>

          <div className="mb-3 flex gap-4 overflow-x-auto border-b border-[#edf0f5]">
            {tabs.map((tab) => {
              const count =
                tab === "Tất cả"
                  ? items.length
                  : items.filter((item) => mapStatusToText(item.status) === tab)
                      .length;

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatus(tab)}
                  className={`shrink-0 border-b-2 px-3 py-2 text-[12px] font-medium ${
                    status === tab
                      ? "border-[#ff8d28] text-[#ff8d28]"
                      : "border-transparent text-[#536078]"
                  }`}
                >
                  {tab}{" "}
                  <span className="rounded-full bg-[#eef1f7] px-2 py-0.5 text-[10px]">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="rounded-2xl border border-[#ffd2ad] bg-[#fff8f1] p-4">
            <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_320px_auto] xl:items-center">
              <div>
                <h2 className="text-[15px] font-semibold text-[#0f172a]">
                  Tạo đối soát thủ công theo mã booking
                </h2>
                <p className="mt-1 text-[12px] text-[#697086]">
                  Dùng khi booking đã thanh toán đủ nhưng bảng đối soát chưa có
                  dữ liệu.
                </p>
              </div>

              <input
                value={bookingCode}
                onChange={(event) => setBookingCode(event.target.value)}
                className="h-10 rounded-xl border border-[#ffd2ad] bg-white px-3 text-[12px] font-medium outline-none focus:border-[#ff8d28]"
                placeholder="VD: BK17830025837728275"
              />

              <button
                type="button"
                onClick={() => void handleSync()}
                disabled={syncing}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#0f172a] px-4 text-[12px] font-medium text-white hover:bg-[#ff8d28] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <AdminIcon name="add" className="h-3.5 w-3.5" />
                {syncing ? "Đang tạo..." : "Tạo đối soát"}
              </button>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto rounded-xl border border-[#e6e9f1]">
            <table className="w-full min-w-[1200px] text-left text-[12px]">
              <thead className="bg-[#fbfcfe] text-[#536078]">
                <tr>
                  {[
                    "Booking ID",
                    "Khách hàng",
                    "Photographer",
                    "Tổng tiền",
                    "Cọc",
                    "Còn lại",
                    "Phí sàn",
                    "Trả photographer",
                    "Trạng thái",
                    "Thao tác",
                  ].map((head) => (
                    <th key={head} className="px-3 py-3 font-semibold">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-[#edf0f5]">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="px-3 py-8 text-center">
                      <div className="text-[22px]">🔄</div>
                      <p className="mt-2 text-[#697086]">
                        Đang tải dữ liệu đối soát...
                      </p>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-3 py-8 text-center text-[#697086]"
                    >
                      Chưa có dữ liệu đối soát.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => {
                    const statusText = mapStatusToText(item.status);

                    return (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedId(item.id)}
                        className={`cursor-pointer hover:bg-[#fff8f1] ${
                          selectedId === item.id ? "bg-[#fff3e8]" : "bg-white"
                        }`}
                      >
                        <td className="px-3 py-3 font-medium text-[#ff8d28]">
                          {item.booking_code}
                          <p className="mt-1 text-[#697086]">
                            {formatDate(item.created_at)}
                          </p>
                        </td>

                        <td className="px-3 py-3">
                          <b>{item.customer_full_name || "—"}</b>
                          <p className="mt-1 text-[#697086]">
                            {item.customer_email || "—"}
                          </p>
                        </td>

                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <img
                              src="/Overlay+Shadow.png"
                              alt=""
                              className="h-8 w-8 rounded-full object-cover"
                            />

                            <div>
                              <b>
                                {item.photographer_name ||
                                  `Photographer #${
                                    item.photographer_id || "—"
                                  }`}
                              </b>
                              <p className="mt-1 text-[#697086]">
                                {item.photographer_email || "—"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-3 py-3 font-semibold">
                          {formatMoney(item.total_amount)}
                        </td>

                        <td className="px-3 py-3">
                          {formatMoney(item.deposit_amount)}
                        </td>

                        <td className="px-3 py-3">
                          {formatMoney(item.final_amount)}
                        </td>

                        <td className="px-3 py-3">
                          <b className="text-[#ff8d28]">
                            {formatMoney(item.platform_fee_amount)}
                          </b>
                          <p className="mt-1 text-[#697086]">
                            {Number(item.platform_fee_rate || 10)}%
                          </p>
                        </td>

                        <td className="px-3 py-3 font-semibold text-emerald-700">
                          {formatMoney(item.photographer_payout_amount)}
                        </td>

                        <td className="px-3 py-3">
                          <Badge text={statusText} />
                        </td>

                        <td className="px-3 py-3">
                          <div className="flex gap-2">
                            <IconButton
                              label="Xem chi tiết"
                              icon="eye"
                              onClick={(event) => {
                                event.stopPropagation();
                                setSelectedId(item.id);
                              }}
                            />

                            {item.status === "ready" ? (
                              <IconButton
                                label={
                                  payingId === item.id
                                    ? "Đang xử lý"
                                    : "Đã chuyển"
                                }
                                icon="check"
                                tone="success"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  void handleMarkPaid(item);
                                }}
                              />
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between text-[12px] text-[#697086]">
            <span>
              Hiển thị {filtered.length} của {items.length} dòng đối soát
            </span>

            <span>
              Phí sàn mặc định:{" "}
              <b className="text-[#ff8d28]">10% tổng giá trị booking</b>
            </span>
          </div>
        </Panel>

        {selected ? (
          <div
            className="fixed inset-0 z-50 bg-[#0f172a]/35 backdrop-blur-[2px]"
            onClick={() => setSelectedId(null)}
          >
            <aside
              className="absolute right-0 top-0 h-full w-full min-w-0 overflow-y-auto border-l border-[#e6e9f1] bg-white p-5 shadow-[-18px_0_38px_rgba(12,18,32,0.16)] sm:w-[460px]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-[16px] font-semibold">
                  Chi tiết đối soát
                </h2>

                <IconButton
                  label="Đóng"
                  icon="close"
                  onClick={() => setSelectedId(null)}
                />
              </div>

              <div className="mt-5 border-b border-[#edf0f5] pb-5">
                <div className="flex items-center gap-2">
                  <b className="text-[16px]">{selected.booking_code}</b>
                  <Badge text={mapStatusToText(selected.status)} />
                </div>

                <p className="mt-2 text-[12px] text-[#697086]">
                  Ngày tạo: {formatDate(selected.created_at)}
                </p>
              </div>

              <SectionTitle>Chính sách doanh thu</SectionTitle>

              <div className="mt-3 rounded-2xl border border-[#ffd2ad] bg-[#fff8f1] p-4 text-[12px] leading-6 text-[#536078]">
                <p>
                  <b>Giai đoạn 1:</b> Khách đặt lịch và thanh toán cọc. Sàn ghi
                  nhận khoản cọc, chưa chuyển tiền ngay cho photographer.
                </p>
                <p className="mt-2">
                  <b>Giai đoạn 2:</b> Photographer hoàn thành buổi chụp. Khách
                  thanh toán phần tiền còn lại.
                </p>
                <p className="mt-2">
                  <b>Giai đoạn 3:</b> Sàn đối soát, trích phí dịch vụ 10% tổng
                  booking, phần còn lại chuyển cho photographer.
                </p>
              </div>

              <InfoBlock
                title="Thông tin booking"
                rows={[
                  ["Mã booking", selected.booking_code],
                  ["Khách hàng", selected.customer_full_name || "—"],
                  ["Email khách", selected.customer_email || "—"],
                  [
                    "Photographer",
                    selected.photographer_name ||
                      `Photographer #${selected.photographer_id || "—"}`,
                  ],
                  ["Email photographer", selected.photographer_email || "—"],
                  ["Dịch vụ", selected.service_name || "—"],
                ]}
              />

              <InfoBlock
                title="Doanh thu & chia tiền"
                rows={[
                  ["Tổng giá trị", formatMoney(selected.total_amount)],
                  ["Tiền cọc", formatMoney(selected.deposit_amount)],
                  ["Tiền còn lại", formatMoney(selected.final_amount)],
                  [
                    "Phí sàn",
                    `${formatMoney(selected.platform_fee_amount)} (${Number(
                      selected.platform_fee_rate || 10
                    )}%)`,
                  ],
                  [
                    "Photographer nhận",
                    formatMoney(selected.photographer_payout_amount),
                  ],
                  ["Trạng thái", mapStatusToText(selected.status)],
                  ["Ngày chuyển", formatDate(selected.paid_at)],
                ]}
              />

              <SectionTitle>Ghi chú</SectionTitle>
              <p className="mt-3 rounded-xl bg-[#f7f8fb] p-3 text-[12px] text-[#536078]">
                {selected.note || "Chưa có ghi chú."}
              </p>

              <div className="mt-6 flex justify-end gap-2">
                {selected.status === "ready" ? (
                  <IconButton
                    label="Đã chuyển tiền"
                    icon="check"
                    tone="success"
                    onClick={() => void handleMarkPaid(selected)}
                  />
                ) : null}

                <IconButton
                  label="Đóng"
                  icon="close"
                  onClick={() => setSelectedId(null)}
                />
              </div>
            </aside>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
}

function PageHead({
  title,
  action,
  onAction,
}: {
  title: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <h1 className="text-[24px] font-semibold">{title}</h1>
        <p className="mt-1 text-[12px] text-[#697086]">
          Quản lý phí sàn, số tiền cần chuyển cho photographer và trạng thái đối
          soát.
        </p>
      </div>

      <div className="flex gap-2">
        <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#ffd2ad] bg-white px-4 text-[#ff8d28]">
          <AdminIcon name="download" /> Xuất Excel
        </button>

        <button
          onClick={onAction}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#ff8d28] px-4 text-white"
        >
          <AdminIcon name="filter" /> {action}
        </button>
      </div>
    </div>
  );
}

function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-[#e7e9f1] bg-white p-4 shadow-[0_14px_34px_rgba(12,18,32,0.04)] ${className}`}
    >
      {children}
    </section>
  );
}

function Stat({
  title,
  value,
  note = "tổng số",
  tone = "dark",
}: {
  title: string;
  value: string;
  note?: string;
  tone?: "dark" | "orange" | "green";
}) {
  const color =
    tone === "orange"
      ? "text-[#ff8d28]"
      : tone === "green"
      ? "text-emerald-700"
      : "text-[#0f172a]";

  return (
    <Panel>
      <p className="text-[#697086]">{title}</p>
      <b className={`mt-1 block text-[22px] ${color}`}>{value}</b>
      <p className="text-[11px] text-[#697086]">{note}</p>
    </Panel>
  );
}

function Select({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="!h-10 !min-h-0 !w-full rounded-xl !border !border-[#ffd2ad] bg-white !px-3 !py-0 !text-[12px] !font-normal text-[#ff8d28] !shadow-none outline-none focus:!border-[#ff8d28]"
    >
      {options.map((option) => (
        <option key={option}>{option}</option>
      ))}
    </select>
  );
}

function Badge({ text }: { text: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${badgeClass(
        text
      )}`}
    >
      {text}
    </span>
  );
}

function InfoBlock({
  title,
  rows,
}: {
  title: string;
  rows: string[][];
}) {
  return (
    <div className="mt-5 border-t border-[#edf0f5] pt-5">
      <SectionTitle>{title}</SectionTitle>

      <div className="mt-3 space-y-3 text-[12px]">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="grid grid-cols-[130px_minmax(0,1fr)] gap-3"
          >
            <span className="text-[#697086]">{label}</span>
            <b className="break-words font-medium">{value}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="mt-5 text-[14px] font-semibold">{children}</h3>;
}

function Toast({ text }: { text: string }) {
  return (
    <div className="fixed right-6 top-20 z-50 rounded-xl border bg-white px-4 py-3 font-medium text-emerald-700 shadow-xl">
      {text}
    </div>
  );
}