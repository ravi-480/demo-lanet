import { Testimonial } from "@/Interface/interface";
import { SliderImage } from "@/Types/type";

const images: SliderImage[] = [
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
    title: "Vendor Search",
    description:
      "The vendor search functionality includes filters, gallery/map views, and quick-add options for efficient vendor selection. Users can easily find and add vendors to their events, enhancing the planning process with a user-friendly interface.",
    imageUrl: "/images/gallery-image-2.jpeg",
    imageAlt: "Apple blossoms in spring",
    reverse: true,
  },
];

export const testimonials: Testimonial[] = [
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

export const featureData = [
  {
    id: 1,
    imageSrc: "/images/guest-image.jpeg",
    title: "Guest Management",
    description:
      "The guest management section allows users to track RSVP status with color-coded indicators and easily sort through the guest list. This feature streamlines the process of managing attendees and ensures a seamless experience for event planners.",
    dark: false,
    reverse: false,
  },
  {
    id: 2,
    imageSrc: "/images/gallery-image-3.jpeg",
    title: "Dashboard Overview",
    description:
      "The clean dashboard displays event cards with key details like name, date, and budget usage percentage for easy access to event information. Users can quickly navigate through events and stay organized with a visually appealing layout.",
    dark: true,
    reverse: true,
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

export const socialLinks = [
  { href: "#", icon: "FacebookOutlined" },
  { href: "#", icon: "TwitterOutlined" },
  { href: "#", icon: "InstagramOutlined" },
  { href: "#", icon: "LinkedinOutlined" },
];

export const quickLinks = [
  "Home",
  "Features",
  "Pricing",
  "Testimonials",
  "Blog",
];

export const supportLinks = [
  "Help Center",
  "Community",
  "Privacy Policy",
  "Terms of Service",
  "Contact Us",
];

export const contactInfo = {
  email: "info@eventwise.com",
  phone: "+1 (800) 123-4567",
  address: "123 Event Street, Suite 200, San Francisco, CA 94107",
};

export default images;

export function formatDate(isoString: string): string {
  const date = new Date(isoString);

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  return `${day}/${month}/${year} • ${hours}:${minutes}${ampm}`;
}
  
// Importing event vendor mapping to use inside the component
export const eventVendorMapping = {
  Wedding: [
    { category: "catering", pricingUnit: "per plate" },
    { category: "photography", pricingUnit: "per hour" },
    { category: "decoration", pricingUnit: "flat rate" },
    { category: "music", pricingUnit: "per hour" },
    { category: "venue", pricingUnit: "per day" },
    { category: "videography", pricingUnit: "per hour" },
    { category: "lighting/sound", pricingUnit: "flat rate" },
  ],
  Birthday: [
    { category: "catering", pricingUnit: "per plate" },
    { category: "decoration", pricingUnit: "flat rate" },
    { category: "music", pricingUnit: "per hour" },
    { category: "photography", pricingUnit: "per hour" },
    { category: "venue", pricingUnit: "per day" },
  ],
  Corporate: [
    { category: "catering", pricingUnit: "per plate" },
    { category: "venue", pricingUnit: "per day" },
    { category: "lighting/sound", pricingUnit: "flat rate" },
    { category: "decoration", pricingUnit: "flat rate" },
  ],
  Anniversary: [
    { category: "catering", pricingUnit: "per plate" },
    { category: "music", pricingUnit: "per hour" },
    { category: "photography", pricingUnit: "per hour" },
    { category: "decoration", pricingUnit: "flat rate" },
  ],
  BabyShower: [
    { category: "catering", pricingUnit: "per plate" },
    { category: "decoration", pricingUnit: "flat rate" },
    { category: "venue", pricingUnit: "per day" },
  ],
  Engagement: [
    { category: "catering", pricingUnit: "per plate" },
    { category: "photography", pricingUnit: "per hour" },
    { category: "decoration", pricingUnit: "flat rate" },
    { category: "music", pricingUnit: "per hour" },
  ],
  Graduation: [
    { category: "venue", pricingUnit: "per day" },
    { category: "catering", pricingUnit: "per plate" },
    { category: "music", pricingUnit: "per hour" },
  ],
  Festival: [
    { category: "catering", pricingUnit: "per plate" },
    { category: "music", pricingUnit: "per hour" },
    { category: "lighting/sound", pricingUnit: "flat rate" },
    { category: "decoration", pricingUnit: "flat rate" },
  ],
  Concert: [
    { category: "music", pricingUnit: "per hour" },
    { category: "lighting/sound", pricingUnit: "flat rate" },
    { category: "venue", pricingUnit: "per day" },
  ],
  CharityGala: [
    { category: "catering", pricingUnit: "per plate" },
    { category: "decoration", pricingUnit: "flat rate" },
    { category: "photography", pricingUnit: "per hour" },
    { category: "venue", pricingUnit: "per day" },
  ],
  Farewell: [
    { category: "venue", pricingUnit: "per day" },
    { category: "music", pricingUnit: "per hour" },
    { category: "catering", pricingUnit: "per plate" },
  ],
  Housewarming: [
    { category: "decoration", pricingUnit: "flat rate" },
    { category: "catering", pricingUnit: "per plate" },
    { category: "music", pricingUnit: "per hour" },
  ],
  Workshop: [
    { category: "venue", pricingUnit: "per day" },
    { category: "lighting/sound", pricingUnit: "flat rate" },
    { category: "catering", pricingUnit: "per plate" },
  ],
};

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
