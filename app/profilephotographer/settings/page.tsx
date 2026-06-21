"use client";

import { useMemo, useState } from "react";

const serviceOptions = [
  "Chân dung cá nhân",
  "Cặp đôi",
  "Cưới hỏi",
  "Kỷ yếu",
  "Sự kiện",
  "Food & Product",
  "Travel",
];

const paymentOptions = ["Chuyển khoản", "Momo", "VNPay", "Tiền mặt"];

export default function PhotographerSettingsPage() {
  const [profile, setProfile] = useState({
    displayName: "Nguyễn Văn A",
    title: "Nhiếp ảnh gia sự kiện & lifestyle",
    location: "TP.HCM",
    email: "nguyenvana@example.com",
    phone: "0909 123 456",
    bio: "Chuyên chụp ảnh cưới, sự kiện và food styling. Luôn giữ phong cách sáng tạo, tinh tế và kể chuyện bằng hình ảnh.",
    services: ["Cưới hỏi", "Food & Product"],
    isProfileActive: true,
    acceptMessages: true,
    noticeBeforeBooking: "24 giờ",
    maxBookingsPerDay: 3,
    bufferMinutes: 60,
    priceFrom: 1200000,
    priceTo: 6500000,
    payoutAccount: "Vietcombank - 123456789",
    payoutName: "Nguyễn Văn A",
    password: "",
    newPassword: "",
    confirmPassword: "",
    notifications: {
      bookingRequests: true,
      messages: true,
      reviews: false,
      promotions: false,
    },
  });

  const selectedServices = useMemo(
    () => profile.services.join(" · "),
    [profile.services],
  );

  const handleChange = (field: string, value: string | boolean | number) => {
    setProfile((current) => ({ ...current, [field]: value }));
  };

  const handleToggleService = (option: string) => {
    setProfile((current) => {
      const services = current.services.includes(option)
        ? current.services.filter((item) => item !== option)
        : [...current.services, option];
      return { ...current, services };
    });
  };

  const handleNotifyToggle = (field: keyof typeof profile.notifications) => {
    setProfile((current) => ({
      ...current,
      notifications: {
        ...current.notifications,
        [field]: !current.notifications[field],
      },
    }));
  };

  return (
    <main className="min-h-screen bg-[#f7f6ff] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-[1200px] flex-col gap-6 lg:grid lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
        <aside className="rounded-[32px] border border-[#e8e3f5] bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 grid h-28 w-28 place-items-center rounded-3xl bg-[#f7e1cc] text-4xl font-black text-[#ff8d28]">NV</div>
            <h1 className="text-xl font-semibold text-[#191b24]">{profile.displayName}</h1>
            <p className="mt-1 text-sm text-[#6b6b7d]">{profile.title}</p>
          </div>

          <div className="mt-8 space-y-5">
            <div className="rounded-3xl bg-[#fbf6ff] px-5 py-4">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[#8d8aa3]">Trạng thái hồ sơ</p>
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">{profile.isProfileActive ? "Hoạt động" : "Tạm ẩn"}</span>
                <button
                  type="button"
                  onClick={() => handleChange("isProfileActive", !profile.isProfileActive)}
                  className="rounded-full border border-[#d7d2ec] bg-white px-3 py-1.5 text-xs font-semibold text-[#4d4a63] hover:bg-[#f7f3ff] transition"
                >
                  {profile.isProfileActive ? "Ẩn" : "Hiển thị"}
                </button>
              </div>
            </div>

            <div className="rounded-3xl bg-[#fbf6ff] px-5 py-4">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[#8d8aa3]">Dịch vụ nổi bật</p>
              <p className="mt-3 text-sm font-semibold text-[#24253a]">{selectedServices || "Chưa chọn dịch vụ"}</p>
            </div>

            <div className="rounded-3xl bg-[#fbf6ff] px-5 py-4">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[#8d8aa3]">Thông báo</p>
              <div className="mt-3 space-y-3">
                {Object.entries(profile.notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 text-sm text-[#4c4b60] shadow-sm">
                    <span>{key === "bookingRequests" ? "Yêu cầu booking" : key === "messages" ? "Tin nhắn" : key === "reviews" ? "Đánh giá" : "Khuyến mãi"}</span>
                    <button
                      type="button"
                      onClick={() => handleNotifyToggle(key as keyof typeof profile.notifications)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${value ? "bg-[#fdf0e2] text-[#d97706]" : "bg-[#eff0f7] text-[#6b6b7f]"}`}
                    >
                      {value ? "Bật" : "Tắt"}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-[#eef0fb] bg-[#fff] p-5">
              <p className="text-sm font-semibold text-[#1c1e29]">Tiêu điểm</p>
              <p className="mt-2 text-sm leading-6 text-[#676782]">Giữ hồ sơ chuyên nghiệp và cập nhật danh mục dịch vụ thường xuyên để tăng cường sự tin cậy với khách hàng.</p>
            </div>
          </div>
        </aside>

        <section className="rounded-[32px] border border-[#e8e3f5] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-[#8d8aa3]">Cài đặt photographer</p>
              <h2 className="text-3xl font-semibold text-[#151724]">Quản lý hồ sơ & lịch chụp</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setProfile((current) => ({
                  ...current,
                  password: "",
                  newPassword: "",
                  confirmPassword: "",
                }))}
                className="rounded-2xl border border-[#d7d2ec] bg-white px-5 py-3 text-sm font-semibold text-[#4b4a62] transition hover:bg-[#f8f5ff]"
              >
                Đặt lại
              </button>
              <button
                type="button"
                className="rounded-2xl bg-[#ff8d28] px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-[#ff8d2870] transition hover:bg-[#ff7a00]"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>

          <div className="mt-10 space-y-10">
            <Section title="Thông tin hồ sơ">
              <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
                <Input
                  label="Tên hiển thị"
                  value={profile.displayName}
                  onChange={(value) => handleChange("displayName", value)}
                />
                <Input
                  label="Tiêu đề nghề nghiệp"
                  value={profile.title}
                  onChange={(value) => handleChange("title", value)}
                />
                <Input
                  label="Địa điểm làm việc"
                  value={profile.location}
                  onChange={(value) => handleChange("location", value)}
                />
                <Input
                  label="Email liên hệ"
                  value={profile.email}
                  onChange={(value) => handleChange("email", value)}
                />
                <Input
                  label="Số điện thoại"
                  value={profile.phone}
                  onChange={(value) => handleChange("phone", value)}
                />
                <label className="space-y-3 text-sm text-[#3b3d55]">
                  <span className="font-semibold text-slate-600">Tiểu sử</span>
                  <textarea
                    value={profile.bio}
                    onChange={(event) => handleChange("bio", event.target.value)}
                    className="min-h-[140px] w-full rounded-[24px] border border-[#e7e4f3] bg-[#f9f7ff] px-4 py-4 text-sm text-[#2c2d3b] outline-none transition focus:border-[#ff8d28] focus:ring-2 focus:ring-[#ff8d28]/10"
                    placeholder="Mô tả phong cách, kinh nghiệm và các dịch vụ bạn cung cấp."
                  />
                </label>
              </div>
            </Section>

            <Section title="Dịch vụ & booking">
              <div className="grid gap-4 xl:grid-cols-[1fr_0.95fr]">
                <div className="space-y-5 rounded-[24px] border border-[#e7e4f3] bg-[#fbf6ff] p-5">
                  <p className="text-sm font-semibold text-[#232540]">Chọn dịch vụ</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {serviceOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleToggleService(option)}
                        className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${profile.services.includes(option) ? "border-[#ff8d28] bg-[#fff1e4] text-[#b24505]" : "border-[#e7e4f3] bg-white text-[#4d4b67] hover:border-[#d3c9f0]"}`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 rounded-[24px] border border-[#e7e4f3] bg-white p-5">
                  <Input
                    label="Thông báo trước khi booking"
                    value={profile.noticeBeforeBooking}
                    onChange={(value) => handleChange("noticeBeforeBooking", value)}
                  />
                  <StepInput
                    label="Số booking tối đa / ngày"
                    value={profile.maxBookingsPerDay}
                    onChange={(value) => handleChange("maxBookingsPerDay", Number(value))}
                    min={1}
                    max={10}
                  />
                  <StepInput
                    label="Khoảng đệm mỗi booking (phút)"
                    value={profile.bufferMinutes}
                    onChange={(value) => handleChange("bufferMinutes", Number(value))}
                    min={30}
                    max={240}
                  />
                </div>
              </div>
            </Section>

            <Section title="Định giá & thanh toán">
              <div className="grid gap-4 xl:grid-cols-2">
                <Input
                  label="Giá từ"
                  prefix="VNĐ"
                  value={profile.priceFrom.toString()}
                  onChange={(value) => handleChange("priceFrom", Number(value))}
                />
                <Input
                  label="Giá đến"
                  prefix="VNĐ"
                  value={profile.priceTo.toString()}
                  onChange={(value) => handleChange("priceTo", Number(value))}
                />
                <label className="space-y-3 text-sm text-[#3b3d55]">
                  <span className="font-semibold text-slate-600">Phương thức thanh toán ưu tiên</span>
                  <select
                    value={profile.payoutAccount}
                    onChange={(event) => handleChange("payoutAccount", event.target.value)}
                    className="w-full rounded-[24px] border border-[#e7e4f3] bg-[#f9f7ff] px-4 py-3 text-sm text-[#2c2d3b] outline-none transition focus:border-[#ff8d28] focus:ring-2 focus:ring-[#ff8d28]/10"
                  >
                    {paymentOptions.map((method) => (
                      <option key={method} value={method === "Tiền mặt" ? "Tiền mặt" : `${method} - ${profile.payoutName}`}> {method} </option>
                    ))}
                  </select>
                </label>
                <Input
                  label="Tài khoản nhận tiền"
                  value={profile.payoutAccount}
                  onChange={(value) => handleChange("payoutAccount", value)}
                />
              </div>
            </Section>

            <Section title="Bảo mật & đăng nhập">
              <div className="grid gap-4 xl:grid-cols-2">
                <label className="space-y-3 text-sm text-[#3b3d55]">
                  <span className="font-semibold text-slate-600">Mật khẩu hiện tại</span>
                  <input
                    type="password"
                    value={profile.password}
                    onChange={(event) => handleChange("password", event.target.value)}
                    className="w-full rounded-[24px] border border-[#e7e4f3] bg-[#f9f7ff] px-4 py-3 text-sm text-[#2c2d3b] outline-none transition focus:border-[#ff8d28] focus:ring-2 focus:ring-[#ff8d28]/10"
                    placeholder="********"
                  />
                </label>
                <label className="space-y-3 text-sm text-[#3b3d55]">
                  <span className="font-semibold text-slate-600">Mật khẩu mới</span>
                  <input
                    type="password"
                    value={profile.newPassword}
                    onChange={(event) => handleChange("newPassword", event.target.value)}
                    className="w-full rounded-[24px] border border-[#e7e4f3] bg-[#f9f7ff] px-4 py-3 text-sm text-[#2c2d3b] outline-none transition focus:border-[#ff8d28] focus:ring-2 focus:ring-[#ff8d28]/10"
                    placeholder="Nhập mật khẩu mới"
                  />
                </label>
                <label className="space-y-3 text-sm text-[#3b3d55]">
                  <span className="font-semibold text-slate-600">Xác nhận mật khẩu mới</span>
                  <input
                    type="password"
                    value={profile.confirmPassword}
                    onChange={(event) => handleChange("confirmPassword", event.target.value)}
                    className="w-full rounded-[24px] border border-[#e7e4f3] bg-[#f9f7ff] px-4 py-3 text-sm text-[#2c2d3b] outline-none transition focus:border-[#ff8d28] focus:ring-2 focus:ring-[#ff8d28]/10"
                    placeholder="Nhập lại mật khẩu mới"
                  />
                </label>
                <div className="rounded-[24px] border border-[#e7e4f3] bg-[#fbf6ff] p-5">
                  <p className="text-sm font-semibold text-[#24253a]">Xác thực hai lớp</p>
                  <p className="mt-2 text-sm text-[#6f7088]">Bật thêm bảo mật đăng nhập để bảo vệ tài khoản của bạn.</p>
                  <button
                    type="button"
                    className="mt-4 inline-flex rounded-full border border-[#d7d2ec] bg-white px-4 py-2 text-sm font-semibold text-[#4d4b67] hover:bg-[#f8f5ff] transition"
                  >
                    Kích hoạt 2FA
                  </button>
                </div>
              </div>
            </Section>
          </div>
        </section>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[28px] border border-[#f0edf9] bg-[#fbf8ff] p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-[#151724]">{title}</h3>
          <p className="mt-1 text-sm text-[#6f7088]">Cập nhật thông tin chi tiết cho mục này.</p>
        </div>
      </div>
      <div className="space-y-5">{children}</div>
    </div>
  );
}

function Input({ label, value, onChange, prefix }: { label: string; value: string; onChange: (value: string) => void; prefix?: string }) {
  return (
    <label className="space-y-3 text-sm text-[#3b3d55]">
      <span className="font-semibold text-slate-600">{label}</span>
      <div className="relative">
        {prefix ? (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#7c7a95]">{prefix}</span>
        ) : null}
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`w-full rounded-[24px] border border-[#e7e4f3] bg-[#f9f7ff] px-4 py-3 text-sm text-[#2c2d3b] outline-none transition focus:border-[#ff8d28] focus:ring-2 focus:ring-[#ff8d28]/10 ${prefix ? "pl-14" : ""}`}
        />
      </div>
    </label>
  );
}

function StepInput({ label, value, onChange, min, max }: { label: string; value: number; onChange: (value: string) => void; min: number; max: number }) {
  return (
    <label className="space-y-3 text-sm text-[#3b3d55]">
      <span className="font-semibold text-slate-600">{label}</span>
      <div className="flex items-center gap-3 rounded-[24px] border border-[#e7e4f3] bg-[#f9f7ff] px-4 py-3">
        <button
          type="button"
          onClick={() => onChange(String(Math.max(min, value - 1)))}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-semibold text-[#4d4b67] transition hover:bg-[#fff3e1]"
        >
          -
        </button>
        <span className="min-w-[72px] text-center text-sm font-semibold text-[#2c2d3b]">{value}</span>
        <button
          type="button"
          onClick={() => onChange(String(Math.min(max, value + 1)))}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-semibold text-[#4d4b67] transition hover:bg-[#fff3e1]"
        >
          +
        </button>
      </div>
    </label>
  );
}
