import React from "react";
import ImageSlider from "./ImageSlider"; // Make sure the path is correct
import images from "@/StaticData/Static";

const ImageSliderWrapper = () => {
  return (
    <div className="w-full h-full">
      <ImageSlider images={images} autoplay={true} autoplaySpeed={5000} />
    </div>
  );
};

export default ImageSliderWrapper;
