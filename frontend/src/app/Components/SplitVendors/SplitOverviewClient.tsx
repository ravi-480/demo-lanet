"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Users, DollarSign, Mail } from "lucide-react";

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
import { addUserInSplit } from "@/store/splitSlice";
import { AppDispatch } from "@/store/store";
import { SplitUser } from "@/Interface/interface";
import SplitTabsDialog from "../SplitModal/SplitModalDialog";

const SplitOverviewClient = () => {
  const { id } = useParams();
  const event = useSelector(singleEvent);
  const dispatch = useDispatch<AppDispatch>();
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

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
    setIsAddUserOpen(false);
  };

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-900 to-gray-800 text-white">
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
              <Button className="bg-cyan-600 hover:bg-cyan-700 gap-2 transition-all duration-300 shadow-md">
                <Plus size={16} /> Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md text-gray-800 bg-white dark:bg-gray-800 dark:text-white border-0 shadow-xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Users size={18} /> Add User to Split
                </DialogTitle>
                <DialogDescription>
                  Add people who will contribute to the event expenses
                </DialogDescription>
              </DialogHeader>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4 py-2"
              >
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
                    <p className="text-sm text-red-500 mt-1">
                      {errors.name.message}
                    </p>
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
                    <p className="text-sm text-red-500 mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <DialogFooter className="pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddUserOpen(false)}
                    className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-cyan-600 hover:bg-cyan-700 ml-2"
                  >
                    Add User
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {event?.includedInSplit?.length > 0 ? (
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {event?.includedInSplit?.map((user, idx) => (
                  <TableRow
                    key={idx}
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
                        {user.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="bg-gray-800/50 rounded-lg p-8 text-center border border-gray-700">
            <Users size={40} className="mx-auto text-gray-500 mb-3" />
            <h3 className="text-lg font-medium mb-1">No contributors yet</h3>
            <p className="text-gray-400 text-sm mb-4">
              Add users to split expenses for this event
            </p>
            <Button
              onClick={() => setIsAddUserOpen(true)}
              className="bg-cyan-600 hover:bg-cyan-700 gap-2"
            >
              <Plus size={16} /> Add First User
            </Button>
          </div>
        )}
      </CardContent>

      {event?.includedInSplit?.length > 0 && (
        <CardFooter className="pt-2 pb-6">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-cyan-600 hover:bg-cyan-700 w-full py-6 gap-2 shadow-md">
                <DollarSign size={18} />
                <span className="font-medium">Create Split</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl bg-gray-950 border-0 shadow-xl">
              <SplitTabsDialog
                eventId={event?._id}
                users={event?.includedInSplit}
                vendors={event?.vendorsInSplit}
              />
            </DialogContent>
          </Dialog>
        </CardFooter>
      )}
    </Card>
  );
};

export default SplitOverviewClient;
