"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GuestStatProps {
  guests: any[];
}

const GuestStats = ({ guests }: GuestStatProps) => {
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Total Guests"
        value={totalGuests}
        textColor="text-gray-100"
      />

      <StatCard
        title="Confirmed"
        value={confirmedGuests}
        textColor="text-green-400"
        percentage={calculatePercentage(confirmedGuests)}
      />

      <StatCard
        title="Pending"
        value={pendingGuests}
        textColor="text-amber-500"
        percentage={calculatePercentage(pendingGuests)}
      />

      <StatCard
        title="Declined"
        value={declinedGuests}
        textColor="text-red-500"
        percentage={calculatePercentage(declinedGuests)}
      />
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number;
  textColor: string;
  percentage?: string;
}

const StatCard = ({ title, value, textColor, percentage }: StatCardProps) => (
  <Card className="bg-gray-800">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium text-gray-300">
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className={`text-2xl font-bold ${textColor}`}>{value}</div>
      {percentage && (
        <p className="text-xs text-gray-300 mt-1">
          {percentage}% of total guests
        </p>
      )}
    </CardContent>
  </Card>
);

export default GuestStats;
