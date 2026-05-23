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
    return "This account is not active yet. Try signing up again, use Google sign in, or contact info@tambuaafrica.com for help.";
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

  if (
    /hook|resend|send email|unexpected failure|error sending confirmation|500/i.test(message)
  ) {
    return "We could not send the confirmation email right now. Your account may still be created: try signing in, or use Continue with Google. If sign in fails, contact info@tambuaafrica.com.";
  }

  if (/user already registered|already been registered/i.test(message)) {
    return "This email already has an account. Sign in instead, or use Forgot password.";
  }

  return message;
}
