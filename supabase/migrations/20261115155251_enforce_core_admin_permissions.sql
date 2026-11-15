-- Enforce delegated permissions at the database boundary for core admin operations.
-- The immutable owner remains authorized through private.osmar_has_permission().
create or replace function public.osmar_create_invite(
  p_code_type text,
  p_source_label text default null,
  p_max_uses integer default 1,
  p_expires_at timestamp with time zone default null
)
returns table(invite_code text, invite_type text, expires_at timestamp with time zone)
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_code text;
  v_prefix text;
begin
  if auth.uid() is null or not private.osmar_has_permission('invites.manage') then
    raise exception 'OSMAR invite management permission required';
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
  v_code := v_prefix || '-' || upper(encode(extensions.gen_random_bytes(6), 'hex'));

  insert into private.invite_codes
    (code_hash, code_prefix, code_type, created_by, source_label, max_uses, expires_at)
  values
    (encode(extensions.digest(v_code, 'sha256'), 'hex'),
     v_prefix, p_code_type, auth.uid(), nullif(btrim(p_source_label), ''),
     p_max_uses, p_expires_at);

  return query select v_code, p_code_type, p_expires_at;
end;
$function$;

create or replace function public.osmar_review_member(p_member_id uuid, p_decision text)
returns text
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_referral_id uuid;
begin
  if auth.uid() is null or not private.osmar_has_permission('members.approve') then
    raise exception 'OSMAR membership approval permission required';
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
$function$;

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
  if auth.uid() is null or not private.osmar_has_permission('rewards.award') then
    raise exception 'OSMAR points award permission required';
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

create or replace function public.osmar_review_3x_submission(
  p_submission_id uuid,
  p_decision text,
  p_review_note text default null
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_submission public.challenge_submissions%rowtype;
  v_points integer;
  v_slug text;
begin
  if auth.uid() is null or not private.osmar_has_permission('rewards.review') then
    raise exception 'OSMAR challenge review permission required';
  end if;
  if p_decision is null or p_decision not in ('approved','revision_requested','rejected') then
    raise exception 'Invalid review decision';
  end if;
  if p_review_note is not null and char_length(p_review_note) > 2000 then
    raise exception 'Review note too long';
  end if;

  select * into v_submission
  from public.challenge_submissions
  where id = p_submission_id and status = 'pending'
  for update;
  if not found then
    raise exception 'Pending submission not found';
  end if;

  update public.challenge_submissions
  set status = p_decision, review_note = nullif(btrim(p_review_note), ''),
      reviewed_by = auth.uid(), reviewed_at = now()
  where id = p_submission_id;

  if p_decision = 'approved' then
    select c.points_award, c.slug into v_points, v_slug
    from public.challenge_projects p
    join public.challenge_catalog c on c.id = p.challenge_id
    where p.id = v_submission.project_id;

    update public.challenge_projects
    set status = 'approved', updated_at = now()
    where id = v_submission.project_id;

    if coalesce(v_points, 0) > 0 then
      perform public.osmar_award_points(
        v_submission.user_id, v_points, 'Approved 3X challenge: ' || v_slug,
        'challenge', '3x:' || v_submission.id::text
      );
    end if;
  elsif p_decision = 'revision_requested' then
    update public.challenge_projects
    set status = 'revision_requested', updated_at = now()
    where id = v_submission.project_id;
  else
    update public.challenge_projects
    set status = 'draft', updated_at = now()
    where id = v_submission.project_id;
  end if;

  return true;
end;
$function$;
