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
    else if (page === "reviews") navigate("/reviews");
    else if (page === "loyalty") navigate("/loyalty");
    else if (page === "blogs") navigate("/blogs");
    else if (page === "cart") navigate("/cart");
    else if (page === "contact") navigate("/contact");
    else if (page === "about") navigate("/about");
    else if (page === "staff-login") navigate("/staff/login");
    else if (page === "admin_dashboard") navigate("/admin/dashboard");
    else if (page === "admin_blogs") navigate("/admin/blogs");
    else if (page === "client_create_blog") navigate("/blogs/create");
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
