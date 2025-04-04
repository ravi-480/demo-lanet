import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RootState } from "@/store/store";
import { Plus } from "lucide-react";
import Link from "next/link";
import React from "react";
import { useSelector } from "react-redux";

const Welcome = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  return (
    <div className="bg-blue-950 rounded-lg shadow-sm p-6 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white-800">
            Welcome back, {user?.name}
          </h1>
          <p className="text-gray-400 mt-1">You have 2 upcoming events</p>
        </div>

        <Input className="w-50" type="email" placeholder="Search events" />

        <Link href="/create-events">
          <Button
            className="mt-4 md:mt-0 flex items-center justify-center bg-blue-800 cursor-pointer
         hover:bg-blue-700 text-white px-4 py-6 rounded-md transition"
          >
            <Plus size={18} className="mr-2" />
            Create New Event
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Welcome;
