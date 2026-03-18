import AdminOrderManagementPage from "@/pages/admin/AdminOrderManagementPage";
import {
  BrowserRouter as Router,
  Routes,
  Route,
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
import { AdminUserManagementPage } from "@/pages/admin/AdminUserManagementPage";
import { AdminProductManagementPage } from "@/pages/admin/AdminProductManagementPage";
import { AdminProductCreatePage } from "@/pages/admin/AdminProductCreatePage";
import { AdminProductEditPage } from "@/pages/admin/AdminProductEditPage";
import { AdminCategoryManagementPage } from "@/pages/admin/AdminCategoryManagementPage";
import { AdminBlogManagementPage } from "@/pages/admin/AdminBlogManagementPage";
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

function App() {
  const auth = useAuth();
  const cart = useCart();

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
  const navigate = useNavigate();

  const navigateByPage = (page: string) => {
    navigate(resolvePageRoute(page));
  };

  return (
    <Routes>
      <Route path="/" element={<MainLayout auth={auth} cart={cart} />} />
      <Route
        path="/login"
        element={
          <LoginPage
            onSwitchToRegister={() => navigate("/register")}
            onLoginSuccess={auth.onLoggedIn}
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
              onCartClick={() => navigate("/cart")}
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
          />
        }
      />
      <Route
        path="/admin"
        element={
          <AdminDashboardPage
            user={auth.user}
            onLogout={auth.onLogout}
          />
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <AdminDashboardPage
            user={auth.user}
            onLogout={auth.onLogout}
          />
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminUserManagementPage
            user={auth.user}
            onLogout={auth.onLogout}
          />
        }
      />
      <Route
        path="/admin/products"
        element={
          <AdminProductManagementPage
            user={auth.user}
            onLogout={auth.onLogout}
          />
        }
      />
      <Route
        path="/admin/orders"
        element={<AdminOrderManagementPage />}
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
          <AdminCategoryManagementPage
            user={auth.user}
            onLogout={auth.onLogout}
          />
        }
      />
      <Route
        path="/admin/blogs"
        element={
          <AdminBlogManagementPage
            user={auth.user}
            onLogout={auth.onLogout}
          />
        }
      />
      <Route
        path="/register"
        element={
          <RegisterPage
            onClose={() => navigate(-1)}
            onSwitchToLogin={() => navigate("/login")}
          />
        }
      />

      <Route
        path="/products"
        element={<ProductListPage isLoggedIn={auth.isLoggedIn} user={auth.user || undefined} onLogoutClick={auth.onLogout} />}
      />
      <Route path="/products/:id" element={<ProductDetailPage onAddToCart={cart.addToCart} />} />

      <Route
        path="/blogs"
        element={
          <BlogListPage
            onNavigate={navigateByPage}
            onCartClick={() => navigate("/cart")}
            onLoginClick={() => navigate("/login")}
            onRegisterClick={() => navigate("/register")}
            isLoggedIn={auth.isLoggedIn}
            user={auth.user || undefined}
            onLogout={auth.onLogout}
            cartItemCount={cart.items.length}
          />
        }
      />
      <Route path="/blogs/:id" element={<BlogDetailPage />} />

      <Route
        path="/cart"
        element={<CartPage isLoggedIn={auth.isLoggedIn} items={cart.items} onUpdateQuantity={cart.updateQuantity} onRemoveItem={cart.removeItem} clearCart={cart.clearCart} />}
      />
      <Route path="/checkout" element={<CheckoutPage isLoggedIn={auth.isLoggedIn} cartItems={cart.items} clearCart={cart.clearCart} />} />
      <Route path="/orders" element={<OrdersPage />} />
      <Route path="/orders/:orderId" element={<OrderDetailPage />} />
      <Route path="/reviews" element={<MyReviewsPage user={auth.user || undefined} isLoggedIn={auth.isLoggedIn} />} />
      <Route path="/loyalty" element={<LoyaltyPage />} />
      <Route path="/coupons" element={<CouponsPage user={auth.user} />} />
      <Route path="/profile" element={<ProfilePage initialUser={auth.user || undefined} />} />

      <Route
        path="/contact"
        element={
          <ContactPage
            onNavigate={navigateByPage}
            onCartClick={() => navigate("/cart")}
            onLoginClick={() => navigate("/login")}
            onRegisterClick={() => navigate("/register")}
            isLoggedIn={auth.isLoggedIn}
            user={auth.user || undefined}
            onLogout={auth.onLogout}
            cartItemCount={cart.items.length}
          />
        }
      />
      <Route
        path="/about"
        element={
          <AboutPage
            onNavigate={navigateByPage}
            onCartClick={() => navigate("/cart")}
            onLoginClick={() => navigate("/login")}
            onRegisterClick={() => navigate("/register")}
            isLoggedIn={auth.isLoggedIn}
            user={auth.user || undefined}
            onLogout={auth.onLogout}
            cartItemCount={cart.items.length}
          />
        }
      />
    </Routes>
  );
}

export default App;
