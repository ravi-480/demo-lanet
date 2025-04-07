import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import {
  getVendorsByEvent,
  VendorType,
} from "@/store/vendorSlice";
import { Button } from "@/components/ui/button";

const AddedVendorsList = ({ eventId }: { eventId: string }) => {
  const dispatch = useDispatch<AppDispatch>();

  const { items: vendors, status } = useSelector(
    (state: RootState): { items: VendorType[]; status: string } => state.vendors
  );

  useEffect(() => {
    dispatch(getVendorsByEvent(eventId));
  }, [eventId, dispatch]);

  if (status === "loading")
    return <p className="text-white">Loading vendors...</p>;
  if (!vendors.length)
    return <p className="text-white">No vendors added yet.</p>;

  return (
    <div className="bg-gray-900 p-4 rounded-xl">
      <h2 className="text-xl font-bold text-white mb-4">Added Vendors</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-200">
          <thead className="bg-gray-800 text-gray-300">
            <tr>
              <th className="py-2 px-4">Name</th>
              <th className="py-2 px-4">Category</th>
              <th className="py-2 px-4">Price</th>
              <th className="py-2 px-4">Pricing Unit</th>
              <th className="py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((vendor) => (
              <tr key={vendor._id} className="border-b border-gray-700">
                <td className="py-2 px-4">{vendor.title}</td>
                <td className="py-2 px-4 capitalize">{vendor.category}</td>
                <td className="py-2 px-4">₹{vendor.price?.toLocaleString()}</td>
                <td className="py-2 px-4">{vendor.pricingUnit}</td>
                <td className="py-2 px-4 space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-blue-400 border-blue-400"
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-400 border-red-400"
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AddedVendorsList;
