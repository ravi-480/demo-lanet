"use client";
import React, { useEffect, useState } from "react";
import {
  Users,
  PlusCircle,
  Search,
  Filter,
  MoreHorizontal,
  RefreshCcw,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDispatch, useSelector } from "react-redux";
import {
  addSingleGuest,
  fetchGuests,
  removeSingleGuest,
  sendInviteAll,
  sendReminder,
  updateSingleGuest,
  uploadFile,
} from "@/store/rsvpSlice";
import { AppDispatch, RootState } from "@/store/store";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { fetchById, singleEvent } from "@/store/eventSlice";

const GuestManagementPage = ({ eventId }: { eventId: string }) => {
  const [isAddGuestOpen, setIsAddGuestOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchFilter, setSearchFilter] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file || !eventId) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("eventId", eventId);

    const result = await dispatch(uploadFile(formData));
    if (uploadFile.fulfilled.match(result)) {
      toast.success("Guest file uploaded successfully");
      dispatch(fetchGuests(eventId)); // refreshing
    } else {
      toast.error("Upload failed: " + result.payload);
    }
  };
  const { rsvpData } = useSelector((state: RootState) => state.rsvp);

  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    if (eventId) {
      dispatch(fetchGuests(eventId));
    }
  }, [dispatch, eventId]);
  const totalGuests = rsvpData.length;
  // Count stats
  const confirmedGuests = rsvpData.filter(
    (guest) => guest.status === "Confirmed"
  ).length;
  const pendingGuests = rsvpData.filter(
    (guest) => guest.status === "Pending"
  ).length;
  const declinedGuests = rsvpData.filter(
    (guest) => guest.status === "Declined"
  ).length;

  // search and filter data
  const filteredGuests = rsvpData.filter((guest) => {
    const matchesStatus =
      statusFilter === "all" || guest.status === statusFilter;

    const matchesSearch =
      (guest.name?.toLowerCase().includes(searchFilter.toLowerCase()) ??
        false) ||
      (guest.email?.toLowerCase().includes(searchFilter.toLowerCase()) ??
        false);
    return matchesStatus && matchesSearch;
  });

  // handle single user add

  const [editGuest, setEditGuest] = useState<any | null>(null); // guest to edit
  const isEditing = Boolean(editGuest);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      status: "Pending",
    },
  });

  const handleSaveGuest = async (data: any) => {
    try {
      if (isEditing) {
        const result = await dispatch(
          updateSingleGuest({ eventId, guestId: editGuest._id, data })
        );
        if (updateSingleGuest.fulfilled.match(result)) {
          toast.success("Guest updated successfully");
          await dispatch(fetchGuests(eventId)); // Refresh the guest list
          setIsAddGuestOpen(false); // Close the dialog manually
          reset(); // Reset the form
          setEditGuest(null); // Clear edit state
        } else {
          toast.error("Failed to update guest");
        }
      } else {
        const result = await dispatch(addSingleGuest({ ...data, eventId }));
        if (addSingleGuest.fulfilled.match(result)) {
          toast.success("Guest added successfully");
          await dispatch(fetchGuests(eventId)); 
          setIsAddGuestOpen(false); 
          reset(); 
        } else {
          toast.error("Failed to add guest");
        }
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    }
  };

  // remove single Guest

  const removeGuest = async (guestId: string) => {
    await dispatch(removeSingleGuest(guestId));
    dispatch(fetchGuests(eventId));
  };

  const handleInvite = async () => {
    const pendingList = rsvpData.filter((data) => data.status === "Pending");
    await dispatch(sendInviteAll(pendingList));
    alert("Email sent");
  };

  const refreshData = () => {
    dispatch(fetchGuests(eventId));
  };

  const handleSendReminder = (data: any) => {
    dispatch(sendReminder({ ...data, eventId }));
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <Users className="mr-2" />
          Guest Management
        </h1>
        <div className="flex gap-2">
          <Input
            type="file"
            onChange={handleFileChange}
            accept=".xlsx, .xls, .csv"
          />
          <Button disabled={!file} onClick={handleUpload}>
            send
          </Button>

          <Dialog
            open={isAddGuestOpen}
            onOpenChange={(open) => {
              setIsAddGuestOpen(open);
              if (!open) {
                setEditGuest(null); // reset edit state
                reset(); // clear form
              }
            }}
          >
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center gap-1">
                <PlusCircle size={16} />
                Add Guest
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800">
              <DialogHeader>
                <DialogTitle>
                  {isEditing ? "Edit Guest" : "Add New Guest"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(handleSaveGuest)}>
                <div className="grid gap-4 py-4">
                  {/* Name Field */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label className="text-right">Name</label>
                    <div className="col-span-3">
                      <Input
                        placeholder="Enter guest name"
                        {...register("name", { required: "Name is required" })}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.name.message as string}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label className="text-right">Email</label>
                    <div className="col-span-3">
                      <Input
                        type="email"
                        placeholder="Enter email address"
                        {...register("email", {
                          required: "Email is required",
                        })}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.email.message as string}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Status Field */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label className="text-right">Status</label>
                    <div className="col-span-3">
                      <Select
                        value={watch("status")}
                        onValueChange={(val) => setValue("status", val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Confirmed">Confirmed</SelectItem>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Declined">Declined</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsAddGuestOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {isEditing ? "Update Guest" : "Save Guest"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Guest Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Total Guests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-gray-100 font-bold">
              {totalGuests}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Confirmed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold  text-green-400">
              {confirmedGuests}
            </div>
            <p className="text-xs text-gray-300 mt-1">
              {totalGuests > 0
                ? ((confirmedGuests / totalGuests) * 100).toFixed(1)
                : 0}
              % of total guests
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">
              {pendingGuests}
            </div>
            <p className="text-xs text-gray-300 mt-1">
              {totalGuests > 0
                ? ((pendingGuests / totalGuests) * 100).toFixed(1)
                : 0}
              % of total guests
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Declined
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {declinedGuests}
            </div>
            <p className="text-xs text-gray-300 mt-1">
              {totalGuests > 0
                ? ((declinedGuests / totalGuests) * 100).toFixed(1)
                : 0}
              % of total guests
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Guest List */}
      <Card className="">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <CardTitle className="flex items-center gap-3">
              <h3>Guest List</h3>
              <span>
                <RefreshCcw
                  onClick={refreshData}
                  className="inline cursor-pointer"
                  size={20}
                />{" "}
                sync
              </span>
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  onChange={(e) => setSearchFilter(e.target.value)}
                  type="search"
                  placeholder="Search guests..."
                  className="pl-8 h-9 md:w-64"
                />
              </div>
              <Button onClick={handleInvite}>Send mail All</Button>
              <div className="flex gap-2">
                <Select
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value)}
                >
                  <SelectTrigger className="w-[130px] h-9">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Confirmed">Confirmed</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Declined">Declined</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Filter size={15} />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGuests.map((guest) => (
                  <TableRow key={guest._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="font-medium">{guest.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{guest.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          guest.status === "Confirmed"
                            ? "bg-green-100 text-green-800"
                            : guest.status === "Pending"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {guest.status}
                      </span>
                    </TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal size={15} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setEditGuest(guest); // store guest to edit
                              setValue("name", guest.name);
                              setValue("email", guest.email);
                              setValue("status", guest.status);
                              setIsAddGuestOpen(true); // open modal
                            }}
                          >
                            Edit Details
                          </DropdownMenuItem>

                          {guest.status === "Pending" && (
                            <DropdownMenuItem
                              onClick={() => handleSendReminder(guest)}
                            >
                              Send Reminder
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => removeGuest(guest._id)}
                            className="text-red-600"
                          >
                            Remove Guest
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {filteredGuests.length} of {rsvpData.length} guests
          </div>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default GuestManagementPage;
