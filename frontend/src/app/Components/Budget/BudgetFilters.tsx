import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);
  const [localSearchValue, setLocalSearchValue] =
    useState<string>(searchFilter);

  // Debounce implementation for search input
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (localSearchValue !== searchFilter) {
        setSearchFilter(localSearchValue);
      }
    }, 400); // 400ms delay before applying search filter

    return () => clearTimeout(debounceTimeout);
  }, [localSearchValue, setSearchFilter, searchFilter]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchValue(e.target.value);
  };

  return (
    <motion.div
      className="flex flex-col sm:flex-row items-center w-full sm:w-auto gap-3"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <motion.div
        className="relative w-full sm:w-auto"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <motion.div whileTap={{ scale: 0.98 }}>
          <Input
            value={localSearchValue}
            onChange={handleInputChange}
            placeholder="Search Vendors..."
            type="search"
            className="pl-8 h-9 w-full sm:w-64 text-gray-100 transition-all duration-300 ease-in-out"
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            style={{
              boxShadow: isInputFocused
                ? "0 0 0 2px rgba(255, 255, 255, 0.2)"
                : "none",
            }}
          />
        </motion.div>
      </motion.div>

      <motion.div
        className="flex gap-2 w-full sm:w-auto justify-center sm:justify-start"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <Select
          value={priceSortOrder}
          onValueChange={(value: "lowToHigh" | "highToLow") => {
            setPriceSortOrder(value);
          }}
        >
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <SelectTrigger className="w-[130px] h-9 text-white transition-all duration-200">
              <SelectValue placeholder="Sort by Price" />
            </SelectTrigger>
          </motion.div>

          <SelectContent className="bg-white mt-2 w-[130px] p-4 rounded-lg">
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.2 }}
              >
                <SelectItem
                  className="hover:bg-gray-200 transition-colors duration-150"
                  value="lowToHigh"
                >
                  Low to High
                </SelectItem>
              </motion.div>
            </AnimatePresence>

            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.2, delay: 0.05 }}
              >
                <SelectItem
                  className="hover:bg-gray-200 transition-colors duration-150"
                  value="highToLow"
                >
                  High to Low
                </SelectItem>
              </motion.div>
            </AnimatePresence>
          </SelectContent>
        </Select>

        <motion.div
          whileHover={{
            rotate: [0, -10, 10, -5, 5, 0],
            transition: { duration: 0.5 },
          }}
          whileTap={{ scale: 0.9 }}
        >
          <Button
            size="icon"
            className="h-9 hover:bg-transparent text-white bg-transparent  w-9 transition-all duration-200"
          >
            <Filter className="text-white" size={15} />
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default BudgetFilters;
