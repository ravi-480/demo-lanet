import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import { UserForm } from "./UserForm";
import { SplitUser } from "@/Interface/interface";
import { UseFormRegister, FieldErrors } from "react-hook-form";

interface AddUserDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isLoading: boolean;
  register: UseFormRegister<SplitUser>;
  errors: FieldErrors<SplitUser>;
  onSubmit: () => void;
}

export const AddUserDialog = ({
  isOpen,
  setIsOpen,
  isLoading,
  register,
  errors,
  onSubmit,
}: AddUserDialogProps) => (
  <Dialog open={isOpen} onOpenChange={setIsOpen}>
    <DialogTrigger asChild>
      <Button
        className=" gap-2 transition-all duration-300 shadow-md"
        disabled={isLoading}
      >
        <Plus size={16} /> Add User
      </Button>
    </DialogTrigger>
    <DialogContent className="sm:max-w-md bg-gray-800 text-white border-0 shadow-xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Users size={18} /> Add User to Split
        </DialogTitle>
        <DialogDescription className="text-gray-300">
          Add people who will contribute to the event expenses
        </DialogDescription>
      </DialogHeader>

      <UserForm
        register={register}
        errors={errors}
        isLoading={isLoading}
        onSubmit={onSubmit}
        onCancel={() => setIsOpen(false)}
        submitLabel="Add User"
      />
    </DialogContent>
  </Dialog>
);
