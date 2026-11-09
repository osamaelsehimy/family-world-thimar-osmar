# Family World – Thimar OSMAR

A lightweight family game MVP by OSMAR Ecosystems. The first release has seven worlds, simple email/password accounts, and play available after account creation. Arabic, English, and Simplified Chinese are included.

## Run locally

1. Install Node.js 20 or later.
2. Copy `.env.example` to `.env.local` and add the Supabase project URL and public anon key.
3. Run `npm install`, then `npm run dev`.
4. Open the local URL shown by Vite.

Without Supabase settings, the interface is available for preview, but account creation and sign-in are disabled. Never put a Supabase service-role key in browser settings.

## Prepare Supabase

1. Create a Supabase project and run `schema.sql` in its SQL editor. The SQL is intended for a **new project**; back up and review any existing database before applying it.
2. In Authentication → Providers, enable Email. Disable email confirmation only if instant play is required; otherwise users must confirm their address before signing in.
3. Add the deployed site URL and local development URL to Authentication → URL Configuration.
4. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local` and the hosting provider's build settings.
5. Verify sign-up, sign-in, and sign-out in the deployed app.

Each account gets a private family space. This MVP does not support family invitations or cross-account family sharing. Display profiles can use nicknames and emoji; do not enter children's full names, contact details, photos, or sensitive information. Demo points reset when the session ends and have no cash value.

## Owner email notification

Notifications go only to `Eng.osama.elsehimy@gmail.com`. They contain no player's email or name. Delivery needs a Resend account with a verified sender domain and Supabase Edge Function secrets; it is not active until configured and tested.

1. Deploy `supabase/functions/registration-notify` to the Supabase project (`supabase functions deploy registration-notify --no-verify-jwt`).
2. Set Edge Function secrets: `RESEND_API_KEY`, `REGISTRATION_EMAIL_FROM` (a verified sender such as `Family World <notify@example.com>`), and a long random `REGISTRATION_WEBHOOK_SECRET`.
3. In Database → Webhooks, create an `INSERT` webhook for `public.profiles`, pointing to `https://PROJECT_REF.supabase.co/functions/v1/registration-notify`; add header `x-webhook-secret` with the same secret.
4. Create a test account and confirm that the owner inbox receives one notification. Check Supabase function and webhook logs if delivery fails.

No SMS, WhatsApp, Google sign-in, or third-party tracking is enabled.

## Build and deploy

Run `npm run build`; the deployable static files are in `dist/`. Vite uses relative asset paths for GitHub Pages project sites. GitHub Pages must deploy the generated `dist` folder, not the source files. Hosting and Supabase credentials are account-level settings and are not stored in this repository.

The character concepts (Osama, Thimmy, and the Analyst) are represented with native emoji and interface styling. The attached concept PDF also includes mixed-source image artwork; those portraits are not redistributed because separate image-use rights were not confirmed.
