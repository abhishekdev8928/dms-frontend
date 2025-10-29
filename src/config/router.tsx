import AuthLayout from "@/layouts/AuthLayout";
import DashboardLayout from "@/layouts/DashbaordLayout";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import LoginPage from "@/pages/auth/Login";
import ResetPassword from "@/pages/auth/ResetPassword";
import OTPPage from "@/pages/auth/VerifyOtp";
import Category from "@/pages/dashboard/Category";
import Department from "@/pages/dashboard/Department";
// import DocumentUploadUI from "@/pages/dashboard/DocumentUpload";
import Subcategory from "@/pages/dashboard/subCategory";
import DepartmentTreeViewer from "@/pages/dashboard/Tree";
import FileVersionHistory from "@/pages/dashboard/FileVersionHistroy";
import { createBrowserRouter, Navigate } from "react-router-dom";
import Home from "@/pages/dashboard/Home";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/auth/login" replace />,
  },

  {
    path: "/dashboard",
    element: <DashboardLayout />,
    children: [
      
    {
      index: true,
      element: <Navigate to="home" replace />,
    },
    {
      path: "home",
      element: <Home />,
    },
    {
      path: "department",
      element: <Department />,
    },
    {
      path: "category",
      element: <Category />,
    },
    {
      path: "subcategory",
      element: <Subcategory />,
    },
    {
      path: "version-histroy",
      element: <FileVersionHistory />,
    }
    ],
  },

  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      { path: "login", element: <LoginPage /> },
      { path: "verify-otp", element: <OTPPage /> },
      { path: "forgot-password", element: <ForgotPassword /> },
      { path: "reset-password", element: <ResetPassword /> },
    ],
  },

  {
    path: "/tree",
    element: <DepartmentTreeViewer />,
  },
]);

export default router;
