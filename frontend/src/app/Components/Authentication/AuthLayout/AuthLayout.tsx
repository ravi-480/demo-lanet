"use client";

import { ReactNode, useEffect, useState } from "react";
import Image from "next/image";
import eventwise from "../../../../../public/images/eventwise.png";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
}

export default function AuthLayout({
  children,
  title,
  description,
}: AuthLayoutProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animations after component mounts
    setTimeout(() => {
      setIsVisible(true);
    }, 100);
  }, []);

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
          <div className="w-full text-white bg-transparent border border-gray-700">
            <div className="p-6 pb-3">
              <h2 className="text-2xl font-semibold mb-2">{title}</h2>
              <p className="text-sm text-gray-400">{description}</p>
            </div>
            <div className="p-6 pt-3">{children}</div>
          </div>
        </div>
      </div>

      {/* Shared animation styles */}
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
