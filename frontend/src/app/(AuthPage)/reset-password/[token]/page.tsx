"use client";

import { useParams } from "next/navigation";
import ResetPasswordForm from "@/app/Components/Home/Login/ResetPasswordForm";

export default function ResetPasswordPage() {
  const params = useParams<{ token: string }>();
  const { token } = params;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <ResetPasswordForm token={token} />
      </div>
    </div>
  );
}
