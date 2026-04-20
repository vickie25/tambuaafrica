export const SUPABASE_STORAGE_BUCKET =
  import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || "carousel-images";

export const SUPABASE_STORAGE_BUCKET_FALLBACKS = ["carousel-images", "safaris"] as const;
