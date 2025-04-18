import { IEvent } from "../../../Interface/interface";
import MyPieChart from "./EventPieChart";
import { Users, Wallet } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect } from "react";
import { fetchGuests } from "@/store/rsvpSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";

const EventOverView = ({ event }: { event: IEvent }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { rsvpData } = useSelector((state: RootState) => state.rsvp);

  const eventId = event._id;

  useEffect(() => {
    if (eventId) {
      dispatch(fetchGuests(eventId));
    }
  }, [dispatch, eventId]);

  const { budget = { allocated: 0, spent: 0 } } = event;
  const remaining = budget.allocated - budget.spent;

  // Calculate guest data from rsvpData
  const totalGuests = rsvpData.length;
  const confirmedGuests = rsvpData.filter(
    (guest) => guest.status === "Confirmed"
  ).length;
  const pendingGuests = rsvpData.filter(
    (guest) => guest.status === "Pending"
  ).length;

  // Calculate percentages for progress bars
  const attendancePercentage =
    totalGuests > 0 ? (confirmedGuests / totalGuests) * 100 : 0;
  const spentPercentage =
    budget.allocated > 0 ? (budget.spent / budget.allocated) * 100 : 0;

  return (
    <div className="grid gap-6">
      <MyPieChart event={event} rsvpData={rsvpData} />

      {/* Guest Summary Card */}
      <Card className="border-0 bg-gray-800 text-white shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-cyan-400 flex items-center">
            <Users className="mr-2" size={20} />
            Guest Summary
          </CardTitle>
          <span className="text-sm text-gray-400">Total: {totalGuests}</span>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-300">Confirmed</span>
              <span className="font-medium text-green-400">
                {confirmedGuests} ({attendancePercentage.toFixed(0)}%)
              </span>
            </div>
            <Progress value={attendancePercentage} />
          </div>

          <div className="flex justify-between items-center mt-2">
            <span className="text-gray-300">Pending</span>
            <span className="font-medium text-amber-400">{pendingGuests}</span>
          </div>
        </CardContent>
        <CardFooter>
          <Link href={`/events/${event._id}/guest`}>
            <Button>Manage Guest</Button>
          </Link>
        </CardFooter>
      </Card>

      {/* Budget Summary Card */}
      <Card className="border-0 bg-green-950 text-white shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-green-100 flex items-center">
            <Wallet className="mr-2" size={20} />
            Budget Summary
          </CardTitle>
          <span className="text-sm text-green-200">
            Total: ₹{budget.allocated.toLocaleString()}
          </span>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-green-100">Spent</span>
              <span className="font-medium text-red-300">
                ₹{budget.spent.toLocaleString()} ({spentPercentage.toFixed(0)}%)
              </span>
            </div>
            <Progress value={spentPercentage} />
          </div>

          <div className="flex justify-between items-center mt-2">
            <span className="text-green-100">Remaining</span>
            <span className="font-medium text-blue-400">
              ₹{remaining.toLocaleString()}
            </span>
          </div>
        </CardContent>
        <CardFooter>
          <Link href={`/events/${event._id}/budget`}>
            <Button>Manage Budget</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default EventOverView;
