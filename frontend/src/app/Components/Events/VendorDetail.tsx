"use client";

import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import AddedVendorsList from "./AddedVendors";

const VendorsDetail = () => {
  const event = useSelector((state: RootState) => state.event.singleEvent);

  if (!event) {
    return <p className="text-white">No event selected.</p>;
  }

  return (
    <>
      <AddedVendorsList eventId={event._id} />
    </>
  );
};

export default VendorsDetail;
