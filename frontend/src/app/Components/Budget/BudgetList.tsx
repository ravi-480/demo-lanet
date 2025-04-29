import { useDispatch } from "react-redux";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { AppDispatch } from "@/store/store";
import { getVendorsByEvent, removeAddedVendor } from "@/store/vendorSlice";
import { VendorType } from "@/Interface/interface";

interface VendorActionProps {
  item: VendorType;
  onRemove: (id: string) => void;
}

const VendorActions = ({ item, onRemove }: VendorActionProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal size={15} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => item._id && onRemove(item._id)}
          className="text-red-600"
        >
          Remove Vendor
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const BudgetList = ({ items }: { items: VendorType[] }) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleRemoveVendor = async (vendorId: string) => {
    if (confirm("Are you sure you want to remove this vendor?")) {
      try {
        await dispatch(removeAddedVendor(vendorId));
        if (items.length > 0) {
          dispatch(
            getVendorsByEvent({ eventId: items[0].event, includeSplit: false })
          );
        }
      } catch (error) {
        toast.error("Failed to remove vendor");
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
            <TableHead className="text-gray-200">Pricing unit</TableHead>
            <TableHead className="text-gray-200">Contact no</TableHead>
            <TableHead className="text-right text-gray-200">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length > 0 ? (
            items.map((item: VendorType) => (
              <TableRow
                key={item._id}
                className="text-gray-200 hover:bg-gray-900/40"
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="font-medium">{item.title}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{item.category}</div>
                </TableCell>
                <TableCell>₹ {item.price}</TableCell>
                <TableCell>{item.pricingUnit}</TableCell>
                <TableCell>{item.phone ? item.phone : "N/A"}</TableCell>
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
