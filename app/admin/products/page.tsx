"use client";

import { useEffect, useState } from "react";
import AdminLayout from "../_components/admin-layout";
import AdminProductDashboard from "./AdminProductDashboard";
import { Product } from "@/app/types/product";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_URL}/products`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      } else {
        setError("Không thể tải danh sách sản phẩm.");
      }
    } catch (err) {
      console.error(err);
      setError("Đã xảy ra lỗi kết nối máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <AdminLayout active="Bán Máy ảnh">
      {loading ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center bg-white rounded-[24px] border border-slate-100">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ff8d28] border-t-transparent" />
          <p className="mt-4 text-xs font-semibold text-slate-500">Đang tải sản phẩm...</p>
        </div>
      ) : error ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center bg-white rounded-[24px] border border-slate-100 p-6 text-center">
          <p className="text-red-500 font-extrabold text-sm mb-4">{error}</p>
          <button 
            onClick={fetchProducts} 
            className="px-6 py-2 bg-[#ff8d28] text-white font-extrabold rounded-xl shadow hover:bg-orange-600 transition"
          >
            Thử lại
          </button>
        </div>
      ) : (
        <AdminProductDashboard products={products} onRefresh={fetchProducts} />
      )}
    </AdminLayout>
  );
}
