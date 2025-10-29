import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { forgotPassword } from "@/config/api/authApi";
import { useMutation } from "@tanstack/react-query";
import { LoaderCircle, Mail, KeyRound, ArrowLeft, CheckCircle2 } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [emailInput, setEmailInput] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [showSuccessDialog, setShowSuccessDialog] = useState<boolean>(false);

  const { mutate, isPending } = useMutation({
    mutationFn: forgotPassword,
    onSuccess: (data) => {
      setShowSuccessDialog(true);
      setEmailInput("");
    },
    onError: (error: any) => {
      console.log(error);
      toast(error?.response?.data?.message || "Failed to send reset link", {
        description: "Please try again.",
      });
    },
  });

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailInput) {
      setEmailError("Email is required.");
      return;
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailPattern.test(emailInput)) {
      setEmailError("Please enter a valid email.");
      return;
    }

    setEmailError("");
    mutate({ email: emailInput });
  };

  const handleDialogClose = () => {
    setShowSuccessDialog(false);
  };

  return (
    <>
      <div className="w-full max-w-sm flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <KeyRound className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Forgot Password?</h1>
            <p className="text-muted-foreground text-sm mt-1">
              We'll send you a reset link
            </p>
          </div>
        </div>

        <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              required
            />
            {emailError && (
              <p className="text-red-500 text-sm mt-1">{emailError}</p>
            )}
          </Field>

          <Field>
            <Button
              className="flex gap-2 items-center justify-center w-full"
              type="submit"
              disabled={isPending}
            >
              {isPending && <LoaderCircle className="animate-spin h-4 w-4" />}
              {isPending ? "Sending..." : "Send Reset Link"}
            </Button>
          </Field>

          <Button
            type="button"
            variant="ghost"
            className="gap-2"
            onClick={() => navigate("/auth/login")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Button>
        </form>

        <FieldDescription className="text-center text-xs">
          By continuing, you agree to our{" "}
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

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 p-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <DialogTitle className="text-center text-xl">
              Check Your Email
            </DialogTitle>
            <DialogDescription className="text-center pt-2">
              We've sent a reset link to{" "}
              <strong className="text-foreground">{emailInput}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2 mt-4">
            <Button onClick={handleDialogClose} className="w-full">
              Got it
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/auth/login")}
              className="w-full"
            >
              Back to Login
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ForgotPassword;