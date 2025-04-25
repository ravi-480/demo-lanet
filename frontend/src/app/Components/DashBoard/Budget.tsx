"use client";

import { getVendorByUser, vendorByUser } from "@/store/vendorSlice";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store/store";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const Budget = () => {
  const dispatch = useDispatch<AppDispatch>();
  const vendorDetail = useSelector(vendorByUser);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Number of items per page

  useEffect(() => {
    dispatch(getVendorByUser());
  }, [dispatch]);

  // Helper function to safely format dates
  const formatDate = (dateString: string | number | Date | undefined) => {
    if (!dateString) return "Invalid Date";

    const date = new Date(dateString);
    return !isNaN(date.getTime()) ? date.toLocaleDateString() : "Invalid Date";
  };

  // Loading and error states
  if (vendorDetail.status === "loading") {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (vendorDetail.status === "failed") {
    return (
      <div className="text-center py-10 px-4 text-sm md:text-base">
        Failed to load expenses. Please try again later.
      </div>
    );
  }

  // No vendors added yet
  if (vendorDetail.status === "succeeded" && vendorDetail.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-60 px-4">
        <h2 className="text-lg md:text-xl font-semibold mb-1">
          No Recent Expenses
        </h2>
        <p className="text-xs md:text-sm text-gray-300 mb-4 text-center">
          You haven't added any expenses yet. Start by adding your first one.
        </p>
      </div>
    );
  }

  // Pagination logic
  const totalPages = Math.ceil(vendorDetail.items.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = vendorDetail.items.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  return (
    <div className="w-full">
      <h1 className="pl-2 md:pl-4 mb-2 text-lg md:text-xl font-medium">
        Recent Expenses
      </h1>
      <div className="border border-gray-400 p-2 md:p-4 rounded-lg overflow-x-auto">
        {/* Mobile card view for small screens */}
        <div className="md:hidden">
          {currentItems.map((vendor, index) => (
            <div
              key={vendor._id || `vendor-${index}`}
              className="mb-3 p-2 border-b border-gray-700 last:border-0"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-400">
                  {formatDate(vendor.createdAt)}
                </span>
                <span className="text-sm font-medium">
                  ₹ {vendor.price || 0}
                </span>
              </div>
              <div className="text-sm font-medium truncate">{vendor.title}</div>
              <div className="text-xs text-gray-300">
                {vendor.category || "N/A"}
              </div>
            </div>
          ))}
        </div>

        {/* Table view for larger screens */}
        <div className="hidden md:block">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-white text-sm">Date</TableHead>
                <TableHead className="text-white w-1/3 text-sm">Name</TableHead>
                <TableHead className="text-white w-1/6 text-sm">
                  Category
                </TableHead>
                <TableHead className="text-white w-1/6 text-sm">
                  Amount
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.map((vendor, index) => (
                <TableRow
                  key={vendor._id || `vendor-${index}`}
                  className="hover:bg-transparent"
                >
                  <TableCell className="text-sm">
                    {formatDate(vendor.createdAt)}
                  </TableCell>
                  <TableCell className="w-1/3 overflow-hidden text-ellipsis text-sm">
                    {vendor.title}
                  </TableCell>
                  <TableCell className="w-1/6 text-sm">
                    {vendor.category || "N/A"}
                  </TableCell>
                  <TableCell className="w-1/6 text-sm">
                    ₹ {vendor.price || 0}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 md:gap-4 mt-4">
            <Button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              variant="secondary"
              size="sm"
              className="text-xs md:text-sm py-1 px-2 md:py-2 md:px-3"
            >
              Prev
            </Button>
            <span className="text-xs md:text-sm">
              {currentPage}/{totalPages}
            </span>
            <Button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              variant="secondary"
              size="sm"
              className="text-xs md:text-sm py-1 px-2 md:py-2 md:px-3"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Budget;
