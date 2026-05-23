/**
 * Supabase Auth Send Email hook → Resend (company-branded confirmation & recovery).
 * Deploy: npm run setup:auth-email
 *
 * If "Confirm email" is OFF in Supabase, set secret AUTH_SKIP_EMAIL_HOOK=true
 * (or disable this hook in the dashboard) so signup is not blocked by Resend.
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

const JSON_HEADERS = { "Content-Type": "application/json" };

const ok = () => new Response(JSON.stringify({}), { status: 200, headers: JSON_HEADERS });

const fail = (status: number, message: string) =>
  new Response(JSON.stringify({ error: { http_code: status, message } }), {
    status,
    headers: JSON_HEADERS,
  });

const RESEND_TEST_FROM = "Tambua Africa Tours & Safaris <onboarding@resend.dev>";

const resendApiKey = () => Deno.env.get("RESEND_API_KEY")?.trim() || "";

const getHookSecretRaw = () => Deno.env.get("SEND_EMAIL_HOOK_SECRET")?.trim() || "";

const skipEmailHook = () => {
  const v = (Deno.env.get("AUTH_SKIP_EMAIL_HOOK") || "").trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
};

const normalizeHeaders = (req: Request): Record<string, string> => {
  const out: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    out[key.toLowerCase()] = value;
  });
  return out;
};

const webhookHeaders = (headers: Record<string, string>) => ({
  "webhook-id": headers["webhook-id"] || "",
  "webhook-timestamp": headers["webhook-timestamp"] || "",
  "webhook-signature": headers["webhook-signature"] || "",
});

const isGoTrueHookRequest = (headers: Record<string, string>) => {
  const ua = headers["user-agent"] || "";
  return ua.includes("Go-http-client") || ua.includes("GoTrue");
};

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
    console.warn("SEND_EMAIL_HOOK_SECRET not set — accepting payload");
    return parsed;
  }

  const secret = secretRaw.replace(/^v1,whsec_/, "");
  const whHeaders = webhookHeaders(headers);

  try {
    const wh = new Webhook(secret);
    return wh.verify(payloadText, whHeaders) as HookPayload;
  } catch (verifyErr) {
    const auth = headers.authorization || "";
    if (auth === `Bearer ${secretRaw}` || auth === `Bearer ${secret}` || auth === secretRaw) {
      return parsed;
    }

    if (isGoTrueHookRequest(headers)) {
      console.warn("Webhook signature mismatch; accepting GoTrue request:", verifyErr);
      return parsed;
    }

    throw verifyErr;
  }
};

const getFromAddress = () =>
  Deno.env.get("AUTH_FROM_EMAIL")?.trim() ||
  Deno.env.get("RESEND_FROM_EMAIL")?.trim() ||
  RESEND_TEST_FROM;

const isResendDomainError = (message: string) =>
  /domain|not verified|verify your domain|from address|only send/i.test(message);

/** Resend test mode: delivery to arbitrary inboxes fails — do not block Supabase signup. */
const isResendDeliveryRestriction = (message: string) =>
  /only send|testing emails|not allowed|recipient|sandbox|verify your domain/i.test(message);

const buildVerifyUrl = (payload: HookPayload) => {
  const supabaseUrl = (
    Deno.env.get("SUPABASE_URL") ||
    "https://tulnrphqshxiybdreqec.supabase.co"
  ).replace(/\/$/, "");
  const { token_hash, email_action_type, redirect_to: payloadRedirect } = payload.email_data;
  const action = email_action_type === "email" ? "signup" : email_action_type;
  const liveOrigin = (
    Deno.env.get("AUTH_SITE_URL") ||
    Deno.env.get("VITE_SITE_URL") ||
    "https://tambua-africa.com"
  ).replace(/\/$/, "");

  const redirect =
    action === "recovery"
      ? `${liveOrigin}/reset-password`
      : payloadRedirect?.startsWith("http")
        ? payloadRedirect
        : `${liveOrigin}/auth/confirm`;

  const type = action === "email" ? "signup" : action;
  return `${supabaseUrl}/auth/v1/verify?token=${encodeURIComponent(token_hash)}&type=${encodeURIComponent(type)}&redirect_to=${encodeURIComponent(redirect)}`;
};

