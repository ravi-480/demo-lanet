"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Mail, Trash } from "lucide-react";
import { SplitUser } from "@/Interface/interface";

interface UserTableProps {
  users: any[];
  isLoading: boolean;
  onEdit: (user: any) => void;
  onDelete: (user: any) => void;
}

export const UserTable = ({
  users,
  isLoading,
  onEdit,
  onDelete,
}: UserTableProps) => (
  <div className="rounded-lg overflow-hidden border border-gray-700 bg-gray-800/50">
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent border-gray-700">
          <TableHead className="text-gray-300 font-medium py-3">Name</TableHead>
          <TableHead className="text-gray-300 font-medium py-3">
            Email
          </TableHead>
          <TableHead className="text-gray-300 font-medium py-3">
            Status
          </TableHead>
          <TableHead className="text-gray-300 font-medium py-3">
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user: any, idx: number) => (
          <TableRow
            key={user._id || idx}
            className="hover:bg-gray-800/70 border-gray-700 transition-colors"
          >
            <TableCell className="font-medium">{user.name}</TableCell>
            <TableCell className="text-gray-300">
              <div className="flex items-center gap-2">
                <Mail size={14} />
                {user.email}
              </div>
            </TableCell>
            <TableCell>
              <span
                className={`rounded-full py-1 px-3 text-xs font-medium ${
                  user.status === "Paid"
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                }`}
              >
                {user.status || "Pending"}
              </span>
            </TableCell>
            <TableCell>
              <div className="flex gap-4">
                <Edit
                  onClick={() => !isLoading && onEdit(user)}
                  className={`cursor-pointer hover:text-cyan-400 transition-colors ${
                    isLoading ? "opacity-50" : ""
                  }`}
                  size={14}
                />
                <Trash
                  onClick={() => !isLoading && onDelete(user)}
                  className={`cursor-pointer hover:text-red-500 transition-colors ${
                    isLoading ? "opacity-50" : ""
                  }`}
                  size={14}
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);
