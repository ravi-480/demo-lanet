"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { signupUser } from "@/store/authSlice";
import { AppDispatch, RootState } from "@/store/store";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupformSchema } from "@/schemas/ValidationSchema";
import { SignupPayload } from "@/Interface/interface";
import { toast } from "sonner";

import AuthLayout from "../AuthLayout/AuthLayout";
import {
  ErrorAlert,
  FormField,
  SubmitButton,
  FormFooter,
} from "../AuthLayout/FormComponent";

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
      toast.success("Account created successfully!");
      router.push("/login");
    }
  };

  return (
    <AuthLayout
      title="Create an Account"
      description="Join EventWise to start planning your events"
    >
      <ErrorAlert message={authError} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          id="name"
          label="Full Name"
          placeholder="Enter your full name"
          register={register}
          errors={errors}
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

        <FormField
          id="email"
          label="Email Address"
          placeholder="your@email.com"
          type="email"
          register={register}
          errors={errors}
        />

        <FormField
          id="password"
          label="Password"
          placeholder="Create a password"
          type="password"
          register={register}
          errors={errors}
          showPassword={showPassword}
          toggleShowPassword={() => setShowPassword(!showPassword)}
        />

        <FormField
          id="confirmPassword"
          label="Confirm Password"
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
          loadingText="Creating Account..."
          buttonText="Sign Up"
        />
      </form>

      <FormFooter
        text="Already have an account?"
        linkText="Login"
        linkHref="/login"
      />
    </AuthLayout>
  );
};

export default SignupForm;
