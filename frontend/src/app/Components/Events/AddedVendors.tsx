import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import VendorCard from "./VendorCard";
import { AppDispatch, RootState } from "@/store/store";
import { getVendorsByEvent, VendorType } from "@/store/vendorSlice";

const AddedVendorsList = ({ eventId }: { eventId: string }) => {
  const dispatch = useDispatch<AppDispatch>();

  const { items: vendors, status } = useSelector(
    (state: RootState): { items: VendorType[]; status: string } => state.vendors
  );

  useEffect(() => {
    dispatch(getVendorsByEvent(eventId));
  }, [eventId, dispatch]);

  const grouped = vendors.reduce(
    (acc: Record<string, VendorType[]>, vendor: VendorType) => {
      const category = vendor.category;
      if (!acc[category]) acc[category] = [];
      acc[category].push(vendor);
      return acc;
    },
    {}
  );

  if (status === "loading")
    return <p className="text-white">Loading vendors...</p>;
  if (!vendors.length)
    return <p className="text-white">No vendors added yet.</p>;

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([category, vendors]) => (
        <div key={category} className="bg-gray-900 p-4 rounded-2xl">
          <h2 className="text-lg font-bold text-blue-400 mb-2">{category}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {vendors.map((vendor) => (
              <VendorCard
                category={category}
                key={vendor._id}
                vendor={vendor}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AddedVendorsList;
