import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { addVendorInSplitOrRemove } from "@/store/splitSlice";
import { AppDispatch } from "@/store/store";
import { getVendorsByEvent, removeAddedVendor } from "@/store/vendorSlice";
import { MoreHorizontal } from "lucide-react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";

const BudgetList = ({ items }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const handleRemoveVendor = async (vendorId: string) => {
    if (confirm("Are you sure you want to remove this guest?")) {
      try {
        await dispatch(removeAddedVendor(vendorId));
        toast.success("Vendor removed successfully");
        dispatch(getVendorsByEvent(items[0].event));
      } catch (error) {
        toast.error("Failed to remove guest");
        console.error(error);
      }
    }
  };

  const handleAddOrRemoveFromSplit = async (vendorId: string) => {

    dispatch(addVendorInSplitOrRemove(vendorId));
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
            <TableHead className="text-gray-200">InSplit</TableHead>
            <TableHead className="text-right text-gray-200">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length > 0 ? (
            items.map((item: any, index: number) => (
              <TableRow
                key={item._id || index}
                className="text-gray-200 hover:bg-gray-900/50"
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="font-medium">{item.title}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="text-sm">{item.category}</div>
                  </div>
                </TableCell>
                <TableCell>₹ {item.price}</TableCell>
                <TableCell>{item.pricingUnit}</TableCell>
                <TableCell>
                  {item.isIncludedInSplit ? (
                    <p className="text-green-300 bg-green-500/50 w-10 text-center py-[2px] rounded-xl">
                      Yes
                    </p>
                  ) : (
                    <p className="text-orange-300 font-semibold py-[2px] bg-orange-500/30 w-10 text-center rounded-xl px-3">
                      No
                    </p>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <GuestActions
                    item={item}
                    // onEdit={onEdit}
                    handleAddOrRemoveFromSplit={handleAddOrRemoveFromSplit}
                    onRemove={handleRemoveVendor}
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={4}
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

const GuestActions = ({
  item,
  onEdit,
  onRemove,
  handleAddOrRemoveFromSplit,
}: any) => {
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
        <DropdownMenuItem>Edit Details</DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="text-gray-950"
          onClick={() => handleAddOrRemoveFromSplit(item._id)}
        >
          {item.isIncludedInSplit ? "Remove Split" : "Add to Split"}
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onRemove(item._id)}
          className="text-red-600"
        >
          Remove Vendors
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default BudgetList;
