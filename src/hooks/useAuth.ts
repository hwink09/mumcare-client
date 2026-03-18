import { useEffect, useMemo, useRef, useState } from "react";
import { getToken } from "@/utils/token";
import { extractImageUrl, normalizeImageList } from "@/lib/image";
import type { Product } from "@/types/product";
import { getCurrentUser, logoutUser } from "@/services/userService";
import {
  addToCartApi,
  clearCartApi,
  getCartItemsApi,
  removeCartItemApi,
  updateCartItemApi,
} from "@/services/cartService";

export interface CurrentUser {
  _id?: string;
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  phone?: string;
}

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMe = async () => {
    try {
      const me = await getCurrentUser();
      // User data comes directly from the API
      const userData = (me as any)?._id ? (me as any) : (me as any)?.data || me;
      setUser(userData);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Failed to load user:', error);
      setUser(null);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if token exists in localStorage
    const token = getToken();
    if (token) {
      // Token exists, try to load user data
      void loadMe();
    } else {
      // No token, user not logged in
      setLoading(false);
    }
  }, []);

  const onLoggedIn = async (loggedInUser?: CurrentUser | null) => {
    // Nếu login vừa trả về user, ưu tiên set trực tiếp, tránh phụ thuộc /users/me
    if (loggedInUser && (loggedInUser._id || loggedInUser.id || loggedInUser.email)) {
      setUser(loggedInUser);
      setIsLoggedIn(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    await loadMe();
  };

  const onLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // ignore
    }
    setUser(null);
    setIsLoggedIn(false);
  };

  return {
    isLoggedIn,
    user,
    loading,
    onLoggedIn,
    onLogout,
  };
}

// cart items stored in state always include an `id` string
export type CartItem = Product & { quantity: number; id: string };

type UseCartOptions = {
  isLoggedIn?: boolean;
  ownerKey?: string | null;
};

const GUEST_CART_STORAGE_KEY = "mumcare_guest_cart";
const AUTH_CART_STORAGE_PREFIX = "mumcare_auth_cart_";

const getAuthCartStorageKey = (ownerKey: string) =>
  `${AUTH_CART_STORAGE_PREFIX}${encodeURIComponent(ownerKey)}`;

const normalizeStoredCartItem = (item: any): CartItem | null => {
  const id = String(item?.id || item?._id || "").trim();
  if (!id) return null;

  const images = normalizeImageList(item?.images);
  const image = extractImageUrl(item?.image) || images[0] || "";

  return {
    ...item,
    _id: String(item?._id || item?.id || id),
    id,
    name: item?.name || item?.title || "",
    title: item?.title,
    description: item?.description || "",
    price: Number(item?.price ?? 0) || 0,
    image,
    images,
    quantity: Math.max(1, Number(item?.quantity ?? item?.count ?? 1) || 1),
  };
};

const readStoredCart = (storageKey: string) => {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map(normalizeStoredCartItem)
      .filter((item): item is CartItem => Boolean(item));
  } catch {
    return [];
  }
};

const writeStoredCart = (storageKey: string, items: CartItem[]) => {
  if (items.length === 0) {
    localStorage.removeItem(storageKey);
    return;
  }

  localStorage.setItem(storageKey, JSON.stringify(items));
};

const clearStoredCart = (storageKey: string) => {
  localStorage.removeItem(storageKey);
};

const buildCartItem = (product: Product) => {
  const id = String(product.id || product._id || "").trim();
  const images = normalizeImageList(product.images);
  const image = extractImageUrl(product.image) || images[0] || "";

  return {
    ...product,
    _id: String(product._id || product.id || id),
    id,
    name: product.name || product.title || "",
    title: product.title,
    description: product.description || "",
    price: Number(product.price ?? 0) || 0,
    image,
    images: images.length ? images : image ? [image] : [],
    quantity: 1,
  } as CartItem;
};

const upsertCartItem = (items: CartItem[], product: Product) => {
  const nextItem = buildCartItem(product);
  if (!nextItem.id) return items;

  const existing = items.find((item) => item.id === nextItem.id);
  if (!existing) return [...items, nextItem];

  return items.map((item) =>
    item.id === nextItem.id ? { ...item, quantity: item.quantity + 1 } : item,
  );
};

