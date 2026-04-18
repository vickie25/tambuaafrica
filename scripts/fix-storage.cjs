// Execute SQL to fix storage RLS
const dotenv = require("dotenv");
dotenv.config();
const { createClient } = require("@supabase/supabase-js");

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function fixStorageRLS() {
  console.log("Executing SQL to fix storage RLS...\n");

  // The SQL to run
  const sql = `
    -- Enable RLS on storage.objects
    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

    -- Create policy to allow all operations on safaris bucket
    CREATE POLICY "safaris_public_access" ON storage.objects
    FOR ALL 
    USING (bucket_id = 'safaris')
    WITH CHECK (bucket_id = 'safaris');
  `;

  // Use postgrest to execute (via storage schema workaround)
  // Actually, we need to use the SQL endpoint directly
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
    },
    body: JSON.stringify({ query: sql })
  });

  if (response.ok) {
    console.log("✅ SQL executed successfully!");
  } else {
    const err = await response.text();
    console.log("Direct RPC failed:", err);
    console.log("\n📋 Please run this in Supabase SQL Editor:");
    console.log("---");
    console.log(`ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "safaris_public_access" ON storage.objects
FOR ALL 
USING (bucket_id = 'safaris')
WITH CHECK (bucket_id = 'safaris');`);
    console.log("---");
  }

  // Test again
  console.log("\n--- Testing anon upload ---");
  const anonClient = createClient(SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY);
  
  const start = Date.now();
  const { data, error } = await anonClient.storage
    .from("safaris")
    .upload(`test-${Date.now()}.txt`, "test");
  
  console.log(`Time: ${Date.now() - start}ms`);
  
  if (error) {
    console.log("Still blocked:", error.message);
  } else {
    console.log("✅ Upload works!");
  }
}

fixStorageRLS().catch(console.error);