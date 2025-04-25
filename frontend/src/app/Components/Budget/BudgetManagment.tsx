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
      dispatch(getVendorsByEvent({ eventId }));
    }
  }, [dispatch, eventId]);

  const filteredVendors = items
    .filter((item: any) => {
      const searchTerm = searchFilter.toLowerCase();
      return (
        item.title?.toLowerCase().includes(searchTerm) ||
        item.email?.toLowerCase().includes(searchTerm)
      );
    })
    .sort((a: any, b: any) => {
      return priceSortOrder === "lowToHigh"
        ? a.price - b.price
        : b.price - a.price;
    });

  const handleRemoveAllVendors = () => {
    dispatch(removeAllVendor({ id: eventId, query: "vendor" }));
  };

  const refreshData = () => {
    dispatch(getVendorsByEvent({ eventId }));
    dispatch(fetchById(eventId));
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <Wallet className="mr-2" />
          Budget Management
        </h1>
        <div className="flex gap-2">
          <Link href="vendor-cart/splitted-vendors">
            <Button className="py-5">
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

      <Card className="bg-gray-800">
        <CardHeader className="pb-3">
          <div className="flex sm:items-center sm:justify-between flex-col sm:flex-row gap-4">
            <CardTitle className="flex items-center text-gray-200 gap-3">
              <div className="text-gray-200 text-lg font-semibold">
                Expense Details
              </div>
              <span className="flex items-center gap-1">
                <RefreshCcw
                  onClick={refreshData}
                  className="inline cursor-pointer"
                  size={19}
                />
                <p>sync</p>
              </span>
              <Button
                className="bg-red-500 hover:bg-red-600"
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
            <BudgetFilters
              searchFilter={searchFilter}
              setSearchFilter={setSearchFilter}
              priceSortOrder={priceSortOrder}
              setPriceSortOrder={setPriceSortOrder}
            />
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
