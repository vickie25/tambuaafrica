import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Destination, destinations as localDestinations } from "@/data/destinations";

const mergeDestinationsWithLocal = (remoteDestinations: Destination[]) => {
  const merged = [...localDestinations];
  remoteDestinations.forEach((remoteDestination) => {
    const localIndex = merged.findIndex((item) => item.id === remoteDestination.id);
    if (localIndex >= 0) {
      merged[localIndex] = { ...merged[localIndex], ...remoteDestination };
      return;
    }
    merged.push(remoteDestination);
  });
  return merged;
};

export const useDestinations = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["destinations"],
    queryFn: async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any).from("destinations").select("*");
        if (error) throw error;

        if (!data || data.length === 0) {
          return localDestinations;
        }

        const remoteDestinations = data.map((item) => ({
          ...item,
          safariCount: item.safari_count || item.safariCount,
        })) as Destination[];

        return mergeDestinationsWithLocal(remoteDestinations);
      } catch (err) {
        console.warn("Supabase fetch failed. Falling back to local Destinations data.");
        return localDestinations;
      }
    },
    initialData: localDestinations,
    staleTime: 1000 * 60 * 5, // 5 mins - reduced from 30 mins for faster updates
    gcTime: 1000 * 60 * 30,   // 30 mins - reduced from 1 hour
    refetchOnWindowFocus: true, // Enable to show updates when switching tabs
  });

  // Real-time subscription for destinations - disabled due to subscription conflicts
  // TODO: Re-enable once Supabase realtime is properly configured
  /*
  useEffect(() => {
    const channel = supabase
      .channel('destinations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'destinations'
        },
        (payload) => {
          console.log('Destinations real-time update:', payload);
          queryClient.invalidateQueries({ queryKey: ["destinations"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
  */

  return query;
};
