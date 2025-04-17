"use client";
import { ArrowRight, RefreshCcw, Users, Wallet } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchById } from "@/store/eventSlice";
import { singleEvent } from "../../../store/eventSlice";
import BudgetStats from "./BudgetStatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BudgetFilters from "./BudgetFilters";
import BudgetList from "./BudgetList";
import { getVendorsByEvent } from "@/store/vendorSlice";
import Link from "next/link";
import BudgetDialog from "./BudgetDialog";

const BudgetManagment = ({ eventId }: { eventId: string }) => {
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    if (eventId) {
      dispatch(fetchById(eventId));
    }
  }, [dispatch, eventId]);

  const event = useSelector(singleEvent);

  useEffect(() => {
    if (eventId) {
      dispatch(getVendorsByEvent(eventId));
    }
  }, [dispatch, eventId]);

  const { items, error } = useSelector((state: RootState) => state.vendors);
  const [isAddBudgetOpen, setIsAddBudgetOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [priceSortOrder, setPriceSortOrder] = useState<
    "lowToHigh" | "highToLow"
  >("highToLow");
  const filteredVendor = items
    .filter((item: any) => {
      const titleMatch =
        item.title?.toLowerCase().includes(searchFilter.toLowerCase()) ?? false;
      const emailMatch =
        item.email?.toLowerCase().includes(searchFilter.toLowerCase()) ?? false;
      return titleMatch || emailMatch;
    })
    .sort((a: any, b: any) => {
      if (priceSortOrder === "lowToHigh") {
        return a.price - b.price;
      } else if (priceSortOrder === "highToLow") {
        return b.price - a.price;
      }
      return 0; // no sorting
    });

  const refreshData = () => {
    dispatch(getVendorsByEvent(eventId));
    dispatch(fetchById(eventId));
  };

  return (
    <div className="max-w-6xl mx-auto p-6  ">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <Wallet className="mr-2" />
          Budget Management
        </h1>
        <div className="flex gap-2">
          <Link href="vendor-cart/splitted-vendors">
            <Button className="bg-cyan-400 hover:bg-cyan-500 cursor-pointer">
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
          <div className="flex sm:items-center sm:justify-between flex-col sm:flex-row gap-4 ">
            <CardTitle className="flex items-center text-gray-200 gap-3 ">
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
            </CardTitle>
            <BudgetFilters
              items={items}
              searchFilter={searchFilter}
              setSearchFilter={setSearchFilter}
              priceSortOrder={priceSortOrder}
              setPriceSortOrder={setPriceSortOrder}
            />
          </div>
        </CardHeader>
        <CardContent>
          <BudgetList items={filteredVendor} />
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetManagment;
