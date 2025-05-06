"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import ImageSliderWrapper from "../ImageSlider/ImageSliderWrapper";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const HeroSection: React.FC = () => {
  return (
    <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-16 sm:py-20 md:py-24 lg:py-32 overflow-hidden">
      <div className="container mx-auto max-w-7xl relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
          {/* Text content with staggered animations */}
          <div className="order-2 lg:order-1 flex flex-col space-y-6 md:pr-4 lg:pr-8">
            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-indigo-500 via-cyan-200 to-indigo-500 bg-clip-text text-transparent leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              EventWise <br className="hidden sm:block" />
              <span className="block mt-2 sm:mt-3">
                Modern, Intuitive Design
              </span>
            </motion.h1>

            <motion.p
              className="text-lg sm:text-xl md:text-2xl bg-gradient-to-r from-indigo-500 via-cyan-300 to-indigo-400 bg-clip-text text-transparent leading-tight max-w-lg"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            >
              Streamline your event planning with intuitive modern design.
            </motion.p>

            <motion.div
              className="pt-4 sm:pt-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
            >
              <Link href="/events">
                <Button className="py-3 px-6 sm:py-4 sm:px-8 md:py-5 md:px-10 text-base sm:text-lg bg-gradient-to-r from-[#6c63ff] to-[#5a52d4] hover:from-[#7a71ff] hover:to-[#6863e3] flex items-center gap-2 rounded-lg hover:shadow-[0_0_15px_rgba(108,99,255,0.5)] transition-all duration-300">
                  Get Started{" "}
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
                  </motion.span>
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Image slider with entrance animation */}
          <motion.div
            className="order-1 lg:order-2 w-full h-full min-h-[250px] sm:min-h-[300px] md:min-h-[350px] lg:min-h-[400px] relative"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#6c63ff]/20 to-cyan-500/20 rounded-2xl blur-3xl -z-10 opacity-60"></div>
            <div className="h-full w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-[#6c63ff]/10">
              <ImageSliderWrapper />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
