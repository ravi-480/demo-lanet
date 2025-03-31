// components/AuthGuard.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { setUser, logout } from "@/store/authSlice";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.get("token");

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        // Only make the API call if we don't already have the user in Redux
        if (!user) {
          const response = await axios.get(
            "http://localhost:5000/api/auth/dashboard",
            {
              withCredentials: true,
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          dispatch(setUser(response.data.user));
        }

        setLoading(false);
      } catch (error) {
        console.error("Authentication error:", error);
        dispatch(logout());
        router.replace("/login");
      }
    };

    checkAuth();
  }, [router, dispatch, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#d4c99e]"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
