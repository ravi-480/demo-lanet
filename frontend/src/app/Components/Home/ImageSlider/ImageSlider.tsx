"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import { Carousel } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { ImageSliderProps } from "@/Interface/interface";

const ImageSlider: React.FC<ImageSliderProps> = ({
  images,
  autoplay = true,
  autoplaySpeed = 5000,
}) => {
  const [carouselRef, setCarouselRef] = useState<any>(null);

  const next = useCallback(() => {
    carouselRef?.next();
  }, [carouselRef]);

  const previous = useCallback(() => {
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

      <button
        className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center bg-black/50 text-white rounded-full hover:bg-black/70"
        onClick={previous}
      >
        <LeftOutlined />
      </button>

      <button
        className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center bg-black/50 text-white rounded-full hover:bg-black/70"
        onClick={next}
      >
        <RightOutlined />
      </button>
    </div>
  );
};

export default ImageSlider;
