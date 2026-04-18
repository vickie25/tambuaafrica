import { supabase } from "@/integrations/supabase/client";

/**
 * Test Supabase connection
 * Run this in the browser console or in a component to verify backend connection
 */
export const testSupabaseConnection = async () => {
  console.log("=== Testing Supabase Connection ===");

  // Check if credentials are loaded
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  console.log("Supabase URL:", supabaseUrl || "MISSING");
  console.log("Supabase Key:", supabaseKey ? supabaseKey.substring(0, 10) + "..." : "MISSING");

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ FAILED: Supabase credentials not found in .env file");
    console.log("Please check your .env file has:");
    console.log("  VITE_SUPABASE_URL=your-project-url");
    console.log("  VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key");
    return false;
  }

  // Test database connection
  try {
    console.log("Testing database connection...");
    const { data, error } = await supabase
      .from("profiles")
      .select("count", { count: "exact", head: true });

    if (error) {
      console.error("❌ FAILED: Database connection error", error);
      return false;
    }

    console.log("✅ SUCCESS: Database connection working");
    console.log("Profiles count:", data);
  } catch (err) {
    console.error("❌ FAILED: Database connection failed", err);
    return false;
  }

  // Test auth connection
  try {
    console.log("Testing auth connection...");
    const { data: { session } } = await supabase.auth.getSession();
    console.log("✅ SUCCESS: Auth connection working");
    console.log("Current session:", session ? "Active" : "None");
  } catch (err) {
    console.error("❌ FAILED: Auth connection failed", err);
    return false;
  }

  console.log("=== All tests passed ===");
  return true;
};

// Auto-run on import in development
if (import.meta.env.DEV) {
  // Uncomment to auto-test on page load
  // testSupabaseConnection();
}
