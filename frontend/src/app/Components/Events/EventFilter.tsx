import { IEvent } from "@/Interface/interface";
import { useState, useMemo } from "react";

interface UseEventFilterProps {
  events: IEvent[] | null | undefined;
  initialTab?: string;
}

export const useEventFilter = ({
  events,
  initialTab = "all",
}: UseEventFilterProps) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [locationFilter, setLocationFilter] = useState<string>("");

  const now = new Date().getTime();

  const filteredEvents = useMemo(() => {
    return (
      events?.filter((event) => {
        // First apply tab filter
        if (activeTab !== "all") {
          const eventDate = new Date(event.date).getTime();
          if (activeTab === "upcoming" && eventDate <= now) return false;
          if (activeTab === "past" && eventDate > now) return false;
          if (
            activeTab !== "upcoming" &&
            activeTab !== "past" &&
            event.status !== activeTab
          )
            return false;
        }

        // Apply search filter
        if (
          searchTerm &&
          !event.name.toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          return false;
        }

        // Apply date filter
        if (dateFilter) {
          const eventDateStr = new Date(event.date).toISOString().split("T")[0];
          if (eventDateStr !== dateFilter) return false;
        }

        // Apply location filter
        if (
          locationFilter &&
          !event.location.toLowerCase().includes(locationFilter.toLowerCase())
        ) {
          return false;
        }

        return true;
      }) || []
    );
  }, [events, activeTab, searchTerm, dateFilter, locationFilter, now]);

  const clearFilters = () => {
    setDateFilter("");
    setLocationFilter("");
    setSearchTerm("");
  };

  return {
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    dateFilter,
    setDateFilter,
    locationFilter,
    setLocationFilter,
    filteredEvents,
    clearFilters,
  };
};
