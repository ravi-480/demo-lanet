// app/forgot-password/page.tsx
"use client";

import ForgotPasswordForm from "../Components/Home/Login/ForgetPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
