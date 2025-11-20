import { createBrowserRouter, Navigate } from "react-router-dom";

import DepartmentPage from "../pages/Dashboard/DepartmentPage";
import FileVersionHistory from "@/components/custom/FileVersionHistroy";
import LoginPage from "@/pages/Auth/LoginPage";
import OTPPage from "@/pages/Auth/VerifyOtpPage";
import Resetpassword from "@/pages/Auth/ResetPasswordPage";
import AuthLayout from "@/components/layout/AuthLayout";
import TrashScreen from "@/pages/Dashboard/RestorePage";
import DashboardLayout from "../components/layout/DasboardLayout";
import HomePage from "@/pages/Dashboard/HomePage";
import RightPanelView from "@/pages/Dashboard/RightPanelPage";
import NotFoundPage from "@/pages/Common/NotFoundPage";
import  ForgetPasswordPage  from "@/pages/Auth/ForgotPasswordPage";

export const router = createBrowserRouter([
  // ================================
  // Root path redirect (no render)
  // ================================
  {
    path: "/",
    element: <Navigate to="/dashboard/department" replace />,
  },

  // ================================
  // Dashboard (Protected Area)
  // ================================
  {
    path: "/dashboard",
    element: <DashboardLayout />,
    children: [
      {
        index: true, // when visiting /dashboard directly
        element: <Navigate to="/dashboard/home" replace />,
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
        element: <DepartmentPage />,
      },
      {
        path: "version-history/:documentId",
        element: <FileVersionHistory />,
      },
      {
        path: "restore",
        element: <TrashScreen />,
      },
    ],
  },

  // ================================
  // Authentication (Public Area)
  // ================================
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
        element: <ForgetPasswordPage/>,
      },
      {
        path: "reset-password",
        element: <Resetpassword/>,
      },
      {
        index: true,
        element: <Navigate to="/auth/login" replace />,
      },
    ],
  },

  // ================================
  // Not Found (Fallback)
  // ================================
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
