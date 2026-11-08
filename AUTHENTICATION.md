# Authentication notes
- UI calls `supabase.auth.signUp` / `signInWithPassword`.
- Supabase Auth verifies credentials and manages password storage; this application does not store passwords.
- The Supabase JS client persists sessions, refreshes access tokens, and detects auth callback sessions.
- A database trigger creates the user's profile after signup.
- PostgreSQL RLS policies protect profile and family records. Hiding admin controls in React is not authorization.
- Only the Supabase anon/public key belongs in browser env. Never expose service_role.
- Before production: configure email confirmation, SMTP, password recovery, redirect URLs, rate limiting, RLS tests, and child privacy controls.
