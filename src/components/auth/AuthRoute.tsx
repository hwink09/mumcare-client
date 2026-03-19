import type { ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getRoleHomePath } from "@/lib/roleAccess";

interface AuthRouteProps {
  isLoggedIn: boolean;
  userRole?: string | null;
  redirectTo?: string | null;
  children?: ReactNode;
}

const AUTH_ONLY_PATHS = new Set(["/login", "/register", "/forgot-password", "/reset-password"]);

const sanitizeRedirectPath = (path?: string | null) => {
  if (!path || !path.startsWith("/")) return null;

  const [pathname] = path.split(/[?#]/);
  if (AUTH_ONLY_PATHS.has(pathname) || pathname.startsWith("/reset-password/")) return null;

  return path;
};

export function AuthRoute({
  isLoggedIn,
  userRole,
  redirectTo,
  children,
}: AuthRouteProps) {
  if (!isLoggedIn) {
    return children ?? <Outlet />;
  }

  const nextPath = sanitizeRedirectPath(redirectTo) ?? getRoleHomePath(userRole);
  return <Navigate to={nextPath} replace />;
}
