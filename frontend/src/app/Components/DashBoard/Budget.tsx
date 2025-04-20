import { getVendorByUser, vendorByUser } from "@/store/vendorSlice";
import React, { useEffect } from "react";
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
import Link from "next/link";

const Budget = () => {
  const dispatch = useDispatch<AppDispatch>();
  const vendorDetail = useSelector(vendorByUser);

  useEffect(() => {
    if (vendorDetail.items.length === 0 && vendorDetail.status !== "loading") {
      dispatch(getVendorByUser());
    }
  }, []);

  if (vendorDetail.status === "succeeded" && vendorDetail.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-80">
        <h2 className="text-xl font-semibold mb-1">No Recent Expenses</h2>
        <p className="text-sm text-gray-300 mb-4">
          You haven’t added any expenses yet. Start by adding your first one.
        </p>
        <Link href="/">
          <Button>Add Expense</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1>Recent Expenses</h1>
      <Table className="table-fixed w-full">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-white">Date</TableHead>
            <TableHead className="text-white w-1/3 ">Name</TableHead>
            <TableHead className="text-white w-1/6 ">Category</TableHead>
            <TableHead className="text-white w-1/6 ">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vendorDetail.items.map((vendor) => (
            <TableRow key={vendor._id} className="hover:bg-transparent">
              <TableCell>
                {new Date(vendor.createdAt!).toLocaleDateString()}
              </TableCell>
              <TableCell className=" w-1/3 overflow-hidden text-ellipsis ">
                {vendor.title}
              </TableCell>
              <TableCell className="w-1/6">{vendor.category}</TableCell>
              <TableCell className="w-1/6">₹ {vendor.price}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};

export default Budget;
