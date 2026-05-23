/**
 * Confirm a user by email without sending another auth email (bypasses rate limit).
 *
 * Usage:
 *   node scripts/confirm-user.cjs your@email.com
 *
 * Requires in .env: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
const { createClient } = require("@supabase/supabase-js");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const email = process.argv[2]?.trim().toLowerCase();

if (!email) {
  console.error("Usage: node scripts/confirm-user.cjs your@email.com");
  process.exit(1);
}

const url = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

async function main() {
  const { data, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (listError) throw listError;

  const user = data.users.find((u) => u.email?.toLowerCase() === email);
  if (!user) {
    console.error(`No user found for ${email}. Sign up once, then run this again.`);
    process.exit(1);
  }

  const { data: updated, error } = await supabase.auth.admin.updateUserById(user.id, {
    email_confirm: true,
  });

  if (error) throw error;

  console.log(`Confirmed: ${updated.user?.email} (id: ${updated.user?.id})`);
  console.log("You can sign in at /login now — no confirmation email needed.");
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
