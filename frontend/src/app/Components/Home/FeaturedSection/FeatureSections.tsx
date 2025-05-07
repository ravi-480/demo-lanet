"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import FeatureBlock from "./FeatureBlock";
import { featureSections } from "@/StaticData/Static";

const FeatureSections: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  return (
    <div className="w-full bg-transparent" ref={sectionRef}>
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-16 sm:py-8 md:py-20 lg:py-16">
        <motion.h2
          className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight md:leading-[1.2] pb-2 bg-gradient-to-r from-indigo-700 via-cyan-200 to-indigo-300 bg-clip-text text-transparent text-center mb-16 sm:mb-24"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          Amazing Features
        </motion.h2>

        <div className="flex flex-col space-y-24 sm:space-y-32 md:space-y-40 lg:space-y-48">
          {featureSections.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{
                duration: 0.8,
                ease: "easeOut",
                delay: 0.1 * index,
              }}
            >
              <FeatureBlock {...feature} reverse={index % 2 !== 0} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeatureSections;
