"use client";

import { useEffect, useState } from "react";
import { Product } from "@/app/types/product";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const BACKEND_HOST = API_URL.replace(/\/api\/?$/, "");

function resolveImageUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  if (path.startsWith("/")) return `${BACKEND_HOST}${path}`;
  return `${BACKEND_HOST}/uploads/${path}`;
}

interface Category {
  _id: number;
  name: string;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product?: any;
}

interface Variant {
  ten: string;
  gia: number;
  ton_kho: number;
  hinh_anh: string;
}

interface Spec {
  key: string;
  value: string;
}

export default function ProductModal({
  isOpen,
  onClose,
  onSuccess,
  product,
}: ProductModalProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [sale, setSale] = useState<number>(0);
  const [mainStock, setMainStock] = useState<number>(0);
  const [description, setDescription] = useState("");
  const [hot, setHot] = useState<number>(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Advanced states
  const [variants, setVariants] = useState<Variant[]>([]);
  const [specs, setSpecs] = useState<Spec[]>([]);
  const [collections, setCollections] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      if (product) {
        setName(product.ten_san_pham || product.name || "");
        setCategoryId(String(product.category_id || ""));
        const editPrice = Math.round(Number(product.price || 0));
        setPrice(editPrice);
        // Calculate discount % from price vs sale_price
        const editSalePrice = Math.round(Number(product.sale_price || 0));
        if (editPrice > 0 && editSalePrice > 0 && editSalePrice < editPrice) {
          setSale(Math.round(((editPrice - editSalePrice) / editPrice) * 100));
        } else {
          setSale(Number(product.sale || 0));
        }
        setDescription(product.mo_ta || product.description || "");
        setHot(Number(product.hot || 0));
        
        setImagePreview(resolveImageUrl(product.image_url) || null);
        
        // Load variants
        if (product.variants && Array.isArray(product.variants)) {
          const hasRealVariants = product.variants.length > 1 || 
            (product.variants.length === 1 && 
             product.variants[0].ten !== "Chỉ Body (Thân máy)" && 
             product.variants[0].ten !== "Mặc định" && 
             product.variants[0].ten !== "Body đơn");
          
          if (hasRealVariants) {
            setVariants(product.variants.map((v: any) => ({
              ten: v.ten,
              gia: Math.round(Number(v.gia || 0)),
              ton_kho: Number(v.ton_kho || 0),
              hinh_anh: v.hinh_anh
            })));
            setMainStock(0);
          } else if (product.variants.length === 1) {
            setVariants([]);
            setMainStock(Number(product.variants[0].ton_kho || 0));
          } else {
            setVariants([]);
            setMainStock(0);
          }
        } else {
          setVariants([]);
          setMainStock(0);
        }
        
        // Load specs
        if (product.specs && Array.isArray(product.specs)) {
          setSpecs(product.specs.map((item: any) => ({
            key: item.nhom,
            value: item.nd
          })));
        } else {
          setSpecs([]);
        }

        setCollections(Array.isArray(product.bo_suu_tap) ? product.bo_suu_tap.join(", ") : "");
      } else {
        setName("");
        setCategoryId("");
        setPrice(0);
        setSale(0);
        setMainStock(0);
        setDescription("");
        setHot(0);
        setImageFile(null);
        setImagePreview(null);
        setVariants([]);
        setSpecs([]);
        setCollections("");
      }
    }
  }, [isOpen, product]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/products/categories`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVariantImageUpload = async (index: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = typeof window !== "undefined" ? window.localStorage.getItem("sudion_token") : null;
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_URL}/uploads`, {
        method: "POST",
        headers,
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const next = [...variants];
        next[index].hinh_anh = data.data.filename || data.data.url;
        setVariants(next);
      } else {
        alert(data.message || "Lỗi tải ảnh lên.");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối tải ảnh.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("ten_san_pham", name);
      formData.append("categoryId", categoryId);
      
      const categoryName = categories.find(c => String(c._id) === String(categoryId))?.name || "Máy ảnh (Mirrorless)";
      formData.append("danh_muc", categoryName);
      
      formData.append("price", price.toString());
      formData.append("sale", sale.toString());
      // Calculate actual sale_price from discount %
      const salePrice = sale > 0 ? Math.round(price * (1 - sale / 100)) : price;
      formData.append("sale_price", salePrice.toString());
      formData.append("gia_ban", salePrice.toString());
      formData.append("description", description);
      formData.append("hot", hot.toString());

      // Prepare variants
      let finalVariants = [...variants];
      if (finalVariants.length === 0) {
        finalVariants = [{
          ten: "Chỉ Body (Thân máy)",
          gia: price,
          ton_kho: mainStock,
          hinh_anh: ""
        }];
      }
      formData.append("bien_the", JSON.stringify(finalVariants));
      
      // Prepare specs
      const specArray = specs.map(s => ({ nhom: s.key, nd: s.value }));
      formData.append("thong_so", JSON.stringify(specArray));

      if (imageFile) {
        formData.append("img", imageFile);
      } else if (product && product.image_url) {
        formData.append("img", product.image_url);
      }

      const token = typeof window !== "undefined" ? window.localStorage.getItem("sudion_token") : null;
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const url = product
        ? `${API_URL}/products/${product.id}`
        : `${API_URL}/products`;

      const method = product ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers,
        body: formData,
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        onSuccess();
        onClose();
      } else {
        setError(resData.message || "Đã xảy ra lỗi khi lưu sản phẩm.");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Không thể kết nối đến máy chủ. Hãy đảm bảo Backend đang chạy!");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-[28px] border border-slate-100 bg-[#f7f7fb] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-slate-200 bg-white px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#ff8d28]">
                Cấu hình sản phẩm
              </p>
              <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-slate-950">
                {product ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 transition-colors hover:bg-orange-50 hover:text-[#ff8d28]"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-8 bg-white" style={{ maxHeight: "calc(90vh - 100px)" }}>
          {error && (
            <div className="mb-6 rounded-xl bg-red-500/10 p-4 text-sm font-bold text-red-500 border border-red-500/20">
              {error}
            </div>
          )}

          <div className="grid gap-6">
            {/* Tên sản phẩm */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tên sản phẩm</label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-sm outline-none focus:border-[#ff8d28]"
                placeholder="VD: Sony Alpha A7 IV"
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {/* Danh mục */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Danh mục</label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-sm outline-none focus:border-[#ff8d28] h-[52px]"
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Trạng thái Hot */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nổi bật (Hot)</label>
                <select
                  value={hot}
                  onChange={(e) => setHot(Number(e.target.value) || 0)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-sm outline-none focus:border-[#ff8d28] h-[52px]"
                >
                  <option value={0}>Thường</option>
                  <option value={1}>Sản phẩm HOT</option>
                </select>
              </div>
            </div>

            <div className={`grid gap-6 ${variants.length === 0 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
              {/* Giá bán */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Giá niêm yết (VNĐ)</label>
                <input
                  required
                  type="number"
                  value={price === 0 ? "" : price}
                  onChange={(e) => setPrice(Number(e.target.value) || 0)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-sm outline-none focus:border-[#ff8d28]"
                  placeholder="0"
                />
              </div>

              {/* Giảm giá */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Giảm giá (%)</label>
                <input
                  type="number"
                  value={sale === 0 ? "" : sale}
                  onChange={(e) => setSale(Number(e.target.value) || 0)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-sm outline-none focus:border-[#ff8d28]"
                  placeholder="0"
                />
              </div>

              {/* Tồn kho (Chỉ hiển thị khi không có biến thể) */}
              {variants.length === 0 && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Số lượng tồn kho</label>
                  <input
                    type="number"
                    value={mainStock === 0 ? "" : mainStock}
                    onChange={(e) => setMainStock(Number(e.target.value) || 0)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-sm outline-none focus:border-[#ff8d28]"
                    placeholder="0"
                  />
                </div>
              )}
            </div>

            {/* Thông số kỹ thuật */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Thông số kỹ thuật</label>
                <button 
                  type="button"
                  onClick={() => setSpecs([...specs, { key: "", value: "" }])}
                  className="text-[10px] font-bold text-[#ff8d28] hover:underline"
                >
                  + Thêm thông số
                </button>
              </div>
              <div className="grid gap-3">
                {specs.map((spec, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      placeholder="Tên (VD: Cảm biến)"
                      value={spec.key}
                      onChange={(e) => {
                        const newSpecs = [...specs];
                        newSpecs[index].key = e.target.value;
                        setSpecs(newSpecs);
                      }}
                      className="flex-1 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs outline-none focus:border-[#ff8d28]"
                    />
                    <input
                      placeholder="Giá trị (VD: Fullframe Exmor)"
                      value={spec.value}
                      onChange={(e) => {
                        const newSpecs = [...specs];
                        newSpecs[index].value = e.target.value;
                        setSpecs(newSpecs);
                      }}
                      className="flex-1 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs outline-none focus:border-[#ff8d28]"
                    />
                    <button 
                      type="button"
                      onClick={() => setSpecs(specs.filter((_, i) => i !== index))}
                      className="text-red-500 hover:bg-red-50 p-2 rounded"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Biến thể sản phẩm */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Biến thể sản phẩm</label>
                <button 
                  type="button"
                  onClick={() => setVariants([...variants, { ten: "", gia: 0, ton_kho: 10, hinh_anh: "" }])}
                  className="text-[10px] font-bold text-[#ff8d28] hover:underline"
                >
                  + Thêm biến thể tùy chỉnh
                </button>
              </div>

              {/* Suggestions */}
              <div className="flex flex-wrap gap-2 items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Thêm nhanh combo máy ảnh:</span>
                {[
                  { name: "Chỉ Body (Thân máy)", diffPrice: 0 },
                  { name: "Kèm Lens Kit 16-50mm", diffPrice: 2500000 },
                  { name: "Kèm Lens Kit 28-60mm", diffPrice: 7500000 },
                  { name: "Kèm Lens Kit 18-135mm", diffPrice: 9000000 },
                  { name: "Kèm Lens GM 24-70mm", diffPrice: 38000000 }
                ].map((sug) => (
                  <button
                    key={sug.name}
                    type="button"
                    onClick={() => setVariants([...variants, { ten: sug.name, gia: price + sug.diffPrice, ton_kho: 10, hinh_anh: "" }])}
                    className="px-2.5 py-1 text-[10px] font-extrabold rounded-full bg-white border border-slate-200 text-slate-600 hover:border-[#ff8d28] hover:text-[#ff8d28] hover:bg-orange-50/10 transition cursor-pointer"
                  >
                    + {sug.name}
                  </button>
                ))}
              </div>

              <div className="grid gap-4">
                {variants.map((v, index) => (
                  <div key={index} className="rounded-xl border border-slate-200 bg-slate-50/30 p-4">
                    <div className="mb-3 flex justify-between items-center">
                       <span className="text-[10px] font-bold text-slate-400 italic">Biến thể #{index + 1}</span>
                       <button 
                        type="button"
                        onClick={() => setVariants(variants.filter((_, i) => i !== index))}
                        className="text-red-500 hover:underline text-[10px] font-bold"
                      >
                        Xóa
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                       <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase text-slate-500">Tên biến thể</label>
                          <input
                            placeholder="VD: Kèm Lens Kit 28-60mm"
                            value={v.ten}
                            onChange={(e) => {
                              const next = [...variants];
                              next[index].ten = e.target.value;
                              setVariants(next);
                            }}
                            className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs outline-none focus:border-[#ff8d28]"
                          />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase text-slate-500">Giá riêng (VNĐ)</label>
                          <input
                            type="number"
                            value={v.gia === 0 ? "" : v.gia}
                            onChange={(e) => {
                              const next = [...variants];
                              next[index].gia = Number(e.target.value) || 0;
                              setVariants(next);
                            }}
                            className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs outline-none focus:border-[#ff8d28]"
                          />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase text-slate-500">Tồn kho</label>
                          <input
                            type="number"
                            value={v.ton_kho === 0 ? "" : v.ton_kho}
                            onChange={(e) => {
                              const next = [...variants];
                              next[index].ton_kho = Number(e.target.value) || 0;
                              setVariants(next);
                            }}
                            className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs outline-none focus:border-[#ff8d28]"
                          />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase text-slate-500">Ảnh biến thể</label>
                          <div className="flex gap-2 items-center">
                            <input
                              type="text"
                              placeholder="https://..."
                              value={v.hinh_anh}
                              onChange={(e) => {
                                const next = [...variants];
                                next[index].hinh_anh = e.target.value;
                                setVariants(next);
                              }}
                              className="flex-1 rounded-lg border border-slate-200 bg-white p-2 text-xs outline-none focus:border-[#ff8d28] h-[34px]"
                            />
                            <input
                              type="file"
                              accept="image/*"
                              id={`variant-file-${index}`}
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleVariantImageUpload(index, file);
                                }
                              }}
                            />
                            <label
                              htmlFor={`variant-file-${index}`}
                              className="cursor-pointer border border-[#ff8d28] text-[#ff8d28] px-3 py-2 text-[10px] font-bold rounded-lg hover:bg-orange-50 shrink-0 select-none"
                            >
                              Tải ảnh
                            </label>
                          </div>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mô tả */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Mô tả sản phẩm</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-sm outline-none focus:border-[#ff8d28]"
                placeholder="Nhập thông tin chi tiết về sản phẩm..."
              />
            </div>

            {/* Hình ảnh */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Hình ảnh sản phẩm</label>
              <div className="flex items-start gap-4">
                <div className="size-24 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center">
                  {imagePreview ? (
                    <img src={imagePreview} className="h-full w-full object-cover" alt="Preview" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-400">
                      <span className="material-symbols-outlined">image</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="product-image"
                  />
                  <label
                    htmlFor="product-image"
                    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#ff8d28]/40 p-4 text-xs font-bold uppercase tracking-widest text-[#ff8d28] transition-all hover:bg-orange-50/20"
                  >
                    <span className="material-symbols-outlined text-sm">upload_file</span>
                    {imageFile ? "Thay đổi ảnh" : "Chọn ảnh từ máy tính"}
                  </label>
                  <p className="mt-2 text-[10px] text-slate-400 italic">Duy nhất 01 ảnh chính. Dung lượng tối đa 5MB.</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:justify-end border-t border-slate-100 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-8 py-3 text-xs font-black uppercase tracking-widest text-slate-500 transition-all hover:bg-slate-100"
              >
                Hủy bỏ
              </button>
              <button
                disabled={loading}
                type="submit"
                className="rounded-xl bg-[#ff8d28] px-8 py-3 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-orange-500/10 transition-all hover:bg-orange-600 disabled:opacity-50"
              >
                {loading ? "Đang xử lý..." : product ? "Cập nhật sản phẩm" : "Lưu sản phẩm"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
