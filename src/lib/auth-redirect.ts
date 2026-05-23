/** Live site used for email confirmation links (must match Supabase redirect allow list). */
export const PRODUCTION_SITE_ORIGIN = "https://tambuaafrica.com";

/** Public site origin for auth redirects (must match Supabase Auth URL allow list). */
export function getAuthSiteOrigin(): string {
  const fromEnv = import.meta.env.VITE_SITE_URL?.trim();
  // Production builds should always use the live domain unless overridden in Vercel.
  if (import.meta.env.PROD) {
    return (fromEnv || PRODUCTION_SITE_ORIGIN).replace(/\/$/, "");
  }
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (typeof window !== "undefined") return window.location.origin;
  return PRODUCTION_SITE_ORIGIN;
}

/** Where users land after clicking the email confirmation link (then → /dashboard). */
export function getEmailConfirmRedirectUrl(): string {
  return `${getAuthSiteOrigin()}/auth/confirm`;
}

export function getDashboardUrl(): string {
  return `${getAuthSiteOrigin()}/dashboard`;
}
