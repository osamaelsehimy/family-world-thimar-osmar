-- Run this in Supabase SQL Editor. Never expose service_role in browser code.
create table if not exists public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 full_name text not null default '',
 role text not null default 'member' check(role in ('member','parent','admin')),
 created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.profiles(id,full_name) values(new.id,coalesce(new.raw_user_meta_data->>'full_name','')) on conflict(id) do nothing;
 return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
create or replace function public.is_family_admin()
returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.profiles where id=auth.uid() and role='admin');
$$;
create policy "read own profile or admin" on public.profiles for select to authenticated using(id=auth.uid() or public.is_family_admin());
create policy "update own name only" on public.profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid() and role=(select p.role from public.profiles p where p.id=auth.uid()));
create policy "admin manages profiles" on public.profiles for all to authenticated using(public.is_family_admin()) with check(public.is_family_admin());
grant select,update on public.profiles to authenticated;
-- Create your account first, then promote it manually using:
-- update public.profiles set role='admin' where id=(select id from auth.users where email='YOUR_EMAIL');
create table if not exists public.family_members(
 id uuid primary key default gen_random_uuid(), display_name text not null,
 relationship text not null default 'فرد من العائلة', emoji text not null default '😊',
 points integer not null default 0 check(points>=0), created_at timestamptz not null default now()
);
alter table public.family_members enable row level security;
create policy "family can read members" on public.family_members for select to authenticated using(true);
create policy "admins manage members" on public.family_members for all to authenticated using(public.is_family_admin()) with check(public.is_family_admin());
grant select,insert,update,delete on public.family_members to authenticated;
