"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getCartCount } from "@/app/cart-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://sudion-backend-production-453b.up.railway.app/api";

interface Product {
  id: number;
  name: string;
  slug: string;
  category_name: string;
  category_id: number;
  price: number;
  sale_price: number;
  image_url: string;
  description: string;
  hot: number;
}

interface CategoryItem {
  id: string;
  name: string;
  slug?: string;
}

const ADMIN_INITIAL_CATEGORIES: CategoryItem[] = [
  { id: "camera", name: "Máy ảnh", slug: "may-anh" },
  { id: "lens", name: "Ống kính", slug: "ong-kinh" },
  { id: "accessories", name: "Phụ kiện", slug: "phu-kien" },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState(""); // "" | "asc" | "desc"
  const [categoriesList, setCategoriesList] = useState<CategoryItem[]>([
    { id: "all", name: "Tất cả danh mục" },
    ...ADMIN_INITIAL_CATEGORIES,
  ]);

  useEffect(() => {
    fetchProducts();
  }, [sort, search]);

  // Sync categories dynamically from Admin localStorage + Backend API
  useEffect(() => {
    function loadCategories() {
      let adminItems: CategoryItem[] = [];

      if (typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem("sudion_admin_product_categories");
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
              adminItems = parsed
                .filter((item: any) => item.published !== false)
                .map((item: any) => ({
                  id: String(item.id),
                  name: String(item.name || item.title || "Danh mục"),
                  slug: String(item.slug || ""),
                }));
            }
          } else {
            // Seed initial admin categories if not stored yet
            localStorage.setItem("sudion_admin_product_categories", JSON.stringify(ADMIN_INITIAL_CATEGORIES));
            adminItems = ADMIN_INITIAL_CATEGORIES;
          }
        } catch (e) {
          adminItems = ADMIN_INITIAL_CATEGORIES;
        }
      }

      if (adminItems.length === 0) {
        adminItems = ADMIN_INITIAL_CATEGORIES;
      }

      setCategoriesList([
        { id: "all", name: "Tất cả danh mục" },
        ...adminItems,
      ]);
    }

    loadCategories();

    // Listen for storage updates when Admin modifies categories
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "sudion_admin_product_categories") {
        loadCategories();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      let url = `${API_URL}/products?`;
      if (sort) url += `sort=${sort}&`;
      if (search.trim()) url += `name=${encodeURIComponent(search.trim())}&`;

      const res = await fetch(url);
      const resData = await res.json();

      if (Array.isArray(resData)) {
        setProducts(resData);
      } else if (resData.success && Array.isArray(resData.data)) {
        setProducts(resData.data);
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

  const displayProducts = useMemo(() => {
    return products.filter((item) => {
      if (category === "all") return true;

      const selCat = categoriesList.find((c) => c.id === category);
      if (!selCat) return true;

      const targetName = selCat.name.trim().toLowerCase();
      const targetSlug = (selCat.slug || "").trim().toLowerCase();

      const pCatName = (item.category_name || (item as any).danh_muc || "").trim().toLowerCase();
      const pCatId = String(item.category_id || "");

      // 1. Match by exact ID
      if (pCatId === selCat.id || selCat.id === String(item.id)) return true;

      // 2. Match standard categories (Máy ảnh / Ống kính / Phụ kiện)
      if (selCat.id === "camera" || targetName.includes("máy ảnh") || targetSlug.includes("may-anh")) {
        return pCatId === "1" || pCatName.includes("máy ảnh") || pCatName.includes("camera");
      }
      if (selCat.id === "lens" || targetName.includes("ống kính") || targetSlug.includes("ong-kinh")) {
        return pCatId === "2" || pCatName.includes("ống kính") || pCatName.includes("lens");
      }
      if (selCat.id === "accessories" || targetName.includes("phụ kiện") || targetSlug.includes("phu-kien")) {
        return pCatId === "3" || pCatName.includes("phụ kiện") || pCatName.includes("accessory");
      }

      // 3. Match custom categories added in Admin by name / slug
      return (
        pCatName.includes(targetName) ||
        targetName.includes(pCatName) ||
        (targetSlug && pCatName.includes(targetSlug)) ||
        (item.name && item.name.toLowerCase().includes(targetName)) ||
        (item.description && item.description.toLowerCase().includes(targetName))
      );
    });
  }, [products, category, categoriesList]);

  const clearFilters = () => {
    setCategory("all");
    setSearch("");
    setSort("");
  };

  const formatPrice = (value: any) => {
    const num = Math.round(Number(value || 0));
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
  };

  const getProductImage = (item: Product) => {
    const backendHost = API_URL.replace(/\/api\/?$/, "");
    if (!item.image_url) return "/default-product.png";
    if (item.image_url.startsWith("http") || item.image_url.startsWith("data:")) {
      return item.image_url;
    }
    if (item.image_url.startsWith("/")) {
      return `${backendHost}${item.image_url}`;
    }
    return `${backendHost}/uploads/${item.image_url}`;
  };

  return (
    <main className="bg-[#faf8fe] min-h-screen font-sans text-slate-900 pb-20 pt-10">
      <div className="mx-auto w-full max-w-[1296px] px-5 sm:px-6 lg:px-0">
        <div className="grid gap-6 md:grid-cols-[280px_1fr] lg:grid-cols-[300px_1fr] items-start">

          {/* Bộ lọc bên trái giống trang photographer */}
          <aside className="rounded-2xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] md:sticky md:top-[100px] md:self-start">
            <div className="flex items-center justify-between border-b border-slate-50 pb-4 mb-6">
              <h2 className="!text-[18px] !font-bold leading-none text-[#24242d] flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-600 text-lg">filter_alt</span>
                Bộ lọc
              </h2>
              <button
                onClick={clearFilters}
                className="!text-[13px] !font-normal text-[#858091] hover:text-[#ff8d28] transition-colors"
              >
                Xóa tất cả
              </button>
            </div>

            <div className="space-y-6">
              {/* Tìm kiếm */}
              <div>
                <h3 className="!text-[14px] !font-bold text-[#252631] mb-3">
                  TÌM KIẾM
                </h3>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tìm tên thiết bị..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ paddingLeft: "42px" }}
                    className="w-full h-11 !text-[13px] !font-semibold rounded-xl border border-slate-200 focus:border-[#ff8d28] focus:ring-1 focus:ring-[#ff8d28]/20 outline-none text-slate-800 bg-slate-50/50 transition-all"
                  />
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                    search
                  </span>
                </div>
              </div>

              {/* Danh mục */}
              <div>
                <h3 className="!text-[14px] !font-bold text-[#252631] mb-3">
                  DANH MỤC
                </h3>
                <div className="space-y-3.5">
                  {categoriesList.map((cat) => {
                    const checked = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className="flex w-full items-center gap-3 text-left !text-[14px] !font-semibold text-slate-600 hover:text-[#ff8d28] transition-colors select-none cursor-pointer"
                      >
                        <span
                          className={`grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full border transition-all ${checked
                              ? "border-[#ff8d28] bg-[#ff8d28]"
                              : "border-slate-300 bg-white"
                            }`}
                        >
                          {checked && (
                            <span className="h-1.5 w-1.5 rounded-full bg-white" />
                          )}
                        </span>
                        <span>{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sắp xếp */}
              <div>
                <h3 className="!text-[14px] !font-bold text-[#252631] mb-3">
                  SẮP XẾP
                </h3>
                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    style={{ paddingLeft: "42px" }}
                    className="w-full h-11 !text-[13px] !font-semibold rounded-xl border border-slate-200 focus:border-[#ff8d28] outline-none bg-slate-50/50 text-slate-700 cursor-pointer appearance-none transition-all"
                  >
                    <option value="">Mặc định</option>
                    <option value="asc">Tên sản phẩm: A - Z</option>
                    <option value="desc">Tên sản phẩm: Z - A</option>
                  </select>
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">
                    sort_by_alpha
                  </span>
                  <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>
            </div>
          </aside>

          {/* Danh sách sản phẩm bên phải */}
          <section className="min-w-0">
            <div className="border-b border-slate-100 pb-4 mb-6">
              <h1 className="text-xl md:text-2xl font-black text-slate-900 uppercase">
                Cửa hàng thiết bị
              </h1>
              <p className="text-xs text-slate-400 font-bold mt-1.5">
                Mua bán máy ảnh & phụ kiện chính hãng bảo hành uy tín
              </p>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl shadow-sm">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#ff8d28] border-t-transparent mb-4"></div>
                <p className="text-slate-400 text-xs font-bold">Đang tải danh sách thiết bị...</p>
              </div>
            ) : error ? (
              <div className="text-center py-20 bg-white rounded-3xl shadow-sm px-6">
                <p className="text-red-500 font-extrabold text-sm mb-4">{error}</p>
                <button
                  onClick={fetchProducts}
                  className="px-6 py-2 bg-[#ff8d28] text-white text-xs font-extrabold rounded-full shadow-sm hover:bg-orange-600 transition"
                >
                  Thử lại
                </button>
              </div>
            ) : displayProducts.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-3xl shadow-sm px-6">
                <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">camera_roll</span>
                <p className="text-slate-500 font-bold text-sm">Không tìm thấy sản phẩm nào phù hợp.</p>
                <p className="text-slate-400 text-xs mt-1 font-medium">Hãy thử thay đổi điều kiện lọc hoặc từ khóa tìm kiếm.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayProducts.map((item) => (
                  <div
                    key={item.id}
                    className="group bg-white rounded-3xl shadow-[0_4px_20px_rgba(15,23,42,.1)] hover:shadow-[0_8px_30px_rgba(15,23,42,.16)] overflow-hidden flex flex-col transition-all duration-300"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-50">
                      <img
                        src={getProductImage(item)}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {item.hot === 1 && (
                        <div className="absolute top-3 left-3 bg-[#ff8d28] text-white px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm">
                          HOT
                        </div>
                      )}
                      {item.sale_price > 0 && item.sale_price < item.price && (
                        <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-0.5 rounded-full text-[9px] font-black shadow-sm">
                          -{Math.round(((item.price - item.sale_price) / item.price) * 100)}%
                        </div>
                      )}
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="text-[9px] font-extrabold text-[#ff8d28] uppercase tracking-wider">
                          {item.category_name}
                        </div>
                        <h3 className="mt-1 text-sm font-extrabold text-slate-800 line-clamp-1 group-hover:text-[#ff8d28] transition-colors">
                          {item.name}
                        </h3>
                        <p className="mt-1 text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-50">
                        <div className="flex items-end justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-[9px] font-bold text-slate-400 uppercase">Giá bán</div>
                            <div className="flex items-baseline gap-1 flex-wrap">
                              <span className="text-sm font-black text-slate-800 block truncate">
                                {formatPrice(item.sale_price || item.price)}
                              </span>
                              {item.sale_price > 0 && item.sale_price < item.price && (
                                <span className="text-[10px] text-slate-400 line-through font-medium block truncate">
                                  {formatPrice(item.price)}
                                </span>
                              )}
                            </div>
                          </div>

                          <Link
                            href={`/products/${item.slug}`}
                            className="inline-flex items-center justify-center rounded-xl bg-slate-900 text-white font-extrabold text-[10px] px-3.5 py-2 hover:bg-[#ff8d28] transition-colors cursor-pointer shadow-sm whitespace-nowrap shrink-0"
                          >
                            Xem chi tiết
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </div>
    </main>
  );
}
