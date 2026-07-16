"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  formatPrice,
  getProductBasePrice,
  getProductCategory,
  getProductDescription,
  getProductImage,
  getProductName,
  getProductVariants,
  matchesKeyword,
} from "@/app/lib/product";
import { Product } from "@/app/types/product";
import ProductDetailModal from "./ProductDetailModal";
import ProductModal from "./ProductModal";

const PAGE_SIZE = 6;
const ALL_CATEGORY = "Tất cả sản phẩm";

type ProductStatus = {
  label: string;
  dotClassName: string;
  textClassName: string;
  containerClassName: string;
};

function getInventory(product: Product) {
  const variants = getProductVariants(product);
  return variants.reduce((sum, variant) => sum + Math.max(variant.ton_kho ?? 0, 0), 0);
}

function getStatus(product: Product): ProductStatus {
  const variants = getProductVariants(product);
  const inventory = getInventory(product);
  const hasRealInventory = variants.some((variant) => (variant.ton_kho ?? 0) > 0);

  if (hasRealInventory && inventory > 5) {
    return {
      label: "Sẵn hàng",
      dotClassName: "bg-emerald-500 animate-pulse",
      textClassName: "text-emerald-600",
      containerClassName: "bg-emerald-50 text-emerald-700",
    };
  }

  if (hasRealInventory) {
    return {
      label: "Sắp hết",
      dotClassName: "bg-amber-500",
      textClassName: "text-amber-600",
      containerClassName: "bg-amber-50 text-amber-700",
    };
  }

  return {
    label: "Hết hàng",
    dotClassName: "bg-rose-500",
    textClassName: "text-rose-600",
    containerClassName: "bg-rose-50 text-rose-700",
  };
}

