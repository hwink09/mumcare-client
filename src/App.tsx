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
import { BlogDetailPage } from "@/pages/blogs/BlogDetailPage";
import { BlogListPage } from "@/pages/blogs/BlogListPage";
import { AboutPage } from "@/pages/About";
import { ContactPage } from "@/pages/Contact";
import { CartPage } from "@/pages/member/CartPage";
import { CheckoutPage } from "@/pages/member/CheckoutPage";
import { LoyaltyPage } from "@/pages/member/LoyaltyPage";
import { OrdersPage } from "@/pages/member/OrdersPage";
import { ProfilePage } from "@/pages/member/ProfilePage";
import { ProductDetailPage } from "@/pages/products/ProductDetailPage";
import { ProductListPage } from "@/pages/products/ProductListPage";

function App() {
  const auth = useAuth();
  const cart = useCart();

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
        <Route path="/products/:id" element={<ProductDetailPage isLoggedIn={auth.isLoggedIn} onAddToCart={cart.addToCart} />} />

        <Route path="/blogs" element={<BlogListPage />} />
        <Route path="/blogs/:id" element={<BlogDetailPage />} />

        <Route
          path="/cart"
          element={<CartPage items={cart.items} onUpdateQuantity={cart.updateQuantity} onRemoveItem={cart.removeItem} />}
        />
        <Route path="/checkout" element={<CheckoutPage isLoggedIn={auth.isLoggedIn} cartItems={cart.items} />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/loyalty" element={<LoyaltyPage />} />
        <Route path="/profile" element={<ProfilePage initialUser={auth.user || undefined} />} />

        <Route
          path="/contact"
          element={
            <ContactPage
              onNavigate={(page) => {
                if (page === "home") window.location.href = "/";
                else if (page === "products") window.location.href = "/products";
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
