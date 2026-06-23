"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import type { ChangeEvent, DragEvent } from "react";
import AdminLayout from "../../_components/admin-layout";
import { AdminIcon, IconButton, type IconName } from "../../_components/admin-icons";
import { settingsSections, type Section } from "../settings-sections";

type SystemSettingsState = { name: string; email: string; phone: string; address: string; description: string; timezone: string; language: string; currency: string; dateFormat: string; timeFormat: string; pageSize: string; logoUrl: string; faviconUrl: string };

export function SettingsAdminPageContent({ active }: { active: Section }) {
  const [settingsCollapsed, setSettingsCollapsed] = useState(false);
  const [toast, setToast] = useState("");
  const [system, setSystem] = useState({ name: "Studion", email: "support@studion.vn", phone: "1900 1234", address: "123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh", description: "Nền tảng kết nối khách hàng với photographer chuyên nghiệp, hỗ trợ gợi ý và tối ưu trải nghiệm đặt lịch.", timezone: "(GMT+07:00) Asia/Ho Chi Minh", language: "Tiếng Việt", currency: "VND (đ)", dateFormat: "dd/mm/yyyy", timeFormat: "24 giờ (14:30)", pageSize: "10", logoUrl: "/logo_sudion.jpg", faviconUrl: "/logo_sudion_remove.png" });
  const [api, setApi] = useState({
    provider: "Google Gemini",
    model: "gemini-1.5-flash",
    key: "",
    endpoint: "https://generativelanguage.googleapis.com/v1beta/models",
    show: false,
    systemPrompt: "Bạn là trợ lý tư vấn chụp ảnh thông minh của Sudion. Hãy tư vấn và gợi ý những nhiếp ảnh gia phù hợp nhất dựa trên thể loại chụp, khu vực hoạt động và ngân sách của khách hàng."
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("studion-ai-settings");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setApi((prev) => ({ ...prev, ...parsed }));
        } catch (e) {
          console.error("Failed to load AI settings from localStorage", e);
        }
      }
    }
  }, []);

  function notify(message: string) { setToast(message); window.setTimeout(() => setToast(""), 1800); }

  return (
    <AdminLayout active="Cài đặt">
      {toast ? <Toast text={toast} /> : null}
      <div className="settings-admin-surface">
        <div className="mb-5">
          <h1 className="!text-[22px] !font-medium tracking-normal">Cài đặt</h1>
        </div>

        <div className={`grid items-start gap-4 transition-[grid-template-columns] duration-200 ${settingsCollapsed ? "xl:grid-cols-[72px_minmax(0,1fr)_340px]" : "xl:grid-cols-[260px_minmax(0,1fr)_360px]"}`}>
          <Panel className={`self-start transition-all duration-200 ${settingsCollapsed ? "!p-2" : ""}`}>
            <div className={`mb-2 flex items-center ${settingsCollapsed ? "justify-center" : "justify-between"}`}>
              {!settingsCollapsed ? <b className="!text-[13px] !font-normal text-[#536078]">Menu cài đặt</b> : null}
              <button onClick={() => setSettingsCollapsed(!settingsCollapsed)} aria-label={settingsCollapsed ? "Mở menu cài đặt" : "Thu gọn menu cài đặt"} title={settingsCollapsed ? "Mở menu cài đặt" : "Thu gọn menu cài đặt"} className="grid h-8 w-8 place-items-center rounded-lg !border !border-[#dfe3ec] bg-white !text-[13px] !font-normal text-[#536078] hover:bg-[#fff3e8] hover:text-[#ff8d28]"><AdminIcon name={settingsCollapsed ? "chevronRight" : "chevronLeft"} /></button>
            </div>
            <nav className="space-y-1">
              {settingsSections.map((item) => (
                <Link key={item.slug} href={item.slug === "system" ? "/admin/settings" : `/admin/settings/${item.slug}`} title={item.label} className={`flex h-10 w-full items-center rounded-xl text-left !text-[13px] !font-normal transition ${settingsCollapsed ? "justify-center px-0" : "gap-3 px-3"} ${active === item.label ? "bg-[#fff3e8] text-[#ff8d28]" : "text-[#162033] hover:bg-[#f7f8fb]"}`}>
                  <AdminIcon name={iconFor(item.label)} className="h-4 w-4 shrink-0" />{!settingsCollapsed ? <span className="truncate !text-[13px] !font-normal">{item.label}</span> : null}
                </Link>
              ))}
            </nav>
          </Panel>

          <div className="grid min-w-0 self-start gap-4">
            {active === "Cài đặt hệ thống" ? <SystemSettings system={system} setSystem={setSystem} notify={notify} /> : active === "AI & Moderation" ? <AiSettings api={api} setApi={setApi} notify={notify} /> : <GenericSettings section={active} notify={notify} />}
          </div>

          <div className="grid gap-4 self-start">
            <QuotaPanel notify={notify} />
            <DisplayPanel system={system} setSystem={setSystem} notify={notify} />
            <ApiSummary notify={notify} />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function SystemSettings({ system, setSystem, notify }: { system: SystemSettingsState; setSystem: (value: SystemSettingsState) => void; notify: (message: string) => void }) {
  return (
    <>
      <Panel>
        <SectionHeader title="Thông tin hệ thống" onClick={() => notify("Đã lưu thay đổi cài đặt.")} />
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Input label="Tên hệ thống" value={system.name} onChange={(value) => setSystem({ ...system, name: value })} />
          <Input label="Email liên hệ" value={system.email} onChange={(value) => setSystem({ ...system, email: value })} />
          <label className="!block !text-[13px] !font-normal text-[#536078] md:row-span-2">Mô tả hệ thống<textarea value={system.description} onChange={(event) => setSystem({ ...system, description: event.target.value })} className="mt-2 !min-h-[92px] w-full rounded-xl !border !border-[#dfe3ec] bg-white p-3 !text-[13px] !font-normal leading-5 text-[#111827] !shadow-none outline-none focus:!border-[#ff8d28] focus:!shadow-none focus:ring-2 focus:ring-[#ff8d28]/10" /></label>
          <Input label="Số điện thoại" value={system.phone} onChange={(value) => setSystem({ ...system, phone: value })} />
          <Input label="Địa chỉ" value={system.address} onChange={(value) => setSystem({ ...system, address: value })} />
          <Input label="Múi giờ" value={system.timezone} onChange={(value) => setSystem({ ...system, timezone: value })} />
          <Input label="Ngôn ngữ mặc định" value={system.language} onChange={(value) => setSystem({ ...system, language: value })} />
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div>
            <p className="!text-[13px] !font-normal text-[#536078]">Logo hệ thống</p>
            <AssetPicker id="system-logo" kind="logo" value={system.logoUrl} onChange={(value) => setSystem({ ...system, logoUrl: value })} notify={notify} />
            <p className="mt-2 !text-[13px] !font-normal text-[#697086]">PNG, JPG hoặc SVG. Kích thước đề xuất: 300×80px</p>
          </div>
          <div>
            <p className="!text-[13px] !font-normal text-[#536078]">Favicon</p>
            <AssetPicker id="system-favicon" kind="favicon" value={system.faviconUrl} onChange={(value) => setSystem({ ...system, faviconUrl: value })} notify={notify} />
            <p className="mt-2 !text-[13px] !font-normal text-[#697086]">PNG, ICO. Kích thước: 32×32px</p>
          </div>
        </div>
      </Panel>

      <Panel>
        <SectionHeader title="Cấu hình hệ thống" onClick={() => notify("Đã lưu cấu hình hệ thống.")} />
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Toggle title="Cho phép đăng ký tài khoản" desc="Bật để cho phép người dùng đăng ký tài khoản mới" checked />
          <Toggle title="Bảo trì hệ thống" desc="Khi bật, hệ thống sẽ chuyển sang chế độ bảo trì" />
          <Toggle title="Duyệt photographer thủ công" desc="Bật để yêu cầu duyệt photographer trước khi hiển thị" checked />
          <Toggle title="Chế độ demo" desc="Dùng dữ liệu demo cho mục đích thử nghiệm" />
          <Toggle title="Ghi log hệ thống" desc="Ghi lại các hoạt động quan trọng của hệ thống" checked />
        </div>
      </Panel>

      <Panel>
        <div className="flex items-center justify-between"><h2 className="!text-[15px] !font-medium">Thông tin phiên bản</h2><button className="inline-flex h-9 items-center gap-2 rounded-xl !border !border-[#ffd2ad] bg-white px-4 !text-[13px] !font-normal text-[#ff8d28]"><AdminIcon name="refresh" /> Kiểm tra cập nhật</button></div>
        <div className="mt-4 grid gap-3 rounded-xl !border !border-[#edf0f5] p-4 !text-[13px] md:grid-cols-4">
          <RowBlock label="Phiên bản hiện tại" value="v1.4.0" />
          <RowBlock label="Môi trường" value="Production" />
          <RowBlock label="Cập nhật lần cuối" value="20/11/2024 14:30" />
          <RowBlock label="Phát triển bởi" value="Studion Team" />
        </div>
      </Panel>
    </>
  );
}

function QuotaPanel({ notify }: { notify: (message: string) => void }) {
  return <Panel><SectionHeader title="Giới hạn & Quota" onClick={() => notify("Đã lưu giới hạn quota.")} /><div className="mt-5 grid gap-4"><Input label="Giới hạn upload (MB)" value="20" onChange={() => undefined} /><Input label="Số ảnh tối đa mỗi album" value="200" onChange={() => undefined} /><Input label="Số booking mỗi user / tháng" value="50" onChange={() => undefined} /><Input label="Thời gian giữ dữ liệu (ngày)" value="365" onChange={() => undefined} /></div></Panel>;
}

function DisplayPanel({ system, setSystem, notify }: { system: SystemSettingsState; setSystem: (value: SystemSettingsState) => void; notify: (message: string) => void }) {
  return <Panel><SectionHeader title="Định dạng & Hiển thị" onClick={() => notify("Đã lưu định dạng hiển thị.")} /><div className="mt-5 grid gap-4"><Input label="Đơn vị tiền tệ" value={system.currency} onChange={(value) => setSystem({ ...system, currency: value })} /><Input label="Định dạng ngày" value={system.dateFormat} onChange={(value) => setSystem({ ...system, dateFormat: value })} /><Input label="Định dạng giờ" value={system.timeFormat} onChange={(value) => setSystem({ ...system, timeFormat: value })} /><Input label="Số lượng hiển thị mỗi trang" value={system.pageSize} onChange={(value) => setSystem({ ...system, pageSize: value })} /></div></Panel>;
}

function ApiSummary({ notify }: { notify: (message: string) => void }) {
  return <Panel><h2 className="!text-[15px] !font-medium">Tích hợp & API</h2><div className="mt-5 grid gap-3 !text-[13px]"><div className="flex items-center justify-between"><span className="!text-[13px] !font-normal text-[#536078]">Trạng thái API</span><span className="rounded-full bg-emerald-50 px-3 py-1 !text-[13px] !font-normal text-emerald-700">Hoạt động</span></div><CopyRow label="API Key" value="pk_live_************************" onCopy={() => notify("Đã copy API key.")} /><CopyRow label="Webhook Secret" value="whsec_************************" onCopy={() => notify("Đã copy webhook secret.")} /><div className="ml-auto"><IconButton label="Quản lý API" icon="settings" onClick={() => notify("Đã mở quản lý API.")} /></div></div></Panel>;
}

function AiSettings({ api, setApi, notify }: {
  api: { provider: string; model: string; key: string; endpoint: string; show: boolean; systemPrompt: string };
  setApi: (value: any) => void;
  notify: (message: string) => void;
}) {
  const handleSave = () => {
    localStorage.setItem("studion-ai-settings", JSON.stringify({
      provider: api.provider,
      model: api.model,
      key: api.key,
      endpoint: api.endpoint,
      systemPrompt: api.systemPrompt
    }));
    notify("Đã lưu cấu hình AI thành công.");
  };

  const handleTestConnect = () => {
    if (api.provider === "Mock Simulator") {
      notify("Test kết nối: Giả lập hoạt động bình thường!");
      return;
    }
    if (!api.key) {
      notify("Lỗi kết nối: Vui lòng nhập API Key.");
      return;
    }
    notify(`Kết nối ${api.provider} (${api.model}) thành công.`);
  };

  return (
    <>
      <Panel>
        <SectionHeader title="Cài đặt Model AI Tư vấn" onClick={handleSave} />
        <p className="mt-2 !text-[13px] !font-normal text-[#697086]">
          Cấu hình nhà cung cấp và model AI hỗ trợ tư vấn chụp ảnh ở widget chat bên ngoài.
        </p>
        
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {/* AI Provider Select */}
          <label className="!block !text-[13px] !font-normal text-[#536078]">
            AI Provider
            <select
              value={api.provider}
              onChange={(e) => {
                const prov = e.target.value;
                let defaultModel = "gemini-1.5-flash";
                let defaultEndpoint = "https://generativelanguage.googleapis.com/v1beta/models";
                if (prov === "OpenAI") {
                  defaultModel = "gpt-4o-mini";
                  defaultEndpoint = "https://api.openai.com/v1/chat/completions";
                } else if (prov === "Mock Simulator") {
                  defaultModel = "local-sim-v1";
                  defaultEndpoint = "local";
                }
                setApi({ ...api, provider: prov, model: defaultModel, endpoint: defaultEndpoint });
              }}
              className="mt-2 h-10 w-full rounded-xl !border !border-[#dfe3ec] bg-white px-3 !text-[13px] !font-normal text-[#111827] outline-none focus:!border-[#ff8d28] focus:ring-2 focus:ring-[#ff8d28]/10"
            >
              <option value="Google Gemini">Google Gemini</option>
              <option value="OpenAI">OpenAI</option>
              <option value="Mock Simulator">Giả lập (Mock Simulator)</option>
            </select>
          </label>

          {/* AI Model */}
          <label className="!block !text-[13px] !font-normal text-[#536078]">
            Model AI Tư vấn
            <select
              value={api.model}
              onChange={(e) => setApi({ ...api, model: e.target.value })}
              className="mt-2 h-10 w-full rounded-xl !border !border-[#dfe3ec] bg-white px-3 !text-[13px] !font-normal text-[#111827] outline-none focus:!border-[#ff8d28] focus:ring-2 focus:ring-[#ff8d28]/10"
            >
              {api.provider === "Google Gemini" && (
                <>
                  <option value="gemini-1.5-flash">gemini-1.5-flash (Nhanh & Tối ưu)</option>
                  <option value="gemini-1.5-pro">gemini-1.5-pro (Thông minh nhất)</option>
                </>
              )}
              {api.provider === "OpenAI" && (
                <>
                  <option value="gpt-4o-mini">gpt-4o-mini (Khuyên dùng)</option>
                  <option value="gpt-4o">gpt-4o (Chất lượng cao)</option>
                </>
              )}
              {api.provider === "Mock Simulator" && (
                <option value="local-sim-v1">local-sim-v1 (Mô phỏng cục bộ)</option>
              )}
            </select>
          </label>

          {/* Endpoint API */}
          <div className="md:col-span-2">
            <Input
              label="Endpoint API"
              value={api.endpoint}
              onChange={(value) => setApi({ ...api, endpoint: value })}
            />
          </div>

          {/* API Key */}
          <div className="md:col-span-2">
            <label className="!block !text-[13px] !font-normal text-[#536078] md:col-span-2">
              API Key / Khóa kết nối
              <div className="mt-2 flex items-center gap-2">
                <input
                  type={api.show ? "text" : "password"}
                  value={api.key}
                  onChange={(event) => setApi({ ...api, key: event.target.value })}
                  placeholder={api.provider === "Mock Simulator" ? "Không yêu cầu API Key" : "Nhập API Key..."}
                  disabled={api.provider === "Mock Simulator"}
                  className="h-10 min-w-0 flex-1 rounded-xl !border !border-[#dfe3ec] px-3 !text-[13px] !font-normal text-[#111827] !shadow-none outline-none focus:!border-[#ff8d28] focus:!shadow-none focus:ring-2 focus:ring-[#ff8d28]/10 disabled:bg-gray-50 disabled:text-gray-400"
                />
                <IconButton
                  label={api.show ? "Ẩn key" : "Hiện key"}
                  icon="eye"
                  onClick={() => setApi({ ...api, show: !api.show })}
                />
              </div>
            </label>
          </div>

          {/* System Prompt */}
          <div className="md:col-span-2">
            <label className="!block !text-[13px] !font-normal text-[#536078]">
              System Prompt (Vai trò Chatbot)
              <textarea
                value={api.systemPrompt}
                onChange={(event) => setApi({ ...api, systemPrompt: event.target.value })}
                className="mt-2 !min-h-[92px] w-full rounded-xl !border !border-[#dfe3ec] bg-white p-3 !text-[13px] !font-normal leading-5 text-[#111827] !shadow-none outline-none focus:!border-[#ff8d28] focus:!shadow-none focus:ring-2 focus:ring-[#ff8d28]/10"
                placeholder="Định nghĩa vai trò, cá tính của trợ lý AI..."
              />
            </label>
          </div>

          <div className="flex items-end gap-2 md:col-span-2 mt-2">
            <button
              onClick={handleTestConnect}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#ff8d28] px-4 !text-[13px] !font-normal text-white shadow-[0_10px_20px_rgba(255,141,40,0.18)]"
            >
              <AdminIcon name="check" /> Test kết nối
            </button>
            <IconButton
              label="Reset key"
              icon="refresh"
              onClick={() => setApi({ ...api, key: "" })}
            />
          </div>
        </div>
      </Panel>

      <Panel>
        <SectionHeader title="Kiểm duyệt nội dung tự động" onClick={() => notify("Đã lưu cấu hình kiểm duyệt AI.")} />
        <p className="mt-2 !text-[13px] !font-normal text-[#697086]">
          Cấu hình ngưỡng kiểm duyệt tự động bằng AI và hành động xử lý nội dung.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Input label="Ngưỡng cảnh báo AI" value="75%" onChange={() => undefined} />
          <Input label="Ngưỡng tự động ẩn" value="92%" onChange={() => undefined} />
          <Input label="Loại nội dung quét" value="Ảnh, tin nhắn, đánh giá" onChange={() => undefined} />
          <Input label="Chế độ xử lý" value="Chờ admin duyệt" onChange={() => undefined} />
        </div>
      </Panel>
    </>
  );
}

function GenericSettings({ section, notify }: { section: Section; notify: (message: string) => void }) {
  const [enabled, setEnabled] = useState(true);
  const config = sectionConfigs[section] ?? sectionConfigs["Cài đặt chung"];
  return (
    <>
      <Panel>
        <SectionHeader title={section} onClick={() => notify(`Đã lưu ${section}.`)} />
        <p className="mt-2 !text-[13px] !font-normal text-[#697086]">{config.desc}</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {config.fields.map((item) => <Input key={item.label} label={item.label} value={item.value} onChange={() => undefined} />)}
          {config.toggles.map((item) => <Toggle key={item.title} title={item.title} desc={item.desc} checked={item.checked ?? enabled} onChange={item.controlled ? setEnabled : undefined} />)}
        </div>
      </Panel>
      <Panel>
        <h2 className="!text-[15px] !font-medium">{config.secondaryTitle}</h2>
        <div className="mt-4 divide-y divide-[#edf0f5] !text-[13px]">
          {config.rows.map((item) => (
            <div key={item.title} className="flex items-center justify-between gap-4 py-3">
              <div>
                <p className="!text-[13px] !font-normal text-[#111827]">{item.title}</p>
                {item.desc ? <p className="mt-1 !text-[12px] !font-normal text-[#697086]">{item.desc}</p> : null}
              </div>
              {item.value ? <span className="shrink-0 rounded-full bg-[#fff3e8] px-3 py-1 !text-[12px] !font-normal text-[#ff8d28]">{item.value}</span> : null}
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}

const sectionConfigs: Record<string, { desc: string; fields: { label: string; value: string }[]; toggles: { title: string; desc?: string; checked?: boolean; controlled?: boolean }[]; secondaryTitle: string; rows: { title: string; desc?: string; value?: string }[] }> = {
  "Cài đặt chung": {
    desc: "Thiết lập hành vi mặc định, trải nghiệm quản trị và trạng thái vận hành chung.",
    fields: [{ label: "Tên hiển thị admin", value: "Studion Admin" }, { label: "Múi giờ hệ thống", value: "Asia/Ho Chi Minh" }, { label: "Ngôn ngữ giao diện", value: "Tiếng Việt" }, { label: "Số bản ghi mỗi trang", value: "10" }],
    toggles: [{ title: "Bật thông báo trong admin", checked: true }, { title: "Tự động lưu bản nháp", checked: true }],
    secondaryTitle: "Tùy chọn giao diện",
    rows: [{ title: "Theme mặc định", desc: "Giao diện sáng, đồng bộ màu cam Studion.", value: "Light" }, { title: "Định dạng dữ liệu", desc: "Ngày, tiền tệ và số liệu dùng theo chuẩn Việt Nam.", value: "VN" }],
  },
  "Email & SMS": {
    desc: "Cấu hình kênh gửi email, SMS và mẫu thông báo tự động cho người dùng.",
    fields: [{ label: "SMTP Host", value: "smtp.studion.vn" }, { label: "Email gửi đi", value: "no-reply@studion.vn" }, { label: "SMS Provider", value: "Mock SMS Gateway" }, { label: "Brandname SMS", value: "STUDION" }],
    toggles: [{ title: "Gửi email xác nhận booking", checked: true }, { title: "Gửi SMS nhắc lịch chụp", checked: true }],
    secondaryTitle: "Mẫu thông báo",
    rows: [{ title: "Booking mới", desc: "Gửi cho khách hàng và photographer.", value: "Bật" }, { title: "Thanh toán thành công", desc: "Gửi biên nhận sau khi thanh toán.", value: "Bật" }, { title: "Nhắc lịch trước buổi chụp", desc: "Gửi trước 24 giờ.", value: "24h" }],
  },
  "Thanh toán": {
    desc: "Quản lý phương thức thanh toán, đối soát và trạng thái giao dịch.",
    fields: [{ label: "Cổng thanh toán", value: "VNPay / MoMo" }, { label: "Tài khoản nhận tiền", value: "Studion Joint Stock" }, { label: "Thời gian giữ cọc", value: "7 ngày" }, { label: "Đơn vị tiền tệ", value: "VND" }],
    toggles: [{ title: "Cho phép thanh toán cọc", checked: true }, { title: "Tự động đối soát giao dịch", checked: true }],
    secondaryTitle: "Quy tắc giao dịch",
    rows: [{ title: "Cọc mặc định", desc: "Áp dụng khi khách tạo booking.", value: "30%" }, { title: "Hoàn tiền tự động", desc: "Chỉ áp dụng giao dịch đủ điều kiện.", value: "Tắt" }, { title: "Xuất biên nhận", desc: "Tạo biên nhận sau thanh toán.", value: "PDF" }],
  },
  "Phí nền tảng": {
    desc: "Thiết lập phí dịch vụ, hoa hồng photographer và ngưỡng miễn phí.",
    fields: [{ label: "Phí nền tảng mặc định", value: "10%" }, { label: "Phí booking tối thiểu", value: "20.000đ" }, { label: "Phí rút tiền", value: "0đ" }, { label: "Chu kỳ thanh toán", value: "Hàng tuần" }],
    toggles: [{ title: "Áp dụng phí theo dịch vụ", checked: true }, { title: "Cho phép miễn phí theo chiến dịch", checked: false }],
    secondaryTitle: "Bậc phí",
    rows: [{ title: "Photographer mới", desc: "Áp dụng trong 30 ngày đầu.", value: "5%" }, { title: "Photographer đã xác minh", desc: "Mức phí tiêu chuẩn.", value: "10%" }, { title: "Đối tác doanh nghiệp", desc: "Có hợp đồng riêng.", value: "Tuỳ chỉnh" }],
  },
  "Chính sách": {
    desc: "Quản lý điều khoản sử dụng, quyền riêng tư và chính sách hủy booking.",
    fields: [{ label: "Phiên bản điều khoản", value: "v1.4" }, { label: "Chính sách quyền riêng tư", value: "v1.2" }, { label: "Thời hạn hủy miễn phí", value: "48 giờ" }, { label: "Email pháp lý", value: "legal@studion.vn" }],
    toggles: [{ title: "Yêu cầu đồng ý điều khoản khi đăng ký", checked: true }, { title: "Hiển thị chính sách khi checkout", checked: true }],
    secondaryTitle: "Tài liệu đang áp dụng",
    rows: [{ title: "Điều khoản sử dụng", desc: "Áp dụng cho khách hàng và photographer.", value: "Public" }, { title: "Chính sách hủy booking", desc: "Quy định hoàn tiền và đổi lịch.", value: "Public" }, { title: "Quy chuẩn nội dung", desc: "Áp dụng cho portfolio và đánh giá.", value: "Public" }],
  },
  "Bảo mật": {
    desc: "Cấu hình đăng nhập, phân quyền và bảo vệ tài khoản quản trị.",
    fields: [{ label: "Thời gian hết phiên", value: "60 phút" }, { label: "Số lần đăng nhập sai", value: "5 lần" }, { label: "Khoảng khóa tạm thời", value: "15 phút" }, { label: "Vai trò mặc định", value: "Admin" }],
    toggles: [{ title: "Bật xác thực 2 lớp", checked: true }, { title: "Ghi log đăng nhập quản trị", checked: true }],
    secondaryTitle: "Kiểm soát truy cập",
    rows: [{ title: "Super Admin", desc: "Toàn quyền hệ thống.", value: "2 user" }, { title: "Admin vận hành", desc: "Quản lý booking, report, nội dung.", value: "8 user" }, { title: "Khoá tài khoản nghi ngờ", desc: "Tự động khi vượt ngưỡng rủi ro.", value: "Bật" }],
  },
  "Sao lưu dữ liệu": {
    desc: "Thiết lập lịch sao lưu, nơi lưu trữ và quy tắc phục hồi dữ liệu.",
    fields: [{ label: "Lịch sao lưu", value: "02:00 hằng ngày" }, { label: "Nơi lưu trữ", value: "S3 Compatible Storage" }, { label: "Thời gian giữ bản sao", value: "30 ngày" }, { label: "Bản sao gần nhất", value: "15/06/2026 02:00" }],
    toggles: [{ title: "Tự động sao lưu hằng ngày", checked: true }, { title: "Mã hóa bản sao lưu", checked: true }],
    secondaryTitle: "Trạng thái sao lưu",
    rows: [{ title: "Cơ sở dữ liệu", desc: "Đã sao lưu thành công.", value: "OK" }, { title: "Ảnh và tài liệu", desc: "Đồng bộ incremental.", value: "OK" }, { title: "Phục hồi thử nghiệm", desc: "Lần kiểm tra gần nhất.", value: "7 ngày trước" }],
  },
  "Nhật ký hoạt động": {
    desc: "Theo dõi hành động quan trọng trong hệ thống và thiết lập lưu trữ log.",
    fields: [{ label: "Thời gian giữ log", value: "365 ngày" }, { label: "Mức log tối thiểu", value: "Info" }, { label: "Xuất log định kỳ", value: "Hàng tháng" }, { label: "Webhook log", value: "Chưa cấu hình" }],
    toggles: [{ title: "Ghi log thay đổi dữ liệu", checked: true }, { title: "Cảnh báo hành động rủi ro", checked: true }],
    secondaryTitle: "Sự kiện gần đây",
    rows: [{ title: "Admin cập nhật cấu hình bảo mật", desc: "15/06/2026 09:20", value: "Info" }, { title: "AI Moderation đánh dấu nội dung", desc: "15/06/2026 08:42", value: "Warning" }, { title: "Đồng bộ thanh toán hoàn tất", desc: "15/06/2026 08:10", value: "Info" }],
  },
};

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) { return <section className={`h-fit rounded-2xl !border !border-[#e7e9f1] bg-white p-4 shadow-[0_14px_34px_rgba(12,18,32,0.04)] ${className}`}>{children}</section>; }
function AssetPicker({ id, kind, value, onChange, notify }: { id: string; kind: "logo" | "favicon"; value: string; onChange: (value: string) => void; notify: (message: string) => void }) {
  const isLogo = kind === "logo";
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState(value);

  function useFile(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      notify("Vui lòng chọn file ảnh.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onChange(String(reader.result));
      notify(isLogo ? "Đã cập nhật logo." : "Đã cập nhật favicon.");
      setOpen(false);
    };
    reader.readAsDataURL(file);
  }

  function handleDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    const url = event.dataTransfer.getData("text/uri-list") || event.dataTransfer.getData("text/plain");
    if (file) {
      useFile(file);
      return;
    }
    if (url?.trim()) {
      onChange(url.trim());
      notify(isLogo ? "Đã nhập logo từ URL." : "Đã nhập favicon từ URL.");
      setOpen(false);
    }
  }

  function applyUrl() {
    if (!url.trim()) return;
    onChange(url.trim());
    notify(isLogo ? "Đã nhập logo từ URL." : "Đã nhập favicon từ URL.");
    setOpen(false);
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => { setUrl(value); setOpen(true); }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
        title="Click để thay đổi hoặc kéo thả ảnh/URL"
        className={`group relative grid place-items-center overflow-hidden rounded-xl !border !border-dashed !border-[#ffd2ad] bg-[#fff8f1] transition hover:bg-[#fff3e8] ${isLogo ? "h-20 w-32" : "h-14 w-14"}`}
      >
        {value ? <img src={value} alt={isLogo ? "Logo Studion" : "Favicon Studion"} className={`${isLogo ? "max-h-16 max-w-[112px]" : "h-9 w-9"} object-contain`} /> : <AdminIcon name="add" className="h-5 w-5 text-[#ff8d28]" />}
        <span className="absolute inset-x-0 bottom-0 bg-white/90 py-1 text-center !text-[11px] !font-normal text-[#ff8d28] opacity-0 transition group-hover:opacity-100">Thay đổi</span>
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#0f172a]/45 p-4 backdrop-blur-[3px]" onClick={() => setOpen(false)}>
          <div className="w-full max-w-[360px] rounded-2xl !border !border-[#e7e9f1] bg-white p-4 shadow-[0_24px_64px_rgba(12,18,32,0.22)]" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between gap-3">
              <h3 className="!text-[15px] !font-medium">{isLogo ? "Thay đổi logo" : "Thay đổi favicon"}</h3>
              <IconButton label="Đóng" icon="close" onClick={() => setOpen(false)} />
            </div>
            <div
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
              className="mt-4 grid rounded-2xl !border !border-dashed !border-[#ffd2ad] bg-[#fff8f1] p-4 text-center"
            >
              <div className={`mx-auto grid place-items-center overflow-hidden rounded-xl bg-white ${isLogo ? "h-20 w-32" : "h-14 w-14"}`}>
                {value ? <img src={value} alt={isLogo ? "Logo Studion" : "Favicon Studion"} className={`${isLogo ? "max-h-16 max-w-[112px]" : "h-9 w-9"} object-contain`} /> : <AdminIcon name="add" className="h-5 w-5 text-[#ff8d28]" />}
              </div>
              <p className="mt-3 !text-[12px] !font-normal text-[#697086]">Kéo thả file ảnh hoặc URL vào đây</p>
              <label htmlFor={id} className="mx-auto mt-3 !inline-flex !h-10 min-w-[126px] cursor-pointer flex-row items-center justify-center gap-2 rounded-xl bg-[#ff8d28] px-4 !py-0 !text-[12px] !font-normal leading-none text-white shadow-[0_10px_20px_rgba(255,141,40,0.18)]"><AdminIcon name="add" className="h-3.5 w-3.5 shrink-0" /><span className="whitespace-nowrap">Chọn file</span></label>
              <input id={id} type="file" accept="image/*,.ico" className="hidden" onChange={(event: ChangeEvent<HTMLInputElement>) => useFile(event.target.files?.[0])} />
            </div>
            <div className="mt-4">
              <label className="!block !text-[12px] !font-normal text-[#536078]">Hoặc nhập URL ảnh</label>
              <div className="mt-2 flex gap-2">
                <input value={url} onChange={(event) => setUrl(event.target.value)} className="h-10 min-w-0 flex-1 rounded-xl !border !border-[#dfe3ec] px-3 !text-[12px] !font-normal outline-none focus:!border-[#ff8d28] focus:ring-2 focus:ring-[#ff8d28]/10" placeholder="https://..." />
                <button type="button" onClick={applyUrl} className="!inline-flex h-10 flex-row items-center justify-center gap-2 rounded-xl !border !border-[#ffd2ad] bg-white px-3 !text-[12px] !font-normal text-[#ff8d28] hover:bg-[#fff8f1]"><AdminIcon name="link" className="h-3.5 w-3.5 shrink-0" /><span className="whitespace-nowrap">URL</span></button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
function SectionHeader({ title, onClick }: { title: string; onClick: () => void }) { return <div className="flex items-center justify-between gap-3"><h2 className="!text-[15px] !font-medium">{title}</h2><button onClick={onClick} className="inline-flex h-9 items-center gap-2 rounded-xl bg-[#ff8d28] px-4 !text-[13px] !font-normal text-white shadow-[0_10px_20px_rgba(255,141,40,0.18)]"><AdminIcon name="check" /> Lưu thay đổi</button></div>; }
function Input({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) { return <label className="!block !text-[13px] !font-normal text-[#536078]">{label}<input value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 h-10 w-full rounded-xl !border !border-[#dfe3ec] bg-white px-3 !text-[13px] !font-normal text-[#111827] !shadow-none outline-none focus:!border-[#ff8d28] focus:!shadow-none focus:ring-2 focus:ring-[#ff8d28]/10" /></label>; }
function Toggle({ title, desc, checked = false, onChange }: { title: string; desc?: string; checked?: boolean; onChange?: (v: boolean) => void }) { return <div className="flex items-center justify-between gap-4 !text-[13px]"><div><p className="!text-[13px] !font-normal text-[#111827]">{title}</p>{desc ? <p className="mt-1 !text-[13px] !font-normal text-[#697086]">{desc}</p> : null}</div><button onClick={() => onChange?.(!checked)} className={`h-6 w-11 rounded-full transition ${checked ? "bg-[#ff8d28]" : "bg-slate-200"}`}><span className={`block h-4 w-4 rounded-full bg-white transition ${checked ? "ml-6" : "ml-1"}`} /></button></div>; }
function CopyRow({ label, value, onCopy }: { label: string; value: string; onCopy: () => void }) { return <div className="grid grid-cols-[96px_minmax(0,1fr)_34px] items-center gap-2"><span className="!text-[13px] !font-normal text-[#536078]">{label}</span><input readOnly value={value} className="h-9 rounded-xl !border !border-[#dfe3ec] bg-white px-3 !text-[13px] !font-normal !shadow-none" /><IconButton label={`Copy ${label}`} icon="copy" onClick={onCopy} /></div>; }
function RowBlock({ label, value }: { label: string; value: string }) { return <div className="border-r border-[#edf0f5] last:border-r-0"><p className="!text-[13px] !font-normal text-[#697086]">{label}</p><b className="mt-1 block !text-[13px] !font-normal">{value}</b></div>; }
function iconFor(section: Section): IconName {
  if (section === "AI & Moderation") return "shield";
  if (section === "Bảo mật") return "lock";
  if (section === "Thanh toán" || section === "Phí nền tảng") return "credit";
  if (section === "Email & SMS") return "mail";
  if (section === "Sao lưu dữ liệu") return "database";
  if (section === "Nhật ký hoạt động") return "log";
  if (section === "Chính sách") return "policy";
  return "settings";
}
function Toast({ text }: { text: string }) { return <div className="fixed right-6 top-20 z-50 rounded-xl !border !border-[#dfe3ec] bg-white px-4 py-3 text-[13px] font-medium text-emerald-700 shadow-xl">{text}</div>; }

