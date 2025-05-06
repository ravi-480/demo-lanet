"use client";

import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchGuests } from "@/store/rsvpSlice";
import { IEvent } from "../../../Interface/interface";
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
import MyPieChart from "./EventPieChart";
import Link from "next/link";

const EventOverView = ({ event }: { event: IEvent }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { rsvpData, status } = useSelector((state: RootState) => state.rsvp);

  useEffect(() => {
    if (event._id && status === "idle") dispatch(fetchGuests(event._id));
  }, [dispatch, event._id, status]);

  const { budget = { allocated: 0, spent: 0 } } = event;
  const remaining = useMemo(() => budget.allocated - budget.spent, [budget]);

  const totalGuests = rsvpData.length;
  const confirmedGuests = rsvpData.filter(
    (g) => g.status === "Confirmed"
  ).length;
  const pendingGuests = rsvpData.filter((g) => g.status === "Pending").length;

  const attendancePercentage = useMemo(
    () => (totalGuests ? (confirmedGuests / totalGuests) * 100 : 0),
    [totalGuests, confirmedGuests]
  );

  const spentPercentage = useMemo(
    () => (budget.allocated ? (budget.spent / budget.allocated) * 100 : 0),
    [budget]
  );

  return (
    <div className="grid gap-6 p-8">
      <div style={{ minHeight: "300px" }}>
        <MyPieChart event={event} rsvpData={rsvpData} />
      </div>

      {/* Guest Summary Card */}
      <Card
        className="border-0 bg-gray-800 text-white shadow-lg"
        role="region"
        aria-label="Guest Summary"
      >
        <CardHeader className="flex justify-between items-center pb-2">
          <CardTitle className="text-cyan-400 flex items-center">
            <Users className="mr-2" size={20} />
            Guest Summary
          </CardTitle>
          <span className="text-sm text-gray-400">Total: {totalGuests}</span>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-gray-300">Confirmed</span>
              <span className="text-green-400 font-medium">
                {confirmedGuests} ({attendancePercentage.toFixed(0)}%)
              </span>
            </div>
            <Progress
              value={attendancePercentage}
              aria-label="Confirmed guests progress"
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-gray-300">Pending</span>
            <span className="text-amber-400 font-medium">{pendingGuests}</span>
          </div>
        </CardContent>

        <CardFooter>
          <Link href={`/events/${event._id}/guest`}>
            <Button aria-label="Manage guest list">Manage Guest</Button>
          </Link>
        </CardFooter>
      </Card>

      {/* Budget Summary Card */}
      <Card
        className="border-0 bg-gray-800 text-white shadow-lg"
        role="region"
        aria-label="Budget Summary"
      >
        <CardHeader className="flex justify-between items-center pb-2">
          <CardTitle className="text-cyan-400 flex items-center">
            <Wallet className="mr-2" size={20} />
            Budget Summary
          </CardTitle>
          <span className="text-sm text-green-500">
            Total: ₹{budget.allocated.toLocaleString()}
          </span>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span>Spent</span>
              <span className="text-red-500 font-medium">
                ₹{budget.spent.toLocaleString()} ({spentPercentage.toFixed(0)}%)
              </span>
            </div>
            <Progress
              value={spentPercentage}
              aria-label="Spent budget progress"
            />
          </div>
          <div className="flex justify-between mt-2">
            <span>Remaining</span>
            <span className="text-blue-400 font-medium">
              ₹{remaining.toLocaleString()}
            </span>
          </div>
        </CardContent>

        <CardFooter>
          <Link href={`/events/${event._id}/budget`}>
            <Button aria-label="Manage budget">Manage Budget</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default EventOverView;
