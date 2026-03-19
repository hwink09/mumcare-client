import type { ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getBackofficeRedirectPath } from "@/lib/roleAccess";

interface RoleRedirectRouteProps {
  userRole?: string | null;
  children?: ReactNode;
}

export function RoleRedirectRoute({ userRole, children }: RoleRedirectRouteProps) {
  const redirectPath = getBackofficeRedirectPath(userRole);

  if (redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }

  return children ?? <Outlet />;
}
