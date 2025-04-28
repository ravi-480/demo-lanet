"use client";

import { useDispatch, useSelector } from "react-redux";
import { signupUser } from "@/store/authSlice";
import { AppDispatch, RootState } from "@/store/store";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
import { signupformSchema } from "@/schemas/ValidationSchema";
import { SignupPayload } from "@/Interface/interface";
import { toast } from "sonner";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const SignupForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { error: authError, status: authStatus } = useSelector(
    (state: RootState) => state.auth
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupformSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: SignupPayload) => {
    const resultAction = await dispatch(signupUser(values));
    if (signupUser.fulfilled.match(resultAction)) {
      
      router.push("/");
    } else {
      toast.error(resultAction.payload);
    }
  };

  // Function to check if email error exists from backend
  const isEmailInUseError =
    authError &&
    (authError.includes("Email already in use") ||
      authError.includes("already exists") ||
      authError.includes("already in use"));

  return (
    <Card className="w-full max-w-md mx-auto text-white bg-transparent border border-gray-700">
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>Enter your details to sign up</CardDescription>
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
            <label htmlFor="name">Full Name</label>
            <Input
              id="name"
              placeholder="John Doe"
              className="bg-transparent"
              {...register("name")}
              onKeyDown={(e) => {
                if (/\d/.test(e.key)) {
                  e.preventDefault(); // block number keys
                }
              }}
              onPaste={(e) => {
                const pasted = e.clipboardData.getData("text");
                if (/\d/.test(pasted)) {
                  e.preventDefault(); // block pasting numbers
                }
              }}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="email">Email</label>
            <Input
              id="email"
              placeholder="you@example.com"
              type="email"
              className={`bg-transparent ${
                isEmailInUseError ? "border-red-500" : ""
              }`}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
            {isEmailInUseError && (
              <p className="text-red-500 text-sm mt-1">
                This email is already in use. Please try another or log in.
              </p>
            )}
          </div>

          <div className="space-y-1 relative">
            <label htmlFor="password">Password</label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="********"
                className="bg-transparent pr-10 h-12" // Add padding-right and fixed height
                {...register("password")}
              />
              <div
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)} // Toggle show/hide for password
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </div>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1 relative">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="********"
                className="bg-transparent pr-10 h-12" // Add padding-right and fixed height
                {...register("confirmPassword")}
              />
              <div
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)} // Toggle show/hide for confirm password
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </div>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-[#d4c99e] cursor-pointer hover:bg-yellow-700 text-black"
            disabled={authStatus === "loading"}
          >
            {authStatus === "loading" ? "Signing up..." : "Sign Up"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-[#d4c99e] hover:text-yellow-500">
            Login
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default SignupForm;
