import { PricingUnit, VendorType } from "@/Interface/interface";

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
    "lighting/sound": "flat rate",
  };

  return pricingMap[category.toLowerCase()] || "flat rate";
};

export const calculateTotalEstimate = (
  priceUnit: PricingUnit,
  price: number,
  units: number,
  guestCount: number,
  category?: string,
  noOfDay: number = 1
): number => {
  if (!price) return 0;

  switch (priceUnit) {
    case "per plate":
      // For catering, multiply by guests and number of days
      // Most events serve food each day of the event
      return price * guestCount * noOfDay;

    case "per hour":
      // For hourly services, multiply by hours per day and number of days
      return price * units * noOfDay;

    case "per day":
      // For daily services, multiply by number of days (units represents selected days)
      return price * (category?.toLowerCase() === "venue" ? noOfDay : units);

    case "flat rate":
      // For flat rate services, apply a multiplier for multiple days
      if (
        ["decoration", "lighting/sound"].includes(category?.toLowerCase() || "")
      ) {
        // These services typically need setup once but might have maintenance costs
        // Base price + 30% additional for each extra day
        return price * (1 + (noOfDay - 1) * 0.3);
      }
      // For other flat rate services, no additional cost for multiple days
      return price;

    case "per setup":
      // Handle per setup pricing - typically a one-time charge
      return price;

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
  const possibleLimits = [10, 20, 30, 40, 50];
  return possibleLimits[Math.floor(Math.random() * possibleLimits.length)];
};

export const enrichVendor = (
  vendor: VendorType,
  matchedCategory: string | null,
  getRandomPrice: PriceGenerator,
  noOfGuest: number
): VendorType => {
  const recommended = !!matchedCategory;

  // Normalize the category to lowercase for comparison
  const normalizedCategory = matchedCategory?.toLowerCase() || "";
  const isCatering = normalizedCategory === "catering";

  // Generate minimum guest limit for catering services
  const minGuestLimit = isCatering ? generateMinGuestLimit() : undefined;

  // Get pricing unit based on category
  let pricingUnit: PricingUnit = "flat rate";
  if (recommended) {
    // Now using getPriceUnitLabel for all categories for consistency
    pricingUnit = getPriceUnitLabel(matchedCategory || "");
  }

  // Some search terms might map to specific categories
  let category = recommended ? matchedCategory : "Premium Service";

  // Map common search terms to categories
  const categoryMapping: Record<string, string> = {
    photographer: "photography",
    photo: "photography",
    pictures: "photography",
    caterer: "catering",
    food: "catering",
    meal: "catering",
    decorator: "decoration",
    decor: "decoration",
    dj: "music",
    band: "music",
    musician: "music",
    singer: "music",
    videographer: "videography",
    video: "videography",
    lighting: "lighting/sound",
    sound: "lighting/sound",
    audio: "lighting/sound",
    hall: "venue",
    hotel: "venue",
    garden: "venue",
    location: "venue",
  };

  if (normalizedCategory in categoryMapping) {
    category = categoryMapping[normalizedCategory];
    pricingUnit = getPriceUnitLabel(category);
  }

  return {
    ...vendor,
    price: getRandomPrice(category || "default", !recommended),
    category,
    numberOfGuests: isCatering ? noOfGuest : 0,
    pricingUnit,
    minGuestLimit,
  };
};
