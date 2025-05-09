"use client";

import { useState, useMemo, memo, Suspense, useEffect } from "react";
import { useSelector, shallowEqual } from "react-redux";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import dynamic from "next/dynamic";
import { RootState } from "@/store/store";
import { SearchVendorProps } from "@/Interface/interface";
import { motion } from "framer-motion";

// Dynamic imports with loading states
const EventOverView = dynamic(() => import("./EventOverView"), {
  loading: () => (
    <div className="h-64 w-full bg-gray-800/50 animate-pulse rounded-lg"></div>
  ),
  ssr: false,
});

const SearchVendor = dynamic(() => import("./SearchVendor"), {
  loading: () => (
    <div className="p-4 text-gray-400">
      <div className="h-12 w-full bg-gray-800/50 animate-pulse rounded-lg mb-4"></div>
      <div className="h-64 w-full bg-gray-800/50 animate-pulse rounded-lg"></div>
    </div>
  ),
  ssr: false,
});

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

// Using memo to prevent unnecessary re-renders
const EventTabComponent = memo(() => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isVisible, setIsVisible] = useState(false);

  // shallowEqual for performance optimization
  const event = useSelector(
    (state: RootState) => state.event.singleEvent,
    shallowEqual
  );

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const tabs = useMemo(
    () => [
      { value: "overview", label: "Overview", icon: "📊" },
      { value: "vendors", label: "Vendors", icon: "🛍️" },
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
      <div role="alert" className="text-center py-8 text-white">
        <div className="animate-pulse text-lg">No event loaded.</div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      variants={containerVariants}
      className="w-full sm:w-[95%] bg-gradient-to-br from-gray-900 to-gray-950 border mt-2 sm:mt-4 border-gray-800 rounded-lg sm:rounded-2xl p-3 sm:p-5 mx-auto shadow-lg transition-all duration-300"
    >
      <Tabs className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <motion.div variants={itemVariants}>
          <TabsList className="flex w-full gap-2 sm:gap-6 border-b-2 border-gray-700 overflow-x-auto bg-transparent">
            {tabs.map(({ value, label, icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                aria-label={`View ${label}`}
                className={`cursor-pointer relative px-3 sm:px-5 py-2 sm:py-3 text-base sm:text-lg transition-all duration-300 ease-in-out whitespace-nowrap hover:text-cyan-300 ${
                  activeTab === value
                    ? "text-cyan-400 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-cyan-400"
                    : "text-gray-400"
                }`}
              >
                <span className="mr-2">{icon}</span>
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-4">
          <TabsContent value="overview" className="p-2 sm:p-4">
            <Suspense
              fallback={
                <div className="h-64 w-full bg-gray-800/50 animate-pulse rounded-lg"></div>
              }
            >
              <EventOverView event={event} />
            </Suspense>
          </TabsContent>

          <TabsContent value="vendors" className="p-2 sm:p-4">
            {activeTab === "vendors" && vendorProps && (
              <Suspense
                fallback={
                  <div className="h-64 w-full bg-gray-800/50 animate-pulse rounded-lg"></div>
                }
              >
                <SearchVendor {...vendorProps} />
              </Suspense>
            )}
          </TabsContent>
        </motion.div>
      </Tabs>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }

        .animate-slide-up {
          animation: slideUp 0.6s ease-out forwards;
        }
      `}</style>
    </motion.div>
  );
});

// Set display name explicitly
EventTabComponent.displayName = "EventTabComponent";

export default EventTabComponent;
