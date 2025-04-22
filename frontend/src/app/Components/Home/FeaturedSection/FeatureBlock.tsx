import React from "react";
import Image from "next/image";
import { FeatureBlockProps } from "@/Interface/interface";

const FeatureBlock = ({
  title,
  description,
  imageUrl,
  imageAlt,
  reverse = false,
}: FeatureBlockProps) => {
  return (
    <section className="w-full">
      <div
        className={`grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center`}
      >
        <div
          className={`w-full aspect-[4/3] sm:aspect-[16/9] relative rounded-lg overflow-hidden shadow-lg
            ${reverse ? "lg:order-2" : "lg:order-1"}`}
        >
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
            style={{ objectFit: "cover" }}
            priority
            className="transition-transform duration-700 hover:scale-105"
          />
        </div>

        <div
          className={`flex flex-col space-y-4 md:space-y-6
            ${reverse ? "lg:order-1 lg:pr-8" : "lg:order-2 lg:pl-8"}
          `}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
            {title}
          </h2>
          <p className="text-gray-300 text-sm sm:text-base md:text-lg max-w-lg">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
};

export default FeatureBlock;
