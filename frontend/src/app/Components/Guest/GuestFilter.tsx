"use client";

import React, { useState, useCallback } from "react";
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
import { sendInviteAll } from "@/store/rsvpSlice";
import { toast } from "sonner";
import ConfirmDialog from "../Shared/ConfirmDialog";
import { Guest } from "@/Interface/interface";
import { motion } from "framer-motion";

interface GuestFiltersProps {
  searchFilter: string;
  setSearchFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  eventId: string;
  onFilterChange: () => void;
  pendingGuests: Guest[];
}

const GuestFilters = ({
  searchFilter,
  setSearchFilter,
  statusFilter,
  setStatusFilter,
  onFilterChange,
  pendingGuests,
}: GuestFiltersProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(searchFilter);
  const [isInviting, setIsInviting] = useState(false);

  // Debounce function for search with proper typing
  const debounce = <T extends (...args: string[]) => void>(
    func: T,
    delay: number
  ) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  // Create debounced search handler
  const debouncedSearch = useCallback(
    (value: string) => {
      setSearchFilter(value);
      onFilterChange(); // Reset to first page when filter changes
    },
    [setSearchFilter, onFilterChange] // Include onFilterChange here
  );

  const handleDebouncedSearch = useCallback(debounce(debouncedSearch, 500), [
    debouncedSearch,
  ]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    handleDebouncedSearch(value);
  };

  // Handle status filter change
  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    onFilterChange(); // Reset to first page when filter changes
  };

  const handleInvite = async () => {
    try {
      if (pendingGuests.length === 0) {
        toast.info("No pending guests to invite");
        return;
      }

      setIsInviting(true);
      await dispatch(sendInviteAll({ pendingGuests })).unwrap();
      toast.success("Invitations sent to all pending guests");
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(
        `Failed to send invitations: ${err.message || "Unknown error"}`
      );
    } finally {
      setIsInviting(false);
    }
  };

  // Animation variants
  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
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
        <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
          <Button
            size="sm"
            onClick={() => setOpen(true)}
            disabled={pendingGuests.length === 0 || isInviting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Mail
              className={`mr-1 h-4 w-4 ${isInviting ? "animate-pulse" : ""}`}
            />
            <span className="hidden xs:inline">
              {isInviting ? "Sending..." : "Invite All"}
            </span>
            <span className="xs:hidden">Invite</span>
          </Button>
        </motion.div>

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
