import { cn } from "@/lib/utils";
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
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/utils/validations/AuthValidation";
import { useMutation } from "@tanstack/react-query";
import { loginUser, type LoginResponse } from "@/config/api/authApi";
import { useAuthStore } from "@/config/store/authStore";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function ForgetPassword({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const setUnverifiedUser = useAuthStore((state) => state.setUnverifiedUser);

  // React Hook Form setup
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<LoginInput>({
//     resolver: zodResolver(loginSchema),
//     defaultValues: {
//       email: "",
//       password: "",
//     },
//   });

  // Helper function to get formatted date and time
  // const getFormattedDateTime = () => {
  //   return new Date().toLocaleString("en-US", {
  //     month: "short",
  //     day: "numeric",
  //     year: "numeric",
  //     hour: "2-digit",
  //     minute: "2-digit",
  //   });
  // };

  // TanStack Query mutation
  const loginMutation = useMutation<LoginResponse, Error, LoginInput>({
    mutationFn: loginUser,
    onSuccess: (data) => {
      // Store userId in auth store
      setUnverifiedUser(data.data.userId);
      
      // Show success message
      toast.success("Login successful!", {
        description: data.message || "OTP sent to your email. Please check your inbox.",
      });
      
      // Redirect to OTP verification page
      navigate("/auth/verify-otp", {
        state: { userId: data.data.userId },
      });
    },
    onError: (error: any) => {
      console.log("Login error:", error);
      
      // Handle error
      const errorMessage = error?.response?.data?.message || error.message || "Login failed";
      toast.error("Login failed", {
        description: errorMessage,
      });
    },
  });

  // Form submit handler
//   const onSubmit = (data: LoginInput) => {
//     loginMutation.mutate(data);
//   };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-0 shadow-none py-[60px] lg:py-1">
        <CardHeader className="lg:px-6 px-0">
          <CardTitle className="lg:text-[30px] text-[28px] text-[#035C4C] text-center lg:text-start">Forgot Password?</CardTitle>
     
        </CardHeader>
        <CardContent className="lg:px-6 px-0">
          <form 
            // onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <FieldGroup>
               

              <Field className="gap-2">
                <div className="flex items-center">
                  <FieldLabel htmlFor="password"  className="text-[16px] font-bold text-[#374151]">Email Address</FieldLabel>
                
                </div>
                <Input
                  id="password"
                    className="selection:bg-[#E5E7EB] bg-[#F9FAFB] text-[14px] p-[26px] focus-visible:outline-none focus-visible:ring-0 focus-visible:shadow-none border-0"
                  type="text"
                //   {...register("password")}
                //   disabled={loginMutation.isPending}
                />
                {/* {errors.password && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.password.message}
                  </p>
                )} */}
              </Field>
                 
              

              <Field>
                <Button 
                  type="submit" 
                //   disabled={loginMutation.isPending}
                  className="w-full bg-[#035C4C] lg:text-[24px] text-[20px] font-bold lg:p-[32px] p-[30px]"
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
                                     <p className="text-[12px] flex items-center justify-center lg:text-center text-start mt-4">
                  <svg className="me-3 lg:mt-0 mt-[3px]" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.62501 0C5.73282 0 5.84064 0.0234375 5.93907 0.0679688L10.3524 1.94063C10.868 2.15859 11.2524 2.66719 11.25 3.28125C11.2383 5.60625 10.282 9.86016 6.24376 11.7938C5.85235 11.9813 5.39767 11.9813 5.00626 11.7938C0.967979 9.86016 0.0117294 5.60625 1.06605e-05 3.28125C-0.00233309 2.66719 0.382042 2.15859 0.897667 1.94063L5.31329 0.0679688C5.40939 0.0234375 5.5172 0 5.62501 0ZM5.62501 1.56563V10.425C8.85939 8.85938 9.72892 5.39297 9.75001 3.31406L5.62501 1.56563Z" fill="#035C4C"/>
                </svg> Protected by enterprise-grade security & SSL encryption</p>
                
         

                {/* <Button 
                  variant="outline" 
                  type="button"
                  disabled={loginMutation.isPending}
                  className="w-full"
                >
                  Login with Google
                </Button> */}

                {/* <FieldDescription className="text-center">
                  Don&apos;t have an account?{" "}
                  <a 
                    href="/auth/register" 
                    className="underline underline-offset-4 hover:text-primary"
                  >
                    Sign up
                  </a>
                </FieldDescription> */}
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}