"use client";

import { ReactNode, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
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
  return (
    <div className="flex h-screen w-full">
      {/* Image side - Left panel */}
      <div className="hidden lg:flex flex-1 bg-[#6c63ff] relative overflow-hidden items-center justify-center">
        {/* Animated circles with float animations */}
        <motion.div
          className="absolute w-96 h-96 rounded-full bg-white/10 -top-32 -left-32"
          animate={{
            x: [0, 10, 0],
            y: [0, 15, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 5, //
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute w-64 h-64 rounded-full bg-white/10 bottom-16 right-12"
          animate={{
            x: [0, 10, 0],
            y: [0, 15, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 7,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute w-48 h-48 rounded-full bg-white/10 -bottom-16 left-1/3"
          animate={{
            x: [0, 10, 0],
            y: [0, 15, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 6,
            ease: "easeInOut",
            delay: 0.3,
          }}
        />

        {/* Content with staggered animations */}
        <div className="relative z-10 text-center p-8 text-white max-w-lg">
          <motion.h1
            className="text-5xl font-bold mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <motion.span
              className="inline-block"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Event
            </motion.span>
            <motion.span
              className="inline-block"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              Wise
            </motion.span>
          </motion.h1>

          <motion.p
            className="text-xl mb-8 leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Plan events, manage budgets, and find vendors - all in one place.
          </motion.p>

          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.5 }}
            >
              <Image
                src={eventwise}
                width={350}
                height={350}
                alt="EventWise Illustration"
                priority
              />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Form side - Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-900">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="w-full text-white bg-transparent border border-gray-700">
            <div className="p-6 pb-3">
              <h2 className="text-2xl font-semibold mb-2">{title}</h2>
              <p className="text-sm text-gray-400">{description}</p>
            </div>
            <div className="p-6 pt-3">{children}</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
