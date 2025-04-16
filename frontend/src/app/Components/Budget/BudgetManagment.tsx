import { Users, Wallet } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import GuestStats from "../Guest/GuestStatCard";

const BudgetManagment = ({ eventId }: { eventId: string }) => {
  return (
    <div className="max-w-6xl mx-auto p-6  ">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <Wallet className="mr-2" />
          Budget Management
        </h1>
        <div className="flex gap-2">
          {/* <GuestUpload eventId={eventId} /> */}
          <Button>Add expense</Button>
        </div>
      </div>
{/* <GuestStats data={} /> */}
    </div>
  );
};

export default BudgetManagment;
