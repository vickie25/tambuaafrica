/** Prefilled on /login?redirect=/admin. Must match a Supabase Auth user you control. */
export const ADMIN_LOGIN_EMAIL = "info@tambua-africa.com";

/** Company contact inboxes shown on the site and used for notifications. */
export const TEAM_CONTACT_EMAILS = [
  "info@tambua-africa.com",
  "isaac@tambua-africa.com",
  "jorim@tambua-africa.com",
] as const;

const ADMIN_EMAILS = new Set(
  TEAM_CONTACT_EMAILS.map((e) => e.toLowerCase()),
);

export function isAdminMailbox(email: string | null | undefined): boolean {
  const e = email?.toLowerCase().trim();
  return !!e && ADMIN_EMAILS.has(e);
}

/** Primary company inbox for Resend / booking & inquiry notifications */
export const COMPANY_INBOX_EMAIL = TEAM_CONTACT_EMAILS[0];
