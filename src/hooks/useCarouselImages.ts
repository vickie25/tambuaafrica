import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CarouselImageItem {
  id: string;
  url: string;
  title: string;
  description?: string | null;
  order: number;
}

export const FALLBACK_HERO_IMAGES = [
  "/images/Wild beast migration 2.webp",
  "/images/maasai-mara-real.webp",
  "/images/Diani Beach (2).webp",
];

export const useCarouselImages = (
  section:
    | "hero"
    | "activities"
    | "destinations"
    | "feature_wild"
    | "feature_culture"
    | "feature_luxury" = "hero"
) => {
  return useQuery({
    queryKey: ["carousel-images", section],
    queryFn: async () => {
      try {
        const { data, error } = await (supabase as any)
          .from("carousel_images")
          .select("*")
          .order("order", { ascending: true });

        if (error) throw error;

        if (!data || data.length === 0) {
          return section === "hero" ? FALLBACK_HERO_IMAGES : [];
        }

        const validUrls = data
          .filter((item: any) => (item.section || "hero") === section)
          .map((item: any) => item.url)
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
    initialData: section === "hero" ? FALLBACK_HERO_IMAGES : [],
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
  });
};
