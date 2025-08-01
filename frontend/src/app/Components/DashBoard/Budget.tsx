"use client";

import { getVendorByUser, vendorByUser } from "@/store/vendorSlice";
import React, { useCallback } from "react";
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
import { usePagination } from "@/hooks/usePagination";
import Pagination from "./Pagination";
import { motion } from "framer-motion";
import LoadSpinner from "../Shared/LoadSpinner";

const Budget = () => {
  const dispatch = useDispatch<AppDispatch>();
  const vendorDetail = useSelector(vendorByUser);
  const itemsPerPage = 5; // Number of items per page

  const fetchPage = useCallback(
    (page: number) => {
      dispatch(getVendorByUser({ page, limit: itemsPerPage }));
    },
    [dispatch]
  );

  // Custom hook for pagination
  const { currentPage, totalPages, goToPage } = usePagination({
    totalPages: vendorDetail.pagination?.totalPages || 1,
    onPageChange: fetchPage,
  });

  // Helper function to safely format dates
  const formatDate = (dateString: string | number | Date | undefined) => {
    if (!dateString) return "Invalid Date";

    const date = new Date(dateString);
    return !isNaN(date.getTime()) ? date.toLocaleDateString() : "Invalid Date";
  };

  // Loading and error states
  if (vendorDetail.status === "loading") {
    return (
      <div className="text-center py-10">
        <LoadSpinner />
      </div>
    );
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
      <motion.div
        className="flex flex-col items-center justify-center h-60 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-lg md:text-xl font-semibold mb-1">
          No Recent Expenses
        </h2>
        <p className="text-xs md:text-sm text-gray-300 mb-4 text-center">
          You haven&apos;t added any expenses yet. Start by adding your first
          one.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 12,
      }}
    >
      <motion.h1
        className="pl-2 md:pl-4 mb-2 text-lg md:text-xl font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Recent Expenses
      </motion.h1>
      <motion.div
        className="border border-gray-400 p-2 md:p-4 rounded-lg overflow-x-auto"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        {/* Mobile card view for small screens */}
        <div className="md:hidden">
          {vendorDetail.items.map((vendor, index) => (
            <motion.div
              key={vendor._id || `vendor-${index}`}
              className="mb-3 p-2 border-b border-gray-700 last:border-0"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.3 }}
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
            </motion.div>
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
              {vendorDetail.items.map((vendor, index) => (
                <motion.tr
                  key={vendor._id || `vendor-${index}`}
                  className="hover:bg-transparent"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.3 }}
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
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination controls */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Budget;
