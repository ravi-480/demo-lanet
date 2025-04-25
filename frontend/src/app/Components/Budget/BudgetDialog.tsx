"use client";

import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { AppDispatch } from "@/store/store";
import { fetchGuests } from "@/store/rsvpSlice";
import { addManualVendorExpense } from "@/store/vendorSlice";

interface BudgetDialogProps {
  eventId: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

interface ExpenseFormData {
  title: string;
  price: number;
  status: string;
}

const EXPENSE_CATEGORIES = [
  "Catering",
  "Music",
  "Photography",
  "Decoration",
  "Videography",
  "Lighting & Sound",
  "Other",
];

const BudgetDialog = ({ eventId, isOpen, setIsOpen }: BudgetDialogProps) => {
  const dispatch = useDispatch<AppDispatch>();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    defaultValues: {
      title: "",
      price: 10,
      status: "Catering",
    },
  });

  const handleAddExpense = async (data: ExpenseFormData) => {
    try {
      await dispatch(
        addManualVendorExpense({
          ...data,
          eventId,
          pricingUnit: "flat rate",
        })
      ).unwrap();

      toast.success("Vendor added successfully");
      await dispatch(fetchGuests(eventId));
      handleClose();
    } catch (error) {
      toast.error("Failed to add vendor");
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    reset();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" className="flex sm:w-full py-5 items-center gap-1">
          <PlusCircle size={16} />
          Add Other Expenses
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-800">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleAddExpense)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right">Name</label>
              <div className="col-span-3">
                <Input
                  placeholder="Enter Expense name"
                  {...register("title", { required: "Name is required" })}
                />
                {errors.title && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.title.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right">Price</label>
              <div className="col-span-3">
                <Input
                  type="number"
                  placeholder="Enter price"
                  {...register("price", {
                    required: "Price is required",
                    min: { value: 10, message: "Price must be required" },
                  })}
                  min={10}
                />
                {errors.price && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.price.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right">Category</label>
              <div className="col-span-3">
                <Select
                  value={watch("status")}
                  onValueChange={(val) => setValue("status", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Save Expense</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BudgetDialog;
