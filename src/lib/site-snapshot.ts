/**
 * Build-time static CMS snapshot — avoids per-page Supabase round-trips on the public site.
 */

import bundledSnapshot from "@/generated/site-snapshot.json";

export type SiteSnapshot = {
  generatedAt: string;
  safaris: Record<string, unknown>[];
  destinations: Record<string, unknown>[];
  blogs: Record<string, unknown>[];
  carousel_images: Record<string, unknown>[];
  destination_lodges: Record<string, unknown>[];
  lodges_service_cards: Record<string, unknown>[];
  site_marketing_blocks: Record<string, unknown>[];
  reviews: Record<string, unknown>[];
};

export function getSiteSnapshot(): SiteSnapshot | null {
  if (!import.meta.env.PROD) return null;
  return bundledSnapshot as SiteSnapshot;
}

export function hasSiteSnapshot(): boolean {
  const s = getSiteSnapshot();
  if (!s?.generatedAt) return false;
  const total =
    s.safaris.length +
    s.destinations.length +
    s.blogs.length +
    s.carousel_images.length +
    s.destination_lodges.length;
  return total > 0;
}

const LIVE_PATH_PREFIXES = ["/admin", "/dashboard", "/booking", "/login", "/signup", "/diagnostics"];

export function isLiveDataPath(pathname: string): boolean {
  return LIVE_PATH_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/** React Query defaults for snapshot-backed public content. */
export const STATIC_QUERY_OPTIONS = {
  staleTime: Number.POSITIVE_INFINITY,
  gcTime: 1000 * 60 * 60 * 24,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  refetchOnMount: false,
} as const;

export const LIVE_QUERY_OPTIONS = {
  staleTime: 1000 * 60 * 5,
  gcTime: 1000 * 60 * 30,
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
  refetchOnMount: true,
} as const;
