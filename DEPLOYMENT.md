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

1. Vercel → **Domains** → add **all** of these to the **same** project:
   - `tambuaafrica.com`, `www.tambuaafrica.com`
   - `tambua-africa.com`, `www.tambua-africa.com` (legacy; keep until DNS migration is done)
2. DNS at your registrar → point each hostname to Vercel (A/CNAME as shown)
3. `vercel.json` redirects `www` → non-`www` on each domain. **`tambua-africa.com` is not redirected to `tambuaafrica.com`** so `/images/...` keep working on the legacy hostname.

**Why images broke on `tambua-africa.com`:** A previous rule redirected every path (including `/images/...`) to `tambuaafrica.com`, where the apex host was not serving files yet → 404 for activity photos. The preview `*.vercel.app` URL had no such redirect, so images worked there.

If `https://tambuaafrica.com` still returns **404**, finish apex DNS in Vercel → Domains; use `https://tambua-africa.com` until then.

## 4. Supabase (required for auth & data)

In **Supabase Dashboard → Authentication → URL Configuration**:

| Setting | Value |
|---------|--------|
| **Site URL** | `https://tambuaafrica.com` (not `tambua-africa.com`) |
| **Redirect URLs** | `https://tambuaafrica.com/auth/confirm`, `https://tambuaafrica.com/**`, `https://tambua-africa.com/auth/confirm`, `https://tambua-africa.com/**` |

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
