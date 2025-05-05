"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { loginUser } from "@/store/authSlice";
import { AppDispatch, RootState } from "@/store/store";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginformSchema } from "@/schemas/ValidationSchema";
import { toast } from "sonner";

// Import shared components
import AuthLayout from "../AuthLayout/AuthLayout";
import {
  ErrorAlert,
  FormField,
  SubmitButton,
  FormFooter,
} from "../AuthLayout/FormComponent";

export default function LoginForm() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const { error: authError, status: authStatus } = useSelector(
    (state: RootState) => state.auth
  );

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
    const token = Cookies.get("token");
    if (token) {
      router.replace("/events");
    }
  }, [router]);

  const onSubmit = async (values: { email: string; password: string }) => {
    const response = await dispatch(loginUser(values));
    if (response.type === "auth/login/fulfilled") {
      toast.success("Login successful");
      router.replace("/events");
    } else {
      toast.error(response.payload as string);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      description="Enter your credentials to access your account"
    >
      <ErrorAlert message={authError} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          id="email"
          label="Email Address"
          placeholder="Enter your email"
          type="email"
          register={register}
          errors={errors}
        />

        <FormField
          id="password"
          label="Password"
          placeholder="Enter your password"
          type="password"
          register={register}
          errors={errors}
          showPassword={showPassword}
          toggleShowPassword={() => setShowPassword(!showPassword)}
        />

        <div className="flex justify-between items-center">
          <a
            href="/forgot-password"
            className="text-sm text-[#6c63ff] hover:text-[#5a52d4]"
          >
            Forgot password?
          </a>
        </div>

        <SubmitButton
          isLoading={authStatus === "loading"}
          loadingText="Logging in..."
          buttonText="Login"
        />
      </form>

      <FormFooter
        text="Don't have an account?"
        linkText="Sign up"
        linkHref="/signup"
      />
    </AuthLayout>
  );
}
