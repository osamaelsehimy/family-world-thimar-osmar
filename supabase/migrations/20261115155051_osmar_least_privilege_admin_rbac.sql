-- OSMAR least-privilege administrative access foundation.
-- The original owner account is immutable and is the only identity allowed to delegate roles.
create schema if not exists private;

create table if not exists private.osmar_admin_assignments (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role_key text not null check (role_key in (
    'engineering','infrastructure_security','game_operations',
    'membership_support','rewards_moderator','content_moderator','auditor'
  )),
  permissions text[] not null default '{}',
  expires_at timestamptz,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  revoked_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists private.osmar_admin_audit (
  id bigint generated always as identity primary key,
  actor_id uuid not null references auth.users(id),
  target_user_id uuid references auth.users(id),
  action text not null,
  role_key text,
  permission_snapshot text[] not null default '{}',
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table private.osmar_admin_assignments enable row level security;
alter table private.osmar_admin_audit enable row level security;
revoke all on private.osmar_admin_assignments, private.osmar_admin_audit from public, anon, authenticated;

create or replace function private.osmar_is_owner()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select coalesce(auth.uid() = 'e9957d25-e79d-47f4-a75b-ca149b97a31c'::uuid, false)
$$;

create or replace function private.osmar_has_permission(p_permission text)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select private.osmar_is_owner()
    or exists (
      select 1
      from private.osmar_admin_assignments a
      where a.user_id = auth.uid()
        and a.revoked_at is null
        and (a.expires_at is null or a.expires_at > now())
        and p_permission = any(a.permissions)
    )
$$;

create or replace function public.osmar_list_admin_assignments()
returns table(
  user_id uuid,
  email text,
  role_key text,
  permissions text[],
  expires_at timestamptz,
  created_at timestamptz,
  revoked_at timestamptz
)
language plpgsql security definer
set search_path = ''
as $$
begin
  if not private.osmar_is_owner() then
    raise exception 'OSMAR owner access required';
  end if;
  return query
  select a.user_id, u.email::text, a.role_key, a.permissions, a.expires_at,
         a.created_at, a.revoked_at
  from private.osmar_admin_assignments a
  join auth.users u on u.id = a.user_id
  order by a.created_at desc;
end;
$$;

create or replace function public.osmar_set_admin_assignment(
  p_email text,
  p_role_key text,
  p_permissions text[],
  p_expires_at timestamptz default null
)
returns uuid
language plpgsql security definer
set search_path = ''
as $$
declare
  v_target uuid;
  v_permissions text[] := coalesce(p_permissions, '{}');
begin
  if not private.osmar_is_owner() then
    raise exception 'OSMAR owner access required';
  end if;
  if p_role_key not in (
    'engineering','infrastructure_security','game_operations',
    'membership_support','rewards_moderator','content_moderator','auditor'
  ) then
    raise exception 'Unsupported OSMAR role';
  end if;
  if cardinality(v_permissions) = 0 then
    raise exception 'At least one permission is required';
  end if;
  if exists (
    select 1 from unnest(v_permissions) p
    where p not in (
      'code.read','code.write','deploy.manage','infrastructure.manage',
      'security.audit','members.read','members.approve','invites.manage',
      'game.configure','events.manage','rewards.review','rewards.award',
      'content.manage','reports.read','audit.read'
    )
  ) then
    raise exception 'Unknown OSMAR permission';
  end if;
  if p_expires_at is not null and p_expires_at <= now() then
    raise exception 'Expiration must be in the future';
  end if;

  select u.id into v_target
  from auth.users u
  where lower(u.email) = lower(btrim(p_email))
    and u.email_confirmed_at is not null;

  if v_target is null then
    raise exception 'A confirmed account with this email was not found';
  end if;
  if v_target = 'e9957d25-e79d-47f4-a75b-ca149b97a31c'::uuid then
    raise exception 'The OSMAR owner identity cannot be reassigned';
  end if;

  insert into private.osmar_admin_assignments
    (user_id, role_key, permissions, expires_at, created_by, revoked_at, updated_at)
  values
    (v_target, p_role_key, v_permissions, p_expires_at, auth.uid(), null, now())
  on conflict (user_id) do update set
    role_key = excluded.role_key,
    permissions = excluded.permissions,
    expires_at = excluded.expires_at,
    created_by = excluded.created_by,
    revoked_at = null,
    updated_at = now();

  insert into private.osmar_admin_audit
    (actor_id, target_user_id, action, role_key, permission_snapshot)
  values
    (auth.uid(), v_target, 'assignment_created_or_updated', p_role_key, v_permissions);

  return v_target;
end;
$$;

create or replace function public.osmar_revoke_admin_assignment(p_user_id uuid)
returns boolean
language plpgsql security definer
set search_path = ''
as $$
declare
  v_role text;
  v_permissions text[];
begin
  if not private.osmar_is_owner() then
    raise exception 'OSMAR owner access required';
  end if;
  if p_user_id = 'e9957d25-e79d-47f4-a75b-ca149b97a31c'::uuid then
    raise exception 'The OSMAR owner identity cannot be revoked';
  end if;

  update private.osmar_admin_assignments
  set revoked_at = now(), updated_at = now()
  where user_id = p_user_id and revoked_at is null
  returning role_key, permissions into v_role, v_permissions;

  if v_role is null then
    return false;
  end if;

  insert into private.osmar_admin_audit
    (actor_id, target_user_id, action, role_key, permission_snapshot)
  values
    (auth.uid(), p_user_id, 'assignment_revoked', v_role, v_permissions);
  return true;
end;
$$;

revoke all on function private.osmar_is_owner() from public, anon, authenticated;
revoke all on function private.osmar_has_permission(text) from public, anon, authenticated;
revoke all on function public.osmar_list_admin_assignments() from public, anon;
revoke all on function public.osmar_set_admin_assignment(text,text,text[],timestamptz) from public, anon;
revoke all on function public.osmar_revoke_admin_assignment(uuid) from public, anon;
grant execute on function public.osmar_list_admin_assignments() to authenticated;
grant execute on function public.osmar_set_admin_assignment(text,text,text[],timestamptz) to authenticated;
grant execute on function public.osmar_revoke_admin_assignment(uuid) to authenticated;
