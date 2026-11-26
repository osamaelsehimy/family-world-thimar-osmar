create or replace function private.rotate_family_circle_invite()
returns text language plpgsql security definer set search_path = '' as $function$
declare v_uid uuid := auth.uid(); v_code text;
begin
  if v_uid is null then raise exception 'Authentication required'; end if;
  update public.family_circles c
  set invite_code=upper(substr(replace(gen_random_uuid()::text,'-',''),1,10))
  where c.owner_id=v_uid and exists (
    select 1 from public.family_circle_members m
    join public.profiles p on p.id=m.user_id
    where m.circle_id=c.id and m.user_id=v_uid and m.role='owner' and p.membership_status='active'
  )
  returning c.invite_code into v_code;
  if v_code is null then raise exception 'Only the active family circle owner can refresh the invitation code'; end if;
  return v_code;
end;
$function$;
grant execute on function private.rotate_family_circle_invite() to authenticated;

create or replace function public.rotate_family_circle_invite()
returns text language sql security invoker set search_path = '' as $$ select private.rotate_family_circle_invite(); $$;
revoke all on function public.rotate_family_circle_invite() from public,anon;
grant execute on function public.rotate_family_circle_invite() to authenticated;
