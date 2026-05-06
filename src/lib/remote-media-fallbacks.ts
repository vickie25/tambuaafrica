/**
 * Curated remote images when local `/images/...` assets are missing in the deploy bundle.
 * Stable per seed so the same lodge/destination keeps the same photo across reloads.
 */

const hashSeed = (seed: string) => {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) {
    h = (h << 5) - h + seed.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
};

const pick = (seed: string, pool: readonly string[]) => pool[hashSeed(seed) % pool.length]!;

/**
 * Base Unsplash URLs only (no query string). `OptimizedImage` applies width/height/quality
 * so hosted pages do not download 1400px assets for small cards.
 */
const SAFARI_POOL = [
  "https://images.unsplash.com/photo-1516426122078-c23e76319801",
  "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e",
  "https://images.unsplash.com/photo-1504173011901-53a29d304c63",
  "https://images.unsplash.com/photo-1474511320723-9a56873867b5",
  "https://images.unsplash.com/photo-1564760055775-d63b17a55c44",
  "https://images.unsplash.com/photo-1589656966895-2f33e7653819",
] as const;

const LODGE_POOL = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945",
  "https://images.unsplash.com/photo-1615880484749-a74f29051a35",
  "https://images.unsplash.com/photo-1596436889106-bd35c687a7e6",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4",
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d",
  "https://images.unsplash.com/photo-1445019980597-93fa8acb246c",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b",
  "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4",
] as const;

const COAST_POOL = [
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
  "https://images.unsplash.com/photo-1559827260-dc66d52bef19",
  "https://images.unsplash.com/photo-1544551763-46a013bb70d5",
  "https://images.unsplash.com/photo-1439066615861-d1af74d74900",
] as const;

export function fallbackSafariImage(seed: string): string {
  return pick(`safari:${seed}`, SAFARI_POOL);
}

export function fallbackLodgeImage(seed: string): string {
  return pick(`lodge:${seed}`, LODGE_POOL);
}

export function fallbackDestinationImage(seed: string): string {
  const s = seed.toLowerCase();
  if (
    s.includes("diani") ||
    s.includes("mombasa") ||
    s.includes("coast") ||
    s.includes("watamu") ||
    s.includes("chale") ||
    s.includes("wasini")
  ) {
    return pick(`dest-coast:${seed}`, COAST_POOL);
  }
  return pick(`dest:${seed}`, SAFARI_POOL);
}
