"use client";
import React, { useEffect, useState } from "react";
import {
  Users,
  PlusCircle,
  Search,
  Filter,
  MoreHorizontal,
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
import { fetchGuests, uploadFile } from "@/store/rsvpSlice";
import { AppDispatch, RootState } from "@/store/store";
import { toast } from "sonner";

const GuestManagementPage = ({ eventId }: { eventId: string }) => {
  const [isAddGuestOpen, setIsAddGuestOpen] = useState(false);

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

          <Dialog open={isAddGuestOpen} onOpenChange={setIsAddGuestOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center gap-1">
                <PlusCircle size={16} />
                Add Guest
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Guest</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right">Name</label>
                  <Input
                    className="col-span-3"
                    placeholder="Enter guest name"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right">Email</label>
                  <Input
                    className="col-span-3"
                    type="email"
                    placeholder="Enter email address"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right">Status</label>
                  <Select defaultValue="pending">
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="declined">Declined</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddGuestOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={() => setIsAddGuestOpen(false)}>
                  Save Guest
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Guest Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Guests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGuests}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Confirmed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {confirmedGuests}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalGuests > 0
                ? ((confirmedGuests / totalGuests) * 100).toFixed(1)
                : 0}
              % of total guests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">
              {pendingGuests}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalGuests > 0
                ? ((pendingGuests / totalGuests) * 100).toFixed(1)
                : 0}
              % of total guests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Declined
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {declinedGuests}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalGuests > 0
                ? ((declinedGuests / totalGuests) * 100).toFixed(1)
                : 0}
              % of total guests
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Guest List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <CardTitle>Guest List</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search guests..."
                  className="pl-8 h-9 md:w-64"
                />
              </div>
              <div className="flex gap-2">
                <Select defaultValue="all">
                  <SelectTrigger className="w-[130px] h-9">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="declined">Declined</SelectItem>
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
                {rsvpData.map((guest) => (
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
                          <DropdownMenuItem>Edit Details</DropdownMenuItem>
                          <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
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
            Showing {rsvpData.length} of {rsvpData.length} guests
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
