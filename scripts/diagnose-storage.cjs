// Check bucket public status and test anon key
const dotenv = require("dotenv");
dotenv.config();
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
const anonClient = createClient(SUPABASE_URL, ANON_KEY);

async function diagnose() {
  console.log("=== Storage Diagnosis ===\n");
  
  // 1. Check bucket settings
  const { data: buckets } = await supabase.storage.listBuckets();
  const safaris = buckets?.find(b => b.name === 'safaris');
  console.log("Bucket 'safaris' settings:");
  console.log("  - public:", safaris?.public);
  console.log("  - file_size_limit:", safaris?.file_size_limit);
  console.log("  - allowed_mime_types:", safaris?.allowed_mime_types);
  
  // 2. Try anon upload
  console.log("\n--- Testing anon key upload ---");
  const start = Date.now();
  const { data, error } = await anonClient.storage
    .from("safaris")
    .upload(`diag-${Date.now()}.txt`, "test content");
  
  console.log("Time:", Date.now() - start, "ms");
  
  if (error) {
    console.log("❌ Error:", error.message);
    console.log("\n🔴 ROOT CAUSE: RLS is blocking browser uploads");
    console.log("\n✅ SOLUTION: In Supabase Dashboard:");
    console.log("   1. Go to: https://supabase.com/dashboard/project/rtgurahirgyjnwdoepso/storage");
    console.log("   2. Click 'safaris' bucket");
    console.log("   3. Look for 'Public' toggle - turn it ON");
    console.log("   4. Or go to 'Policies' tab and add:");
    console.log("      Policy: Allow public access to safaris");
    console.log("      For: SELECT, INSERT, UPDATE, DELETE");
    console.log("      Condition: bucket_id = 'safaris'");
  } else {
    console.log("✅ Upload works!");
  }
}

diagnose().catch(console.error);