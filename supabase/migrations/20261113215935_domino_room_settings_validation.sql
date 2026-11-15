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
  where p.id=v_uid and p.membership_status='active';
  if v_member_code is null then raise exception 'Active trusted membership required'; end if;
  v_players := coalesce((p_settings->>'players')::integer,0);
  v_sets := coalesce((p_settings->>'sets')::integer,0);
  v_mode := coalesce(p_settings->>'mode','');
  if v_players < 2 or v_players > 8 then raise exception 'Players must be between 2 and 8'; end if;
  if v_sets not in (1,2) then raise exception 'Invalid domino set'; end if;
  if v_players > 4 and v_sets <> 2 then raise exception 'More than four players require a double set'; end if;
  if v_mode not in ('solo','teams') then raise exception 'Invalid match mode'; end if;
  if v_mode='teams' and mod(v_players,2)<>0 then raise exception 'Teams require an even number of players'; end if;
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
revoke all on function public.create_domino_room(jsonb) from public, anon;
grant execute on function public.create_domino_room(jsonb) to authenticated;
