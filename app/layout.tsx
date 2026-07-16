import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "./components/app-shell";
import { MotionEffects } from "./motion";
import { AuthProvider } from "./auth-context";
import { ToastProvider } from "./toast-context";
// import { ReactTrace } from "./components/react-trace"; // Disabled: dev tool causing module resolution issues

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
      <head>
        <link rel="preconnect" href="http://localhost:5000" />
        <link rel="preconnect" href="https://i.pinimg.com" crossOrigin="" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://images.pexels.com" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <MotionEffects />

        <AuthProvider>
          <ToastProvider>
            <AppShell>{children}</AppShell>
            {/* <ReactTrace /> */}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
