import { useEffect, useMemo, useState } from "react";
import { getToken } from "@/utils/token";
import type { Product } from "@/types/product";
import { getCurrentUser, logoutUser } from "@/services/userService";

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

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (product: Product) => {
    const pid = product.id || product._id || "";
    setItems((prev) => {
      const existing = prev.find((p) => p.id === pid);
      if (existing) {
        return prev.map((p) => (p.id === pid ? { ...p, quantity: p.quantity + 1 } : p));
      }
      // spread product and ensure id string present
      return [...prev, { ...product, id: pid, quantity: 1 } as CartItem];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setItems((prev) => prev.map((p) => (p.id === productId ? { ...p, quantity } : p)).filter((p) => p.quantity > 0));
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((p) => p.id !== productId));
  };

  const clearCart = () => setItems([]);

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
