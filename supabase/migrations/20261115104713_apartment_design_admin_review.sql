create policy "OSMAR admins read apartment designs for review"
  on public.apartment_designs for select to authenticated
  using (coalesce((select auth.jwt())->'app_metadata'->>'role','') = 'osmar_admin');
