import { fallbackLodgeImage } from "@/lib/remote-media-fallbacks";

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

/** Used when `lodges_service_cards` has no rows or Supabase is unavailable */
export const DEFAULT_LODGES_SERVICE_SHOWCASE: LodgesServiceShowcaseCard[] = [
  {
    id: "default-angama",
    sort_order: 0,
    name: "Angama Mara",
    area: "Masai Mara (Rift escarpment)",
    category: "Safari lodge",
    note: "Stunning views and high-end design, often paired with conservancy game drives.",
    image_url: seed("angama"),
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
    image_url: seed("kicheche"),
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
