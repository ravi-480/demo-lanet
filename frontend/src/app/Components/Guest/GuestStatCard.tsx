"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IGuest } from "@/Interface/interface";
import { Users, CheckCircle, Clock, XCircle } from "lucide-react";

const GuestStats = ({ guests }: { guests: IGuest[] }) => {
  const [isVisible, setIsVisible] = useState(false);
  const totalGuests = guests.length;

  // Count stats
  const confirmedGuests = guests.filter(
    (guest) => guest.status === "Confirmed"
  ).length;

  const pendingGuests = guests.filter(
    (guest) => guest.status === "Pending"
  ).length;

  const declinedGuests = guests.filter(
    (guest) => guest.status === "Declined"
  ).length;

  const calculatePercentage = (count: number) => {
    return totalGuests > 0 ? ((count / totalGuests) * 100).toFixed(1) : "0";
  };

  useEffect(() => {
    // Trigger animations after component mounts
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`mb-6 transition-all duration-500 transform ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Guests"
          value={totalGuests}
          textColor="text-blue-400"
          icon={<Users size={20} className="text-blue-400" />}
          delay="100"
          isVisible={isVisible}
        />

        <StatCard
          title="Confirmed"
          value={confirmedGuests}
          textColor="text-green-400"
          percentage={calculatePercentage(confirmedGuests)}
          icon={<CheckCircle size={20} className="text-green-400" />}
          delay="200"
          isVisible={isVisible}
        />

        <StatCard
          title="Pending"
          value={pendingGuests}
          textColor="text-amber-400"
          percentage={calculatePercentage(pendingGuests)}
          icon={<Clock size={20} className="text-amber-400" />}
          delay="300"
          isVisible={isVisible}
        />

        <StatCard
          title="Declined"
          value={declinedGuests}
          textColor="text-red-400"
          percentage={calculatePercentage(declinedGuests)}
          icon={<XCircle size={20} className="text-red-400" />}
          delay="400"
          isVisible={isVisible}
        />
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number;
  textColor: string;
  icon: React.ReactNode;
  percentage?: string;
  delay: string;
  isVisible: boolean;
}

const StatCard = ({
  title,
  value,
  textColor,
  percentage,
  icon,
  delay,
  isVisible,
}: StatCardProps) => (
  <Card
    className={`bg-gray-800 border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden ${
      isVisible ? `animate-card-appear-${delay}` : "opacity-0"
    }`}
  >
    <CardHeader className="pb-2">
      <CardTitle className="text-sm text-gray-300 flex items-center gap-2">
        {icon}
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex flex-col">
        <span className={`text-3xl font-bold ${textColor}`}>{value}</span>
        {percentage && (
          <span className="text-xs text-gray-400 mt-1">
            {percentage}% of total guests
          </span>
        )}
      </div>
    </CardContent>
  </Card>
);

export default GuestStats;
