import React from "react";
import { Button } from "@/components/ui/button";
import { tabs } from "@/StaticData/Static";

interface EventTabsProps {
  activeTab: string;
  setActiveTab: (tabId: string) => void;
  className?: string;
}

const EventTabs: React.FC<EventTabsProps> = ({
  activeTab,
  setActiveTab,
  className = "border-b border-gray-500 pb-4 mb-4",
}) => {
  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2 cursor-pointer rounded-md ${
              activeTab === tab.id
                ? "bg-blue-100 hover:bg-blue-100 text-gray-900 font-semibold"
                : "text-gray-200 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default EventTabs;
