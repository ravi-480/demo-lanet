"use client";

import { useDispatch, useSelector } from "react-redux";
import {
  signupUser,
  selectAuthError,
  selectAuthStatus,
} from "@/store/authSlice";
import { AppDispatch } from "@/store/store";
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

const SignupForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const authError = useSelector(selectAuthError);
  const authStatus = useSelector(selectAuthStatus);

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
      toast.success(resultAction.payload.message);
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

          <div className="space-y-1">
            <label htmlFor="password">Password</label>
            <Input
              id="password"
              type="password"
              placeholder="********"
              className="bg-transparent"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="********"
              className="bg-transparent"
              {...register("confirmPassword")}
            />
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
