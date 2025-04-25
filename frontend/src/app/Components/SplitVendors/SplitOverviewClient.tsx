"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { fetchById, singleEvent } from "@/store/eventSlice";
import {
  addUserInSplit,
  deleteUserFromSplit,
  editUserInSplit,
} from "@/store/splitSlice";
import { AppDispatch } from "@/store/store";
import { SplitUser } from "@/Interface/interface";
import { toast } from "sonner";
import { LoadingIndicator } from "./LoadingIndicator";
import { EmptyState } from "./EmptyState";
import { AddUserDialog } from "./AddUserDialog";
import { EditUserDialog } from "./EditUserDialog";
import { UserTable } from "./UserTable";
import { DarkCard } from "./Card";
import { CreateSplitButton } from "./CreateUser";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ConfirmDialog from "../Shared/ConfirmDialog";

// Define an Error interface to handle API errors
interface ApiError {
  message?: string;
  toString: () => string;
}

const SplitOverviewClient = () => {
  const { id } = useParams();
  const event = useSelector(singleEvent);

  const dispatch = useDispatch<AppDispatch>();
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<SplitUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // State to handle delete confirmation dialog
  const [userToDelete, setUserToDelete] = useState<SplitUser | null>(null); // User to be deleted

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
    } catch (error: unknown) {
      const err = error as ApiError;
      const errMsg = err?.message || err?.toString();
      if (
        !errMsg.includes("Authentication required") &&
        !errMsg.includes("401") &&
        !errMsg.includes("Unauthorized")
      ) {
        toast.error(`Failed to refresh event data: ${errMsg}`);
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
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      toast.error(errorMessage || "Failed to add user to split");
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
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      toast.error(`Failed to edit user: ${errorMessage}`);
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
  const openEditDialog = (user: SplitUser) => {
    setCurrentUser(user);
    setIsEditUserOpen(true);
  };

  // Handle opening delete dialog
  const openDeleteDialog = (user: SplitUser) => {
    setUserToDelete(user); // Store user to delete
    setIsDeleteDialogOpen(true); // Open delete confirmation dialog
  };

  // Handle user removal
  const removeUser = async () => {
    if (!userToDelete) return;

    setIsLoading(true);
    try {
      await dispatch(
        deleteUserFromSplit({ id: id as string, userId: userToDelete._id })
      ).unwrap();
      await refreshEventData();
      toast.success("User removed successfully!");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      toast.error(`Failed to remove user: ${errorMessage}`);
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false); // Close the delete dialog
      setUserToDelete(null); // Reset user to delete
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (id) {
      refreshEventData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          <AddUserDialog
            isOpen={isAddUserOpen}
            setIsOpen={setIsAddUserOpen}
            isLoading={isLoading}
            register={addRegister}
            errors={addErrors}
            onSubmit={handleAddSubmit(onAddSubmit)}
          />
        </div>
      </CardHeader>

      <EditUserDialog
        isOpen={isEditUserOpen}
        setIsOpen={setIsEditUserOpen}
        isLoading={isLoading}
        register={editRegister}
        errors={editErrors}
        onSubmit={handleEditSubmit(onEditSubmit)}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
      />

      <CardContent className="pt-4">
        {isLoading && <LoadingIndicator />}

        {Array.isArray(event?.includedInSplit) &&
        event.includedInSplit.length > 0 ? (
          <UserTable
            users={event.includedInSplit}
            isLoading={isLoading}
            onEdit={openEditDialog}
            onDelete={openDeleteDialog} // Trigger delete dialog
          />
        ) : (
          <EmptyState
            onAddUser={() => setIsAddUserOpen(true)}
            isLoading={isLoading}
          />
        )}
      </CardContent>

      {Array.isArray(event?.includedInSplit) &&
        event.includedInSplit.length > 0 && (
          <CardFooter className="pt-2 pb-6">
            <CreateSplitButton
              isLoading={isLoading}
              eventId={event?._id}
              users={event?.includedInSplit}
            />
          </CardFooter>
        )}

      {/* Confirm Dialog for Deletion */}
      <ConfirmDialog
        title="Delete User"
        description="Are you sure you want to remove this user from the split?"
        confirmText="Delete"
        cancelText="Cancel"
        confirmClassName="bg-red-600 hover:bg-red-700"
        onConfirm={removeUser}
        onOpenChange={setIsDeleteDialogOpen}
        open={isDeleteDialogOpen}
      />
    </DarkCard>
  );
};

export default SplitOverviewClient;
