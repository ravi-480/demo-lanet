"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import api from "@/utils/api";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import axios from "axios";

interface VendorData {
  id: string;
  title: string;
  category: string;
  price: number;
  description?: string;
}

interface EventData {
  id: string;
  name: string;
  date: string;
  location?: string;
  description?: string;
}

type ResponseStatusType = "success" | "error" | null;

const VendorResponsePage = () => {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [responseStatus, setResponseStatus] =
    useState<ResponseStatusType>(null);
  const [vendorData, setVendorData] = useState<VendorData | null>(null);
  const [eventData, setEventData] = useState<EventData | null>(null);

  // Extract URL parameters
  const vendorId = searchParams.get("vendorId");
  const eventId = searchParams.get("eventId");
  const userId = searchParams.get("userId");
  const response = searchParams.get("response");
  const isNegotiating = searchParams.get("isNegotiating") === "true";
  const negotiatedPrice = searchParams.get("negotiatedPrice")
    ? parseFloat(searchParams.get("negotiatedPrice")!)
    : null;

  useEffect(() => {
    const validateAndLoadData = async () => {
      if (!vendorId || !eventId || !userId || !response) {
        setLoading(false);
        setResponseStatus("error");
        return;
      }

      try {
        const vendorResponse = await axios.get(`/vendors/${vendorId}`);
        const eventResponse = await axios.get(`/events/${eventId}`);

        setVendorData(vendorResponse.data.vendor);
        setEventData(eventResponse.data.event);
        setLoading(false);
      } catch (error) {
        console.log("Error loading data:", error);
        setLoading(false);
        setResponseStatus("error");
      }
    };

    validateAndLoadData();
  }, [vendorId, eventId, userId, response]);

  const handleResponse = async (action: string) => {
    if (!vendorId || !eventId || !userId) return;

    setProcessing(true);
    try {
      let finalPrice = vendorData?.price || 0;
      if (action === "acceptNegotiated" && negotiatedPrice) {
        finalPrice = negotiatedPrice;
      }

      await api.post("/vendors/response", {
        vendorId,
        eventId,
        userId,
        response: action,
        finalPrice,
      });

      setResponseStatus("success");
      toast.success(
        action === "decline"
          ? "You have declined this request"
          : "You have accepted this request"
      );
    } catch (error) {
      console.log("Error processing response:", error);
      setResponseStatus("error");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (responseStatus === "error" || !vendorData || !eventData) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center">
              <XCircle className="h-6 w-6 mr-2" />
              Error
            </CardTitle>
            <CardDescription>
              We encountered an issue processing your request
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              The link you used may have expired or is invalid. Please contact
              the person who sent you this request for assistance.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => window.close()}>Close Window</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (responseStatus === "success") {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle className="text-success flex items-center">
              <CheckCircle className="h-6 w-6 mr-2" />
              Response Submitted
            </CardTitle>
            <CardDescription>
              Your response has been successfully recorded
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Thank you for your response. The event organizer has been
              notified. You may close this window.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => window.close()}>Close Window</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Vendor Request</CardTitle>
          <CardDescription>
            {isNegotiating ? "Price Negotiation Request" : "Inquiry"} for{" "}
            {eventData.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Event Details</h3>
            <p className="text-sm text-muted-foreground">
              {new Date(eventData.date).toLocaleDateString()}
            </p>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium">Vendor Details</h3>
            <p className="text-sm">
              <span className="font-medium">Name:</span> {vendorData.title}
            </p>
            <p className="text-sm">
              <span className="font-medium">Category:</span>{" "}
              {vendorData.category}
            </p>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium">Pricing Information</h3>
            <p className="text-sm">
              <span className="font-medium">Original Price:</span> ₹
              {vendorData.price}
            </p>
            {isNegotiating && negotiatedPrice && (
              <p className="text-sm">
                <span className="font-medium">Proposed Price:</span> ₹
                {negotiatedPrice}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-stretch space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          {response === "acceptOriginal" ? (
            <Button
              className="w-full"
              onClick={() => handleResponse("acceptOriginal")}
              disabled={processing}
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Accept Original Price (₹${vendorData.price})`
              )}
            </Button>
          ) : response === "acceptNegotiated" &&
            isNegotiating &&
            negotiatedPrice ? (
            <Button
              className="w-full"
              onClick={() => handleResponse("acceptNegotiated")}
              disabled={processing}
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Accept Negotiated Price (₹${negotiatedPrice})`
              )}
            </Button>
          ) : response === "decline" ? (
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => handleResponse("decline")}
              disabled={processing}
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Decline Request"
              )}
            </Button>
          ) : (
            <p className="text-destructive">Invalid response type</p>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default VendorResponsePage;
