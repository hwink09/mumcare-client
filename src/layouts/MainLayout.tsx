import { useNavigate } from "react-router-dom";
import { HomePage } from "@/pages/home/HomePage";
import { FEATURED_PRODUCTS } from "@/constants/mockData";
import type { useAuth, useCart } from "@/hooks/useAuth";

interface MainLayoutProps {
  auth: ReturnType<typeof useAuth>;
  cart: ReturnType<typeof useCart>;
}

export function MainLayout({ auth, cart }: MainLayoutProps) {
  const navigate = useNavigate();

  return (
    <HomePage
      featuredProducts={FEATURED_PRODUCTS}
      onNavigate={(page) => console.log(`Navigate to: ${page}`)}
      onAddToCart={cart.handleAddToCart}
      onLoginClick={() => navigate("/login")}
      onRegisterClick={() => navigate("/register")}
    />
  );
}
