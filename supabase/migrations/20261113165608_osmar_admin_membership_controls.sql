-- Admin-only membership queue and approve/reject workflow.
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
as $function$
begin
  if auth.uid() is null
    or coalesce(auth.jwt()->'app_metadata'->>'role','') <> 'osmar_admin' then
    raise exception 'OSMAR administrator access required';
  end if;

  return query
  select p.id,p.member_code,p.membership_status,r.referral_type,inviter.member_code,r.created_at
  from public.profiles p
  join private.member_referrals r on r.member_id=p.id
  left join public.profiles inviter on inviter.id=r.inviter_id
  where p.membership_status='pending' and r.status='pending'
  order by r.created_at asc;
end;
$function$;

create or replace function public.osmar_review_member(p_member_id uuid,p_decision text)
returns text
language plpgsql
security definer
set search_path = ''
as $function$
declare v_referral_id uuid;
begin
  if auth.uid() is null
    or coalesce(auth.jwt()->'app_metadata'->>'role','') <> 'osmar_admin' then
    raise exception 'OSMAR administrator access required';
  end if;
  if p_decision not in ('approved','rejected') then
    raise exception 'Decision must be approved or rejected';
  end if;

  update private.member_referrals
  set status=p_decision,reviewed_by=auth.uid(),reviewed_at=now()
  where member_id=p_member_id and status='pending'
  returning id into v_referral_id;

  if v_referral_id is null then
    raise exception 'No pending referral found for this member';
  end if;

  update public.profiles
  set membership_status=case when p_decision='approved' then 'active' else 'rejected' end
  where id=p_member_id;

  return p_decision;
end;
$function$;

revoke all on function public.osmar_pending_members() from public,anon;
revoke all on function public.osmar_review_member(uuid,text) from public,anon;
grant execute on function public.osmar_pending_members() to authenticated;
grant execute on function public.osmar_review_member(uuid,text) to authenticated;
