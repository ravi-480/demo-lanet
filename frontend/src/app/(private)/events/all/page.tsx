"use client";
import React, { useEffect, useState } from "react";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { AppDispatch, RootState } from "@/store/store";
import { fetchEvents } from "@/store/eventSlice";
import { useEventFilter } from "@/app/Components/Events/EventFilter";
import LoadingState from "@/app/Components/Loading/Loading";
import EventTabs from "@/app/Components/Events/EventTab";
import EventCard from "@/app/Components/Events/EventCard";
import { useRouter } from "next/navigation";

const AllEventsPage = () => {
  const { events, isLoading } = useSelector((state: RootState) => state.event);
  const dispatch = useDispatch<AppDispatch>();
  const [showFilters, setShowFilters] = useState(false);

  const {
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
  } = useEventFilter({ events });

  const router = useRouter();

  useEffect(() => {
    let retryTimeout: ReturnType<typeof setTimeout>;;

    const loadEvents = async () => {
      try {
        await dispatch(fetchEvents()).unwrap();
      } catch (err) {
        console.log(err);

        retryTimeout = setTimeout(() => loadEvents(), 10000);
      }
    };

    loadEvents();

    return () => {
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [dispatch]);

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="p-4">
      <div className="bg-gray-900 border text-gray-200 rounded-lg shadow-sm p-4 sm:p-6 mb-6 w-full max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 mb-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold text-white mb-4 md:mb-0">
            All Events
          </h1>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search events..."
                className="pl-8 bg-gray-800 border-gray-700 text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Button
              variant="outline"
              className="flex items-center gap-2 text-black cursor-pointer hover:bg-gray-300"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={16} />
              Filters
            </Button>

            <Button onClick={() => router.push("/create-events")}>
              Create Event
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="mb-6 p-4 bg-gray-800 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Date
              </label>
              <Input
                type="date"
                className="bg-gray-700 border-gray-600 text-white [&::-webkit-calendar-picker-indicator]:invert"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Location
              </label>
              <Input
                type="text"
                placeholder="Filter by location"
                className="bg-gray-700 border-gray-600 text-white"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                className="text-black hover:bg-gray-300"
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        )}

        <EventTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          className="border-b border-gray-700 flex flex-wrap gap-2 pb-4 mb-6"
        />

        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-300">
              No events found
            </h3>
            <p className="text-gray-300 mt-2 mb-4">
              Try adjusting your filters or creating a new event
            </p>
            <Link href="/create-events">
              <Button className="bg-blue-600 cursor-pointer hover:bg-blue-700">
                Create New Event
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredEvents.map((event) => (
              <EventCard key={event._id} event={event} variant="detailed" />
            ))}
          </div>
        )}

        {filteredEvents.length > 0 && (
          <div className="mt-8 flex justify-center">
            <p className="text-gray-400">
              Showing {filteredEvents.length} events
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllEventsPage;
