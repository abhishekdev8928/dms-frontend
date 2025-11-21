import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, type ResetPasswordInput } from "@/utils/validations/AuthValidation";
import { useResetPassword } from "@/hooks/mutations/useAuthMutations";
import { Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useSearchParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function ResetPassword({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: token || "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // TanStack Query mutation
  const resetPasswordMutation = useResetPassword();

  // Watch password to show strength indicator
  const newPassword = watch("newPassword");

  // Update token in form if it changes in URL
  useEffect(() => {
    if (token) {
      register("token", { value: token });
    }
  }, [token, register]);

  // Form submit handler
  const onSubmit = (data: ResetPasswordInput) => {
    resetPasswordMutation.mutate(data);
  };

  // Password strength checker
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: "", color: "" };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

    if (strength <= 2) return { strength, label: "Weak", color: "text-red-500" };
    if (strength <= 3) return { strength, label: "Medium", color: "text-yellow-500" };
    return { strength, label: "Strong", color: "text-green-500" };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  // Show error if no token in URL
  if (!token) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card className="border-0 shadow-none py-[60px] lg:py-1">
          <CardHeader className="lg:px-6 px-0">
            <CardTitle className="lg:text-[30px] text-[28px] text-red-600 text-center">
              Invalid Reset Link
            </CardTitle>
          </CardHeader>
          <CardContent className="lg:px-6 px-0">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                The password reset link is invalid or has expired. Please request a new password reset link.
              </AlertDescription>
            </Alert>
            <div className="mt-4 text-center">
              <Link to="/auth/forgot-password">
                <Button className="bg-[#035C4C]">
                  Request New Reset Link
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-0 shadow-none py-[60px] lg:py-1">
        <CardHeader className="lg:px-6 px-0">
          <CardTitle className="lg:text-[30px] text-[28px] text-[#035C4C] text-center lg:text-start">
            Reset Password
          </CardTitle>
          <p className="text-[#6B7280] text-[14px] mt-2 text-center lg:text-start">
            Enter your new password below. You'll be automatically logged in after resetting.
          </p>
        </CardHeader>
        <CardContent className="lg:px-6 px-0">
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FieldGroup>
              {/* New Password Field */}
              <Field className="gap-2">
                <div className="flex items-center justify-between">
                  <FieldLabel 
                    htmlFor="newPassword" 
                    className="text-[16px] font-bold text-[#374151]"
                  >
                    New Password
                  </FieldLabel>
                  {newPassword && (
                    <span className={`text-[12px] font-medium ${passwordStrength.color}`}>
                      {passwordStrength.label}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="newPassword"
                    className="selection:bg-[#E5E7EB] bg-[#F9FAFB] text-[14px] p-[26px] pr-12 focus-visible:outline-none focus-visible:ring-0 focus-visible:shadow-none border-0"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    {...register("newPassword")}
                    disabled={resetPasswordMutation.isPending}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={resetPasswordMutation.isPending}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.newPassword.message}
                  </p>
                )}
                <p className="text-[12px] text-[#6B7280] mt-1">
                  Must be at least 8 characters with uppercase, lowercase, number, and special character
                </p>
              </Field>

              {/* Confirm Password Field */}
              <Field className="gap-2">
                <div className="flex items-center">
                  <FieldLabel 
                    htmlFor="confirmPassword" 
                    className="text-[16px] font-bold text-[#374151]"
                  >
                    Confirm Password
                  </FieldLabel>
                </div>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    className="selection:bg-[#E5E7EB] bg-[#F9FAFB] text-[14px] p-[26px] pr-12 focus-visible:outline-none focus-visible:ring-0 focus-visible:shadow-none border-0"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    {...register("confirmPassword")}
                    disabled={resetPasswordMutation.isPending}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={resetPasswordMutation.isPending}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </Field>

              {/* Submit Button */}
              <Field>
                <Button
                  type="submit"
                  disabled={resetPasswordMutation.isPending}
                  className="w-full bg-[#035C4C] lg:text-[24px] text-[20px] font-bold lg:p-[32px] p-[30px] hover:bg-[#024537]"
                >
                  {resetPasswordMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting Password...
                    </>
                  ) : (
                    "Reset Password & Login"
                  )}
                </Button>

                <p className="text-[12px] flex items-center justify-center lg:text-center text-start mt-4">
                  <svg
                    className="me-3 lg:mt-0 mt-[3px]"
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5.62501 0C5.73282 0 5.84064 0.0234375 5.93907 0.0679688L10.3524 1.94063C10.868 2.15859 11.2524 2.66719 11.25 3.28125C11.2383 5.60625 10.282 9.86016 6.24376 11.7938C5.85235 11.9813 5.39767 11.9813 5.00626 11.7938C0.967979 9.86016 0.0117294 5.60625 1.06605e-05 3.28125C-0.00233309 2.66719 0.382042 2.15859 0.897667 1.94063L5.31329 0.0679688C5.40939 0.0234375 5.5172 0 5.62501 0ZM5.62501 1.56563V10.425C8.85939 8.85938 9.72892 5.39297 9.75001 3.31406L5.62501 1.56563Z"
                      fill="#035C4C"
                    />
                  </svg>
                  Protected by enterprise-grade security & SSL encryption
                </p>

                <div className="mt-4 text-center">
                  <Link
                    to="/auth/login"
                    className="text-[#035C4C] text-[14px] hover:underline"
                  >
                    Back to Login
                  </Link>
                </div>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}