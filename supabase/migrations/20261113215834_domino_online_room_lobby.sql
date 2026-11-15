create table if not exists public.domino_rooms (
  id uuid primary key default gen_random_uuid(),
  room_code text not null unique,
  host_id uuid not null references auth.users(id) on delete cascade,
  settings jsonb not null default '{}'::jsonb,
  status text not null default 'waiting' check (status in ('waiting','playing','finished','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.domino_room_players (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.domino_rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  seat smallint not null check (seat between 0 and 7),
  member_code text not null,
  is_ready boolean not null default true,
  joined_at timestamptz not null default now(),
  unique(room_id,user_id),
  unique(room_id,seat)
);
create index if not exists domino_room_players_user_idx on public.domino_room_players(user_id);
create index if not exists domino_rooms_status_created_idx on public.domino_rooms(status,created_at desc);
alter table public.domino_rooms enable row level security;
alter table public.domino_room_players enable row level security;
revoke all on public.domino_rooms from anon, authenticated;
revoke all on public.domino_room_players from anon, authenticated;
grant select on public.domino_rooms to authenticated;
grant select on public.domino_room_players to authenticated;

create or replace function public.create_domino_room(p_settings jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_member_code text;
  v_room_id uuid;
  v_code text;
  v_players integer;
  v_sets integer;
  v_mode text;
begin
  if v_uid is null then raise exception 'Authentication required'; end if;
  select p.member_code into v_member_code from public.profiles p
  where p.id = v_uid and p.membership_status = 'active';
  if v_member_code is null then raise exception 'Active trusted membership required'; end if;
  v_players := coalesce((p_settings->>'players')::integer,0);
  v_sets := coalesce((p_settings->>'sets')::integer,0);
  v_mode := coalesce(p_settings->>'mode','');
  if v_players < 2 or v_players > 8 then raise exception 'Players must be between 2 and 8'; end if;
  if v_sets not in (1,2) then raise exception 'Invalid domino set'; end if;
  if v_players > 4 and v_sets <> 2 then raise exception 'More than four players require a double set'; end if;
  if v_mode not in ('solo','teams') then raise exception 'Invalid match mode'; end if;
  if v_mode = 'teams' and mod(v_players,2) <> 0 then raise exception 'Teams require an even number of players'; end if;
  if coalesce(p_settings->>'scoring','') not in ('one','101','151','201') then raise exception 'Invalid scoring option'; end if;
  loop
    v_code := upper(substr(replace(gen_random_uuid()::text,'-',''),1,6));
    begin
      insert into public.domino_rooms(room_code,host_id,settings) values(v_code,v_uid,p_settings) returning id into v_room_id;
      exit;
    exception when unique_violation then v_room_id := null;
    end;
  end loop;
  insert into public.domino_room_players(room_id,user_id,seat,member_code) values(v_room_id,v_uid,0,v_member_code);
  return jsonb_build_object('room_id',v_room_id,'room_code',v_code,'status','waiting');
end;
$$;

create or replace function public.join_domino_room(p_room_code text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_member_code text;
  v_room public.domino_rooms%rowtype;
  v_seat integer;
  v_capacity integer;
begin
  if v_uid is null then raise exception 'Authentication required'; end if;
  select p.member_code into v_member_code from public.profiles p where p.id=v_uid and p.membership_status='active';
  if v_member_code is null then raise exception 'Active trusted membership required'; end if;
  select * into v_room from public.domino_rooms r where r.room_code=upper(trim(p_room_code)) for update;
  if v_room.id is null then raise exception 'Room not found'; end if;
  if v_room.status <> 'waiting' then raise exception 'Room is not accepting players'; end if;
  v_capacity := (v_room.settings->>'players')::integer;
  if exists(select 1 from public.domino_room_players p where p.room_id=v_room.id and p.user_id=v_uid) then
    return jsonb_build_object('room_id',v_room.id,'room_code',v_room.room_code,'status',v_room.status);
  end if;
  select s into v_seat from generate_series(0,v_capacity-1) s
  where not exists(select 1 from public.domino_room_players p where p.room_id=v_room.id and p.seat=s)
  order by s limit 1;
  if v_seat is null then raise exception 'Room is full'; end if;
  insert into public.domino_room_players(room_id,user_id,seat,member_code) values(v_room.id,v_uid,v_seat,v_member_code);
  return jsonb_build_object('room_id',v_room.id,'room_code',v_room.room_code,'status',v_room.status,'seat',v_seat);
end;
$$;

create or replace function public.leave_domino_room(p_room_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_host uuid;
  v_next_host uuid;
  v_status text;
begin
  if v_uid is null then raise exception 'Authentication required'; end if;
  select r.host_id,r.status into v_host,v_status from public.domino_rooms r where r.id=p_room_id for update;
  if v_status is null then return jsonb_build_object('left',true); end if;
  if v_status='playing' then raise exception 'Cannot leave while a match is active'; end if;
  delete from public.domino_room_players p where p.room_id=p_room_id and p.user_id=v_uid;
  if v_host=v_uid then
    select p.user_id into v_next_host from public.domino_room_players p where p.room_id=p_room_id order by p.seat limit 1;
    if v_next_host is null then delete from public.domino_rooms r where r.id=p_room_id;
    else update public.domino_rooms r set host_id=v_next_host,updated_at=now() where r.id=p_room_id;
    end if;
  end if;
  return jsonb_build_object('left',true);
end;
$$;

create or replace function public.start_domino_room(p_room_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_room public.domino_rooms%rowtype;
  v_count integer;
  v_capacity integer;
begin
  if v_uid is null then raise exception 'Authentication required'; end if;
  select * into v_room from public.domino_rooms r where r.id=p_room_id for update;
  if v_room.id is null then raise exception 'Room not found'; end if;
  if v_room.host_id<>v_uid then raise exception 'Only the room host can start the match'; end if;
  if v_room.status<>'waiting' then raise exception 'Room is not waiting'; end if;
  select count(*) into v_count from public.domino_room_players p where p.room_id=p_room_id;
  v_capacity := (v_room.settings->>'players')::integer;
  if v_count < 2 then raise exception 'At least two players are required'; end if;
  if v_count <> v_capacity then raise exception 'Waiting for all seats to fill'; end if;
  update public.domino_rooms r set status='playing',updated_at=now() where r.id=p_room_id;
  return jsonb_build_object('room_id',p_room_id,'status','playing','players',v_count);
end;
$$;

revoke all on function public.create_domino_room(jsonb) from public, anon;
revoke all on function public.join_domino_room(text) from public, anon;
revoke all on function public.leave_domino_room(uuid) from public, anon;
revoke all on function public.start_domino_room(uuid) from public, anon;
grant execute on function public.create_domino_room(jsonb) to authenticated;
grant execute on function public.join_domino_room(text) to authenticated;
grant execute on function public.leave_domino_room(uuid) to authenticated;
grant execute on function public.start_domino_room(uuid) to authenticated;

do $$
begin
  if exists(select 1 from pg_publication where pubname='supabase_realtime') then
    if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='domino_rooms') then
      alter publication supabase_realtime add table public.domino_rooms;
    end if;
    if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='domino_room_players') then
      alter publication supabase_realtime add table public.domino_room_players;
    end if;
  end if;
end $$;
