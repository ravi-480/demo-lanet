"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import {
  forgotPassword,
  selectAuthError,
  selectAuthStatus,
  selectForgotPasswordSuccess,
  selectForgotPasswordMessage,
  clearForgotPasswordState,
} from "@/store/authSlice";
import { AppDispatch } from "@/store/store";

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
const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

const ForgotPasswordForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const authError = useSelector(selectAuthError);
  const authStatus = useSelector(selectAuthStatus);
  const forgotPasswordSuccess = useSelector(selectForgotPasswordSuccess);
  const forgotPasswordMessage = useSelector(selectForgotPasswordMessage);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  useEffect(() => {
    return () => {
      dispatch(clearForgotPasswordState());
    };
  }, [dispatch]);

  const onSubmit = async (values: { email: any }) => {
    await dispatch(forgotPassword({ email: values.email }));
  };

  return (
    <Card className="w-full max-w-md mx-auto text-white bg-transparent border border-gray-700">
      <CardHeader>
        <CardTitle>Forgot Password</CardTitle>
        <CardDescription>
          Enter your email to receive a password reset link
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

        {forgotPasswordSuccess && (
          <Alert className="mb-4 bg-green-900/20 text-green-300 border border-green-800">
            <AlertDescription>{forgotPasswordMessage}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="email">Email</label>
            <Input
              id="email"
              placeholder="you@example.com"
              type="email"
              className="bg-transparent"
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-[#d4c99e] hover:bg-yellow-700 text-black"
            disabled={authStatus === "loading" || forgotPasswordSuccess}
          >
            {authStatus === "loading" ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
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
};

export default ForgotPasswordForm;
