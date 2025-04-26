"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import { Carousel } from "antd";
import { ImageSliderProps } from "@/Interface/interface";
import { CarouselRef } from "antd/es/carousel";

const ImageSlider: React.FC<ImageSliderProps> = ({
  images,
  autoplay = true,
  autoplaySpeed = 5000,
}) => {
  const [carouselRef, setCarouselRef] = useState<CarouselRef | null>(null);

  useCallback(() => {
    carouselRef?.next();
  }, [carouselRef]);

  useCallback(() => {
    carouselRef?.prev();
  }, [carouselRef]);

  return (
    <div className="relative w-full h-full">
      <Carousel
        ref={setCarouselRef}
        autoplay={autoplay}
        autoplaySpeed={autoplaySpeed}
        effect="fade"
        dots
        className="w-full rounded-lg overflow-hidden shadow-xl"
      >
        {images.map((image) => (
          <div key={image.id} className="h-[300px] md:h-[400px] relative">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{ objectFit: "cover" }}
              priority
            />
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default ImageSlider;
