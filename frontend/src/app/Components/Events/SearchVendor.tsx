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
import { SearchVendorProps } from "@/Interface/interface";
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
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortOption, setSortOption] = useState<SortOption>("");

  // Fetch vendors based on search term
  const fetchVendors = async (pageNum = 1) => {
    setLoading(true);
    setPage(pageNum);

    try {
      const res = await fetch(
        `http://localhost:5000/api/vendors?query=${searchTerm}&location=${eventLocation}&page=${pageNum}`,
        { credentials: "include" }
      );
      const data = await res.json();

      const enrichedVendors = (data.vendors || []).map((vendor: any) =>
        enrichVendor(vendor, searchTerm, getRandomPrice, noOfGuest, eventType)
      );

      setVendors(enrichedVendors);
      setHasMore(data.pagination?.hasMore ?? false);
    } catch (err: any) {
      toast.error("Vendor fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle search on submit (Enter press)
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVendors(); // Trigger search on submit
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
    <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
      <Input
        placeholder={`Search vendors for ${eventType}...`}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSearchSubmit(e); // Trigger search on Enter
          }
        }}
      />
      <Button type="submit" disabled={!searchTerm}>
        Search
      </Button>
    </form>
  );

  const renderSortOptions = () => (
    <div className="flex items-center gap-4">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedVendors.map((vendor, idx) => (
          <VendorCard
            key={idx}
            vendor={vendor}
            eventId={eventId}
            addedBy={addedBy}
            noOfAddedGuest={noOfAddedGuest}
            numberOfGuests={vendor.numberOfGuests}
            category={vendor.category}
            pricingUnit={vendor.pricingUnit}
            minGuestLimit={vendor.minGuestLimit}
            noOfDay={noOfDay}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Search input */}
      {renderSearchBar()}

      {/* Sort dropdown */}
      {vendors.length > 0 && renderSortOptions()}

      {/* Loader */}
      {loading && (
        <div className="text-gray-500 text-sm flex items-center gap-2">
          <Loader className="animate-spin" size={16} />
          Loading vendors...
        </div>
      )}

      {/* No vendors
      {!loading && vendors.length === 0 && searchTerm && (
        <div className="text-center py-8 text-gray-500">
          No vendors found matching "{searchTerm}"
        </div>
      )} */}

      {/* Vendors grid */}
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