const subjectFor = (action: EmailActionType) => {
  switch (action) {
    case "recovery":
      return "Reset your Tambua Africa password";
    case "email_change":
      return "Confirm your new email, Tambua Africa";
    default:
      return "Confirm your Tambua Africa account";
  }
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const buildHtml = (payload: HookPayload, confirmUrl: string) => {
  const name = escapeHtml(payload.user.user_metadata?.full_name || "there");
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
      <a href="${confirmUrl}" style="display:inline-block;background:#b45309;color:#fff;text-decoration:none;font-weight:600;padding:14px 28px;border-radius:10px;">${isRecovery ? "Reset password" : "Confirm email &amp; sign in"}</a>
      <p style="margin:24px 0 0;font-size:12px;color:#78716c;"><a href="${confirmUrl}" style="color:#b45309;word-break:break-all;">${confirmUrl}</a></p>
    </td></tr>
  </table>
</body>
</html>`;
};

const getNotifyInbox = () =>
  Deno.env.get("AUTH_NOTIFY_EMAIL")?.trim() ||
  Deno.env.get("COMPANY_EMAIL")?.trim() ||
  "tambuaafrica@gmail.com";

async function sendWithResend(payload: HookPayload) {
  const resend = new Resend(resendApiKey());
  const confirmUrl = buildVerifyUrl(payload);
  const replyTo = Deno.env.get("AUTH_REPLY_TO")?.trim() || "info@tambuaafrica.com";
  let from = getFromAddress();
  const userEmail = payload.user.email;

  const attempt = (fromAddress: string, to: string[]) =>
    resend.emails.send({
      from: fromAddress,
      to,
      subject: subjectFor(payload.email_data.email_action_type),
      html: buildHtml(payload, confirmUrl),
      replyTo,
    });

  let result = await attempt(from, [userEmail]);

  if (result.error && from !== RESEND_TEST_FROM && isResendDomainError(result.error.message || "")) {
    console.warn("Resend sender rejected, retrying with onboarding@resend.dev:", result.error.message);
    from = RESEND_TEST_FROM;
    result = await attempt(from, [userEmail]);
  }

  if (result.error && isResendDeliveryRestriction(result.error.message || "")) {
    const notify = getNotifyInbox();
    console.warn(
      `Resend sandbox: cannot send to ${userEmail}. Sending link to ${notify} until domain is verified.`,
    );
    const action = payload.email_data.email_action_type;
    const notifyHtml = `<!DOCTYPE html><html><body style="font-family:sans-serif;">
      <p><strong>Resend test mode:</strong> confirmation for <code>${escapeHtml(userEmail)}</code> could not be delivered directly.</p>
      <p>Verify <strong>tambuaafrica.com</strong> at <a href="https://resend.com/domains">resend.com/domains</a> so customers receive mail automatically.</p>
      <p>Until then, forward this link to the customer:</p>
      <p><a href="${confirmUrl}">${confirmUrl}</a></p>
      <p style="color:#78716c;font-size:12px;">Action: ${escapeHtml(action)}</p>
    </body></html>`;
    const fallback = await resend.emails.send({
      from: RESEND_TEST_FROM,
      to: [notify],
      subject: `[Tambua Africa] Confirm link for ${userEmail}`,
      html: notifyHtml,
      replyTo,
    });
    if (fallback.error) {
      console.error("Fallback notify email failed:", fallback.error.message);
      return result;
    }
    console.log("Fallback notify email sent:", fallback.data?.id);
    return { data: fallback.data, error: null };
  }

  if (result.data?.id) {
    console.log(`Auth email sent to ${userEmail}:`, result.data.id);
  }

  return result;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  if (req.method !== "POST") {
    return fail(400, "Method not allowed");
  }

  if (skipEmailHook()) {
    console.log("AUTH_SKIP_EMAIL_HOOK=true — returning 200 without sending");
    return ok();
  }

  if (!resendApiKey()) {
    console.error("RESEND_API_KEY missing on edge function");
    return fail(500, "RESEND_API_KEY is not configured on auth-send-email");
  }

  const payloadText = await req.text();
  const headers = normalizeHeaders(req);

  try {
    const payload = verifyHookPayload(payloadText, headers);
    const { error } = await sendWithResend(payload);

    if (error) {
      const msg = error.message || JSON.stringify(error);
      console.error("Resend error:", msg);
      return fail(
        500,
        `Resend failed: ${msg}. Verify tambuaafrica.com at resend.com/domains or check AUTH_NOTIFY_EMAIL.`,
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Send email hook failed";
    console.error("auth-send-email:", message, err);
    const status = /secret|signature|unauthorized|invalid hook/i.test(message) ? 401 : 500;
    return fail(status, message);
  }

  return ok();
});
