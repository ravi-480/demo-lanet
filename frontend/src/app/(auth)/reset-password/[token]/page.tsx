"use client";

import { useParams } from "next/navigation";
import ResetPasswordForm from "@/app/Components/Authentication/Reset-Password/ResetPasswordForm";

export default function ResetPasswordPage() {
  const params = useParams<{ token: string }>();
  const { token } = params;

  return <ResetPasswordForm token={token} />;
}
