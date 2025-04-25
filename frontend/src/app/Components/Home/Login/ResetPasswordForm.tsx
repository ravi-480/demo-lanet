"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  resetPassword,
  clearResetPasswordState,
} from "@/store/authSlice";
import { AppDispatch, RootState } from "@/store/store";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Form schema for validation
const formSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

interface ResetPasswordFormProps {
  token: string;
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const {
    error: authError,
    status: authStatus,
    resetPasswordSuccess,
    resetPasswordMessage,
  } = useSelector((state: RootState) => state.auth);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Clean up state when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearResetPasswordState());
    };
  }, [dispatch]);

  // Redirect to login page if password reset was successful
  useEffect(() => {
    if (resetPasswordSuccess) {
      const timer = setTimeout(() => {
        router.push("/login");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [resetPasswordSuccess, router]);

  const onSubmit = async (values: { password: any; confirmPassword: any }) => {
    await dispatch(
      resetPassword({
        token,
        password: values.password,
        confirmPassword: values.confirmPassword,
      })
    );
  };

  return (
    <Card className="w-full max-w-md mx-auto text-white bg-transparent border border-gray-700">
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
        <CardDescription>
          Create a new password for your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {authError && (
          <Alert
            variant="destructive"
            className="mb-4 bg-red-900/20 text-red-300 border border-red-800"
          >
            <AlertDescription>{authError}</AlertDescription>
          </Alert>
        )}

        {resetPasswordSuccess && (
          <Alert className="mb-4 bg-green-900/20 text-green-300 border border-green-800">
            <AlertDescription>
              {resetPasswordMessage} Redirecting to login page...
            </AlertDescription>
          </Alert>
        )}

        {!resetPasswordSuccess && (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="password">New Password</label>
              <Input
                id="password"
                type="password"
                className="bg-transparent"
                {...form.register("password")}
              />
              {form.formState.errors.password && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <Input
                id="confirmPassword"
                type="password"
                className="bg-transparent"
                {...form.register("confirmPassword")}
              />
              {form.formState.errors.confirmPassword && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-[#d4c99e] hover:bg-yellow-700 text-black"
              disabled={authStatus === "loading"}
            >
              {authStatus === "loading" ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm">
          Remember your password?{" "}
          <Link href="/login" className="text-[#d4c99e] hover:text-yellow-500">
            Back to Login
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
