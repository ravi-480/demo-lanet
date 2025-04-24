"use client"

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
    return <div>Loading...</div>;
  }

  if (vendorDetail.status === "failed") {
    return <div>Failed to load expenses. Please try again later.</div>;
  }

  // No vendors added yet
  if (vendorDetail.status === "succeeded" && vendorDetail.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-80">
        <h2 className="text-xl font-semibold mb-1">No Recent Expenses</h2>
        <p className="text-sm text-gray-300 mb-4">
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
    <div>
      <h1 className="pl-4 mb-2">Recent Expenses</h1>
      <div className="border border-gray-400 p-4 rounded-lg">
        <Table className="table-fixed w-full">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-white">Date</TableHead>
              <TableHead className="text-white w-1/3">Name</TableHead>
              <TableHead className="text-white w-1/6">Category</TableHead>
              <TableHead className="text-white w-1/6">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.map((vendor, index) => (
              <TableRow
                key={vendor._id || `vendor-${index}`}
                className="hover:bg-transparent"
              >
                <TableCell>{formatDate(vendor.createdAt)}</TableCell>
                <TableCell className="w-1/3 overflow-hidden text-ellipsis">
                  {vendor.title}
                </TableCell>
                <TableCell className="w-1/6">
                  {vendor.category || "N/A"}
                </TableCell>
                <TableCell className="w-1/6">₹ {vendor.price || 0}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-4">
            <Button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              variant="secondary"
              size="sm"
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              variant="secondary"
              size="sm"
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
