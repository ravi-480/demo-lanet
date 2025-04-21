"use client";

import React from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CardFooter } from "@/components/ui/card";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import {
  fetchGuests,
  removeSingleGuest,
  sendReminder,
} from "@/store/rsvpSlice";
import { toast } from "sonner";
import { Guest } from "@/Interface/interface";

interface GuestListProps {
  guests: Guest[];
  totalGuests: number;
  filteredCount: number;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  guestsPerPage: number;
  eventId: string;
  onEdit: (guest: Guest) => void;
}

const GuestList = ({
  guests,
  totalGuests,
  filteredCount,
  currentPage,
  setCurrentPage,
  guestsPerPage,
  eventId,
  onEdit,
}: GuestListProps) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleRemoveGuest = async (guestId: string) => {
    if (confirm("Are you sure you want to remove this guest?")) {
      try {
        await dispatch(removeSingleGuest(guestId));
        toast.success("Guest removed successfully");
        dispatch(fetchGuests(eventId));
      } catch (error) {
        toast.error("Failed to remove guest");
        console.error(error);
      }
    }
  };

  const handleSendReminder = (guest: Guest) => {
    try {
      dispatch(
        sendReminder({
          ...guest,
          eventId,
          guestId: "",
        })
      );
      toast.success(`Reminder sent to ${guest.name}`);
    } catch (error) {
      toast.error("Failed to send reminder");
      console.error(error);
    }
  };

  return (
    <>
      <div className="rounded-md border-gray-500 border">
        <Table >
          <TableHeader>
            <TableRow className="hover:bg-transparent text-gray-200">
              <TableHead className="w-[250px]">Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {guests.length > 0 ? (
              guests.map((guest) => (
                <TableRow key={guest._id} className="hover:bg-gray-900/40">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="font-medium">{guest.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm">{guest.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={guest.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <GuestActions
                      guest={guest}
                      onEdit={onEdit}
                      onRemove={handleRemoveGuest}
                      onSendReminder={handleSendReminder}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6">
                  No guests found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <CardFooter className="flex justify-between mt-4">
        <div className="text-sm text-gray-300">
          Showing {guests.length} of {totalGuests} guests
        </div>
        <div className="flex gap-1">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            size="sm"
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            onClick={() =>
              setCurrentPage((p) =>
                p < Math.ceil(filteredCount / guestsPerPage) ? p + 1 : p
              )
            }
            variant="default"
            size="sm"
            disabled={currentPage >= Math.ceil(filteredCount / guestsPerPage)}
          >
            Next
          </Button>
        </div>
      </CardFooter>
    </>
  );
};

interface StatusBadgeProps {
  status: "Confirmed" | "Pending" | "Declined";
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const statusColors = {
    Confirmed: "bg-green-100 text-green-800",
    Pending: "bg-amber-100 text-amber-800",
    Declined: "bg-red-100 text-red-800",
  };

  const colorClass = statusColors[status] || "";

  return (
    <span className={`px-2 py-1 rounded-full text-xs ${colorClass}`}>
      {status}
    </span>
  );
};

interface GuestActionsProps {
  guest: Guest;
  onEdit: (guest: Guest) => void;
  onRemove: (guestId: string) => void;
  onSendReminder: (guest: Guest) => void;
}

const GuestActions = ({
  guest,
  onEdit,
  onRemove,
  onSendReminder,
}: GuestActionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal size={15} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onEdit(guest)}>
          Edit Details
        </DropdownMenuItem>

        {guest.status === "Pending" && (
          <DropdownMenuItem onClick={() => onSendReminder(guest)}>
            Send Reminder
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onRemove(guest._id)}
          className="text-red-600"
        >
          Remove Guest
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default GuestList;
