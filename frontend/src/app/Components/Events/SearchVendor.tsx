"use client";

import { useState } from "react";
import { Command, CommandInput } from "@/components/ui/command";
import { Loader } from "lucide-react";
import VendorCard from "./VendorCard";
import { eventVendorMapping, getRandomPrice } from "@/StaticData/Static";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

type SearchVendorProps = {
  eventType: string;
  allowedCategories: string[];
  noOfGuest: number;
  eventId: string;
  addedBy: string;
  eventLocation: string;
};

const SearchVendor = ({
  eventType,
  allowedCategories,
  noOfGuest,
  addedBy,
  eventLocation,
  eventId,
}: SearchVendorProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortOption, setSortOption] = useState("");

  const getPricingUnitForCategory = (category: string) => {
    const mapping =
      eventVendorMapping[eventType as keyof typeof eventVendorMapping] || [];
    return (
      mapping.find(
        (item) => item.category.toLowerCase() === category.toLowerCase()
      )?.pricingUnit || "flat rate"
    );
  };

  const detectMatchedCategory = (term: string) => {
    const lowerTerm = term.toLowerCase();
    for (const category of allowedCategories) {
      if (lowerTerm.includes(category.toLowerCase())) return category;
    }
    if (
      lowerTerm.includes("photo") &&
      allowedCategories.includes("photography")
    ) {
      return "photography";
    }
    return null;
  };

  const handleSearch = async (pageNum = 1) => {
    setLoading(true);
    setPage(pageNum);

    try {
      const res = await fetch(
        `http://localhost:5000/api/vendors?query=${searchTerm}&location=${eventLocation}&page=${pageNum}`
      );
      const data = await res.json();

      const matchedCategory = detectMatchedCategory(searchTerm);
      const isCatering = matchedCategory?.toLowerCase() === "catering";

      const enriched = (data.vendors || []).map((vendor: any) => {
        const recommended = !!matchedCategory;
        const price = recommended
          ? getRandomPrice(matchedCategory!)
          : getRandomPrice("default", true);

        const pricingUnit = recommended
          ? matchedCategory === "photography"
            ? "per hour"
            : matchedCategory === "catering"
            ? "per plate"
            : getPricingUnitForCategory(matchedCategory)
          : "flat rate";

        return {
          ...vendor,
          price,
          category: recommended ? matchedCategory : "Premium Service",
          numberOfGuests: isCatering ? noOfGuest : 1,
          pricingUnit,
        };
      });

      setVendors(enriched);
      setHasMore(data.pagination?.hasMore ?? false);
    } catch (err) {
      console.error("Error fetching vendors:", err);
    } finally {
      setLoading(false);
    }
  };

  const getSortedVendors = () => {
    const sorted = [...vendors];
    if (sortOption === "lowToHigh")
      return sorted.sort((a, b) => a.price - b.price);
    if (sortOption === "highToLow")
      return sorted.sort((a, b) => b.price - a.price);
    if (sortOption === "rating")
      return sorted.sort((a, b) => b.rating - a.rating);
    return sorted;
  };

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="flex items-center gap-2">
        <Command className="flex-1 rounded-lg border shadow-md">
          <CommandInput
            placeholder={`Search vendors for ${eventType}...`}
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
        </Command>
        <Button onClick={() => handleSearch()}>Search</Button>
      </div>

      {/* Sort options */}
      {vendors.length > 0 && (
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <Select onValueChange={setSortOption} value={sortOption}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lowToHigh">Price: Low to High</SelectItem>
              <SelectItem value="highToLow">Price: High to Low</SelectItem>
              <SelectItem value="rating">Best Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Loader */}
      {loading && (
        <div className="text-gray-500 text-sm flex items-center gap-2">
          <Loader className="animate-spin" size={16} /> Loading vendors...
        </div>
      )}

      {/* No vendors found */}
      {!loading && vendors.length === 0 && searchTerm && (
        <div className="text-center py-8 text-gray-500">
          No vendors found matching "{searchTerm}"
        </div>
      )}

      {/* Vendor results */}
      {!loading && vendors.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getSortedVendors().map((vendor, idx) => (
              <VendorCard
                key={idx}
                eventId={eventId}
                vendor={vendor}
                addedBy={addedBy}
                numberOfGuests={vendor.numberOfGuests}
                category={vendor.category}
                pricingUnit={vendor.pricingUnit}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 mt-4">
            <button
              onClick={() => handleSearch(page - 1)}
              disabled={page === 1}
              className="px-3 py-1 bg-gray-800 rounded hover:bg-gray-700 disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-sm text-gray-300">Page {page}</span>
            <button
              onClick={() => handleSearch(page + 1)}
              disabled={!hasMore}
              className="px-3 py-1 bg-gray-800 rounded hover:bg-gray-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SearchVendor;
