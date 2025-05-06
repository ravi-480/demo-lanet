"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { testimonials } from "@/StaticData/Static";

const Testimonials: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  return (
    <section
      className="w-full bg-transparent py-16 sm:py-20 md:py-24 lg:py-28"
      ref={sectionRef}
    >
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <motion.h2
          className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-700 via-cyan-200 to-indigo-500 bg-clip-text text-transparent text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
        >
          Event Overview
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-10 lg:gap-12 max-w-6xl mx-auto">
          {testimonials.map(({ id, quote, author }, index) => (
            <motion.div
              key={id}
              className="flex flex-col items-center p-8 
                bg-gradient-to-b from-gray-800/80 to-gray-800/60 
                backdrop-blur-sm rounded-lg border border-gray-700/50 
                transform transition-all duration-300 ease-out 
                group relative z-10"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{
                duration: 0.8,
                delay: index * 0.15,
              }}
              whileHover={{
                y: -5,
                boxShadow: "0 15px 30px -10px rgba(108, 99, 255, 0.3)",
                borderColor: "rgba(108, 99, 255, 0.3)",
              }}
            >
              {/* Glow effect that appears on hover */}
              <motion.div
                className="absolute -inset-1 rounded-lg bg-gradient-to-r from-[#6c63ff]/0 via-[#6c63ff]/0 to-cyan-500/0 blur-xl -z-10"
                whileHover={{
                  opacity: 0.5,
                  background:
                    "linear-gradient(to right, rgba(108, 99, 255, 0.2), rgba(108, 99, 255, 0.3), rgba(6, 182, 212, 0.2))",
                }}
                initial={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              />

              {/* Card content */}
              <div className="relative w-full h-full">
                <span className="text-5xl font-semibold text-[#6c63ff]/30 absolute -top-8 -left-4">
                  ❝
                </span>
                <p className="text-base sm:text-lg italic text-gray-300 mb-6 text-center relative z-10">
                  {quote}
                </p>
                <span className="text-5xl font-semibold text-[#6c63ff]/30 absolute -bottom-8 -right-4">
                  ❞
                </span>
              </div>

              <div className="mt-auto pt-4 border-t border-gray-700/30 w-full">
                <motion.p
                  className="text-cyan-100 font-medium text-center"
                  whileHover={{ color: "#e0f7fa" }}
                  transition={{ duration: 0.3 }}
                >
                  {author}
                </motion.p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
