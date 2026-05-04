import { useQuery } from "@tanstack/react-query";
import { destinationLodges as localDestinationLodges } from "@/data/destinations-lodges";
import { mergeDestinationLodgesCatalog, type DestinationLodgeRow } from "@/lib/destination-lodges-merge";
import { supabase } from "@/integrations/supabase/client";

export const useDestinationLodges = () => {
  return useQuery({
    queryKey: ["destination-lodges"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from("destination_lodges").select("*").order("order", { ascending: true });
        if (error) throw error;
        if (!data || data.length === 0) return localDestinationLodges;
        return mergeDestinationLodgesCatalog(localDestinationLodges, data as DestinationLodgeRow[]);
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
