"use client";
import { getVendorsByEvent, vendorByUser } from "@/store/vendorSlice";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { AppDispatch } from "../../../store/store";

const colors = ["#3B82F6", "#60A5FA", "#93C5FD", "#BFDBFE", "#DBEAFE"];

export default function MyPieChart({ event }: any) {
  
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(getVendorsByEvent(event._id));
  }, [dispatch, event._id]);
  const addedVendor = useSelector(vendorByUser);
  console.log(addedVendor);

  const data = React.useMemo(() => {
    return addedVendor?.items?.map((vendor: any, index: number) => ({
      name: vendor.title,
      value: vendor.price,
      fill: colors[index % colors.length],
    }));
  }, [addedVendor]);
  
  return (
    <div className="flex justify-center bg-gray-900 mt-5 items-center h-[300px] ">
      <PieChart width={400} height={400}>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          fill="#8884d8"
          label
        >
          {data.map((_: any, index: number) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
}
