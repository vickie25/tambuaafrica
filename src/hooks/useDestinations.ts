import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Destination, destinations as localDestinations } from "@/data/destinations";

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

        return data.map((item) => ({
          ...item,
          safariCount: item.safari_count || item.safariCount,
        })) as Destination[];
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
