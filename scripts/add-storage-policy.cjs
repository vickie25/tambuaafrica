// Add RLS policy to allow public uploads to safaris bucket
const dotenv = require("dotenv");
dotenv.config();
const { createClient } = require("@supabase/supabase-js");

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error("Missing credentials");
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function addStoragePolicy() {
  console.log("Adding public upload policy to 'safaris' bucket...\n");

  // Check existing policies on storage.objects
  const { data: existingPolicies } = await supabase
    .from("pg_policies")
    .select("polname, polpermissive")
    .eq("schemaname", "storage")
    .eq("tablename", "objects");

  console.log("Existing storage policies:", existingPolicies?.length || 0);
  
  // Check if our policy already exists
  const hasPolicy = existingPolicies?.some(p => p.polname === "safaris_public_access");
  if (hasPolicy) {
    console.log("✅ Policy 'safaris_public_access' already exists!");
    return;
  }

  // Create policy to allow public INSERT (upload) and SELECT (read)
  // This allows anyone to upload and read files in the safaris bucket
  const { data: insertPolicy, error: insertError } = await supabase.rpc(
    'exec_sql',
    {
      sql: `
        CREATE POLICY "safaris_public_access" ON storage.objects
        FOR ALL USING (
          bucket_id = 'safaris'
        ) WITH CHECK (
          bucket_id = 'safaris'
        );
      `
    }
  );

  if (insertError) {
    console.error("Error creating policy:", insertError.message);
    
    // Try alternative approach using direct SQL
    console.log("\nTrying alternative approach...");
    
    const { error: altError } = await supabase.storage
      .from("safaris")
      .createSignedUrl("test.txt", 3600);
      
    if (altError) {
      console.error("Storage still not accessible:", altError.message);
    }
  } else {
    console.log("✅ Policy created successfully!");
  }

  // Verify by testing upload with anon key
  console.log("\n--- Testing with anon key ---");
  const anonClient = createClient(SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY);
  
  const start = Date.now();
  const { data, error } = await anonClient.storage
    .from("safaris")
    .upload(`anon-test-${Date.now()}.txt`, "test content");
  
  console.log(`Anon upload time: ${Date.now() - start}ms`);
  
  if (error) {
    console.error("❌ Anon key upload failed:", error.message);
    console.log("\n🔧 Solution: Go to Supabase Dashboard → Storage → safaris bucket");
    console.log("   Enable 'Public' access or add RLS policy:");
    console.log("   Policy: bucket_id = 'safaris' for ALL operations");
  } else {
    console.log("✅ Anon key upload works!");
  }
}

addStoragePolicy().catch(console.error);