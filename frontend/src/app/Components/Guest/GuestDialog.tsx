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
import { addSingleGuest, updateSingleGuest } from "@/store/rsvpSlice";
import { toast } from "sonner";
import { FormData, Guest, GuestDialogProps } from "@/Interface/interface";
import { motion, AnimatePresence } from "framer-motion";
import { allowOnlyLetters, filterPastedLetters } from "@/utils/helper";

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
  onSuccess,
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

      setOriginalValues(values);
    }
  }, [editGuest, setValue]);

  const handleSaveGuest = async (data: FormData) => {
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
          if (onSuccess) {
            onSuccess();
          }
          handleClose();
        }
      } else {
        const result = await dispatch(
          addSingleGuest({
            eventId,
            ...data,
          } as Guest)
        );

        if (addSingleGuest.fulfilled.match(result)) {
          if (onSuccess) {
            onSuccess();
          }
          handleClose();
        }
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "An error occurred");
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
        if (isSubmitting) return;
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
          <Button size="sm" className="flex mt-[25px] items-center gap-1">
            <PlusCircle size={16} />
            Add Guest
          </Button>
        </motion.div>
      </DialogTrigger>

      <AnimatePresence>
        {isOpen && (
          <DialogContent className="bg-gray-800">
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
                        onKeyDown={allowOnlyLetters}
                        onPaste={filterPastedLetters}
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
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Invalid email address",
                          },
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
