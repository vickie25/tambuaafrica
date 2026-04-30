// @ts-ignore Deno runtime URL import
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
// @ts-ignore Deno runtime URL import
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.99.2";
// @ts-ignore Deno npm: import
import { z } from "npm:zod@3.25.76";
// @ts-ignore Deno npm: import
import { Resend } from "npm:resend@3.2.0";

declare const Deno: {
  env: {
    get(name: string): string | undefined;
  };
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Content-Type": "application/json",
};

const baseInquirySchema = {
  fullName: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(50).optional().or(z.literal("")),
};

const bookingInquirySchema = z.object({
  inquiryType: z.literal("booking"),
  ...baseInquirySchema,
  safariId: z.string().trim().min(1).max(100),
  safariTitle: z.string().trim().min(1).max(200),
  preferredDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/),
  guests: z.string().trim().min(1).max(20),
  message: z.string().trim().max(3000).optional().or(z.literal("")),
});

const contactInquirySchema = z.object({
  inquiryType: z.literal("contact"),
  ...baseInquirySchema,
  subject: z.string().trim().min(2).max(150),
  message: z.string().trim().min(10).max(3000),
});

const inquirySchema = z.discriminatedUnion("inquiryType", [bookingInquirySchema, contactInquirySchema]);

type InquiryPayload = z.infer<typeof inquirySchema>;

type ServiceAccountCredentials = {
  client_email: string;
  private_key: string;
  token_uri?: string;
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: corsHeaders,
  });

const getEnv = (name: string) => {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(`${name} is not configured`);
  }
  return value;
};

const getOptionalEnv = (name: string) => Deno.env.get(name) || null;

const pemToArrayBuffer = (pem: string) => {
  const base64 = pem.replace(/-----BEGIN PRIVATE KEY-----/, "").replace(/-----END PRIVATE KEY-----/, "").replace(/\s+/g, "");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes.buffer;
};

const toBase64Url = (value: string | Uint8Array) => {
  const bytes = typeof value === "string" ? new TextEncoder().encode(value) : value;
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};

const createSignedJwt = async (credentials: ServiceAccountCredentials) => {
  const now = Math.floor(Date.now() / 1000);
  const header = toBase64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = toBase64Url(
    JSON.stringify({
      iss: credentials.client_email,
      scope: "https://www.googleapis.com/auth/spreadsheets",
      aud: credentials.token_uri || "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    }),
  );

  const data = `${header}.${payload}`;
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(credentials.private_key),
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(data));
  return `${data}.${toBase64Url(new Uint8Array(signature))}`;
};

const getGoogleAccessToken = async (credentials: ServiceAccountCredentials) => {
  const assertion = await createSignedJwt(credentials);
  const tokenUrl = credentials.token_uri || "https://oauth2.googleapis.com/token";

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.access_token) {
    throw new Error(`Google auth failed [${response.status}]: ${JSON.stringify(data)}`);
  }

  return data.access_token as string;
};

const googleRequest = async (accessToken: string, url: string, init?: RequestInit) => {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Sheets API failed [${response.status}]: ${errorText}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

const ensureWorksheet = async (accessToken: string, spreadsheetId: string, title: string) => {
  const metadata = await googleRequest(
    accessToken,
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties.title`,
  );

  const titles = Array.isArray(metadata?.sheets)
    ? metadata.sheets.map((sheet: { properties?: { title?: string } }) => sheet.properties?.title)
    : [];

  if (!titles.includes(title)) {
    await googleRequest(accessToken, `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: "POST",
      body: JSON.stringify({
        requests: [{ addSheet: { properties: { title } } }],
      }),
    });
  }
};

const ensureHeaders = async (accessToken: string, spreadsheetId: string, sheetTitle: string, headers: string[]) => {
  const range = encodeURIComponent(`${sheetTitle}!A1:N1`);
  const existing = await googleRequest(
    accessToken,
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`,
  );

  const firstRow = Array.isArray(existing?.values) ? existing.values[0] : null;

  if (!firstRow || firstRow.length === 0) {
    await googleRequest(
      accessToken,
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=RAW`,
      {
        method: "PUT",
        body: JSON.stringify({ values: [headers] }),
      },
    );
  }
};

