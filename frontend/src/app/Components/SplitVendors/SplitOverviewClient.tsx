"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Users, DollarSign, Mail, Edit, Trash } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { fetchById, singleEvent } from "@/store/eventSlice";
import {
  addUserInSplit,
  deleteUserFromSplit,
  editUserInSplit,
} from "@/store/splitSlice";
import { AppDispatch } from "@/store/store";
import { SplitUser } from "@/Interface/interface";
import SplitTabsDialog from "../SplitModal/SplitModalDialog";
import { toast } from "sonner";

// Reusable styled card container
const DarkCard = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <Card className={`border-0 shadow-lg bg-gray-800 text-white ${className}`}>
    {children}
  </Card>
);

// User form component to avoid duplication
const UserForm = ({
  register,
  errors,
  isLoading,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  register: any;
  errors: any;
  isLoading: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  submitLabel: string;
}) => (
  <form onSubmit={onSubmit} className="space-y-4 py-2">
    <div className="space-y-1">
      <Label htmlFor="name" className="text-sm font-medium">
        Name
      </Label>
      <Input
        id="name"
        placeholder="Enter full name"
        className="border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
        {...register("name", { required: "Name is required" })}
      />
      {errors.name && (
        <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
      )}
    </div>

    <div className="space-y-1">
      <Label htmlFor="email" className="text-sm font-medium">
        Email
      </Label>
      <Input
        id="email"
        type="email"
        placeholder="email@example.com"
        className="border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
        {...register("email", {
          required: "Email is required",
          pattern: {
            value: /^\S+@\S+$/i,
            message: "Invalid email format",
          },
        })}
      />
      {errors.email && (
        <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
      )}
    </div>

    <DialogFooter className="pt-4">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
        disabled={isLoading}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        className="bg-cyan-600 hover:bg-cyan-700 ml-2"
        disabled={isLoading}
      >
        {isLoading ? "Processing..." : submitLabel}
      </Button>
    </DialogFooter>
  </form>
);

// Loading indicator component
const LoadingIndicator = () => (
  <div className="flex justify-center mb-4">
    <div className="h-1 w-full bg-gray-700 overflow-hidden rounded-full">
      <div
        className="h-full bg-cyan-500 animate-pulse rounded-full"
        style={{ width: "100%" }}
      ></div>
    </div>
  </div>
);

// Empty state component
const EmptyState = ({
  onAddUser,
  isLoading,
}: {
  onAddUser: () => void;
  isLoading: boolean;
}) => (
  <div className="bg-gray-800/50 rounded-lg p-8 text-center border border-gray-700">
    <Users size={40} className="mx-auto text-gray-500 mb-3" />
    <h3 className="text-lg font-medium mb-1">No contributors yet</h3>
    <p className="text-gray-400 text-sm mb-4">
      Add users to split expenses for this event
    </p>
    <Button
      onClick={onAddUser}
      className="bg-cyan-600 hover:bg-cyan-700 gap-2"
      disabled={isLoading}
    >
      <Plus size={16} /> Add First User
    </Button>
  </div>
);

