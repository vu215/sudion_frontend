import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý đặt lịch | Sudion Studio",
  description:
    "Xem và quản lý tất cả lịch đặt chụp hình của bạn. Theo dõi trạng thái booking, thanh toán và nhắn tin với photographer.",
  openGraph: {
    title: "Quản lý đặt lịch | Sudion Studio",
    description: "Quản lý toàn bộ booking chụp hình tại Sudion Studio.",
  },
};

export default function BookingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
