/** Primary WhatsApp line for chat, floating button, and booking handoff. */
export const WHATSAPP_E164 = "+254751223828";
export const WHATSAPP_DISPLAY = "+254 751 223 828";
/** Digits only (no +) for wa.me links */
export const WHATSAPP_WA_ME_ID = "254751223828";

export const WHATSAPP_DEFAULT_MESSAGE =
  "Hello Tambua Africa! I'm interested in a safari.";

export function buildWhatsAppUrl(message = WHATSAPP_DEFAULT_MESSAGE): string {
  return `https://wa.me/${WHATSAPP_WA_ME_ID}?text=${encodeURIComponent(message)}`;
}
