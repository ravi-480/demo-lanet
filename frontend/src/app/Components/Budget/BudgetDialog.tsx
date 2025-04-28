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

      await dispatch(fetchGuests(eventId));
      handleClose();
    } catch (err) {
      console.log(err);

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
        <Button className="flex items-center w-50  justify-center gap-1 py-2 sm:py-5 text-sm sm:text-base">
          <PlusCircle size={16} className="shrink-0" />
          <span className="">Add Other Expenses</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-800 w-[95%] max-w-md sm:max-w-lg mx-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl  font-semibold">
            Add New Expense
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleAddExpense)}>
          <div className="grid gap-4 py-3 sm:py-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <label className="text-left sm:text-right text-sm sm:text-base">
                Name
              </label>
              <div className="col-span-1 sm:col-span-3">
                <Input
                  className="h-9 sm:h-10"
                  placeholder="Enter Expense name"
                  onKeyDown={(e) => {
                    if (/\d/.test(e.key)) {
                      e.preventDefault(); // block number keys
                    }
                  }}
                  onPaste={(e) => {
                    const pasted = e.clipboardData.getData("text");
                    if (/\d/.test(pasted)) {
                      e.preventDefault(); // block pasting numbers
                    }
                  }}
                  {...register("title", { required: "Name is required" })}
                />
                {errors.title && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.title.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <label className="text-left sm:text-right text-sm sm:text-base">
                Price
              </label>
              <div className="col-span-1 sm:col-span-3">
                <Input
                  className="h-9 sm:h-10"
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

            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <label className="text-left sm:text-right text-sm sm:text-base">
                Category
              </label>
              <div className="col-span-1 sm:col-span-3">
                <Select
                  value={watch("status")}
                  onValueChange={(val) => setValue("status", val)}
                >
                  <SelectTrigger className="h-9 sm:h-10">
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
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-4 mt-2 sm:mt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              Save Expense
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BudgetDialog;
