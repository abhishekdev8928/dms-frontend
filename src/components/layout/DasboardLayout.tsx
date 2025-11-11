
import {  Navigate, Outlet } from "react-router-dom";
import TopHeader from "../custom/TopHeader";

import { LeftPanelView } from "../tree/LeftPanelView";
import { useIsAuthenticated } from "@/config/store/authStore";

const DashboardLayout = () => {

  const isAuthenticated = useIsAuthenticated();

  // 🧩 If user is logged in → redirect to dashboard
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }
  
  

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      

      <LeftPanelView />
      <div className="flex flex-col">
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <TopHeader />
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;