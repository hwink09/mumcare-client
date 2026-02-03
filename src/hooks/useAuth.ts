import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/types/product";
import { getCurrentUser, logoutUser } from "@/services/userService";

export interface CurrentUser {
  _id?: string;
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMe = async () => {
    try {
      const me = await getCurrentUser();
      setUser(me?.user ?? me);
      setIsLoggedIn(true);
    } catch {
      setUser(null);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setLoading(false);
      return;
    }
    void loadMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onLoggedIn = async () => {
    setLoading(true);
    await loadMe();
  };

  const onLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // ignore
    }
    localStorage.removeItem("accessToken");
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

export type CartItem = Product & { quantity: number };

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (product: Product) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      if (existing) {
        return prev.map((p) => (p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p));
      }
      return [...prev, { ...product, quantity: 1 }];
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
