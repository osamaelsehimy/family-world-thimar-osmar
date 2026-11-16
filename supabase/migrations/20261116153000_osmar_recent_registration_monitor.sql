-- Owner-only registration monitor so recent signups remain visible even
-- after approval or while email confirmation is still outstanding.
create or replace function public.osmar_recent_registrations(p_limit integer default 30)
returns table (
  member_id uuid,
  email text,
  member_code text,
  registered_at timestamptz,
  membership_status text,
  email_confirmed boolean,
  referral_type text,
  referral_status text
)
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if auth.uid() is null or not private.osmar_is_owner() then
    raise exception 'OSMAR owner access required';
  end if;

  if p_limit is null or p_limit < 1 or p_limit > 100 then
    raise exception 'Limit must be between 1 and 100';
  end if;

  return query
  select
    p.id,
    u.email::text,
    p.member_code,
    p.created_at,
    p.membership_status,
    (u.email_confirmed_at is not null),
    coalesce(r.referral_type, p.admin_referral_label, 'UNCLASSIFIED'),
    coalesce(r.status, 'NO_REFERRAL')
  from public.profiles p
  join auth.users u on u.id = p.id
  left join private.member_referrals r on r.member_id = p.id
  where p.created_at >= now() - interval '30 days'
  order by p.created_at desc
  limit p_limit;
end;
$function$;

revoke all on function public.osmar_recent_registrations(integer) from public, anon;
grant execute on function public.osmar_recent_registrations(integer) to authenticated;
