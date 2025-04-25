import { useState } from "react";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

import VendorCard from "./VendorCard";
import { getRandomPrice } from "@/StaticData/Static";
import { enrichVendor } from "@/utils/vendorUtils";
import {
  SearchVendorProps,
  VendorType,
  PricingUnit,
} from "@/Interface/interface";
import { toast } from "sonner";

type SortOption = "lowToHigh" | "highToLow" | "rating" | "";

const SearchVendor = ({
  eventType,
  noOfDay,
  noOfGuest,
  addedBy,
  eventLocation,
  noOfAddedGuest,
  eventId,
}: SearchVendorProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [vendors, setVendors] = useState<VendorType[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortOption, setSortOption] = useState<SortOption>("");
  const [locationError, setLocationError] = useState(false);

  const validateLocation = (location: string) => {
    const locationRegex = /^[a-zA-Z\s,]+$/;
    return locationRegex.test(location);
  };

  const fetchVendors = async (pageNum = 1) => {
    if (!validateLocation(eventLocation)) {
      setLocationError(true);
      return;
    }

    setLocationError(false);
    setLoading(true);
    setPage(pageNum);

    try {
      const res = await fetch(
        `http://localhost:5000/api/vendors?query=${searchTerm}&location=${eventLocation}&page=${pageNum}`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (data.vendors.length === 0) {
        toast.error("No vendors found for the specified location.");
      }

      const enrichedVendors = (data.vendors || []).map((vendor: VendorType) =>
        enrichVendor(vendor, searchTerm, getRandomPrice, noOfGuest)
      );

      setVendors(enrichedVendors);
      setHasMore(data.pagination?.hasMore ?? false);
    } catch (error) {
      // Fix the error handling for toast
      toast.error(
        `Vendor fetch error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVendors();
  };

  const getSortedVendors = () => {
    return [...vendors].sort((a, b) => {
      if (sortOption === "lowToHigh") return a.price - b.price;
      if (sortOption === "highToLow") return b.price - a.price;
      if (sortOption === "rating") return b.rating - a.rating;
      return 0;
    });
  };

  const renderSearchBar = () => (
    <form
      onSubmit={handleSearchSubmit}
      className="flex flex-col sm:flex-row items-center gap-2"
    >
      <Input
        placeholder={`Search vendors for ${eventType}...`}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSearchSubmit(e);
          }
        }}
      />
      <Button type="submit" disabled={!searchTerm} className="w-full sm:w-auto">
        Search
      </Button>
    </form>
  );

  const renderSortOptions = () => (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <span className="text-sm text-muted-foreground">Sort by:</span>
      <Select
        onValueChange={(value) => setSortOption(value as SortOption)}
        value={sortOption}
      >
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
  );

  const renderPagination = () => (
    <div className="flex justify-center items-center gap-4 mt-4">
      <Button
        onClick={() => fetchVendors(page - 1)}
        disabled={page === 1}
        variant="secondary"
      >
        Prev
      </Button>
      <span className="text-sm text-gray-300">Page {page}</span>
      <Button
        onClick={() => fetchVendors(page + 1)}
        disabled={!hasMore}
        variant="secondary"
      >
        Next
      </Button>
    </div>
  );

  const renderVendorGrid = () => {
    const sortedVendors = getSortedVendors();
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedVendors.map((vendor, idx) => (
          <VendorCard
            key={idx}
            vendor={{
              ...vendor,
              pricingUnit: vendor.pricingUnit as PricingUnit,
            }}
            eventId={eventId}
            addedBy={addedBy}
            noOfAddedGuest={noOfAddedGuest}
            numberOfGuests={vendor.numberOfGuests}
            category={vendor.category}
            pricingUnit={vendor.pricingUnit as PricingUnit}
            minGuestLimit={vendor.minGuestLimit}
            noOfDay={noOfDay}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {renderSearchBar()}

      {locationError && (
        <div className="text-red-500 text-sm">
          Invalid location entered. Please enter a valid location.
        </div>
      )}

      {vendors.length > 0 && renderSortOptions()}

      {loading && (
        <div className="text-gray-500 text-sm flex items-center gap-2">
          <Loader className="animate-spin" size={16} />
          Loading vendors...
        </div>
      )}

      {!loading && vendors.length === 0 && searchTerm && (
        <div className="text-center py-8 text-gray-500">
          No vendors found matching &quot;{searchTerm}&quot; in the specified
          location.
        </div>
      )}

      {!loading && vendors.length > 0 && (
        <>
          {renderVendorGrid()}
          {renderPagination()}
        </>
      )}
    </div>
  );
};

export default SearchVendor;
