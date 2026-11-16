create table if not exists private.registration_attempts (
  id bigint generated always as identity primary key,
  email text not null,
  invite_code_hint text,
  reason text not null default 'invalid_invite',
  created_at timestamptz not null default now()
);
create index if not exists registration_attempts_created_at_idx on private.registration_attempts(created_at desc);
revoke all on private.registration_attempts from public, anon, authenticated;

create or replace function public.osmar_record_registration_attempt(
  p_email text, p_code_hint text default null, p_reason text default 'invalid_invite'
) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if p_email is null or length(btrim(p_email)) < 5 or length(p_email) > 254
     or position('@' in btrim(p_email)) < 2
     or position('.' in split_part(btrim(p_email),'@',2)) < 2 then
    return;
  end if;
  insert into private.registration_attempts(email, invite_code_hint, reason)
  values (lower(btrim(p_email)),
    case when p_code_hint is null then null else left(regexp_replace(upper(btrim(p_code_hint)), '[^A-Z0-9-]', '', 'g'), 12) end,
    left(coalesce(nullif(p_reason,''),'invalid_invite'), 40));
end;
$$;
grant execute on function public.osmar_record_registration_attempt(text,text,text) to anon, authenticated;

create or replace function public.osmar_registration_attempts(p_limit integer default 100)
returns table(attempt_number bigint,email text,code_hint text,reason text,attempted_at timestamptz)
language plpgsql security definer set search_path = ''
as $$
begin
  if auth.uid() is null or not private.osmar_is_owner() then
    raise exception 'OSMAR owner access required';
  end if;
  return query
  select a.id,a.email,a.invite_code_hint,a.reason,a.created_at
  from private.registration_attempts a
  order by a.id desc
  limit greatest(1,least(coalesce(p_limit,100),500));
end;
$$;
revoke all on function public.osmar_registration_attempts(integer) from public,anon;
grant execute on function public.osmar_registration_attempts(integer) to authenticated;

create or replace function public.osmar_invite_directory()
returns table(invite_id uuid, invite_type text, source_label text, code_prefix text,
 max_uses integer, uses_count integer, uses_remaining integer, created_at timestamptz,
 expires_at timestamptz, revoked_at timestamptz, created_by_email text)
language plpgsql security definer set search_path = ''
as $$
begin
  if auth.uid() is null or not private.osmar_is_owner() then
    raise exception 'OSMAR owner access required';
  end if;
  return query
  select i.id,i.code_type,coalesce(i.source_label,'—'),i.code_prefix,
    i.max_uses,i.uses_count,greatest(i.max_uses-i.uses_count,0),i.created_at,
    i.expires_at,i.revoked_at,u.email::text
  from private.invite_codes i
  left join auth.users u on u.id=i.created_by
  order by i.created_at desc;
end;
$$;
revoke all on function public.osmar_invite_directory() from public,anon;
grant execute on function public.osmar_invite_directory() to authenticated;

create or replace function public.handle_new_family_world_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  new_member_code text;
  raw_invite_code text;
  invite_record record;
  has_invite boolean := false;
begin
  if new.raw_user_meta_data ->> 'guardian_attested' is distinct from 'true' then
    raise exception 'A parent or guardian must confirm before account creation';
  end if;

  raw_invite_code := upper(btrim(coalesce(new.raw_user_meta_data ->> 'invite_code', '')));
  if raw_invite_code <> '' then
    select id, created_by, code_type
      into invite_record
    from private.invite_codes
    where code_hash = encode(extensions.digest(raw_invite_code, 'sha256'), 'hex')
      and revoked_at is null
      and (expires_at is null or expires_at > now())
      and uses_count < max_uses
    for update;

    if found then
      if invite_record.code_type = 'OSM' or (
        invite_record.created_by is not null and exists (
          select 1 from public.profiles p
          where p.id = invite_record.created_by and p.membership_status = 'active'
        )
      ) then
        update private.invite_codes set uses_count = uses_count + 1 where id = invite_record.id;
        has_invite := true;
      end if;
    end if;
  end if;

  new_member_code := 'FW-' || lpad(nextval('private.member_code_seq')::text, 8, '0');
  insert into public.profiles (id, member_code, membership_status)
  values (new.id, new_member_code, 'pending');

  if has_invite then
    insert into private.member_referrals
      (member_id, inviter_id, invite_code_id, referral_type, status)
    values
      (new.id, invite_record.created_by, invite_record.id, invite_record.code_type, 'pending');
  end if;
  return new;
end;
$function$;
