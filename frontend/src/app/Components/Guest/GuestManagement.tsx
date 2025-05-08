"use client";

import React, { lazy, Suspense, useEffect, useState } from "react";
import { Users, RefreshCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDispatch, useSelector } from "react-redux";
import { fetchGuests, removeAllGuest } from "@/store/rsvpSlice";
import { AppDispatch, RootState } from "@/store/store";
import GuestList from "./GuestList";
import GuestStats from "./GuestStatCard";
import GuestFilters from "./GuestFilter";
import { Guest } from "@/Interface/interface";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ConfirmDialog from "../Shared/ConfirmDialog";
import { motion, AnimatePresence } from "framer-motion";

const GuestDialog = lazy(() => import("./GuestDialog"));
const GuestUpload = lazy(() => import("./GuestUpload"));
const VendorAlertDialog = lazy(() =>
  import("./AlertCard").then((module) => ({
    default: module.VendorAlertDialog,
  }))
);

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      when: "beforeChildren",
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const GuestManagement = ({ eventId }: { eventId: string }) => {
  const [isAddGuestOpen, setIsAddGuestOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchFilter, setSearchFilter] = useState("");
  const [open, setOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editGuest, setEditGuest] = useState<Guest | null>(null);
  const [showMinGuestAlert, setShowMinGuestAlert] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [preservedVendors, setPreservedVendors] = useState<
    { id: string; title: string; minGuestLimit: number }[]
  >([]);
  const guestsPerPage = 10;

  const dispatch = useDispatch<AppDispatch>();
  const { rsvpData, loading } = useSelector((state: RootState) => state.rsvp);

  // Initial fetch of guest data
  useEffect(() => {
    if (eventId) {
      dispatch(fetchGuests({ id: eventId })).then(() => {
        setTimeout(() => setIsLoaded(true), 100);
      });
    }
  }, [dispatch, eventId]);

  const refreshData = async () => {
    setIsRefreshing(true);
    // Refresh with current filters
    await dispatch(fetchGuests({
      id: eventId,
      search: searchFilter,
      status: statusFilter !== "all" ? statusFilter : undefined
    }));
    setIsRefreshing(false);
  };

  const pendingGuests = React.useMemo(() => {
    return rsvpData.filter((guest) => guest.status === "Pending");
  }, [rsvpData]);

  // No need to filter guests manually as it's done on the backend
  const currentGuests = React.useMemo(() => {
    const indexOfLast = currentPage * guestsPerPage;
    const indexOfFirst = indexOfLast - guestsPerPage;
    return rsvpData.slice(indexOfFirst, indexOfLast);
  }, [rsvpData, currentPage, guestsPerPage]);

  const RemoveAllGuest = React.useCallback(async () => {
    try {
      const result = await dispatch(
        removeAllGuest({ id: eventId, query: "guest" })
      ).unwrap();

      if (result.preservedVendors && result.preservedVendors.length > 0) {
        setPreservedVendors(result.preservedVendors);
        setShowMinGuestAlert(true);
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Failed to remove all guests");
    }
  }, [dispatch, eventId]);

  return (
    <motion.div
      className="w-full max-w-6xl mx-auto p-2 md:p-6"
      initial="hidden"
      animate={isLoaded ? "visible" : "hidden"}
      variants={containerVariants}
    >
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6"
      >
        <h1 className="text-xl sm:text-2xl font-bold flex items-center">
          <Users className="mr-2" />
          Guest Management
        </h1>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Suspense
            fallback={
              <div className="h-9 w-28 bg-gray-700 animate-pulse rounded"></div>
            }
          >
            <GuestUpload eventId={eventId} />
          </Suspense>
          <Suspense
            fallback={
              <div className="h-9 w-28 bg-gray-700 animate-pulse rounded"></div>
            }
          >
            <GuestDialog
              eventId={eventId}
              isOpen={isAddGuestOpen}
              setIsOpen={setIsAddGuestOpen}
              editGuest={editGuest}
              setEditGuest={setEditGuest}
            />
          </Suspense>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <GuestStats guests={rsvpData} />
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="bg-gray-800 border-gray-400">
          <CardHeader className="pb-2 space-y-3">
            <div className="flex flex-col space-y-3 lg:space-y-0 lg:flex-row lg:justify-between lg:items-center">
              <CardTitle className="flex flex-wrap items-center text-gray-200 gap-2">
                <h3>Guest List</h3>
                <motion.button
                  onClick={refreshData}
                  className="flex items-center text-sm text-gray-300 hover:text-white"
                  whileTap={{ scale: 0.95 }}
                >
                  <RefreshCcw
                    className={`mr-1 ${isRefreshing ? "animate-spin" : ""}`}
                    size={16}
                  />
                  <span className="hidden sm:inline">Refresh</span>
                </motion.button>

                <motion.div
                  whileTap={{ scale: 0.95 }}
                  className="ml-auto lg:ml-0"
                >
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={rsvpData.length === 0}
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => setOpen(true)}
                  >
                    <span className="hidden sm:inline">Remove All</span>
                    <span className="sm:hidden">Delete All</span>
                  </Button>
                </motion.div>
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
                  pendingGuests={pendingGuests}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            ) : (
              <GuestList
                guests={currentGuests}
                totalGuests={rsvpData.length}
                filteredCount={rsvpData.length}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                guestsPerPage={guestsPerPage}
                eventId={eventId}
                onEdit={(guest) => {
                  setEditGuest(guest);
                  setTimeout(() => setIsAddGuestOpen(true), 0);
                }}
              />
            )}
          </CardContent>
        </Card>
      </motion.div>

      <AnimatePresence>
        {showMinGuestAlert && (
          <Suspense fallback={<div>Loading...</div>}>
            <VendorAlertDialog
              open={showMinGuestAlert}
              setOpen={setShowMinGuestAlert}
              vendors={preservedVendors}
            />
          </Suspense>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default GuestManagement;