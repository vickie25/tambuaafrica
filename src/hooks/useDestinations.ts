import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Destination, destinations as localDestinations } from "@/data/destinations";
import { fallbackDestinationImage } from "@/lib/remote-media-fallbacks";
import { usePublicQueryMode } from "@/lib/use-public-query";

export function mapDestinationRows(data: Record<string, unknown>[]): Destination[] {
  if (!data.length) return localDestinations;
  const localById = new Map(localDestinations.map((dest) => [dest.id, dest]));

  return data.map((item) => {
    const local = localById.get(String(item.id));
    const normalizedImages = Array.isArray(item.images)
      ? (item.images as string[])
      : item.image
        ? [item.image as string]
        : [];

    const finalImage =
      ((item.image as string) || local?.image || "").trim() ||
      fallbackDestinationImage(String(item.id || "destination"));
    const finalImages =
      normalizedImages.length > 0 ? normalizedImages : local?.images?.length ? local.images : [finalImage];

    return {
      ...item,
      image: finalImage,
      safariCount: (item.safari_count as number) ?? local?.safariCount ?? 0,
      images: finalImages,
    } as Destination;
  });
}

async function fetchDestinationsFromDb(): Promise<Destination[]> {
  const { data, error } = await supabase.from("destinations").select("*");
  if (error) throw error;
  if (!data?.length) return localDestinations;
  return mapDestinationRows(data as Record<string, unknown>[]);
}

export const useDestinations = () => {
  const { useStatic, snapshot, queryOptions } = usePublicQueryMode();

  return useQuery({
    queryKey: ["destinations"],
    queryFn: async () => {
      if (useStatic && snapshot?.destinations.length) {
        return mapDestinationRows(snapshot.destinations);
      }
      return fetchDestinationsFromDb();
    },
    initialData:
      useStatic && snapshot?.destinations.length ? mapDestinationRows(snapshot.destinations) : undefined,
    ...queryOptions,
  });
};
