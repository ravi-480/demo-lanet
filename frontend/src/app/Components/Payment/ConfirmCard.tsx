"use client";
import { Button } from "@/components/ui/button";
import {
  fetchPaymentStatus,
  initializePayment,
  verifyPayment,
} from "@/store/paymentSlice";
import { useEffect, useState } from "react";
import { AppDispatch, RootState } from "../../../store/store";
import { useDispatch, useSelector } from "react-redux";
import { useSocket } from "@/hooks/useSocket";
import { CheckCircle, AlertCircle, Loader2, IndianRupee } from "lucide-react";

declare global {
  interface Window {
    Razorpay: RazorpayConstructor;
  }
}

// Define the Razorpay types
interface RazorpayConstructor {
  new (options: RazorpayOptions): RazorpayInstance;
}

interface RazorpayInstance {
  on(
    event: string,
    handler: (response: RazorpayPaymentFailedResponse) => void
  ): void;
  open(): void;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpaySuccessResponse) => void;
  prefill: {
    name: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
  notes: {
    eventId: string;
    userId: string;
  };
}

interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayPaymentFailedResponse {
  error: {
    description: string;
  };
}

type Props = { eventId?: string; userId?: string };

const ConfirmCard = ({ eventId, userId }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const { status, amount, currency, errorMessage, userDetails } = useSelector(
    (state: RootState) => state.payment
  );
  const user = useSelector((state: RootState) => state.auth.user);
  const socket = useSocket();
  const [isRazorpayReady, setIsRazorpayReady] = useState(false);

  // Load Razorpay script
  useEffect(() => {
    const loadRazorpayScript = () => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => {
        setIsRazorpayReady(true);
      };
      document.body.appendChild(script);
    };

    loadRazorpayScript();
  }, []);

  // Fetch payment status when component mounts
  useEffect(() => {
    if (eventId && userId) {
      dispatch(fetchPaymentStatus({ eventId, userId }));
    }
  }, [dispatch, eventId, userId]);

  // Notify organizer when payment is confirmed
  useEffect(() => {
    if (status === "confirmed" && socket) {
      socket.emit("notify-organizer", {
        eventId,
        senderId: userId || "guest",
        type: "payment",
        message: `${
          user?.name || userDetails?.name || "Someone"
        } confirmed their payment of ₹${
          amount || userDetails?.amount || "unknown amount"
        } for the event.`,
        metadata: {
          paymentStatus: "confirmed",
          amount: amount || userDetails?.amount || 0,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }, [status, socket, eventId, userId, user, amount, userDetails]);

  // Handle Razorpay payment
  const handleRazorpayPayment = () => {
    if (!eventId || !userId) return;

    const paymentAmount = userDetails?.amount || 0;

    if (paymentAmount <= 0) {
      alert("Payment amount must be greater than 0");
      return;
    }

    // Add loading state
    dispatch({ type: "payment/setLoading" });

    // First initialize the order
    dispatch(initializePayment({ eventId, userId, amount: paymentAmount }))
      .unwrap()
      .then((data) => {
        if (!isRazorpayReady) {
          alert("Razorpay is still loading. Please try again in a moment.");
          return;
        }

        // Make sure we have the correct key
        const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY;
        if (!key) {
          alert("Payment system configuration error. Please contact support.");
          return;
        }

       
        const options = {
          key: key,
          amount: data.amount, // amount in smallest currency unit (paise)
          currency: currency,
          name: "Split App",
          description: `Payment for ${eventId}`,
          order_id: data.id,
          handler: function (response: RazorpaySuccessResponse) {
            // Handle the success callback
            dispatch(
              verifyPayment({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
                eventId: eventId,
                userId: userId,
              })
            );
          },
          prefill: {
            name: user?.name || userDetails?.name || "",
          },
          theme: {
            color: "#6366F1",
          },
          modal: {
            ondismiss: function () {
              // Reset loading state
              dispatch({ type: "payment/resetPaymentStatus" });
            },
          },
          notes: {
            eventId: eventId,
            userId: userId,
          },
        };

        try {
          const rzp = new window.Razorpay(options);

          rzp.on(
            "payment.failed",
            function (response: RazorpayPaymentFailedResponse) {
              alert("Payment failed: " + response.error.description);
              dispatch({ type: "payment/resetPaymentStatus" });
            }
          );

          rzp.open();
        } catch (e) {
console.log(e);

          alert("Failed to open payment window. Please try again.");
          dispatch({ type: "payment/resetPaymentStatus" });
        }
      })
      .catch((e) => {
console.log(e);

        alert("Failed to initialize payment. Please try again.");
        dispatch({ type: "payment/resetPaymentStatus" });
      });
  };

  const renderPaymentStatus = () => {
    switch (status) {
      case "Paid":
        return (
          <div className="flex flex-col items-center justify-center text-green-600 font-medium gap-2">
            <CheckCircle className="w-8 h-8" />
            <p>You have already paid</p>
            {userDetails?.amount && (
              <p className="text-gray-700 mt-2 flex items-center">
                <IndianRupee className="w-4 h-4 mr-1" />
                {userDetails.amount.toFixed(2)}
              </p>
            )}
          </div>
        );
      case "confirmed":
        return (
          <div className="flex flex-col items-center justify-center text-green-600 font-medium gap-2">
            <CheckCircle className="w-8 h-8" />
            <p>Payment confirmed</p>
            {amount && (
              <p className="text-gray-700 mt-2 flex items-center">
                <IndianRupee className="w-4 h-4 mr-1" />
                {amount.toFixed(2)}
              </p>
            )}
          </div>
        );
      case "error":
        return (
          <div className="flex flex-col items-center justify-center text-red-500 font-medium gap-2">
            <AlertCircle className="w-8 h-8" />
            <p>Something went wrong</p>
            <p className="text-xs mt-1">{errorMessage}</p>
          </div>
        );
      default:
        return (
          <div className="space-y-4">
            {userDetails?.amount && (
              <div className="bg-indigo-50 p-4 rounded-lg">
                <p className="text-gray-700">Your share amount</p>
                <p className="text-2xl font-bold text-indigo-700 flex items-center justify-center mt-2">
                  <IndianRupee className="w-5 h-5 mr-1" />
                  {userDetails.amount.toFixed(2)}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <Button
                onClick={handleRazorpayPayment}
                disabled={
                  status === "loading" ||
                  !isRazorpayReady ||
                  !userDetails?.amount
                }
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                {status === "loading" ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <IndianRupee className="w-4 h-4" />
                    Pay with Razorpay
                  </span>
                )}
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-8 text-center border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Payment Details
        </h2>
        <p className="text-md text-gray-600 mb-6">
          Complete your payment for the event split
        </p>

        {renderPaymentStatus()}
      </div>
    </div>
  );
};

export default ConfirmCard;
