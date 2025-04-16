"use client";

import React, { useEffect } from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { addSingleGuest, fetchGuests, updateSingleGuest } from "@/store/rsvpSlice";
import { toast } from "sonner";

interface GuestDialogProps {
  eventId: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  editGuest: any | null;
  setEditGuest: (guest: any | null) => void;
}

const GuestDialog = ({ 
  eventId, 
  isOpen, 
  setIsOpen, 
  editGuest, 
  setEditGuest 
}: GuestDialogProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const isEditing = Boolean(editGuest);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      status: "Pending",
    },
  });

  // Set form values when editing
  useEffect(() => {
    if (editGuest) {
      setValue("name", editGuest.name);
      setValue("email", editGuest.email);
      setValue("status", editGuest.status);
    }
  }, [editGuest, setValue]);

  const handleSaveGuest = async (data: any) => {
    try {
      if (isEditing) {
        const result = await dispatch(
          updateSingleGuest({ eventId, guestId: editGuest._id, data })
        );
        if (updateSingleGuest.fulfilled.match(result)) {
          toast.success("Guest updated successfully");
          await dispatch(fetchGuests(eventId));
          handleClose();
        } else {
          toast.error("Failed to update guest");
        }
      } else {
        const result = await dispatch(addSingleGuest({ ...data, eventId }));
        if (addSingleGuest.fulfilled.match(result)) {
          toast.success("Guest added successfully");
          await dispatch(fetchGuests(eventId));
          handleClose();
        } else {
          toast.error("Failed to add guest");
        }
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setEditGuest(null);
    reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) {
        setEditGuest(null);
        reset();
      }
    }}>
      <DialogTrigger asChild>
        <Button size="sm" className="flex items-center gap-1">
          <PlusCircle size={16} />
          Add Guest
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-800">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Guest" : "Add New Guest"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleSaveGuest)}>
          <div className="grid gap-4 py-4">
            {/* Name Field */}
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right">Name</label>
              <div className="col-span-3">
                <Input
                  placeholder="Enter guest name"
                  {...register("name", { required: "Name is required" })}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.name.message as string}
                  </p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right">Email</label>
              <div className="col-span-3">
                <Input
                  type="email"
                  placeholder="Enter email address"
                  {...register("email", {
                    required: "Email is required",
                  })}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.email.message as string}
                  </p>
                )}
              </div>
            </div>

            {/* Status Field */}
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right">Status</label>
              <div className="col-span-3">
                <Select
                  value={watch("status")}
                  onValueChange={(val) => setValue("status", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Confirmed">Confirmed</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Declined">Declined</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? "Update Guest" : "Save Guest"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GuestDialog;