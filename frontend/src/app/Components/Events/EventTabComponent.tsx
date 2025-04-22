"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import EventOverView from "./EventOverView";
import SearchVendor from "./SearchVendor";
import { eventVendorMapping } from "@/StaticData/Static";
import { RootState } from "@/store/store";

export default function EventTabComponent({ id }: { id: string }) {
  const [activeTab, setActiveTab] = useState("overview");
  const event = useSelector((state: RootState) => state.event.singleEvent);

  if (!event) {
    return <p className="text-center py-4">No event loaded.</p>;
  }

  const allowedCategories =
    eventVendorMapping[event.eventType as keyof typeof eventVendorMapping]?.map(
      (c) => c.category
    ) || [];

  const tabs = [
    { value: "overview", label: "Overview" },
    { value: "vendors", label: "Vendors" },
  ];

  return (
    <div className="w-full sm:w-[95%] bg-gray-900 border mt-2 sm:mt-4 border-b rounded-lg sm:rounded-2xl p-3 sm:p-5 mx-auto">
      <Tabs className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex w-full gap-2 sm:gap-6 border-b-2 border-gray-300 overflow-x-auto">
          {tabs.map(({ value, label }) => (
            <TabsTrigger
              key={value}
              value={value}
              className={`cursor-pointer relative px-2 sm:px-4 py-1 sm:py-2 text-base sm:text-lg transition-all whitespace-nowrap
                ${activeTab === value ? "text-cyan-400" : "text-gray-400"}
                after:absolute after:bottom-[-1px] after:border-cyan-400 after:left-0 after:w-full after:h-[3px]
                after:bg-cyan-700 after:transition-transform
                ${activeTab === value ? "after:scale-x-100" : "after:scale-x-0"}
              `}
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="p-2 sm:p-4">
          <EventOverView event={event} />
        </TabsContent>

        <TabsContent value="vendors" className="p-2 sm:p-4">
          <SearchVendor
            noOfDay={event.durationInDays}
            eventId={event._id}
            noOfAddedGuest={event.noOfGuestAdded}
            addedBy={event.creator}
            noOfGuest={event.guestLimit}
            eventType={event.eventType}
            allowedCategories={allowedCategories}
            eventLocation={event.location}
            
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
