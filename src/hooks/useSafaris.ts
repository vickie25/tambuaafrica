import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Safari, safaris as localSafaris } from "@/data/safaris";

export const useSafaris = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["safaris"],
    queryFn: async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any).from("safaris").select("*");
        if (error) throw error;

        if (!data || data.length === 0) {
          return localSafaris;
        }

        return data.map((item) => ({
          ...item,
          stripePriceId: item.stripe_price_id || item.stripePriceId,
        })) as Safari[];
      } catch (err) {
        console.warn("Supabase fetch failed. Falling back to local Safari data.");
        return localSafaris;
      }
    },
    initialData: localSafaris,
    staleTime: 1000 * 60 * 5, // 5 mins - reduced from 30 mins for faster updates
    gcTime: 1000 * 60 * 30,   // 30 mins - reduced from 1 hour
    refetchOnWindowFocus: true, // Enable to show updates when switching tabs
  });

  // Real-time subscription for safaris - disabled due to subscription conflicts
  // TODO: Re-enable once Supabase realtime is properly configured
  /*
  useEffect(() => {
    const channel = supabase
      .channel('safaris-changes');

    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'safaris'
        },
        (payload) => {
          console.log('Safaris real-time update:', payload);
          queryClient.invalidateQueries({ queryKey: ["safaris"] });
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

export const useSafari = (id?: string) => {
  return useQuery({
    queryKey: ["safari", id],
    queryFn: async () => {
      if (!id) return null;
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await supabase.from("safaris").select("*").eq("id", id).maybeSingle();
        if (error) throw error;

        if (data) {
          return {
            ...data,
            stripePriceId: data.stripe_price_id || data.stripePriceId,
          } as Safari;
        }

        // Fallback
        return localSafaris.find((s) => s.id === id) || null;
      } catch (err) {
        console.warn(`Supabase fetch failed for safari ${id}. Falling back to local data.`);
        return localSafaris.find((s) => s.id === id) || null;
      }
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};
