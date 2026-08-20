"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function ReviewSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "";
  const productName = searchParams.get("productName") || "Sản phẩm trong đơn hàng";
  const tipAmount = Number(searchParams.get("tipAmount") || 0);
  const skipped = searchParams.get("skipped") === "1";

  return (
    <main className="flex min-h-[80vh] items-center justify-center bg-slate-50 px-4 py-12">
      <section className="w-full max-w-lg rounded-2xl border border-orange-100 bg-white p-8 text-center shadow-lg">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-50 text-4xl text-emerald-500">✓</div>
        <h1 className="mt-5 text-2xl font-black text-slate-900">{skipped ? "Đã hoàn tất" : "Gửi thành công"}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {skipped ? "Bạn đã bỏ qua đánh giá và tip cho đơn hàng này." : "Đánh giá của bạn đã được gửi đến hệ thống quản trị."}
        </p>
        {orderId ? <p className="mt-4 text-sm font-bold text-slate-700">Mã đơn: #DH{orderId}</p> : null}
        {!skipped ? (
          <div className="mt-4 rounded-xl bg-orange-50 p-4 text-left text-sm text-slate-700">
            <p className="font-bold">{productName}</p>
            <p className="mt-1 text-slate-500">{tipAmount > 0 ? `Tip: ${tipAmount.toLocaleString("vi-VN")}đ` : "Không tip"}</p>
            {tipAmount > 0 ? <p className="mt-1 text-xs text-orange-600">Tip đang chờ hệ thống xác nhận thanh toán.</p> : null}
          </div>
        ) : null}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link href="/user" className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">Xem đơn hàng</Link>
          <Link href="/products" className="rounded-xl bg-[#ff8d28] px-4 py-3 text-sm font-bold text-white hover:bg-orange-600">Tiếp tục mua sắm</Link>
        </div>
      </section>
    </main>
  );
}