export default function AdminProductDashboard({
  products,
  onRefresh,
}: {
  products: Product[];
  onRefresh: () => void;
}) {
  const [keyword, setKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORY);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);

  const openAddModal = () => {
    setEditingProduct(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = async (product: Product) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${API_URL}/products/${product.id}`);
      if (res.ok) {
        const fullProduct = await res.json();
        setEditingProduct(fullProduct);
        setIsModalOpen(true);
      } else {
        alert("Không thể tải thông tin chi tiết sản phẩm.");
      }
    } catch (err) {
      console.error("Fetch product error:", err);
      alert("Lỗi khi tải chi tiết sản phẩm.");
    }
  };

  const handleDelete = async (productId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) return;

    try {
      const token = typeof window !== "undefined" ? window.localStorage.getItem("sudion_token") : null;
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${API_URL}/products/${productId}`, {
        method: "DELETE",
        headers,
      });

      if (res.ok) {
        onRefresh();
      } else {
        const data = await res.json();
        alert(data.message || "Không thể xóa sản phẩm");
      }
    } catch (err) {
      alert("Lỗi kết nối đến máy chủ");
    }
  };

  const categories = useMemo(() => {
    const values = Array.from(
      new Set(products.map((product) => getProductCategory(product)).filter(Boolean)),
    );

    return [ALL_CATEGORY, ...values];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const categoryMatch =
        selectedCategory === ALL_CATEGORY ||
        getProductCategory(product) === selectedCategory;

      return categoryMatch && matchesKeyword(product, keyword);
    });
  }, [keyword, products, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedProducts = filteredProducts.slice(
    (safeCurrentPage - 1) * PAGE_SIZE,
    safeCurrentPage * PAGE_SIZE,
  );

  const stats = useMemo(() => {
    const activeCount = products.length;
    const hotCount = products.filter((product) => product.hot === 1).length;
    const variantCount = products.reduce(
      (sum, product) => sum + getProductVariants(product).length,
      0,
    );

    return { activeCount, hotCount, variantCount };
  }, [products]);

  return (
    <section className="min-h-full">
      <div className="mx-auto flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-[24px] font-black uppercase tracking-tight text-slate-900">
            Quản lý Sản phẩm
          </h1>
          <button
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#ff8d28] px-5 text-xs font-black uppercase tracking-[0.22em] text-white hover:bg-orange-600 transition shadow-[0_12px_24px_rgba(255,141,40,0.15)] cursor-pointer"
            type="button"
            onClick={openAddModal}
          >
            <span className="material-symbols-outlined !text-base">add</span>
            Thêm sản phẩm mới
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_24px_rgba(12,18,32,0.02)]">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
              Tổng sản phẩm
            </p>
            <p className="mt-2 text-3xl font-black text-slate-900">{products.length}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_24px_rgba(12,18,32,0.02)]">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
              Tổng số biến thể
            </p>
            <p className="mt-2 text-3xl font-black text-slate-900">{stats.variantCount}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_24px_rgba(12,18,32,0.02)]">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
              Sản phẩm HOT
            </p>
            <p className="mt-2 text-3xl font-black text-[#ff8d28]">{stats.hotCount}</p>
          </div>
        </div>

        {/* Main Panel */}
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_14px_34px_rgba(12,18,32,0.04)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div className="flex items-center gap-4 overflow-x-auto pb-1 border-b border-slate-100 flex-1">
              {categories.map((category) => {
                const active = selectedCategory === category;
                return (
                  <button
                    key={category}
                    className={`whitespace-nowrap pb-2 text-[11px] font-extrabold uppercase tracking-[0.18em] transition-all cursor-pointer ${
                      active
                        ? "border-b-2 border-[#ff8d28] text-[#ff8d28]"
                        : "text-slate-400 hover:text-[#ff8d28]"
                    }`}
                    onClick={() => {
                      setSelectedCategory(category);
                      setCurrentPage(1);
                    }}
                    type="button"
                  >
                    {category}
                  </button>
                );
              })}
            </div>

            <label className="relative block w-full md:max-w-xs shrink-0">
              <span className="material-symbols-outlined pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                search
              </span>
              <input
                value={keyword}
                onChange={(event) => {
                  setKeyword(event.target.value);
                  setCurrentPage(1);
                }}
                type="text"
                placeholder="Tìm sản phẩm..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-4 text-xs font-semibold outline-none focus:border-[#ff8d28] text-slate-800"
              />
            </label>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full min-w-[800px] border-collapse text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-slate-500">Hình ảnh</th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-slate-500">Tên sản phẩm</th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-slate-500">Danh mục</th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-slate-500 text-center">Trạng thái</th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-slate-500 text-right">Giá niêm yết</th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-slate-500 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedProducts.map((product) => {
                  const variants = getProductVariants(product);
                  const prices = variants.map((v) => v.gia).filter((p) => p > 0);
                  const minPrice = prices.length > 0 ? Math.min(...prices) : getProductBasePrice(product);
                  const maxPrice = prices.length > 1 ? Math.max(...prices) : null;
                  const status = getStatus(product);

                  const price = product.price || 0;
                  const salePriceVal = product.gia_ban || 0;
                  const salePercent = (price > 0 && salePriceVal > 0 && salePriceVal < price)
                    ? Math.round(((price - salePriceVal) / price) * 100)
                    : (product.sale || 0);

                  return (
                    <tr key={product.id} className="group hover:bg-slate-50/40 transition-colors">
                      <td className="px-5 py-4">
                        <div className="size-12 overflow-hidden rounded-lg border border-slate-100 bg-white">
                          <img
                            src={getProductImage(product)}
                            alt={getProductName(product)}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-800 text-sm">{getProductName(product)}</span>
                          {product.hot === 1 && (
                            <span className="rounded bg-orange-50 text-[#ff8d28] border border-orange-100 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider">
                              Hot
                            </span>
                          )}
                          {salePercent > 0 && (
                            <span className="rounded bg-red-50 text-red-500 border border-red-100 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider">
                              -{salePercent}%
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-[10px] text-slate-400 font-semibold uppercase">{variants.length} biến thể</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-extrabold text-slate-600">
                          {getProductCategory(product)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${status.containerClassName}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right font-bold text-slate-800 text-sm">
                        {salePercent > 0 ? (
                          <div>
                            <span className="text-slate-800">{formatPrice(salePriceVal)}</span>
                            <span className="block text-[10px] text-slate-400 line-through font-normal">{formatPrice(price)}</span>
                          </div>
                        ) : (
                          <>
                            {formatPrice(minPrice)}
                            {maxPrice && maxPrice !== minPrice && (
                              <span className="block text-[10px] text-slate-400 font-normal">đến {formatPrice(maxPrice)}</span>
                            )}
                          </>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <ProductDetailModal 
                            product={product} 
                            onEdit={openEditModal} 
                            onDelete={handleDelete}
                          />
                          <button
                            className="inline-flex items-center justify-center rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-[#ff8d28] transition"
                            title="Sửa"
                            type="button"
                            onClick={() => openEditModal(product)}
                          >
                            <span className="material-symbols-outlined !text-[18px]">edit</span>
                          </button>
                          <button
                            className="inline-flex items-center justify-center rounded-full p-2 text-slate-500 hover:bg-red-50 hover:text-red-500 transition"
                            title="Xóa"
                            type="button"
                            onClick={() => handleDelete(product.id)}
                          >
                            <span className="material-symbols-outlined !text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-slate-400 font-semibold text-sm">
                      Không tìm thấy sản phẩm nào phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 text-xs text-slate-500">
            <span>Hiển thị {paginatedProducts.length} trên {filteredProducts.length} sản phẩm</span>
            <div className="flex items-center gap-1">
              <button
                className="flex size-8 items-center justify-center rounded-lg border border-slate-200 hover:bg-[#ff8d28] hover:text-white transition disabled:opacity-40 disabled:cursor-not-allowed"
                disabled={safeCurrentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              >
                <span className="material-symbols-outlined text-sm font-black">chevron_left</span>
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <button
                  key={page}
                  className={`flex size-8 items-center justify-center rounded-lg text-xs font-bold transition ${
                    page === safeCurrentPage
                      ? "bg-[#ff8d28] text-white"
                      : "border border-slate-200 hover:bg-slate-50"
                  }`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
              <button
                className="flex size-8 items-center justify-center rounded-lg border border-slate-200 hover:bg-[#ff8d28] hover:text-white transition disabled:opacity-40 disabled:cursor-not-allowed"
                disabled={safeCurrentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              >
                <span className="material-symbols-outlined text-sm font-black">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={onRefresh}
        product={editingProduct}
      />
    </section>
  );
}
