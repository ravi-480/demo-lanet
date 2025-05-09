const images = [
  {
    id: "home-image-1",
    src: "/images/home-image-1.jpeg",
    alt: "Modern conference room with large windows",
  },
  {
    id: "home-image-2",
    src: "/images/home-image-2.jpeg",
    alt: "Event planning workspace",
  },
  {
    id: "home-image-3",
    src: "/images/home-image-3.jpeg",
    alt: "Event venue setup",
  },
];

export const featureSections = [
  {
    title: "Event Cards Gallery",
    description:
      "The Event Cards Gallery showcases a variety of beautifully designed cards featuring event details such as name, date, and budget usage percentage. Explore the gallery to find the perfect card for your next event, all displayed in a clean and modern UI for easy navigation.",
    imageUrl: "/images/gallery-image-1.jpeg",
    imageAlt: "Concert with bright stage lights",
    reverse: false,
  },
  {
    title: "Guest Management",
    description:
      "The guest management section allows users to track RSVP status with color-coded indicators and easily sort through the guest list. This feature streamlines the process of managing attendees and ensures a seamless experience for event planners.",
    imageUrl: "/images/guest-image.jpeg",
    imageAlt: "guest management",
    reverse: false,
  },
];

export const testimonials = [
  {
    id: 1,
    quote:
      '"EventWise transformed our corporate retreat planning from chaos to clarity. The budget tracking alone saved us over $5,000!"',
    author: "Sarah Mitchell",
  },
  {
    id: 2,
    quote:
      '"I planned my daughter\'s wedding while working full-time, and EventWise made it possible. The vendor integration feature found us an amazing caterer within budget!"',
    author: "Michael Thompson",
  },
  {
    id: 3,
    quote:
      "\"As an event coordinator handling multiple clients, I can't imagine going back to spreadsheets. EventWise's dashboard gives me instant visibility across all projects.\"",
    author: "Jamie Lopez",
  },
  {
    id: 4,
    quote:
      '"The guest management system eliminated the stress of chasing RSVPs. The automated reminders were professional and effective!"',
    author: "Priya Kapoor",
  },
];

export const faqData = [
  {
    id: "1",
    question: "How do I create a new event using the EventWise app?",
    answer:
      'To create a new event, open the EventWise app and tap the "+" button in the bottom right corner. Fill in the event details such as name, date, location, and description. You can also add custom fields as needed for your specific event requirements.',
  },
  {
    id: "2",
    question: "Can I track my event budget using the EventWise app?",
    answer:
      "Yes, you can track your event budget using the circular budget tracker on the event overview page. The budget allocation tool allows you to allocate funds to different aspects of your event, and the tracker visually shows you how much of your budget has been used.",
  },
  {
    id: "3",
    question: "How can I manage my guest list on the EventWise app?",
    answer:
      'You can manage your guest list by navigating to the "Guests" tab in your event. From there, you can add new guests, send invitations, track RSVPs, and organize guests into different categories or tables. The app also allows you to export your guest list as needed.',
  },
  {
    id: "4",
    question: "Is there a feature for tracking expenses in the EventWise app?",
    answer:
      'Yes, EventWise has a comprehensive expense tracking feature. Navigate to the "Budget" section and tap on "Expenses" to add new expenses, categorize them, and upload receipt images. The app automatically updates your budget tracker to reflect all expenses.',
  },
];

export const testimonials2 = [
  {
    id: "t1",
    name: "Sarah Johnson",
    image: "/images/testimonial.png",
    rating: 5,
    quote:
      "EventWise helped me stay under budget while planning my dream wedding!",
    eventType: "Wedding",
  },
  {
    id: "t2",
    name: "Michael Rodriguez",
    image: "/images/testimonial.png",
    rating: 5,
    quote:
      "Our company conference was a huge success thanks to the organization tools.",
    eventType: "Corporate Conference",
  },
  {
    id: "t3",
    name: "Emily Chen",
    image: "/images/testimonial.png",
    rating: 4,
    quote: "The vendor recommendations saved me hours of research time.",
    eventType: "Charity Gala",
  },
];

export default images;

export function formatSimpleDate(dateString: string | Date) {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleDateString("en-GB");
}

export function formatFullDateWithTime(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid date";

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  return `${day}/${month}/${year} • ${hours}:${minutes}${ampm}`;
}

