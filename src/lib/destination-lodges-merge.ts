import type { DestinationLodges, Lodge } from "@/data/destinations-lodges";

export type DestinationLodgeRow = {
  id: string;
  destination_id: string;
  destination_name?: string | null;
  name: string;
  category: "luxury" | "mid-range" | "budget" | "camp";
  description: string;
  story: string;
  features?: string[] | null;
  image: string;
  images?: string[] | null;
  website?: string | null;
  order?: number | null;
};

function rowToLodge(row: DestinationLodgeRow): Lodge {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    description: row.description,
    story: row.story,
    features: Array.isArray(row.features) ? row.features : [],
    image: row.image,
    images: Array.isArray(row.images) ? row.images : row.image ? [row.image] : [],
    website: row.website || undefined,
  };
}

/**
 * Overlay Supabase rows onto the static catalogue so partial DB data does not
 * hide entire destinations. Rows with matching `id` replace local entries;
 * new ids append. Destinations only in DB are appended after known groups.
 */
export function mergeDestinationLodgesCatalog(
  local: DestinationLodges[],
  rows: DestinationLodgeRow[]
): DestinationLodges[] {
  if (!rows.length) return local;

  const localDestOrder = new Map(local.map((g, i) => [g.destinationId, i]));
  const dbOrderByLodgeId = new Map<string, number>();

  type Bucket = { destinationName: string; lodges: Lodge[]; localIndex: Map<string, number> };
  const byDest = new Map<string, Bucket>();

  for (const group of local) {
    const localIndex = new Map<string, number>();
    group.lodges.forEach((l, i) => localIndex.set(l.id, i));
    byDest.set(group.destinationId, {
      destinationName: group.destinationName,
      lodges: group.lodges.map((l) => ({ ...l })),
      localIndex,
    });
  }

  for (const row of rows) {
    const did = row.destination_id;
    let bucket = byDest.get(did);
    if (!bucket) {
      bucket = {
        destinationName: row.destination_name || did,
        lodges: [],
        localIndex: new Map(),
      };
      byDest.set(did, bucket);
    }
    if (row.destination_name) {
      bucket.destinationName = row.destination_name;
    }
    dbOrderByLodgeId.set(row.id, row.order ?? 0);
    const lodge = rowToLodge(row);
    const idx = bucket.lodges.findIndex((l) => l.id === row.id);
    if (idx >= 0) {
      bucket.lodges[idx] = lodge;
    } else {
      bucket.lodges.push(lodge);
    }
  }

  const merged: DestinationLodges[] = [];
  for (const [destinationId, bucket] of byDest) {
    const sorted = [...bucket.lodges].sort((a, b) => {
      const aDb = dbOrderByLodgeId.has(a.id);
      const bDb = dbOrderByLodgeId.has(b.id);
      if (aDb !== bDb) return aDb ? -1 : 1;
      if (aDb && bDb) return (dbOrderByLodgeId.get(a.id)! - dbOrderByLodgeId.get(b.id)!);
      return (bucket.localIndex.get(a.id) ?? 0) - (bucket.localIndex.get(b.id) ?? 0);
    });
    merged.push({
      destinationId,
      destinationName: bucket.destinationName,
      lodges: sorted,
    });
  }

  merged.sort((a, b) => (localDestOrder.get(a.destinationId) ?? 999) - (localDestOrder.get(b.destinationId) ?? 999));
  return merged;
}
