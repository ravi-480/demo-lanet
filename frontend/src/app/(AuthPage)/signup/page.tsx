"use client";

import { useRouter } from "next/navigation";
import SignupModal from "../../../app/Components/Home/Signup/SignupForm";

export default function SignupPage() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignupModal />
    </div>
  );
}
