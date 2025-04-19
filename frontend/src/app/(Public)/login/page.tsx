"use client";

import LoginForm from "@/app/Components/Home/Login/LoginForm";

const LoginPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-md px-4 mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center text-[#d4c99e]">
          Login to EventWise
        </h2>
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
