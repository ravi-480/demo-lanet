import mongoose from "mongoose";
import XLSX from "xlsx";
import Guest from "../models/rsvpSchema";
import Event from "../models/eventModel";
import Vendor from "../models/vendorModel";
import { sendEmail } from "./emailService";
import { createNotification, formatEmailTemplate } from "../utils/helper";

// Reusable function to get event by ID
export const getEventById = async (eventId: string) => {
  return await Event.findById(eventId);
};

// Reusable function to check if adding guests would exceed the limit
export const checkGuestLimit = async (
  eventId: string,
  additionalGuestCount: number
) => {
  const event = await getEventById(eventId);
  if (!event) {
    throw new Error("Event not found");
  }

  const currentGuestCount = event.noOfGuestAdded || 0;
  const guestLimit = event.guestLimit || 0;
  const potentialTotalGuests = currentGuestCount + additionalGuestCount;

  // If adding these guests would exceed the limit, reject the addition
  if (guestLimit > 0 && potentialTotalGuests > guestLimit) {
    return {
      exceedsLimit: true,
      currentCount: currentGuestCount,
      limit: guestLimit,
      potentialTotal: potentialTotalGuests,
      additionalAllowed: Math.max(0, guestLimit - currentGuestCount),
    };
  }

  return {
    exceedsLimit: false,
    currentCount: currentGuestCount,
    limit: guestLimit,
    potentialTotal: potentialTotalGuests,
  };
};

// Reusable function to handle vendor price updates for guest count changes
export const updateVendorPrices = async (
  eventId: string,
  guestCountChange: number,
  currentGuestCount: number
) => {
  const vendors = await Vendor.find({
    event: eventId,
    pricingUnit: "per plate",
  });

  let totalCostChange = 0;
  const updatedVendors = [];
  const violatingVendors = [];

  for (const vendor of vendors) {
    const perPlatePrice = vendor.price / vendor.numberOfGuests;

    // For removing guests (negative guestCountChange)
    if (
      guestCountChange < 0 &&
      vendor.minGuestLimit &&
      currentGuestCount < vendor.minGuestLimit
    ) {
      violatingVendors.push({
        id: vendor._id,
        title: vendor.title,
        minGuestLimit: vendor.minGuestLimit,
      });

      continue; // Skip price update for this vendor
    }

    // Calculate new price
    const priceChange = perPlatePrice * guestCountChange;
    const newPrice = Math.max(0, vendor.price + priceChange);
    const newGuestCount = Math.max(0, vendor.numberOfGuests + guestCountChange);

    // Update vendor
    await Vendor.findByIdAndUpdate(vendor._id, {
      price: newPrice,
      numberOfGuests: newGuestCount,
    });

    totalCostChange += priceChange;

    updatedVendors.push({
      id: vendor._id,
      title: vendor.title,
      priceChange,
      newPrice,
    });
  }

  return {
    totalCostChange,
    updatedVendors,
    violatingVendors,
  };
};

// Reusable function to update event budget
export const updateEventBudget = async (
  eventId: string,
  costChange: number
) => {
  if (costChange === 0) return;

  const event = await getEventById(eventId);
  if (!event) return;

  const currentBudgetSpent = event.budget?.spent || 0;
  const newBudgetSpent = Math.max(0, currentBudgetSpent + costChange);

  await Event.findByIdAndUpdate(
    eventId,
    { "budget.spent": newBudgetSpent },
    { new: true }
  );

  return newBudgetSpent;
};

// Process guests from an Excel file
export const processGuestsFromFile = async (
  eventId: string,
  fileBuffer: Buffer
) => {
  // Process the Excel file
  const workBook = XLSX.read(fileBuffer, { type: "buffer" });
  const sheet = workBook.Sheets[workBook.SheetNames[0]];
  const guests = XLSX.utils.sheet_to_json(sheet);

  if (!Array.isArray(guests) || guests.length === 0) {
    throw new Error("No data found in file");
  }

  // Get existing guests count
  const existingGuests = await Guest.find({ eventId });
  const existingEmails = new Set(
    existingGuests.map((g) => g.email.toLowerCase())
  );

  // Calculate potential new guests (excluding duplicates)
  const newGuestsList = [];
  let duplicateCount = 0;

  for (const guest of guests) {
    const guestObj = guest as Record<string, any>;
    const email = ((guestObj.email as string) || "").toLowerCase();

    if (!email) {
      continue; // Skip entries without email
    }

    if (existingEmails.has(email)) {
      duplicateCount++;
    } else {
      newGuestsList.push({
        name: guestObj.name || "unknown",
        email,
        status: "Pending",
        eventId,
      });
    }
  }

  // Check if adding these guests would exceed the limit
  const limitCheck = await checkGuestLimit(eventId, newGuestsList.length);

  if (limitCheck.exceedsLimit) {
    throw new Error(
      `Guest limit exceeded. Your limit is ${limitCheck.limit}, and this upload would bring your total to ${limitCheck.potentialTotal}. Please reduce your guest list and try again.`
    );
  }

  // If we're here, we can safely add the guests
  if (newGuestsList.length > 0) {
    await Guest.insertMany(newGuestsList);
  }

  // Update event with total guest count
  await Event.findByIdAndUpdate(eventId, {
    noOfGuestAdded: limitCheck.potentialTotal,
  });

  // Update vendor prices for the new guests
  const { totalCostChange, updatedVendors } = await updateVendorPrices(
    eventId,
    newGuestsList.length,
    limitCheck.currentCount
  );

  // Update event budget spent if there's additional cost
  if (totalCostChange > 0) {
    await updateEventBudget(eventId, totalCostChange);
  }

  return {
    newGuestsAdded: newGuestsList.length,
    duplicatesSkipped: duplicateCount,
    totalGuests: limitCheck.potentialTotal,
    vendorsUpdated: updatedVendors.length > 0,
    additionalCost: totalCostChange > 0 ? totalCostChange : 0,
  };
};

