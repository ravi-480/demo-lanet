"use client";

import { useState, useMemo, memo, Suspense } from "react";
import { useSelector, shallowEqual } from "react-redux";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import dynamic from "next/dynamic";
import { RootState } from "@/store/store";
import { SearchVendorProps } from "@/Interface/interface";

const EventOverView = dynamic(() => import("./EventOverView"), {
  loading: () => (
    <div className="h-64 w-full bg-gray-800 animate-pulse rounded-lg"></div>
  ),
  ssr: false,
});

const SearchVendor = dynamic(() => import("./SearchVendor"), {
  loading: () => (
    <div className="p-4 text-gray-400">
      <div className="h-12 w-full bg-gray-800 animate-pulse rounded-lg mb-4"></div>
      <div className="h-64 w-full bg-gray-800 animate-pulse rounded-lg"></div>
    </div>
  ),
  ssr: false,
});

// Using memo to prevent unnecessary re-renders
const EventTabComponent = memo(() => {
  const [activeTab, setActiveTab] = useState("overview");

  // Use shallowEqual for performance optimization
  const event = useSelector(
    (state: RootState) => state.event.singleEvent,
    shallowEqual
  );

  const tabs = useMemo(
    () => [
      { value: "overview", label: "Overview" },
      { value: "vendors", label: "Vendors" },
    ],
    []
  );

  // Define vendor props only if event exists, otherwise set to null
  const vendorProps = useMemo<SearchVendorProps | null>(() => {
    if (!event) return null;

    return {
      noOfDay: event.durationInDays,
      eventId: event._id,
      noOfAddedGuest: event.noOfGuestAdded,
      addedBy: event.creator,
      noOfGuest: event.guestLimit,
      eventType: event.eventType,
      eventLocation: event.location,
    };
  }, [event]);

  if (!event) {
    return (
      <div role="alert" className="text-center py-4 text-white">
        No event loaded.
      </div>
    );
  }

  return (
    <div className="w-full sm:w-[95%] bg-gray-900 border mt-2 sm:mt-4 border-b rounded-lg sm:rounded-2xl p-3 sm:p-5 mx-auto">
      <Tabs className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex w-full gap-2 sm:gap-6 border-b-2 border-gray-500 overflow-x-auto">
          {tabs.map(({ value, label }) => (
            <TabsTrigger
              key={value}
              value={value}
              aria-label={`View ${label}`}
              className={`cursor-pointer relative px-2 sm:px-4 py-1 sm:py-2 text-base sm:text-lg transition-all whitespace-nowrap ${
                activeTab === value ? "text-cyan-400 " : "text-gray-400"
              }`}
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="p-2 sm:p-4">
          <Suspense
            fallback={
              <div className="h-64 w-full bg-gray-800 animate-pulse rounded-lg"></div>
            }
          >
            <EventOverView event={event} />
          </Suspense>
        </TabsContent>

        <TabsContent value="vendors" className="p-2 sm:p-4">
          {activeTab === "vendors" && vendorProps && (
            <Suspense
              fallback={
                <div className="h-64 w-full bg-gray-800 animate-pulse rounded-lg"></div>
              }
            >
              <SearchVendor {...vendorProps} />
            </Suspense>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
});

// Set display name explicitly
EventTabComponent.displayName = "EventTabComponent";

export default EventTabComponent;
