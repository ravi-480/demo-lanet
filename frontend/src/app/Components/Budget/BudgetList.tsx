import { useDispatch } from "react-redux";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { AppDispatch } from "@/store/store";
import { removeAddedVendor } from "@/store/vendorSlice";
import { VendorType } from "@/Interface/interface";
import VendorActions from "./VendorAction";
import { fetchById } from "@/store/eventSlice";

interface BudgetListProps {
  items: VendorType[];
  eventId: string;
  refresh: () => void;
}

const BudgetList = ({ items, eventId, refresh }: BudgetListProps) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleRemoveVendor = async (vendorId: string) => {
    if (confirm("Are you sure you want to remove this vendor?")) {
      try {
        await dispatch(removeAddedVendor(vendorId));
        await dispatch(fetchById(eventId));
        refresh(); // Refresh the data with current filters
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[250px] text-gray-200">Name</TableHead>
            <TableHead className="text-gray-200">Category</TableHead>
            <TableHead className="text-gray-200">Amount</TableHead>
            <TableHead className="text-gray-200">final Price</TableHead>
            <TableHead className="text-gray-200">status</TableHead>
            <TableHead className="text-right text-gray-200">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length > 0 ? (
            items.map((item: VendorType, index: number) => (
              <TableRow
                key={index}
                className="text-gray-200 hover:bg-gray-900/40"
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="font-medium break-words max-w-100 overflow-hidden">
                      {item.title}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{item.category}</div>
                </TableCell>
                <TableCell>₹ {item.price}</TableCell>
                <TableCell>{item.finalPrice}</TableCell>
                <TableCell>
                  <span
                    className={`
      px-3 py-1 rounded-4xl text-sm capitalize font-semibold
      ${
        item.status === "accepted"
          ? "bg-green-100 text-green-800"
          : item.status === "declined"
          ? "bg-red-100 text-red-800"
          : "bg-yellow-100 text-yellow-800"
      }
    `}
                  >
                    {item.status}
                  </span>
                </TableCell>

                <TableCell className="text-right">
                  <VendorActions item={item} onRemove={handleRemoveVendor} />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={6}
                className="text-center text-gray-200 text-xl font-semibold py-6"
              >
                No Vendors Found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default BudgetList;