const setCartItemQuantity = (items: CartItem[], productId: string, quantity: number) => {
  return items
    .map((item) => (item.id === productId ? { ...item, quantity } : item))
    .filter((item) => item.quantity > 0);
};

const withoutCartItem = (items: CartItem[], productId: string) =>
  items.filter((item) => item.id !== productId);

const cartNeedsRefresh = (items: CartItem[]) =>
  items.some((item) => !(item.name || item.title) || Number(item.price || 0) <= 0 || !(item.image || item.images?.length));

export function useCart({ isLoggedIn = false, ownerKey = null }: UseCartOptions = {}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const itemsRef = useRef(items);
  const hydratedOwnerRef = useRef<string | null>(null);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const persistItems = (nextItems: CartItem[]) => {
    if (isLoggedIn && ownerKey) {
      writeStoredCart(getAuthCartStorageKey(ownerKey), nextItems);
      return;
    }

    clearStoredCart(GUEST_CART_STORAGE_KEY);
  };

  useEffect(() => {
    let cancelled = false;

    if (!isLoggedIn) {
      hydratedOwnerRef.current = null;
      clearStoredCart(GUEST_CART_STORAGE_KEY);
      setItems([]);
      return;
    }

    const resolvedOwner = ownerKey || "__authenticated__";
    if (hydratedOwnerRef.current === resolvedOwner) return;

    hydratedOwnerRef.current = resolvedOwner;

    const hydrateCart = async () => {
      const authStorageKey = ownerKey ? getAuthCartStorageKey(ownerKey) : null;
      const cachedAuthItems = authStorageKey ? readStoredCart(authStorageKey) : [];

      if (cachedAuthItems.length > 0 && !cartNeedsRefresh(cachedAuthItems)) {
        if (!cancelled) setItems(cachedAuthItems);
        return;
      }

      try {
        const serverItems = await getCartItemsApi();
        if (cancelled) return;

        if (!serverItems.length && cachedAuthItems.length > 0) {
          setItems(cachedAuthItems);
          return;
        }

        if (!serverItems.length) return;

        setItems(serverItems);
        if (authStorageKey) writeStoredCart(authStorageKey, serverItems);
      } catch (error) {
        if (!cancelled && cachedAuthItems.length > 0) {
          setItems(cachedAuthItems);
        }
        console.error("Failed to hydrate cart from API:", error);
      }
    };

    void hydrateCart();

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, ownerKey]);

  const addToCart = (product: Product) => {
    const productId = String(product.id || product._id || "").trim();
    if (!productId || !isLoggedIn) return false;

    const nextItems = upsertCartItem(itemsRef.current, product);
    setItems(nextItems);
    persistItems(nextItems);

    void addToCartApi(productId, 1).catch((error) => {
      console.error("Failed to sync add-to-cart:", error);
    });

    return true;
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (!isLoggedIn) return false;

    const safeQuantity = Math.max(0, quantity);
    const nextItems =
      safeQuantity > 0
        ? setCartItemQuantity(itemsRef.current, productId, safeQuantity)
        : withoutCartItem(itemsRef.current, productId);

    setItems(nextItems);
    persistItems(nextItems);

    const syncAction =
      safeQuantity > 0
        ? updateCartItemApi(productId, safeQuantity)
        : removeCartItemApi(productId);

    void syncAction.catch((error) => {
      console.error("Failed to sync cart quantity:", error);
    });

    return true;
  };

  const removeItem = (productId: string) => {
    if (!isLoggedIn) return false;

    const nextItems = withoutCartItem(itemsRef.current, productId);
    setItems(nextItems);
    persistItems(nextItems);

    void removeCartItemApi(productId).catch((error) => {
      console.error("Failed to sync cart removal:", error);
    });

    return true;
  };

  const clearCart = () => {
    if (!isLoggedIn) return false;

    setItems([]);
    persistItems([]);

    void clearCartApi().catch((error) => {
      console.error("Failed to sync cart clear:", error);
    });

    return true;
  };

  const cartItemCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);

  return {
    items,
    cartItemCount,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
  };
}
