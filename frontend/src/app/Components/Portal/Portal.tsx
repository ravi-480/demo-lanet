"use client";
import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface PortalProps {
  children: ReactNode;
}

const Portal = ({ children }: PortalProps) => {
  const [mounted, setMounted] = useState(false);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
    const rootElement = document.getElementById("portal-root");
    if (rootElement) {
      setPortalRoot(rootElement);
    }
    return () => setMounted(false);
  }, []);

  if (!mounted || !portalRoot) {
    return null; // Return null if portal root isn't available
  }

  return createPortal(children, portalRoot);
};

export default Portal;
