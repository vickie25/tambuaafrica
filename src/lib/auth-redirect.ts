/** Live site used for email confirmation links (must match Supabase redirect allow list). */
export const PRODUCTION_SITE_ORIGIN = "https://tambuaafrica.com";

const PRODUCTION_HOSTS = new Set(["tambuaafrica.com", "www.tambuaafrica.com"]);

function isLegacyAuthHost(hostname: string): boolean {
  return hostname === "tambua-africa.com" || hostname === "www.tambua-africa.com";
}

/** Public site origin for auth redirects (must match Supabase Auth URL allow list). */
export function getAuthSiteOrigin(): string {
  if (typeof window !== "undefined") {
    const { hostname, origin } = window.location;
    if (PRODUCTION_HOSTS.has(hostname)) {
      return PRODUCTION_SITE_ORIGIN;
    }
    if (!isLegacyAuthHost(hostname)) {
      return origin.replace(/\/$/, "");
    }
  }

  const fromEnv = import.meta.env.VITE_SITE_URL?.trim().replace(/\/$/, "");
  if (fromEnv) {
    try {
      if (!isLegacyAuthHost(new URL(fromEnv).hostname)) return fromEnv;
    } catch {
      if (!fromEnv.includes("tambua-africa.com")) return fromEnv;
    }
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
