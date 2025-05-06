"use client";

import { Button } from "@/components/ui/button";
import { selectEvents } from "@/store/eventSlice";
import { RootState } from "@/store/store";
import { Plus } from "lucide-react";
import Link from "next/link";
import React from "react";
import { useSelector } from "react-redux";
import { getNoOfUpcomingEvent } from "../../../utils/helper";
import { motion } from "framer-motion";

const Welcome = () => {
  const events = useSelector(selectEvents) || [];
  const val = getNoOfUpcomingEvent(events);
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <motion.div
      className="bg-gray-900 border border-gray-400 rounded-lg shadow-sm p-6 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 12,
      }}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between items-center text-center md:text-left">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            delay: 0.2,
            duration: 0.5,
          }}
        >
          <motion.h1
            className="text-2xl font-semibold text-gray-100"
            style={{ fontSize: "1.5rem", lineHeight: "2rem" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Welcome back,<span className="capitalize"> {user?.name}</span>
          </motion.h1>

          <motion.p
            className="text-violet-500 mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            You have <span className="font-semibold">{val}</span> upcoming
            events
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: 0.5,
            duration: 0.3,
          }}
        >
          <Link href="/create-events">
            <Button className="mt-4 md:mt-0 flex py-5 bg-violet-600 hover:bg-violet-700 transition-colors duration-300">
              <Plus size={18} className="mr-2" />
              Create New Event
            </Button>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Welcome;
