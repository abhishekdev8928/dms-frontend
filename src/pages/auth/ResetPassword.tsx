import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { resetPassword } from "@/config/api/authApi";
import { useMutation } from "@tanstack/react-query";
import { LoaderCircle, Lock, Shield, CheckCircle2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { search } = useLocation();

  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<string>("");

  const urlParams = new URLSearchParams(search);
  const token = urlParams.get("token");

  const { mutate, isPending } = useMutation({
    mutationFn: resetPassword,
    onSuccess: (data: any) => {
      toast("Password Reset Successful!", {
        description:
          "Your password has been reset successfully. Redirecting to verify OTP...",
      });

      setTimeout(() => {
        navigate(`/auth/verify-otp?userId=${data.userId}`);
      }, 2000);

      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error: any) => {
      toast("Password Reset Failed", {
        description:
          error?.response?.data?.message ||
          "Unable to reset password. Please try again or request a new reset link.",
      });
    },
  });

  useEffect(() => {
    if (!token) {
      toast("Invalid Reset Link", {
        description: "No reset token found. Redirecting to login...",
      });
      navigate("/auth/login");
    }
  }, [token, navigate]);

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (!newPassword || !confirmPassword) {
      setPasswordError("Both password fields are required.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    if (!token) return;

    mutate({ token, newPassword });
  };

  const passwordRequirements = [
    { met: newPassword.length >= 8, text: "At least 8 characters" },
    { met: /[A-Z]/.test(newPassword), text: "One uppercase letter" },
    { met: /[a-z]/.test(newPassword), text: "One lowercase letter" },
    { met: /[0-9]/.test(newPassword), text: "One number" },
  ];

  return (
    <div className="w-full max-w-md flex flex-col gap-6">
      {/* Header Section */}
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
          <Lock className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Reset Your Password</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Create a strong password to secure your account
          </p>
        </div>
      </div>

      <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
        <Field>
          <FieldLabel htmlFor="newPassword">New Password</FieldLabel>
          <Input
            id="newPassword"
            type={showPassword ? "text" : "password"}
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
          <Input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="show-password"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              className="h-4 w-4 rounded-md border-gray-300 text-primary focus:ring-2 focus:ring-primary cursor-pointer"
              disabled={isPending}
            />
            <label
              htmlFor="show-password"
              className="text-sm text-muted-foreground cursor-pointer select-none"
            >
              Show password
            </label>
          </div>
        </Field>

        {passwordError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{passwordError}</p>
          </div>
        )}

        <Field>
          <Button
            className="flex gap-2 items-center justify-center w-full"
            type="submit"
            disabled={isPending}
          >
            {isPending && <LoaderCircle className="animate-spin h-4 w-4" />}
            {isPending ? "Resetting Password..." : "Reset Password"}
          </Button>
        </Field>
      </form>

      {/* Security Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-900 mb-1">Security Tip</p>
            <p className="text-blue-700">
              Use a unique password you haven't used before. Avoid common words
              and personal information.
            </p>
          </div>
        </div>
      </div>

      <FieldDescription className="text-center text-xs">
        By resetting your password, you agree to our{" "}
        <a href="#" className="underline underline-offset-4">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="underline underline-offset-4">
          Privacy Policy
        </a>
        .
      </FieldDescription>
    </div>
  );
};

export default ResetPassword;