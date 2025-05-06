"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { faqData } from "@/StaticData/Static";

const FaqSection: React.FC = () => {
  const [faqs, setFaqs] = useState(
    faqData.map((faq) => ({ ...faq, isOpen: false }))
  );
  const faqRef = useRef<HTMLDivElement>(null);

  const toggleFAQ = (id: string) => {
    setFaqs((prevFaqs) =>
      prevFaqs.map((faq) =>
        faq.id === id ? { ...faq, isOpen: !faq.isOpen } : faq
      )
    );
  };

  return (
    <section className="w-full bg-transparent py-16 sm:py-20 md:py-24 lg:py-28">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <motion.h2
          className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-700 via-cyan-200 to-indigo-500 bg-clip-text text-transparent text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
        >
          Frequently Asked Questions
        </motion.h2>

        <motion.div
          className="max-w-3xl mx-auto space-y-4"
          ref={faqRef}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.id}
              className="border border-gray-700/50 rounded-lg overflow-hidden 
                        bg-gradient-to-b from-gray-800/80 to-gray-800/60 backdrop-blur-sm 
                        hover:border-[#6c63ff]/30 transition-colors duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
              }}
              whileHover={{
                boxShadow: "0 10px 25px -5px rgba(108, 99, 255, 0.1)",
              }}
            >
              <motion.button
                className="flex justify-between items-center w-full px-6 py-5 text-left focus:outline-none focus:ring-2 focus:ring-[#6c63ff]/50 focus:ring-opacity-50 rounded-t-lg"
                onClick={() => toggleFAQ(faq.id)}
                aria-expanded={faq.isOpen}
                whileHover={{ backgroundColor: "rgba(108, 99, 255, 0.05)" }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-lg font-medium text-gray-300">
                  {faq.question}
                </h3>
                <motion.div
                  animate={{ rotate: faq.isOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-5 h-5 text-[#6c63ff]" />
                </motion.div>
              </motion.button>

              <AnimatePresence>
                {faq.isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="px-6 pt-4 pb-6 text-gray-300">{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FaqSection;
