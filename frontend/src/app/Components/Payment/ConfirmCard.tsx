"use client";
import { Button } from "@/components/ui/button";
import { confirmPayment, fetchPaymentStatus } from "@/store/paymentSlice";
import { useEffect } from "react";
import { AppDispatch, RootState } from "../../../store/store";
import { useDispatch, useSelector } from "react-redux";
import { useSocket } from "@/hooks/useSocket";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

type Props = { eventId?: string; userId?: string };

const ConfirmCard = ({ eventId, userId }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const { status } = useSelector((state: RootState) => state.payment);
  const user = useSelector((state: RootState) => state.auth.user);
  const socket = useSocket();

  useEffect(() => {
    if (eventId && userId) {
      dispatch(fetchPaymentStatus({ eventId, userId }));
    }
  }, [dispatch, eventId, userId]);

  useEffect(() => {
    if (status === "confirmed" && socket) {
      socket.emit("notify-organizer", {
        eventId,
        senderId: userId || "guest",
        type: "payment",
        message: `${
          user?.name || "Someone"
        } confirmed their payment for the event.`,
        metadata: {
          paymentStatus: "confirmed",
          amount: "split amount",
          timestamp: new Date().toISOString(),
        },
      });
    }
  }, [status, socket, eventId, userId, user]);

  const handleConfirm = () => {
    if (eventId && userId) {
      dispatch(confirmPayment({ eventId, userId }));
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-8 text-center border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Confirm Your Split
        </h2>
        <p className="text-md text-gray-600 mb-6">
          Tap below to confirm your payment distribution for the event.
        </p>

        {status === "Paid" ? (
          <div className="flex items-center justify-center text-green-600 font-medium gap-2">
            <CheckCircle className="w-5 h-5" />
            You have already paid
          </div>
        ) : status === "confirmed" ? (
          <div className="flex items-center justify-center text-green-600 font-medium gap-2">
            <CheckCircle className="w-5 h-5" />
            Payment confirmed
          </div>
        ) : status === "error" ? (
          <div className="flex items-center justify-center text-red-500 font-medium gap-2">
            <AlertCircle className="w-5 h-5" />
            Something went wrong
          </div>
        ) : (
          <Button
            onClick={handleConfirm}
            disabled={status === "loading"}
            className="w-full mt-4"
          >
            {status === "loading" ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Confirming...
              </span>
            ) : (
              "Confirm Payment"
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ConfirmCard;
