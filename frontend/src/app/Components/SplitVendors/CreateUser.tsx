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

interface CreateSplitButtonProps {
  isLoading: boolean;
  eventId?: string;
  users: any[];
}

export const CreateSplitButton = ({
  isLoading,
  eventId,
  users,
}: CreateSplitButtonProps) => (
  <Dialog>
    <DialogTrigger asChild>
      <Button
        className="bg-cyan-600 hover:bg-cyan-700 w-full py-6 gap-2 shadow-md"
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
      <SplitTabsDialog eventId={eventId!} users={users} />
    </DialogContent>
  </Dialog>
);
