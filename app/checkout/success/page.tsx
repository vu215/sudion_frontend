"use client";

import Link from "next/link";
import { useEffect } from "react";
import confetti from "canvas-confetti";

export default function CheckoutSuccessPage() {
  useEffect(() => {
    const duration = 4 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 28, spread: 360, ticks: 60, zIndex: 9999 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 45 * (timeLeft / duration);
      
      confetti({ 
        ...defaults, 
        particleCount, 
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } 
      });
      confetti({ 
        ...defaults, 
        particleCount, 
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } 
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="bg-slate-50 min-h-[80vh] flex items-center justify-center py-16 px-6 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-100/40 blur-[100px] rounded-full" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-100/40 blur-[100px] rounded-full" />

      <div className="max-w-xl w-full text-center relative z-10 bg-white p-8 md:p-12 rounded-[32px] border border-slate-100 shadow-xl">
        <div className="mb-8 inline-flex size-24 items-center justify-center rounded-full bg-orange-50 border-4 border-orange-100">
          <span className="material-symbols-outlined text-5xl text-[#ff8d28] font-black">check_circle</span>
        </div>

        <h1 className="text-3xl font-black uppercase tracking-tight text-slate-800 mb-4">
          Đặt hàng thành công!
        </h1>
        <p className="text-slate-500 text-sm leading-relaxed mb-8">
          Cảm ơn bạn đã tin tưởng mua sắm tại **Sudion Store**. Đơn hàng của bạn đã được tiếp nhận và đang trong quá trình xử lý. Nhân viên của chúng tôi sẽ liên hệ xác nhận trong thời gian sớm nhất!
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/products" className="bg-slate-50 border border-slate-200 text-slate-700 font-extrabold py-3.5 rounded-2xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2 text-xs cursor-pointer">
            <span className="material-symbols-outlined text-sm">shopping_bag</span>
            Tiếp tục mua sắm
          </Link>
          <Link href="/" className="bg-gradient-to-r from-[#ff5e00] to-[#ff3c00] text-white font-extrabold py-3.5 rounded-2xl shadow-lg shadow-orange-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-xs cursor-pointer">
            <span className="material-symbols-outlined text-sm">home</span>
            Về trang chủ
          </Link>
        </div>
      </div>
    </main>
  );
}
