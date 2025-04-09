"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { fetchById, singleEvent } from "@/store/eventSlice";
import { addUserInSplit } from "@/store/splitSlice";
import { AppDispatch } from "@/store/store";
import { SplitUser } from "@/Interface/interface";
import SplitTabsDialog from "../SplitModal/SplitModalDialog";

const SplitOverviewClient = () => {
  const { id } = useParams();
  const event = useSelector(singleEvent);
  const dispatch = useDispatch<AppDispatch>();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SplitUser>();

  useEffect(() => {
    if (id) {
      dispatch(fetchById(id as string));
    }
  }, [dispatch, id]);

  const onSubmit = (data: SplitUser) => {
    dispatch(
      addUserInSplit({
        user: {
          name: data.name,
          email: data.email,
        },
        id: id as string,
      })
    );
    reset();
  };

  return (
    <div className="bg-gray-900 p-6 rounded-xl text-white space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Split Overview</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Add User</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] text-black">
            <DialogHeader>
              <DialogTitle>Add User</DialogTitle>
              <DialogDescription>
                Add user for splitting bill of this event.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  className="col-span-3"
                  {...register("name", { required: "Name is required" })}
                />
                {errors.name && (
                  <span className="text-sm text-red-500 col-start-2 col-span-3">
                    {errors.name.message}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  className="col-span-3"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Invalid email format",
                    },
                  })}
                />
                {errors.email && (
                  <span className="text-sm text-red-500 col-start-2 col-span-3">
                    {errors.email.message}
                  </span>
                )}
              </div>

              <DialogFooter>
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-white">Name</TableHead>
              <TableHead className="text-white">Email</TableHead>
              <TableHead className="text-white">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {event?.includedInSplit?.map((user: any, idx: any) => (
              <TableRow className="hover:bg-transparent" key={idx}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <span
                    className={`rounded-2xl py-1 px-2 text-xs font-medium ${
                      user.status === "confirmed"
                        ? "bg-green-600"
                        : "bg-yellow-500"
                    }`}
                  >
                    {user.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button className="bg-cyan-600 hover:bg-cyan-700">Make Split</Button>
        </DialogTrigger>
        <DialogContent className="bg-gray-950">
          <SplitTabsDialog
            users={event?.includedInSplit}
            vendors={event?.vendorsInSplit}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SplitOverviewClient;
