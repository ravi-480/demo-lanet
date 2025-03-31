import React from "react";
import Image from "next/image";
import { FeatureBlockProps } from "@/Interface/interface";

const FeatureBlock: React.FC<FeatureBlockProps> = ({
  title,
  description,
  imageUrl,
  imageAlt,
  reverse = false,
}) => {
  return (
    <section className={`grid grid-cols-1 md:grid-cols-2 gap-8 items-center`}>
      {/* Image */}
      <div
        className={`w-full h-[300px] md:h-[400px] relative rounded-lg overflow-hidden ${
          reverse ? "md:order-2" : "md:order-1"
        }`}
      >
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          style={{ objectFit: "cover" }}
          priority
        />
      </div>

      {/* Text */}
      <div className={`md:${reverse ? "order-1 pr-8" : "order-2 pl-8"}`}>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
        <p className="text-gray-300 text-base md:text-lg">{description}</p>
      </div>
    </section>
  );
};

export default FeatureBlock;
