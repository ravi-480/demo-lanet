import { useState, useEffect, useRef } from "react";
import { Loader, Search } from "lucide-react";
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
import {
  getRandomPrice,
  eventVendorMapping,
  commonTerms,
} from "@/StaticData/Static";
import { enrichVendor } from "@/utils/vendorUtils";
import {
  SearchVendorProps,
  VendorType,
  PricingUnit,
} from "@/Interface/interface";
import { toast } from "sonner";
import api from "@/utils/api";

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
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [vendors, setVendors] = useState<VendorType[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortOption, setSortOption] = useState<SortOption>("");
  const [locationError, setLocationError] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Get suggested vendor categories based on event type
  useEffect(() => {
    const generateSuggestions = () => {
      if (!searchTerm.trim()) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      // Get vendor categories for this event type
      const eventCategories =
        eventVendorMapping[
          eventType?.toLowerCase() as keyof typeof eventVendorMapping
        ] || [];
      const categories = eventCategories.map((item) => item.category);

      // Filter categories that match the search term

      const matchingTerms = commonTerms.filter((term) =>
        term.toLowerCase().includes(searchTerm.toLowerCase())
      );
      // Combine and limit suggestions
      const allSuggestions = matchingTerms.slice(0, 5);
      setSuggestions(allSuggestions);
      setShowSuggestions(allSuggestions.length > 0);
    };

    generateSuggestions();
  }, [searchTerm, eventType]);

  // Handle clicks outside the suggestion box
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const validateLocation = (location: string) => {
    const locationRegex = /^[a-zA-Z\s,]+$/;
    return locationRegex.test(location);
  };

  const fetchVendors = async (pageNum = 1, term = searchTerm) => {
    if (!validateLocation(eventLocation)) {
      setLocationError(true);
      return;
    }

    setLocationError(false);
    setLoading(true);
    setPage(pageNum);

    try {
      const { data } = await api.get("/vendors", {
        params: {
          query: term,
          location: eventLocation,
          page: pageNum,
        },
      });

      if (data.vendors.length === 0) {
        toast.error("No vendors found for the specified location.");
      }

      const enrichedVendors = (data.vendors || []).map((vendor: VendorType) =>
        enrichVendor(vendor, term, getRandomPrice, noOfGuest)
      );

      setVendors(enrichedVendors);
      setHasMore(data.pagination?.hasMore ?? false);
    } catch (error) {
      console.log(error);

      toast.error(
        `Vendor fetch error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle search form submission
  const handleSearchSubmit = (
    e: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLInputElement>
  ) => {
    e.preventDefault();

    // Handle only when the search term is not empty
    if (searchTerm.trim() === "") {
      return;
    }

    // Check if it's a keyboard event and if the key is Enter
    if ("key" in e && e.key !== "Enter") {
      return; // Only proceed if the Enter key is pressed
    }

    setShowSuggestions(false);
    fetchVendors();
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    fetchVendors(1, suggestion);
    setShowSuggestions(false);
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
    <div className="relative" ref={searchRef}>
      <form
        onSubmit={handleSearchSubmit}
        className="flex flex-col sm:flex-row items-center gap-2"
      >
        <div className="relative w-full">
          <Input
            placeholder={`Search vendors for ${eventType}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setShowSuggestions(suggestions.length > 0)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter") {
                handleSearchSubmit(e);
              }
            }}
            className="pr-10 border border-gray-500"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        </div>
        <Button
          type="submit"
          disabled={!searchTerm}
          className="w-full sm:w-auto"
        >
          Search
        </Button>
      </form>

      {/* Suggestions dropdown */}
      {showSuggestions && (
        <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 rounded-md shadow-lg">
          <ul className="py-1 max-h-56 overflow-auto">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-white text-sm"
              >
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
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
