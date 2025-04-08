"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import {
  loginUser,
  selectAuthError,
  selectAuthStatus,
} from "@/store/authSlice";
import { AppDispatch, RootState } from "@/store/store";
import axios from "axios";

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
import { loginformSchema } from "@/schemas/ValidationSchema";

// Configure axios
axios.defaults.withCredentials = true;

// Form schema for validation

export default function LoginForm() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const authError = useSelector(selectAuthError);
  const authStatus = useSelector(selectAuthStatus);
  const { user } = useSelector((state: RootState) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginformSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    // Check if already logged in
    const token = Cookies.get("token");
    if (token) {
      router.replace("/dashboard");
    }
  }, [router]);

  // Handle redirection after login
  useEffect(() => {
    if (user && authStatus === "succeeded") {
      router.replace("/dashboard");
    }
  }, [user, authStatus, router]);

  const onSubmit = async (values: { email: string; password: string }) => {
    await dispatch(loginUser(values));
  };

  return (
    <Card className="w-full text-white bg-transparent border border-gray-700">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Sign in to access your account</CardDescription>
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="email">Email</label>
            <Input
              id="email"
              type="email"
              className="bg-transparent"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="password">Password</label>
            <Input
              id="password"
              type="password"
              className="bg-transparent"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
            <div className="text-right mt-1">
              <Link
                href="/forgot-password"
                className="text-sm text-[#d4c99e] hover:text-yellow-500"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#d4c99e] cursor-pointer hover:bg-yellow-700 text-black"
            disabled={authStatus === "loading"}
          >
            {authStatus === "loading" ? "Logging in..." : "Login"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center flex-col space-y-2">
        <p className="text-sm">
          Don't have an account?{" "}
          <Link href="/signup" className="text-[#d4c99e] hover:text-yellow-500">
            Create new account
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
