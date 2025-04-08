import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { getVendorsByEvent } from "@/store/vendorSlice";
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
import { addVendorToSplit } from "@/store/splitSlice";

const AddedVendorsList = ({ eventId }: { eventId: string }) => {
  const dispatch = useDispatch<AppDispatch>();

  const { items: vendors, status } = useSelector(
    (state: RootState): { items: VendorType[]; status: string } => state.vendors
  );

  useEffect(() => {
    dispatch(getVendorsByEvent(eventId));
  }, [eventId, dispatch]);

  const [addToSplit, setAddToSplit] = useState<{ [vendorId: string]: boolean }>(
    {}
  );

  if (status === "loading")
    return <p className="text-white">Loading vendors...</p>;
  if (!vendors.length)
    return <p className="text-white">No vendors added yet.</p>;

  // adding split

  const toggleSplit = (vendorId: string) => {
    setAddToSplit((prev) => ({
      ...prev,
      [vendorId]: !prev[vendorId],
    }));
  };

  const handleSaveSplit = () => {
    const selected = vendors.filter((vendor) => addToSplit[vendor._id!]);
    dispatch(addVendorToSplit({ selected, eventId: selected[0].addedBy }));
  };

  return (
    <div className="bg-gray-900 p-4 rounded-xl">
      <h2 className="text-xl font-bold text-white mb-4">Added Vendors</h2>
      <div className="overflow-x-auto">
        <Table className="min-w-full text-sm text-left text-gray-200">
          <TableHeader>
            <TableRow className="hover:bg-transparent ">
              <TableHead className="text-white">Name</TableHead>
              <TableHead className="text-white">Category</TableHead>
              <TableHead className="text-white">Price</TableHead>
              <TableHead className="text-white">Pricing Unit</TableHead>
              <TableHead className="text-white">Add to Split</TableHead>
              <TableHead className="text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendors.map((vendor) => (
              <TableRow
                key={vendor._id}
                className="border-b hover:bg-transparent border-gray-700"
              >
                <TableCell>{vendor.title}</TableCell>
                <TableCell className="capitalize">{vendor.category}</TableCell>
                <TableCell>₹{vendor.price?.toLocaleString()}</TableCell>
                <TableCell>{vendor.pricingUnit}</TableCell>
                <TableCell>
                  <Checkbox
                    checked={addToSplit[vendor._id!] || false}
                    onCheckedChange={() => toggleSplit(vendor._id!)}
                  />
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-400 border-red-400"
                  >
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-end mt-4">
        <Button
          onClick={handleSaveSplit}
          className="bg-green-600 text-white cursor-pointer hover:bg-green-700"
        >
          Add to Split
        </Button>
      </div>
    </div>
  );
};

export default AddedVendorsList;
