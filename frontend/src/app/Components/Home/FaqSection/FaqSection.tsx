"use client";
import React, { useState } from "react";
import { faqData } from "@/StaticData/Static";

const FAQAccordion: React.FC = () => {
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
    <div className="w-full p-8 bg-gray-50">
      <h1 className="text-4xl text-black font-bold text-center mb-10">
        Frequently Asked Questions
      </h1>
      <div className="space-y-6">
        {faqs.map((faq) => (
          <div key={faq.id} className="border-b border-gray-200 pb-4">
            <button
              className="flex justify-between items-center w-full py-4 text-center cursor-pointer focus:outline-none"
              onClick={() => toggleFAQ(faq.id)}
            >
              <div className="w-full flex justify-between items-center">
                <div className="w-8"></div> {/* Spacer for centering */}
                <h3 className="text-lg font-medium text-gray-900 mx-auto">
                  {faq.question}
                </h3>
                <div
                  className={`transform transition-transform duration-300 w-8 ${
                    faq.isOpen ? "rotate-180" : "rotate-0"
                  }`}
                >
                </div>
              </div>
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                faq.isOpen ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0"
              }`}
            >
              <p className="px-12 w-130 text-left mx-auto text-gray-600 text-sm">
                {faq.answer}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQAccordion;
