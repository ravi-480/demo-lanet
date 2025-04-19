import React, { useEffect, useState } from "react";
import { Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store/store";
import {
  fetchEvents,
  selectEvents,
  selectEventLoading,
  selectEventError,
} from "../../../store/eventSlice";
import Link from "next/link";
import Image from "next/image";
import RenderEventStatusBadge from "./EventStatus";
import { tabs } from "@/StaticData/Static";
import { getEventStatus } from "@/utils/helper";

const EventDisplay: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const events = useSelector(selectEvents) || [];
  const isLoading = useSelector(selectEventLoading);
  const error = useSelector(selectEventError);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        await dispatch(fetchEvents()).unwrap();
      } catch (err) {
        console.error("Failed to fetch events:", err);
      } finally {
        setIsInitialized(true);
      }
    };
    loadEvents();
  }, [dispatch]);

  const now = new Date().getTime();

  const [showAllEvents, setShowAllEvents] = useState(false);

  const filteredEvents =
    events?.filter((event) => {
      if (activeTab === "all") return true;
      const eventDate = new Date(event.date).getTime();
      if (activeTab === "upcoming") return eventDate > now;
      if (activeTab === "past") return eventDate <= now;
      return event.status === activeTab;
    }) || [];

  const displayEvents =
    activeTab === "all" && !showAllEvents
      ? filteredEvents.slice(0, 3)
      : filteredEvents;

  const formatDate = (dateValue?: string | Date): string => {
    if (!dateValue) return "No date";
    try {
      return new Date(dateValue).toLocaleDateString();
    } catch {
      return "Invalid date";
    }
  };

  if (isLoading || !isInitialized) {
    return (
      <div className="bg-gray-900 text-white rounded-lg shadow-sm p-6 mb-6 w-full">
        <div className="border-b border-gray-500 pb-4 mb-4">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 rounded-md ${
                  activeTab === tab.id
                    ? "bg-blue-100 text-blue-800"
                    : "text-gray-300 hover:bg-gray-100 hover:text-blue-800"
                }`}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="text-center py-12">
          <p className="text-white">Loading events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-400">
        <p>Error fetching events: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border text-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 w-full">
      <div className="border-b border-gray-500 pb-4 mb-4">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id), setShowAllEvents(false);
              }}
              className={`px-3 py-2 cursor-pointer rounded-md ${
                activeTab === tab.id
                  ? "bg-blue-100 hover:bg-blue-100  text-gray-900 font-semibold"
                  : "text-gray-200 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-300">
            No events available
          </h3>
          <p className="text-gray-300 mt-2 mb-4">Click 'Create New Event'</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 space-y-2">
            {displayEvents.map((event) => (
              <div
                key={event._id}
                className=" rounded-lg sm:w-full md:w-60 overflow-hidden bg-gray-900 border  flex flex-col"
              >
                <Image
                  src={event.image || "/api/placeholder/400/200"}
                  alt={event.name || "Event"}
                  className="w-full   sm:h-32 object-cover"
                  width={400}
                  height={160}
                />
                <div className="px-3 py-2 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-sm sm:text-base md:text-lg text-white">
                        {event.name || "Unnamed Event"}
                      </h3>
                      {RenderEventStatusBadge(getEventStatus(event.date))}
                    </div>

                    <div className="mt-2 space-y-2 text-xs text-gray-300">
                      <div className="flex justify-between gap-2">
                        <div className="flex items-center">
                          <Clock size={12} className="mr-2" />
                          <span>{formatDate(event.date)}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin size={12} className="mr-2" />
                          <span className="truncate max-w-[100px]">
                            {event.location || "No location"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Link href={`/events/${event._id}`} className="mt-3">
                    <Button className="w-full bg-amber-100 cu text-gray-900 cursor-pointer hover:bg-amber-200">
                      View more
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
          {activeTab == "all" &&
            filteredEvents.length > 3 &&
            !showAllEvents && (
              <Button
                className=" mt-2 bg-cyan-500  text-white hover:bg-cyan-600 cursor-pointer hover:text-white"
                onClick={() => setShowAllEvents(true)}
              >
                View More
              </Button>
            )}
          {showAllEvents && (
            <Button
              className=" mt-2 bg-cyan-500  text-white hover:bg-cyan-600 cursor-pointer hover:text-white"
              onClick={() => setShowAllEvents(false)}
            >
              Hide
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default EventDisplay;
