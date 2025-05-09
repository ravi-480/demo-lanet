"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GuestStat } from "@/Interface/interface";
import { Users, CheckCircle, Clock, XCircle } from "lucide-react";
import { motion, Variants } from "framer-motion";

interface GuestStatsProps {
  guestStats: GuestStat | null;
  totalCount: number;
}

const GuestStats = ({ totalCount, guestStats }: GuestStatsProps) => {
  const [isVisible, setIsVisible] = useState(false);

  // Count stats from current page data
  const confirmedGuests = guestStats?.confirmed || 0;
  const pendingGuests = guestStats?.pending || 0;
  const declinedGuests = guestStats?.declined || 0;
  const total = confirmedGuests + declinedGuests + pendingGuests;
  const calculatePercentage = (count: number) => {
    return totalCount > 0 ? ((count / totalCount) * 100).toFixed(1) : "0";
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  useEffect(() => {
    // Trigger animations after component mounts
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      className="mb-6"
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      variants={containerVariants}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Guests"
          value={total}
          textColor="text-blue-400"
          icon={<Users size={20} className="text-blue-400" />}
          variants={itemVariants}
          showPercentage={false}
        />

        <StatCard
          title="Confirmed"
          value={confirmedGuests}
          textColor="text-green-400"
          percentage={calculatePercentage(confirmedGuests)}
          icon={<CheckCircle size={20} className="text-green-400" />}
          variants={itemVariants}
          showPercentage={true}
        />

        <StatCard
          title="Pending"
          value={pendingGuests}
          textColor="text-amber-400"
          percentage={calculatePercentage(pendingGuests)}
          icon={<Clock size={20} className="text-amber-400" />}
          variants={itemVariants}
          showPercentage={true}
        />

        <StatCard
          title="Declined"
          value={declinedGuests}
          textColor="text-red-400"
          percentage={calculatePercentage(declinedGuests)}
          icon={<XCircle size={20} className="text-red-400" />}
          variants={itemVariants}
          showPercentage={true}
        />
      </div>
    </motion.div>
  );
};

interface StatCardProps {
  title: string;
  value: number;
  textColor: string;
  icon: React.ReactNode;
  percentage?: string;
  variants: Variants;
  showPercentage: boolean;
}

const StatCard = ({
  title,
  value,
  textColor,
  percentage,
  icon,
  variants,
  showPercentage,
}: StatCardProps) => (
  <motion.div variants={variants}>
    <Card className="bg-gray-800 border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-gray-300 flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
          <span className={`text-3xl font-bold ${textColor}`}>{value}</span>
          {showPercentage ? (
            <span className="text-xs text-gray-400 mt-1">
              {percentage}% of total guests
            </span>
          ) : (
            <span className="text-xs text-gray-400 mt-1">&nbsp;</span>
          )}
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default GuestStats;
