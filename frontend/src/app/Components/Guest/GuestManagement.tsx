"use client";

import React, { useEffect, useState } from "react";
import { Users, RefreshCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDispatch, useSelector } from "react-redux";
import { fetchGuests, removeAllGuest } from "@/store/rsvpSlice";
import { AppDispatch, RootState } from "@/store/store";
import GuestList from "./GuestList";
import GuestUpload from "./GuestUpload";
import GuestDialog from "./GuestDialog";
import GuestStats from "./GuestStatCard";
import GuestFilters from "./GuestFilter";
import { Guest } from "@/Interface/interface";
import { Button } from "@/components/ui/button";

const GuestManagement = ({ eventId }: { eventId: string }) => {
  const [isAddGuestOpen, setIsAddGuestOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchFilter, setSearchFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editGuest, setEditGuest] = useState<Guest | null>(null);
  const guestsPerPage = 10;

  const dispatch = useDispatch<AppDispatch>();
  const { rsvpData } = useSelector((state: RootState) => state.rsvp);

  useEffect(() => {
    if (eventId) {
      dispatch(fetchGuests(eventId));
    }
  }, [dispatch, eventId]);

  const refreshData = () => {
    dispatch(fetchGuests(eventId));
  };

  // Filter and paginate the guest data
  const filteredGuests = rsvpData.filter((guest) => {
    const matchesStatus =
      statusFilter === "all" || guest.status === statusFilter;
    const matchesSearch =
      (guest.name?.toLowerCase().includes(searchFilter.toLowerCase()) ??
        false) ||
      (guest.email?.toLowerCase().includes(searchFilter.toLowerCase()) ??
        false);
    return matchesStatus && matchesSearch;
  });

  const indexOfLast = currentPage * guestsPerPage;
  const indexOfFirst = indexOfLast - guestsPerPage;
  const currentGuests = filteredGuests.slice(indexOfFirst, indexOfLast);

  const RemoveAllGuest = () => {
    if (
      confirm(
        "Are you sure you want to remove ALL guests? This cannot be undone."
      )
    ) {
      dispatch(removeAllGuest({ id: eventId, query: "guest" }));
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-2 sm:p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold flex items-center">
          <Users className="mr-2" />
          Guest Management
        </h1>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <GuestUpload eventId={eventId} />
          <GuestDialog
            eventId={eventId}
            isOpen={isAddGuestOpen}
            setIsOpen={setIsAddGuestOpen}
            editGuest={editGuest}
            setEditGuest={setEditGuest}
          />
        </div>
      </div>

      <GuestStats guests={rsvpData} />

      <Card className="bg-gray-800 border-gray-400">
        <CardHeader className="pb-2 space-y-3">
          <div className="flex flex-col space-y-3 lg:space-y-0 lg:flex-row lg:justify-between lg:items-center">
            <CardTitle className="flex flex-wrap items-center text-gray-200 gap-2">
              <h3>Guest List</h3>
              <button
                onClick={refreshData}
                className="flex items-center text-sm text-gray-300 hover:text-white"
              >
                <RefreshCcw className="mr-1" size={16} />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              {rsvpData.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 ml-auto lg:ml-0"
                  onClick={RemoveAllGuest}
                >
                  <span className="hidden sm:inline">Remove All</span>
                  <span className="sm:hidden">Delete All</span>
                </Button>
              )}
            </CardTitle>

            <div className="w-full lg:w-auto">
              <GuestFilters
                searchFilter={searchFilter}
                setSearchFilter={setSearchFilter}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                eventId={eventId}
                pendingGuests={rsvpData.filter(
                  (guest) => guest.status === "Pending"
                )}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <GuestList
            guests={currentGuests}
            totalGuests={rsvpData.length}
            filteredCount={filteredGuests.length}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            guestsPerPage={guestsPerPage}
            eventId={eventId}
            onEdit={(guest) => {
              setEditGuest(guest);
              setTimeout(() => setIsAddGuestOpen(true), 0);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default GuestManagement;
