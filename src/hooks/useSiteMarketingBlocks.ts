import { useQuery } from "@tanstack/react-query";
import { supabase, hasSupabaseEnv } from "@/integrations/supabase/client";
import {
  SITE_MARKETING_DEFAULTS,
  SITE_MARKETING_IDS,
  type SiteMarketingBlock,
  type SiteMarketingBlockId,
} from "@/lib/site-marketing-defaults";
import { usePublicQueryMode } from "@/lib/use-public-query";

const ALL_IDS: SiteMarketingBlockId[] = [
  SITE_MARKETING_IDS.homeServicesIntro,
  SITE_MARKETING_IDS.lodgesServiceHero,
];

function mergeBlock(id: SiteMarketingBlockId, row: { eyebrow: string; headline: string; body: string } | null): SiteMarketingBlock {
  const d = SITE_MARKETING_DEFAULTS[id];
  if (!row) return { id, ...d };
  return {
    id,
    eyebrow: row.eyebrow?.trim() || d.eyebrow,
    headline: row.headline?.trim() || d.headline,
    body: row.body?.trim() || d.body,
  };
}

function buildMarketingBlocks(rows: Record<string, unknown>[]): Record<SiteMarketingBlockId, SiteMarketingBlock> {
  const base = {
    [SITE_MARKETING_IDS.homeServicesIntro]: mergeBlock(SITE_MARKETING_IDS.homeServicesIntro, null),
    [SITE_MARKETING_IDS.lodgesServiceHero]: mergeBlock(SITE_MARKETING_IDS.lodgesServiceHero, null),
  };

  if (!rows.length) return base;

  const byId = new Map(rows.map((r) => [r.id as SiteMarketingBlockId, r]));
  return {
    [SITE_MARKETING_IDS.homeServicesIntro]: mergeBlock(
      SITE_MARKETING_IDS.homeServicesIntro,
      (byId.get(SITE_MARKETING_IDS.homeServicesIntro) as { eyebrow: string; headline: string; body: string }) ?? null,
    ),
    [SITE_MARKETING_IDS.lodgesServiceHero]: mergeBlock(
      SITE_MARKETING_IDS.lodgesServiceHero,
      (byId.get(SITE_MARKETING_IDS.lodgesServiceHero) as { eyebrow: string; headline: string; body: string }) ?? null,
    ),
  };
}

export function useSiteMarketingBlocks() {
  const { useStatic, snapshot, queryOptions } = usePublicQueryMode();

  return useQuery({
    queryKey: ["site-marketing-blocks", ALL_IDS],
    queryFn: async (): Promise<Record<SiteMarketingBlockId, SiteMarketingBlock>> => {
      if (useStatic && snapshot?.site_marketing_blocks.length) {
        return buildMarketingBlocks(snapshot.site_marketing_blocks);
      }

      const base = buildMarketingBlocks([]);
      if (!hasSupabaseEnv) return base;

      const { data, error } = await supabase
        .from("site_marketing_blocks")
        .select("id, eyebrow, headline, body")
        .in("id", ALL_IDS);

      if (error || !data) return base;
      return buildMarketingBlocks(data as Record<string, unknown>[]);
    },
    initialData:
      useStatic && snapshot?.site_marketing_blocks.length
        ? buildMarketingBlocks(snapshot.site_marketing_blocks)
        : undefined,
    ...queryOptions,
  });
}

export function useSiteMarketingBlock(id: SiteMarketingBlockId) {
  const q = useSiteMarketingBlocks();
  const block: SiteMarketingBlock = q.data?.[id] ?? { id, ...SITE_MARKETING_DEFAULTS[id] };
  return { isLoading: q.isLoading, isError: q.isError, isFetching: q.isFetching, data: block };
}
