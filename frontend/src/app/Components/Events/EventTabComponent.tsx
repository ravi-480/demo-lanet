"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import EventOverView from "./EventOverView";
import { IEvent } from "@/Interface/interface";
import SearchVendor from "./SearchVendor";
import { eventVendorMapping } from "@/StaticData/Static";

export default function EventTabComponent({ event }: { event: IEvent }) {
  const [activeTab, setActiveTab] = useState("overview");
  const eventType = event.eventType;
  const formattedEventType =
    eventType.charAt(0).toUpperCase() + eventType.slice(1).toLowerCase();

  const allowedCategories =
    eventVendorMapping[formattedEventType as keyof typeof eventVendorMapping]?.map(
      (c) => c.category
    ) || [];

  return (
    <div className="w-[95%] bg-blue-950 mt-4 border-b rounded-2xl p-4 mx-auto">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="bg-transparent"
      >
        <TabsList className="flex gap-6 border-b-2 border-gray-300">
          {["overview", "vendors", "guests & RSVPs", "budget"].map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className={`relative px-4 py-2 text-lg  text-gray-700 transition-all 
                ${activeTab === tab ? "text-blue-600 " : "text-gray-500"}
                after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-[3px] 
                after:bg-blue-600 after:scale-x-0 after:transition-transform
                ${activeTab === tab ? "after:scale-x-100" : ""}
              `}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview">
          <div className="p-4">
            <EventOverView event={event} />
          </div>
        </TabsContent>
        <TabsContent value="vendors">
          <div className="p-4">
            <SearchVendor
              eventType={eventType}
              allowedCategories={allowedCategories}
              onSelectCategory={(category) => {
                console.log("User selected:", category);
              }}
            />
          </div>
        </TabsContent>
        <TabsContent value="guests">
          <div className="p-4">Guests & RSVPs Page</div>
        </TabsContent>
        <TabsContent value="budget">
          <div className="p-4">Budget Page</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
