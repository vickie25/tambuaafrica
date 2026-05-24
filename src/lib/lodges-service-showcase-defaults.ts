import { fallbackLodgeImage } from "@/lib/remote-media-fallbacks";
import { encodePublicImageSrc, normalizePublicImagePath } from "@/lib/public-image-path";

/** Public + admin shape for one lodges-service showcase card */
export type LodgesServiceShowcaseCard = {
  id: string;
  sort_order: number;
  name: string;
  area: string;
  category: string;
  note: string;
  image_url: string;
};

const seed = (slug: string) => fallbackLodgeImage(slug);

/** Stable local images for the lodges & camps service grid (survives deploy, no hotlink blocks). */
export const SHOWCASE_LODGE_IMAGE_BY_DEFAULT_ID: Record<string, string> = {
  "default-angama": "/images/maasai-mara-real.webp",
  "default-governors": "/images/destiations/Maasai Mara/bonfire marariver.webp",
  "default-kicheche": "/images/destiations/Maasai Mara/jambomara.webp",
  "default-tortilis": "/images/amboseli-real.webp",
  "default-ol-tukai": "/images/amboseli-final.webp",
  "default-finch": "/images/destiations/Tsavo/Voi safari lodge3.webp",
  "default-salt-lick": "/images/destiations/Tsavo/Red Elephant lodge.webp",
  "default-loisaba": "/images/samburu-reserve.webp",
  "default-elephant-bedroom": "/images/samburu-reserve.webp",
  "default-hells-gate": "/images/Park.webp",
  "default-naivasha-camp": "/images/destiations/Lake Naivasha/lake elementaita.webp",
  "default-nakuru-lodge": "/images/destiations/Lake Nakuru/lake elementaita.webp",
};

const showcaseImageByNameFragment = (name: string): string | undefined => {
  const n = name.toLowerCase();
  if (n.includes("angama")) return SHOWCASE_LODGE_IMAGE_BY_DEFAULT_ID["default-angama"];
  if (n.includes("kicheche")) return SHOWCASE_LODGE_IMAGE_BY_DEFAULT_ID["default-kicheche"];
  if (n.includes("governor")) return SHOWCASE_LODGE_IMAGE_BY_DEFAULT_ID["default-governors"];
  if (n.includes("tortilis")) return SHOWCASE_LODGE_IMAGE_BY_DEFAULT_ID["default-tortilis"];
  if (n.includes("ol tukai")) return SHOWCASE_LODGE_IMAGE_BY_DEFAULT_ID["default-ol-tukai"];
  if (n.includes("finch hattons")) return SHOWCASE_LODGE_IMAGE_BY_DEFAULT_ID["default-finch"];
  if (n.includes("salt lick")) return SHOWCASE_LODGE_IMAGE_BY_DEFAULT_ID["default-salt-lick"];
  if (n.includes("loisaba")) return SHOWCASE_LODGE_IMAGE_BY_DEFAULT_ID["default-loisaba"];
  if (n.includes("elephant bedroom")) return SHOWCASE_LODGE_IMAGE_BY_DEFAULT_ID["default-elephant-bedroom"];
  if (n.includes("hell") && n.includes("gate")) return SHOWCASE_LODGE_IMAGE_BY_DEFAULT_ID["default-hells-gate"];
  if (n.includes("naivasha")) return SHOWCASE_LODGE_IMAGE_BY_DEFAULT_ID["default-naivasha-camp"];
  if (n.includes("nakuru")) return SHOWCASE_LODGE_IMAGE_BY_DEFAULT_ID["default-nakuru-lodge"];
  return undefined;
};

export const explicitShowcaseImageForCard = (card: Pick<LodgesServiceShowcaseCard, "id" | "name">): string => {
  const byId = SHOWCASE_LODGE_IMAGE_BY_DEFAULT_ID[card.id];
  if (byId) return byId;
  const byName = showcaseImageByNameFragment(card.name);
  if (byName) return byName;
  return fallbackLodgeImage(card.id);
};

const isTrustedShowcaseImageUrl = (url: string): boolean => {
  const lower = url.toLowerCase();
  if (lower.includes("images.unsplash.com")) return true;
  if (lower.includes("supabase.co/storage")) return true;
  if (url.startsWith("/images/")) return true;
  return false;
};

/** Use DB/admin URL when valid; otherwise local defaults (fixes broken property hotlinks). */
export const resolveLodgesShowcaseImageUrl = (card: LodgesServiceShowcaseCard): string => {
  const fallback = explicitShowcaseImageForCard(card);
  const raw = card.image_url?.trim();
  if (!raw || raw.startsWith("blob:")) {
    return encodePublicImageSrc(fallback);
  }

  const normalized = normalizePublicImagePath(raw);
  if (normalized.startsWith("/images/")) {
    return encodePublicImageSrc(normalized);
  }

  if (isTrustedShowcaseImageUrl(normalized)) {
    return normalized.startsWith("http") ? normalized : encodePublicImageSrc(normalized);
  }

  if (/^https?:\/\//i.test(raw)) {
    return encodePublicImageSrc(fallback);
  }

  return encodePublicImageSrc(normalized || fallback);
};

