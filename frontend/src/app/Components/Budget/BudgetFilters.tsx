import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, Search } from "lucide-react";
import React, { useState } from "react";

const BudgetFilters = ({
  searchFilter,
  setSearchFilter,
  priceSortOrder,
  setPriceSortOrder,
}: any) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2 ">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500  " />
        <Input
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          placeholder="Search Vendors..."
          type="search"
          className="pl-8 h-9 md:w-64 text-gray-100"
        />
      </div>

      <div className="flex gap-2">
        <Select
        defaultValue="status"
          value={priceSortOrder}
          onValueChange={(value) => setPriceSortOrder(value)}
        >
          <SelectTrigger className="w-[130px] h-9 text-white">
            <SelectValue   placeholder="Sort by Price" />
          </SelectTrigger>
          <SelectContent className="bg-white mt-9  w-25 p-4 rounded-lg gap-4">
            <SelectItem className="hover:bg-gray-200" value="lowToHigh">
              lowToHigh
            </SelectItem>
            <SelectItem className="hover:bg-gray-200" value="highToLow">
              highToLow
            </SelectItem>
          </SelectContent>
        </Select>

        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Filter size={15} />
        </Button>
      </div>
    </div>
  );
};

export default BudgetFilters;
