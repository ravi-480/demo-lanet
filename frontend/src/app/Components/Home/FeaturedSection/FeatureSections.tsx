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

// Enhanced FeatureBlock Component with Framer Motion
const EnhancedFeatureBlock = ({
  title,
  description,
  image,
  reverse,
}: {
  title: string;
  description: string;
  image: string;
  reverse: boolean;
}) => {
  return (
    <div
      className={`grid grid-cols-1 ${
        reverse ? "lg:grid-cols-[1fr,1.2fr]" : "lg:grid-cols-[1.2fr,1fr]"
      } gap-12 lg:gap-16 xl:gap-20 items-center`}
    >
      <motion.div
        className={`${reverse ? "order-2" : "order-1"} relative group`}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-[#6c63ff]/20 to-cyan-500/20 rounded-xl blur-2xl -z-10 opacity-60"
          whileHover={{ opacity: 0.8 }}
          transition={{ duration: 0.5 }}
        ></motion.div>
        <div className="overflow-hidden rounded-xl border border-white/10 shadow-lg hover:shadow-xl hover:shadow-[#6c63ff]/20 transition-all duration-500">
          <motion.img
            src={image}
            alt={title}
            className="w-full h-auto object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
        </div>
      </motion.div>

      <motion.div
        className={`${reverse ? "order-1" : "order-2"} space-y-6`}
        initial={{ opacity: 0.8, x: reverse ? -20 : 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.div
          className="w-16 h-1 bg-gradient-to-r from-[#6c63ff] to-cyan-400"
          initial={{ width: "0" }}
          whileInView={{ width: "4rem" }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        ></motion.div>
        <motion.h3
          className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-300 to-cyan-100 bg-clip-text text-transparent"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {title}
        </motion.h3>
        <motion.p
          className="text-base sm:text-lg text-gray-300 leading-relaxed"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {description}
        </motion.p>
        <motion.a
          href="#"
          className="inline-flex items-center text-[#6c63ff] hover:text-[#7a71ff] font-medium group"
          whileHover={{ x: 5 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          Learn more
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 ml-2"
            viewBox="0 0 20 20"
            fill="currentColor"
            whileHover={{ x: 3 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <path
              fillRule="evenodd"
              d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </motion.svg>
        </motion.a>
      </motion.div>
    </div>
  );
};

export { EnhancedFeatureBlock };