const appendInquiryToSheet = async (payload: InquiryPayload, submissionId: string, createdAt: string) => {
  const spreadsheetId = getOptionalEnv("GOOGLE_SHEETS_SPREADSHEET_ID");
  const rawCredentials = getOptionalEnv("GOOGLE_SERVICE_ACCOUNT_JSON");

  if (!spreadsheetId || !rawCredentials) {
    console.warn("Google Sheets integration not configured, skipping sheet sync.");
    return false;
  }

  const credentials = JSON.parse(rawCredentials) as ServiceAccountCredentials;

  if (!credentials.client_email || !credentials.private_key) {
    console.warn("Google service account JSON is missing required fields, skipping sheet sync.");
    return false;
  }

  const accessToken = await getGoogleAccessToken(credentials);
  const sheetTitle = "Inquiries";
  const headers = [
    "Submitted At",
    "Type",
    "Full Name",
    "Email",
    "Phone",
    "Subject",
    "Message",
    "Safari ID",
    "Safari Title",
    "Preferred Date",
    "Guests",
    "Status",
    "Synced To Sheet",
    "Submission ID",
  ];

  await ensureWorksheet(accessToken, spreadsheetId, sheetTitle);
  await ensureHeaders(accessToken, spreadsheetId, sheetTitle, headers);

  const values = [
    createdAt,
    payload.inquiryType,
    payload.fullName,
    payload.email,
    payload.phone || "",
    payload.inquiryType === "contact" ? payload.subject : "",
    payload.message || "",
    payload.inquiryType === "booking" ? payload.safariId : "",
    payload.inquiryType === "booking" ? payload.safariTitle : "",
    payload.inquiryType === "booking" ? payload.preferredDate : "",
    payload.inquiryType === "booking" ? payload.guests : "",
    "synced",
    "yes",
    submissionId,
  ];

  await googleRequest(
    accessToken,
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(`${sheetTitle}!A:N`)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      body: JSON.stringify({ values: [values] }),
    },
  );

  return true;
};

