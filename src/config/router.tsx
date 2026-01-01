import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ROLES } from "@/config/permissions";

import DepartmentPage from "../pages/Dashboard/DepartmentPage";
import FileVersionHistory from "@/pages/Dashboard/FileVersionHistroy";
import LoginPage from "@/pages/Auth/LoginPage";
import OTPPage from "@/pages/Auth/VerifyOtpPage";
import Resetpassword from "@/pages/Auth/ResetPasswordPage";
import AuthLayout from "@/components/layout/AuthLayout";
import TrashScreen from "@/pages/Dashboard/RestorePage";
import DashboardLayout from "../components/layout/DasboardLayout";
import HomePage from "@/pages/Dashboard/HomePage";
import RightPanelView from "@/pages/Dashboard/ExplorerViewPage";
import NotFoundPage from "@/pages/Common/NotFoundPage";
import ForgetPasswordPage from "@/pages/Auth/ForgotPasswordPage";
import StarredPage from "@/pages/Dashboard/StarredPage";
import UnauthorizedPage from "@/components/common/UnauthorizedPage";
import SharedPage from "@/pages/Dashboard/SharedPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard/department" replace />,
  },

  // ============================================
  // PROTECTED DASHBOARD ROUTES
  // ============================================
  {
    path: "/dashboard",
    element: (
     
        <DashboardLayout />
      
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard/home" replace />,
      },
      {
        path:"shared-with-me",
        element:<SharedPage />

      },
      {
        path: "home",
        element: <HomePage />,
      },
      {
        path: "folder/:parentId",
        element: <RightPanelView />,
      },
      {
        path: "department",
        element: (
          
            <ProtectedRoute allowedRoles={["SUPER_ADMIN","DEPARMENT_OWNER","ADMIN"]}>

            <DepartmentPage />
            
            
            </ProtectedRoute>
          
        ),
      },
      {
        path: "version-history/:documentId",
        element: <FileVersionHistory />,
      },
      {
        path: "restore",
        element: (
          
            <TrashScreen />
          
        ),
      },
      {
        path: "starred",
        element: <StarredPage />,
      },
    ],
  },

  // ============================================
  // PUBLIC AUTH ROUTES
  // ============================================
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "verify-otp",
        element: <OTPPage />,
      },
      {
        path: "forgot-password",
        element: <ForgetPasswordPage />,
      },
      {
        path: "reset-password",
        element: <Resetpassword />,
      },
      {
        index: true,
        element: <Navigate to="/auth/login" replace />,
      },
    ],
  },

  // ============================================
  // ERROR PAGES
  // ============================================
  {
    path: "/unauthorized",
    element: <UnauthorizedPage />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);