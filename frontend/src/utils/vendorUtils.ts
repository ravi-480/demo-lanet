// utils/vendorUtils.ts

import { PricingUnit } from "@/Interface/interface";

// Define a Vendor interface
interface Vendor {
  id?: string;
  name?: string;
  description?: string;
  image?: string;
  price?: number;
  category?: string;
  numberOfGuests?: number;
  pricingUnit?: PricingUnit;
  minGuestLimit?: number;
  [key: string]: any; // For any additional properties
}

// Type for the price generator function
type PriceGenerator = (category: string, isDefault?: boolean) => number;

export const getPriceUnitLabel = (category: string): PricingUnit => {
  const pricingMap: Record<string, PricingUnit> = {
    catering: "per plate",
    photography: "per hour",
    music: "per hour",
    decoration: "flat rate",
    venue: "per day",
    videography: "per hour",
    "lighting/sound": "per setup",
  };

  return pricingMap[category.toLowerCase()] || "flat rate";
};

export const calculateTotalEstimate = (
  priceUnit: PricingUnit,
  price: number,
  units: number,
  guestCount: number,
  category?: string,
  noOfDay?: number
): number => {
  switch (priceUnit) {
    case "per hour":
      return units * price * (noOfDay || 1);
    case "per plate":
      return price * guestCount;
    case "per day":
      if (category?.toLowerCase() === "venue" && noOfDay) {
        return price * noOfDay;
      }
      return units * price;
    default:
      return price;
  }
};

export const checkMinimumGuestRequirement = (
  category: string,
  guestCount: number,
  minGuestLimit?: number
): boolean => {
  if (
    category.toLowerCase() !== "catering" ||
    typeof minGuestLimit !== "number"
  ) {
    return false;
  }

  return guestCount < minGuestLimit;
};

export const generateMinGuestLimit = (): number => {
  const possibleLimits = [10, 20, 40];
  return possibleLimits[Math.floor(Math.random() * possibleLimits.length)];
};

export const enrichVendor = (
  vendor: Vendor,
  matchedCategory: string | null,
  getRandomPrice: PriceGenerator,
  noOfGuest: number
): Vendor => {
  const recommended = !!matchedCategory;
  const isCatering = matchedCategory?.toLowerCase() === "catering";
  const minGuestLimit = isCatering ? generateMinGuestLimit() : undefined;

  // Get pricing unit based on category
  let pricingUnit: PricingUnit = "flat rate";
  if (recommended) {
    if (matchedCategory === "photography") {
      pricingUnit = "per hour";
    } else if (matchedCategory === "catering") {
      pricingUnit = "per plate";
    } else {
      pricingUnit = getPriceUnitLabel(matchedCategory);
    }
  }

  return {
    ...vendor,
    price: getRandomPrice(matchedCategory || "default", !recommended),
    category: recommended ? matchedCategory : "Premium Service",
    numberOfGuests: isCatering ? noOfGuest : 0,
    pricingUnit,
    minGuestLimit,
  };
};
