"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDispatch } from "react-redux";
import { createVendor } from "@/store/vendorSlice";
import { AppDispatch } from "@/store/store";
import { toast } from "sonner";

type VendorCardProps = {
  vendor: any;
  category: string;
  pricingUnit?: string;
  numberOfGuests?: number;
  eventId?: string;
  noOfAddedGuest: number;
  addedBy?: string;
  noOfDay?: number; // Added prop for event duration in days
};

const getPriceUnitLabel = (category: string) => {
  const pricingMap: Record<string, string> = {
    catering: "per plate",
    photography: "per hour",
    music: "per hour",
    decoration: "flat rate",
    venue: "per day",
    videography: "per hour",
    "lighting/sound": "per setup",
  };

  return pricingMap[category.toLowerCase()] || "price";
};

const VendorCard = ({
  vendor,
  category,
  pricingUnit,
  noOfAddedGuest,
  numberOfGuests = 50,
  eventId,
  addedBy,
  noOfDay = 1, // Default to 1 day if not provided
}: VendorCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [units, setUnits] = useState("1");
  const [error, setError] = useState<string | null>(null);

  const priceUnit = pricingUnit || getPriceUnitLabel(category);
  const price = vendor.price || Math.floor(Math.random() * 500 + 100);

  const checkNoOfGuest =
    noOfAddedGuest > numberOfGuests ? noOfAddedGuest : numberOfGuests;

  // Calculate total estimate based on pricing unit
  const totalEstimate =
    priceUnit === "per hour"
      ? Number(units) * price
      : priceUnit === "per plate"
      ? price * checkNoOfGuest
      : priceUnit === "per day"
      ? Number(units) * price
      : price;

  // Validate units when it changes or dialog opens
  useEffect(() => {
    if (priceUnit === "per day" && Number(units) > noOfDay) {
      setError(
        `Cannot book for more than the event duration (${noOfDay} day${
          noOfDay > 1 ? "s" : ""
        })`
      );
    } else {
      setError(null);
    }
  }, [units, priceUnit, noOfDay]);

  const dispatch = useDispatch<AppDispatch>();

  const handleConfirmAdd = async () => {
    if (!eventId || !addedBy) return;

    // Validate before submitting
    if (priceUnit === "per day" && Number(units) > noOfDay) {
      toast.error(
        `Cannot book for more than the event duration (${noOfDay} days)`
      );
      return;
    }

    const adjustedPrice =
      priceUnit === "per hour"
        ? Number(units) * price
        : priceUnit === "per plate"
        ? price * checkNoOfGuest
        : priceUnit === "per day"
        ? Number(units) * price
        : price;

    const vendorData = {
      event: eventId,
      title: vendor.title || "Untitled",
      type: vendor.type || category,
      address: vendor.address || "No address provided",
      rating: vendor.rating || 0,
      description: vendor.description || "",
      website: vendor.links?.website || "",
      directionsLink: vendor.links?.directions || "",
      placeId: vendor.place_id || vendor.placeId || "",
      phone: vendor.phone || "",
      price: adjustedPrice,
      pricingUnit: priceUnit,
      category,
      numberOfGuests: checkNoOfGuest,
      addedBy,
      days: priceUnit === "per day" ? Number(units) : undefined, // Add days information for per day pricing
    };

    const data = await dispatch(createVendor(vendorData));

    if (createVendor.fulfilled.match(data)) {
      toast.success("Vendor added successfully!");
      setShowDialog(false);
    } else if (createVendor.rejected.match(data)) {
      toast.error(`Error: ${data.payload}`);
    }
  };

  return (
    <>
      <Card className="rounded-xl shadow-md">
        <CardHeader className="flex items-start gap-4">
          {vendor.thumbnail && (
            <Image
              src={vendor.thumbnail}
              alt={vendor.title}
              className="w-16 h-16 rounded-md object-cover border"
              width={64}
              height={64}
            />
          )}
          <div>
            <CardTitle>{vendor.title}</CardTitle>
            <CardDescription>{vendor.address}</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {vendor.description || "No description available."}
          </p>
          <div className="text-sm text-gray-500">
            ⭐ {vendor.rating || 0} ({vendor.reviews || 0} reviews)
          </div>
          <div className="text-sm text-gray-500">
            Est. ₹{price.toLocaleString()} {priceUnit}
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? "Hide Details" : "See Full Details"}
          </Button>
          <Button onClick={() => setShowDialog(true)} size="sm">
            Add Vendor
          </Button>
        </CardFooter>

        {showDetails && (
          <CardContent className="text-sm text-muted-foreground space-y-1 pt-2">
            <div>
              <strong>Type:</strong> {vendor.type || category}
            </div>
            <div>
              <strong>Hours:</strong> {vendor.hours || "Contact for details"}
            </div>
            {vendor.links?.directions && (
              <div>
                <a
                  href={vendor.links.directions}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Get Directions
                </a>
              </div>
            )}
            {vendor.links?.website && (
              <div>
                <a
                  href={vendor.links.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Visit Website
                </a>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="text-black">
          <DialogHeader>
            <DialogTitle>Add Vendor Confirmation</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <p>
              <strong>{vendor.title}</strong> – ₹{price.toLocaleString()}{" "}
              {priceUnit}
            </p>

            {priceUnit === "per hour" ? (
              <>
                <Label htmlFor="units">Enter hours</Label>
                <Input
                  id="units"
                  type="number"
                  value={units}
                  onChange={(e) => setUnits(e.target.value)}
                  min={1}
                />
                <p className="text-muted-foreground">
                  Estimated Total: ₹{totalEstimate.toLocaleString()}
                </p>
              </>
            ) : priceUnit === "per day" ? (
              <>
                <Label htmlFor="units">Enter days</Label>
                <Input
                  id="units"
                  type="number"
                  value={units}
                  onChange={(e) => setUnits(e.target.value)}
                  min={1}
                  max={noOfDay}
                  className={error ? "border-red-500" : ""}
                />
                {error && <p className="text-red-500 text-xs">{error}</p>}
                <p className="text-muted-foreground">
                  Estimated Total: ₹{totalEstimate.toLocaleString()}
                </p>
                <p className="text-xs text-blue-500">
                  Note: Event duration is {noOfDay} day{noOfDay > 1 ? "s" : ""}
                </p>
              </>
            ) : priceUnit === "per plate" ? (
              <p>
                Approx cost for <strong>{checkNoOfGuest}</strong> guests:
                <strong> ₹{totalEstimate.toLocaleString()}</strong>
              </p>
            ) : (
              <p>
                Flat rate cost:
                <strong> ₹{totalEstimate.toLocaleString()}</strong>
              </p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleConfirmAdd} disabled={!!error}>
              Confirm Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VendorCard;
