import AdminOrderManagementPage from "@/pages/admin/AdminOrderManagementPage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useAuth, useCart } from "@/hooks/useAuth";
import { MainLayout } from "@/layouts/MainLayout";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
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
import { Header } from "@/components/shared/header";
import { AboutPage } from "@/pages/About";
import { ContactPage } from "@/pages/Contact";
import { CartPage } from "@/pages/member/CartPage";
import { CheckoutPage } from "@/pages/member/CheckoutPage";
import { LoyaltyPage } from "@/pages/member/LoyaltyPage";
import { OrdersPage } from "@/pages/member/OrdersPage";
import { ProfilePage } from "@/pages/member/ProfilePage";
import { CouponsPage } from "@/pages/member/CouponsPage";
import { MyReviewsPage } from "@/pages/member/MyReviewsPage";
import { ProductDetailPage } from "@/pages/products/ProductDetailPage";
import { ProductListPage } from "@/pages/products/ProductListPage";

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
      <Routes>
        <Route path="/" element={<MainLayout auth={auth} cart={cart} />} />
        <Route
          path="/login"
          element={
            <LoginPage
              onSwitchToRegister={() => (window.location.href = "/register")}
              onLoginSuccess={auth.onLoggedIn}
            />
          }
        />
        <Route
          path="/blogs/create"
          element={
            <div className="flex flex-col min-h-screen">
              <Header
                cartItemCount={cart.cartItemCount}
                onCartClick={() => (window.location.href = "/cart")}
                onLoginClick={() => (window.location.href = "/login")}
                onRegisterClick={() => (window.location.href = "/register")}
                isLoggedIn={auth.isLoggedIn}
                user={auth.user || undefined}
                onNavigate={(page) => {
                  if (page === "home") window.location.href = "/";
                  else if (page === "products") window.location.href = "/products";
                  else if (page === "admin_dashboard") window.location.href = "/admin/dashboard";
                  else if (page === "admin_blogs") window.location.href = "/admin/blogs";
                  else if (page === "client_create_blog") window.location.href = "/blogs/create";
                }}
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
              onClose={() => window.history.back()}
              onSwitchToLogin={() => (window.location.href = "/login")}
            />
          }
        />

        <Route
          path="/products"
          element={<ProductListPage isLoggedIn={auth.isLoggedIn} user={auth.user || undefined} onLogoutClick={auth.onLogout} />}
        />
        <Route path="/products/:id" element={<ProductDetailPage onAddToCart={cart.addToCart} />} />

        <Route path="/blogs" element={<BlogListPage />} />
        <Route path="/blogs/:id" element={<BlogDetailPage />} />

        <Route
          path="/cart"
          element={<CartPage items={cart.items} onUpdateQuantity={cart.updateQuantity} onRemoveItem={cart.removeItem} />}
        />
        <Route path="/checkout" element={<CheckoutPage isLoggedIn={auth.isLoggedIn} cartItems={cart.items} clearCart={cart.clearCart} />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/reviews" element={<MyReviewsPage />} />
        <Route path="/loyalty" element={<LoyaltyPage />} />
        <Route path="/coupons" element={<CouponsPage user={auth.user} />} />
        <Route path="/profile" element={<ProfilePage initialUser={auth.user || undefined} />} />

        <Route
          path="/contact"
          element={
            <ContactPage
              onNavigate={(page) => {
                if (page === "home") window.location.href = "/";
                else if (page === "products") window.location.href = "/products";
                else if (page === "admin_dashboard") window.location.href = "/admin/dashboard";
                else if (page === "admin_blogs") window.location.href = "/admin/blogs";
                else if (page === "client_create_blog") window.location.href = "/blogs/create";
              }}
              onCartClick={() => (window.location.href = "/cart")}
              onLoginClick={() => (window.location.href = "/login")}
              onRegisterClick={() => (window.location.href = "/register")}
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
              onNavigate={(page) => {
                if (page === "home") window.location.href = "/";
                else if (page === "products") window.location.href = "/products";
                else if (page === "contact") window.location.href = "/contact";
                else if (page === "admin_dashboard") window.location.href = "/admin/dashboard";
                else if (page === "admin_blogs") window.location.href = "/admin/blogs";
                else if (page === "client_create_blog") window.location.href = "/blogs/create";
              }}
              onCartClick={() => (window.location.href = "/cart")}
              onLoginClick={() => (window.location.href = "/login")}
              onRegisterClick={() => (window.location.href = "/register")}
              isLoggedIn={auth.isLoggedIn}
              user={auth.user || undefined}
              onLogout={auth.onLogout}
              cartItemCount={cart.items.length}
            />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
