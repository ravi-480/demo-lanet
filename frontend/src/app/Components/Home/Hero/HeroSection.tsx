
import React from "react";
import { Button } from "@/components/ui/button";
import ImageSliderWrapper from "../ImageSlider/ImageSliderWrapper";

const HeroSection: React.FC = () => {
  return (
    <section className="container px-6 md:px-24 lg:px-40 py-16 md:py-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="md:pr-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#d4c99e] leading-tight mb-4">
            EventWise app: <br />
            Modern, Intuitive Design
          </h1>
          <p className="text-lg md:text-xl text-amber-50 mb-8">
            Streamline your event planning with intuitive modern design.
          </p>
          <Button className="bg-[#d4c99e] hover:bg-[#c4b98e] text-black font-medium text-base h-12 px-6">
            Streamline RSVP
          </Button>
        </div>
        <div className="w-full h-full min-h-[300px]">
          <ImageSliderWrapper />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
