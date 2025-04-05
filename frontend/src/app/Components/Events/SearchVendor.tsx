"use client";

import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

type SearchVendorProps = {
  eventType: string;
  allowedCategories: string[];
  onSelectCategory: (category: string) => void;
};

const SearchVendor = ({
  eventType,
  allowedCategories,
  onSelectCategory,
}: SearchVendorProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filtered, setFiltered] = useState<string[]>([]);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const result = allowedCategories.filter((cat) =>
      cat.toLowerCase().includes(term)
    );
    setFiltered(result);
  }, [searchTerm, allowedCategories]);

  const handleSelect = (category: string) => {
    setSearchTerm(category);
    onSelectCategory(category);
  };

  return (
    <div>
      <Input
        placeholder={`Search vendors for ${eventType}...`}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-2"
      />

      {searchTerm && filtered.length > 0 && (
        <ul className="bg-white border rounded-md shadow max-h-60 overflow-y-auto">
          {filtered.map((cat) => (
            <li
              key={cat}
              onClick={() => handleSelect(cat)}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
            >
              {cat}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchVendor;
