create or replace function private.is_domino_room_member(p_room_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and exists (
    select 1 from public.domino_room_players p
    where p.room_id=p_room_id and p.user_id=auth.uid()
  );
$$;
revoke all on function private.is_domino_room_member(uuid) from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.is_domino_room_member(uuid) to authenticated;
drop policy if exists "Room members can view their rooms" on public.domino_rooms;
create policy "Room members can view their rooms" on public.domino_rooms for select to authenticated
using (private.is_domino_room_member(id));
drop policy if exists "Room members can view room roster" on public.domino_room_players;
create policy "Room members can view room roster" on public.domino_room_players for select to authenticated
using (private.is_domino_room_member(room_id));
