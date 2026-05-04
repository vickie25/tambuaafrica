/** Canonical public site origin (must match production redirects and canonical links). */
export const SITE_ORIGIN = "https://www.tambuaafrica.com";

export const SITE_NAME = "Tambua Africa Tours & Safaris";

/** Default share image (under `public/`). */
export const DEFAULT_OG_IMAGE_PATH = "/images/beautiful-shot-three-cute-giraffes-field-with-trees-blue-sky.webp";

export const DEFAULT_OG_IMAGE_URL = `${SITE_ORIGIN}${DEFAULT_OG_IMAGE_PATH}`;

export type RouteSeoEntry = {
  title: string;
  description: string;
  /** Path under site root for og:image/twitter:image, e.g. `/images/foo.webp` */
  ogImage?: string;
  robots?: string;
};

/** Truncate for meta description (~155–160 visible characters in SERPs). */
export function truncateMetaDescription(text: string, max = 158): string {
  const t = text.trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  const base = lastSpace > 60 ? cut.slice(0, lastSpace) : cut;
  return `${base.trimEnd()}...`;
}

/** Open Graph / Twitter require absolute URLs. */
export function absoluteUrl(href: string): string {
  if (!href) return DEFAULT_OG_IMAGE_URL;
  if (href.startsWith("http://") || href.startsWith("https://")) return href;
  const path = href.startsWith("/") ? href : `/${href}`;
  return `${SITE_ORIGIN}${path}`;
}

export const SEO_BY_ROUTE: Record<string, RouteSeoEntry> = {
  "/": {
    title: `${SITE_NAME} | Kenya & East Africa Safaris`,
    description:
      "Kenya and East Africa safaris from Nairobi: Masai Mara, Amboseli, custom itineraries, flights, transfers, and lodge booking with trusted local guides.",
  },
  "/about": {
    title: `About Us | ${SITE_NAME}`,
    description:
      "Meet Tambua Africa, a Nairobi-based tour operator planning Kenya safaris, regional circuits, and full trip support for international travelers.",
  },
  "/safaris": {
    title: `Kenya Safari Packages | ${SITE_NAME}`,
    description:
      "Compare Masai Mara, Amboseli, Nakuru, coast, and regional safari packages. Flexible durations, clear inclusions, and help booking your dates.",
  },
  "/destinations": {
    title: `Safari Destinations in Kenya & East Africa | ${SITE_NAME}`,
    description:
      "Explore parks, lakes, beaches, and cross-border routes across Kenya, Tanzania, Uganda, and Rwanda with lodge ideas and sample circuits.",
  },
  "/travel-info": {
    title: `Travel Info for Kenya & East Africa | ${SITE_NAME}`,
    description:
      "Practical guidance on visas, health, packing, seasons, money, and park etiquette before your Kenya or East Africa safari.",
  },
  "/gallery": {
    title: `Safari Gallery | ${SITE_NAME}`,
    description:
      "Wildlife, landscapes, and lodge moments from Tambua Africa safaris across Kenya and the wider East Africa region.",
  },
  "/blog": {
    title: `Safari & Travel Blog | ${SITE_NAME}`,
    description:
      "Visa updates, park news, packing tips, and safari planning ideas from the Tambua Africa team based in Nairobi.",
  },
  "/contact": {
    title: `Contact & Trip Enquiry | ${SITE_NAME}`,
    description:
      "WhatsApp, email, or contact form: speak with Tambua Africa about dates, budget, parks, and a custom Kenya or East Africa itinerary.",
  },
  "/services": {
    title: `Safari Services: Ticketing, Transfers & Lodges | ${SITE_NAME}`,
    description:
      "Flights, coach tickets, private transfers, and lodge or camp bookings layered around your safari dates, coordinated from Nairobi.",
  },
  "/services/ticketing": {
    title: `Air & Coach Ticketing for Safaris | ${SITE_NAME}`,
    description:
      "Domestic and international flights plus Kenyan coach tickets timed to your safari arrival, departure, and internal hops.",
  },
  "/services/transfers": {
    title: `Airport & Lodge Transfers in Kenya | ${SITE_NAME}`,
    description:
      "Private road transfers between Nairobi, airports, hotels, park gates, and airstrips, aligned with your tickets and accommodation.",
  },
  "/services/lodges-camps": {
    title: `Safari Lodge & Camp Booking | ${SITE_NAME}`,
    description:
      "Safari lodges, tented camps, city hotels, and campsites across Kenya matched to park, budget, and travel style.",
  },
  "/terms": {
    title: `Terms of Service | ${SITE_NAME}`,
    description: "Booking, cancellation, and refund terms for Tambua Africa tours, safaris, and related travel services.",
  },
  "/privacy": {
    title: `Privacy Policy | ${SITE_NAME}`,
    description: "How Tambua Africa collects, uses, stores, and protects personal data when you browse, enquire, or book.",
  },
  "/login": {
    title: `Sign In | ${SITE_NAME}`,
    description: "Secure sign-in to view bookings and messages for your Tambua Africa account.",
    robots: "noindex, follow",
  },
  "/signup": {
    title: `Create Account | ${SITE_NAME}`,
    description: "Create a Tambua Africa account to manage enquiries, bookings, and safari planning in one place.",
    robots: "noindex, follow",
  },
  "/forgot-password": {
    title: `Forgot Password | ${SITE_NAME}`,
    description: "Reset your Tambua Africa account password securely by email.",
    robots: "noindex, follow",
  },
  "/reset-password": {
    title: `Reset Password | ${SITE_NAME}`,
    description: "Choose a new password for your Tambua Africa account.",
    robots: "noindex, follow",
  },
  "/booking": {
    title: `Complete Booking | ${SITE_NAME}`,
    description: "Finish payment and details for your confirmed Tambua Africa safari or tour booking.",
    robots: "noindex, follow",
  },
  "/payment-success": {
    title: `Payment Received | ${SITE_NAME}`,
    description: "Thank you: your Tambua Africa payment was received. Our team will follow up on next steps.",
    robots: "noindex, follow",
  },
};
