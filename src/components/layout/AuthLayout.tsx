import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { useIsAuthenticated } from "@/config/store/authStore";
import { Globe2Icon, Package2 } from "lucide-react";

const AuthLayout = () => {
  const isAuthenticated = useIsAuthenticated();
  const location = useLocation();

  
  const isOtpPage = location.pathname === "/auth/verify-otp";

  
  if (isAuthenticated && !isOtpPage) {
    return <Navigate to="/dashboard/department" replace />;
  }

  // 🧩 Otherwise → show login/register/OTP pages
  return (
    <div className="w-full flex flex-col h-screen">
      <div className="top-header flex justify-between w-full py-4 px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <Package2 className="h-6 w-6" />
          <span>DMS</span>
        </Link>

        <Globe2Icon />
      </div>

      <Outlet />
    </div>
  );
};

export default AuthLayout;