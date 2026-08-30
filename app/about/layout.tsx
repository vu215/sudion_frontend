import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Về chúng tôi | Sudion Studio",
  description:
    "Sudion Studio - Nền tảng tìm kiếm và đặt lịch chụp hình chuyên nghiệp hàng đầu tại Việt Nam. Kết nối khách hàng với hàng ngàn photographer.",
  openGraph: {
    title: "Về Sudion Studio",
    description:
      "Nền tảng đặt lịch chụp hình chuyên nghiệp hàng đầu Việt Nam.",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
