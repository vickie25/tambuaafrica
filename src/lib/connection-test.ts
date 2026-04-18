/**
 * Frontend-Backend Connection Test
 * Tests all connections between frontend and backend services
 */

import { supabase } from "@/integrations/supabase/client";

interface ConnectionTestResult {
  name: string;
  status: "success" | "failed" | "warning";
  message: string;
  timestamp: string;
}

const results: ConnectionTestResult[] = [];

const addResult = (name: string, status: ConnectionTestResult["status"], message: string) => {
  results.push({
    name,
    status,
    message,
    timestamp: new Date().toISOString(),
  });
};

export const testConnections = async () => {
  results.length = 0;
  console.log("🔍 Starting Frontend-Backend Connection Tests...\n");

  // Test 1: Environment Variables
  console.log("Test 1: Environment Variables");
  const envVars = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    VITE_STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
    VITE_RESEND_API_KEY: import.meta.env.VITE_RESEND_API_KEY,
  };

  if (envVars.VITE_SUPABASE_URL && envVars.VITE_SUPABASE_PUBLISHABLE_KEY) {
    addResult("Env Vars: Supabase", "success", "Supabase credentials loaded");
    console.log("✅ Supabase credentials loaded");
  } else {
    addResult("Env Vars: Supabase", "failed", "Missing Supabase credentials");
    console.log("❌ Missing Supabase credentials");
    return results;
  }

  // Test 2: Supabase Connection
  console.log("\nTest 2: Supabase Connection");
  try {
    const { data: { session } } = await supabase.auth.getSession();
    addResult("Connection: Supabase Auth", "success", "Connected to Supabase Auth");
    console.log("✅ Connected to Supabase Auth");
  } catch (err) {
    addResult("Connection: Supabase Auth", "failed", (err as Error).message);
    console.log("❌ Failed to connect to Supabase Auth:", (err as Error).message);
  }

  // Test 3: Database Access (Profiles Table)
  console.log("\nTest 3: Database Access");
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("count(*)", { count: "exact", head: true });

    if (error) throw error;
    addResult("Database: Profiles Table", "success", "Can access profiles table");
    console.log("✅ Can access profiles table");
  } catch (err) {
    addResult("Database: Profiles Table", "warning", (err as Error).message);
    console.log("⚠️ Cannot access profiles table:", (err as Error).message);
  }

  // Test 4: Bookings Table
  console.log("\nTest 4: Bookings Table");
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select("count(*)", { count: "exact", head: true });

    if (error) throw error;
    addResult("Database: Bookings Table", "success", "Can access bookings table");
    console.log("✅ Can access bookings table");
  } catch (err) {
    addResult("Database: Bookings Table", "warning", (err as Error).message);
    console.log("⚠️ Cannot access bookings table:", (err as Error).message);
  }

  // Test 5: Inquiry Submissions Table
  console.log("\nTest 5: Inquiry Submissions Table");
  try {
    const { data, error } = await supabase
      .from("inquiry_submissions")
      .select("count(*)", { count: "exact", head: true });

    if (error) throw error;
    addResult("Database: Inquiry Submissions Table", "success", "Can access inquiry_submissions table");
    console.log("✅ Can access inquiry_submissions table");
  } catch (err) {
    addResult("Database: Inquiry Submissions Table", "warning", (err as Error).message);
    console.log("⚠️ Cannot access inquiry_submissions table:", (err as Error).message);
  }

  // Test 6: Storage Bucket
  console.log("\nTest 6: Storage Bucket");
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) throw error;
    
    const safarisBucket = buckets.find((b) => b.name === "safaris");
    if (safarisBucket) {
      addResult("Storage: safaris Bucket", "success", "Bucket exists and accessible");
      console.log("✅ Storage bucket 'safaris' exists and is accessible");
    } else {
      addResult("Storage: safaris Bucket", "warning", "Bucket not found");
      console.log("⚠️ Storage bucket 'safaris' not found");
    }
  } catch (err) {
    addResult("Storage: safaris Bucket", "failed", (err as Error).message);
    console.log("❌ Cannot access storage:", (err as Error).message);
  }

  // Test 7: Edge Function - submit-inquiry
  console.log("\nTest 7: Edge Functions");
  try {
    // Test with invalid data to see if function is reachable
    const { data, error } = await supabase.functions.invoke("submit-inquiry", {
      body: {
        inquiryType: "contact",
        fullName: "Test User",
        email: "test@example.com",
        subject: "Test",
        message: "This is a test message",
      },
    });

    if (data || error) {
      addResult("Edge Function: submit-inquiry", "success", "Function is reachable");
      console.log("✅ Edge function 'submit-inquiry' is reachable");
    }
  } catch (err) {
    addResult("Edge Function: submit-inquiry", "failed", (err as Error).message);
    console.log("❌ Edge function 'submit-inquiry' failed:", (err as Error).message);
  }

  // Test 8: Stripe Configuration
  console.log("\nTest 8: Stripe Configuration");
  if (envVars.VITE_STRIPE_PUBLISHABLE_KEY) {
    addResult("Integration: Stripe", "success", "Stripe publishable key configured");
    console.log("✅ Stripe publishable key is configured");
  } else {
    addResult("Integration: Stripe", "warning", "Stripe publishable key not found");
    console.log("⚠️ Stripe publishable key not configured");
  }

  // Test 9: Email Service (Resend)
  console.log("\nTest 9: Email Service");
  if (envVars.VITE_RESEND_API_KEY) {
    addResult("Integration: Resend Email", "success", "Resend API key configured");
    console.log("✅ Resend API key is configured");
  } else {
    addResult("Integration: Resend Email", "warning", "Resend API key not found");
    console.log("⚠️ Resend API key not configured");
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("CONNECTION TEST SUMMARY");
  console.log("=".repeat(60));
  const successful = results.filter((r) => r.status === "success").length;
  const failed = results.filter((r) => r.status === "failed").length;
  const warnings = results.filter((r) => r.status === "warning").length;

  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️ Warnings: ${warnings}`);
  console.log("=".repeat(60));

  return results;
};

export const getConnectionReport = () => {
  return results;
};
