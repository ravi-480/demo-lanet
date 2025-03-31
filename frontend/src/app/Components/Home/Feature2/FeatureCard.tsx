import Image from "next/image";
import { FeatureCardProps } from "@/Interface/interface";

const FeatureCard: React.FC<FeatureCardProps> = ({
  imageSrc,
  title,
  description,
  reverse = false,
}) => {
  return (
    <section
      className={`grid grid-cols-1 md:grid-cols-2 gap-8 items-center px-12 md:px-24 lg:px-40 py-16`}
    >
      <div
        className={`w-full h-[300px] md:h-[400px] relative rounded-lg overflow-hidden ${
          reverse ? "md:order-2" : ""
        }`}
      >
        <Image
          src={imageSrc}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          style={{ objectFit: "cover" }}
          priority
        />
      </div>
      <div className={`md:px-8 ${reverse ? "md:order-1" : ""}`}>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
        <p className="text-base md:text-lg text-gray-300">{description}</p>
      </div>
    </section>
  );
};

export default FeatureCard;
