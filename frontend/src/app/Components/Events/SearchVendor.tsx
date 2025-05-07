"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, Search, SearchIcon, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import VendorCard from "./VendorCard";
import { getRandomPrice, commonTerms } from "@/StaticData/Static";
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
  const searchRef = useRef<HTMLDivElement>(null);

  // Get suggested vendor categories based on event type
  useEffect(() => {
    const generateSuggestions = () => {
      if (!searchTerm.trim()) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

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

  const fetchVendors = async (pageNum = 1, term = searchTerm) => {
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
            className="pr-10 border border-gray-600 bg-gray-800/60 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 shadow-inner text-gray-100 placeholder:text-gray-400"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        </div>
        <Button
          type="submit"
          disabled={!searchTerm}
          className="w-full sm:w-auto  text-white transition-all duration-200"
        >
          Search
        </Button>
      </form>

      {/* Suggestions dropdown */}
      {showSuggestions && (
        <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 rounded-md shadow-lg shadow-black/25 divide-y divide-gray-700">
          <ul className="py-1 max-h-56 overflow-auto">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-4 py-2 hover:bg-gray-700/70 cursor-pointer text-white text-sm transition-colors duration-150 ease-in-out"
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
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-800/40 p-3 rounded-lg border border-gray-700/50 mb-4">
      <div className="flex items-center gap-2">
        <SlidersHorizontal size={18} className="text-cyan-400" />
        <span className="text-sm text-gray-300">Filter Options:</span>
      </div>
      <Select
        onValueChange={(value) => setSortOption(value as SortOption)}
        value={sortOption}
      >
        <SelectTrigger className="w-[180px] bg-gray-800 border-gray-600 focus:ring-cyan-500 focus:border-cyan-500 text-gray-200">
          <SelectValue placeholder="Sort results" />
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-600 text-gray-200">
          <SelectItem value="lowToHigh">Price: Low to High</SelectItem>
          <SelectItem value="highToLow">Price: High to Low</SelectItem>
          <SelectItem value="rating">Best Rated</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  const renderPagination = () => (
    <div className="flex justify-center items-center gap-4 mt-6 mb-2">
      <Button
        onClick={() => fetchVendors(page - 1)}
        disabled={page === 1}
        variant="outline"
        className=" text-white border-none bg-indigo-600 hover:text-white hover:bg-indigo-700 transition-colors duration-200"
      >
        Previous
      </Button>
      <Badge variant="outline" className="text-gray-300 px-3 py-1">
        Page {page}
      </Badge>
      <Button
        onClick={() => fetchVendors(page + 1)}
        disabled={!hasMore}
        variant="outline"
        className=" border-none text-white hover:bg-indigo-700 bg-indigo-600 hover:text-white transition-colors duration-200"
      >
        Next
      </Button>
    </div>
  );

  const renderVendorGrid = () => {
    const sortedVendors = getSortedVendors();
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
    <div className="space-y-5">
      <div className="bg-gradient-to-b from-gray-800/80 to-gray-900/80 p-4 rounded-xl border border-gray-700/50 shadow-lg">
        {renderSearchBar()}
      </div>

      {vendors.length > 0 && renderSortOptions()}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="animate-spin text-cyan-500 h-8 w-8 mx-auto mb-2" />
            <p className="text-gray-300">Searching for vendors...</p>
          </div>
        </div>
      )}

      {!loading && vendors.length === 0 && searchTerm && (
        <div className="text-center py-12 bg-gray-800/20 rounded-xl border border-gray-700/30">
          <div className="text-gray-400 mb-2 flex flex-col justify-center items-center">
            <SearchIcon className="text-center" size={25} />
            <p className="text-lg font-medium">No Results Found</p>
            <p className="text-sm mt-1">
              No vendors matching &quot;{searchTerm}&quot; in {eventLocation}.
            </p>
          </div>
          <p className="text-cyan-400/80 text-sm mt-3">
            Try a different search term or location
          </p>
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
