// frontend/src/components/ProtectedRoute.jsx

import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/config/store/authStore';

/**
 * ProtectedRoute - Simple role-based route protection
 * 
 * @param {Array<string>} allowedRoles - Array of roles that can access this route
 * @param {React.Component} children - Child component to render
 * @param {string} redirectTo - Where to redirect if unauthorized (default: '/unauthorized')
 */
export const ProtectedRoute = ({ 
  allowedRoles = [], 
  children,
  redirectTo = '/unauthorized' 
}) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const userRole = user?.role;

  // Check if user is logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If no roles specified, just check authentication
  if (allowedRoles.length === 0) {
    return children ? children : <Outlet />;
  }

  // Check if user's role is in allowed roles
  if (allowedRoles.includes(userRole)) {
    return children ? children : <Outlet />;
  }

  // User doesn't have required role - redirect
  return <Navigate to={redirectTo} replace />;
};