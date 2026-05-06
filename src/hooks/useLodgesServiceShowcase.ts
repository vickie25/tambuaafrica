import { useQuery } from "@tanstack/react-query";
import { supabase, hasSupabaseEnv } from "@/integrations/supabase/client";
import {
  DEFAULT_LODGES_SERVICE_SHOWCASE,
  type LodgesServiceShowcaseCard,
} from "@/lib/lodges-service-showcase-defaults";

type Row = {
  id: string;
  sort_order: number;
  name: string;
  area: string;
  category: string;
  note: string;
  image_url: string;
};

function mapRow(r: Row): LodgesServiceShowcaseCard {
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

/** Ordered cards for the lodges service page. Uses DB when at least one row exists; otherwise curated defaults. */
export function useLodgesServiceShowcaseCards(): {
  cards: LodgesServiceShowcaseCard[];
  fromDatabase: boolean;
  isLoading: boolean;
  isError: boolean;
} {
  const q = useQuery({
    queryKey: ["lodges-service-cards"],
    queryFn: async (): Promise<Row[] | null> => {
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
    staleTime: 1000 * 60 * 2,
  });

  const rows = q.data;
  if (rows && rows.length > 0) {
    return {
      cards: rows.map(mapRow),
      fromDatabase: true,
      isLoading: q.isLoading,
      isError: q.isError,
    };
  }

  return {
    cards: DEFAULT_LODGES_SERVICE_SHOWCASE,
    fromDatabase: false,
    isLoading: q.isLoading,
    isError: q.isError,
  };
}
