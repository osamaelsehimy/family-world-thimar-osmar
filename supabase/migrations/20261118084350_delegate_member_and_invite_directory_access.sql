create or replace function public.osmar_member_directory_v2()
returns table(member_id uuid,email text,phone text,member_code text,membership_status text,registered_at timestamptz,referral_type text,member_type text,display_name text,nickname text,inviter_email text,referral_status text)
language plpgsql security definer set search_path=''
as $function$
begin
  if auth.uid() is null or not private.osmar_has_permission('members.read') then
    raise exception 'OSMAR member directory permission required' using errcode='42501';
  end if;
  return query
  select p.id,u.email::text,nullif(u.phone,'')::text,p.member_code,p.membership_status,p.created_at,
    coalesce(r.referral_type,'UNCLASSIFIED'),coalesce(p.admin_referral_label,r.referral_type,'UNCLASSIFIED'),
    p.display_name,p.nickname,inviter.email::text,r.status
  from public.profiles p join auth.users u on u.id=p.id
  left join private.member_referrals r on r.member_id=p.id
  left join auth.users inviter on inviter.id=r.inviter_id
  order by p.created_at asc,p.id asc;
end;
$function$;

create or replace function public.osmar_invite_directory()
returns table(invite_id uuid,invite_type text,source_label text,code_prefix text,max_uses integer,uses_count integer,uses_remaining integer,created_at timestamptz,expires_at timestamptz,revoked_at timestamptz,created_by_email text)
language plpgsql security definer set search_path=''
as $function$
begin
  if auth.uid() is null or not private.osmar_has_permission('code.read') then
    raise exception 'OSMAR invite directory permission required' using errcode='42501';
  end if;
  return query
  select i.id,i.code_type,coalesce(i.source_label,'—'),i.code_prefix,i.max_uses,i.uses_count,
    greatest(i.max_uses-i.uses_count,0),i.created_at,i.expires_at,i.revoked_at,u.email::text
  from private.invite_codes i left join auth.users u on u.id=i.created_by
  order by i.created_at asc,i.id asc;
end;
$function$;
