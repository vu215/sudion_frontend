import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tin tức nhiếp ảnh | Sudion Studio",
  description:
    "Cập nhật tin tức, xu hướng nhiếp ảnh và tips chụp hình mới nhất từ cộng đồng Sudion Studio.",
  openGraph: {
    title: "Tin tức nhiếp ảnh | Sudion Studio",
    description:
      "Tin tức và xu hướng nhiếp ảnh mới nhất tại Việt Nam.",
  },
};

export default function NewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
