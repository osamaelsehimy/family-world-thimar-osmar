-- Trusted member friend requests. Profiles remain private; lookup is by member code only.
create table if not exists public.friend_requests (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending','accepted','rejected','removed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint friend_requests_no_self check (sender_id <> recipient_id)
);

create unique index if not exists friend_requests_unique_pair
  on public.friend_requests (least(sender_id,recipient_id), greatest(sender_id,recipient_id));
create index if not exists friend_requests_sender_status
  on public.friend_requests (sender_id,status,created_at desc);
create index if not exists friend_requests_recipient_status
  on public.friend_requests (recipient_id,status,created_at desc);

alter table public.friend_requests enable row level security;
drop policy if exists "Participants can view their friend requests" on public.friend_requests;
create policy "Participants can view their friend requests"
on public.friend_requests for select to authenticated
using ((select auth.uid()) = sender_id or (select auth.uid()) = recipient_id);

revoke all on public.friend_requests from anon, authenticated;
grant select on public.friend_requests to authenticated;

create or replace function public.lookup_member_by_code(p_member_code text)
returns table(user_id uuid, member_code text, display_name text, nickname text, avatar_url text)
language plpgsql security definer set search_path = '' as $function$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'Authentication required'; end if;
  if length(trim(coalesce(p_member_code,''))) < 6 or length(trim(p_member_code)) > 24 then
    raise exception 'Enter a valid member code';
  end if;
  return query
    select p.id, p.member_code, coalesce(nullif(p.display_name,''),'Family World member'),
           p.nickname, p.avatar_url
    from public.profiles p
    where upper(p.member_code)=upper(trim(p_member_code))
      and p.id<>v_uid and p.membership_status='active'
    limit 1;
end;
$function$;

create or replace function public.send_friend_request(p_target_user_id uuid)
returns uuid language plpgsql security definer set search_path = '' as $function$
declare v_uid uuid := auth.uid(); v_id uuid;
begin
  if v_uid is null then raise exception 'Authentication required'; end if;
  if p_target_user_id is null or p_target_user_id=v_uid then raise exception 'Invalid friend target'; end if;
  if not exists(select 1 from public.profiles where id=v_uid and membership_status='active') then
    raise exception 'Your membership must be active';
  end if;
  if not exists(select 1 from public.profiles where id=p_target_user_id and membership_status='active') then
    raise exception 'Member not found or not active';
  end if;
  if exists(
    select 1 from public.friend_requests
    where least(sender_id,recipient_id)=least(v_uid,p_target_user_id)
      and greatest(sender_id,recipient_id)=greatest(v_uid,p_target_user_id)
  ) then raise exception 'A friend request or friendship already exists'; end if;
  insert into public.friend_requests(sender_id,recipient_id)
  values(v_uid,p_target_user_id) returning id into v_id;
  return v_id;
end;
$function$;

create or replace function public.respond_friend_request(p_request_id uuid,p_decision text)
returns boolean language plpgsql security definer set search_path = '' as $function$
declare v_uid uuid:=auth.uid(); v_count integer;
begin
  if v_uid is null then raise exception 'Authentication required'; end if;
  if p_decision not in ('accepted','rejected') then raise exception 'Invalid decision'; end if;
  update public.friend_requests set status=p_decision,updated_at=now()
  where id=p_request_id and recipient_id=v_uid and status='pending';
  get diagnostics v_count=row_count;
  return v_count=1;
end;
$function$;

create or replace function public.remove_friend(p_friend_user_id uuid)
returns boolean language plpgsql security definer set search_path = '' as $function$
declare v_uid uuid:=auth.uid(); v_count integer;
begin
  if v_uid is null then raise exception 'Authentication required'; end if;
  update public.friend_requests set status='removed',updated_at=now()
  where status='accepted'
    and ((sender_id=v_uid and recipient_id=p_friend_user_id)
      or (recipient_id=v_uid and sender_id=p_friend_user_id));
  get diagnostics v_count=row_count;
  return v_count=1;
end;
$function$;

create or replace function public.friend_network()
returns table(
  request_id uuid,friend_id uuid,direction text,status text,created_at timestamptz,
  member_code text,display_name text,nickname text,avatar_url text
)
language plpgsql security definer set search_path = '' as $function$
declare v_uid uuid:=auth.uid();
begin
  if v_uid is null then raise exception 'Authentication required'; end if;
  return query
    select fr.id,
      case when fr.sender_id=v_uid then fr.recipient_id else fr.sender_id end,
      case when fr.recipient_id=v_uid then 'incoming' else 'outgoing' end,
      fr.status,fr.created_at,p.member_code,
      coalesce(nullif(p.display_name,''),'Family World member'),p.nickname,p.avatar_url
    from public.friend_requests fr
    join public.profiles p on p.id=case when fr.sender_id=v_uid then fr.recipient_id else fr.sender_id end
    where (fr.sender_id=v_uid or fr.recipient_id=v_uid)
      and fr.status in ('pending','accepted')
    order by fr.created_at desc;
end;
$function$;

revoke all on function public.lookup_member_by_code(text) from public,anon;
revoke all on function public.send_friend_request(uuid) from public,anon;
revoke all on function public.respond_friend_request(uuid,text) from public,anon;
revoke all on function public.remove_friend(uuid) from public,anon;
revoke all on function public.friend_network() from public,anon;
grant execute on function public.lookup_member_by_code(text) to authenticated;
grant execute on function public.send_friend_request(uuid) to authenticated;
grant execute on function public.respond_friend_request(uuid,text) to authenticated;
grant execute on function public.remove_friend(uuid) to authenticated;
grant execute on function public.friend_network() to authenticated;
