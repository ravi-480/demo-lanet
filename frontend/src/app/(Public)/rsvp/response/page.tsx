"use client";

import axios, { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Check, TriangleAlert } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface EventData {
  _id: string;
  name: string;
  date: string;
  location: string;
  responseStatus: string;
  description: string;
  image?: string;
  eventType: string;
}

interface ApiResponse {
  guest: EventData;
  message?: string;
}

interface ApiErrorData {
  success: boolean;
  message: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function RSVPRespond() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");
  const guestId = searchParams.get("guestId");

  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<EventData | null>(null);
  const [error, setError] = useState("");
  const [response, setResponse] = useState<"accept" | "decline" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showRespondAgain, setShowRespondAgain] = useState(false);

  useEffect(() => {
    const validateRSVP = async () => {
      if (!eventId || !guestId) {
        setError("Invalid RSVP link.");
        setLoading(false);
        return;
      }

      try {
        const { data } = await axios.get<ApiResponse>(
          `${API_BASE_URL}/guest/rsvp/validate`,
          { params: { eventId, guestId } }
        );

        setEvent(data.guest);
      } catch (err) {
        const error = err as AxiosError<ApiErrorData>;
        setError(error.response?.data?.message || "Invalid RSVP link.");
      } finally {
        setLoading(false);
      }
    };

    validateRSVP();
  }, [eventId, guestId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!response) return;

    setSubmitting(true);

    try {
      await axios.post<ApiResponse>(`${API_BASE_URL}/guest/rsvp/respond`, {
        eventId,
        guestId,
        attending: response === "accept",
      });

      setSuccess(true);
    } catch (err) {
      const error = err as AxiosError<ApiErrorData>;
      setError(
        error.response?.data?.message || "Failed to submit your response."
      );
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (event?.responseStatus === "Confirmed") {
      setResponse("accept");
    } else if (event?.responseStatus === "Declined") {
      setResponse("decline");
    }
  }, [event]);

  const handleRespondAgain = () => {
    setShowRespondAgain(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invitation details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg flex flex-col items-center shadow-md p-8 max-w-md w-full">
          <div className="text-red-500 text-center mb-4">
            <TriangleAlert size={24} />
          </div>
          <h2 className="text-xl font-bold text-center text-gray-800 mb-4">
            Error
          </h2>
          <p className="text-gray-600 text-center">{error}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-md p-8 flex flex-col items-center max-w-md w-full">
          <div className="text-green-500 mb-4">
            <Check size={24} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Thank You!</h2>
          <p className="text-gray-600 text-center mb-6">
            Your response has been successfully submitted.
            {response === "accept"
              ? " We look forward to seeing you at the event!"
              : " We're sorry you won't be able to join us, but appreciate your response."}
          </p>
          <p className="text-sm text-gray-500">
            You can close this window now.
          </p>
        </div>
      </div>
    );
  }

  if (
    (event?.responseStatus === "Confirmed" ||
      event?.responseStatus === "Declined") &&
    !showRespondAgain
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white rounded-lg shadow-md p-8 flex flex-col items-center max-w-md w-full">
          <div className="text-blue-500 mb-4">
            <Check size={24} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            You&apos;ve Already Responded
          </h2>
          <p className="text-gray-600 text-center mb-6">
            You have already{" "}
            {event.responseStatus === "Confirmed" ? "accepted" : "declined"}{" "}
            this invitation.
          </p>
          <Button
            onClick={handleRespondAgain}
            className="w-full py-4 px-4 rounded-md text-white font-medium focus:outline-none"
          >
            Submit Another Response
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyan-100 py-12 px-4">
      <div className="max-w-md mx-auto mt-10 bg-gray-100 rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-700 mb-1">
              <span className="font-medium">Date:</span>{" "}
              {event?.date &&
                new Date(event.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
            </p>
            <p className="text-gray-700 mb-1">
              <span className="font-medium">Location:</span> {event?.location}
            </p>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Hello, {event?.name || "Guest"}!
            </h2>
            <p className="text-gray-700 mb-6">
              Please let us know if you&apos;ll be attending.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <div className="flex flex-col space-y-3">
                  <button
                    type="button"
                    onClick={() => setResponse("accept")}
                    className={`py-3 px-4 rounded-md text-sm font-medium focus:outline-none transition-colors ${
                      response === "accept"
                        ? "bg-green-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Yes, I&apos;ll be there
                  </button>

                  <button
                    type="button"
                    onClick={() => setResponse("decline")}
                    className={`py-3 px-4 rounded-md text-sm font-medium focus:outline-none transition-colors ${
                      response === "decline"
                        ? "bg-red-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    No, I can&apos;t make it
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={response === null || submitting}
                className="w-full py-5 px-4 rounded-md text-white font-medium focus:outline-none"
              >
                {submitting ? "Submitting..." : "Submit Response"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
