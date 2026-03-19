import { Navigate, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminCategoryEditPage } from "@/pages/admin/AdminCategoryEditPage";
import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage";
import { AdminProductCreatePage } from "@/pages/admin/AdminProductCreatePage";
import { AdminProductEditPage } from "@/pages/admin/AdminProductEditPage";
import type { RouteGroupProps } from "@/routes/types";

export function AdminRoutes({ auth }: RouteGroupProps) {
  return (
    <Route
      element={
        <ProtectedRoute
          isLoggedIn={auth.isLoggedIn}
          userRole={auth.user?.role}
          allowRoles={["admin"]}
        />
      }
    >
      <Route
        path="/admin"
        element={<AdminDashboardPage user={auth.user} onLogout={auth.onLogout} activeTab="reports" />}
      />
      <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />
      <Route
        path="/admin/users"
        element={<AdminDashboardPage user={auth.user} onLogout={auth.onLogout} activeTab="users" />}
      />
      <Route
        path="/admin/products"
        element={
          <AdminDashboardPage user={auth.user} onLogout={auth.onLogout} activeTab="products" />
        }
      />
      <Route
        path="/admin/orders"
        element={<AdminDashboardPage user={auth.user} onLogout={auth.onLogout} activeTab="orders" />}
      />
      <Route
        path="/admin/products/create"
        element={<AdminProductCreatePage user={auth.user} onLogout={auth.onLogout} />}
      />
      <Route
        path="/admin/products/edit/:id"
        element={<AdminProductEditPage user={auth.user} onLogout={auth.onLogout} />}
      />
      <Route
        path="/admin/categories"
        element={
          <AdminDashboardPage user={auth.user} onLogout={auth.onLogout} activeTab="categories" />
        }
      />
      <Route
        path="/admin/categories/edit/:id"
        element={<AdminCategoryEditPage user={auth.user} onLogout={auth.onLogout} />}
      />
      <Route
        path="/admin/blogs"
        element={<AdminDashboardPage user={auth.user} onLogout={auth.onLogout} activeTab="blogs" />}
      />
      <Route
        path="/admin/vouchers"
        element={
          <AdminDashboardPage user={auth.user} onLogout={auth.onLogout} activeTab="vouchers" />
        }
      />
    </Route>
  );
}
