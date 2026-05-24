import { useQuery } from "@tanstack/react-query";
import { supabase, hasSupabaseEnv } from "@/integrations/supabase/client";
import {
  mergeShowcaseCardsWithDefaults,
  type LodgesServiceShowcaseCard,
} from "@/lib/lodges-service-showcase-defaults";
import { usePublicQueryMode } from "@/lib/use-public-query";

type Row = {
  id: string;
  sort_order: number;
  name: string;
  area: string;
  category: string;
  note: string;
  image_url: string;
};

function rowToCard(r: Row): LodgesServiceShowcaseCard {
  return {
    id: r.id,
    sort_order: r.sort_order,
    name: r.name?.trim() || "Untitled",
    area: r.area?.trim() || "",
    category: r.category?.trim() || "",
    note: r.note?.trim() || "",
    image_url: r.image_url?.trim() || "",
  };
}

export function useLodgesServiceShowcaseCards(): {
  cards: LodgesServiceShowcaseCard[];
  fromDatabase: boolean;
  isLoading: boolean;
  isError: boolean;
} {
  const { useStatic, snapshot, queryOptions } = usePublicQueryMode();

  const q = useQuery({
    queryKey: ["lodges-service-cards"],
    queryFn: async (): Promise<Row[] | null> => {
      if (useStatic && snapshot?.lodges_service_cards.length) {
        return snapshot.lodges_service_cards as Row[];
      }
      if (!hasSupabaseEnv) return null;
      const { data, error } = await supabase
        .from("lodges_service_cards")
        .select("id, sort_order, name, area, category, note, image_url")
        .order("sort_order", { ascending: true });

      if (error) {
        console.warn("lodges_service_cards:", error.message);
        return null;
      }
      return (data ?? []) as Row[];
    },
    initialData:
      useStatic && snapshot?.lodges_service_cards.length
        ? (snapshot.lodges_service_cards as Row[])
        : undefined,
    ...queryOptions,
  });

  const rows = q.data ?? [];
  return {
    cards: mergeShowcaseCardsWithDefaults(rows.map(rowToCard)),
    fromDatabase: rows.length > 0,
    isLoading: q.isLoading,
    isError: q.isError,
  };
}
