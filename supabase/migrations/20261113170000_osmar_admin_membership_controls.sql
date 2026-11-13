-- OSMAR administration RPCs. Only accounts with app_metadata.role = 'osmar_admin'
-- can issue invitations, review referrals, or inspect the pending queue.
create or replace function public.osmar_create_invite(
  p_code_type text,
  p_source_label text default null,
  p_max_uses integer default 1,
  p_expires_at timestamptz default null
)
returns table(invite_code text, invite_type text, expires_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_code text;
  v_prefix text;
begin
  if auth.uid() is null
    or coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') <> 'osmar_admin' then
    raise exception 'OSMAR administrator access required';
  end if;
  if p_code_type not in ('FAM','TRU','NET','OSM','TEAM') then
    raise exception 'Unsupported invitation type';
  end if;
  if p_max_uses < 1 or p_max_uses > 500 then
    raise exception 'Invitation use limit must be between 1 and 500';
  end if;
  if p_expires_at is not null and p_expires_at <= now() then
    raise exception 'Expiration must be in the future';
  end if;
  if p_code_type <> 'OSM' and not exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.membership_status = 'active'
  ) then
    raise exception 'Only active members may issue member invitations';
  end if;

  v_prefix := p_code_type;
  v_code := v_prefix || '-' ||
    upper(encode(extensions.gen_random_bytes(6), 'hex'));

  insert into private.invite_codes
    (code_hash, code_prefix, code_type, created_by, source_label, max_uses, expires_at)
  values
    (encode(extensions.digest(v_code, 'sha256'), 'hex'),
     v_prefix, p_code_type, auth.uid(), nullif(btrim(p_source_label), ''),
     p_max_uses, p_expires_at);

  return query select v_code, p_code_type, p_expires_at;
end;
$$;

create or replace function public.osmar_review_member(
  p_member_id uuid,
  p_decision text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_referral_id uuid;
begin
  if auth.uid() is null
    or coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') <> 'osmar_admin' then
    raise exception 'OSMAR administrator access required';
  end if;
  if p_decision not in ('approved','rejected') then
    raise exception 'Decision must be approved or rejected';
  end if;

  update private.member_referrals
  set status = p_decision, reviewed_by = auth.uid(), reviewed_at = now()
  where member_id = p_member_id and status = 'pending'
  returning id into v_referral_id;

  if v_referral_id is null then
    raise exception 'No pending referral found for this member';
  end if;

  update public.profiles
  set membership_status = case when p_decision = 'approved' then 'active' else 'rejected' end
  where id = p_member_id;

  return p_decision;
end;
$$;

create or replace function public.osmar_pending_members()
returns table(
  member_id uuid,
  member_code text,
  membership_status text,
  referral_type text,
  inviter_member_code text,
  referral_created_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null
    or coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') <> 'osmar_admin' then
    raise exception 'OSMAR administrator access required';
  end if;

  return query
  select p.id, p.member_code, p.membership_status,
         r.referral_type, inviter.member_code, r.created_at
  from public.profiles p
  join private.member_referrals r on r.member_id = p.id
  left join public.profiles inviter on inviter.id = r.inviter_id
  where p.membership_status = 'pending' and r.status = 'pending'
  order by r.created_at asc;
end;
$$;

revoke all on function public.osmar_create_invite(text,text,integer,timestamptz) from public, anon;
revoke all on function public.osmar_review_member(uuid,text) from public, anon;
revoke all on function public.osmar_pending_members() from public, anon;
grant execute on function public.osmar_create_invite(text,text,integer,timestamptz) to authenticated;
grant execute on function public.osmar_review_member(uuid,text) to authenticated;
grant execute on function public.osmar_pending_members() to authenticated;
