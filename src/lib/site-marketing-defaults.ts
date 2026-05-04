/** Stable keys for `public.site_marketing_blocks` and local fallbacks. */
export const SITE_MARKETING_IDS = {
  homeServicesIntro: "home_services_intro",
  lodgesServiceHero: "lodges_service_hero",
} as const;

export type SiteMarketingBlockId = (typeof SITE_MARKETING_IDS)[keyof typeof SITE_MARKETING_IDS];

export type SiteMarketingBlock = {
  id: SiteMarketingBlockId;
  eyebrow: string;
  headline: string;
  body: string;
};

export const SITE_MARKETING_DEFAULTS: Record<SiteMarketingBlockId, Omit<SiteMarketingBlock, "id">> = {
  [SITE_MARKETING_IDS.homeServicesIntro]: {
    eyebrow: "Beyond the safari vehicle",
    headline: "Ticketing, transfers & lodges",
    body: "Tambua Africa supports the full trip, not only game drives. We help clients with tickets, ground and air connections, and lodge reservations so logistics feel effortless.",
  },
  [SITE_MARKETING_IDS.lodgesServiceHero]: {
    eyebrow: "On your behalf",
    headline: "Lodge & camp booking in Kenya",
    body: "We reserve safari lodges, tented camps, Nairobi and Mombasa hotels, and selected campsites according to your budget, dates, and style, then align confirmations with your tickets and transfers.",
  },
};
