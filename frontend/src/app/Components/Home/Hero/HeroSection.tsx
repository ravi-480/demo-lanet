import React from "react";
import { Button } from "@/components/ui/button";
import ImageSliderWrapper from "../ImageSlider/ImageSliderWrapper";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const HeroSection: React.FC = () => {
  return (
    <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-10 sm:py-12 md:py-16 lg:py-20">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center">
          <div className="order-2 lg:order-1 flex flex-col space-y-4 sm:space-y-6 md:pr-4 lg:pr-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-cyan-200 leading-tight">
              EventWise app: <br className="hidden sm:block" />
              <span className="block mt-2 sm:mt-3">
                Modern, Intuitive Design
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-amber-50 max-w-lg">
              Streamline your event planning with intuitive modern design.
            </p>
            <div className="pt-2 sm:pt-4">
              <Link href="/events">
                <Button className="py-3 px-6 sm:py-4 sm:px-8 md:py-5 md:px-10 text-sm sm:text-base flex items-center gap-2 rounded-lg hover:shadow-lg transition-all">
                  Get Started <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="order-1 lg:order-2 w-full h-full min-h-[200px] sm:min-h-[250px] md:min-h-[300px] lg:min-h-[350px]">
            <ImageSliderWrapper />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
