import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Safari, safaris as localSafaris } from "@/data/safaris";
import { fallbackSafariImage } from "@/lib/remote-media-fallbacks";

const BROKEN_SAFARI_IMAGE_MAP: Record<string, string> = {
  "/images/dawn-w-FmUx8z_Tz4A-unsplash.webp": "/images/destiations/Lake Nakuru/lake elementaita.webp",
};

const normalizeSafariImage = (image: string | null | undefined) => {
  if (!image) return image;
  return BROKEN_SAFARI_IMAGE_MAP[image] ?? image;
};

export const useSafaris = () => {
  const query = useQuery({
    queryKey: ["safaris"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from("safaris").select("*");
        if (error) throw error;

        if (!data || data.length === 0) {
          return localSafaris;
        }

        return data.map((item) => {
          const normalized = normalizeSafariImage(item.image) ?? item.image;
          const image =
            (typeof normalized === "string" && normalized.trim()) || fallbackSafariImage(String(item.id));
          return {
            ...item,
            image,
            stripePriceId: item.stripe_price_id ?? "",
          };
        }) as Safari[];
      } catch (err) {
        console.warn("Supabase fetch failed. Falling back to local Safari data.");
        return localSafaris;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 mins - reduced from 30 mins for faster updates
    gcTime: 1000 * 60 * 30,   // 30 mins - reduced from 1 hour
    refetchOnWindowFocus: true, // Enable to show updates when switching tabs
  });

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
          const normalized = normalizeSafariImage(data.image) ?? data.image;
          const image =
            (typeof normalized === "string" && normalized.trim()) || fallbackSafariImage(String(data.id));
          return {
            ...data,
            image,
            stripePriceId: data.stripe_price_id ?? "",
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
