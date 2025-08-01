"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DollarSign } from "lucide-react";
import SplitTabsDialog from "./SplitModalDialog";
import { SplitUser } from "@/Interface/interface";
import { useState } from "react";

interface CreateSplitButtonProps {
  isLoading: boolean;
  eventId?: string;
  users: SplitUser[];
}

export const CreateSplitButton = ({
  isLoading,
  eventId,
  users,
}: CreateSplitButtonProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className=" w-full py-6 gap-2 shadow-md"
          disabled={isLoading}
        >
          <DollarSign size={18} />
          <span className="font-medium">Create Split</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl bg-gray-800 border-0 shadow-xl">
        <DialogHeader>
          <DialogTitle>Create Cost Split</DialogTitle>
          <DialogDescription className="text-gray-300">
            Manage expense splitting for this event
          </DialogDescription>
        </DialogHeader>
        <SplitTabsDialog
          eventId={eventId!}
          users={users}
          onClose={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
