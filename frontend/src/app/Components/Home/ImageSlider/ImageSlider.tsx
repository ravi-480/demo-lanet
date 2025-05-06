import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

type ImageType = {
  src: string;
  alt?: string;
};

type ImageSliderProps = {
  images: ImageType[];
  autoplay?: boolean;
  autoplaySpeed?: number;
};

const ImageSlider: React.FC<ImageSliderProps> = ({
  images,
  autoplay = true,
  autoplaySpeed = 5000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);

  const goToNext = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    setTimeout(() => setIsAnimating(false), 500);
  }, [images.length, isAnimating]);

  useEffect(() => {
    if (!autoplay) return;

    autoplayTimerRef.current = setInterval(goToNext, autoplaySpeed);

    return () => {
      if (autoplayTimerRef.current) {
        clearInterval(autoplayTimerRef.current);
      }
    };
  }, [autoplay, autoplaySpeed, goToNext]);

  const resetAutoplayTimer = () => {
    if (autoplayTimerRef.current) {
      clearInterval(autoplayTimerRef.current);
      autoplayTimerRef.current = setInterval(goToNext, autoplaySpeed);
    }
  };

  return (
    <div className="relative w-full h-full">
      <div className="overflow-hidden w-full h-full relative">
        <div
          className="flex transition-transform duration-500 ease-in-out w-full h-full"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((image, index) => (
            <div key={index} className="min-w-full h-full flex-shrink-0">
              <div className="relative w-full h-full">
                <Image
                  src={image.src}
                  alt={image.alt || `Slide ${index + 1}`}
                  fill
                  className="object-cover object-center"
                  priority={index === 0}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentIndex(index);
              resetAutoplayTimer();
            }}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "bg-white w-6"
                : "bg-white/50 hover:bg-white/80 w-2"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageSlider;
