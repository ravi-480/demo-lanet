"use client";
import React, { useState } from "react";
import { faqData } from "@/StaticData/Static";
import { ChevronDown } from "lucide-react";

const FaqSection: React.FC = () => {
  const [faqs, setFaqs] = useState(
    faqData.map((faq) => ({ ...faq, isOpen: false }))
  );

  const toggleFAQ = (id: string) => {
    setFaqs((prevFaqs) =>
      prevFaqs.map((faq) =>
        faq.id === id ? { ...faq, isOpen: !faq.isOpen } : faq
      )
    );
  };

  return (
    <section className="w-full bg-transparent">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-12 sm:py-16 md:py-20 lg:py-24">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-cyan-200 mb-8 text-center">
          Frequently Asked Questions
        </h2>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className="border border-gray-700 rounded-lg overflow-hidden bg-gray-800 hover:bg-gray-750 transition-colors duration-200"
            >
              <button
                className="flex justify-between items-center w-full px-6 py-4 text-left  focus:ring-opacity-50"
                onClick={() => toggleFAQ(faq.id)}
                aria-expanded={faq.isOpen}
              >
                <h3 className="text-lg font-medium text-cyan-100">
                  {faq.question}
                </h3>
                <ChevronDown
                  className={`w-5 h-5 text-cyan-200 transition-transform duration-300 ${
                    faq.isOpen ? "transform rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`transition-all duration-300 ease-in-out ${
                  faq.isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <p className="px-6 pb-6 text-gray-300">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
