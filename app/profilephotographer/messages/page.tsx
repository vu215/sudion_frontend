"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function PhotographerMessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingCode = searchParams.get("booking") || "";

  useEffect(() => {
    if (bookingCode) {
      router.replace(`/messages?booking=${encodeURIComponent(bookingCode)}`);
    } else {
      router.replace("/messages");
    }
  }, [router, bookingCode]);

  return (
    <div className="grid h-[500px] place-items-center bg-[#f8fafc]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-t-[#ff8d28] border-gray-200" />
        <p className="text-xs font-bold text-[#64748b]">Đang mở phòng trò chuyện...</p>
      </div>
    </div>
  );
}
