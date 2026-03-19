import { Route } from "react-router-dom";
import { AuthRoute } from "@/components/auth/AuthRoute";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import type { RouteGroupProps } from "@/routes/types";

export function GuestRoutes({ auth, location, navigate, handlers }: RouteGroupProps) {
  return (
    <Route
      element={
        <AuthRoute
          isLoggedIn={auth.isLoggedIn}
          userRole={auth.user?.role}
          redirectTo={handlers.redirectTo}
        />
      }
    >
      <Route
        path="/login"
        element={
          <LoginPage
            onSwitchToRegister={() => navigate("/register", { state: location.state })}
            onLoginSuccess={auth.onLoggedIn}
            redirectPath={handlers.redirectTo}
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
    </Route>
  );
}
