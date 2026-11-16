
create or replace function public.osmar_member_directory_v2()
returns table(member_id uuid,email text,phone text,member_code text,membership_status text,registered_at timestamptz,referral_type text,member_type text,display_name text,nickname text,inviter_email text,referral_status text)
language plpgsql security definer set search_path = ''
as $function$
begin
  if auth.uid() is null or not private.osmar_is_owner() then raise exception 'OSMAR owner access required'; end if;
  return query
  select p.id,u.email::text,nullif(u.phone,'')::text,p.member_code,p.membership_status,p.created_at,
    coalesce(r.referral_type,'UNCLASSIFIED'),coalesce(p.admin_referral_label,r.referral_type,'UNCLASSIFIED'),
    p.display_name,p.nickname,inviter.email::text,r.status
  from public.profiles p
  join auth.users u on u.id=p.id
  left join private.member_referrals r on r.member_id=p.id
  left join auth.users inviter on inviter.id=r.inviter_id
  order by p.created_at asc,p.id asc;
end;
$function$;

create or replace function public.osmar_recent_registrations(p_limit integer default 30)
returns table(member_id uuid,email text,member_code text,registered_at timestamptz,membership_status text,email_confirmed boolean,referral_type text,referral_status text)
language plpgsql security definer set search_path = ''
as $function$
begin
  if auth.uid() is null or not private.osmar_is_owner() then raise exception 'OSMAR owner access required'; end if;
  if p_limit is null or p_limit < 1 or p_limit > 100 then raise exception 'Limit must be between 1 and 100'; end if;
  return query
  select recent.member_id,recent.email,recent.member_code,recent.registered_at,recent.membership_status,
    recent.email_confirmed,recent.referral_type,recent.referral_status
  from (
    select p.id as member_id,u.email::text as email,p.member_code,p.created_at as registered_at,
      p.membership_status,(u.email_confirmed_at is not null) as email_confirmed,
      coalesce(r.referral_type,p.admin_referral_label,'UNCLASSIFIED') as referral_type,
      coalesce(r.status,'NO_REFERRAL') as referral_status
    from public.profiles p join auth.users u on u.id=p.id
    left join private.member_referrals r on r.member_id=p.id
    where p.created_at >= now()-interval '30 days'
    order by p.created_at desc,p.id desc limit p_limit
  ) recent
  order by recent.registered_at asc,recent.member_id asc;
end;
$function$;

create or replace function public.osmar_invite_directory()
returns table(invite_id uuid,invite_type text,source_label text,code_prefix text,max_uses integer,uses_count integer,uses_remaining integer,created_at timestamptz,expires_at timestamptz,revoked_at timestamptz,created_by_email text)
language plpgsql security definer set search_path = ''
as $function$
begin
  if auth.uid() is null or not private.osmar_is_owner() then raise exception 'OSMAR owner access required'; end if;
  return query
  select i.id,i.code_type,coalesce(i.source_label,'—'),i.code_prefix,i.max_uses,i.uses_count,
    greatest(i.max_uses-i.uses_count,0),i.created_at,i.expires_at,i.revoked_at,u.email::text
  from private.invite_codes i left join auth.users u on u.id=i.created_by
  order by i.created_at asc,i.id asc;
end;
$function$;

create or replace function public.osmar_registration_attempts(p_limit integer default 100)
returns table(attempt_number bigint,email text,code_hint text,reason text,attempted_at timestamptz)
language plpgsql security definer set search_path = ''
as $function$
begin
  if auth.uid() is null or not private.osmar_is_owner() then raise exception 'OSMAR owner access required'; end if;
  return query
  select recent.id,recent.email,recent.invite_code_hint,recent.reason,recent.created_at
  from (
    select a.id,a.email,a.invite_code_hint,a.reason,a.created_at
    from private.registration_attempts a order by a.id desc
    limit greatest(1,least(coalesce(p_limit,100),500))
  ) recent
  order by recent.created_at asc,recent.id asc;
end;
$function$;