// Get all guests by event ID
export const getGuestsByEventId = async (
  eventId: string, 
  search?: string,
  status?: string
) => {
  // Build the filter object
  const filter: any = { eventId };
  
  // Add status filter if provided
  if (status && status !== 'all') {
    filter.status = status;
  }
  
  // Add search filter if provided
  if (search) {
    const searchRegex = new RegExp(search, 'i');
    filter.$or = [
      { name: searchRegex },
      { email: searchRegex }
    ];
  }

  const rsvpList = await Guest.find(filter);
  return rsvpList;
};

// Add a single guest
export const addSingleGuestToEvent = async (guestData: any) => {
  const { eventId } = guestData;

  const existingGuest = await Guest.findOne({
    eventId,
    email: guestData.email,
  });

  if (existingGuest) {
    throw new Error("A guest with this email is already added to the event.");
  }

  // Check if adding this guest would exceed the limit
  const limitCheck = await checkGuestLimit(eventId, 1);

  if (limitCheck.exceedsLimit) {
    throw new Error(
      `Guest limit exceeded. Your limit is ${limitCheck.limit}, and adding this guest would bring your total to ${limitCheck.potentialTotal}.`
    );
  }

  // Create the guest
  const guest = await Guest.create(guestData);

  // Update event guest count
  await Event.findByIdAndUpdate(eventId, {
    noOfGuestAdded: limitCheck.potentialTotal,
  });

  // Update vendor prices for the new guest
  const { totalCostChange, updatedVendors } = await updateVendorPrices(
    eventId,
    1,
    limitCheck.currentCount
  );

  // Update event budget spent if there's additional cost
  if (totalCostChange > 0) {
    await updateEventBudget(eventId, totalCostChange);
  }

  return {
    guest,
    vendorsUpdated: updatedVendors.length > 0,
    updatedVendors: updatedVendors.length > 0 ? updatedVendors : undefined,
    budgetUpdated: totalCostChange > 0,
    additionalCost: totalCostChange,
  };
};

// Remove a single guest
export const removeGuestById = async (guestId: string) => {
  const guest = await Guest.findById(guestId);
  if (!guest) {
    throw new Error("Guest not found");
  }

  const event = await getEventById(guest.eventId);
  if (!event) {
    throw new Error("Associated event not found");
  }

  const updatedGuestCount = (event.noOfGuestAdded || 0) - 1;

  // Remove guest first
  await Guest.findByIdAndDelete(guestId);
  await Event.findByIdAndUpdate(
    guest.eventId,
    { noOfGuestAdded: updatedGuestCount },
    { new: true }
  );

  // Update vendor prices
  const { totalCostChange, updatedVendors, violatingVendors } =
    await updateVendorPrices(guest.eventId, -1, updatedGuestCount);

  // Update the event's budget if there was a price reduction
  if (totalCostChange < 0) {
    await updateEventBudget(guest.eventId, totalCostChange);
  }

  return {
    violatingVendors,
    budgetUpdated: totalCostChange < 0,
    budgetReduction: Math.abs(totalCostChange),
  };
};

