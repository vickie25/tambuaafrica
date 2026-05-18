/**
 * Smoke test: public signup flow (same API as /signup page).
 * Run: node scripts/test-signup.cjs
 */
const dotenv = require("dotenv");
const { createClient } = require("@supabase/supabase-js");

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !anonKey) {
  console.error("FAIL: Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env");
  process.exit(1);
}

const anon = createClient(supabaseUrl, anonKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const admin = serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;

async function main() {
  const runId = Date.now();
  const emailDomain = process.env.SIGNUP_TEST_EMAIL_DOMAIN || "mailinator.com";
  const email = `tambua.signup.${runId}@${emailDomain}`;
  const password = `TestSignup#${runId}`;
  const fullName = "Signup Test User";
  let userId = null;

  console.log("\n=== Tambua Africa — Signup smoke test ===\n");
  console.log(`Email: ${email}\n`);

  // 1) Sign up (matches AuthContext.signUp)
  const { data: signUpData, error: signUpError } = await anon.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: "http://localhost:8080/dashboard",
    },
  });

  if (signUpError) {
    console.error("FAIL signUp:", signUpError.message, signUpError);
    process.exit(1);
  }

  userId = signUpData.user?.id ?? null;
  const needsConfirmation = !signUpData.session;

  console.log("PASS signUp API call");
  console.log(`  user id: ${userId || "(none)"}`);
  console.log(`  session: ${signUpData.session ? "yes (auto-confirmed)" : "no (email confirmation required)"}`);
  console.log(`  identities: ${signUpData.user?.identities?.length ?? 0}`);

  if (!userId) {
    console.warn("\nWARN: No user id returned (Supabase may block duplicate/disposable emails).");
    process.exit(1);
  }

  // 2) Profile row (trigger should create on signup)
  if (admin) {
    await new Promise((r) => setTimeout(r, 1500));
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("id, full_name, role")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) {
      console.warn("WARN profiles lookup:", profileError.message);
    } else if (profile) {
      console.log("PASS profile row exists");
      console.log(`  full_name: ${profile.full_name}`);
      console.log(`  role: ${profile.role}`);
    } else {
      console.warn("WARN: No profile row yet (check handle_new_user trigger)");
    }
  }

  // 3) Sign-in: confirm email via admin if needed, then sign in
  if (admin && needsConfirmation) {
    const { error: confirmError } = await admin.auth.admin.updateUserById(userId, {
      email_confirm: true,
    });
    if (confirmError) {
      console.warn("WARN email confirm:", confirmError.message);
    } else {
      console.log("PASS admin confirmed email for test");
    }
  }

  const { data: signInData, error: signInError } = await anon.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    console.error("FAIL signIn after signup:", signInError.message);
    if (needsConfirmation) {
      console.error("  → Enable email confirmation bypass in Supabase or confirm email manually.");
    }
  } else if (signInData.session?.access_token) {
    console.log("PASS signIn after signup");
    console.log(`  access_token length: ${signInData.session.access_token.length}`);
  }

  // 4) Cleanup
  if (admin && userId) {
    const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
    if (deleteError) {
      console.warn("WARN cleanup deleteUser:", deleteError.message);
    } else {
      console.log("PASS cleaned up test user");
    }
  } else if (userId) {
    console.log("\nNOTE: Set SUPABASE_SERVICE_ROLE_KEY to auto-cleanup test user:", userId);
  }

  console.log("\n=== Signup test complete ===\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
