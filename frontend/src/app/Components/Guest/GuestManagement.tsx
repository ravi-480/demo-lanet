"use client";

import React, { lazy, Suspense, useEffect, useState } from "react";
import { Users, RefreshCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDispatch, useSelector } from "react-redux";
import { fetchGuests, removeAllGuest } from "@/store/rsvpSlice";
import { AppDispatch, RootState } from "@/store/store";
import GuestList from "./GuestList";
const GuestDialog = lazy(() => import("./GuestDialog"));
const GuestUpload = lazy(() => import("./GuestUpload"));
import GuestStats from "./GuestStatCard";
import GuestFilters from "./GuestFilter";
import { Guest } from "@/Interface/interface";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ConfirmDialog from "../Shared/ConfirmDialog";
const VendorAlertDialog = lazy(() =>
  import("./AlertCard").then((module) => ({
    default: module.VendorAlertDialog,
  }))
);

const GuestManagement = ({ eventId }: { eventId: string }) => {
  const [isAddGuestOpen, setIsAddGuestOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchFilter, setSearchFilter] = useState("");
  const [open, setOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [editGuest, setEditGuest] = useState<Guest | null>(null);
  const [showMinGuestAlert, setShowMinGuestAlert] = useState(false);
  const [preservedVendors, setPreservedVendors] = useState<
    { id: string; title: string; minGuestLimit: number }[]
  >([]);
  const guestsPerPage = 10;

  const dispatch = useDispatch<AppDispatch>();
  const { rsvpData } = useSelector(
    (state: RootState) => state.rsvp,
    (prev, next) => prev.rsvpData === next.rsvpData
  );

  useEffect(() => {
    if (eventId) {
      dispatch(fetchGuests(eventId));
    }
  }, [dispatch, eventId]);

  const refreshData = () => {
    dispatch(fetchGuests(eventId));
  };

  // Filter and paginate the guest data
  const filteredGuests = React.useMemo(() => {
    return rsvpData.filter((guest) => {
      const matchesStatus =
        statusFilter === "all" || guest.status === statusFilter;
      const matchesSearch =
        (guest.name?.toLowerCase().includes(searchFilter.toLowerCase()) ??
          false) ||
        (guest.email?.toLowerCase().includes(searchFilter.toLowerCase()) ??
          false);
      return matchesStatus && matchesSearch;
    });
  }, [rsvpData, statusFilter, searchFilter]);

  const indexOfLast = currentPage * guestsPerPage;
  const indexOfFirst = indexOfLast - guestsPerPage;
  const currentGuests = React.useMemo(() => {
    return filteredGuests.slice(indexOfFirst, indexOfLast);
  }, [filteredGuests, indexOfFirst, indexOfLast]);

  const RemoveAllGuest = React.useCallback(async () => {
    try {
      const result = await dispatch(
        removeAllGuest({ id: eventId, query: "guest" })
      ).unwrap();

      if (result.preservedVendors && result.preservedVendors.length > 0) {
        setPreservedVendors(result.preservedVendors);
        setShowMinGuestAlert(true);
        toast.info(
          "All guests removed. Some vendor budgets were preserved due to minimum guest requirements."
        );
      } else {
        toast.success("All guests removed successfully");
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Failed to remove all guests");
    }
  }, [dispatch, eventId]);
  return (
    <div className="w-full max-w-6xl mx-auto p-2 sm:p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold flex items-center">
          <Users className="mr-2" />
          Guest Management
        </h1>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <GuestUpload eventId={eventId} />
          <Suspense fallback={<div>Loading...</div>}>
            <GuestDialog
              eventId={eventId}
              isOpen={isAddGuestOpen}
              setIsOpen={setIsAddGuestOpen}
              editGuest={editGuest}
              setEditGuest={setEditGuest}
            />
          </Suspense>
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

              <Button
                variant="destructive"
                size="sm"
                disabled={rsvpData.length === 0}
                className="bg-red-600 hover:bg-red-700 ml-auto lg:ml-0"
                onClick={() => setOpen(true)}
              >
                <span className="hidden sm:inline">Remove All</span>
                <span className="sm:hidden">Delete All</span>
              </Button>
            </CardTitle>
            <ConfirmDialog
              onOpenChange={setOpen}
              confirmText="Continue"
              cancelText="Cancel"
              onConfirm={RemoveAllGuest}
              open={open}
              description="Are you sure want to remove all Guest"
              title="Remove all Guest"
            />

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

      <Suspense fallback={<div>Loading...</div>}>
        {showMinGuestAlert && (
          <VendorAlertDialog
            open={showMinGuestAlert}
            setOpen={setShowMinGuestAlert}
            vendors={preservedVendors}
          />
        )}
      </Suspense>
    </div>
  );
};

export default GuestManagement;
