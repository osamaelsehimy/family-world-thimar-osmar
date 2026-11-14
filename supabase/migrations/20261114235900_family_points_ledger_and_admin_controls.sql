create table public.points_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  points integer not null check (points > 0 and points <= 10000),
  reason text not null check (length(btrim(reason)) between 2 and 240),
  source text not null check (source in ('game','challenge','family','admin_adjustment')),
  event_key text not null unique check (length(btrim(event_key)) between 8 and 160),
  awarded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index points_ledger_user_created_idx
  on public.points_ledger (user_id, created_at desc);

alter table public.points_ledger enable row level security;

create policy "Members can read their own points"
on public.points_ledger
for select
to authenticated
using ((select auth.uid()) = user_id);

revoke all on table public.points_ledger from anon;
revoke insert, update, delete on table public.points_ledger from authenticated;
grant select on table public.points_ledger to authenticated;

create or replace view public.member_points_summary
with (security_invoker = true)
as
select user_id, coalesce(sum(points), 0)::bigint as total_points,
       count(*)::bigint as awards_count,
       max(created_at) as last_awarded_at
from public.points_ledger
group by user_id;

revoke all on public.member_points_summary from anon;
grant select on public.member_points_summary to authenticated;

create or replace function public.osmar_award_points(
  p_user_id uuid,
  p_points integer,
  p_reason text,
  p_source text,
  p_event_key text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if auth.uid() is null
    or coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') <> 'osmar_admin' then
    raise exception 'OSMAR administrator access required';
  end if;

  if p_points is null or p_points < 1 or p_points > 10000
    or p_reason is null or length(btrim(p_reason)) not between 2 and 240
    or p_source not in ('game','challenge','family','admin_adjustment')
    or p_event_key is null or length(btrim(p_event_key)) not between 8 and 160 then
    raise exception 'Invalid points award';
  end if;

  if not exists (
    select 1 from public.profiles p
    where p.id = p_user_id and p.membership_status = 'active'
  ) then
    raise exception 'Active member not found';
  end if;

  insert into public.points_ledger (user_id, points, reason, source, event_key, awarded_by)
  values (p_user_id, p_points, btrim(p_reason), p_source, btrim(p_event_key), auth.uid())
  on conflict (event_key) do nothing;

  return found;
end;
$function$;

revoke all on function public.osmar_award_points(uuid, integer, text, text, text) from public;
revoke all on function public.osmar_award_points(uuid, integer, text, text, text) from anon;
grant execute on function public.osmar_award_points(uuid, integer, text, text, text) to authenticated;

create or replace function public.osmar_points_directory()
returns table (
  member_id uuid,
  member_code text,
  email text,
  membership_status text,
  total_points bigint,
  awards_count bigint
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
  select p.id, p.member_code, u.email::text, p.membership_status,
         coalesce(sum(l.points), 0)::bigint, count(l.id)::bigint
  from public.profiles p
  join auth.users u on u.id = p.id
  left join public.points_ledger l on l.user_id = p.id
  group by p.id, p.member_code, u.email, p.membership_status, p.created_at
  order by coalesce(sum(l.points), 0) desc, p.created_at asc;
end;
$function$;

revoke all on function public.osmar_points_directory() from public;
revoke all on function public.osmar_points_directory() from anon;
grant execute on function public.osmar_points_directory() to authenticated;