export const eventVendorMapping = {
  wedding: [
    { category: "catering", pricingUnit: "per plate" },
    { category: "photography", pricingUnit: "per hour" },
    { category: "decoration", pricingUnit: "flat rate" },
    { category: "music", pricingUnit: "per hour" },
    { category: "venue", pricingUnit: "per day" },
    { category: "videography", pricingUnit: "per hour" },
    { category: "lighting/sound", pricingUnit: "flat rate" },
  ],
  birthday: [
    { category: "catering", pricingUnit: "per plate" },
    { category: "decoration", pricingUnit: "flat rate" },
    { category: "music", pricingUnit: "per hour" },
    { category: "photography", pricingUnit: "per hour" },
    { category: "venue", pricingUnit: "per day" },
  ],
  corporate: [
    { category: "catering", pricingUnit: "per plate" },
    { category: "venue", pricingUnit: "per day" },
    { category: "lighting/sound", pricingUnit: "flat rate" },
    { category: "decoration", pricingUnit: "flat rate" },
  ],
  anniversary: [
    { category: "catering", pricingUnit: "per plate" },
    { category: "music", pricingUnit: "per hour" },
    { category: "photography", pricingUnit: "per hour" },
    { category: "decoration", pricingUnit: "flat rate" },
  ],
  babyshower: [
    { category: "catering", pricingUnit: "per plate" },
    { category: "decoration", pricingUnit: "flat rate" },
    { category: "venue", pricingUnit: "per day" },
  ],
  engagement: [
    { category: "catering", pricingUnit: "per plate" },
    { category: "photography", pricingUnit: "per hour" },
    { category: "decoration", pricingUnit: "flat rate" },
    { category: "music", pricingUnit: "per hour" },
  ],
  graduation: [
    { category: "venue", pricingUnit: "per day" },
    { category: "catering", pricingUnit: "per plate" },
    { category: "music", pricingUnit: "per hour" },
  ],
  festival: [
    { category: "catering", pricingUnit: "per plate" },
    { category: "music", pricingUnit: "per hour" },
    { category: "lighting/sound", pricingUnit: "flat rate" },
    { category: "decoration", pricingUnit: "flat rate" },
  ],
  concert: [
    { category: "music", pricingUnit: "per hour" },
    { category: "lighting/sound", pricingUnit: "flat rate" },
    { category: "venue", pricingUnit: "per day" },
  ],
  charitygala: [
    { category: "catering", pricingUnit: "per plate" },
    { category: "decoration", pricingUnit: "flat rate" },
    { category: "photography", pricingUnit: "per hour" },
    { category: "venue", pricingUnit: "per day" },
  ],
  farewell: [
    { category: "venue", pricingUnit: "per day" },
    { category: "music", pricingUnit: "per hour" },
    { category: "catering", pricingUnit: "per plate" },
  ],
  housewarming: [
    { category: "decoration", pricingUnit: "flat rate" },
    { category: "catering", pricingUnit: "per plate" },
    { category: "music", pricingUnit: "per hour" },
  ],
  workshop: [
    { category: "venue", pricingUnit: "per day" },
    { category: "lighting/sound", pricingUnit: "flat rate" },
    { category: "catering", pricingUnit: "per plate" },
  ],
};

 export const commonTerms = [
  "photographer",
  "catering",
  "decorator",
  "dj",
  "music",
  "band",
  "flowers",
  "cake",
  "dessert",
  "lighting",
  "sound",
  "hotel",
  "garden",
  "videographer",
  "makeup",
  "mehendi",
  "bartender",
  "entertainment",
];

export const getRandomPrice = (category: string, isFlatRate = false) => {
  const normalized = category.toLowerCase();

  const priceRanges: Record<string, [number, number]> = {
    catering: [200, 700],
    photography: [1500, 2500],
    videography: [1500, 2500],
    music: [1500, 2500],
    musician: [1500, 2500],
    dancer: [2000, 5000],
    decoration: [10000, 15000],
    venue: [30000, 50000],
    "lighting/sound": [3000, 5000],
    default: isFlatRate ? [10000, 20000] : [3000, 6000],
  };

  const [min, max] = priceRanges[normalized] || priceRanges.default;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const tabs = [
  { id: "all", label: "All" },
  { id: "upcoming", label: "Upcoming" },
  { id: "past", label: "Past" },
];
