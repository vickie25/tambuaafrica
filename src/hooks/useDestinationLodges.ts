import { useQuery } from "@tanstack/react-query";
import { destinationLodges as localDestinationLodges } from "@/data/destinations-lodges";
import { mergeDestinationLodgesCatalog, type DestinationLodgeRow } from "@/lib/destination-lodges-merge";
import { supabase } from "@/integrations/supabase/client";
import { usePublicQueryMode } from "@/lib/use-public-query";

export const useDestinationLodges = () => {
  const { useStatic, snapshot, queryOptions } = usePublicQueryMode();

  return useQuery({
    queryKey: ["destination-lodges"],
    queryFn: async () => {
      if (useStatic && snapshot?.destination_lodges.length) {
        return mergeDestinationLodgesCatalog(
          localDestinationLodges,
          snapshot.destination_lodges as DestinationLodgeRow[],
        );
      }
      try {
        const { data, error } = await supabase
          .from("destination_lodges")
          .select("*")
          .order("order", { ascending: true });
        if (error) throw error;
        if (!data?.length) return localDestinationLodges;
        return mergeDestinationLodgesCatalog(localDestinationLodges, data as DestinationLodgeRow[]);
      } catch (error) {
        console.warn("Failed to load destination lodges from DB; falling back to local data.", error);
        return localDestinationLodges;
      }
    },
    initialData:
      useStatic && snapshot?.destination_lodges.length
        ? mergeDestinationLodgesCatalog(
            localDestinationLodges,
            snapshot.destination_lodges as DestinationLodgeRow[],
          )
        : undefined,
    ...queryOptions,
  });
};
