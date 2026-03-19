import { useLocation, useNavigate } from "react-router-dom";
import { useAuth, useCart } from "@/hooks/useAuth";
import { HomePage } from "@/pages/home/HomePage";
import { resolvePageRoute } from "@/lib/pageRoutes";
import type { Product } from "@/types/product";

interface MainLayoutProps {
  auth: ReturnType<typeof useAuth>;
  cart: ReturnType<typeof useCart>;
}

export function MainLayout({ auth, cart }: MainLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const goToLogin = (redirectTo: string) => {
    navigate("/login", { state: { redirectTo } });
  };

  const handleNavigate = (page: string) => {
    if (page === "cart" && !auth.isLoggedIn) {
      goToLogin("/cart");
      return;
    }

    navigate(resolvePageRoute(page));
  };

  const handleAddToCart = (product: Product) => {
    if (!auth.isLoggedIn) {
      goToLogin(`${location.pathname}${location.search}`);
      return false;
    }

    return cart.addToCart(product);
  };

  return (
    <HomePage
      onNavigate={handleNavigate}
      onAddToCart={handleAddToCart}
      cartItemCount={cart.cartItemCount}
      onLoginClick={() => navigate("/login")}
      onRegisterClick={() => navigate("/register")}
      isLoggedIn={auth.isLoggedIn}
      user={auth.user || undefined}
      onLogoutClick={auth.onLogout}
    />
  );
}
