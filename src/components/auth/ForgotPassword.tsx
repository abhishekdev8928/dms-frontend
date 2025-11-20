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
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/utils/validations/AuthValidation";
import { useForgotPassword } from "@/hooks/mutations/useAuthMutations";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

export function ForgetPassword({
  className,
  ...props
}: React.ComponentProps<"div">) {
  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  // TanStack Query mutation
  const forgotPasswordMutation = useForgotPassword();

  // Form submit handler
  const onSubmit = (data: ForgotPasswordInput) => {
    forgotPasswordMutation.mutate(data);
  };

  // Show success state
  if (forgotPasswordMutation.isSuccess) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card className="border-0 shadow-none py-[60px] lg:py-1">
          <CardHeader className="lg:px-6 px-0">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-[#035C4C]" />
            </div>
            <CardTitle className="lg:text-[30px] text-[28px] text-[#035C4C] text-center">
              Check Your Email
            </CardTitle>
          </CardHeader>
          <CardContent className="lg:px-6 px-0">
            <div className="text-center space-y-4">
              <p className="text-[#6B7280] text-[16px]">
                If an account exists with this email, a password reset link has been sent.
                Please check your inbox and follow the instructions.
              </p>
              <p className="text-[#9CA3AF] text-[14px]">
                Didn't receive the email? Check your spam folder or try again.
              </p>
              <div className="pt-4">
                <Link to="/auth/login">
                  <Button 
                    variant="outline"
                    className="w-full"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Login
                  </Button>
                </Link>
              </div>
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
            Forgot Password?
          </CardTitle>
          <p className="text-[#6B7280] text-[14px] mt-2 text-center lg:text-start">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </CardHeader>
        <CardContent className="lg:px-6 px-0">
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FieldGroup>
              <Field className="gap-2">
                <div className="flex items-center">
                  <FieldLabel 
                    htmlFor="email" 
                    className="text-[16px] font-bold text-[#374151]"
                  >
                    Email Address
                  </FieldLabel>
                </div>
                <Input
                  id="email"
                  className="selection:bg-[#E5E7EB] bg-[#F9FAFB] text-[14px] p-[26px] focus-visible:outline-none focus-visible:ring-0 focus-visible:shadow-none border-0"
                  type="email"
                  placeholder="Enter your email"
                  {...register("email")}
                  disabled={forgotPasswordMutation.isPending}
                />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.email.message}
                  </p>
                )}
              </Field>

              <Field>
                <Button
                  type="submit"
                  disabled={forgotPasswordMutation.isPending}
                  className="w-full bg-[#035C4C] lg:text-[24px] text-[20px] font-bold lg:p-[32px] p-[30px]"
                >
                  {forgotPasswordMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
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
                    className="text-[#035C4C] text-[14px] hover:underline inline-flex items-center"
                  >
                    <ArrowLeft className="mr-1 h-4 w-4" />
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