// hooks/useUsers.ts
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAppConfigStore } from "@/config/store/useAppConfigStore";
import { getAllUsers } from "@/config/api/searchApi"; // Import your API helper


// ============================================
// Updated DashboardLayout.tsx
// ============================================
import { Navigate, Outlet } from "react-router-dom";

import TopHeader from "@/components/common/TopHeader";
import NavigationTree from "../explorer/NavigationTree";
import { useIsAuthenticated } from "@/config/store/authStore";

const DashboardLayout = () => {
  const isAuthenticated = useIsAuthenticated();
  const setUserList = useAppConfigStore((state) => state.setUserList);
  

  const { data, isLoading, error } = useQuery({
    queryKey: ["userList"],
    queryFn: getAllUsers,
    staleTime: 5 * 60 * 1000,
  });

  // Sync to store when data arrives
  useEffect(() => {
    if (data) {
      console.log("from here " , data.data)
      setUserList(data.data);
    }
  }, [data, setUserList]);

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <div className="grid bg-[#F5F5F5] h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] overflow-hidden">
      <NavigationTree />
      <div className="flex flex-col h-screen overflow-hidden">
        <TopHeader />
        <main className="flex-1 overflow-hidden px-2">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500">Loading users...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-red-500">Error loading users</div>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
