import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Props } from "@/Interface/interface";
import { handleSendRequest } from "@/utils/helper";
import axios from "axios";
import React, { useState } from "react";

const SplitTabsDialog = ({ users, vendors }: Props) => {
  const [mode, setMode] = useState<"equal" | "custom">("equal");

  const [customSplit, setCustomSplit] = useState<string[]>(
    Array(users.length).fill("")
  );
  const totalCost = vendors.reduce((acc, v) => acc + v.price, 0);

  const customTotal = customSplit.reduce(
    (acc, val) => acc + (parseFloat(val) || 0),
    0
  );
  const isCustomInvalid = mode === "custom" && customTotal !== totalCost;

  const handleCustomChange = (value: string, index: number) => {
    const updated = [...customSplit];
    updated[index] = value;
    setCustomSplit(updated);
  };

  return (
    <Tabs defaultValue="account" className="w-[400px] mx-auto ">
      <TabsList className="bg-gray-900 w-full justify-start border border-gray-700">
        <TabsTrigger
          className="text-white data-[state=active]:text-cyan-400 data-[state=active]:bg-transparent"
          value="users"
        >
          Users
        </TabsTrigger>
        <TabsTrigger
          className="text-white data-[state=active]:text-cyan-400 data-[state=active]:bg-transparent"
          value="vendors"
        >
          Vendors
        </TabsTrigger>
      </TabsList>
      <TabsContent value="users" className="space-y-6 ">
        <h3 className="text-xl font-semibold ">Split Among Users</h3>
        <div className="space-y-2">
          <Label className="text-white">Split Type</Label>
          <Select
            value={mode}
            onValueChange={(val) => setMode(val as "equal" | "custom")}
          >
            <SelectTrigger className="w-full bg-gray-800 text-white border border-gray-600">
              <SelectValue placeholder="Select split type" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 text-white">
              <SelectItem value="equal">Equal Split</SelectItem>
              <SelectItem value="custom">Custom Split</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-3">
          {users.map((user, index) => (
            <div
              key={index}
              className="flex justify-between items-center bg-gray-800 p-3 rounded-md border border-gray-700"
            >
              <div>
                <p>{user.name}</p>
                <p>{user.email}</p>
              </div>
              {mode === "equal" ? (
                <span className="text-cyan-400 font-semibold">
                  ₹{Math.round(totalCost / users.length)}
                </span>
              ) : (
                <Input
                  type="number"
                  value={customSplit[index]}
                  onChange={(e) => handleCustomChange(e.target.value, index)}
                  placeholder="₹ Amount"
                  className="w-32 bg-gray-900 text-white border border-gray-600 placeholder:text-gray-400"
                />
              )}
            </div>
          ))}
        </div>
      </TabsContent>
      <TabsContent value="vendors">
        <h3 className="text-xl mb-4 font-semibold">Vendors Added</h3>
        <p className="text-sm text-gray-400 mb-4">
          Here's a breakdown of all vendors you've added so far along with their
          respective costs.
        </p>
        <div className="space-y-3">
          {vendors.map((vendor, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center bg-gray-800 p-3 rounded-md border border-gray-700"
            >
              <span className="text-white font-medium">{vendor.title}</span>
              <span className="text-cyan-400">₹{vendor.price}</span>
            </div>
          ))}
        </div>

        <p className="text-sm text-gray-300 mt-2">
          <strong>Total Cost:</strong>{" "}
          <span className="text-cyan-400">₹{totalCost}</span>
        </p>
      </TabsContent>
      {isCustomInvalid && (
        <p className="text-sm text-red-500 mt-2">
          Total custom split (₹{customTotal}) does not equal the total cost (₹
          {totalCost}).
        </p>
      )}
      <Button
        onClick={() => handleSendRequest(users, totalCost)}
        disabled={isCustomInvalid}
        className="bg-cyan-500 mt-3 hover:bg-cyan-600 cursor-pointer"
      >
        Send Request
      </Button>
    </Tabs>
  );
};

export default SplitTabsDialog;
