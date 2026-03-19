import { Route } from "react-router-dom";
import { RoleRedirectRoute } from "@/components/auth/RoleRedirectRoute";
import { MainLayout } from "@/layouts/MainLayout";
import { AboutPage } from "@/pages/About";
import { BlogDetailPage } from "@/pages/blogs/BlogDetailPage";
import { BlogListPage } from "@/pages/blogs/BlogListPage";
import { ContactPage } from "@/pages/Contact";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "@/pages/auth/ResetPasswordPage";
import { ProductDetailPage } from "@/pages/products/ProductDetailPage";
import { ProductListPage } from "@/pages/products/ProductListPage";
import type { RouteGroupProps } from "@/routes/types";

export function PublicRoutes({ auth, cart, location, navigate, handlers }: RouteGroupProps) {
  const sharedMarketingPageProps = {
    onNavigate: handlers.navigateByPage,
    onCartClick: handlers.handleCartAccess,
    onLoginClick: () => navigate("/login"),
    onRegisterClick: () => navigate("/register"),
    isLoggedIn: auth.isLoggedIn,
    user: auth.user || undefined,
    onLogout: auth.onLogout,
    cartItemCount: cart.cartItemCount,
  };

  return (
    <Route element={<RoleRedirectRoute userRole={auth.user?.role} />}>
      <Route path="/" element={<MainLayout auth={auth} cart={cart} />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

      <Route
        path="/products"
        element={
          <ProductListPage
            isLoggedIn={auth.isLoggedIn}
            user={auth.user || undefined}
            onLogoutClick={auth.onLogout}
            cartItemCount={cart.cartItemCount}
            onAddToCart={handlers.handleAddToCart}
            onCartClick={handlers.handleCartAccess}
          />
        }
      />
      <Route
        path="/products/:id"
        element={
          <ProductDetailPage
            onAddToCart={handlers.handleAddToCart}
            onGoToCart={handlers.handleCartAccess}
          />
        }
      />

      <Route path="/blogs" element={<BlogListPage {...sharedMarketingPageProps} />} />
      <Route
        path="/blogs/:id"
        element={
          <BlogDetailPage
            onNavigate={handlers.navigateByPage}
            onCartClick={handlers.handleCartAccess}
            onLoginClick={() => navigate("/login", { state: { redirectTo: location.pathname } })}
            onRegisterClick={() =>
              navigate("/register", { state: { redirectTo: location.pathname } })
            }
            isLoggedIn={auth.isLoggedIn}
            user={auth.user || undefined}
            onLogout={auth.onLogout}
            cartItemCount={cart.cartItemCount}
          />
        }
      />

      <Route path="/contact" element={<ContactPage {...sharedMarketingPageProps} />} />
      <Route path="/about" element={<AboutPage {...sharedMarketingPageProps} />} />
    </Route>
  );
}
