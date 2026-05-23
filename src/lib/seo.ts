/** Canonical public site origin (must match production redirects and canonical links). */
export const SITE_ORIGIN = "https://tambuaafrica.com";

export const SITE_NAME = "Tambua Africa Tours & Safaris";

/** Default share image (under `public/`). */
export const DEFAULT_OG_IMAGE_PATH = "/images/og-safari-image.jpg";

export const DEFAULT_OG_IMAGE_URL = `${SITE_ORIGIN}${DEFAULT_OG_IMAGE_PATH}`;

export const LOGO_URL = `${SITE_ORIGIN}/images/logo.png`;

/** Shared Open Graph / Twitter defaults (same on every public page). */
export const GLOBAL_OG = {
  type: "website",
  title: "Tambua Africa Tours & Safaris | Kenya Safaris",
  description:
    "Tailor-made Kenya safaris, wildlife tours & beach holidays. 16+ years of experience. Book your African adventure with Tambua Africa.",
  locale: "en_KE",
  image: DEFAULT_OG_IMAGE_URL,
} as const;

export const GLOBAL_TWITTER = {
  card: "summary_large_image",
  site: "@TambuaAfrica",
  title: "Tambua Africa Tours & Safaris",
  description:
    "Tailor-made Kenya safaris & African tours. Expert guides, competitive prices. Book today!",
  image: DEFAULT_OG_IMAGE_URL,
} as const;

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
    title: "Tambua Africa Tours & Safaris | Kenya Safari & Travel Experts | Nairobi",
    description:
      "Tambua Africa offers tailor-made Kenya safaris, wildlife tours, beach holidays, and cultural experiences. 16+ years of expertise. Book your African adventure today. Call +254 726 207 900.",
  },
  "/about": {
    title: `About Us | ${SITE_NAME}`,
    description:
      "Meet Tambua Africa, a Nairobi tour operator planning tailor-made Kenya safaris, Maasai Mara wildlife tours, beach holidays, and cultural experiences across East Africa.",
  },
  "/safaris": {
    title: "Kenya Safari Packages & African Tours | Tambua Africa Tours",
    description:
      "Explore Kenya's Maasai Mara, Amboseli, Tsavo & more. Tambua Africa offers custom safari packages, beach holidays, and group tours at competitive prices. Get a free quote today.",
  },
  "/destinations": {
    title: `Safari Destinations in Kenya & East Africa | ${SITE_NAME}`,
    description:
      "Explore Maasai Mara, Amboseli, Lake Nakuru, Diani Beach, and cross-border routes. Kenya safari destinations with lodge ideas from a Nairobi tour operator.",
  },
  "/travel-info": {
    title: `Travel Info for Kenya Safaris | ${SITE_NAME}`,
    description:
      "Kenya safari packing lists, best seasons for Maasai Mara migration, visas, health tips, and park etiquette from Tambua Africa's Nairobi team.",
  },
  "/gallery": {
    title: `Kenya Safari Gallery | Wildlife Photos | ${SITE_NAME}`,
    description:
      "Maasai Mara wildlife, Amboseli elephants, and Kenya safari moments from Tambua Africa tours across Kenya and East Africa.",
  },
  "/blog": {
    title: `Kenya Safari Blog & Travel Tips | ${SITE_NAME}`,
    description:
      "Best time to visit Maasai Mara, Kenya safari packing lists, wildlife tours, and Nairobi day trips — expert articles from Tambua Africa.",
  },
  "/contact": {
    title: "Contact Tambua Africa | Book a Kenya Safari | Nairobi, Kenya",
    description:
      "Contact Tambua Africa Tours & Safaris in Nairobi, Kenya. Call +254 726 207 900 or email info@tambuaafrica.com to start planning your dream safari.",
  },
  "/services": {
    title: `Safari Services: Ticketing, Transfers & Lodges | ${SITE_NAME}`,
    description:
      "Flights, coach tickets, private transfers, and lodge or camp bookings layered around your Kenya safari dates, coordinated from Nairobi.",
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
  "/auth/confirm": {
    title: `Confirm Email | ${SITE_NAME}`,
    description: "Confirm your Tambua Africa account email.",
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

/** Human-readable segment for BreadcrumbList JSON-LD on inner pages. */
export const BREADCRUMB_LABELS: Record<string, string> = {
  "/about": "About",
  "/safaris": "Safari Packages",
  "/destinations": "Destinations",
  "/travel-info": "Travel Info",
  "/gallery": "Gallery",
  "/blog": "Blog",
  "/contact": "Contact",
  "/services": "Services",
  "/services/ticketing": "Ticketing",
  "/services/transfers": "Transfers",
  "/services/lodges-camps": "Lodges & Camps",
  "/terms": "Terms",
  "/privacy": "Privacy",
};

export const TRAVEL_AGENCY_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "TravelAgency",
  name: SITE_NAME,
  url: SITE_ORIGIN,
  logo: LOGO_URL,
  description:
    "Nairobi-based tour operator specializing in tailor-made Kenya safaris, wildlife tours, beach holidays and cultural experiences across Africa.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Standard Street, Floor 4, Suite 16",
    addressLocality: "Nairobi",
    addressCountry: "KE",
  },
  telephone: "+254726207900",
  email: "info@tambuaafrica.com",
  sameAs: [
    "https://www.facebook.com/Tambuasafaris/",
    "https://twitter.com/TambuaAfrica",
  ],
  openingHours: "Mo-Fr 08:00-17:00",
  priceRange: "$$$",
  areaServed: "Kenya, Africa",
};

export function buildBreadcrumbJsonLd(pathname: string): Record<string, unknown> | null {
  const label = BREADCRUMB_LABELS[pathname];
  if (!label) return null;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_ORIGIN,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: label,
        item: `${SITE_ORIGIN}${pathname}`,
      },
    ],
  };
}
