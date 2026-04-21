import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Destination, destinations as localDestinations } from "@/data/destinations";

export const useDestinations = () => {
  const query = useQuery({
    queryKey: ["destinations"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from("destinations").select("*");
        if (error) throw error;

        if (!data || data.length === 0) {
          return [] as Destination[];
        }

        return data.map((item) => ({
          ...item,
          safariCount: item.safari_count ?? 0,
          images: Array.isArray((item as { images?: unknown }).images)
            ? ((item as { images?: string[] }).images as string[])
            : item.image
              ? [item.image]
              : [],
        })) as Destination[];
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
