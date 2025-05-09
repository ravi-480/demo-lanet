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
import { AppDispatch, RootState } from "@/store/store";
import { getVendorsByEvent } from "@/store/vendorSlice";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { AlertCircle, Users, ShoppingBag } from "lucide-react";
import { getCurrentUser } from "@/store/authSlice";

interface ExtendedUser {
  _id: string;
  name: string;
  email: string;
  status?: "pending" | "Paid" | "declined";
  amount?: number;
}

interface ExtendedProps extends Omit<Props, "users"> {
  users: ExtendedUser[];
}

const SplitTabsDialog = ({ users, eventId, onClose }: ExtendedProps) => {
  const [loading, setLoading] = useState(false);
  const [confirmResetting, setConfirmResetting] = useState(false);
  const [mode, setMode] = useState<"equal" | "custom">("equal");
  const dispatch = useDispatch<AppDispatch>();

  // Get current user and vendors
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const { items: vendors } = useSelector((state: RootState) => state.vendors);

  // Load data on component mount
  useEffect(() => {
    if (eventId) {
      dispatch(getVendorsByEvent({ eventId }));
      dispatch(getCurrentUser());
    }
  }, [dispatch, eventId]);

  // Calculate total cost from vendors
  const totalCost = vendors.reduce((acc, v) => acc + v.price, 0);

  // Include event owner in the participants list
  const allParticipants = currentUser ? [currentUser, ...users] : [...users];

  // Setup custom split amounts - initialize with empty strings instead of prefilled values
  const [customSplit, setCustomSplit] = useState<string[]>(() =>
    allParticipants.map(() => "")
  );

  // Validation
  const customTotal = customSplit.reduce(
    (acc, val) => acc + (parseFloat(val) || 0),
    0
  );
  const isCustomInvalid = mode === "custom" && customTotal !== totalCost;
  const showCustomOption = allParticipants.length > 1;

  // Check if any user has already paid
  const hasPaidUsers = users.some((user) => user.status === "Paid");

  // Handle input change for custom amounts
  const handleCustomChange = (value: string, index: number) => {
    const updated = [...customSplit];
    updated[index] = value;
    setCustomSplit(updated);
  };

  // Calculate costs per participant
  const participantsWithCost = allParticipants.map((participant, index) => ({
    ...participant,
    eventId,
    amount:
      mode === "equal"
        ? Math.round(totalCost / allParticipants.length)
        : parseFloat(customSplit[index]) || 0,
  }));

  // Handle send request button click
  const handleSendRequest = async () => {
    // Show confirmation if there are paid users
    if (hasPaidUsers && !confirmResetting) {
      setConfirmResetting(true);
      return;
    }

    // Filter out the owner from recipients
    const usersToCharge = participantsWithCost.slice(1);

    const recipients = usersToCharge.map((user) => user.email);
    const amounts = usersToCharge.map((user) => user.amount);
    const eventIds = usersToCharge.map(() => eventId);
    const userIds = usersToCharge.map((user) =>
      "id" in user ? user.id : user._id
    );

    setLoading(true);
    try {
      await axios.post("/vendors/send-mail", {
        recipients,
        amounts,
        eventId: eventIds,
        userId: userIds,
      });
      toast.success("Emails sent successfully!");
      setLoading(false);
      onClose();
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  // Status badge component with improved styling
  const StatusBadge = ({ status }: { status?: string }) => {
    if (!status || status === "pending") {
      return (
        <span className="px-2 py-0.5 text-xs bg-yellow-900/60 text-yellow-300 rounded-full">
          Pending
        </span>
      );
    } else if (status === "Paid") {
      return (
        <span className="px-2 py-0.5 text-xs bg-green-900/60 text-green-300 rounded-full">
          Paid
        </span>
      );
    } else if (status === "declined") {
      return (
        <span className="px-2 py-0.5 text-xs bg-red-900/60 text-red-300 rounded-full">
          Declined
        </span>
      );
    }
    return null;
  };

  return (
    <div className="w-full max-w-md mx-auto h-[70vh] flex flex-col">
      <Tabs defaultValue="users" className="flex flex-col h-full">
        <div className="mb-2 bg-gray-800/60 p-1 rounded-lg border border-gray-700 flex-shrink-0">
          <TabsList className="w-full grid grid-cols-2 bg-gray-800 p-1 rounded-md shadow-inner">
            <TabsTrigger
              className="flex items-center justify-center gap-1.5 text-white py-2 text-sm font-medium transition-all data-[state=active]:bg-gray-900 data-[state=active]:text-cyan-400 data-[state=active]:shadow-sm rounded-md"
              value="users"
            >
              <Users className="h-4 w-4" />
              Participants
            </TabsTrigger>
            <TabsTrigger
              className="flex items-center text-white justify-center gap-1.5 py-2 text-sm font-medium transition-all data-[state=active]:bg-gray-900 data-[state=active]:text-cyan-400 data-[state=active]:shadow-sm rounded-md"
              value="vendors"
            >
              <ShoppingBag className="h-4 w-4" />
              Vendors
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-grow overflow-auto">
          {/* Participants Tab */}
          <TabsContent value="users" className="h-full p-2">
            {/* Warning for paid users */}
            {hasPaidUsers && (
              <div className="bg-yellow-900/30 border border-yellow-700/50 p-2 rounded-md flex items-start gap-2 mb-3">
                <AlertCircle className="text-yellow-300 h-4 w-4 mt-0.5 flex-shrink-0" />
                <p className="text-yellow-200 text-xs">
                  Some participants have already paid. Creating a new split will
                  reset their payment status.
                </p>
              </div>
            )}

            {/* No vendors message */}
            {vendors.length === 0 ? (
              <div className="bg-yellow-900/30 border border-yellow-700/50 p-3 rounded-md text-center">
                <p className="text-yellow-200 text-sm font-medium">
                  Please add vendors first before splitting costs.
                </p>
              </div>
            ) : (
              <>
                {/* Split type selector */}
                {showCustomOption && (
                  <div className="space-y-1 mb-3">
                    <Label className="text-white text-sm flex items-center gap-1.5">
                      Split Type
                      {mode === "custom" && (
                        <span className="text-xs text-gray-400 font-normal">
                          (Total: ₹{customTotal} of ₹{totalCost})
                        </span>
                      )}
                    </Label>
                    <Select
                      value={mode}
                      onValueChange={(val) =>
                        setMode(val as "equal" | "custom")
                      }
                    >
                      <SelectTrigger className="w-full bg-gray-800 text-white border border-gray-600 h-9 text-sm">
                        <SelectValue placeholder="Select split type" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 text-white">
                        <SelectItem value="equal">Equal Split</SelectItem>
                        <SelectItem value="custom">Custom Split</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Participants list */}
                <div className="space-y-2.5">
                  {/* Owner */}
                  {currentUser && (
                    <div className="flex justify-between items-center bg-gray-800 p-3 rounded-md border border-gray-700">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">
                            {currentUser.name}
                          </p>
                          <span className="px-2 py-0.5 text-xs bg-cyan-900/70 text-cyan-300 rounded-full">
                            Owner
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {currentUser.email}
                        </p>
                      </div>
                      {mode === "equal" || !showCustomOption ? (
                        <span className="text-cyan-400 font-semibold text-sm bg-cyan-900/20 px-3 py-1 rounded-md">
                          ₹{Math.round(totalCost / allParticipants.length)}
                        </span>
                      ) : (
                        <Input
                          type="number"
                          value={customSplit[0]}
                          onChange={(e) =>
                            handleCustomChange(e.target.value, 0)
                          }
                          placeholder="₹"
                          className="w-24 h-8 bg-gray-900 text-white border border-gray-600 text-sm"
                        />
                      )}
                    </div>
                  )}

                  {/* Other participants */}
                  {users.map((user, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center bg-gray-800 p-3 rounded-md border border-gray-700"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{user.name}</p>
                          <StatusBadge status={user.status} />
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {user.email}
                        </p>
                      </div>
                      {mode === "equal" || !showCustomOption ? (
                        <span className="text-cyan-400 font-semibold text-sm bg-cyan-900/20 px-3 py-1 rounded-md">
                          ₹{Math.round(totalCost / allParticipants.length)}
                        </span>
                      ) : (
                        <Input
                          type="number"
                          value={customSplit[index + (currentUser ? 1 : 0)]}
                          onChange={(e) =>
                            handleCustomChange(
                              e.target.value,
                              index + (currentUser ? 1 : 0)
                            )
                          }
                          placeholder="₹"
                          className="w-24 h-8 bg-gray-900 text-white border border-gray-600 text-sm"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          {/* Vendors Tab */}
          <TabsContent value="vendors" className="h-full p-2">
            {vendors.length === 0 ? (
              <div className="bg-gray-800 p-4 rounded-md border border-gray-700 text-center">
                <ShoppingBag className="h-10 w-10 text-gray-500 mx-auto mb-2 opacity-50" />
                <p className="text-gray-400 text-sm">
                  No vendors have been added yet.
                </p>
              </div>
            ) : (
              <>
                <div className="bg-gray-800/50 rounded-md p-2 mb-3 border border-gray-700/50">
                  <p className="text-sm text-gray-300">
                    <strong>Total Cost: </strong>
                    <span className="text-cyan-400 font-semibold">
                      ₹{totalCost}
                    </span>
                  </p>
                </div>
                <div className="space-y-2">
                  {vendors.map((vendor, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center bg-gray-800 p-3 rounded-md border border-gray-700"
                    >
                      <span className="text-white text-sm truncate max-w-xs font-medium">
                        {vendor.title}
                      </span>
                      <span className="text-cyan-400 text-sm font-semibold">
                        ₹{vendor.price}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </TabsContent>
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="mt-3 px-2 flex-shrink-0">
          {/* Error message for invalid custom split */}
          {isCustomInvalid && (
            <div className="bg-red-900/20 border border-red-700/50 p-2 rounded-md mb-2 flex items-start gap-2">
              <AlertCircle className="text-red-400 h-4 w-4 mt-0.5 flex-shrink-0" />
              <p className="text-red-300 text-xs">
                Total amount (₹{customTotal.toFixed(2)}) does not match vendor
                total (₹{totalCost}).
              </p>
            </div>
          )}

          {/* Action buttons */}
          {confirmResetting ? (
            <div className="space-y-2">
              <div className="bg-red-900/20 border border-red-700/50 p-2 rounded-md">
                <p className="text-red-200 text-xs">
                  Proceeding will reset payment status for participants who have
                  already paid.
                </p>
              </div>
              <div className="flex justify-between gap-2">
                <Button
                  variant="outline"
                  onClick={() => setConfirmResetting(false)}
                  className="flex-1 h-9 text-sm text-white bg-gray-700 hover:bg-gray-600 border-gray-600"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendRequest}
                  disabled={isCustomInvalid || vendors.length === 0}
                  className="flex-1 bg-red-600 hover:bg-red-700 h-9 text-sm"
                >
                  Confirm
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 h-9 text-sm text-white bg-gray-700 hover:bg-gray-600 border-gray-600"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendRequest}
                disabled={isCustomInvalid || vendors.length === 0}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 h-9 text-sm"
              >
                {loading
                  ? "Sending..."
                  : vendors.length === 0
                  ? "Add Vendors First"
                  : "Send Request"}
              </Button>
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
};

export default SplitTabsDialog;
