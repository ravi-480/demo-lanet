"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { setUser } from "@/store/authSlice";
import api from "@/utils/api";
import { Button } from "@/components/ui/button";
import { ServerCrash } from "lucide-react";
import LoadSpinner from "@/app/Components/Shared/LoadSpinner";
import { useAuthSession } from "@/hooks/useAuthSession";

interface AuthGuardProps {
  children: React.ReactNode;
}

interface ApiError extends Error {
  message: string;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  // const [loading, setLoading] = useState(true);
  const [serverDown, setServerDown] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, loading } = useAuthSession();
  const router = useRouter();

  // Store the original console.error function
  const originalConsoleErrorRef = useRef<typeof console.error | null>(null);

  // Ref to track if we've verified session
  const hasVerifiedSession = useRef(false);

  useEffect(() => {
    if (hasVerifiedSession.current) return;
    hasVerifiedSession.current = true;

    // Set up authentication error handler
    api.onAuthError = () => {
      router.push("/login");
    };

    // Store original console.error
    originalConsoleErrorRef.current = console.error;

    // Override console.error to suppress certain errors
    console.error = (...args) => {
      const errorString = args[0]?.toString?.() || "";

      if (
        errorString.includes("SERVER_DOWN") ||
        errorString.includes("Network Error") ||
        errorString.includes("status code 401") ||
        errorString.includes("Unauthorized")
      ) {
        return;
      }

      originalConsoleErrorRef.current?.apply(console, args);
    };

    const verifySession = async () => {
      try {
        const response = await api.get("/auth/me");
        const user = response.data.user;

        if (user) {
          dispatch(setUser(user));
        } else {
          router.push("/login");
          return;
        }
      } catch (error: unknown) {
        if ((error as ApiError).message === "SERVER_DOWN") {
          setServerDown(true);
        } else {
          router.push("/login");
          return;
        }
      } finally {
        // setLoading(false);
      }
    };

    verifySession();

    return () => {
      api.onAuthError = undefined;
      if (originalConsoleErrorRef.current) {
        console.error = originalConsoleErrorRef.current;
      }
    };
  }, [dispatch, router]);

  if (loading) {
    return <LoadSpinner />;
  }

  if (serverDown) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
        <ServerCrash className="w-16 h-16 mb-4 text-red-500" />
        <h1 className="text-2xl font-bold mb-2">Oops! Server is down.</h1>
        <p className="text-center mb-6">
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

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;
