"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { setUser } from "@/store/authSlice";
import api from "@/utils/api";
import { Button } from "@/components/ui/button";
import { ServerCrash } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const [loading, setLoading] = useState(true);
  const [serverDown, setServerDown] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  // Store original console functions to restore them later
  const originalConsoleError =
    typeof window !== "undefined" ? console.error : null;

  useEffect(() => {
    // Set up auth error handler
    api.onAuthError = () => {
      router.push("/login");
    };

    if (typeof window !== "undefined" && originalConsoleError) {
      console.error = (...args) => {
        // Filter out common expected errors
        const errorString = args[0]?.toString?.() || "";

        // Don't log these errors to console
        if (
          errorString.includes("SERVER_DOWN") ||
          errorString.includes("Network Error") ||
          errorString.includes("status code 401") ||
          errorString.includes("Unauthorized")
        ) {
          return;
        }

        originalConsoleError.apply(console, args);
      };
    }

    const verifySession = async () => {
      try {
        const response = await api.get("/auth");
        const user = response.data.user;

        if (user) {
          dispatch(setUser(user));
        } else {
          router.push("/login");
          return;
        }
      } catch (error: any) {
        if (error.message === "SERVER_DOWN") {
          setServerDown(true);
        } else {
          router.push("/login");
          return;
        }
      } finally {
        setLoading(false);
      }
    };

    verifySession();

    // Clean up
    return () => {
      api.onAuthError = undefined;
      if (typeof window !== "undefined" && originalConsoleError) {
        console.error = originalConsoleError;
      }
    };
  }, [dispatch, router, originalConsoleError]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#d4c99e]"></div>
      </div>
    );
  }

  if (serverDown) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-gray-900 text-white">
        <ServerCrash
          size={48}
          color="#fa0000"
          className="mb-4"
          strokeWidth={2.25}
        />
        <h1 className="text-4xl font-bold text-gray-200 mb-4">
          Oops! Server is down.
        </h1>
        <p className="text-lg text-gray-300 mb-6">
          We're having trouble connecting to our backend. Please try again
          later.
        </p>
        <Button
          onClick={() => window.location.reload()}
          className="px-10 py-5 text-lg"
        >
          Retry
        </Button>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
