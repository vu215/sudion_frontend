import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AppChrome } from "./chrome";
import { MotionEffects } from "./motion";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Sudion Studio | Booking chụp hình",
  description:
    "Nền tảng đặt lịch chụp hình cá nhân, cặp đôi, kỷ yếu, sự kiện và cưới với photographer chuyên nghiệp.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className={`${plusJakartaSans.className} min-h-full flex flex-col`}>
        <MotionEffects />
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
