import { extractImageUrl, normalizeImageList } from "@/lib/image";
import type { Product } from "@/types/product";
import { getProductById } from "./productService";
import axiosInstance from "../utils/axios";

export type CartApiItem = Product & { quantity: number; id: string };

const getRawCartItems = (payload: any): any[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.cart)) return payload.cart;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.products)) return payload.products;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.cart)) return payload.data.cart;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.data?.products)) return payload.data.products;
  if (Array.isArray(payload?.user?.cart)) return payload.user.cart;
  if (Array.isArray(payload?.user?.items)) return payload.user.items;
  return [];
};

const normalizeCartItem = (item: any): CartApiItem | null => {
  const productSource =
    item?.product ||
    (typeof item?.productId === "object" ? item.productId : null) ||
    item?.item ||
    item;

  const rawId =
    (typeof item?.productId === "string" ? item.productId : "") ||
    productSource?._id ||
    productSource?.id ||
    item?._id ||
    item?.id ||
    "";

  const id = String(rawId || "").trim();
  if (!id) return null;

  const productImages = normalizeImageList(productSource?.images);
  const itemImages = normalizeImageList(item?.images);
  const image =
    extractImageUrl(productSource?.image) ||
    productImages[0] ||
    extractImageUrl(item?.image) ||
    itemImages[0] ||
    "";

  const images = productImages.length
    ? productImages
    : itemImages.length
      ? itemImages
      : image
        ? [image]
        : [];

  return {
    ...productSource,
    _id: String(productSource?._id || productSource?.id || id),
    id,
    name: productSource?.name || productSource?.title || item?.name || item?.title || "",
    title: productSource?.title || item?.title,
    description: productSource?.description || item?.description || "",
    brand: productSource?.brand || item?.brand,
    price: Number(productSource?.price ?? item?.price ?? 0) || 0,
    image,
    images,
    tags: Array.isArray(productSource?.tags)
      ? productSource.tags
      : Array.isArray(item?.tags)
        ? item.tags
        : [],
    quantity: Math.max(1, Number(item?.count ?? item?.quantity ?? item?.qty ?? 1) || 1),
  };
};

const enrichMissingProductDetails = async (item: CartApiItem): Promise<CartApiItem> => {
  const hasImage = Boolean(item.image || (Array.isArray(item.images) && item.images.length > 0));
  const needsDetails = !(item.name || item.title) || Number(item.price || 0) <= 0 || !hasImage;
  if (!needsDetails) return item;

  try {
    const productData: any = await getProductById(item.id);
    const product = (productData?.data || productData) as Product;
    const productImages = normalizeImageList(product.images);
    const image = extractImageUrl(product.image) || productImages[0] || item.image;

    return {
      ...product,
      id: String(product.id || product._id || item.id),
      _id: String(product._id || product.id || item.id),
      name: product.name || product.title || item.name,
      title: product.title || item.title,
      description: product.description || item.description,
      price: Number(product.price ?? item.price ?? 0) || 0,
      quantity: item.quantity,
      image,
      images: productImages.length ? productImages : item.images,
    };
  } catch {
    return item;
  }
};

const normalizeCartItems = async (payload: any) => {
  const normalized = getRawCartItems(payload)
    .map(normalizeCartItem)
    .filter((item): item is CartApiItem => Boolean(item));

  return Promise.all(normalized.map(enrichMissingProductDetails));
};

const cartService = {
  getItems: async () => {
    try {
      const data: any = await axiosInstance.get("/users/me/cart");
      return normalizeCartItems(data.data || data);
    } catch {
      const me: any = await axiosInstance.get("/users/me");
      return normalizeCartItems(me.data || me);
    }
  },

  addItem: async (productId: string, count = 1) => {
    const data: any = await axiosInstance.post("/users/me/cart", { productId, count });
    return data.data || data;
  },

  updateItem: async (productId: string, count: number) => {
    const data: any = await axiosInstance.put("/users/me/cart", { productId, count });
    return data.data || data;
  },

  removeItem: async (productId: string) => {
    const data: any = await axiosInstance.delete(`/users/me/cart/${encodeURIComponent(productId)}`);
    return data.data || data;
  },

  clear: async () => {
    const data: any = await axiosInstance.delete("/users/me/cart/clear");
    return data.data || data;
  },
};

export default cartService;

// Legacy exports for compatibility
export const getCartItemsApi = cartService.getItems;
export const addToCartApi = cartService.addItem;
export const updateCartItemApi = cartService.updateItem;
export const removeCartItemApi = cartService.removeItem;
export const clearCartApi = cartService.clear;
