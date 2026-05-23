# Google sign-in (Supabase OAuth)

The app supports **Continue with Google** on `/login` and `/signup`. Users return to `/auth/callback`, then go to the dashboard (or the page they started from).

## 1. Google Cloud Console

1. Open [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials**.
2. **Create credentials** → **OAuth client ID** → type **Web application**.
3. **Authorized JavaScript origins** (add each environment you use):
   - `http://localhost:8080` (Vite dev server in this project)
   - `https://tambua-africa.com`
   - `https://tambuaafrica.com`
4. **Authorized redirect URIs** (required — Supabase handles the OAuth exchange):
   - `https://tulnrphqshxiybdreqec.supabase.co/auth/v1/callback`
5. Copy **Client ID** and **Client secret**.

## 2. Supabase Dashboard

1. **Authentication** → **Providers** → **Google** → **Enable**.
2. Paste **Client ID** and **Client secret** → **Save**.
3. **Authentication** → **URL Configuration** → add to **Redirect URLs**:
   - `http://localhost:8080/auth/callback`
   - `https://tambua-africa.com/auth/callback`
   - `https://tambuaafrica.com/auth/callback`

## 3. Database (Google display names on profiles)

Run once in **SQL Editor** (or apply migration `20250523120000_google_profile_name.sql`):

```sql
-- See supabase/migrations/20250523120000_google_profile_name.sql
```

This sets `profiles.full_name` from Google’s `name` metadata when users sign up with Google.

## PKCE / “code verifier not found”

The PKCE secret is stored in **browser localStorage per domain**. It is lost if:

- You start Google sign in on `tambua-africa.com` but return on `tambuaafrica.com` (or the reverse).
- You use `www.` and the site redirects to non-www (or the reverse) mid flow.

**Fix:** Always use one URL for the live site. Add **both** callback URLs in Supabase if you use two domains:

- `https://tambua-africa.com/auth/callback`
- `https://tambuaafrica.com/auth/callback`

Start and finish Google sign in on the **same** hostname.

## Notes

- Google users skip email/password confirmation; Google has already verified the email.
- If the same email exists with password auth, Supabase may link identities depending on your **Authentication → Providers** settings.
- OAuth does not use the Resend Send Email hook (no signup email for pure Google sign-up).
