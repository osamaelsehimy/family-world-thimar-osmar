-- Enforce trusted invitation redemption at account creation.
-- Invitation codes are SHA-256 hashed at rest and consumed atomically under row lock.
create or replace function public.handle_new_family_world_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_member_code text;
  raw_invite_code text;
  invite_record record;
begin
  if new.raw_user_meta_data ->> 'guardian_attested' is distinct from 'true' then
    raise exception 'A parent or guardian must confirm before account creation';
  end if;

  raw_invite_code := upper(btrim(coalesce(new.raw_user_meta_data ->> 'invite_code', '')));
  if raw_invite_code = '' then
    raise exception 'A valid invitation code is required';
  end if;

  select id, created_by, code_type
    into invite_record
  from private.invite_codes
  where code_hash = encode(extensions.digest(raw_invite_code, 'sha256'), 'hex')
    and revoked_at is null
    and (expires_at is null or expires_at > now())
    and uses_count < max_uses
  for update;

  if not found then
    raise exception 'Invitation code is invalid, expired, revoked, or already used';
  end if;

  if invite_record.code_type <> 'OSM' then
    if invite_record.created_by is null then
      raise exception 'Invitation source is not valid';
    end if;
    if not exists (
      select 1 from public.profiles
      where id = invite_record.created_by
        and membership_status = 'active'
    ) then
      raise exception 'Invitation source is not an active member';
    end if;
  end if;

  update private.invite_codes
  set uses_count = uses_count + 1
  where id = invite_record.id;

  new_member_code := 'FW-' || lpad(nextval('private.member_code_seq')::text, 8, '0');

  insert into public.profiles (id, member_code, membership_status)
  values (new.id, new_member_code, 'pending');

  insert into private.member_referrals
    (member_id, inviter_id, invite_code_id, referral_type, status)
  values
    (new.id, invite_record.created_by, invite_record.id, invite_record.code_type, 'pending');

  return new;
end;
$$;

revoke all on function public.handle_new_family_world_user() from public, anon, authenticated;
