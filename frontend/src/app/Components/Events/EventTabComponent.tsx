"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import EventOverView from "./EventOverView";
import SearchVendor from "./SearchVendor";
import { eventVendorMapping } from "@/StaticData/Static";
import { RootState } from "@/store/store";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function EventTabComponent({ id }: { id: string }) {
  const [activeTab, setActiveTab] = useState("overview");
  const event = useSelector((state: RootState) => state.event.singleEvent);

  if (!event) {
    return <p className="text-white text-center py-4">No event loaded.</p>;
  }

  const formattedEventType =
    event.eventType.charAt(0).toUpperCase() +
    event.eventType.slice(1).toLowerCase();

  const allowedCategories =
    eventVendorMapping[
      formattedEventType as keyof typeof eventVendorMapping
    ]?.map((c) => c.category) || [];

  const tabs = [
    { value: "overview", label: "Overview" },
    { value: "vendors", label: "Vendors" },
    { value: "guests", label: "Guests" },
    { value: "budget", label: "Budget" },
  ];

  return (
    <div className="w-[95%] bg-gray-900 border mt-4 border-b rounded-2xl p-5 mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between">
          <TabsList className="flex gap-6 border-b-2 border-gray-300">
            {tabs.map(({ value, label }) => (
              <TabsTrigger
                key={value}
                value={value}
                className={`relative px-4 py-2 text-lg transition-all
                ${activeTab === value ? "text-blue-600" : "text-gray-500"}
                after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-[3px]
                after:bg-blue-600 after:transition-transform
                ${activeTab === value ? "after:scale-x-100" : "after:scale-x-0"}
              `}
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
          <Link href={`${id}/vendor-cart`}>
            <Button className="bg-transparent hover:bg-transparent cursor-pointer underline-offset-4  hover:underline">
              Vendors
              <ArrowRight />
            </Button>
          </Link>
        </div>

        <TabsContent value="overview" className="p-4">
          <EventOverView event={event} />
        </TabsContent>

        <TabsContent value="vendors" className="p-4">
          <SearchVendor
            eventId={event._id}
            addedBy={event.creator}
            noOfGuest={event.guestLimit}
            eventType={event.eventType}
            allowedCategories={allowedCategories}
            eventLocation={event.location}
          />
        </TabsContent>

        <TabsContent value="guests" className="p-4"></TabsContent>

        <TabsContent value="budget" className="p-4">
          Budget Page
        </TabsContent>
      </Tabs>
    </div>
  );
}
