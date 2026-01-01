import { useUser, useIsAuthenticated } from "@/config/store/authStore";
import type { ReactNode } from "react";

interface RequireRoleProps {
  /** Roles allowed to see this UI */
  allowedRoles?: string[];

  /** UI to render when allowed */
  children: ReactNode;

  /** Rendered when access is denied (default: nothing) */
  fallback?: ReactNode;
}

export const RequireRole = ({
  allowedRoles = [],
  children,
  fallback = null,
}: RequireRoleProps) => {
  const isAuthenticated = useIsAuthenticated();
  const user = useUser();

  // Not logged in → hide UI
  if (!isAuthenticated || !user) {
    return fallback;
  }

  // Role not allowed → hide UI
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role as string)) {
    return fallback;
  }

  // Allowed → render
  return <>{children}</>;
};

export default RequireRole;
