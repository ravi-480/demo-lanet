"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { AppDispatch } from "@/store/store";
import { createVendor } from "@/store/vendorSlice";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  calculateTotalEstimate,
  checkMinimumGuestRequirement,
} from "@/utils/vendorUtils";
import { VendorCardProps } from "@/Interface/interface";
import { fetchById } from "@/store/eventSlice";

const VendorCard = ({
  vendor,
  category,
  pricingUnit,
  noOfAddedGuest,
  numberOfGuests = 50,
  eventId,
  addedBy,
  noOfDay = 1,
  minGuestLimit,
}: VendorCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [units, setUnits] = useState("1");
  const [localNoOfDay, setLocalNoOfDay] = useState<number>(noOfDay);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch<AppDispatch>();

  const priceUnit = vendor.pricingUnit || pricingUnit;
  const price = vendor.price;
  const checkNoOfGuest = Math.max(noOfAddedGuest, numberOfGuests);

  const isBelowMinGuestLimit = checkMinimumGuestRequirement(
    category,
    checkNoOfGuest,
    minGuestLimit
  );

  // Calculate total estimate
  const totalEstimate = calculateTotalEstimate(
    priceUnit,
    price,
    Number(units),
    checkNoOfGuest,
    category,
    localNoOfDay
  );

  useEffect(() => {
    if (localNoOfDay > noOfDay) {
      setError(
        `Cannot book for more than ${noOfDay} day${
          noOfDay > 1 ? "s" : ""
        } (event duration)`
      );
    } else if (
      priceUnit === "per hour" &&
      Number(units) * localNoOfDay > localNoOfDay * 24
    ) {
      setError(`Cannot book for more than 24 hours per day`);
    } else if (priceUnit === "per day" && Number(units) > localNoOfDay) {
      setError(
        `Cannot book for more than ${localNoOfDay} day${
          localNoOfDay > 1 ? "s" : ""
        }`
      );
    } else if (isBelowMinGuestLimit) {
      setError(
        `This vendor requires a minimum of ${minGuestLimit} guests (you have ${checkNoOfGuest})`
      );
    } else {
      setError(null);
    }
  }, [
    units,
    localNoOfDay,
    isBelowMinGuestLimit,
    minGuestLimit,
    checkNoOfGuest,
    noOfDay,
    priceUnit,
  ]);

  const handleLocalNoOfDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setLocalNoOfDay(value > 0 ? value : 1);
  };

  const handleUnitsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUnits(value);
  };

  const handleConfirmAdd = async () => {
    if (!eventId || !addedBy) return;

    // Use the same validation as in useEffect
    if (localNoOfDay > noOfDay) {
      toast.error(
        `Cannot book for more than ${noOfDay} day${
          noOfDay > 1 ? "s" : ""
        } (event duration)`
      );
      return;
    }

    if (
      priceUnit === "per hour" &&
      Number(units) * localNoOfDay > localNoOfDay * 24
    ) {
      toast.error(`Cannot book for more than 24 hours per day`);
      return;
    }

    if (priceUnit === "per day" && Number(units) > localNoOfDay) {
      toast.error(
        `Cannot book for more than ${localNoOfDay} day${
          localNoOfDay > 1 ? "s" : ""
        }`
      );
      return;
    }

    if (isBelowMinGuestLimit) {
      toast.error(
        `This vendor requires a minimum of ${minGuestLimit} guests (you have ${checkNoOfGuest})`
      );
      return;
    }

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
      price: totalEstimate,
      pricingUnit: priceUnit,
      category,
      numberOfGuests: checkNoOfGuest,
      addedBy,
      days: priceUnit === "per hour" ? Number(units) : Number(units),
      eventDuration: localNoOfDay,
      minGuestLimit,
    };

    try {
      await dispatch(createVendor(vendorData)).unwrap();
      await dispatch(fetchById(eventId));
      setShowDialog(false);
    } catch (error) {
      console.log(error);
    }
  };

  const renderDialogContent = () => (
    <div className="space-y-2 text-gray-300 text-sm">
      <p>
        <strong>{vendor.title}</strong> – ₹{price.toLocaleString()} {priceUnit}
      </p>

      {priceUnit === "per hour" && (
        <>
          <Label htmlFor="units">Enter hours per day</Label>
          <Input
            id="units"
            type="number"
            value={units}
            onChange={handleUnitsChange}
            min={1}
            max={24}
            className={Number(units) > 24 ? "border-red-500" : ""}
          />
        </>
      )}

      <Label htmlFor="days">Enter number of days</Label>
      <Input
        id="days"
        type="number"
        value={localNoOfDay}
        onChange={handleLocalNoOfDayChange}
        min={1}
        max={localNoOfDay}
        className={localNoOfDay > noOfDay ? "border-red-500" : ""}
      />

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

      <p className="text-muted-foreground">
        Estimated Total: ₹{totalEstimate.toLocaleString()}
      </p>

      <p className="text-xs text-red-400">
        Note: Event max duration is {noOfDay} day{noOfDay > 1 ? "s" : ""}
      </p>

      {minGuestLimit && category.toLowerCase() === "catering" && (
        <p className="text-xs text-cyan-400">
          Minimum requirement: {minGuestLimit} guests
        </p>
      )}
    </div>
  );

  return (
    <>
      <Card className="rounded-xl bg-gray-800 shadow-md">
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
            <CardTitle className="text-white">{vendor.title}</CardTitle>
            <CardDescription className="text-gray-200">
              {vendor.address}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-2">
          <p className="text-sm text-gray-300">
            {vendor.description || "No description available."}
          </p>
          <div className="text-sm text-gray-400">
            ⭐ {vendor.rating || 0} ({vendor.reviews || 0} reviews)
          </div>
          <div className="text-sm text-gray-400">
            Est. ₹{price.toLocaleString()} {priceUnit}
            {minGuestLimit && category.toLowerCase() === "catering" && (
              <span
                className={`ml-2 text-sm ${
                  isBelowMinGuestLimit ? "text-red-400" : "text-cyan-500"
                }`}
              >
                Min. {minGuestLimit} guests required
              </span>
            )}
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
          <Button
            onClick={() => setShowDialog(true)}
            size="sm"
            disabled={isBelowMinGuestLimit}
          >
            Add Vendor
          </Button>
        </CardFooter>

        {showDetails && (
          <CardContent className="text-sm text-gray-300 space-y-1 pt-2">
            <div>
              <strong>Type:</strong> {vendor.type || category}
            </div>
            <div>
              <strong>Hours:</strong> {vendor.hours || "Contact for details"}
            </div>
            {category.toLowerCase() === "catering" && minGuestLimit && (
              <div>
                <strong>Minimum Guests:</strong> {minGuestLimit}
              </div>
            )}
            {vendor.links?.directions && (
              <div>
                <a
                  href={vendor.links.directions}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline"
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
        <DialogContent className="text-white">
          <DialogHeader>
            <DialogTitle>Add Vendor Confirmation</DialogTitle>
          </DialogHeader>
          {renderDialogContent()}
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
