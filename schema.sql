-- Fresh Supabase setup for Family World – Thimar OSMAR.
-- No child names, birth dates, photos, or public family directory are needed for this MVP.
create extension if not exists pgcrypto with schema extensions;

create table if not exists public.families (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  family_id uuid not null references public.families(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (id, family_id)
);

create table if not exists public.family_memberships (
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'parent' check (role in ('parent', 'member')),
  created_at timestamptz not null default now(),
  primary key (family_id, user_id)
);

-- Optional family display profiles use nicknames and emoji, never child contact details.
create table if not exists public.family_world_members (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 32),
  avatar_id text not null default 'sprout' check (avatar_id in ('osama', 'thimmy', 'analyst', 'sprout')),
  created_at timestamptz not null default now()
);

alter table public.families enable row level security;
alter table public.profiles enable row level security;
alter table public.family_memberships enable row level security;
alter table public.family_world_members enable row level security;

-- Remove the permissive policies from the previous prototype. Its unscoped table is
-- deliberately kept for data recovery but made inaccessible to application roles.
drop policy if exists "read own profile or admin" on public.profiles;
drop policy if exists "update own name only" on public.profiles;
drop policy if exists "admin manages profiles" on public.profiles;
drop policy if exists "family can read members" on public.family_members;
drop policy if exists "admins manage members" on public.family_members;
revoke all on public.family_members from anon, authenticated;

create or replace function public.is_family_member(target_family uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.family_memberships m
    where m.family_id = target_family and m.user_id = (select auth.uid())
  );
$$;

create or replace function public.is_family_parent(target_family uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.family_memberships m
    where m.family_id = target_family and m.user_id = (select auth.uid()) and m.role = 'parent'
  );
$$;
revoke all on function public.is_family_member(uuid) from public;
revoke all on function public.is_family_parent(uuid) from public;
grant execute on function public.is_family_member(uuid) to authenticated;
grant execute on function public.is_family_parent(uuid) to authenticated;

drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles for select to authenticated using (id = (select auth.uid()));
drop policy if exists "read family" on public.families;
create policy "read family" on public.families for select to authenticated using (public.is_family_member(id));
drop policy if exists "read own membership" on public.family_memberships;
create policy "read own membership" on public.family_memberships for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists "read family display members" on public.family_world_members;
create policy "read family display members" on public.family_world_members for select to authenticated using (public.is_family_member(family_id));
drop policy if exists "parent adds display members" on public.family_world_members;
create policy "parent adds display members" on public.family_world_members for insert to authenticated with check (public.is_family_parent(family_id));
drop policy if exists "parent updates display members" on public.family_world_members;
create policy "parent updates display members" on public.family_world_members for update to authenticated using (public.is_family_parent(family_id)) with check (public.is_family_parent(family_id));
drop policy if exists "parent deletes display members" on public.family_world_members;
create policy "parent deletes display members" on public.family_world_members for delete to authenticated using (public.is_family_parent(family_id));

grant select on public.families, public.profiles, public.family_memberships, public.family_world_members to authenticated;
grant insert, update, delete on public.family_world_members to authenticated;

-- Each fresh account starts in a private family. Joining another family is a later MVP feature.
create or replace function public.create_private_family_for_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare new_family_id uuid;
begin
  insert into public.families default values returning id into new_family_id;
  insert into public.profiles(id, family_id) values (new.id, new_family_id);
  insert into public.family_memberships(family_id, user_id, role) values (new_family_id, new.id, 'parent');
  return new;
end;
$$;
revoke all on function public.create_private_family_for_new_user() from public, anon, authenticated;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.create_private_family_for_new_user();

-- After creating the owner account, configure a Supabase Database Webhook for
-- INSERT on public.profiles. Point it at registration-notify and set x-webhook-secret.
