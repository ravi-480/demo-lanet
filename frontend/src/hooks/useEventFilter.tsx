import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEvents, setPage, selectPagination } from "@/store/eventSlice";
import { AppDispatch } from "@/store/store";

interface UseEventFilterProps {
  initialTab?: string;
  skipInitialFetch?: boolean;
}

export const useEventFilter = ({
  initialTab = "all",
  skipInitialFetch = false,
}: UseEventFilterProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [locationFilter, setLocationFilter] = useState<string>("");
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  const pagination = useSelector(selectPagination);
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      if (skipInitialFetch) return;
    }

    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    const timeout = setTimeout(() => {
      dispatch(setPage(1));
      dispatch(
        fetchEvents({
          page: 1,
          limit: pagination.limit,
          tab: activeTab,
          search: searchTerm,
          date: dateFilter,
          location: locationFilter,
        })
      );
    }, 500);

    setDebounceTimeout(timeout);

    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [activeTab, searchTerm, dateFilter, locationFilter, dispatch]);

  const handlePageChange = (newPage: number) => {
    dispatch(setPage(newPage));
    dispatch(
      fetchEvents({
        page: newPage,
        limit: pagination.limit,
        tab: activeTab,
        search: searchTerm,
        date: dateFilter,
        location: locationFilter,
      })
    );
  };

  const clearFilters = () => {
    setDateFilter("");
    setLocationFilter("");
    setSearchTerm("");

    dispatch(setPage(1));
    dispatch(
      fetchEvents({
        page: 1,
        limit: pagination.limit,
        tab: activeTab,
      })
    );
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
    handlePageChange,
  };
};
