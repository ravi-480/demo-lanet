import { useRef, useState, useEffect, useCallback } from "react";

interface VisibilityLoaderOptions {
  threshold?: number;
  onVisible?: () => void | Promise<void>;
  triggerOnce?: boolean;
}

// Hook to detect when an element is visible in viewport and trigger loading once

export const useVisibilityLoader = ({
  threshold = 0.1,
  onVisible,
  triggerOnce = true,
}: VisibilityLoaderOptions = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  const handleVisible = useCallback(async () => {
    if (onVisible) {
      await onVisible();
    }
    if (triggerOnce) {
      setIsLoaded(true);
    }
  }, [onVisible, triggerOnce]);

  useEffect(() => {
    const currentRef = elementRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting && (!triggerOnce || !isLoaded)) {
          setIsVisible(true);
          await handleVisible();
        }
      },
      { threshold }
    );

    observer.observe(currentRef);

    return () => observer.disconnect();
  }, [threshold, isLoaded, triggerOnce, handleVisible]);

  return { elementRef, isVisible, isLoaded };
};
