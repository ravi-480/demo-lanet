"use client";
import { Button } from "@/components/ui/button";
import { confirmPayment, fetchPaymentStatus } from "@/store/paymentSlice";
import { useEffect } from "react";
import { AppDispatch } from "../../../store/store";
import { useDispatch, useSelector } from "react-redux";

type Props = { eventId?: string; userId?: string };

const ConfirmCard = ({ eventId, userId }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const { status, errorMessage } = useSelector((state: any) => state.payment);

  useEffect(() => {
    if (eventId && userId) {
      dispatch(fetchPaymentStatus({ eventId, userId }));
    }
  }, [dispatch, eventId, userId]);

  const handleConfirm = async () => {
    if (eventId && userId) {
      dispatch(confirmPayment({ eventId, userId }));
    }
  };
  return (
    <div className="bg-gray-700 max-w-sm rounded-2xl w-full text-center p-4 ">
      <h2 className="text-2xl font-bold mb-2">Confirm You split</h2>

      <p className="mb-4 text-gray-400">
        Click below to confirm your distribution
      </p>

      {status == "Paid" ? (
        <p className="text-green-500 font-semibold">You have Already Paid</p>
      ) : status == "confirmed" ? (
        <p className="text-green-500 font-semibold">Payment Confirmed</p>
      ) : status == "error" ? (
        <p className="text-red-500 font-semibold"> Sometihing Went Wrong</p>
      ) : (
        <Button onClick={handleConfirm}>
          {status == "loading" ? "Confirming..." : "Confirm Payement"}
        </Button>
      )}
    </div>
  );
};

export default ConfirmCard;
