# Deploy Tambua Africa on Vercel

Repository: https://github.com/cresdynamics-lang/tambuaafrica

## 1. Import project in Vercel

1. Go to [vercel.com/new](https://vercel.com/new) → Import **cresdynamics-lang/tambuaafrica**
2. Framework preset: **Vite** (auto-detected from `vercel.json`)
3. Build command: `npm run build`
4. Output directory: `dist`
5. Install command: `npm install`

## 2. Environment variables (Production)

Add in **Vercel → Project → Settings → Environment Variables** for **Production** (and Preview if needed):

| Variable | Example / notes |
|----------|-----------------|
| `VITE_SUPABASE_URL` | `https://tulnrphqshxiybdreqec.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase **anon** JWT (`eyJ...`) |
| `VITE_SITE_URL` | `https://tambuaafrica.com` |
| `VITE_GA_MEASUREMENT_ID` | Optional: `G-XXXXXXXXXX` |

Do **not** add `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, or `SEND_EMAIL_HOOK_SECRET` to Vercel — those stay in Supabase Edge Function secrets only.

## 3. Custom domain

1. Vercel → **Domains** → add `tambuaafrica.com` and `www.tambuaafrica.com`
2. DNS at your registrar → point **both** apex and `www` to Vercel (A/CNAME as shown in Vercel)
3. `vercel.json` redirects `www` → apex automatically

If `https://tambuaafrica.com` returns **404** but a `*.vercel.app` preview URL works, the apex domain is not linked to this project yet — finish DNS in Vercel → Domains.

## 4. Supabase (required for auth & data)

In **Supabase Dashboard → Authentication → URL Configuration**:

| Setting | Value |
|---------|--------|
| **Site URL** | `https://tambuaafrica.com` (not `tambua-africa.com`) |
| **Redirect URLs** | `https://tambuaafrica.com/auth/confirm`, `https://tambuaafrica.com/**` |

If signup shows `redirect_to=...tambua-africa.com` or returns **500**, the Site URL is still wrong or the **Send Email** hook failed — see `supabase/AUTH_EMAIL_SETUP.md` and re-run `npm run setup:auth-email`.

- **Send Email hook:** see `supabase/AUTH_EMAIL_SETUP.md`
- Run `npm run setup:auth-email` after changing Resend/hook secrets

## 5. Deploy

Push to `main` — Vercel deploys automatically if Git integration is enabled.

Manual: `vercel --prod` from repo root (with Vercel CLI linked).

## 6. Post-deploy checks

- [ ] https://tambuaafrica.com loads
- [ ] `/safaris`, `/contact`, `/blog` work (SPA routes)
- [ ] Sign up → confirmation email → `/dashboard`
- [ ] https://tambuaafrica.com/sitemap.xml
- [ ] https://tambuaafrica.com/robots.txt
