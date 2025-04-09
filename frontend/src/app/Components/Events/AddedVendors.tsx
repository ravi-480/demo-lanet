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
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { addToSplitVendors } from "@/store/splitSlice";
import { fetchById, singleEvent } from "@/store/eventSlice";

const AddedVendorsList = ({ eventId }: { eventId: string }) => {
  const dispatch = useDispatch<AppDispatch>();
  const event = useSelector(singleEvent);

  useEffect(() => {
    dispatch(fetchById(eventId));
  }, [dispatch, eventId]);

  console.log(event);

  const { items: vendors, status } = useSelector(
    (state: RootState): { items: VendorType[]; status: string } => state.vendors
  );

  useEffect(() => {
    dispatch(getVendorsByEvent(eventId));
  }, [eventId, dispatch]);

  const [addToSplit, setAddToSplit] = useState<{ [vendorId: string]: boolean }>(
    {}
  );

  // check if vendors in db than checkbox must be tick
  useEffect(() => {
    if (Array.isArray(event?.vendorsInSplit)) {
      const initialState: { [vendorId: string]: boolean } = {};
      event.vendorsInSplit.forEach((v: { vendorId: string }) => {
        initialState[v.vendorId] = true;
      });
      setAddToSplit(initialState);
    }
  }, [event]);

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
    const selected = vendors
      .filter((vendor) => addToSplit[vendor._id!])
      .map((vendor) => ({
        vendorId: vendor._id!,
        price: vendor.price!,
        title: vendor.title,
        includedAt: new Date().toISOString(),
      }));

    if (selected.length > 0) {
      dispatch(addToSplitVendors({ selected, eventId }));
    }
  };

  return (
    <div className="bg-gray-900 p-4 rounded-xl">
      <div className="flex  justify-between">
        <h2 className="text-xl  font-bold text-white mb-4">Added Vendors</h2>
        <Link href="vendor-cart/splitted-vendors">
          <Button className="bg-cyan-400 hover:bg-cyan-500 cursor-pointer">
            Go to split <ArrowRight />
          </Button>
        </Link>
      </div>
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
          Save & Add Split
        </Button>
      </div>
    </div>
  );
};

export default AddedVendorsList;
