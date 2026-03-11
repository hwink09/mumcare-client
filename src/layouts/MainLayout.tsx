import { useNavigate } from "react-router-dom";
import { useAuth, useCart } from "@/hooks/useAuth";
import { HomePage } from "@/pages/home/HomePage";

interface MainLayoutProps {
  auth: ReturnType<typeof useAuth>;
  cart: ReturnType<typeof useCart>;
}

export function MainLayout({ auth, cart }: MainLayoutProps) {
  const navigate = useNavigate();

  const handleNavigate = (page: string) => {
    if (page === "home") navigate("/");
    else if (page === "products") navigate("/products");
    else if (page === "profile") navigate("/profile");
    else if (page === "orders") navigate("/orders");
    else if (page === "loyalty") navigate("/loyalty");
    else if (page === "articles") navigate("/blogs");
    else if (page === "cart") navigate("/cart");
    else if (page === "contact") navigate("/contact");
    else if (page === "about") navigate("/about");
    else console.log(`Navigate to: ${page}`);
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
