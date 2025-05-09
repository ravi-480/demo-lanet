"use client";

import { motion } from "framer-motion";
import Welcome from "@/app/Components/DashBoard/Welcome";
import EventDisplay from "@/app/Components/DashBoard/EventDisplay";
import EventCalendar from "@/app/Components/DashBoard/EventCalendar";
import DashboardSections from "./DashboardSection";

const Dashboard = () => {
  return (
    <div className="min-h-screen px-4 sm:px-6 md:px-8 lg:px-16 py-4 sm:py-7 bg-gray-900">
      {/* Welcome section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Welcome />
      </motion.div>

      {/* Events and Calendar section */}
      <div className="w-full mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Event Display */}
          <motion.div 
            className="flex-grow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <EventDisplay />
          </motion.div>
          
          {/* Calendar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <EventCalendar />
          </motion.div>
        </div>
      </div>

      {/* Dashboard Sections */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <DashboardSections />
      </motion.div>
    </div>
  );
};

export default Dashboard;