import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đặt lịch chụp hình | Sudion Studio",
  description:
    "Chọn dịch vụ, photographer và khung giờ phù hợp. Đặt lịch chụp hình chuyên nghiệp với quy trình nhanh gọn tại Sudion Studio.",
  openGraph: {
    title: "Đặt lịch chụp hình | Sudion Studio",
    description:
      "Đặt lịch chụp hình chuyên nghiệp với photographer hàng đầu Việt Nam.",
  },
};

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
