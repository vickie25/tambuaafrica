/** User-friendly messages for Supabase Auth errors. */
export function formatAuthError(error: unknown): string {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error !== null && "message" in error
        ? String((error as { message: unknown }).message)
        : "Something went wrong. Please try again.";

  if (/rate limit|too many.*email|over_email_send/i.test(message)) {
    return "Email rate limit reached. Wait about an hour before requesting another email, or confirm your account in Supabase Dashboard → Authentication → Users.";
  }

  if (/email not confirmed|not confirmed/i.test(message)) {
    return "Please confirm your email first (check your inbox), or ask an admin to confirm your account.";
  }

  if (/invalid login credentials|invalid credentials/i.test(message)) {
    return "Incorrect email or password.";
  }

  if (/provider is not enabled|unsupported provider|oauth/i.test(message)) {
    return "Google sign in is not enabled yet. Ask the site admin to enable Google under Supabase Authentication Providers.";
  }

  if (/code verifier|pkce/i.test(message)) {
    return "Google sign in was interrupted. Use the same website address you started from (tambua-africa.com or tambuaafrica.com, not both), then try again.";
  }

  if (/hook requires authorization/i.test(message)) {
    return "Email service configuration issue. Try again shortly or contact support.";
  }

  return message;
}
