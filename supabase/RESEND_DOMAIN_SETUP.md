# Why confirmation emails do not arrive

Resend is in **test mode** until you verify your domain. In test mode:

| Recipient | Result |
|-----------|--------|
| `tambuaafrica@gmail.com` (your Resend account email) | Delivered |
| Any other customer email | **Blocked** by Resend |

The auth hook now sends a **fallback email to `tambuaafrica@gmail.com`** with the customer’s confirm link when direct delivery fails. Check that inbox for `[Tambua Africa] Confirm link for …` and forward the link to the customer until the domain is verified.

## Permanent fix (required for production)

1. Open [resend.com/domains](https://resend.com/domains) → **Add domain** → `tambuaafrica.com`
2. Add the DNS records Resend shows (SPF, DKIM) at your domain host
3. Wait until status is **Verified**
4. Update `.env` (quoted):

```env
AUTH_FROM_EMAIL="Tambua Africa Tours & Safaris <info@tambuaafrica.com>"
AUTH_NOTIFY_EMAIL=tambuaafrica@gmail.com
SEND_EMAIL_HOOK_SECRET="v1,whsec_…from Supabase Auth Hooks"
```

5. Run:

```bash
npm run setup:auth-email
```

6. Sign up again with a real customer email and confirm delivery in **Resend → Emails**.

## Checklist

- [ ] Supabase → Authentication → Hooks → **Send Email** enabled → `auth-send-email` URL
- [ ] `AUTH_SKIP_EMAIL_HOOK=false` on edge (run setup script)
- [ ] `RESEND_API_KEY` set on edge function
- [ ] Domain **tambuaafrica.com** verified on Resend
- [ ] Supabase redirect URLs include `https://tambua-africa.com/auth/confirm`
