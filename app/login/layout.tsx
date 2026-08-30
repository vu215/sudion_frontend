import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng nhập | Sudion Studio",
  description:
    "Đăng nhập tài khoản Sudion Studio để đặt lịch chụp hình, quản lý booking và nhắn tin với photographer.",
  openGraph: {
    title: "Đăng nhập | Sudion Studio",
    description: "Đăng nhập để sử dụng đầy đủ tính năng Sudion Studio.",
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
