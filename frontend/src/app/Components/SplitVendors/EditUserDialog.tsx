"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Edit } from "lucide-react";
import { UserForm } from "./UserForm";
import { SplitUser } from "@/Interface/interface";
import { UseFormRegister, FieldErrors } from "react-hook-form";

interface EditUserDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isLoading: boolean;
  register: UseFormRegister<SplitUser>;
  errors: FieldErrors<SplitUser>;
  onSubmit: () => void;
  currentUser: SplitUser | null;
  setCurrentUser: (user: SplitUser | null) => void;
}

export const EditUserDialog = ({
  isOpen,
  setIsOpen,
  isLoading,
  register,
  errors,
  onSubmit,
  currentUser,
  setCurrentUser,
}: EditUserDialogProps) => (
  <Dialog open={isOpen} onOpenChange={setIsOpen}>
    <DialogContent className="sm:max-w-md bg-gray-800 text-white border-0 shadow-xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Edit size={18} /> Edit User
        </DialogTitle>
        <DialogDescription className="text-gray-300">
          Update user details for the event split
        </DialogDescription>
      </DialogHeader>

      <UserForm
        register={register}
        errors={errors}
        isLoading={isLoading}
        onSubmit={onSubmit}
        onCancel={() => {
          setIsOpen(false);
          setCurrentUser(null);
        }}
        submitLabel="Save Changes"
      />
    </DialogContent>
  </Dialog>
);
