import axios from "../utils/axiosConfig";
import { toast } from "sonner";
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

export const handleSendRequest = async (
  usersWithCost: {
    name: string;
    email: string;
    amount: number;
    eventId: string;
    _id: string;
  }[]
) => {
  const recipients = usersWithCost.map((user) => user.email);
  const amounts = usersWithCost.map((user) => user.amount);
  const eventId = usersWithCost.map((user) => user.eventId);
  const userId = usersWithCost.map((user) => user._id);
  try {
    await axios.post("/vendors/send-mail", {
      recipients,
      amounts,
      eventId,
      userId,
    });
    alert("Emails sent!");
  } catch (err: unknown) {
    if (err instanceof Error) {
      toast.error(`Failed to send email: ${err.message}`);
    } else {
      toast.error("Failed to send email: An unknown error occurred.");
    }
    alert("Something went wrong.");
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
