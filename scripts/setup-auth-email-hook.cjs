/**
 * Deploy auth-send-email and push Resend / hook secrets from .env
 *
 * Required in .env:
 *   RESEND_API_KEY
 *   SEND_EMAIL_HOOK_SECRET   (from Supabase Dashboard → Auth → Hooks → Send Email)
 *
 * Optional:
 *   AUTH_FROM_EMAIL          (verified domain sender, or onboarding@resend.dev for testing)
 *   AUTH_REPLY_TO
 *
 * Usage:
 *   node scripts/setup-auth-email-hook.cjs
 *   node scripts/setup-auth-email-hook.cjs --deploy-only
 */
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const PROJECT_REF = "tulnrphqshxiybdreqec";
const HOOK_URL = `https://${PROJECT_REF}.supabase.co/functions/v1/auth-send-email`;

const deployOnly = process.argv.includes("--deploy-only");

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { stdio: "inherit", shell: true, ...opts });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

function requireEnv(name) {
  const v = process.env[name]?.trim();
  if (!v) {
    console.error(`\nMissing ${name} in .env`);
    return null;
  }
  return v;
}

console.log("\n=== Tambua Africa — Resend Send Email Hook (Option A) ===\n");

if (!deployOnly) {
  const resendKey = requireEnv("RESEND_API_KEY");
  const hookSecret = process.env.SEND_EMAIL_HOOK_SECRET?.trim();

  if (!resendKey) {
    console.error("\nMissing RESEND_API_KEY in .env");
    process.exit(1);
  }

  if (!hookSecret) {
    console.warn(`
WARN: SEND_EMAIL_HOOK_SECRET is not in .env.
Copy the secret from Supabase → Authentication → Hooks → Send Email (Generate secret)
into .env, then re-run this script so edge secrets stay in sync.
`);
  }

  const secrets = [`RESEND_API_KEY=${resendKey}`];
  if (hookSecret) secrets.push(`SEND_EMAIL_HOOK_SECRET=${hookSecret}`);

  const from =
    process.env.AUTH_FROM_EMAIL?.trim() ||
    "Tambua Africa Tours & Safaris <onboarding@resend.dev>";
  const replyTo = process.env.AUTH_REPLY_TO?.trim() || "info@tambuaafrica.com";
  const siteUrl =
    process.env.AUTH_SITE_URL?.trim() ||
    process.env.VITE_SITE_URL?.trim() ||
    "https://tambua-africa.com";
  const skipHook = (process.env.AUTH_SKIP_EMAIL_HOOK || "false").trim().toLowerCase();

  secrets.push(`AUTH_FROM_EMAIL=${from}`);
  secrets.push(`AUTH_REPLY_TO=${replyTo}`);
  secrets.push(`AUTH_SITE_URL=${siteUrl}`);
  secrets.push(`AUTH_SKIP_EMAIL_HOOK=${skipHook}`);

  const secretsFile = path.join(__dirname, "..", ".env.auth-email.secrets");
  fs.writeFileSync(secretsFile, secrets.join("\n") + "\n", "utf8");

  console.log("Setting Supabase edge function secrets…");
  run("npx", ["supabase", "secrets", "set", "--env-file", secretsFile, "--project-ref", PROJECT_REF]);

  try {
    fs.unlinkSync(secretsFile);
  } catch {
    /* ignore */
  }
}

console.log("\nDeploying auth-send-email function…");
run("npx", ["supabase", "functions", "deploy", "auth-send-email", "--no-verify-jwt", "--project-ref", PROJECT_REF]);

console.log(`
Done.

Enable the hook in Supabase Dashboard:
  1. Authentication → Hooks → Send Email → Enable
  2. Type: HTTPS
  3. URL: ${HOOK_URL}
  4. Use the SAME secret you put in SEND_EMAIL_HOOK_SECRET

Auth URL allow list (Authentication → URL Configuration):
  - http://localhost:8080/auth/confirm
  - https://tambuaafrica.com/auth/confirm

Supabase Dashboard (required for security):
  1. Authentication → Providers → Email → turn ON "Confirm email"
  2. Authentication → Email Templates → leave enabled; the hook sends mail (not Supabase SMTP)
  3. Rate limits: Authentication → Rate Limits — raise email limits on Pro if many signups

AUTH_SKIP_EMAIL_HOOK=false by default (emails sent via Resend / Tambua Africa branding).
Set AUTH_SKIP_EMAIL_HOOK=true only for local testing without email.

Resend: verify tambuaafrica.com domain to send from info@tambuaafrica.com; until then use onboarding@resend.dev
`);
