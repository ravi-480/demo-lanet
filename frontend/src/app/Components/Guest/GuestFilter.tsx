"use client";

import React from "react";
import { Search, Filter } from "lucide-react";
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

interface GuestFiltersProps {
  searchFilter: string;
  setSearchFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  eventId: string;
  pendingGuests: any[];
}

const GuestFilters = ({
  searchFilter,
  setSearchFilter,
  statusFilter,
  setStatusFilter,
  pendingGuests,
}: GuestFiltersProps) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleInvite = async () => {
    try {
      if (pendingGuests.length === 0) {
        toast.info("No pending guests to invite");
        return;
      }

      await dispatch(sendInviteAll(pendingGuests));
      toast.success("Invitations sent to all pending guests");
    } catch (error) {
      toast.error("Failed to send invitations");
      console.error("Failed to send invitations:", error);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          type="search"
          placeholder="Search guests..."
          className="pl-8 h-9 md:w-64"
        />
      </div>

      <Button onClick={handleInvite}>Send Mail All</Button>

      <div className="flex gap-2">
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value)}
        >
          <SelectTrigger className="w-[130px] h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Confirmed">Confirmed</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Declined">Declined</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Filter size={15} />
        </Button>
      </div>
    </div>
  );
};

export default GuestFilters;
