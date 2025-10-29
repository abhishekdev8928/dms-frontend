import { GalleryVerticalEnd } from "lucide-react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/config/store/useAuthStore"; // Import your auth store

const AuthLayout = () => {
  const { isAuthenticated, tokens } = useAuthStore();

  // If user is already authenticated with tokens, redirect to dashboard
  if (isAuthenticated && tokens?.accessToken) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Document Management System
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <Outlet />
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src="https://images.unsplash.com/photo-1761437855513-62eadb48008d?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=963"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
};

export default AuthLayout;