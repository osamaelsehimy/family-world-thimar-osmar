-- Admin review visibility and query indexes for Thimar 3X
drop policy if exists "Members read own submissions" on public.challenge_submissions;
drop policy if exists "OSMAR admins read all challenge submissions" on public.challenge_submissions;
create policy "Owners and OSMAR admins read challenge submissions" on public.challenge_submissions
 for select to authenticated using (user_id=(select auth.uid()) or coalesce((select auth.jwt())->'app_metadata'->>'role','')='osmar_admin');
create policy "OSMAR admins read all challenge projects" on public.challenge_projects
 for select to authenticated using (coalesce((select auth.jwt())->'app_metadata'->>'role','')='osmar_admin');
create index if not exists challenge_projects_challenge_idx on public.challenge_projects(challenge_id);
create index if not exists challenge_progress_task_idx on public.challenge_task_progress(task_id);
create index if not exists challenge_progress_user_idx on public.challenge_task_progress(user_id);
create index if not exists challenge_submissions_user_idx on public.challenge_submissions(user_id);
create index if not exists challenge_submissions_reviewer_idx on public.challenge_submissions(reviewed_by);
