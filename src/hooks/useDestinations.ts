import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Destination, destinations as localDestinations } from "@/data/destinations";
import { fallbackDestinationImage } from "@/lib/remote-media-fallbacks";

export const useDestinations = () => {
  const query = useQuery({
    queryKey: ["destinations"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from("destinations").select("*");
        if (error) throw error;

        if (!data || data.length === 0) {
          return localDestinations;
        }

        const localById = new Map(localDestinations.map((dest) => [dest.id, dest]));

        return data.map((item) => {
          const local = localById.get(item.id);
          const normalizedImages = Array.isArray((item as { images?: unknown }).images)
            ? ((item as { images?: string[] }).images as string[])
            : item.image
              ? [item.image]
              : [];

          const finalImage =
            (item.image || local?.image || "").trim() || fallbackDestinationImage(String(item.id || "destination"));
          const finalImages =
            normalizedImages.length > 0
              ? normalizedImages
              : local?.images?.length
                ? local.images
                : [finalImage];

          return {
            ...item,
            image: finalImage,
            safariCount: item.safari_count ?? local?.safariCount ?? 0,
            images: finalImages,
          };
        }) as Destination[];
      } catch (err) {
        console.warn("Supabase fetch failed. Falling back to local Destinations data.");
        return localDestinations;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 mins - reduced from 30 mins for faster updates
    gcTime: 1000 * 60 * 30,   // 30 mins - reduced from 1 hour
    refetchOnWindowFocus: true, // Enable to show updates when switching tabs
  });

  return query;
};
