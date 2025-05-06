"use client";
import { testimonials2 } from "@/StaticData/Static";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const Testimonials: React.FC = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Auto slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prevIndex) =>
        prevIndex === testimonials2.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // 5 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return (
    <motion.div
      className="border border-gray-500 rounded-lg shadow-sm p-6 mt-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 12,
      }}
    >
      <motion.h2
        className="text-lg font-medium text-gray-300 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Success Stories
      </motion.h2>

      <motion.div
        className="relative"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${activeTestimonial * 100}%)`,
            }}
          >
            {testimonials2.map((testimonial, idx) => (
              <motion.div
                key={testimonial.id}
                className="w-full flex-shrink-0 px-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 * idx + 0.4, duration: 0.3 }}
              >
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 * idx + 0.5, duration: 0.3 }}
                    >
                      <Image
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full mr-4"
                        width={48}
                        height={48}
                      />
                    </motion.div>
                    <div>
                      <motion.h3
                        className="font-medium text-gray-300"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 * idx + 0.6, duration: 0.3 }}
                      >
                        {testimonial.name}
                      </motion.h3>
                      <motion.p
                        className="text-sm text-gray-400"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 * idx + 0.7, duration: 0.3 }}
                      >
                        {testimonial.eventType}
                      </motion.p>
                    </div>
                  </div>
                  <motion.p
                    className="text-gray-300 italic"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 * idx + 0.8, duration: 0.3 }}
                  >
                    &quot;{testimonial.quote}&quot;
                  </motion.p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          className="flex justify-center mt-4 space-x-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.3 }}
        >
          {testimonials2.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveTestimonial(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                activeTestimonial === index ? "bg-blue-600" : "bg-gray-300"
              }`}
              aria-label={`Go to slide ${index + 1}`}
              role="button"
              tabIndex={0}
            />
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Testimonials;
