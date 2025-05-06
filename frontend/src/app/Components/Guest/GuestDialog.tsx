"use client";

import React, { useEffect, useState } from "react";
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
import {
  addSingleGuest,
  fetchGuests,
  updateSingleGuest,
} from "@/store/rsvpSlice";
import { toast } from "sonner";
import { FormData, Guest, GuestDialogProps } from "@/Interface/interface";
import { motion, AnimatePresence } from "framer-motion";

// Animation variants
const contentVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 300,
    },
  },
  exit: {
    opacity: 0,
    y: 20,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

const formFieldVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: custom * 0.1,
      duration: 0.3,
    },
  }),
};

const GuestDialog = ({
  eventId,
  isOpen,
  setIsOpen,
  editGuest,
  setEditGuest,
}: GuestDialogProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const isEditing = Boolean(editGuest);
  const [originalValues, setOriginalValues] = useState<FormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      email: "",
      status: "Pending",
    },
  });

  // Set form values when editing
  useEffect(() => {
    if (editGuest) {
      const values = {
        name: editGuest.name,
        email: editGuest.email,
        status: editGuest.status,
      };

      setValue("name", values.name);
      setValue("email", values.email);
      setValue("status", values.status);

      // Store original values for comparison
      setOriginalValues(values);
    }
  }, [editGuest, setValue]);

  const handleSaveGuest = async (data: FormData) => {
    // Check if name is empty
    if (!data.name.trim()) {
      toast.error("Name is required");
      return;
    }

    // If editing, check if anything changed
    if (isEditing && originalValues) {
      const hasChanged =
        data.name !== originalValues.name ||
        data.email !== originalValues.email ||
        data.status !== originalValues.status;

      if (!hasChanged) {
        toast.error("No changes made");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (isEditing && editGuest?._id) {
        const result = await dispatch(
          updateSingleGuest({
            eventId,
            guestId: editGuest._id,
            data: data as unknown as Record<string, string>,
          })
        );
        if (updateSingleGuest.fulfilled.match(result)) {
          await dispatch(fetchGuests(eventId));
          toast.success("Guest updated successfully");
          handleClose();
        } else {
          toast.error(
            typeof result.payload === "string"
              ? result.payload
              : "Failed to update guest"
          );
        }
      } else {
        const result = await dispatch(
          addSingleGuest({
            eventId,
            ...data,
          } as Guest)
        );
        if (addSingleGuest.fulfilled.match(result)) {
          await dispatch(fetchGuests(eventId));
          handleClose();
        } else {
          toast.error(
            typeof result.payload === "string"
              ? result.payload
              : "Failed to add guest"
          );
        }
      }
    } catch (error: unknown) {
      toast.error("An error occurred");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setEditGuest(null);
    setOriginalValues(null);
    reset();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (isSubmitting) return; // Prevent closing while submitting
        setIsOpen(open);
        if (!open) {
          setEditGuest(null);
          setOriginalValues(null);
          reset();
        }
      }}
    >
      <DialogTrigger asChild>
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Button size="sm" className="flex items-center gap-1">
            <PlusCircle size={16} />
            Add Guest
          </Button>
        </motion.div>
      </DialogTrigger>

      <AnimatePresence>
        {isOpen && (
          <DialogContent className="bg-gray-800" asChild>
            <motion.div
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <DialogHeader>
                <DialogTitle>
                  {isEditing ? "Edit Guest" : "Add New Guest"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(handleSaveGuest)}>
                <div className="grid gap-4 py-4">
                  {/* Name Field */}
                  <motion.div
                    custom={0}
                    variants={formFieldVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-4 items-center gap-4"
                  >
                    <label className="text-right">Name</label>
                    <div className="col-span-3">
                      <Input
                        placeholder="Enter guest name"
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
                        {...register("name", { required: "Name is required" })}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.name.message as string}
                        </p>
                      )}
                    </div>
                  </motion.div>

                  {/* Email Field */}
                  <motion.div
                    custom={1}
                    variants={formFieldVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-4 items-center gap-4"
                  >
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
                  </motion.div>

                  {/* Status Field */}
                  <motion.div
                    custom={2}
                    variants={formFieldVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-4 items-center gap-4"
                  >
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
                  </motion.div>
                </div>
                <DialogFooter>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="button"
                      className="bg-white text-black hover:bg-gray-200"
                      onClick={handleClose}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          {isEditing ? "Updating..." : "Saving..."}
                        </span>
                      ) : (
                        <>{isEditing ? "Update Guest" : "Save Guest"}</>
                      )}
                    </Button>
                  </motion.div>
                </DialogFooter>
              </form>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
};

export default GuestDialog;
