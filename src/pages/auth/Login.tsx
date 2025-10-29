import { AuthLoginForm } from "@/components/auth-form";
import { useMutation } from "@tanstack/react-query";
import { loginUser } from "@/config/api/authApi";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/config/store/useAuthStore";

export default function LoginPage() {
  const navigate = useNavigate();
  const setUnverifiedUser = useAuthStore((state) => state.setUnverifiedUser);

  const { mutate, isPending } = useMutation({
    mutationFn: loginUser,
    onSuccess: (response) => {
      const data = response?.data;
      if (!data) return;

      // ✅ store only userId before OTP verification
      setUnverifiedUser(data.userId);

      toast("Login Successful – OTP Sent ✉️", {
        description: response?.data?.message,
      });

      setTimeout(() => navigate("/auth/verify-otp"), 1500);
    },
    onError: (err: any) => {
      toast("Login Failed ❌", {
        description: err?.response?.data?.message || "Something went wrong. Try again.",
      });
    },
  });

  return (
    <div className="w-full max-w-xs">
      <AuthLoginForm onLogin={mutate} loading={isPending} />
    </div>
  );
}
