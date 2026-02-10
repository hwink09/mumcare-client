import { useNavigate } from "react-router-dom";
import { HomePage } from "@/pages/home/HomePage";
import type { useAuth, useCart } from "@/hooks/useAuth";

interface MainLayoutProps {
  auth: ReturnType<typeof useAuth>;
  cart: ReturnType<typeof useCart>;
}

export function MainLayout({ auth, cart }: MainLayoutProps) {
  const navigate = useNavigate();

  const handleNavigate = (page: string) => {
    if (page === "profile") {
      navigate("/profile");
    } else if (page === "orders") {
      navigate("/orders");
    } else if (page === "loyalty") {
      navigate("/loyalty");
    } else if (page === "contact") {
      navigate("/contact");
    } else if (page === "about") {
      navigate("/about");
    } else {
      console.log(`Navigate to: ${page}`);
    }
  };

  return (
    <HomePage
      featuredProducts={[]}
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

