"use client";
import { Button } from "@/components/ui/button";
import { confirmPayment, fetchPaymentStatus } from "@/store/paymentSlice";
import { useEffect } from "react";
import { AppDispatch } from "../../../store/store";
import { useDispatch, useSelector } from "react-redux";
import { useSocket } from "@/hooks/useSocket";

type Props = { eventId?: string; userId?: string };

const ConfirmCard = ({ eventId, userId }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const { status } = useSelector((state: any) => state.payment);
  const user = useSelector((state: any) => state.auth.user);
  const socket = useSocket();

  useEffect(() => {
    if (eventId && userId) {
      dispatch(fetchPaymentStatus({ eventId, userId }));
    }
  }, [dispatch, eventId, userId]);

  useEffect(() => {
    if (status === "confirmed" && socket) {
      console.log("Sending notification via socket...");

      // Send notification to the event organizer even if not logged in
      socket.emit("notify-organizer", {
        eventId,
        senderId: userId || "guest",
        type: "payment",
        message: `${
          user?.name || "Someone"
        } confirmed their payment for the event.`,
        metadata: {
          paymentStatus: "confirmed",
          amount: user?.amount || "split amount",
          timestamp: new Date().toISOString(),
        },
      });
    }
  }, [status, socket, eventId, userId, user]);

  const handleConfirm = async () => {
    if (eventId && userId) {
      dispatch(confirmPayment({ eventId, userId }));
    }
  };

  return (
    <div className="bg-gray-700 max-w-sm rounded-2xl w-full text-center p-4">
      <h2 className="text-2xl font-bold mb-2">Confirm Your Split</h2>
      <p className="mb-4 text-gray-400">
        Click below to confirm your distribution
      </p>

      {status === "Paid" ? (
        <p className="text-green-500 font-semibold">You have Already Paid</p>
      ) : status === "confirmed" ? (
        <p className="text-green-500 font-semibold">Payment Confirmed</p>
      ) : status === "error" ? (
        <p className="text-red-500 font-semibold">Something Went Wrong</p>
      ) : (
        <Button onClick={handleConfirm}>
          {status === "loading" ? "Confirming..." : "Confirm Payment"}
        </Button>
      )}
    </div>
  );
};

export default ConfirmCard;
