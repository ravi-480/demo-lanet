"use client";

import { Card } from "@/components/ui/card";

interface DarkCardProps {
  children: React.ReactNode;
  className?: string;
}

export const DarkCard = ({ children, className = "" }: DarkCardProps) => (
  <Card className={`border-0 shadow-lg bg-gray-800 text-white ${className}`}>
    {children}
  </Card>
);