"use client";

import { useState } from "react";
import {
  formatPrice,
  getProductCategory,
  getProductDescription,
  getProductImage,
  getProductName,
  getProductVariants,
} from "@/app/lib/product";
import { Product } from "@/app/types/product";

export default function ProductDetailModal({ 
  product, 
  onEdit,
  onDelete
}: { 
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (productId: number) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const variants = getProductVariants(product);

  const handleEditClick = () => {
    setIsOpen(false);
    onEdit(product);
  };

  const handleDeleteClick = () => {
    if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) {
      setIsOpen(false);
      onDelete(product.id);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center rounded-full p-2 text-slate-500 transition-all hover:bg-[#ff8d28] hover:text-white"
        title="Chi tiết"
        type="button"
      >
        <span className="material-symbols-outlined !text-[18px]">visibility</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-[28px] border border-slate-100 bg-[#f7f7fb] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-slate-200 bg-white px-6 py-5 sm:px-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#ff8d28]">
                    Chi tiết sản phẩm
                  </p>
                  <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-slate-950">
                    {getProductName(product)}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {getProductCategory(product)}
                  </p>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-2 text-slate-400 transition-colors hover:bg-orange-50 hover:text-[#ff8d28]"
                  type="button"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            <div className="overflow-y-auto p-6 sm:p-8" style={{ maxHeight: "calc(90vh - 88px)" }}>
              <div className="grid gap-6 lg:grid-cols-[280px,1fr]">
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white p-4">
                    <img
                      src={getProductImage(product)}
                      alt={getProductName(product)}
                      className="aspect-square w-full rounded-[18px] object-cover"
                    />
                  </div>

                  <div className="rounded-[24px] border border-orange-100 bg-orange-50/20 p-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#ff8d28]">
                      Mô tả nhanh
                    </p>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {getProductDescription(product)}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-[22px] border border-slate-200 bg-white p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff8d28]">
                        Biến thể
                      </p>
                      <p className="mt-3 text-3xl font-black">{variants.length}</p>
                    </div>

                    <div className="rounded-[22px] border border-slate-200 bg-white p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff8d28]">
                        Loại sản phẩm
                      </p>
                      <p className="mt-3 text-sm font-bold uppercase tracking-tight">
                        {getProductCategory(product)}
                      </p>
                    </div>

                    <div className="rounded-[22px] border border-slate-200 bg-white p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff8d28]">
                        Tình trạng
                      </p>
                      <p className="mt-3 text-sm font-bold uppercase tracking-tight text-[#ff8d28]">
                        Đang hoạt động
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black uppercase tracking-[0.12em] text-slate-900">
                      Các biến thể ({variants.length})
                    </h3>

                    <button
                      onClick={handleEditClick}
                      className="inline-flex items-center gap-2 rounded-full bg-[#ff8d28] px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-white transition-colors hover:bg-orange-600"
                      title="Thêm biến thể"
                      type="button"
                    >
                      <span className="material-symbols-outlined !text-base">add</span>
                      Thêm biến thể
                    </button>
                  </div>

                  <div className="space-y-3">
                    {variants.length > 0 ? (
                      variants.map((variant) => (
                        <div
                          key={variant._id || variant.ten}
                          className="rounded-[24px] border border-slate-200 bg-white p-4 transition-all hover:border-[#ff8d28]/35"
                        >
                          <div className="flex flex-col gap-4 sm:flex-row">
                            <img
                              src={getProductImage(product, variant)}
                              alt={variant.ten}
                              className="h-24 w-24 rounded-[18px] border border-slate-200 object-cover"
                            />

                            <div className="flex flex-1 items-start justify-between gap-4">
                              <div>
                                <h4 className="text-base font-bold text-slate-900">
                                  {variant.ten}
                                </h4>
                                <p className="mt-1 text-sm text-slate-500">
                                  Tồn kho: {variant.ton_kho ?? 0}
                                </p>
                              </div>

                              <div className="flex items-start gap-3">
                                <div className="text-right">
                                  <p className="text-lg font-black text-[#ff8d28]">
                                    {formatPrice(variant.gia)}
                                  </p>
                                </div>

                                <div className="flex gap-1">
                                  <button
                                    onClick={handleEditClick}
                                    className="inline-flex items-center justify-center rounded-full p-2 text-slate-500 transition-all hover:bg-[#ff8d28] hover:text-white"
                                    title="Sửa"
                                    type="button"
                                  >
                                    <span className="material-symbols-outlined !text-[18px]">
                                      edit
                                    </span>
                                  </button>
                                  <button
                                    onClick={handleDeleteClick}
                                    className="inline-flex items-center justify-center rounded-full p-2 text-slate-500 transition-all hover:bg-red-500 hover:text-white"
                                    title="Xóa"
                                    type="button"
                                  >
                                    <span className="material-symbols-outlined !text-[18px]">
                                      delete
                                    </span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-[24px] border border-dashed border-orange-200 bg-orange-50/5 px-4 py-10 text-center text-sm text-slate-500">
                        Sản phẩm này chưa có biến thể.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
