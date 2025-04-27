"use client";

import React, { useState } from "react";
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
  pendingGuests,
}: GuestFiltersProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const [open, setOpen] = useState(false);
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
      console.error("Failed to send invitations:", error);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full">
      <div className="relative flex-grow max-w-full sm:max-w-xs">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          type="search"
          placeholder="Search guests..."
          className="pl-8 h-9 border-gray-400 text-gray-200 w-full"
        />
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          className="bg-cyan-600 hover:bg-cyan-700 text-white"
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
          confirmClassName="bg-cyan-500 hover:bg-cyan-600"
          description="Are you sure you want to send invitations to all guests? This action will send the invite to everyone listed for this event. Please confirm before proceeding."
          title="Invite All Guest"
        />

        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value)}
        >
          <SelectTrigger className="w-[115px] border-gray-500 text-gray-300 h-9">
            <Filter className="h-4 w-4 mr-1" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
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
