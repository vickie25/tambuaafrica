import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usePublicQueryMode } from "@/lib/use-public-query";
import { normalizePublicImagePath } from "@/lib/public-image-path";

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
].map(normalizePublicImagePath);

type CarouselRow = {
  id?: string | null;
  url?: string | null;
  title?: string | null;
  description?: string | null;
  order?: number | null;
  section?: string | null;
};

async function fetchCarouselRows(): Promise<CarouselRow[]> {
  const { data, error } = await supabase.from("carousel_images").select("*").order("order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as CarouselRow[];
}

/** Single query for all carousel sections (was 3+ duplicate fetches on the home page). */
export function useAllCarouselRows() {
  const { useStatic, snapshot, queryOptions } = usePublicQueryMode();

  return useQuery({
    queryKey: ["carousel-images-all"],
    queryFn: async () => {
      if (useStatic && snapshot?.carousel_images.length) {
        return snapshot.carousel_images as CarouselRow[];
      }
      return fetchCarouselRows();
    },
    initialData: useStatic && snapshot?.carousel_images.length ? (snapshot.carousel_images as CarouselRow[]) : undefined,
    ...queryOptions,
  });
}

export const useCarouselImages = (
  section:
    | "hero"
    | "activities"
    | "destinations"
    | "gallery"
    | "feature_wild"
    | "feature_culture"
    | "feature_luxury" = "hero",
) => {
  const allQuery = useAllCarouselRows();

  const data = useMemo(() => {
    const rows = allQuery.data ?? [];
    if (!rows.length) {
      return section === "hero" ? FALLBACK_HERO_IMAGES : [];
    }

    const validUrls = rows
      .filter((item) => (item.section || "hero") === section)
      .map((item) => normalizePublicImagePath(item.url))
      .filter((url): url is string => Boolean(url && url.trim().length > 0));

    if (validUrls.length > 0) return validUrls;
    return section === "hero" ? FALLBACK_HERO_IMAGES : [];
  }, [allQuery.data, section]);

  return {
    ...allQuery,
    data,
    placeholderData: section === "hero" ? FALLBACK_HERO_IMAGES : [],
  };
};

const extractIconMeta = (rawDescription?: string | null): { iconKey: string | null; description: string | null } => {
  const text = (rawDescription || "").trim();
  if (!text) return { iconKey: null, description: null };

  const match = text.match(/^\[\[icon:([a-z_]+)\]\]\s*/i);
  if (!match) return { iconKey: null, description: text };

  const iconKey = (match[1] || "").toLowerCase();
  const cleaned = text.replace(/^\[\[icon:[a-z_]+\]\]\s*/i, "").trim();
  return { iconKey, description: cleaned || null };
};

export const useCarouselImageItems = (
  section:
    | "hero"
    | "activities"
    | "destinations"
    | "gallery"
    | "feature_wild"
    | "feature_culture"
    | "feature_luxury" = "hero",
) => {
  const allQuery = useAllCarouselRows();

  const data = useMemo(() => {
    const rows = allQuery.data ?? [];
    return rows
      .filter((item) => (item.section || "hero") === section && Boolean(item.url && item.url.trim().length > 0))
      .map((item, idx) => {
        const parsed = extractIconMeta(item.description || null);
        return {
          id: item.id || `${section}-${idx}`,
          url: normalizePublicImagePath(item.url!.trim()),
          title: item.title?.trim() || `${section} image ${idx + 1}`,
          description: parsed.description,
          iconKey: parsed.iconKey,
          order: item.order ?? idx,
          section: (item.section || "hero") as CarouselImageItem["section"],
        };
      });
  }, [allQuery.data, section]);

  return { ...allQuery, data, placeholderData: [] as CarouselImageItem[] };
};
