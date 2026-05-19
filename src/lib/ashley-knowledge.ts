/**
 * Static knowledge for Ashley (site assistant). Live safari/destination/blog
 * counts are merged at runtime in the chat component so answers stay current.
 */

import { TEAM_CONTACT_EMAILS } from "@/lib/admin-email";

export const ASHLEY_DISPLAY_NAME = "Ashley";
export const ASHLEY_TITLE = "Guest services · Tambua Africa";

export { WHATSAPP_E164, WHATSAPP_DISPLAY, WHATSAPP_WA_ME_ID, buildWhatsAppUrl } from "@/lib/whatsapp";
export const CONTACT_EMAIL = TEAM_CONTACT_EMAILS[0];
export const CONTACT_EMAILS = TEAM_CONTACT_EMAILS;
export const CONTACT_EMAILS_DISPLAY = TEAM_CONTACT_EMAILS.join(", ");

export const SITE_ROUTES = {
  home: "/",
  safaris: "/safaris",
  destinations: "/destinations",
  contact: "/contact",
  services: "/services",
  servicesTicketing: "/services/ticketing",
  servicesTransfers: "/services/transfers",
  servicesLodges: "/services/lodges-camps",
  travelInfo: "/travel-info",
  blog: "/blog",
  booking: "/booking",
  about: "/about",
} as const;

/** Concise copy the assistant can rely on; keep in sync when marketing changes. */
export const TAMBUA_SERVICES = {
  ticketing:
    "We arrange domestic and international flight tickets, plus long-distance coach and shuttle bookings when road travel fits your itinerary better than flying.",
  transfers:
    "We organise private road transfers (airport, hotel, park gates) and charter or scheduled light-air links where available, coordinated with your safari dates.",
  lodges:
    "Beyond packaged safaris, we help you book lodges, camps, and city hotels across East Africa, curated to your budget, style, and park location. Lodge photos and options appear on our Destinations and Lodges areas as we publish them.",
  safaris:
    "Tailor-made and scheduled safari packages across Kenya, Tanzania, Uganda, Rwanda, and the coast, covering wildlife, culture, beach, and adventure.",
} as const;

export function pageLabelFromPath(pathname: string): string | null {
  if (pathname === "/" || pathname === "") return "Home";
  if (pathname.startsWith("/safaris")) return "Safaris";
  if (pathname.startsWith("/destinations")) return "Destinations";
  if (pathname.startsWith("/contact")) return "Contact";
  if (pathname.startsWith("/travel-info")) return "Travel info";
  if (pathname.startsWith("/blog")) return "Blog";
  if (pathname.startsWith("/booking")) return "Booking";
  if (pathname.startsWith("/about")) return "About";
  if (pathname.startsWith("/gallery")) return "Gallery";
  if (pathname.startsWith("/services")) return "Services";
  return null;
}
