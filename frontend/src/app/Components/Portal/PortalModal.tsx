"use client";
import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

const PortalModal = ({ children }: { children: ReactNode }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // On the server or during initial render, don't render anything
  if (!mounted) return null;

  // After component is mounted on the client, render through portal
  return createPortal(children, document.body);
};

export default PortalModal;
