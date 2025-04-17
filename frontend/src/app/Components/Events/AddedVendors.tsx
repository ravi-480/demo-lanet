import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { getVendorsByEvent, removeAddedVendor } from "@/store/vendorSlice";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { VendorType } from "@/Interface/interface";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { fetchById, singleEvent } from "@/store/eventSlice";
import { toast } from "sonner";

const AddedVendorsList = ({ eventId }: { eventId: string }) => {
  const dispatch = useDispatch<AppDispatch>();
  const event = useSelector(singleEvent);

  const [localVendors, setLocalVendors] = useState<VendorType[]>([]);
  const [isRemoving, setIsRemoving] = useState(false);
  const [addToSplit, setAddToSplit] = useState<{ [vendorId: string]: boolean }>(
    {}
  );

  const { status } = useSelector((state: RootState) => state.vendors);

  useEffect(() => {
    const fetchData = async () => {
      await dispatch(fetchById(eventId));
      const vendorResult = await dispatch(getVendorsByEvent(eventId));
      if (getVendorsByEvent.fulfilled.match(vendorResult)) {
        setLocalVendors(vendorResult.payload);
      }
    };
    fetchData();
  }, [dispatch, eventId]);

  useEffect(() => {
    if (Array.isArray(event?.vendorsInSplit)) {
      const initialState: { [vendorId: string]: boolean } = {};
      event.vendorsInSplit.forEach((v: { vendorId: string }) => {
        initialState[v.vendorId] = true;
      });
      setAddToSplit(initialState);
    }
  }, [event]);

  const toggleVendorSplit = (vendorId: string) => {
    setAddToSplit((prev) => ({
      ...prev,
      [vendorId]: !prev[vendorId],
    }));
  };

  const allSelected = useMemo(() => {
    return (
      localVendors.length > 0 &&
      localVendors.every((vendor) => vendor._id && addToSplit[vendor._id])
    );
  }, [localVendors, addToSplit]);

  const handleSelectAll = (checked: boolean) => {
    const newState: { [vendorId: string]: boolean } = {};
    localVendors.forEach((vendor) => {
      if (vendor._id) {
        newState[vendor._id] = checked;
      }
    });
    setAddToSplit(newState);
  };

  const selectedVendors = useMemo(() => {
    return localVendors
      .filter((v) => addToSplit[v._id!])
      .map((v) => ({
        vendorId: v._id!,
        price: v.price!,
        title: v.title,
        includedAt: new Date().toISOString(),
      }));
  }, [localVendors, addToSplit]);



  const vendorsAlreadyInSplit = useMemo(() => {
    return (
      event?.vendorsInSplit?.map((v: { vendorId: string }) => v.vendorId) || []
    );
  }, [event]);

  const allSelectedAlreadyInDb = useMemo(() => {
    if (selectedVendors.length === 0) return false;
    return selectedVendors.every((v) =>
      vendorsAlreadyInSplit.includes(v.vendorId)
    );
  }, [selectedVendors, vendorsAlreadyInSplit]);

  const handleRemoveVendor = async (vendorID: string) => {
    if (!vendorID) return;
    setIsRemoving(true);
    try {
      setLocalVendors((prev) => prev.filter((v) => v._id !== vendorID));
      setAddToSplit((prev) => {
        const updated = { ...prev };
        delete updated[vendorID];
        return updated;
      });
      const response = await dispatch(removeAddedVendor(vendorID));

      if (removeAddedVendor.fulfilled.match(response)) {
        toast.success("Vendor removed successfully");
      } else {
        toast.error("Failed to remove vendor");
        dispatch(getVendorsByEvent(eventId));
      }
    } catch (error) {
      toast.error("An error occurred while removing vendor");
      dispatch(getVendorsByEvent(eventId));
    } finally {
      setIsRemoving(false);
    }
  };

  if (status === "loading" && !isRemoving) {
    return <p className="text-white">Loading vendors...</p>;
  }

  if (!localVendors.length) {
    return (
      <div className="bg-gray-900 p-4 rounded-xl">
        <div className="flex items-center flex-col justify-between">
          <h2 className="text-xl font-bold text-white mb-4">
            No Vendors Added yet
          </h2>
          <p className="text-gray-300">Go to search section and add vendors</p>
          <Link href={`/events/${eventId}`}>
            <Button className="mt-4 bg-cyan-400 hover:bg-cyan-600 cursor-pointer">
              Add Vendors <ArrowRight className="ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 p-4 rounded-xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Added Vendors</h2>
        <div className="flex items-center gap-4">
          Select All
          <Checkbox
            checked={allSelected}
            onCheckedChange={(checked) => handleSelectAll(!!checked)}
          />
          <Link href="vendor-cart/splitted-vendors">
            <Button className="bg-cyan-400 hover:bg-cyan-500 cursor-pointer">
              Go to split <ArrowRight className="ml-1" />
            </Button>
          </Link>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table className="min-w-full text-sm text-left text-gray-200">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-white">Name</TableHead>
              <TableHead className="text-white">Category</TableHead>
              <TableHead className="text-white">Price</TableHead>
              <TableHead className="text-white">Pricing Unit</TableHead>
              <TableHead className="text-white">Add to Split</TableHead>
              <TableHead className="text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {localVendors.map((vendor) => (
              <TableRow
                key={vendor._id}
                className="border-b hover:bg-gray-800 border-gray-700"
              >
                <TableCell>{vendor.title}</TableCell>
                <TableCell className="capitalize">{vendor.category}</TableCell>
                <TableCell>₹{vendor.price?.toLocaleString()}</TableCell>
                <TableCell>{vendor.pricingUnit}</TableCell>
                <TableCell>
                  <Checkbox
                    checked={addToSplit[vendor._id!] || false}
                    onCheckedChange={() =>
                      vendor._id && toggleVendorSplit(vendor._id)
                    }
                  />
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    onClick={() => vendor._id && handleRemoveVendor(vendor._id)}
                    variant="outline"
                    className="text-red-400 hover:bg-red-900 hover:text-white cursor-pointer"
                  >
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-between mt-4">
        <p className="text-sm text-gray-400">
          {selectedVendors.length} of {localVendors.length} vendors selected
        </p>
        <Button
          disabled={selectedVendors.length === 0}
          className="bg-green-600 text-white cursor-pointer hover:bg-green-700"
        >
          Save & Add Split
        </Button>
      </div>
    </div>
  );
};

export default AddedVendorsList;
