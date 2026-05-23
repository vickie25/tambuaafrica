// This file is manually configured for custom Supabase types
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

function readEnv(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  // Strip optional surrounding quotes from .env values
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

const SUPABASE_URL = readEnv(import.meta.env.VITE_SUPABASE_URL);

/** Prefer explicit publishable/anon VITE_* keys (required for browser). */
const SUPABASE_KEY =
  readEnv(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) ||
  readEnv(import.meta.env.VITE_SUPABASE_ANON_KEY);

export const hasSupabaseEnv = Boolean(SUPABASE_URL && SUPABASE_KEY);

if (!hasSupabaseEnv) {
  console.warn(
    "[Supabase] Missing VITE_SUPABASE_URL and/or VITE_SUPABASE_PUBLISHABLE_KEY. " +
      "Save your .env file in the project root and restart `npm run dev`."
  );
}

const finalUrl = SUPABASE_URL || "https://mock-url.supabase.co";
const finalKey =
  SUPABASE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock";

export const supabase = createClient<Database>(finalUrl, finalKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: "pkce",
  },
});
