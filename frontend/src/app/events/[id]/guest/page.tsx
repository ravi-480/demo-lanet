import Guest from "@/app/Components/Guest/Guest";
import React from "react";

const GuestPage = async ({ params }: any) => {
  const id = await params.id;
  return (
    <div>
      <Guest eventId={params.id} />
    </div>
  );
};

export default GuestPage;
