import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { verifyOtpSchema, type VerifyOtpInput } from "@/utils/validations/AuthValidation";

import { useMutation } from "@tanstack/react-query";
import { verifyOtp, resendOtp, type VerifyOtpResponse, type ResendOtpResponse } from "@/config/api/authApi";
import { useAuthStore } from "@/config/store/authStore";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

export function OTPForm({ ...props }: React.ComponentProps<typeof Card>) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const setAuthenticatedUser = useAuthStore((state) => state.setAuthenticatedUser);
  
  // Get userId from route state or auth store
  const userId = location.state?.userId || user?.userId;
  const userEmail = user?.email || "";

  const [resendTimer, setResendTimer] = useState(0);

  // Redirect if no userId
  useEffect(() => {
    if (!userId) {
      toast.error("Session expired", {
        description: "Please login again to continue.",
      });
      navigate("/auth/login");
    }
  }, [userId, navigate]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Helper function to get formatted date and time
  const getFormattedDateTime = () => {
    return new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyOtpInput>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      userId: userId || "",
      otp: "",
    },
  });

  // Verify OTP mutation
  const verifyMutation = useMutation<VerifyOtpResponse, Error, VerifyOtpInput>({
    mutationFn: verifyOtp,
    onMutate: () => {
      toast.loading("Verifying OTP...", {
        description: getFormattedDateTime(),
      });
    },
    onSuccess: (data) => {
      toast.dismiss();
      
      // Store authenticated user data and tokens
      setAuthenticatedUser({
        userId: data.data.userId,
        email: data.data.email,
        username: data.data.username,
        role: data.data.role,
        accessToken: data.data.accessToken,
        refreshToken: data.data.refreshToken,
      });
      
      toast.success("Verification successful!", {
        description: "Welcome back! Redirecting to dashboard...",
      });
      
      // Redirect to dashboard
      setTimeout(() => {
        navigate("/dashboard/department");
      }, 1000);
    },
    onError: (error: any) => {
      toast.dismiss();
      
      const errorMessage = error?.response?.data?.message || error.message || "Verification failed";
      toast.error("Verification failed", {
        description: errorMessage,
      });
    },
  });

  // Resend OTP mutation
  const resendMutation = useMutation<ResendOtpResponse, Error, { email: string }>({
    mutationFn: resendOtp,
    onMutate: () => {
      toast.loading("Resending OTP...", {
        description: getFormattedDateTime(),
      });
    },
    onSuccess: (data) => {
      toast.dismiss();
      
      toast.success("OTP resent successfully!", {
        description: data.message || "Please check your email for the new code.",
      });
      
      // Start 60 second cooldown
      setResendTimer(60);
    },
    onError: (error: any) => {
      toast.dismiss();
      
      const errorMessage = error?.response?.data?.message || error.message || "Failed to resend OTP";
      toast.error("Resend failed", {
        description: errorMessage,
      });
    },
  });

  // Form submit handler
  const onSubmit = (data: VerifyOtpInput) => {
    verifyMutation.mutate({
      userId: userId!,
      otp: data.otp,
    });
  };

  // Resend OTP handler
  const handleResendOTP = () => {
    if (resendTimer > 0) return;
    
    if (!userEmail) {
      toast.error("Email not found", {
        description: "Please login again to continue.",
      });
      navigate("/auth/login");
      return;
    }

    resendMutation.mutate({ email: userEmail });
  };

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Enter verification code</CardTitle>
        <CardDescription>
          We sent a 6-digit code to your email.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="otp">Verification code</FieldLabel>
              <Controller
                name="otp"
                control={control}
                render={({ field }) => (
                  <InputOTP
                    maxLength={6}
                    id="otp"
                    value={field.value}
                    onChange={field.onChange}
                    disabled={verifyMutation.isPending}
                  >
                    <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border">
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                )}
              />
              {errors.otp && (
                <p className="text-sm text-destructive mt-1">
                  {errors.otp.message}
                </p>
              )}
              <FieldDescription>
                Enter the 6-digit code sent to your email.
              </FieldDescription>
            </Field>

            <FieldGroup>
              <Button
                type="submit"
                disabled={verifyMutation.isPending}
                className="w-full"
              >
                {verifyMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify"
                )}
              </Button>

              <FieldDescription className="text-center">
                Didn&apos;t receive the code?{" "}
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendTimer > 0 || resendMutation.isPending}
                  className="font-medium underline underline-offset-4 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendTimer > 0 ? (
                    `Resend in ${resendTimer}s`
                  ) : resendMutation.isPending ? (
                    "Resending..."
                  ) : (
                    "Resend"
                  )}
                </button>
              </FieldDescription>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}