const SplitOverviewClient = () => {
  const { id } = useParams();
  const event = useSelector(singleEvent);
  const dispatch = useDispatch<AppDispatch>();
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<SplitUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Add user form handling
  const {
    register: addRegister,
    handleSubmit: handleAddSubmit,
    reset: addReset,
    formState: { errors: addErrors },
  } = useForm<SplitUser>();

  // Edit user form handling
  const {
    register: editRegister,
    handleSubmit: handleEditSubmit,
    reset: editReset,
    formState: { errors: editErrors },
    setValue,
  } = useForm<SplitUser>();

  // Refresh event data
  const refreshEventData = async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      await dispatch(fetchById(id as string)).unwrap();
    } catch (error: any) {
      const errMsg = error?.message || error?.toString();
      if (
        !errMsg.includes("Authentication required") &&
        !errMsg.includes("401") &&
        !errMsg.includes("Unauthorized")
      ) {
        console.error("Failed to refresh event data:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle add user form submission

  const onAddSubmit = async (data: SplitUser) => {
    setIsLoading(true);
    try {
      await dispatch(
        addUserInSplit({
          user: {
            name: data.name,
            email: data.email,
          },
          id: id as string,
        })
      ).unwrap();

      await refreshEventData();
      toast.success("User added to split successfully!");
    } catch (error: any) {
      toast.error(error || "Failed to add user to split");
    } finally {
      setIsLoading(false);
      addReset();
      setIsAddUserOpen(false);
    }
  };

  // Handle edit user form submission
  const onEditSubmit = async (data: SplitUser) => {
    if (!currentUser) return;

    setIsLoading(true);
    try {
      await dispatch(
        editUserInSplit({
          user: {
            ...currentUser,
            name: data.name,
            email: data.email,
          },
          id: id as string,
        })
      ).unwrap();
      await refreshEventData();
    } catch (error) {
      console.error("Failed to edit user:", error);
    } finally {
      setIsLoading(false);
      editReset();
      setCurrentUser(null);
      setIsEditUserOpen(false);
    }
  };

  // Update form values when current user changes
  useEffect(() => {
    if (currentUser) {
      setValue("name", currentUser.name);
      setValue("email", currentUser.email);
    }
  }, [currentUser, setValue]);

  // Handle opening edit dialog
  const openEditDialog = (user: any) => {
    setCurrentUser(user);
    setIsEditUserOpen(true);
  };

  // Handle user removal
  const removeUser = async (userData: any) => {
    if (!confirm("Are you sure you want to remove this user?")) return;

    setIsLoading(true);
    try {
      await dispatch(
        deleteUserFromSplit({ id: id as string, userId: userData._id })
      ).unwrap();
      await refreshEventData();
    } catch (error) {
      console.error("Failed to remove user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (id) {
      refreshEventData();
    }
  }, [id]);

  return (
    <DarkCard>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl font-bold">Split Overview</CardTitle>
            <CardDescription className="text-gray-300 mt-1">
              Manage cost splitting for {event?.name || "this event"}
            </CardDescription>
          </div>
          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-cyan-600 hover:bg-cyan-700 gap-2 transition-all duration-300 shadow-md"
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
                register={addRegister}
                errors={addErrors}
                isLoading={isLoading}
                onSubmit={handleAddSubmit(onAddSubmit)}
                onCancel={() => setIsAddUserOpen(false)}
                submitLabel="Add User"
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
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
            register={editRegister}
            errors={editErrors}
            isLoading={isLoading}
            onSubmit={handleEditSubmit(onEditSubmit)}
            onCancel={() => {
              setIsEditUserOpen(false);
              setCurrentUser(null);
            }}
            submitLabel="Save Changes"
          />
        </DialogContent>
      </Dialog>

      <CardContent className="pt-4">
        {isLoading && <LoadingIndicator />}

        {event?.includedInSplit && event.includedInSplit.length > 0 ? (
          <div className="rounded-lg overflow-hidden border border-gray-700 bg-gray-800/50">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-gray-700">
                  <TableHead className="text-gray-300 font-medium py-3">
                    Name
                  </TableHead>
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
                {event.includedInSplit.map((user: any, idx: number) => (
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
                          onClick={() => !isLoading && openEditDialog(user)}
                          className={`cursor-pointer hover:text-cyan-400 transition-colors ${
                            isLoading ? "opacity-50" : ""
                          }`}
                          size={14}
                        />
                        <Trash
                          onClick={() => !isLoading && removeUser(user)}
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
        ) : (
          <EmptyState
            onAddUser={() => setIsAddUserOpen(true)}
            isLoading={isLoading}
          />
        )}
      </CardContent>

      {event?.includedInSplit?.length > 0 && (
        <CardFooter className="pt-2 pb-6">
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
              <SplitTabsDialog
                eventId={event?._id}
                users={event?.includedInSplit}
              />
            </DialogContent>
          </Dialog>
        </CardFooter>
      )}
    </DarkCard>
  );
};

export default SplitOverviewClient;
