import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BudgetFiltersProps {
  searchFilter: string;
  setSearchFilter: (value: string) => void;
  priceSortOrder: "lowToHigh" | "highToLow";
  setPriceSortOrder: (value: "lowToHigh" | "highToLow") => void;
}

const BudgetFilters = ({
  searchFilter,
  setSearchFilter,
  priceSortOrder,
  setPriceSortOrder,
}: BudgetFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row items-center w-full sm:w-auto gap-3">
      <div className="relative w-full sm:w-auto">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          placeholder="Search Vendors..."
          type="search"
          className="pl-8 h-9 w-full sm:w-64 text-gray-100"
        />
      </div>

      <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-start">
        <Select
          value={priceSortOrder}
          onValueChange={(value: "lowToHigh" | "highToLow") =>
            setPriceSortOrder(value)
          }
        >
          <SelectTrigger className="w-[130px] h-9 text-white">
            <SelectValue placeholder="Sort by Price" />
          </SelectTrigger>
          <SelectContent className="bg-white mt-2 w-[130px] p-4 rounded-lg">
            <SelectItem className="hover:bg-gray-200" value="lowToHigh">
              Low to High
            </SelectItem>
            <SelectItem className="hover:bg-gray-200" value="highToLow">
              High to Low
            </SelectItem>
          </SelectContent>
        </Select>

        <Button size="icon" className="h-9 hover:bg-transparent text-white bg-transparent cursor-none w-9">
          <Filter className="text-white " size={15} />
        </Button>
      </div>
    </div>
  );
};

export default BudgetFilters;
