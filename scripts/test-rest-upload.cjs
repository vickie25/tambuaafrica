// Test REST API upload
const dotenv = require("dotenv");
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const BUCKET = "safaris";

async function testRestUpload() {
  console.log("Testing REST API upload...\n");
  
  const fileName = `rest-test-${Date.now()}.txt`;
  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${fileName}`;
  
  console.log("URL:", uploadUrl);
  
  const start = Date.now();
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${ANON_KEY}`,
      "Content-Type": "text/plain",
      "x-upsert": "true",
    },
    body: "test content",
  });
  
  const elapsed = Date.now() - start;
  console.log("Time:", elapsed, "ms");
  console.log("Status:", response.status);
  
  if (response.ok) {
    console.log("✅ REST API upload works!");
    console.log("Public URL:", `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${fileName}`);
  } else {
    const text = await response.text();
    console.log("❌ Error:", text);
  }
}

testRestUpload().catch(console.error);