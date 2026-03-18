import {
  BrowserRouter as Router,
  Navigate,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useAuth, useCart } from "@/hooks/useAuth";
import { MainLayout } from "@/layouts/MainLayout";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "@/pages/auth/ResetPasswordPage";
import { StaffDashboardPage } from "@/pages/staff/StaffDashboardPage";
import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage";
import { AdminProductCreatePage } from "@/pages/admin/AdminProductCreatePage";
import { AdminProductEditPage } from "@/pages/admin/AdminProductEditPage";
import { AdminCategoryEditPage } from "@/pages/admin/AdminCategoryEditPage";
import { BlogDetailPage } from "@/pages/blogs/BlogDetailPage";
import { BlogListPage } from "@/pages/blogs/BlogListPage";
import { ClientCreateBlogPage } from "@/pages/blogs/ClientCreateBlogPage";
import { AboutPage } from "@/pages/About";
import { ContactPage } from "@/pages/Contact";
import { CartPage } from "@/pages/member/CartPage";
import { CheckoutPage } from "@/pages/member/CheckoutPage";
import { LoyaltyPage } from "@/pages/member/LoyaltyPage";
import { OrdersPage } from "@/pages/member/OrdersPage";
import { OrderDetailPage } from "@/pages/member/OrderDetailPage";
import { ProfilePage } from "@/pages/member/ProfilePage";
import { CouponsPage } from "@/pages/member/CouponsPage";
import { MyReviewsPage } from "@/pages/member/MyReviewsPage";
import { ProductDetailPage } from "@/pages/products/ProductDetailPage";
import { ProductListPage } from "@/pages/products/ProductListPage";
import { Header } from "@/components/shared/header";
import { resolvePageRoute } from "@/lib/pageRoutes";
import type { Product } from "@/types/product";

function App() {
  const auth = useAuth();
  const cart = useCart({
    isLoggedIn: auth.isLoggedIn,
    ownerKey: auth.user?._id || auth.user?.id || auth.user?.email || null,
  });

  if (auth.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500">
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <AppRoutes auth={auth} cart={cart} />
    </Router>
  );
}

interface AppRoutesProps {
  auth: ReturnType<typeof useAuth>;
  cart: ReturnType<typeof useCart>;
}

