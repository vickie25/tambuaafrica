#!/usr/bin/env node

const dotenv = require("dotenv");
const { createClient } = require("@supabase/supabase-js");

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const requiredVars = [
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
];

const missingVars = requiredVars.filter((name) => !process.env[name]);

if (missingVars.length > 0) {
  console.error("Missing required environment variables:");
  for (const name of missingVars) {
    console.error(`- ${name}`);
  }
  process.exit(1);
}

const anonClient = createClient(SUPABASE_URL, ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const serviceClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const TABLES = [
  "profiles",
  "safaris",
  "destinations",
  "blogs",
  "bookings",
  "inquiry_submissions",
  "carousel_images",
];

const formatError = (error) => {
  if (!error) return null;
  if (typeof error === "string") return error;
  if (typeof error.message === "string" && error.message.length > 0) return error.message;
  if (typeof error.error_description === "string" && error.error_description.length > 0) return error.error_description;
  if (typeof error.details === "string" && error.details.length > 0) return error.details;
  if (typeof error.hint === "string" && error.hint.length > 0) return error.hint;
  return JSON.stringify(error);
};

const summarizeCount = (count, error) => {
  if (error) return `error: ${formatError(error)}`;
  if (typeof count === "number") return `${count} rows`;
  return "no count returned";
};

async function inspectTable(table) {
  const [anonResult, serviceResult] = await Promise.all([
    anonClient.from(table).select("*", { count: "exact", head: true }),
    serviceClient.from(table).select("*", { count: "exact", head: true }),
  ]);

  return {
    table,
    anon: {
      count: anonResult.count ?? null,
      error: formatError(anonResult.error),
    },
    service: {
      count: serviceResult.count ?? null,
      error: formatError(serviceResult.error),
    },
  };
}

async function inspectProfiles() {
  const [usersResult, profilesResult] = await Promise.all([
    serviceClient.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    serviceClient.from("profiles").select("id, role"),
  ]);

  const users = usersResult.data?.users ?? [];
  const profiles = profilesResult.data ?? [];
  const profileIds = new Set(profiles.map((profile) => profile.id));

  return {
    usersError: formatError(usersResult.error),
    profilesError: formatError(profilesResult.error),
    authUsersCount: users.length,
    profilesCount: profiles.length,
    missingProfiles: users
      .filter((user) => !profileIds.has(user.id))
      .map((user) => ({
        email: user.email,
        id: user.id,
      })),
    adminProfiles: profiles.filter((profile) => profile.role === "admin"),
  };
}

async function inspectBuckets() {
  const { data, error } = await serviceClient.storage.listBuckets();
  return {
    error: formatError(error),
    buckets: (data ?? []).map((bucket) => ({
      id: bucket.id,
      name: bucket.name,
      public: bucket.public,
    })),
  };
}

async function testAnonUpload() {
  const filePath = `diagnostics/diag-${Date.now()}.txt`;
  const { error } = await anonClient.storage.from("safaris").upload(filePath, "diagnostic", {
    contentType: "text/plain",
    upsert: false,
  });

  if (!error) {
    await serviceClient.storage.from("safaris").remove([filePath]);
  }

  return {
    ok: !error,
    error: formatError(error),
  };
}

async function main() {
  console.log("=== Supabase Diagnosis ===");
  console.log(`Project: ${new URL(SUPABASE_URL).host}`);
  console.log("");

  const [tableResults, profileSummary, bucketSummary, anonUpload] = await Promise.all([
    Promise.all(TABLES.map(inspectTable)),
    inspectProfiles(),
    inspectBuckets(),
    testAnonUpload(),
  ]);

  console.log("Table health:");
  for (const result of tableResults) {
    console.log(
      `- ${result.table}: service=${summarizeCount(result.service.count, result.service.error)} | anon=${summarizeCount(result.anon.count, result.anon.error)}`
    );
  }

  console.log("");
  console.log("Auth/profile health:");
  console.log(`- auth users: ${profileSummary.authUsersCount}`);
  console.log(`- profiles: ${profileSummary.profilesCount}`);
  console.log(`- admin profiles: ${profileSummary.adminProfiles.length}`);

  if (profileSummary.usersError) {
    console.log(`- auth users error: ${profileSummary.usersError}`);
  }

  if (profileSummary.profilesError) {
    console.log(`- profiles error: ${profileSummary.profilesError}`);
  }

  if (profileSummary.missingProfiles.length > 0) {
    console.log("- missing profiles:");
    for (const missingProfile of profileSummary.missingProfiles) {
      console.log(`  ${missingProfile.email || "(no email)"} (${missingProfile.id})`);
    }
  }

  console.log("");
  console.log("Storage health:");
  if (bucketSummary.error) {
    console.log(`- bucket list error: ${bucketSummary.error}`);
  } else {
    for (const bucket of bucketSummary.buckets) {
      console.log(`- ${bucket.name}: public=${bucket.public}`);
    }
  }

  console.log(`- anon upload to safaris: ${anonUpload.ok ? "ok" : `blocked (${anonUpload.error})`}`);

  const criticalIssues = [];

  if (profileSummary.missingProfiles.length > 0) {
    criticalIssues.push("auth users exist without matching profiles rows");
  }

  if (!bucketSummary.buckets.some((bucket) => bucket.name === "safaris")) {
    criticalIssues.push("missing safaris bucket");
  }

  const safarisBucket = bucketSummary.buckets.find((bucket) => bucket.name === "safaris");
  if (safarisBucket && !safarisBucket.public) {
    criticalIssues.push("safaris bucket is not public");
  }

  if (!anonUpload.ok) {
    criticalIssues.push("anonymous uploads to safaris are blocked by storage policy");
  }

  const emptyTables = tableResults.filter((result) => result.service.count === 0).map((result) => result.table);
  if (emptyTables.length > 0) {
    criticalIssues.push(`core tables are empty: ${emptyTables.join(", ")}`);
  }

  console.log("");
  if (criticalIssues.length === 0) {
    console.log("No critical issues detected.");
  } else {
    console.log("Critical issues:");
    for (const issue of criticalIssues) {
      console.log(`- ${issue}`);
    }
  }
}

main().catch((error) => {
  console.error("Diagnosis failed:", error);
  process.exit(1);
});
