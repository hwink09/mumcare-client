import { Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleRedirectRoute } from "@/components/auth/RoleRedirectRoute";
import { Header } from "@/components/shared/header";
import { ClientCreateBlogPage } from "@/pages/blogs/ClientCreateBlogPage";
import { CartPage } from "@/pages/member/CartPage";
import { CheckoutPage } from "@/pages/member/CheckoutPage";
import { CouponsPage } from "@/pages/member/CouponsPage";
import { LoyaltyPage } from "@/pages/member/LoyaltyPage";
import { MyReviewsPage } from "@/pages/member/MyReviewsPage";
import { OrderDetailPage } from "@/pages/member/OrderDetailPage";
import { OrdersPage } from "@/pages/member/OrdersPage";
import { ProfilePage } from "@/pages/member/ProfilePage";
import type { RouteGroupProps } from "@/routes/types";

function BlogCreateRouteLayout({ auth, cart, navigate, handlers }: RouteGroupProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header
        cartItemCount={cart.cartItemCount}
        onCartClick={handlers.handleCartAccess}
        onLoginClick={() => navigate("/login")}
        onRegisterClick={() => navigate("/register")}
        isLoggedIn={auth.isLoggedIn}
        user={auth.user || undefined}
        onNavigate={handlers.navigateByPage}
        onLogout={auth.onLogout}
      />
      <main className="flex-1">
        <ClientCreateBlogPage user={auth.user} />
      </main>
    </div>
  );
}

export function MemberRoutes(props: RouteGroupProps) {
  const { auth, cart } = props;

  return (
    <Route element={<ProtectedRoute isLoggedIn={auth.isLoggedIn} userRole={auth.user?.role} />}>
      <Route element={<RoleRedirectRoute userRole={auth.user?.role} />}>
        <Route path="/blogs/create" element={<BlogCreateRouteLayout {...props} />} />
        <Route
          path="/cart"
          element={
            <CartPage
              isLoggedIn={auth.isLoggedIn}
              items={cart.items}
              onUpdateQuantity={cart.updateQuantity}
              onRemoveItem={cart.removeItem}
              clearCart={cart.clearCart}
            />
          }
        />
        <Route
          path="/checkout"
          element={
            <CheckoutPage
              isLoggedIn={auth.isLoggedIn}
              cartItems={cart.items}
              clearCart={cart.clearCart}
            />
          }
        />
        <Route path="/orders" element={<OrdersPage isLoggedIn={auth.isLoggedIn} />} />
        <Route path="/orders/:orderId" element={<OrderDetailPage />} />
        <Route
          path="/reviews"
          element={<MyReviewsPage user={auth.user || undefined} isLoggedIn={auth.isLoggedIn} />}
        />
        <Route path="/loyalty" element={<LoyaltyPage />} />
        <Route path="/coupons" element={<CouponsPage user={auth.user} />} />
        <Route path="/profile" element={<ProfilePage initialUser={auth.user || undefined} />} />
      </Route>
    </Route>
  );
}