/** DB rows first; built-in lodges fill any names not yet in the database. */
export const mergeShowcaseCardsWithDefaults = (
  dbRows: LodgesServiceShowcaseCard[],
): LodgesServiceShowcaseCard[] => {
  const dbNames = new Set(dbRows.map((r) => r.name.toLowerCase().trim()));
  const merged: LodgesServiceShowcaseCard[] = dbRows.map((row) => ({
    ...row,
    image_url: resolveLodgesShowcaseImageUrl(row),
  }));

  for (const def of DEFAULT_LODGES_SERVICE_SHOWCASE) {
    if (!dbNames.has(def.name.toLowerCase().trim())) {
      merged.push({
        ...def,
        image_url: resolveLodgesShowcaseImageUrl(def),
      });
    }
  }

  return merged.sort((a, b) => a.sort_order - b.sort_order);
};

/** Used when `lodges_service_cards` has no rows or Supabase is unavailable */
export const DEFAULT_LODGES_SERVICE_SHOWCASE: LodgesServiceShowcaseCard[] = [
  {
    id: "default-angama",
    sort_order: 0,
    name: "Angama Mara",
    area: "Masai Mara (Rift escarpment)",
    category: "Safari lodge",
    note: "Stunning views and high-end design, often paired with conservancy game drives.",
    image_url: SHOWCASE_LODGE_IMAGE_BY_DEFAULT_ID["default-angama"],
  },
  {
    id: "default-governors",
    sort_order: 1,
    name: "Governors’ Camp collection",
    area: "Masai Mara",
    category: "Tented camp",
    note: "Classic riverside and conservancy camps; strong guiding and traditional bush atmosphere.",
    image_url: seed("governors"),
  },
  {
    id: "default-kicheche",
    sort_order: 2,
    name: "Kicheche Camps",
    area: "Mara / Laikipia / Ol Pejeta",
    category: "Tented camp",
    note: "Small camps in wildlife-rich locations; good for photographers and repeat safari-goers.",
    image_url: SHOWCASE_LODGE_IMAGE_BY_DEFAULT_ID["default-kicheche"],
  },
  {
    id: "default-tortilis",
    sort_order: 3,
    name: "Tortilis Camp",
    area: "Amboseli",
    category: "Tented camp",
    note: "Kilimanjaro views and strong elephant country, and it pairs well with Tsavo or Nairobi extensions.",
    image_url: seed("tortilis"),
  },
  {
    id: "default-ol-tukai",
    sort_order: 4,
    name: "Ol Tukai Lodge",
    area: "Amboseli",
    category: "Safari lodge",
    note: "Upper mid-range lodge inside the park with iconic mountain vistas.",
    image_url: seed("ol-tukai"),
  },
  {
    id: "default-finch",
    sort_order: 5,
    name: "Finch Hattons",
    area: "Tsavo West",
    category: "Safari lodge",
    note: "Lodge-style comfort in Tsavo; combines with Tsavo East and coast hops.",
    image_url: seed("finch"),
  },
  {
    id: "default-salt-lick",
    sort_order: 6,
    name: "Sarova Salt Lick Game Lodge",
    area: "Taita Hills / Tsavo",
    category: "Safari lodge",
    note: "Elevated waterhole views, popular with first-time safari families.",
    image_url: seed("salt-lick"),
  },
  {
    id: "default-loisaba",
    sort_order: 7,
    name: "Loisaba Tented Camp",
    area: "Laikipia",
    category: "Tented camp",
    note: "Star beds and conservation landscape, great with Samburu or central Kenya routing.",
    image_url: seed("loisaba"),
  },
  {
    id: "default-elephant-bedroom",
    sort_order: 8,
    name: "Elephant Bedroom Camp",
    area: "Samburu",
    category: "Tented camp",
    note: "Riverine setting in elephant country; matches well with Laikipia or Mara air hops.",
    image_url: seed("elephant-bedroom"),
  },
  {
    id: "default-hells-gate",
    sort_order: 9,
    name: "Hell’s Gate National Park campsites",
    area: "Naivasha",
    category: "Campsite / budget camp",
    note: "Adventure camping near walking trails and cycling, often combined with Lake Naivasha lodges.",
    image_url: seed("hells-gate"),
  },
  {
    id: "default-naivasha-camp",
    sort_order: 10,
    name: "Lake Naivasha camping & tented lodges",
    area: "Great Rift Valley",
    category: "Campsite / budget camp",
    note: "Lakeside camps and bandas for budget-conscious travellers between parks.",
    image_url: seed("naivasha-camp"),
  },
  {
    id: "default-nakuru-lodge",
    sort_order: 11,
    name: "Lake Nakuru lodges (e.g. Sarova Lion Hill, Sopa)",
    area: "Lake Nakuru",
    category: "Safari lodge",
    note: "Rhino and flamingo viewing; natural bridge between Mara and Amboseli routing.",
    image_url: seed("nakuru-lodge"),
  },
];
