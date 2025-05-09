"use client";
import React, { useEffect, useState } from "react";
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { AppDispatch, RootState } from "@/store/store";
import { fetchEvents } from "@/store/eventSlice";
import { useEventFilter } from "@/hooks/useEventFilter";
import LoadingState from "@/app/Components/Loading/Loading";
import EventTabs from "@/app/Components/Events/EventTab";
import EventCard from "@/app/Components/Events/EventCard";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const AllEventsPage = () => {
  const { events, isLoading } = useSelector((state: RootState) => state.event);
  const dispatch = useDispatch<AppDispatch>();
  const [showFilters, setShowFilters] = React.useState(false);
  const [pageTransition, setPageTransition] = useState(false);

  const {
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    dateFilter,
    setDateFilter,
    locationFilter,
    setLocationFilter,
    clearFilters,
    pagination,
    handlePageChange,
  } = useEventFilter({});

  const router = useRouter();

  

  // Custom page change handler with animation
  const handlePageChangeWithAnimation = async (newPage: number) => {
    if (newPage === pagination.currentPage) return;

    setPageTransition(true);

    // Wait for exit animation to complete
    setTimeout(async () => {
      await handlePageChange(newPage);
      setPageTransition(false);
    }, 300);
  };

  if (isLoading) {
    return <LoadingState />;
  }

  // Generate page numbers for pagination
  const renderPaginationNumbers = () => {
    const pageNumbers = [];
    const maxDisplayedPages = 5;

    if (pagination.totalPages <= maxDisplayedPages) {
      // Show all pages if there are fewer than maxDisplayedPages
      for (let i = 1; i <= pagination.totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Calculate which pages to show
      const halfMax = Math.floor(maxDisplayedPages / 2);
      let startPage = Math.max(1, pagination.currentPage - halfMax);
      let endPage = Math.min(
        pagination.totalPages,
        startPage + maxDisplayedPages - 1
      );

      // Adjust if we're near the end
      if (endPage - startPage < maxDisplayedPages - 1) {
        startPage = Math.max(1, endPage - maxDisplayedPages + 1);
      }

      // Add first page
      if (startPage > 1) {
        pageNumbers.push(1);
        if (startPage > 2) pageNumbers.push("ellipsis");
      }

      // Add page numbers around current page
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      // Add last page
      if (endPage < pagination.totalPages) {
        if (endPage < pagination.totalPages - 1) pageNumbers.push("ellipsis");
        pageNumbers.push(pagination.totalPages);
      }
    }

    return pageNumbers;
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.4,
      },
    },
  };

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

        {events.length === 0 ? (
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
          <AnimatePresence mode="wait">
            <motion.div
              key={pagination.currentPage}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              variants={containerVariants}
              initial="hidden"
              animate={pageTransition ? "exit" : "visible"}
              exit="exit"
            >
              {events.map((event) => (
                <motion.div key={event._id} variants={itemVariants}>
                  <EventCard event={event} variant="detailed" />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {events.length > 0 && pagination.totalPages > 1 && (
          <div className="mt-8 flex flex-col items-center">
            <motion.div
              className="flex items-center space-x-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  handlePageChangeWithAnimation(
                    Math.max(1, pagination.currentPage - 1)
                  )
                }
                disabled={pagination.currentPage === 1}
                className="bg-gray-800 border-gray-700 text-white"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {renderPaginationNumbers().map((page, index) =>
                page === "ellipsis" ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-2 text-gray-400"
                  >
                    ...
                  </span>
                ) : (
                  <Button
                    key={`page-${page}`}
                    variant={
                      pagination.currentPage === page ? "default" : "outline"
                    }
                    className={`${
                      pagination.currentPage === page
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-800 border-gray-700 text-white hover:bg-gray-700 transition-colors duration-300"
                    }`}
                    onClick={() =>
                      handlePageChangeWithAnimation(page as number)
                    }
                  >
                    {page}
                  </Button>
                )
              )}

              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  handlePageChangeWithAnimation(
                    Math.min(pagination.totalPages, pagination.currentPage + 1)
                  )
                }
                disabled={pagination.currentPage === pagination.totalPages}
                className="bg-gray-800 border-gray-700 text-white"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </motion.div>

            <motion.p
              className="text-gray-400 mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Showing page {pagination.currentPage} of {pagination.totalPages}(
              {pagination.totalEvents} total events)
            </motion.p>
          </div>
        )}

        {events.length > 0 && pagination.totalPages === 1 && (
          <div className="mt-8 flex justify-center">
            <p className="text-gray-400">
              Showing {events.length} of {pagination.totalEvents} events
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllEventsPage;
