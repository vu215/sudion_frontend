"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCartCount } from "@/app/cart-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

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

const typeLabels = {
  all: "Tất cả danh mục",
  1: "Máy ảnh (Mirrorless)",
  2: "Ống kính (Lens)",
  3: "Phụ kiện (Accessory)",
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState(""); // "" | "asc" | "desc"

  const [openCatDropdown, setOpenCatDropdown] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [category, sort]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      let url = `${API_URL}/products?`;
      if (category !== "all") url += `idcate=${category}&`;
      if (sort) url += `sort=${sort}&`;
      if (search.trim()) url += `name=${encodeURIComponent(search.trim())}&`;

      const res = await fetch(url);
      const resData = await res.json();
      
      // The API returns the array directly
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
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
    <main className="bg-white min-h-screen font-sans text-slate-900 pb-16">
      <div className="mx-auto w-full max-w-[1440px] px-6 pt-6 md:px-12 lg:px-20">
        <div className="relative mb-10 md:mb-12">
          <div className="relative min-h-[260px] overflow-hidden rounded-[26px] bg-slate-950 shadow-md flex items-center px-8 md:px-16 py-12">
            <img 
              src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1500&q=80" 
              alt="Mua máy ảnh chính hãng" 
              className="absolute inset-0 w-full h-full object-cover opacity-35 object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent" />
            
            <div className="relative z-10 max-w-[650px]">
              <span className="inline-block text-[11px] font-extrabold tracking-wider text-[#ff8d28] uppercase bg-[#ff8d28]/10 px-3 py-1 rounded-full mb-3">
                Sudion Camera Store
              </span>
              <h1 className="text-3xl md:text-5xl font-black text-white leading-tight uppercase">
                Mua bán máy ảnh <br className="hidden md:inline"/> Thiết bị chính hãng
              </h1>
              <p className="mt-3 text-slate-300 text-sm md:text-[15px] font-medium leading-relaxed">
                Khám phá đầy đủ các dòng máy ảnh Mirrorless, Lens và Phụ kiện Sony chuyên nghiệp với chế độ bảo hành chính hãng uy tín từ Sudion Store.
              </p>
            </div>
          </div>

          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-20 w-[calc(100%-48px)] sm:w-[calc(100%-80px)] md:w-[calc(100%-96px)] lg:w-[calc(100%-112px)] max-w-[920px]">
            <form onSubmit={handleSearchSubmit} className="search-bar-container w-full bg-white rounded-[24px] md:rounded-full p-1.5 md:p-0 md:pl-6 shadow-[0_12px_35px_rgba(0,0,0,0.06)] border border-slate-100/80 flex flex-col md:flex-row md:items-center md:justify-between gap-2.5 md:gap-0 md:h-[48px]">
              {/* Category selector */}
              <div className="flex-1 min-w-0 relative">
                <div onClick={() => setOpenCatDropdown(!openCatDropdown)} className="flex min-h-[40px] items-center gap-2.5 px-4 bg-transparent cursor-pointer select-none">
                  <span className="material-symbols-outlined text-slate-800">filter_alt</span>
                  <span className="text-sm font-bold text-slate-800 truncate">
                    {typeLabels[category as keyof typeof typeLabels] || "Danh mục"}
                  </span>
                </div>
                {openCatDropdown && (
                  <div className="absolute top-[calc(100%+12px)] left-0 w-full bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-slate-100 py-1.5 z-30 min-w-[200px]">
                    {Object.entries(typeLabels).map(([key, val]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => { setCategory(key); setOpenCatDropdown(false); }}
                        className={`w-full text-left px-4 py-2 text-sm font-semibold transition cursor-pointer block ${
                          category === key ? "text-[#ff8d28] bg-slate-50" : "text-slate-700 hover:bg-slate-50 hover:text-[#ff8d28]"
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Sort selector */}
              <div className="flex-1 min-w-0 relative">
                <div onClick={() => {}} className="flex min-h-[40px] items-center gap-2.5 px-4 bg-transparent cursor-pointer select-none">
                  <span className="material-symbols-outlined text-slate-800">sort_by_alpha</span>
                  <select 
                    value={sort} 
                    onChange={(e) => setSort(e.target.value)}
                    className="text-sm font-bold text-slate-800 outline-none bg-transparent border-0 w-full cursor-pointer"
                  >
                    <option value="">Sắp xếp sản phẩm</option>
                    <option value="asc">Sắp xếp tên: A-Z</option>
                    <option value="desc">Sắp xếp tên: Z-A</option>
                  </select>
                </div>
              </div>

              {/* Search text */}
              <div className="flex-[1.2] min-w-0">
                <div className="flex min-h-[40px] items-center gap-2.5 px-4">
                  <span className="material-symbols-outlined text-slate-800">search</span>
                  <input 
                    type="text" 
                    placeholder="Tìm tên máy ảnh, ống kính..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full text-sm font-semibold outline-none border-0 text-slate-800 placeholder-slate-400 bg-transparent"
                  />
                </div>
              </div>

              <div className="p-0.5 md:p-0">
                <button type="submit" className="flex h-[46px] md:h-[48px] items-center justify-center gap-2 rounded-[20px] md:rounded-r-full md:rounded-l-none bg-gradient-to-r from-[#ff5e00] to-[#ff3c00] px-8 text-[15px] font-extrabold text-white transition hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap w-full md:w-auto cursor-pointer">
                  Tìm kiếm
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="pt-10 md:pt-14">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#ff8d28] border-t-transparent mb-4"></div>
              <p className="text-slate-500 font-bold">Đang tải danh sách máy ảnh...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-red-500 font-extrabold text-lg">{error}</p>
              <button onClick={fetchProducts} className="mt-4 px-6 py-2 bg-[#ff8d28] text-white font-extrabold rounded-full shadow hover:bg-orange-600 transition">Thử lại</button>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-100">
              <span className="material-symbols-outlined text-6xl text-slate-300">camera_roll</span>
              <p className="mt-4 text-slate-600 font-bold text-lg">Không tìm thấy sản phẩm nào phù hợp.</p>
              <p className="text-slate-400 text-sm mt-1">Hãy thử tìm kiếm với từ khóa khác.</p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase">
                  Sản phẩm chính hãng ({products.length})
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {products.map((item) => (
                  <div key={item.id} className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200/60 overflow-hidden flex flex-col transition-all duration-300">
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                      <img 
                        src={getProductImage(item)} 
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {item.hot === 1 && (
                        <div className="absolute top-3 left-3 bg-[#ff8d28] text-white px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                          MỚI
                        </div>
                      )}
                      {item.sale_price > 0 && item.sale_price < item.price && (
                        <div className="absolute top-3 right-3 bg-red-500 text-white px-2.5 py-1 rounded-full text-[10px] font-extrabold shadow-sm">
                          -{Math.round(((item.price - item.sale_price) / item.price) * 100)}%
                        </div>
                      )}
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="text-[11px] font-extrabold text-[#ff8d28] uppercase tracking-wide">
                          {item.category_name}
                        </div>
                        <h3 className="mt-1.5 text-[16px] font-extrabold text-slate-800 line-clamp-1 group-hover:text-[#ff8d28] transition-colors">
                          {item.name}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      <div className="mt-5 pt-4 border-t border-slate-50">
                        <div className="flex items-end justify-between gap-2">
                          <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase">Giá bán</div>
                            <div className="flex items-baseline gap-1.5 flex-wrap">
                              <span className="text-md font-black text-slate-800">
                                {formatPrice(item.sale_price || item.price)}
                              </span>
                              {item.sale_price > 0 && item.sale_price < item.price && (
                                <span className="text-xs text-slate-400 line-through font-medium">
                                  {formatPrice(item.price)}
                                </span>
                              )}
                            </div>
                          </div>

                          <Link href={`/products/${item.slug}`} className="inline-flex items-center justify-center rounded-xl bg-slate-900 text-white font-extrabold text-xs px-4 py-2.5 hover:bg-[#ff8d28] transition-colors cursor-pointer shadow-sm shadow-slate-900/10">
                            Xem chi tiết
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
