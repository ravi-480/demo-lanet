import axios from "axios";

export function getFilteredVendors(
  vendors: any[],
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

export const getEventStatus = (date?: string | Date): string => {
  if (!date) return "unknown";
  try {
    const eventDate = new Date(date).getTime();
    return eventDate > now ? "upcoming" : "past";
  } catch {
    return "unknown";
  }
};

export const handleSendRequest = async (users: any, totalCost: number) => {
  const recipients = users.map((user: any) => user.email);
  const subject = "Split Expense Request";
  const body = `
    <h3>Hello from Split App</h3>
    <p>The total expense is ₹${totalCost}. Please confirm your contribution.</p>
  `;

  try {
    const res = await axios.post(
      "http://localhost:5000/api/vendors/send-mail",
      {
        recipients,
        subject,
        body,
      }
    );
    console.log("Success:", res.data.message);
    alert("Emails sent!");
  } catch (err: any) {
    console.error("Failed to send email", err);
    alert("Something went wrong.");
  }
};

// calculate the no of upcoming events

export const getNoOfUpcomingEvent = (events: any) => {
  const now = Date.now();
  let count = 0;
  events.filter((event: any) => {
    const eventDate = new Date(event.date).getTime();
    if (eventDate > now) {
      count++;
    }
    return count;
  }, 0);
  return count;
};
