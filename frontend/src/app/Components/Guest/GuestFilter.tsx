"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search, Filter, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { fetchGuests, sendInviteAll } from "@/store/rsvpSlice";
import { toast } from "sonner";
import ConfirmDialog from "../Shared/ConfirmDialog";
import { GuestStatus } from "@/Interface/interface";

interface GuestFiltersProps {
  searchFilter: string;
  setSearchFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  eventId: string;
  pendingGuests: GuestStatus[];
}

const GuestFilters = ({
  searchFilter,
  setSearchFilter,
  statusFilter,
  setStatusFilter,
  eventId,
  pendingGuests,
}: GuestFiltersProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(searchFilter);

  // Debounce function for search
  const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return function (...args: any[]) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(null, args);
      }, delay);
    };
  };

  // Create debounced search handler
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearchFilter(value);
      // Fetch guests with search param
      dispatch(
        fetchGuests({
          id: eventId,
          search: value,
          status: statusFilter !== "all" ? statusFilter : undefined,
        })
      );
    }, 500),
    [setSearchFilter, dispatch, eventId, statusFilter]
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  // Handle status filter change
  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    // Fetch guests with status filter
    dispatch(
      fetchGuests({
        id: eventId,
        search: searchTerm,
        status: value !== "all" ? value : undefined,
      })
    );
  };

  // Refetch when component mounts to ensure backend filtering
  useEffect(() => {
    dispatch(
      fetchGuests({
        id: eventId,
        search: searchTerm,
        status: statusFilter !== "all" ? statusFilter : undefined,
      })
    );
  }, [dispatch, eventId]);

  const handleInvite = async () => {
    try {
      if (pendingGuests.length === 0) {
        toast.info("No pending guests to invite");
        return;
      }

      await dispatch(sendInviteAll({ pendingGuests }));
      toast.success("Invitations sent to all pending guests");
    } catch (error) {
      toast.error("Failed to send invitations");
      console.log("Failed to send invitations:", error);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full">
      <div className="relative flex-grow max-w-full sm:max-w-xs">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          value={searchTerm}
          onChange={handleSearchChange}
          type="search"
          placeholder="Search guests..."
          className="pl-8 h-9 border-gray-400 text-gray-200 w-full"
        />
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => setOpen(true)}
          disabled={pendingGuests.length === 0}
        >
          <Mail className="mr-1 h-4 w-4" />
          <span className="hidden xs:inline">Invite All</span>
        </Button>

        <ConfirmDialog
          onOpenChange={setOpen}
          confirmText="Continue"
          cancelText="Cancel"
          onConfirm={handleInvite}
          open={open}
          confirmClassName="bg-indigo-600 hover:bg-indigo-700"
          description="Are you sure you want to send invitations to all guests? This action will send the invite to everyone listed for this event. Please confirm before proceeding."
          title="Invite All Guest"
        />

        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[115px] border-gray-500 text-gray-300 h-9">
            <Filter className="h-4 w-4 mr-1" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Confirmed">Confirmed</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Declined">Declined</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default GuestFilters;
