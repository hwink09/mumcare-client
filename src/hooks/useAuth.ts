import { useState } from "react";
import type { Product } from "@/types/product";

export function useAuth() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const handleLoginClick = () => {
    setShowLogin(true);
    setShowRegister(false);
  };

  const handleRegisterClick = () => {
    setShowRegister(true);
    setShowLogin(false);
  };

  return {
    showLogin,
    setShowLogin,
    showRegister,
    setShowRegister,
    handleLoginClick,
    handleRegisterClick,
  };
}

export function useCart() {
  const [cart, setCart] = useState<Product[]>([]);

  const handleAddToCart = (product: Product) => {
    setCart([...cart, product]);
    console.log(`Added to cart: ${product.name}`);
  };

  return {
    cart,
    handleAddToCart,
  };
}
