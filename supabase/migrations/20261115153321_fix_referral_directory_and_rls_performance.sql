-- Correct the admin directory to report the invitation's real type first.
-- Keep admin_referral_label as a fallback for legacy profiles without referral rows.
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
    coalesce(r.referral_type, p.admin_referral_label, 'UNCLASSIFIED'),
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

-- Combine self/admin read access into one policy and cache JWT lookups per statement.
drop policy if exists "Users can read their own profile" on public.profiles;
drop policy if exists "OSMAR admins can read profiles for member updates" on public.profiles;
create policy "Members and OSMAR admins can read profiles"
on public.profiles
for select
to authenticated
using (
  (select auth.uid()) = id
  or coalesce((select auth.jwt()) -> 'app_metadata' ->> 'role', '') = 'osmar_admin'
);

-- Combine member/admin plan visibility without widening member access.
drop policy if exists "Members read own apartment designs" on public.apartment_designs;
drop policy if exists "OSMAR admins read apartment designs for review" on public.apartment_designs;
create policy "Owners and OSMAR admins read apartment designs"
on public.apartment_designs
for select
to authenticated
using (
  (
    owner_id = (select auth.uid())
    and exists (
      select 1
      from public.challenge_projects p
      where p.id = apartment_designs.project_id
        and p.owner_id = (select auth.uid())
    )
  )
  or coalesce((select auth.jwt()) -> 'app_metadata' ->> 'role', '') = 'osmar_admin'
);

-- Cover foreign keys flagged by the database performance advisor.
create index if not exists member_referrals_invite_code_id_idx
  on private.member_referrals (invite_code_id);
create index if not exists member_referrals_reviewed_by_idx
  on private.member_referrals (reviewed_by);
create index if not exists domino_rooms_host_id_idx
  on public.domino_rooms (host_id);
create index if not exists points_ledger_awarded_by_idx
  on public.points_ledger (awarded_by);
