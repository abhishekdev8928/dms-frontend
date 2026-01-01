import { Navigate } from "react-router-dom";
import { useUser, useIsAuthenticated } from "@/config/store/authStore";
import type { ReactNode } from "react";

// export type Role = "ADMIN" | "SUPER_ADMIN" | "USER" | "DEPT_OWNER";

interface ProtectedRouteProps {
  allowedRoles?: string[];   
  children: ReactNode;     
}

export const ProtectedRoute = ({ allowedRoles = [], children }: ProtectedRouteProps) => {
  const isAuthenticated = useIsAuthenticated();
  const user = useUser();

  // If not logged in → go to login page
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // If roles provided & user.role not matching → go to no-access page
  if (allowedRoles.length > 0 && user.role && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard/home" replace />;
  }

  // Access allowed → render component
  return <>{children}</>;
};

export default ProtectedRoute;
