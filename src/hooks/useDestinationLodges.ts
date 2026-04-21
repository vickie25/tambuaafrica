import { useQuery } from "@tanstack/react-query";
import { destinationLodges as localDestinationLodges, type DestinationLodges, type Lodge } from "@/data/destinations-lodges";
import { supabase } from "@/integrations/supabase/client";

type DestinationLodgeRow = {
  id: string;
  destination_id: string;
  destination_name?: string | null;
  name: string;
  category: "luxury" | "mid-range" | "budget" | "camp";
  description: string;
  story: string;
  features?: string[] | null;
  image: string;
  images?: string[] | null;
  website?: string | null;
  order?: number | null;
};

export const useDestinationLodges = () => {
  return useQuery({
    queryKey: ["destination-lodges"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from("destination_lodges").select("*").order("order", { ascending: true });
        if (error) throw error;
        if (!data || data.length === 0) return localDestinationLodges;

        const grouped = (data as DestinationLodgeRow[]).reduce<Record<string, DestinationLodges>>((acc, row) => {
          const destinationId = row.destination_id;
          if (!acc[destinationId]) {
            acc[destinationId] = {
              destinationId,
              destinationName: row.destination_name || destinationId,
              lodges: [],
            };
          }

          const lodge: Lodge = {
            id: row.id,
            name: row.name,
            category: row.category,
            description: row.description,
            story: row.story,
            features: Array.isArray(row.features) ? row.features : [],
            image: row.image,
            images: Array.isArray(row.images) ? row.images : row.image ? [row.image] : [],
            website: row.website || undefined,
          };
          acc[destinationId].lodges.push(lodge);
          return acc;
        }, {});

        return Object.values(grouped);
      } catch (error) {
        console.warn("Failed to load destination lodges from DB; falling back to local data.", error);
        return localDestinationLodges;
      }
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: true,
  });
};
