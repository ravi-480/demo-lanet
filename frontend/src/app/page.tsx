"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import FaqSection from "./Components/Home/FaqSection/FaqSection";
import FeatureSections from "./Components/Home/FeaturedSection/FeatureSections";
import HeroSection from "./Components/Home/Hero/HeroSection";
import Testimonials from "./Components/Home/Testimonials/Testimonial";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
};

export default function Home() {
  const featuresRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);

  

  return (
    <motion.main
      className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-[#6c63ff]/5 blur-3xl"
          animate={{
            y: [0, 15, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/3 w-64 h-64 rounded-full bg-cyan-500/5 blur-3xl"
          animate={{
            y: [0, 15, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-cyan-200/5 blur-3xl"
          animate={{
            y: [0, 15, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>

      {/* Content with motion animations */}
      <div className="relative z-10 flex-grow">
        <motion.div variants={itemVariants}>
          <HeroSection />
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="w-full h-px bg-gradient-to-r from-transparent via-cyan-800/30 to-transparent mx-auto max-w-7xl"
        />

        <motion.div
          ref={featuresRef}
          variants={itemVariants}
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 30 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <FeatureSections />
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="w-full h-px bg-gradient-to-r from-transparent via-cyan-800/30 to-transparent mx-auto max-w-7xl"
        />

        <motion.div
          ref={testimonialsRef}
          variants={itemVariants}
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 30 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <Testimonials />
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="w-full h-px bg-gradient-to-r from-transparent via-cyan-800/30 to-transparent mx-auto max-w-7xl"
        />

        <motion.div
          ref={faqRef}
          variants={itemVariants}
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 30 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <FaqSection />
        </motion.div>
      </div>
    </motion.main>
  );
}
