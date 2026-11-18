create or replace function public.osmar_my_admin_access()
returns jsonb language sql stable security definer set search_path=''
as $function$
  select jsonb_build_object(
    'is_owner', private.osmar_is_owner(),
    'permissions', case when private.osmar_is_owner() then
      to_jsonb(array['code.read','code.write','deploy.manage','infrastructure.manage','security.audit','members.read','members.approve','members.edit','invites.manage','game.configure','events.manage','rewards.review','rewards.award','content.manage','reports.read','audit.read']::text[])
    else coalesce((select to_jsonb(a.permissions) from private.osmar_admin_assignments a
      where a.user_id=auth.uid() and a.revoked_at is null and (a.expires_at is null or a.expires_at>now())), '[]'::jsonb)
    end
  )
$function$;

create or replace function public.osmar_pending_members()
returns table(member_id uuid,member_code text,membership_status text,referral_type text,inviter_member_code text,referral_created_at timestamptz)
language plpgsql security definer set search_path=''
as $function$
begin
  if auth.uid() is null or not private.osmar_has_permission('members.read') then
    raise exception 'OSMAR member directory permission required' using errcode='42501';
  end if;
  return query
  select p.id,p.member_code,p.membership_status,r.referral_type,inviter.member_code,r.created_at
  from public.profiles p join private.member_referrals r on r.member_id=p.id
  left join public.profiles inviter on inviter.id=r.inviter_id
  where p.membership_status='pending' and r.status='pending'
  order by r.created_at asc;
end;
$function$;

create or replace function public.osmar_set_admin_assignment(p_email text,p_role_key text,p_permissions text[],p_expires_at timestamptz default null)
returns uuid language plpgsql security definer set search_path=''
as $function$
declare v_target uuid; v_permissions text[]:=coalesce(p_permissions,'{}');
begin
  if not private.osmar_is_owner() then raise exception 'OSMAR owner access required'; end if;
  if p_role_key not in ('engineering','infrastructure_security','game_operations','membership_support','rewards_moderator','content_moderator','auditor') then raise exception 'Unsupported OSMAR role'; end if;
  if cardinality(v_permissions)=0 then raise exception 'At least one permission is required'; end if;
  if exists(select 1 from unnest(v_permissions) p where p not in ('code.read','code.write','deploy.manage','infrastructure.manage','security.audit','members.read','members.approve','members.edit','invites.manage','game.configure','events.manage','rewards.review','rewards.award','content.manage','reports.read','audit.read')) then raise exception 'Unknown OSMAR permission'; end if;
  if p_expires_at is not null and p_expires_at<=now() then raise exception 'Expiration must be in the future'; end if;
  select u.id into v_target from auth.users u where lower(u.email)=lower(btrim(p_email)) and u.email_confirmed_at is not null;
  if v_target is null then raise exception 'A confirmed account with this email was not found'; end if;
  if v_target='e9957d25-e79d-47f4-a75b-ca149b97a31c'::uuid then raise exception 'The OSMAR owner identity cannot be reassigned'; end if;
  insert into private.osmar_admin_assignments(user_id,role_key,permissions,expires_at,created_by,revoked_at,updated_at)
  values(v_target,p_role_key,v_permissions,p_expires_at,auth.uid(),null,now())
  on conflict(user_id) do update set role_key=excluded.role_key,permissions=excluded.permissions,expires_at=excluded.expires_at,created_by=excluded.created_by,revoked_at=null,updated_at=now();
  insert into private.osmar_admin_audit(actor_id,target_user_id,action,role_key,permission_snapshot)
  values(auth.uid(),v_target,'assignment_created_or_updated',p_role_key,v_permissions);
  return v_target;
end;
$function$;

create or replace function public.osmar_update_member_profile(p_member_id uuid,p_display_name text,p_nickname text,p_member_type text)
returns boolean language plpgsql security definer set search_path=''
as $function$
declare v_old public.profiles%rowtype; v_name text:=nullif(btrim(coalesce(p_display_name,'')),''); v_nickname text:=nullif(btrim(coalesce(p_nickname,'')),'');
begin
  if auth.uid() is null or not private.osmar_has_permission('members.edit') then raise exception 'OSMAR member edit permission required' using errcode='42501'; end if;
  if p_member_type not in ('TRU','FAM','NET','OSM','TEAM') then raise exception 'Unsupported member type'; end if;
  if (v_name is not null and char_length(v_name)>60) or (v_nickname is not null and char_length(v_nickname)>30) then raise exception 'Member name is too long'; end if;
  select * into v_old from public.profiles where id=p_member_id for update;
  if not found then raise exception 'Member not found'; end if;
  update public.profiles set display_name=v_name,nickname=v_nickname,admin_referral_label=p_member_type where id=p_member_id;
  insert into private.osmar_admin_audit(actor_id,target_user_id,action,role_key,permission_snapshot,details)
  values(auth.uid(),p_member_id,'member_profile_updated',null,'{}',jsonb_build_object('old_display_name',v_old.display_name,'new_display_name',v_name,'old_nickname',v_old.nickname,'new_nickname',v_nickname,'old_member_type',v_old.admin_referral_label,'new_member_type',p_member_type));
  return true;
end;
$function$;

update private.osmar_admin_assignments
set permissions=array(select distinct x from unnest(permissions || array['members.edit']::text[]) x order by x),updated_at=now()
where user_id in (select p.id from public.profiles p where p.member_code in ('FW-00000001','FW-00000041')) and revoked_at is null;

grant execute on function public.osmar_my_admin_access() to authenticated;
