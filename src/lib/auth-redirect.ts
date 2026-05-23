/** Primary production origin (emails, SEO). OAuth must use the tab origin — see getAuthSiteOrigin. */
export const PRODUCTION_SITE_ORIGIN = "https://tambuaafrica.com";

/**
 * Origin for auth redirects in the current browser tab.
 * PKCE stores the code verifier in localStorage per origin — never rewrite to another host.
 */
export function getAuthSiteOrigin(): string {
  if (typeof window !== "undefined") {
    return window.location.origin.replace(/\/$/, "");
  }

  const fromEnv = import.meta.env.VITE_SITE_URL?.trim().replace(/\/$/, "");
  if (fromEnv) {
    return fromEnv;
  }

  if (import.meta.env.PROD) {
    return PRODUCTION_SITE_ORIGIN;
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

/** OAuth return URL — must be same origin as the page where Google sign in started. */
export function getOAuthCallbackUrl(): string {
  return `${getAuthSiteOrigin()}/auth/callback`;
}

const AUTH_REDIRECT_STORAGE_KEY = "tambua_auth_redirect";

/** Remember post-login path before redirecting to Google (localStorage survives OAuth redirect). */
export function stashAuthRedirect(path: string): void {
  if (typeof localStorage === "undefined") return;
  const safe =
    path.startsWith("/") && !path.startsWith("//") ? path : "/dashboard";
  localStorage.setItem(AUTH_REDIRECT_STORAGE_KEY, safe);
}

export function consumeAuthRedirect(): string {
  if (typeof localStorage === "undefined") return "/dashboard";
  const path = localStorage.getItem(AUTH_REDIRECT_STORAGE_KEY);
  localStorage.removeItem(AUTH_REDIRECT_STORAGE_KEY);
  if (path && path.startsWith("/") && !path.startsWith("//")) return path;
  return "/dashboard";
}
