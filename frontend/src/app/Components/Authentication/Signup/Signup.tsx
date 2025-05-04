"use client";

import SignupForm from "./SignupForm";

const SignupPage = () => {
  return (
    <div className="flex items-center justify-center h-screen w-screen bg-gray-900 p-4 overflow-hidden">
      <div className="w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-[#d4c99e]">
          Sign Up
        </h2>
        <SignupForm />
      </div>
    </div>
  );
};

export default SignupPage;
