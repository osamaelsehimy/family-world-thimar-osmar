# Authentication and privacy

- Email and password are handled by Supabase Auth. The app does not store passwords.
- A database trigger creates one private family space for each new account.
- Family data access is checked by PostgreSQL row-level security against family membership. The older prototype's unscoped member table is revoked from browser roles.
- The browser receives only the Supabase anon key. Never expose a service-role key.
- Children should not enter names, contact information, photos, or sensitive details. This MVP has no child profiles, public directory, chat, or family invitations.
- Points are session-only demonstration feedback; they are not saved or redeemable.
- Owner registration emails contain no player email or name and require a configured Resend sender, Supabase Edge Function secret, and database webhook.
- Before inviting real families, test isolation with separate accounts and establish parental consent, retention, deletion, and incident-handling procedures.
