"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { ArrowRight, RefreshCcw, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BudgetFilters from "./BudgetFilters";
import BudgetList from "./BudgetList";
import BudgetDialog from "./BudgetDialog";

import { AppDispatch, RootState } from "@/store/store";
import { fetchById, singleEvent } from "@/store/eventSlice";
import { getVendorsByEvent, removeAllVendor } from "@/store/vendorSlice";
import BudgetStats from "./BudgetStatCard";
import ConfirmDialog from "../Shared/ConfirmDialog";
import { VendorType } from "@/Interface/interface";

const BudgetManagement = ({ eventId }: { eventId: string }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isAddBudgetOpen, setIsAddBudgetOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [priceSortOrder, setPriceSortOrder] = useState<
    "lowToHigh" | "highToLow"
  >("highToLow");

  const event = useSelector(singleEvent);
  const { items } = useSelector((state: RootState) => state.vendors);

  useEffect(() => {
    if (eventId) {
      dispatch(fetchById(eventId));
      dispatch(getVendorsByEvent({ eventId, includeSplit: false }));
    }
  }, [dispatch, eventId]);

  const filteredVendors = items
    .filter((item: VendorType) => {
      const searchTerm = searchFilter.toLowerCase();
      return (
        item.title?.toLowerCase().includes(searchTerm) ||
        item.email?.toLowerCase().includes(searchTerm)
      );
    })
    .sort((a: VendorType, b: VendorType) => {
      return priceSortOrder === "lowToHigh"
        ? a.price - b.price
        : b.price - a.price;
    });

  const handleRemoveAllVendors = () => {
    dispatch(removeAllVendor({ id: eventId, query: "vendor" }));
  };

  const refreshData = () => {
    dispatch(getVendorsByEvent({ eventId, includeSplit: false }));
    dispatch(fetchById(eventId));
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold flex items-center">
          <Wallet className="mr-2" />
          Budget Management
        </h1>
        <div className="flex  px-2 gap-2 w-full sm:w-auto">
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
              <CardTitle className="flex flex-wrap items-center text-gray-200 gap-2 sm:gap-3">
                <div className="text-gray-200 text-base sm:text-lg font-semibold">
                  Expense Details
                </div>
                <span className="flex items-center gap-1">
                  <RefreshCcw
                    onClick={refreshData}
                    className="inline cursor-pointer"
                    size={19}
                  />
                  <p className="text-sm sm:text-base">sync</p>
                </span>
                <Button
                  className="bg-red-500 hover:bg-red-600 text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-3 h-auto"
                  onClick={() => setOpen(true)}
                  disabled={items.length === 0}
                >
                  Remove all vendors
                </Button>
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
            </div>
            <div className="w-full">
              <BudgetFilters
                searchFilter={searchFilter}
                setSearchFilter={setSearchFilter}
                priceSortOrder={priceSortOrder}
                setPriceSortOrder={setPriceSortOrder}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <BudgetList items={filteredVendors} />
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetManagement;
