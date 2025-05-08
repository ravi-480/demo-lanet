import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEvents, setPage, selectPagination } from "@/store/eventSlice";
import { AppDispatch } from "@/store/store";

interface UseEventFilterProps {
  initialTab?: string;
}

export const useEventFilter = ({
  initialTab = "all",
}: UseEventFilterProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [locationFilter, setLocationFilter] = useState<string>("");
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const pagination = useSelector(selectPagination);

  // Effects to handle filtering
  useEffect(() => {
    // Clear any existing debounce timeout
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    // Set a new timeout to debounce the filter changes
    const timeout = setTimeout(() => {
      // Reset to page 1 when filters change
      dispatch(setPage(1));
      
      dispatch(fetchEvents({
        page: 1,
        limit: pagination.limit,
        tab: activeTab,
        search: searchTerm,
        date: dateFilter,
        location: locationFilter
      }));
    }, 500); // 500ms debounce delay

    setDebounceTimeout(timeout);

    // Clean up on unmount
    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [activeTab, searchTerm, dateFilter, locationFilter, dispatch]);

  // Effect for page changes
  const handlePageChange = (newPage: number) => {
    dispatch(setPage(newPage));
    
    dispatch(fetchEvents({
      page: newPage,
      limit: pagination.limit,
      tab: activeTab,
      search: searchTerm,
      date: dateFilter,
      location: locationFilter
    }));
  };

  const clearFilters = () => {
    setDateFilter("");
    setLocationFilter("");
    setSearchTerm("");
    
    // Reset to page 1 when filters are cleared
    dispatch(setPage(1));
    
    dispatch(fetchEvents({
      page: 1,
      limit: pagination.limit,
      tab: activeTab
    }));
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
    clearFilters,
    pagination,
    handlePageChange
  };
};