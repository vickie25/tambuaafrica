/** Live site used for email confirmation links (must match Supabase redirect allow list). */
export const PRODUCTION_SITE_ORIGIN = "https://tambuaafrica.com";

const CANONICAL_HOSTS = new Set(["tambuaafrica.com", "www.tambuaafrica.com"]);
const LEGACY_HOSTS = new Set(["tambua-africa.com", "www.tambua-africa.com"]);

/** Public site origin for auth redirects (must match Supabase Auth URL allow list). */
export function getAuthSiteOrigin(): string {
  if (typeof window !== "undefined") {
    const { hostname, origin } = window.location;
    if (CANONICAL_HOSTS.has(hostname)) {
      return PRODUCTION_SITE_ORIGIN;
    }
    if (LEGACY_HOSTS.has(hostname)) {
      return "https://tambua-africa.com";
    }
    return origin.replace(/\/$/, "");
  }

  const fromEnv = import.meta.env.VITE_SITE_URL?.trim().replace(/\/$/, "");
  if (fromEnv) {
    return fromEnv;
  }

  if (import.meta.env.PROD) {
    return PRODUCTION_SITE_ORIGIN;
  }

  if (typeof window !== "undefined") {
    return window.location.origin.replace(/\/$/, "");
  }

  return PRODUCTION_SITE_ORIGIN;
}

/** Where users land after clicking the email confirmation link (then → /dashboard). */
export function getEmailConfirmRedirectUrl(): string {
  return `${getAuthSiteOrigin()}/auth/confirm`;
}

export function getDashboardUrl(): string {
  return `${getAuthSiteOrigin()}/dashboard`;
}
