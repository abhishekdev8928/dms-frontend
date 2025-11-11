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
import { toast } from "sonner"; // or your toast library
import { Loader2 } from "lucide-react";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const setUnverifiedUser = useAuthStore((state) => state.setUnverifiedUser);

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

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

  // TanStack Query mutation
  const loginMutation = useMutation<LoginResponse, Error, LoginInput>({
    mutationFn: loginUser,
    onMutate: () => {
      // Show loading toast
      toast.loading("Logging in...", {
        description: getFormattedDateTime(),
      });
    },
    onSuccess: (data) => {
      // Dismiss loading toast
      toast.dismiss();
      
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
      // Dismiss loading toast
      toast.dismiss();
      
      // Handle error
      const errorMessage = error?.response?.data?.message || error.message || "Login failed";
      toast.error("Login failed", {
        description: errorMessage,
      });
    },
  });

  // Form submit handler
  const onSubmit = (data: LoginInput) => {
    loginMutation.mutate(data);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  {...register("email")}
                  disabled={loginMutation.isPending}
                />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.email.message}
                  </p>
                )}
              </Field>

              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="/auth/forgot-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  disabled={loginMutation.isPending}
                />
                {errors.password && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.password.message}
                  </p>
                )}
              </Field>

              <Field>
                <Button 
                  type="submit" 
                  disabled={loginMutation.isPending}
                  className="w-full"
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>

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