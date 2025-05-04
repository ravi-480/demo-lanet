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

interface AuthGuardProps {
  children: React.ReactNode;
}

interface ApiError extends Error {
  message: string;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const [loading, setLoading] = useState(true);
  const [serverDown, setServerDown] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  const originalConsoleError =
    typeof window !== "undefined" ? console.error : null;

  const hasVerifiedSession = useRef(false);

  useEffect(() => {
    if (hasVerifiedSession.current) return;
    hasVerifiedSession.current = true;

    api.onAuthError = () => {
      router.push("/login");
    };

    if (typeof window !== "undefined" && originalConsoleError) {
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
      } catch (error: unknown) {
        if ((error as ApiError).message === "SERVER_DOWN") {
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

    return () => {
      api.onAuthError = undefined;
      if (typeof window !== "undefined" && originalConsoleError) {
        console.error = originalConsoleError;
      }
    };
  }, [dispatch, router, originalConsoleError]);

  if (!isAuthenticated) {
    return <LoadSpinner />;
  }

  if (loading) {
    return <LoadSpinner />;
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
          We&apos;re having trouble connecting to our backend. Please try again
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
