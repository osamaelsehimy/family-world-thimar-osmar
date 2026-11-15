-- Family World member directory v2: live contact/profile fields and owner-audited member labels.
create or replace function public.osmar_member_directory_v2()
returns table (
  member_id uuid,
  email text,
  phone text,
  member_code text,
  membership_status text,
  registered_at timestamptz,
  referral_type text,
  member_type text,
  display_name text,
  nickname text,
  inviter_email text,
  referral_status text
)
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if auth.uid() is null
    or not private.osmar_is_owner() then
    raise exception 'OSMAR owner access required';
  end if;

  return query
  select
    p.id,
    u.email::text,
    nullif(u.phone, '')::text,
    p.member_code,
    p.membership_status,
    p.created_at,
    coalesce(r.referral_type, 'UNCLASSIFIED'),
    coalesce(p.admin_referral_label, r.referral_type, 'UNCLASSIFIED'),
    p.display_name,
    p.nickname,
    inviter.email::text,
    r.status
  from public.profiles p
  join auth.users u on u.id = p.id
  left join private.member_referrals r on r.member_id = p.id
  left join auth.users inviter on inviter.id = r.inviter_id
  order by p.created_at desc;
end;
$function$;

create or replace function public.osmar_update_member_profile(
  p_member_id uuid,
  p_display_name text,
  p_nickname text,
  p_member_type text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_old public.profiles%rowtype;
  v_name text := nullif(btrim(coalesce(p_display_name, '')), '');
  v_nickname text := nullif(btrim(coalesce(p_nickname, '')), '');
begin
  if auth.uid() is null or not private.osmar_is_owner() then
    raise exception 'OSMAR owner access required';
  end if;
  if p_member_type not in ('TRU','FAM','NET','OSM','TEAM') then
    raise exception 'Unsupported member type';
  end if;
  if (v_name is not null and char_length(v_name) > 80)
    or (v_nickname is not null and char_length(v_nickname) > 50) then
    raise exception 'Member name is too long';
  end if;

  select * into v_old from public.profiles where id = p_member_id for update;
  if not found then raise exception 'Member not found'; end if;

  update public.profiles
  set display_name = v_name,
      nickname = v_nickname,
      admin_referral_label = p_member_type
  where id = p_member_id;

  insert into private.osmar_admin_audit
    (actor_id, target_user_id, action, role_key, permission_snapshot, details)
  values
    (auth.uid(), p_member_id, 'member_profile_updated', null, '{}',
     jsonb_build_object(
       'old_display_name', v_old.display_name,
       'new_display_name', v_name,
       'old_nickname', v_old.nickname,
       'new_nickname', v_nickname,
       'old_member_type', v_old.admin_referral_label,
       'new_member_type', p_member_type
     ));

  return true;
end;
$function$;

revoke all on function public.osmar_member_directory_v2() from public, anon;
revoke all on function public.osmar_update_member_profile(uuid,text,text,text) from public, anon;
grant execute on function public.osmar_member_directory_v2() to authenticated;
grant execute on function public.osmar_update_member_profile(uuid,text,text,text) to authenticated;
