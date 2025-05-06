import React from "react";
import { Button } from "@/components/ui/button";
import { tabs } from "@/StaticData/Static";
import { motion } from "framer-motion";

interface EventTabsProps {
  activeTab: string;
  setActiveTab: (tabId: string) => void;
  className?: string;
}

const EventTabs: React.FC<EventTabsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div>
      <motion.div
        className="flex flex-wrap gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {tabs.map((tab, index) => (
          <motion.div
            key={tab.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: index * 0.1,
              duration: 0.3,
            }}
          >
            <Button
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 cursor-pointer rounded-md transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-violet-700 hover:bg-violet-600 text-white font-semibold"
                  : "text-gray-200 hover:bg-gray-800 hover:text-white"
              }`}
            >
              {tab.label}
            </Button>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default EventTabs;
