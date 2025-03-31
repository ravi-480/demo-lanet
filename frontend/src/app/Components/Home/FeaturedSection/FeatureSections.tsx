import FeatureBlock from "./FeatureBlock";
import { featureSections } from "@/StaticData/Static";

const FeatureSections: React.FC = () => {
  return (
    <div className="container text-[#d4c99e] px-12 md:px-24 lg:px-40 py-16 space-y-24">
      {featureSections.map((feature, index) => (
        <FeatureBlock key={index} {...feature} />
      ))}
    </div>
  );
};

export default FeatureSections;
