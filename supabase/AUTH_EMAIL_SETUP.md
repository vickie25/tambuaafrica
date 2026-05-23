# Option A: Resend Send Email Hook

Confirmation emails are sent by **Tambua Africa** via Resend. After the user clicks the link, they land on `/auth/confirm` and are redirected to **`/dashboard`**.

## Quick setup (about 10 minutes)

### 1. Save `.env` in the project root

```env
RESEND_API_KEY=re_your_key_from_resend.com
SEND_EMAIL_HOOK_SECRET=v1,whsec_from_supabase_dashboard

# Until your domain is verified in Resend:
AUTH_FROM_EMAIL=Tambua Africa Tours & Safaris <onboarding@resend.dev>

# After domain verification:
# AUTH_FROM_EMAIL=Tambua Africa Tours & Safaris <info@tambuaafrica.com>

AUTH_REPLY_TO=info@tambuaafrica.com
VITE_SITE_URL=http://localhost:8080
```

**Save the file** (Ctrl+S). An empty `.env` on disk will break deploy and local login.

### 2. Generate the hook secret (before deploy)

1. [Supabase Dashboard](https://supabase.com/dashboard/project/tulnrphqshxiybdreqec/auth/hooks) → **Authentication** → **Hooks**
2. **Send Email** → Enable → Type **HTTPS**
3. Click **Generate secret** → copy into `.env` as `SEND_EMAIL_HOOK_SECRET`

### 3. Deploy function + secrets

```bash
npm run setup:auth-email
```

This runs `supabase secrets set` and deploys `auth-send-email`.

### 4. Point the hook at your function

In the same **Send Email** hook panel:

| Field | Value |
|-------|--------|
| **URL** | `https://tulnrphqshxiybdreqec.supabase.co/functions/v1/auth-send-email` |
| **Secret** | Same value as `SEND_EMAIL_HOOK_SECRET` in `.env` |

Save / enable the hook.

### 5. Auth redirect URLs (live site → dashboard)

**Authentication** → **URL Configuration**:

| Field | Value |
|-------|--------|
| **Site URL** | `https://tambuaafrica.com` |
| **Redirect URLs** (add each line) | `https://tambuaafrica.com/**` |
| | `https://tambuaafrica.com/auth/confirm` |
| | `https://tambuaafrica.com/dashboard` |
| Optional (local dev only) | `http://localhost:8080/auth/confirm` |

Flow: email link → `https://tambuaafrica.com/auth/confirm` → auto redirect → `https://tambuaafrica.com/dashboard`.

Set edge secret so the hook always uses the live domain:

```bash
npx supabase secrets set AUTH_SITE_URL=https://tambuaafrica.com --project-ref tulnrphqshxiybdreqec
```

On **Vercel** (production deploy), set: `VITE_SITE_URL=https://tambuaafrica.com`

### 6. Test

1. Restart `npm run dev` if running locally.
2. Sign up at `/signup`.
3. Open the email (sender: Tambua Africa / your `AUTH_FROM_EMAIL`).
4. Click **Continue to Tambua Africa** → `/auth/confirm` → `/dashboard`.

## Hook URL

```
https://tulnrphqshxiybdreqec.supabase.co/functions/v1/auth-send-email
```

## Troubleshooting

| Problem | Fix |
|---------|-----|
| **Hook 500** / `Unexpected status code returned from hook: 500` | Run `npm run setup:auth-email`. If **Confirm email is OFF**, set `AUTH_SKIP_EMAIL_HOOK=true` in `.env` (default in setup script) so the hook returns 200 without calling Resend. Or **disable** the Send Email hook in the dashboard. If confirmation is ON, use `AUTH_FROM_EMAIL=... <onboarding@resend.dev>` until Resend domain is verified. Check **Edge Functions → auth-send-email → Logs**. |
| No email | Resend dashboard → Logs; function logs in Supabase → Edge Functions → auth-send-email |
| Hook 401 | `SEND_EMAIL_HOOK_SECRET` must match dashboard exactly (include `v1,whsec_` prefix) |
| Resend domain error | Use `onboarding@resend.dev` until domain is verified (function auto-retries with test sender) |
| Redirect error | Add `/auth/confirm` to redirect allow list |
| Still Supabase default mail | Hook must be **enabled**; email provider can stay enabled (hook takes over sending) |

## Reference

- [Supabase Send Email Hook](https://supabase.com/docs/guides/auth/auth-hooks/send-email-hook)
- [Resend](https://resend.com/)
