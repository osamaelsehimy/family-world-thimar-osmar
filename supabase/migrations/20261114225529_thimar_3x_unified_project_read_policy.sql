-- Keep owner visibility and trusted OSMAR review access in one explicit policy.
drop policy if exists "Members read own challenge projects" on public.challenge_projects;
drop policy if exists "OSMAR admins read all challenge projects" on public.challenge_projects;
drop policy if exists "Owners and OSMAR admins read challenge projects" on public.challenge_projects;

create policy "Owners and OSMAR admins read challenge projects"
on public.challenge_projects
for select
to authenticated
using (
  owner_id = (select auth.uid())
  or coalesce((select auth.jwt()) -> 'app_metadata' ->> 'role', '') = 'osmar_admin'
);
