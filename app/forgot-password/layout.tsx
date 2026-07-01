import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quên mật khẩu | Sudion Studio",
  description:
    "Đặt lại mật khẩu tài khoản Sudion Studio. Nhập email để nhận link khôi phục mật khẩu.",
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
