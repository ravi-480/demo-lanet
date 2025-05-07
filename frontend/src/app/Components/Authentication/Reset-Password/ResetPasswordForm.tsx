"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { resetPassword, clearResetPasswordState } from "@/store/authSlice";
import { AppDispatch, RootState } from "@/store/store";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import AuthLayout from "../AuthLayout/AuthLayout";
import {
  ErrorAlert,
  SuccessAlert,
  FormField,
  SubmitButton,
  FormFooter,
} from "../AuthLayout/FormComponent";

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    error: authError,
    status: authStatus,
    resetPasswordSuccess,
    resetPasswordMessage,
  } = useSelector((state: RootState) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
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
      toast.success(resetPasswordMessage || "Password reset successful");
      const timer = setTimeout(() => {
        router.push("/login");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [resetPasswordSuccess, router, resetPasswordMessage]);

  const onSubmit = async (values: {
    password: string;
    confirmPassword: string;
  }) => {
    await dispatch(
      resetPassword({
        token,
        password: values.password,
        confirmPassword: values.confirmPassword,
      })
    );
  };

  return (
    <AuthLayout
      title="Reset Password"
      description="Create a new password for your account"
    >
      <ErrorAlert message={authError} />
      <SuccessAlert
        message={
          resetPasswordSuccess
            ? `${resetPasswordMessage} Redirecting to login page...`
            : null
        }
      />

      {!resetPasswordSuccess && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            id="password"
            label="New Password"
            placeholder="Enter new password"
            type="password"
            register={register}
            errors={errors}
            showPassword={showPassword}
            toggleShowPassword={() => setShowPassword(!showPassword)}
          />

          <FormField
            id="confirmPassword"
            label="Confirm New Password"
            placeholder="Confirm your password"
            type="password"
            register={register}
            errors={errors}
            showPassword={showConfirmPassword}
            toggleShowPassword={() =>
              setShowConfirmPassword(!showConfirmPassword)
            }
          />

          <SubmitButton
            isLoading={authStatus === "loading"}
            loadingText="Resetting..."
            buttonText="Reset Password"
          />
        </form>
      )}

      <FormFooter
        text="Remember your password?"
        linkText="Back to Login"
        linkHref="/login"
      />
    </AuthLayout>
  );
}
