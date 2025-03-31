// app/dashboard/page.tsx
"use client";

import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState, AppDispatch } from "@/store/store";
import { logout } from "@/store/authSlice";
import AuthGuard from "../Components/Home/AuthGuard/AuthGuard";

const Dashboard = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    router.replace("/login");
  };

  return (
    <AuthGuard>
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
          <h1 className="text-2xl font-bold text-center text-[#d4c99e]">
            Welcome, {user?.name}
          </h1>
          <div className="mt-4 text-center">
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default Dashboard;
