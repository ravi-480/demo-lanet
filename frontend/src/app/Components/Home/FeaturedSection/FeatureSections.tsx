import FeatureBlock from "./FeatureBlock";
import { featureSections } from "@/StaticData/Static";

const FeatureSections: React.FC = () => {
  return (
    <div className="w-full bg-transparent">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="flex flex-col space-y-16 sm:space-y-20 md:space-y-24 lg:space-y-32 text-cyan-200">
          {featureSections.map((feature, index) => (
            <FeatureBlock key={index} {...feature} reverse={index % 2 !== 0} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeatureSections;
