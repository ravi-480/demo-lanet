import React from "react";
import { Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import RenderEventStatusBadge from "@/app/Components/DashBoard/EventStatus";
import { formatSimpleDate } from "@/StaticData/Static";
import { getEventStatus } from "@/utils/helper";

interface EventCardProps {
  event: {
    _id: string;
    image?: string;
    name?: string;
    date: string | Date;
    location?: string;
    status?: string;
    budget?: { allocated: number };
    description?: string;
  };
  variant?: "compact" | "detailed";
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  variant = "compact",
}) => {
  const isDetailed = variant === "detailed";

  return (
    <div
      className={`rounded-lg overflow-hidden border ${
        isDetailed ? "border-gray-700 bg-gray-800 hover:bg-gray-750 mt-6" : ""
      } flex flex-col`}
    >
      <Image
        src={event.image || "/api/placeholder/400/200"}
        alt={event.name || "Event"}
        className={`w-full ${isDetailed ? "h-35" : "sm:h-32"} object-cover`}
        width={isDetailed ? 300 : 400}
        height={isDetailed ? 100 : 160}
        priority
      />
      <div
        className={`${
          isDetailed ? "p-4" : "px-3 py-2"
        } flex-1 flex flex-col justify-between`}
      >
        <div>
          <div className="flex justify-between items-start mb-1">
            <h3
              className={`font-medium ${
                isDetailed
                  ? "text-lg line-clamp-1"
                  : "text-sm sm:text-base md:text-lg"
              } text-white`}
            >
              {event.name || "Unnamed Event"}
            </h3>
            {RenderEventStatusBadge(getEventStatus(event.date))}
          </div>

          <div
            className={`${
              isDetailed ? "space-y-1 text-sm" : "mt-2 space-y-2 text-xs"
            } text-gray-300`}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Clock
                  size={isDetailed ? 14 : 12}
                  className={`mr-2 ${isDetailed ? "text-gray-400" : ""}`}
                />
                <span>{formatSimpleDate(event.date)}</span>
              </div>
              <div className="flex items-center">
                <MapPin
                  size={isDetailed ? 14 : 12}
                  className={`mr-2 ${isDetailed ? "text-gray-400" : ""}`}
                />
                <span className="truncate max-w-[100px]">
                  {event.location || "No location"}
                </span>
              </div>
            </div>

            {isDetailed && event.budget && (
              <div className="text-sm">
                <span className="text-gray-400">Budget: </span>
                <span className="font-medium">
                  ₹{event.budget?.allocated || 0}
                </span>
              </div>
            )}

            {isDetailed && event.description && (
              <div className="mb-2 overflow-hidden text-gray-400 text-xs">
                {event.description?.substring(0, 80)}
                {event.description?.length > 80 ? "..." : ""}
              </div>
            )}
          </div>
        </div>

        <Link
          href={`/events/${event._id}`}
          className={isDetailed ? "" : "mt-3"}
        >
          <Button className="w-full">
            {isDetailed ? "View Details" : "View more"}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default EventCard;
