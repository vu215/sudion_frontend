export interface ProductVariant {
  _id?: string;
  ten: string;
  gia: number;
  ton_kho: number;
  hinh_anh: string;
}

export interface ProductDetailSpec {
  nhom: string;
  nd: string;
}

export interface LegacyVariant {
  _id: string;
  name: string;
  productId: string;
  img?: string;
  price: number;
  sale: number;
}

export interface Product {
  _id: string;
  id: number;
  slug?: string;
  ma_model?: string;
  name?: string;
  ten_san_pham?: string;
  danh_muc?: string;
  bo_suu_tap?: string[];
  bien_the?: ProductVariant[];
  thong_so?: Record<string, string>;
  thong_so_chi_tiet?: ProductDetailSpec[];
  mo_ta?: string;
  description?: string;
  bai_viet_mo_ta?: string;
  chinh_sach?: {
    bao_hanh?: string;
    qua_tang?: string[];
  };
  categoryId?: {
    _id: string;
    name: string;
  };
  img?: string;
  hinh_anh?: {
    thumbnail_chinh?: string;
    thumbnails_phu?: string[];
    anh_tach_nen?: string;
    gallery?: string[];
  };
  price?: number;
  gia_ban?: number;
  sale?: number;
  hot?: number;
  variants?: LegacyVariant[];
}
  
export interface CartItem {
  id: string;
  productId: string;
  ten_san_pham: string;
  gia_ban: number;
  hinh_anh: string;
  so_luong: number;
  bien_the?: string;
}
