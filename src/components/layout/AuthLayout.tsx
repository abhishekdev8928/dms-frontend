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
      {/* <div className="top-header flex justify-between w-full py-4 px-6 lg:hidden ">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <Package2 className="h-6 w-6" />
          <span>DMS</span>
        </Link>

        <Globe2Icon />
      </div> */}
      <div className="flex min-h-svh w-full lg:flex-row flex-col items-center justify-center py-6">
       <div className="w-full lg:w-1/2 md:w-1/1 relative lg:overflow-hidden ">
        <img src="/bg/login-bg.png" alt="" className="lg:h-[100vh] h-[400px] w-[100%]" />
        <h2 className="font-[800] lg:text-[200px] text-[100px] absolute bottom-[-00px]  lg:bottom-[-120px]  w-[100%] text-center text-white m-0 p-0">DMS</h2>
      </div>
      <div className="w-full lg:w-1/2 md:w-1/1 lg:px-[68px] px-[30px]">
      <Outlet />
      </div>
      </div>
    </div>
  );
};

export default AuthLayout;