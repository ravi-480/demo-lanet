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

const Budget = () => {
  const dispatch = useDispatch<AppDispatch>();
  const vendorDetail = useSelector(vendorByUser);
  useEffect(() => {
    dispatch(getVendorByUser());
  }, []);

  return (
    <>
      <h1>Recent Expenses</h1>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-white">Date</TableHead>
            <TableHead className="text-white">Name</TableHead>
              <TableHead className="text-white">Category</TableHead>
            <TableHead className="text-white">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vendorDetail.items.map((vendor) => (
            <TableRow key={vendor._id} className="hover:bg-transparent">
              <TableCell>
                {new Date(vendor.createdAt!).toLocaleDateString()}
              </TableCell>
              <TableCell>{vendor.title}</TableCell>
              <TableCell>{vendor.category}</TableCell>
              <TableCell>₹ {vendor.price}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};

export default Budget;
