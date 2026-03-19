import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { normalizeRole } from "@/lib/roleAccess";

interface ProtectedRouteProps {
  isLoggedIn: boolean;
  userRole?: string | null;
  allowRoles?: string[];
  children?: ReactNode;
}

export function ProtectedRoute({
  isLoggedIn,
  userRole,
  allowRoles,
  children,
}: ProtectedRouteProps) {
  const location = useLocation();
  const currentPath = `${location.pathname}${location.search}${location.hash}`;

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ redirectTo: currentPath }} />;
  }

  if (allowRoles?.length) {
    const allowedRoles = allowRoles.map((role) => normalizeRole(role));
    const currentRole = normalizeRole(userRole);

    if (!allowedRoles.includes(currentRole)) {
      return <Navigate to="/403" replace state={{ from: currentPath }} />;
    }
  }

  return children ?? <Outlet />;
}
