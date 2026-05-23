/**
 * Apply auto-confirm migration via Supabase service role (SQL over REST).
 * Usage: node scripts/apply-auto-confirm.cjs
 */
const fs = require("node:fs");
const path = require("node:path");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const ENV_PATH = path.join(__dirname, "..", ".env");

function readEnv(name) {
  const v = process.env[name]?.trim();
  if (v) return v;
  if (!fs.existsSync(ENV_PATH)) return null;
  const line = fs
    .readFileSync(ENV_PATH, "utf8")
    .split(/\r?\n/)
    .find((l) => l.startsWith(`${name}=`) && !l.startsWith("#"));
  if (!line) return null;
  let value = line.slice(name.length + 1).trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  return value || null;
}

const url = readEnv("VITE_SUPABASE_URL");
const serviceKey = readEnv("SUPABASE_SERVICE_ROLE_KEY");

if (!url || !serviceKey) {
  console.error("Need VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const sql = fs.readFileSync(
  path.join(__dirname, "..", "supabase", "migrations", "20250524120000_auto_confirm_email.sql"),
  "utf8",
);

async function main() {
  const res = await fetch(`${url}/rest/v1/rpc`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  }).catch(() => null);

  // Run each statement via pg meta if available; fallback: admin API confirm users
  console.log("Confirming existing users via Admin API…");
  const listRes = await fetch(`${url}/auth/v1/admin/users?page=1&per_page=1000`, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
  });
  if (!listRes.ok) {
    console.error("Could not list users:", listRes.status, await listRes.text());
    console.log("\nRun this SQL in Supabase Dashboard → SQL Editor instead:\n");
    console.log(sql);
    process.exit(1);
  }

  const body = await listRes.json();
  const users = body.users || [];
  let confirmed = 0;
  for (const user of users) {
    if (user.email_confirmed_at) continue;
    const patch = await fetch(`${url}/auth/v1/admin/users/${user.id}`, {
      method: "PUT",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email_confirm: true }),
    });
    if (patch.ok) {
      confirmed += 1;
      console.log("Confirmed:", user.email);
    } else {
      console.warn("Failed:", user.email, await patch.text());
    }
  }

  console.log(`\nDone. Confirmed ${confirmed} user(s).`);
  console.log(
    "Also run supabase/migrations/20250524120000_auto_confirm_email.sql in SQL Editor for the auto-confirm trigger on new signups.",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