// Remove all guests or vendors
export const removeAllByType = async (id: string, type: string) => {
  if (type === "guest") {
    // Get event details first
    const event = await getEventById(id);
    if (!event) {
      throw new Error("Event not found");
    }


    // Get all catering vendors
    const allCateringVendors = await Vendor.find({
      event: id,
      pricingUnit: "per plate",
    });

    // Track budget reduction from vendor price updates
    let totalBudgetReduction = 0;
    const preservedVendors = [];

    // Process all vendors
    for (const vendor of allCateringVendors) {
      const minGuestLimit = vendor.minGuestLimit || 0;

      if (minGuestLimit > 0) {
        // We need to respect the minimum guest limit
        // Calculate price per plate
        const pricePerPlate = vendor.price / vendor.numberOfGuests;

        // Calculate new guest count - either minGuestLimit or keep at 0
        const newGuestCount = minGuestLimit;

        // Calculate price reduction
        const priceReduction =
          pricePerPlate * (vendor.numberOfGuests - newGuestCount);
        totalBudgetReduction += priceReduction;

        // Update vendor to minGuestLimit instead of 0
        await Vendor.findByIdAndUpdate(vendor._id, {
          numberOfGuests: newGuestCount,
          price: vendor.price - priceReduction,
        });

        preservedVendors.push({
          id: vendor._id,
          title: vendor.title,
          minGuestLimit,
          adjustedPrice: vendor.price - priceReduction,
        });
      } else {
        // No minimum guest limit, reduce price to 0
        totalBudgetReduction += vendor.price;
        await Vendor.findByIdAndUpdate(vendor._id, {
          numberOfGuests: 0,
          price: 0,
        });
      }
    }

    // Delete all guests
    await Guest.deleteMany({ eventId: id });
    await Event.findByIdAndUpdate(id, { noOfGuestAdded: 0 });

    // Update the event's budget
    if (totalBudgetReduction > 0) {
      await updateEventBudget(id, -totalBudgetReduction);
    }

    return {
      preservedVendors,
      budgetUpdated: totalBudgetReduction > 0,
      budgetReduction: totalBudgetReduction,
    };
  }

  if (type === "vendor") {
    // Get event details first
    const event = await getEventById(id);
    if (!event) {
      throw new Error("Event not found");
    }

    // Get the total vendor costs before deletion
    const vendors = await Vendor.find({ event: id });
    const totalVendorCost = vendors.reduce(
      (sum, vendor) => sum + (vendor.price || 0),
      0
    );

    // Delete all vendors
    await Vendor.deleteMany({ event: id });

    // Update the event's budget
    if (totalVendorCost > 0) {
      await updateEventBudget(id, -totalVendorCost);
    }

    return {
      budgetUpdated: totalVendorCost > 0,
      budgetReduction: totalVendorCost,
    };
  }

  throw new Error("Invalid type. Must be 'guest' or 'vendor'");
};

// Update guest information
export const updateGuestInfo = async (
  eventId: string,
  guestId: string,
  updateData: { name: string; email: string; status: string }
) => {
  const updatedGuest = await Guest.findOneAndUpdate(
    { _id: guestId, eventId },
    updateData,
    { new: true }
  );

  if (!updatedGuest) {
    throw new Error("Guest not found");
  }

  return updatedGuest;
};

// Reusable function to send emails to guests
export const sendEmailToGuests = async (
  guests: any[],
  event: any,
  isReminder = false
) => {
  // Send emails in batches to avoid overwhelming the email service
  const batchSize = 10;
  const emailPromises = [];

  for (let i = 0; i < guests.length; i += batchSize) {
    const batch = guests.slice(i, i + batchSize);

    const batchPromises = batch.map((guest) =>
      sendEmail({
        to: guest.email,
        subject: `${isReminder ? "Reminder" : "Invitation"}: ${event.name} - ${
          event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)
        }`,
        text: "",
        html: formatEmailTemplate(event, guest, isReminder),
      })
    );

    emailPromises.push(Promise.all(batchPromises));

    if (i + batchSize < guests.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return Promise.all(emailPromises.flat());
};

// Validate guest URL
export const validateGuestURL = async (eventId: string, guestId: string) => {
  // Fetch both event and guest in parallel
  const [event, guest] = await Promise.all([
    getEventById(eventId),
    Guest.findById(guestId),
  ]);

  if (!event || !guest) {
    throw new Error("Invalid RSVP link");
  }

  return {
    guest: {
      name: guest.name,
      email: guest.email,
      date: event.date,
      location: event.location,
      responseStatus: guest.status,
    },
  };
};

// Submit guest RSVP response
export const submitGuestResponse = async (
  guestId: string,
  eventId: string,
  attending: boolean
) => {
  const guest = await Guest.findById(guestId);
  if (!guest) {
    throw new Error("Guest not found");
  }

  // Update guest status
  const previousStatus = guest.status;
  guest.status = attending ? "Confirmed" : "Declined";
  await guest.save();

  // Get the event and create notification in parallel
  const event = await getEventById(eventId);
  if (event) {
    const organizerId = event.creator.toString();
    const message = `${guest.name} has ${
      attending ? "accepted" : "declined"
    } your invitation to ${event.name || "your event"}.`;

    await createNotification(organizerId, eventId, message, "response", {
      guestId: guest._id.toString(),
      guestName: guest.name,
      response: guest.status,
      previousStatus,
      eventTitle: event.name || "Event",
    });
  }

  return {
    status: guest.status,
  };
};
