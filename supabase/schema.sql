-- Family World Auth foundation. Never expose service_role in browser code.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  guardian_attested_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

create or replace function public.handle_new_family_world_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.raw_user_meta_data ->> 'guardian_attested' is distinct from 'true' then
    raise exception 'A parent or guardian must confirm before account creation';
  end if;
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;
revoke all on function public.handle_new_family_world_user() from public, anon, authenticated;

drop trigger if exists on_family_world_user_created on auth.users;
create trigger on_family_world_user_created after insert on auth.users
for each row execute function public.handle_new_family_world_user();
