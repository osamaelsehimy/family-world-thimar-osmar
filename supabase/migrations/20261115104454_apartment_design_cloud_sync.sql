create table public.apartment_designs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.challenge_projects(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  design_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint apartment_designs_owner_project unique (project_id, owner_id),
  constraint apartment_designs_json_object check (jsonb_typeof(design_json) = 'object'),
  constraint apartment_designs_json_size check (pg_column_size(design_json) <= 262144),
  constraint apartment_designs_cells check (
    design_json ? 'cells'
    and jsonb_typeof(design_json->'cells') = 'array'
    and jsonb_array_length(design_json->'cells') = 100
  ),
  constraint apartment_designs_furniture check (
    not (design_json ? 'furniture')
    or (jsonb_typeof(design_json->'furniture') = 'array' and jsonb_array_length(design_json->'furniture') <= 100)
  )
);
create index apartment_designs_owner_idx on public.apartment_designs(owner_id);
alter table public.apartment_designs enable row level security;
create policy "Members read own apartment designs"
  on public.apartment_designs for select to authenticated
  using (
    owner_id = (select auth.uid())
    and exists (
      select 1 from public.challenge_projects p
      where p.id = project_id and p.owner_id = (select auth.uid())
    )
  );
create policy "Active members create own apartment designs"
  on public.apartment_designs for insert to authenticated
  with check (
    owner_id = (select auth.uid())
    and exists (
      select 1 from public.challenge_projects p
      join public.profiles m on m.id = p.owner_id
      where p.id = project_id
        and p.owner_id = (select auth.uid())
        and p.status in ('draft','revision_requested')
        and m.membership_status = 'active'
    )
  );
create policy "Members update own editable apartment designs"
  on public.apartment_designs for update to authenticated
  using (
    owner_id = (select auth.uid())
    and exists (
      select 1 from public.challenge_projects p
      where p.id = project_id
        and p.owner_id = (select auth.uid())
        and p.status in ('draft','revision_requested')
    )
  )
  with check (
    owner_id = (select auth.uid())
    and exists (
      select 1 from public.challenge_projects p
      where p.id = project_id
        and p.owner_id = (select auth.uid())
        and p.status in ('draft','revision_requested')
    )
  );
grant select, insert on public.apartment_designs to authenticated;
grant update (design_json, updated_at) on public.apartment_designs to authenticated;
