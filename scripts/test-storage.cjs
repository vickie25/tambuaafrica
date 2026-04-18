// Quick test to diagnose Supabase storage upload
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

async function testUpload() {
  console.log("Testing Supabase storage upload...\n");
  
  // 1. Check bucket exists
  const { data: buckets } = await supabase.storage.listBuckets();
  console.log("Buckets:", buckets?.map(b => b.name));
  
  const bucket = buckets?.find(b => b.name === "safaris");
  console.log("'safaris' bucket:", bucket ? "EXISTS" : "NOT FOUND");
  
  if (!bucket) {
    console.log("\n❌ Bucket doesn't exist! Creating...");
    const { data, error } = await supabase.storage.createBucket("safaris", { public: true });
    if (error) console.error("Create error:", error);
    else console.log("Created:", data);
    return;
  }
  
  // 2. Test simple upload
  console.log("\nTesting upload...");
  const testContent = "test content";
  const start = Date.now();
  
  const { data, error } = await supabase.storage
    .from("safaris")
    .upload(`test-${Date.now()}.txt`, testContent);
  
  const elapsed = Date.now() - start;
  console.log(`Upload time: ${elapsed}ms`);
  
  if (error) {
    console.error("❌ Upload error:", error.message);
  } else {
    console.log("✅ Upload successful!");
    console.log("File path:", data.path);
  }
  
  // 3. Check RLS policies
  console.log("\nChecking storage policies...");
  const { data: policies } = await supabase
    .from("pg_policies")
    .select("polname, polpermissive")
    .eq("schemaname", "storage");
    
  console.log("Storage policies:", policies?.length || 0);
}

testUpload().catch(console.error);