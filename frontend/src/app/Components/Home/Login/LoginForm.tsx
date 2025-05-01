"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import { loginUser } from "@/store/authSlice";
import { AppDispatch, RootState } from "@/store/store";
import eventwise from "../../../../../public/images/eventwise.png";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginformSchema } from "@/schemas/ValidationSchema";
import { toast } from "sonner";
import { useState } from "react";

export default function LoginForm() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  const { error: authError, status: authStatus } = useSelector(
    (state: RootState) => state.auth
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginformSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      router.replace("/events");
    }

    // Trigger animations after component mounts
    setTimeout(() => {
      setIsVisible(true);
    }, 100);
  }, [router]);

  const onSubmit = async (values: { email: string; password: string }) => {
    const response = await dispatch(loginUser(values));
    if (response.type === "auth/login/fulfilled") {
      toast.success("Login successful");
      router.replace("/events");
    } else {
      toast.error(response.payload as string);
    }
  };

  return (
    <div className="flex h-screen w-full">
      {/* Image side - Left panel */}
      <div className="hidden lg:flex flex-1 bg-[#6c63ff] relative overflow-hidden items-center justify-center">
        {/* Animated circles with float animations */}
        <div className="absolute w-96 h-96 rounded-full bg-white/10 -top-32 -left-32 animate-float-slow"></div>
        <div className="absolute w-64 h-64 rounded-full bg-white/10 bottom-16 right-12 animate-float-medium"></div>
        <div className="absolute w-48 h-48 rounded-full bg-white/10 -bottom-16 left-1/3 animate-float-fast"></div>

        {/* Content with staggered animations */}
        <div className="relative z-10 text-center p-8 text-white max-w-lg">
          <h1
            className={`text-5xl font-bold mb-6 ${
              isVisible ? "animate-fade-in" : "opacity-0"
            }`}
          >
            <span className="inline-block animation-delay-300">Event</span>
            <span className="inline-block animation-delay-500">Wise</span>
          </h1>

          <p
            className={`text-xl mb-8 leading-relaxed ${
              isVisible ? "animate-fade-up animation-delay-700" : "opacity-0"
            }`}
          >
            Plan events, manage budgets, and find vendors - all in one place.
          </p>

          <div
            className={`flex justify-center ${
              isVisible ? "animate-fade-up animation-delay-1000" : "opacity-0"
            }`}
          >
            <Image
              src={eventwise}
              width={350}
              height={350}
              alt="EventWise Illustration"
              priority
              className="transform hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </div>

      {/* Form side - Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-900">
        <div
          className={`w-full max-w-md ${
            isVisible ? "animate-fade-in animation-delay-300" : "opacity-0"
          }`}
        >
          <Card className="w-full text-white bg-transparent border border-gray-700">
            <CardHeader>
              <CardTitle className="text-2xl">Welcome Back</CardTitle>
              <CardDescription>
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {authError && (
                <Alert
                  variant="destructive"
                  className="mb-4 bg-red-900/20 text-red-300 border border-red-800"
                >
                  <AlertDescription>{authError}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="email">Email Address</label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="bg-transparent border-gray-700 focus:border-[#6c63ff] transition-colors"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label htmlFor="password">Password</label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    className="bg-transparent border-gray-700 focus:border-[#6c63ff] transition-colors"
                    {...register("password")}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <Link
                    href="/forgot-password"
                    className="text-sm text-[#6c63ff] hover:text-[#5a52d4]"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#6c63ff] cursor-pointer hover:bg-[#5a52d4] text-white"
                  disabled={authStatus === "loading"}
                >
                  {authStatus === "loading" ? "Logging in..." : "Login"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/signup">
                  <button className="text-[#6c63ff] hover:text-[#5a52d4] font-semibold">
                    Sign up
                  </button>
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Added CSS for animation delays */}
      <style jsx global>{`
        .animation-delay-300 {
          animation-delay: 300ms;
        }

        .animation-delay-500 {
          animation-delay: 500ms;
        }

        .animation-delay-700 {
          animation-delay: 700ms;
        }

        .animation-delay-1000 {
          animation-delay: 1000ms;
        }

        @keyframes float {
          0% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(10px, 15px);
          }
          100% {
            transform: translate(0, 0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-float-slow {
          animation: float 8s infinite ease-in-out;
        }

        .animate-float-medium {
          animation: float 12s infinite ease-in-out;
        }

        .animate-float-fast {
          animation: float 10s infinite ease-in-out 1s;
        }

        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }

        .animate-fade-up {
          animation: slideUp 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
