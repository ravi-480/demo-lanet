"use client";

import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";

interface EmptyStateProps {
  onAddUser: () => void;
  isLoading: boolean;
}

export const EmptyState = ({ onAddUser, isLoading }: EmptyStateProps) => (
  <div className="bg-gray-800/50 rounded-lg p-8 text-center border border-gray-700">
    <Users size={40} className="mx-auto text-gray-500 mb-3" />
    <h3 className="text-lg font-medium mb-1">No contributors yet</h3>
    <p className="text-gray-400 text-sm mb-4">
      Add users to split expenses for this event
    </p>
    <Button
      onClick={onAddUser}
      className="bg-indigo-600 hover:bg-indigo-700 gap-2"
      disabled={isLoading}
    >
      <Plus size={16} /> Add First User
    </Button>
  </div>
);
