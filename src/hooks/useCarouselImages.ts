import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CarouselImageItem {
  id: string;
  url: string;
  title: string;
  description?: string | null;
  iconKey?: string | null;
  order: number;
  section?:
    | "hero"
    | "activities"
    | "destinations"
    | "gallery"
    | "feature_wild"
    | "feature_culture"
    | "feature_luxury";
}

export const FALLBACK_HERO_IMAGES = [
  "/images/Wild beast migration 2.webp",
  "/images/maasai-mara-real.webp",
  "/images/Diani Beach (2).webp",
  "/images/beach.webp",
  "/images/real images frm Tambua/Zebra at Nairobi park.jpeg",
  "/images/Jumping.webp",
];

export const useCarouselImages = (
  section:
    | "hero"
    | "activities"
    | "destinations"
    | "gallery"
    | "feature_wild"
    | "feature_culture"
    | "feature_luxury" = "hero"
) => {
  return useQuery({
    queryKey: ["carousel-images", section],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from("carousel_images").select("*").order("order", { ascending: true });

        if (error) throw error;

        if (!data || data.length === 0) {
          return section === "hero" ? FALLBACK_HERO_IMAGES : [];
        }

        type Row = { section?: string | null; url: string | null };
        const validUrls = (data as Row[])
          .filter((item) => (item.section || "hero") === section)
          .map((item) => item.url)
          .filter((url): url is string => Boolean(url && url.trim().length > 0));

        if (validUrls.length > 0) {
          return validUrls;
        }

        return section === "hero" ? FALLBACK_HERO_IMAGES : [];
      } catch (error) {
        console.warn("Failed to fetch carousel_images, using fallback images.", error);
        return section === "hero" ? FALLBACK_HERO_IMAGES : [];
      }
    },
    placeholderData: section === "hero" ? FALLBACK_HERO_IMAGES : [],
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
  });
};

export const useCarouselImageItems = (
  section:
    | "hero"
    | "activities"
    | "destinations"
    | "gallery"
    | "feature_wild"
    | "feature_culture"
    | "feature_luxury" = "hero"
) => {
  const extractIconMeta = (rawDescription?: string | null): { iconKey: string | null; description: string | null } => {
    const text = (rawDescription || "").trim();
    if (!text) return { iconKey: null, description: null };

    const match = text.match(/^\[\[icon:([a-z_]+)\]\]\s*/i);
    if (!match) return { iconKey: null, description: text };

    const iconKey = (match[1] || "").toLowerCase();
    const cleaned = text.replace(/^\[\[icon:[a-z_]+\]\]\s*/i, "").trim();
    return { iconKey, description: cleaned || null };
  };

  return useQuery({
    queryKey: ["carousel-image-items", section],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from("carousel_images").select("*").order("order", { ascending: true });

        if (error) throw error;
        if (!data || data.length === 0) return [] as CarouselImageItem[];

        type Row = {
          id?: string | null;
          url?: string | null;
          title?: string | null;
          description?: string | null;
          order?: number | null;
          section?: string | null;
        };

        return (data as Row[])
          .filter((item) => (item.section || "hero") === section && Boolean(item.url && item.url.trim().length > 0))
          .map((item, idx) => {
            const parsed = extractIconMeta(item.description || null);
            return {
              id: item.id || `${section}-${idx}`,
              url: item.url!.trim(),
              title: item.title?.trim() || `${section} image ${idx + 1}`,
              description: parsed.description,
              iconKey: parsed.iconKey,
              order: item.order ?? idx,
              section: (item.section || "hero") as CarouselImageItem["section"],
            };
          });
      } catch (error) {
        console.warn("Failed to fetch carousel image items.", error);
        return [] as CarouselImageItem[];
      }
    },
    placeholderData: [],
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
  });
};
