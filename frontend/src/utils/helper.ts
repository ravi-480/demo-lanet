import { VendorType, IEvent } from "@/Interface/interface";

// Get filtered vendors based on search term, price range, and rating filter
export function getFilteredVendors(
  vendors: VendorType[], // Use VendorType for the vendors array
  searchTerm: string,
  priceRange: [number, number],
  ratingFilter: number | null
) {
  return vendors.filter((vendor) => {
    const matchesSearch =
      vendor.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPrice =
      typeof vendor.price === "number" &&
      vendor.price >= priceRange[0] &&
      vendor.price <= priceRange[1];

    const matchesRating =
      ratingFilter === null || vendor.rating >= ratingFilter;

    return matchesSearch && matchesPrice && matchesRating;
  });
}

const now = new Date().getTime();

// Get event status based on the event date
export const getEventStatus = (date?: string | Date): string => {
  if (!date) return "unknown";
  try {
    const eventDate = new Date(date).getTime();
    return eventDate > now ? "upcoming" : "past";
  } catch {
    return "unknown";
  }
};

// Get the number of upcoming events
export const getNoOfUpcomingEvent = (events: IEvent[]) => {
  const now = Date.now();
  let count = 0;
  events.filter((event) => {
    const eventDate = new Date(event.date).getTime();
    if (eventDate > now) {
      count++;
    }
    return count;
  }, 0);
  return count;
};

// Helper function to properly format dates for input fields
export const formatDateForInput = (dateString?: string | Date): string => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    const istOffset = 5.5 * 60;
    const localTime = new Date(date.getTime() + istOffset * 60000);
    const iso = localTime.toISOString();
    return iso.slice(0, 16);
  } catch (e) {
    console.log(e);
    return "";
  }
};

// helper function to check so that only allowed string character
export const allowOnlyLetters = (e: React.KeyboardEvent<HTMLInputElement>) => {
  const allowedKeys = [
    "Backspace",
    "Tab",
    "ArrowLeft",
    "ArrowRight",
    "Delete",
    "-",
    "'",
  ];

  const isLetter = /^[a-zA-Z]$/.test(e.key);
  const input = e.currentTarget;

  // Block space at beginning or if input is empty
  if (e.key === " " && input.selectionStart === 0) {
    e.preventDefault();
    return;
  }

  if (!isLetter && !allowedKeys.includes(e.key) && e.key !== " ") {
    e.preventDefault();
  }
};

export const filterPastedLetters = (
  e: React.ClipboardEvent<HTMLInputElement>
) => {
  const pasted = e.clipboardData.getData("text");

  // Block if non-letters, or if pasted text starts with space
  if (
    /[^a-zA-Z\s\-']/.test(pasted) ||
    pasted.trim().length === 0 ||
    pasted.startsWith(" ")
  ) {
    e.preventDefault();
  }
};


// event color based on status

export const getStatusColor = (status: string) => {
  switch (status) {
    case "upcoming":
      return "bg-cyan-700/50 text-white-200";
    default:
      return "bg-gray-700/50 text-gray-200";
  }
};
