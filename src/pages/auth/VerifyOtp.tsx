import { OTPForm } from "@/components/otp-form";
import { verifyOtp } from "@/config/api/authApi";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/config/store/useAuthStore";
export default function OTPPage() {
  const { user, setAuthenticatedUser } = useAuthStore();

  const navigate = useNavigate();

  const { mutate, isPending } = useMutation({
    mutationFn: verifyOtp,
    onSuccess: (response) => {
      const data = response?.data;
      if (!data) return;

      // ✅ Store full auth data after OTP verification
      setAuthenticatedUser({
        userId: data.userId,
        email: data.email,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });

      toast("OTP Verified ✅", {
        description: response?.message || "Verification successful",
      });

      setTimeout(() => navigate("/dashboard/home"), 1500);
    },
    onError: (err: any) => {
      toast("OTP Verification Failed ❌", {
        description:
          err?.response?.data?.message || "Something went wrong. Try again.",
      });
    },
  });

  const onHandleSubmit = (otp: string) => {
    if (!user?.userId) {
      toast("Missing user ID ⚠️", { description: "Please log in again." });
      return;
    }

    mutate({ userId: user.userId, otp });
  };

  return (
    <div className="w-full max-w-xs">
      <OTPForm handler={onHandleSubmit} isPending={isPending} />
    </div>
  );
}
