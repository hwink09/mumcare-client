import { Navigate, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { StaffDashboardPage } from "@/pages/staff/StaffDashboardPage";
import type { RouteGroupProps } from "@/routes/types";

export function StaffRoutes({ auth }: RouteGroupProps) {
  return (
    <Route
      element={
        <ProtectedRoute
          isLoggedIn={auth.isLoggedIn}
          userRole={auth.user?.role}
          allowRoles={["staff"]}
        />
      }
    >
      <Route
        path="/staff"
        element={<StaffDashboardPage user={auth.user} onLogout={auth.onLogout} activeTab="orders" />}
      />
      <Route path="/staff/dashboard" element={<Navigate to="/staff" replace />} />
      <Route
        path="/staff/orders"
        element={<StaffDashboardPage user={auth.user} onLogout={auth.onLogout} activeTab="orders" />}
      />
      <Route
        path="/staff/inventory"
        element={
          <StaffDashboardPage user={auth.user} onLogout={auth.onLogout} activeTab="inventory" />
        }
      />
      <Route
        path="/staff/blogs"
        element={<StaffDashboardPage user={auth.user} onLogout={auth.onLogout} activeTab="blogs" />}
      />
      <Route
        path="/staff/vouchers"
        element={
          <StaffDashboardPage user={auth.user} onLogout={auth.onLogout} activeTab="vouchers" />
        }
      />
      <Route
        path="/staff/chat"
        element={<StaffDashboardPage user={auth.user} onLogout={auth.onLogout} activeTab="chat" />}
      />
    </Route>
  );
}
