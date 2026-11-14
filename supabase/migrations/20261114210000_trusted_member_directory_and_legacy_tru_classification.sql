alter table public.profiles
  add column if not exists admin_referral_label text
  check (admin_referral_label is null or admin_referral_label in ('FAM','TRU','NET','OSM','TEAM'));

-- Owner-requested legacy classification: keep the founder as OSM and classify the
-- existing early trusted-circle members as TRU in the admin directory.
update public.profiles p
set admin_referral_label = case
  when lower(u.email) = 'eng.osama.elsehimy@gmail.com' then 'OSM'
  else 'TRU'
end
from auth.users u
where u.id = p.id
  and p.admin_referral_label is null;

create or replace function public.osmar_member_directory()
returns table (
  member_id uuid,
  email text,
  member_code text,
  membership_status text,
  registered_at timestamptz,
  referral_type text,
  inviter_email text,
  referral_status text
)
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if auth.uid() is null
    or coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') <> 'osmar_admin' then
    raise exception 'OSMAR administrator access required';
  end if;

  return query
  select
    p.id,
    u.email::text,
    p.member_code,
    p.membership_status,
    p.created_at,
    coalesce(p.admin_referral_label, r.referral_type, 'UNCLASSIFIED'),
    inviter.email::text,
    r.status
  from public.profiles p
  join auth.users u on u.id = p.id
  left join private.member_referrals r on r.member_id = p.id
  left join auth.users inviter on inviter.id = r.inviter_id
  order by p.created_at desc;
end;
$function$;

revoke all on function public.osmar_member_directory() from public;
revoke all on function public.osmar_member_directory() from anon;
grant execute on function public.osmar_member_directory() to authenticated;

drop policy if exists "OSMAR admins can read profiles for member updates" on public.profiles;
create policy "OSMAR admins can read profiles for member updates"
on public.profiles
for select
to authenticated
using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'osmar_admin');

do $publication$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'profiles'
  ) then
    alter publication supabase_realtime add table public.profiles;
  end if;
end;
$publication$;
