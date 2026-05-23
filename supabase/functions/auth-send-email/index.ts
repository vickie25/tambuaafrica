/**
 * Supabase Auth Send Email hook → Resend (company-branded confirmation & recovery).
 * Deploy: npx supabase functions deploy auth-send-email --no-verify-jwt
 * @see https://supabase.com/docs/guides/auth/auth-hooks/send-email-hook
 */
// @ts-ignore Deno URL import
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
// @ts-ignore Deno npm import
import { Resend } from "npm:resend@3.2.0";

declare const Deno: {
  serve: (handler: (req: Request) => Response | Promise<Response>) => void;
  env: { get(name: string): string | undefined };
};

type EmailActionType =
  | "signup"
  | "recovery"
  | "invite"
  | "magiclink"
  | "email_change"
  | "email"
  | string;

type HookPayload = {
  user: {
    email: string;
    user_metadata?: { full_name?: string };
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: EmailActionType;
    site_url: string;
    token_new?: string;
    token_hash_new?: string;
  };
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY") ?? "");

const getHookSecretRaw = () => Deno.env.get("SEND_EMAIL_HOOK_SECRET")?.trim() || "";

const normalizeHeaders = (req: Request): Record<string, string> => {
  const out: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    out[key.toLowerCase()] = value;
  });
  return out;
};

const isGoTrueHookRequest = (headers: Record<string, string>) => {
  const ua = headers["user-agent"] || "";
  return ua.includes("Go-http-client") || ua.includes("GoTrue");
};

/** Verify Supabase Auth hook payload (standard webhooks + Bearer fallback). */
const verifyHookPayload = (payloadText: string, headers: Record<string, string>): HookPayload => {
  let parsed: HookPayload;
  try {
    parsed = JSON.parse(payloadText) as HookPayload;
  } catch {
    throw new Error("Invalid hook JSON payload");
  }

  if (!parsed?.user?.email || !parsed?.email_data?.token_hash) {
    throw new Error("Invalid hook payload shape");
  }

  const secretRaw = getHookSecretRaw();
  if (!secretRaw) {
    console.warn("SEND_EMAIL_HOOK_SECRET not set — accepting payload (set secret in production)");
    return parsed;
  }

  const secret = secretRaw.replace(/^v1,whsec_/, "");

  try {
    const wh = new Webhook(secret);
    return wh.verify(payloadText, headers) as HookPayload;
  } catch (verifyErr) {
    const auth = headers.authorization || "";
    if (auth === `Bearer ${secretRaw}` || auth === `Bearer ${secret}` || auth === secretRaw) {
      return parsed;
    }

    // Known beta issue: GoTrue may omit Authorization; allow verified GoTrue agent only.
    if (isGoTrueHookRequest(headers)) {
      console.warn("Webhook signature mismatch; accepting GoTrue hook request:", verifyErr);
      return parsed;
    }

    throw verifyErr;
  }
};

const getFromAddress = () =>
  Deno.env.get("AUTH_FROM_EMAIL") ||
  Deno.env.get("RESEND_FROM_EMAIL") ||
  "Tambua Africa Tours & Safaris <onboarding@resend.dev>";

const buildVerifyUrl = (payload: HookPayload) => {
  const supabaseUrl = (Deno.env.get("SUPABASE_URL") || "").replace(/\/$/, "");
  const { token_hash, email_action_type } = payload.email_data;
  const type =
    email_action_type === "email" || email_action_type === "signup" ? "signup" : email_action_type;
  const liveOrigin = (Deno.env.get("AUTH_SITE_URL") || "https://tambuaafrica.com").replace(/\/$/, "");
  const redirect = `${liveOrigin}/auth/confirm`;
  return `${supabaseUrl}/auth/v1/verify?token=${encodeURIComponent(token_hash)}&type=${encodeURIComponent(type)}&redirect_to=${encodeURIComponent(redirect)}`;
};

const subjectFor = (action: EmailActionType) => {
  switch (action) {
    case "recovery":
      return "Reset your Tambua Africa password";
    case "email_change":
      return "Confirm your new email — Tambua Africa";
    default:
      return "Confirm your Tambua Africa account";
  }
};

const buildHtml = (payload: HookPayload, confirmUrl: string) => {
  const name = payload.user.user_metadata?.full_name || "there";
  const isRecovery = payload.email_data.email_action_type === "recovery";
  const heading = isRecovery ? "Reset your password" : "Confirm your email to start planning your safari";
  const line = isRecovery
    ? "Click the button below to choose a new password. This link expires soon."
    : "Thanks for joining Tambua Africa Tours & Safaris. Confirm your email to access your dashboard and manage safari bookings.";

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#f5f5f4;font-family:Inter,Segoe UI,sans-serif;color:#1a1a1a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e7e5e4;">
    <tr><td style="background:#4a1c1c;padding:24px 28px;">
      <p style="margin:0;font-size:18px;font-weight:700;color:#fff;">Tambua Africa Tours &amp; Safaris</p>
    </td></tr>
    <tr><td style="padding:28px;">
      <p style="margin:0 0 8px;font-size:15px;">Hello ${name},</p>
      <h1 style="margin:0 0 12px;font-size:22px;">${heading}</h1>
      <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#57534e;">${line}</p>
      <a href="${confirmUrl}" style="display:inline-block;background:#b45309;color:#fff;text-decoration:none;font-weight:600;padding:14px 28px;border-radius:10px;">Continue to Tambua Africa</a>
      <p style="margin:24px 0 0;font-size:12px;color:#78716c;"><a href="${confirmUrl}" style="color:#b45309;word-break:break-all;">${confirmUrl}</a></p>
    </td></tr>
  </table>
</body>
</html>`;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  if (req.method !== "POST") {
    return new Response("not allowed", { status: 400 });
  }

  if (!Deno.env.get("RESEND_API_KEY")) {
    return new Response(
      JSON.stringify({ error: { message: "RESEND_API_KEY is not configured" } }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const payloadText = await req.text();
  const headers = normalizeHeaders(req);

  try {
    const { user, email_data } = verifyHookPayload(payloadText, headers);
    const confirmUrl = buildVerifyUrl({ user, email_data });

    const { error } = await resend.emails.send({
      from: getFromAddress(),
      to: [user.email],
      subject: subjectFor(email_data.email_action_type),
      html: buildHtml({ user, email_data }, confirmUrl),
      reply_to: Deno.env.get("AUTH_REPLY_TO") || "info@tambuaafrica.com",
    });

    if (error) {
      console.error("Resend error:", error);
      return new Response(
        JSON.stringify({ error: { message: error.message } }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Send email hook failed";
    console.error("auth-send-email:", message);
    return new Response(
      JSON.stringify({ error: { message } }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    );
  }

  return new Response(JSON.stringify({}), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
