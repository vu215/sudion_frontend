export type Section = "Cài đặt hệ thống" | "Cài đặt chung" | "Email & SMS" | "Thanh toán" | "Phí nền tảng" | "Chính sách" | "Bảo mật" | "AI & Moderation" | "Sao lưu dữ liệu" | "Nhật ký hoạt động";

export const settingsSections: { label: Section; slug: string }[] = [
  { label: "Cài đặt hệ thống", slug: "system" },
  { label: "Cài đặt chung", slug: "general" },
  { label: "Email & SMS", slug: "email-sms" },
  { label: "Thanh toán", slug: "payments" },
  { label: "Phí nền tảng", slug: "platform-fees" },
  { label: "Chính sách", slug: "policies" },
  { label: "Bảo mật", slug: "security" },
  { label: "AI & Moderation", slug: "ai-moderation" },
  { label: "Sao lưu dữ liệu", slug: "backups" },
  { label: "Nhật ký hoạt động", slug: "activity-log" },
];

export function getSettingsSection(slug?: string) {
  return settingsSections.find((item) => item.slug === slug)?.label ?? "Cài đặt hệ thống";
}
