import React from "react";
import FeatureCard from "./FeatureCard";
import { featureData } from "@/StaticData/Static";

const FeatureSections2: React.FC = () => {
  return (
    <div>
      {featureData.map(({ id, imageSrc, title, description, reverse }) => (
        <FeatureCard
          key={id}
          imageSrc={imageSrc}
          title={title}
          description={description}
          reverse={reverse}
        />
      ))}
    </div>
  );
};

export default FeatureSections2;
