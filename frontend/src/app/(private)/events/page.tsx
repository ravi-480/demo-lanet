"use client";

import DashboardSections from "./DashboardSection";
import { motion } from "framer-motion";
import Welcome from "@/app/Components/DashBoard/Welcome";
import EventDisplay from "@/app/Components/DashBoard/EventDisplay";
import EventCalendar from "@/app/Components/DashBoard/EventCalendar";

// Animation variants for staggered children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
};

const Dashboard = () => {
  return (
    <motion.div
      className="min-h-screen px-4 sm:px-6 md:px-8 lg:px-16 py-4 sm:py-7 bg-gray-900"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <Welcome />
      </motion.div>

      <motion.div variants={itemVariants} className="w-full mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <motion.div className="flex-grow" variants={itemVariants}>
            <EventDisplay />
          </motion.div>
          <motion.div variants={itemVariants}>
            <EventCalendar />
          </motion.div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <DashboardSections />
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
