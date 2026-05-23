import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Safari, safaris as localSafaris } from "@/data/safaris";
import { fallbackSafariImage } from "@/lib/remote-media-fallbacks";
import { normalizePublicImagePath } from "@/lib/public-image-path";
import { usePublicQueryMode } from "@/lib/use-public-query";

const normalizeSafariImage = (image: string | null | undefined) => {
  if (!image) return image;
  return normalizePublicImagePath(image);
};

export function mapSafariRows(data: Record<string, unknown>[]): Safari[] {
  if (!data.length) return localSafaris;
  return data.map((item) => {
    const normalized = normalizeSafariImage(item.image as string | null) ?? (item.image as string);
    const image =
      (typeof normalized === "string" && normalized.trim()) || fallbackSafariImage(String(item.id));
    return {
      ...item,
      image,
      stripePriceId: (item.stripe_price_id as string) ?? "",
    } as Safari;
  });
}

async function fetchSafarisFromDb(): Promise<Safari[]> {
  const { data, error } = await supabase.from("safaris").select("*");
  if (error) throw error;
  if (!data?.length) return localSafaris;
  return mapSafariRows(data as Record<string, unknown>[]);
}

export const useSafaris = () => {
  const { useStatic, snapshot, queryOptions } = usePublicQueryMode();

  return useQuery({
    queryKey: ["safaris"],
    queryFn: async () => {
      if (useStatic && snapshot?.safaris.length) {
        return mapSafariRows(snapshot.safaris);
      }
      return fetchSafarisFromDb();
    },
    initialData: useStatic && snapshot?.safaris.length ? mapSafariRows(snapshot.safaris) : undefined,
    ...queryOptions,
  });
};

export const useSafari = (id?: string) => {
  const { useStatic, queryOptions } = usePublicQueryMode();
  const listQuery = useSafaris();

  return useQuery({
    queryKey: ["safari", id],
    queryFn: async () => {
      if (!id) return null;
      if (listQuery.data) {
        const hit = listQuery.data.find((s) => s.id === id);
        if (hit) return hit;
      }
      try {
        const { data, error } = await supabase.from("safaris").select("*").eq("id", id).maybeSingle();
        if (error) throw error;
        if (data) {
          return mapSafariRows([data as Record<string, unknown>])[0] ?? null;
        }
        return localSafaris.find((s) => s.id === id) || null;
      } catch {
        return localSafaris.find((s) => s.id === id) || null;
      }
    },
    enabled: !!id && (!useStatic || !listQuery.data?.length),
    initialData: id && listQuery.data ? listQuery.data.find((s) => s.id === id) ?? undefined : undefined,
    ...queryOptions,
  });
};
