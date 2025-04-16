"use client";

import React, { useEffect, useState } from "react";
import { Users, RefreshCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDispatch, useSelector } from "react-redux";
import { fetchGuests } from "@/store/rsvpSlice";
import { AppDispatch, RootState } from "@/store/store";
import GuestList from "./GuestList";
import GuestUpload from "./GuestUpload";
import GuestDialog from "./GuestDialog";
import GuestStats from "./GuestStatCard";
import GuestFilters from "./GuestFilter";
import { Guest } from "@/Interface/interface";

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

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <Users className="mr-2" />
          Guest Management
        </h1>
        <div className="flex gap-2">
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

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <CardTitle className="flex items-center gap-3">
              <h3>Guest List</h3>
              <span>
                <RefreshCcw
                  onClick={refreshData}
                  className="inline cursor-pointer"
                  size={20}
                />{" "}
                sync
              </span>
            </CardTitle>
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
              setIsAddGuestOpen(true);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default GuestManagement;
