"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { setUser, logout, logoutUser } from "@/store/authSlice";

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

      // if (!token) {
      //     router.replace("/login");
      //     return;
      //   }
      //   console.log("hello");

      try {
        if (!user) {
          const response = await axios.get("http://localhost:5000/api/auth", {
            withCredentials: true,
          });
          dispatch(setUser(response.data.user)); // havent sended yet response as user from backend
        }

        setLoading(false);
      } catch (error: any) {
        const status = error.response?.status;

        if (status === 401) {
          try {
            const retryRefresh = await axios.post(
              "http://localhost:5000/api/auth/refresh-token",
              {},
              { withCredentials: true }
            );

            const newAccessToken = retryRefresh.data.data.accessToken;
            Cookies.set("token", newAccessToken);

            const retryRes = await axios.get("http://localhost:5000/api/auth", {
              withCredentials: true,
            });
            dispatch(setUser(retryRes.data.user));
          } catch (refreshError) {
            // ❌ Don't dispatch logout multiple times
            await dispatch(logoutUser());
            router.replace("/login");
          }
        } else {
          await dispatch(logoutUser());
          router.replace("/login");
        }
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
