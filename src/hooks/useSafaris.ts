import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Safari, safaris as localSafaris } from "@/data/safaris";

const BROKEN_SAFARI_IMAGE_MAP: Record<string, string> = {
  "/images/dawn-w-FmUx8z_Tz4A-unsplash.webp": "/images/destiations/Lake Nakuru/lake elementaita.webp",
};

const normalizeSafariImage = (image: string | null | undefined) => {
  if (!image) return image;
  return BROKEN_SAFARI_IMAGE_MAP[image] ?? image;
};

const mergeSafarisWithLocal = (remoteSafaris: Safari[]) => {
  const localById = new Map(localSafaris.map((safari) => [safari.id, safari]));
  const merged = [...localSafaris];

  remoteSafaris.forEach((remoteSafari) => {
    const localIndex = merged.findIndex((item) => item.id === remoteSafari.id);
    if (localIndex >= 0) {
      merged[localIndex] = { ...localById.get(remoteSafari.id), ...remoteSafari };
      return;
    }
    merged.push(remoteSafari);
  });

  return merged;
};

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
          console.log("Using local safaris: Supabase has", data?.length || 0, "safaris");
          return localSafaris;
        }

        const remoteSafaris = data.map((item) => ({
          ...item,
          image: normalizeSafariImage(item.image),
          stripePriceId: item.stripe_price_id || item.stripePriceId,
        })) as Safari[];

        return mergeSafarisWithLocal(remoteSafaris);
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
            image: normalizeSafariImage(data.image),
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