const sendInquiryEmail = async (payload: InquiryPayload) => {
  const resendApiKey = getOptionalEnv("RESEND_API_KEY");
  const companyEmail =
    getOptionalEnv("COMPANY_NOTIFICATION_EMAIL") ||
    getOptionalEnv("COMPANY_EMAIL") ||
    "tambuaafrica@gmail.com";
  const fromEmail = getOptionalEnv("RESEND_FROM_EMAIL") || "onboarding@resend.dev";

  if (!resendApiKey) {
    console.warn("RESEND_API_KEY not configured, skipping email notification.");
    return false;
  }

  const resend = new Resend(resendApiKey);

  let subject: string;
  let htmlContent: string;

  if (payload.inquiryType === "contact") {
    subject = `New Contact Inquiry: ${payload.subject}`;
    htmlContent = `
      <h2>New Contact Inquiry</h2>
      <p><strong>From:</strong> ${payload.fullName}</p>
      <p><strong>Email:</strong> ${payload.email}</p>
      <p><strong>Phone:</strong> ${payload.phone || "Not provided"}</p>
      <p><strong>Subject:</strong> ${payload.subject}</p>
      <p><strong>Message:</strong></p>
      <p>${payload.message.replace(/\n/g, "<br>")}</p>
    `;
  } else {
    subject = `New Booking Inquiry: ${payload.safariTitle}`;
    htmlContent = `
      <h2>New Booking Inquiry</h2>
      <p><strong>From:</strong> ${payload.fullName}</p>
      <p><strong>Email:</strong> ${payload.email}</p>
      <p><strong>Phone:</strong> ${payload.phone || "Not provided"}</p>
      <p><strong>Safari:</strong> ${payload.safariTitle}</p>
      <p><strong>Preferred Date:</strong> ${payload.preferredDate}</p>
      <p><strong>Guests:</strong> ${payload.guests}</p>
      <p><strong>Message:</strong></p>
      <p>${payload.message?.replace(/\n/g, "<br>") || "No special requests"}</p>
    `;
  }

  await resend.emails.send({
    from: fromEmail,
    to: companyEmail,
    subject,
    html: htmlContent,
    reply_to: payload.email,
  });
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ success: false, error: "Method not allowed" }, 405);
  }

  try {
    const supabaseUrl = getEnv("SUPABASE_URL");
    const serviceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json();
    const parsed = inquirySchema.safeParse(body);

    if (!parsed.success) {
      return jsonResponse(
        {
          success: false,
          error: parsed.error.issues[0]?.message || "Invalid inquiry payload",
        },
        400,
      );
    }

    const payload = parsed.data;
    const insertPayload = {
      inquiry_type: payload.inquiryType,
      full_name: payload.fullName,
      email: payload.email,
      phone: payload.phone || null,
      subject: payload.inquiryType === "contact" ? payload.subject : null,
      message: payload.message || null,
      safari_id: payload.inquiryType === "booking" ? payload.safariId : null,
      safari_title: payload.inquiryType === "booking" ? payload.safariTitle : null,
      preferred_date: payload.inquiryType === "booking" ? payload.preferredDate : null,
      guests: payload.inquiryType === "booking" ? payload.guests : null,
      status: "pending",
    };

    let { data: submission, error: insertError } = await supabase
      .from("inquiry_submissions")
      .insert(insertPayload)
      .select("id, created_at")
      .single();

    // Backward compatibility for older production schemas that still use "name"
    // and do not contain the newer inquiry_* detail columns.
    if (insertError?.message?.includes("full_name")) {
      const legacyInsertPayload = {
        name: payload.fullName,
        email: payload.email,
        phone: payload.phone || null,
        message:
          payload.inquiryType === "contact"
            ? `[${payload.subject}] ${payload.message}`
            : payload.message || `Booking inquiry for ${payload.safariTitle}`,
        inquiry_type: payload.inquiryType,
        status: "unread",
      };

      const legacyInsert = await supabase
        .from("inquiry_submissions")
        .insert(legacyInsertPayload)
        .select("id, created_at")
        .single();

      submission = legacyInsert.data;
      insertError = legacyInsert.error;
    }

    if (insertError || !submission) {
      throw new Error(`Failed to save inquiry: ${insertError?.message || "Unknown insert error"}`);
    }

    // Send email notification
    try {
      await sendInquiryEmail(payload);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Don't fail the request if email fails, just log it
    }

    let sheetSynced = false;
    try {
      sheetSynced = await appendInquiryToSheet(payload, submission.id, submission.created_at);
    } catch (sheetError) {
      console.error("Google Sheets sync failed:", sheetError);
      sheetSynced = false;
    }

    if (sheetSynced) {
      try {
        await supabase
          .from("inquiry_submissions")
          .update({
            status: "synced",
            google_sync_attempted_at: new Date().toISOString(),
            google_sync_error: null,
          })
          .eq("id", submission.id);
      } catch (updateError) {
        console.error("Failed to update sync status:", updateError);
      }

      return jsonResponse({
        success: true,
        submissionId: submission.id,
        googleSheetsSynced: true,
      });
    }

    const syncMessage = "Google Sheets sync not configured or failed";
    try {
      await supabase
        .from("inquiry_submissions")
        .update({
          status: "sync_failed",
          google_sync_attempted_at: new Date().toISOString(),
          google_sync_error: syncMessage,
        })
        .eq("id", submission.id);
    } catch (updateError) {
      console.error("Failed to update failed sync status:", updateError);
    }

    return jsonResponse({
      success: true,
      submissionId: submission.id,
      googleSheetsSynced: false,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    console.error("submit-inquiry error:", message);
    return jsonResponse({ success: false, error: message }, 500);
  }
});
