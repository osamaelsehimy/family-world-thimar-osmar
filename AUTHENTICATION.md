# Authentication and privacy

- Email and password sign-in use Supabase Auth. The app does not store passwords.
- The main app view stays hidden until Supabase restores a valid session; signing out returns to the login screen.
- New accounts require the adult parent/guardian affirmation. An Auth trigger records a profile with a guardian attestation timestamp.
- Row-level security is enabled on public.profiles; signed-in users can read only their own profile. Browser roles cannot insert, update, or delete profile records.
- The browser uses the project's publishable key only. Never place the service-role key in frontend code.
- Email confirmation is required before first sign-in. Redirects are restricted to the GitHub Pages app and local Vite development.
- The PWA caches only same-origin app-shell resources; Supabase Auth requests are always sent online and are not cached.
- Children should not enter names, contact information, photos, or sensitive details. The current MVP has no saved child profiles, public directory, chat, or family invitations.
- Points are session-only demonstration feedback; they are not saved or redeemable.
