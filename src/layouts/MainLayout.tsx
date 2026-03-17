import { useNavigate } from "react-router-dom";
import { useAuth, useCart } from "@/hooks/useAuth";
import { HomePage } from "@/pages/home/HomePage";
import { resolvePageRoute } from "@/lib/pageRoutes";

interface MainLayoutProps {
  auth: ReturnType<typeof useAuth>;
  cart: ReturnType<typeof useCart>;
}

export function MainLayout({ auth, cart }: MainLayoutProps) {
  const navigate = useNavigate();

  const handleNavigate = (page: string) => {
    navigate(resolvePageRoute(page));
  };

  return (
    <HomePage
      onNavigate={handleNavigate}
      onAddToCart={cart.addToCart}
      onLoginClick={() => navigate("/login")}
      onRegisterClick={() => navigate("/register")}
      isLoggedIn={auth.isLoggedIn}
      user={auth.user || undefined}
      onLogoutClick={auth.onLogout}
    />
  );
}
