"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { forgotPassword, clearForgotPasswordState } from "@/store/authSlice";
import { AppDispatch, RootState } from "@/store/store";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

// Import shared components
import AuthLayout from "../AuthLayout/AuthLayout";
import {
  ErrorAlert,
  SuccessAlert,
  FormField,
  SubmitButton,
  FormFooter,
} from "../AuthLayout/FormComponent";

// Form schema for validation
const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

export default function ForgotPasswordForm() {
  const dispatch = useDispatch<AppDispatch>();

  const {
    error: authError,
    status: authStatus,
    forgotPasswordSuccess,
    forgotPasswordMessage,
  } = useSelector((state: RootState) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  // Clean up state when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearForgotPasswordState());
    };
  }, [dispatch]);

  const onSubmit = async (values: { email: string }) => {
    const response = await dispatch(forgotPassword({ email: values.email }));
    if (response.type.endsWith("fulfilled")) {
      toast.success("Reset link sent to your email");
    } else {
      toast.error("Failed to send reset link");
    }
  };

  return (
    <AuthLayout
      title="Forgot Password"
      description="Enter your email to receive a password reset link"
    >
      <ErrorAlert message={authError} />
      <SuccessAlert
        message={forgotPasswordSuccess ? forgotPasswordMessage : null}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          id="email"
          label="Email"
          placeholder="Enter your email"
          type="email"
          register={register}
          errors={errors}
        />

        <SubmitButton
          isLoading={authStatus === "loading"}
          loadingText="Sending..."
          buttonText="Send Reset Link"
        />
      </form>

      <FormFooter
        text="Remember your password?"
        linkText="Back to Login"
        linkHref="/login"
      />
    </AuthLayout>
  );
}
