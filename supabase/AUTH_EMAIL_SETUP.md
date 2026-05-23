# Resend Send Email Hook (Tambua Africa branded mail)

All auth emails (signup confirm, password reset) are sent by **Tambua Africa Tours & Safaris** via **Resend**, not Supabase’s default mail. Supabase only triggers the hook.

## Security settings (Supabase Dashboard)

1. **Authentication → Providers → Email**
   - **Confirm email:** ON (required for signup security)
   - **Secure email change:** ON (recommended)

2. **Authentication → Hooks → Send Email**
   - Enabled, type **HTTPS**
   - URL: `https://tulnrphqshxiybdreqec.supabase.co/functions/v1/auth-send-email`
   - Secret: same as `SEND_EMAIL_HOOK_SECRET` in `.env`

3. **Authentication → URL Configuration**

| Field | Value |
|-------|--------|
| Site URL | `https://tambuaafrica.com` or `https://tambua-africa.com` |
| Redirect URLs | `https://tambuaafrica.com/**`, `https://tambua-africa.com/**` |
| | `https://tambuaafrica.com/auth/confirm`, `https://tambuaafrica.com/auth/callback`, `https://tambuaafrica.com/reset-password` |
| | Same paths on `tambua-africa.com` and `http://localhost:8080` for local dev |

**Google sign-in:** see [GOOGLE_AUTH_SETUP.md](./GOOGLE_AUTH_SETUP.md).

4. **Authentication → Rate Limits** (many users signing up at once)
   - On **Pro**, raise **email sent** limits per hour
   - Free tier is very low (~2 auth emails/hour) — upgrade or use Resend with hook (each user still counts toward Supabase hook calls)

5. **Do not** disable the Email provider while the hook is enabled — the hook replaces sending; both stay enabled.

## `.env` (project root)

```env
RESEND_API_KEY=re_xxxx
SEND_EMAIL_HOOK_SECRET=v1,whsec_xxxx

AUTH_FROM_EMAIL=Tambua Africa Tours & Safaris <onboarding@resend.dev>
# After Resend domain verify: Tambua Africa Tours & Safaris <info@tambuaafrica.com>

AUTH_REPLY_TO=info@tambuaafrica.com
AUTH_SKIP_EMAIL_HOOK=false
VITE_SITE_URL=https://tambua-africa.com
```

**Important:** `AUTH_SKIP_EMAIL_HOOK=false` so confirmation and password-reset emails are actually sent. If this was `true`, forgot-password would show success but **no email** would be delivered.

## Deploy

```bash
npm run setup:auth-email
```

## User flows

| Action | Email | Link lands on |
|--------|--------|----------------|
| Sign up | Confirm account (Tambua Africa) | `/auth/confirm` → `/dashboard` |
| Forgot password | Reset password (Tambua Africa) | `/reset-password` |

Password rules in the app: 8+ chars, upper, lower, number, symbol.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Forgot password “sent” but **no email** | Set `AUTH_SKIP_EMAIL_HOOK=false`, run `npm run setup:auth-email`. Check Resend → Logs and Supabase → Edge Functions → auth-send-email → Logs. |
| Email in spam | Normal until domain is verified in Resend; use branded sender after verify |
| Resend only delivers to your address | **Sandbox:** verify domain at resend.com/domains, or add recipient in Resend for testing |
| Hook 500 | `RESEND_API_KEY` on edge; use `onboarding@resend.dev` as `AUTH_FROM_EMAIL` |
| Hook 401 | `SEND_EMAIL_HOOK_SECRET` matches dashboard exactly |
| Rate limit on signup | Wait or raise limits in Supabase; different users can sign up — limit is per project/hour, not one-at-a-time |
| Supabase default email still arrives | Hook must be enabled; only one Send Email hook should be active |

## Reference

- [Supabase Send Email Hook](https://supabase.com/docs/guides/auth/auth-hooks/send-email-hook)
- [Resend](https://resend.com/)
