"use client";

import React from "react";
import AddedVendorsList from "./AddedVendors";

const VendorsDetail = ({ eventId }: { eventId: string }) => {
  console.log(eventId);

  if (!eventId) {
    return <p className="text-white">No event selected.</p>;
  }

  return (
    <>
      <AddedVendorsList eventId={eventId} />
    </>
  );
};

export default VendorsDetail;