function AppRoutes({ auth, cart }: AppRoutesProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const redirectTo = (location.state as { redirectTo?: string } | null)?.redirectTo || null;

  const goToLogin = (targetPath: string) => {
    navigate("/login", { state: { redirectTo: targetPath } });
  };

  const handleAddToCart = (product: Product) => {
    if (!auth.isLoggedIn) {
      goToLogin(`${location.pathname}${location.search}`);
      return false;
    }

    return cart.addToCart(product);
  };

  const handleCartAccess = () => {
    if (!auth.isLoggedIn) {
      goToLogin("/cart");
      return false;
    }

    navigate("/cart");
    return true;
  };

  const navigateByPage = (page: string) => {
    if (page === "cart" && !auth.isLoggedIn) {
      goToLogin("/cart");
      return;
    }

    navigate(resolvePageRoute(page));
  };

  return (
    <Routes>
      <Route path="/" element={<MainLayout auth={auth} cart={cart} />} />
      <Route
        path="/login"
        element={
          <LoginPage
            onSwitchToRegister={() => navigate("/register", { state: location.state })}
            onLoginSuccess={auth.onLoggedIn}
            redirectPath={redirectTo}
          />
        }
      />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route
        path="/blogs/create"
        element={
          <div className="flex flex-col min-h-screen">
            <Header
              cartItemCount={cart.cartItemCount}
              onCartClick={handleCartAccess}
              onLoginClick={() => navigate("/login")}
              onRegisterClick={() => navigate("/register")}
              isLoggedIn={auth.isLoggedIn}
              user={auth.user || undefined}
              onNavigate={navigateByPage}
              onLogout={auth.onLogout}
            />
            <main className="flex-1">
              <ClientCreateBlogPage user={auth.user} />
            </main>
          </div>
        }
      />
      <Route
        path="/staff"
        element={
          <StaffDashboardPage
            user={auth.user}
            onLogout={auth.onLogout}
            activeTab="orders"
          />
        }
      />
      <Route
        path="/staff/dashboard"
        element={<Navigate to="/staff" replace />}
      />
      <Route
        path="/staff/orders"
        element={
          <StaffDashboardPage
            user={auth.user}
            onLogout={auth.onLogout}
            activeTab="orders"
          />
        }
      />
      <Route
        path="/staff/inventory"
        element={
          <StaffDashboardPage
            user={auth.user}
            onLogout={auth.onLogout}
            activeTab="inventory"
          />
        }
      />
      <Route
        path="/staff/blogs"
        element={
          <StaffDashboardPage
            user={auth.user}
            onLogout={auth.onLogout}
            activeTab="blogs"
          />
        }
      />
      <Route
        path="/staff/vouchers"
        element={
          <StaffDashboardPage
            user={auth.user}
            onLogout={auth.onLogout}
            activeTab="vouchers"
          />
        }
      />
      <Route
        path="/admin"
        element={
          <AdminDashboardPage
            user={auth.user}
            onLogout={auth.onLogout}
            activeTab="reports"
          />
        }
      />
      <Route
        path="/admin/dashboard"
        element={<Navigate to="/admin" replace />}
      />
      <Route
        path="/admin/users"
        element={
          <AdminDashboardPage
            user={auth.user}
            onLogout={auth.onLogout}
            activeTab="users"
          />
        }
      />
      <Route
        path="/admin/products"
        element={
          <AdminDashboardPage
            user={auth.user}
            onLogout={auth.onLogout}
            activeTab="products"
          />
        }
      />
      <Route
        path="/admin/orders"
        element={
          <AdminDashboardPage
            user={auth.user}
            onLogout={auth.onLogout}
            activeTab="orders"
          />
        }
      />
      <Route
        path="/admin/products/create"
        element={
          <AdminProductCreatePage
            user={auth.user}
            onLogout={auth.onLogout}
          />
        }
      />
      <Route
        path="/admin/products/edit/:id"
        element={
          <AdminProductEditPage
            user={auth.user}
            onLogout={auth.onLogout}
          />
        }
      />
      <Route
        path="/admin/categories"
        element={
          <AdminDashboardPage
            user={auth.user}
            onLogout={auth.onLogout}
            activeTab="categories"
          />
        }
      />
      <Route
        path="/admin/categories/edit/:id"
        element={
          <AdminCategoryEditPage
            user={auth.user}
            onLogout={auth.onLogout}
          />
        }
      />
      <Route
        path="/admin/blogs"
        element={
          <AdminDashboardPage
            user={auth.user}
            onLogout={auth.onLogout}
            activeTab="blogs"
          />
        }
      />
      <Route
        path="/admin/vouchers"
        element={
          <AdminDashboardPage
            user={auth.user}
            onLogout={auth.onLogout}
            activeTab="vouchers"
          />
        }
      />
      <Route
        path="/register"
        element={
          <RegisterPage
            onClose={() => navigate(-1)}
            onSwitchToLogin={() => navigate("/login", { state: location.state })}
          />
        }
      />

      <Route
        path="/products"
        element={
          <ProductListPage
            isLoggedIn={auth.isLoggedIn}
            user={auth.user || undefined}
            onLogoutClick={auth.onLogout}
            cartItemCount={cart.cartItemCount}
            onAddToCart={handleAddToCart}
            onCartClick={handleCartAccess}
          />
        }
      />
      <Route
        path="/products/:id"
        element={<ProductDetailPage onAddToCart={handleAddToCart} onGoToCart={handleCartAccess} />}
      />

      <Route
        path="/blogs"
        element={
          <BlogListPage
            onNavigate={navigateByPage}
            onCartClick={handleCartAccess}
            onLoginClick={() => navigate("/login")}
            onRegisterClick={() => navigate("/register")}
            isLoggedIn={auth.isLoggedIn}
            user={auth.user || undefined}
            onLogout={auth.onLogout}
            cartItemCount={cart.cartItemCount}
          />
        }
      />
      <Route
        path="/blogs/:id"
        element={
          <BlogDetailPage
            onNavigate={navigateByPage}
            onCartClick={handleCartAccess}
            onLoginClick={() => navigate("/login", { state: { redirectTo: location.pathname } })}
            onRegisterClick={() => navigate("/register", { state: { redirectTo: location.pathname } })}
            isLoggedIn={auth.isLoggedIn}
            user={auth.user || undefined}
            onLogout={auth.onLogout}
            cartItemCount={cart.cartItemCount}
          />
        }
      />

      <Route
        path="/cart"
        element={
          auth.isLoggedIn ? (
            <CartPage
              isLoggedIn={auth.isLoggedIn}
              items={cart.items}
              onUpdateQuantity={cart.updateQuantity}
              onRemoveItem={cart.removeItem}
              clearCart={cart.clearCart}
            />
          ) : (
            <Navigate to="/login" replace state={{ redirectTo: "/cart" }} />
          )
        }
      />
      <Route
        path="/checkout"
        element={
          auth.isLoggedIn ? (
            <CheckoutPage isLoggedIn={auth.isLoggedIn} cartItems={cart.items} clearCart={cart.clearCart} />
          ) : (
            <Navigate to="/login" replace state={{ redirectTo: "/checkout" }} />
          )
        }
      />
      <Route
        path="/orders"
        element={
          auth.isLoggedIn ? (
            <OrdersPage isLoggedIn={auth.isLoggedIn} />
          ) : (
            <Navigate to="/login" replace state={{ redirectTo: "/orders" }} />
          )
        }
      />
      <Route
        path="/orders/:orderId"
        element={
          auth.isLoggedIn ? (
            <OrderDetailPage />
          ) : (
            <Navigate to="/login" replace state={{ redirectTo: location.pathname }} />
          )
        }
      />
      <Route
        path="/reviews"
        element={
          auth.isLoggedIn ? (
            <MyReviewsPage user={auth.user || undefined} isLoggedIn={auth.isLoggedIn} />
          ) : (
            <Navigate to="/login" replace state={{ redirectTo: "/reviews" }} />
          )
        }
      />
      <Route path="/loyalty" element={<LoyaltyPage />} />
      <Route path="/coupons" element={<CouponsPage user={auth.user} />} />
      <Route path="/profile" element={<ProfilePage initialUser={auth.user || undefined} />} />

      <Route
        path="/contact"
        element={
          <ContactPage
            onNavigate={navigateByPage}
            onCartClick={handleCartAccess}
            onLoginClick={() => navigate("/login")}
            onRegisterClick={() => navigate("/register")}
            isLoggedIn={auth.isLoggedIn}
            user={auth.user || undefined}
            onLogout={auth.onLogout}
            cartItemCount={cart.cartItemCount}
          />
        }
      />
      <Route
        path="/about"
        element={
          <AboutPage
            onNavigate={navigateByPage}
            onCartClick={handleCartAccess}
            onLoginClick={() => navigate("/login")}
            onRegisterClick={() => navigate("/register")}
            isLoggedIn={auth.isLoggedIn}
            user={auth.user || undefined}
            onLogout={auth.onLogout}
            cartItemCount={cart.cartItemCount}
          />
        }
      />
    </Routes>
  );
}

export default App;
