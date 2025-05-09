"use client";

import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import {
  ArrowRight,
  RefreshCcw,
  Wallet,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import BudgetFilters from "./BudgetFilters";
import BudgetList from "./BudgetList";
import BudgetDialog from "./BudgetDialog";

import { AppDispatch, RootState } from "@/store/store";
import { fetchById, singleEvent } from "@/store/eventSlice";
import { getVendorsByEvent, removeAllVendor } from "@/store/vendorSlice";
import BudgetStats from "./BudgetStatCard";
import ConfirmDialog from "../Shared/ConfirmDialog";

const BudgetManagement = ({ eventId }: { eventId: string }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isAddBudgetOpen, setIsAddBudgetOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [priceSortOrder, setPriceSortOrder] = useState<
    "lowToHigh" | "highToLow"
  >("highToLow");
  const [page, setPage] = useState(1);
  const limit = 8;
  const event = useSelector(singleEvent);
  const { items, pagination, status } = useSelector(
    (state: RootState) => state.vendors
  );

  // Function to load vendors with current filters
  const loadVendors = useCallback(() => {
    dispatch(
      getVendorsByEvent({
        eventId,
        searchFilter: searchFilter || undefined,
        sortOrder: priceSortOrder,
        page,
        limit,
      })
    );
  }, [dispatch, eventId, searchFilter, priceSortOrder, page, limit]);

  // Load vendors with filters when component mounts or filters change
  useEffect(() => {
    if (eventId) {
      dispatch(fetchById(eventId));
      loadVendors();
    }
  }, [dispatch, eventId, limit, loadVendors]);

  // Handle search filter change with debounce (handled in BudgetFilters component)
  const handleSearchChange = (value: string) => {
    setSearchFilter(value);
    // Reset to first page when filtering
    setPage(1);
  };

  // Handle sort order change
  const handleSortChange = (value: "lowToHigh" | "highToLow") => {
    setPriceSortOrder(value);
    // Reset to first page when sorting
    setPage(1);
  };

  const handleRemoveAllVendors = async () => {
    await dispatch(removeAllVendor({ id: eventId, query: "vendor" }));
    dispatch(fetchById(eventId));
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    await dispatch(fetchById(eventId));
    await loadVendors();
    setIsRefreshing(false);
  };

  // Handle pagination
  const handleNextPage = () => {
    if (pagination && pagination.hasNextPage) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (pagination && pagination.hasPrevPage) {
      setPage(page - 1);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold flex items-center">
          <Wallet className="mr-2" />
          Budget Management
        </h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <Link
            href="vendor-cart/splitted-vendors"
            className="w-full sm:w-auto"
          >
            <Button className="py-2 sm:py-5 w-full sm:w-auto">
              Go to split <ArrowRight className="ml-1" />
            </Button>
          </Link>
          <BudgetDialog
            eventId={eventId}
            isOpen={isAddBudgetOpen}
            setIsOpen={setIsAddBudgetOpen}
          />
        </div>
      </div>

      <BudgetStats eventBudget={event} />

      <Card className="bg-gray-800 mt-4">
        <CardHeader className="pb-2 sm:pb-3">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
              <CardTitle className="text-gray-200">
                <div className="flex flex-wrap items-center justify-between w-full gap-2 sm:gap-4">
                  <div className="flex items-center space-x-2 flex-wrap">
                    <span className="text-gray-200 text-base sm:text-lg font-semibold">
                      Expense Details
                    </span>
                    <div
                      className="flex items-center gap-1 cursor-pointer"
                      onClick={refreshData}
                    >
                      <RefreshCcw
                        size={19}
                        className={isRefreshing ? "animate-spin" : ""}
                      />
                      <span className="text-sm sm:text-base">sync</span>
                    </div>
                    <Button
                      className="bg-red-500 hover:bg-red-600 text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-3 h-auto ml-2"
                      onClick={() => setOpen(true)}
                      disabled={items.length === 0}
                    >
                      Remove vendors
                    </Button>
                  </div>
                </div>
              </CardTitle>
              <ConfirmDialog
                onOpenChange={setOpen}
                confirmText="Continue"
                cancelText="Cancel"
                onConfirm={handleRemoveAllVendors}
                open={open}
                description="Are you sure want to remove all vendors"
                title="Remove all vendors"
              />
              <BudgetFilters
                searchFilter={searchFilter}
                setSearchFilter={handleSearchChange}
                priceSortOrder={priceSortOrder}
                setPriceSortOrder={handleSortChange}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <BudgetList items={items} eventId={eventId} refresh={loadVendors} />
        </CardContent>

        {/* Pagination controls */}
        {pagination && (
          <CardFooter className="flex justify-between items-center py-3 text-gray-200">
            <div className="text-sm">
              Page {pagination.currentPage} of {pagination.totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handlePrevPage}
                disabled={!pagination.hasPrevPage || status === "loading"}
                className="border-gray-600 text-gray-200 hover:bg-gray-700"
              >
                <ChevronLeft size={16} />
                Previous
              </Button>
              <Button
                size="sm"
                onClick={handleNextPage}
                disabled={!pagination.hasNextPage || status === "loading"}
                className="border-gray-600 text-gray-200 hover:bg-gray-700"
              >
                Next
                <ChevronRight size={16} />
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default BudgetManagement;
