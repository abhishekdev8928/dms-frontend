import { Navigate, Outlet } from "react-router-dom";
import TopHeader from "@/components/common/TopHeader";
import { LeftPanelView } from "../tree/LeftPanelView";
import { useIsAuthenticated } from "@/config/store/authStore";
import { useUploadWarning } from '@/config/store/uploadStore';

const DashboardLayout = () => {
  useUploadWarning();
  const isAuthenticated = useIsAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <div className="grid bg-[#F5F5F5] h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] overflow-hidden">
      <LeftPanelView />
      <div className="flex flex-col h-screen overflow-hidden">
        <TopHeader />
        <main className="flex-1 overflow-hidden px-2">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;