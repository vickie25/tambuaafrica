/** Admin sign-in address (see update-admin.js). Legacy info@ still grants admin. */
export const ADMIN_LOGIN_EMAIL = "inf@tambuaafrica.com";

const ADMIN_EMAILS = new Set(
  [ADMIN_LOGIN_EMAIL, "info@tambuaafrica.com"].map((e) => e.toLowerCase()),
);

export function isAdminMailbox(email: string | null | undefined): boolean {
  const e = email?.toLowerCase().trim();
  return !!e && ADMIN_EMAILS.has(e);
}

/** Company inbox for Resend / booking & inquiry notifications */
export const COMPANY_INBOX_EMAIL = "info@tambuaafrica.com";
