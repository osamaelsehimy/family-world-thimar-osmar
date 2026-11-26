create or replace function private.family_circle_dashboard()
returns jsonb
language plpgsql
security definer
stable
set search_path = ''
as $function$
declare
  v_uid uuid := auth.uid();
  v_result jsonb;
begin
  if v_uid is null then
    raise exception 'Authentication required';
  end if;

  select jsonb_build_object(
    'circle', jsonb_build_object(
      'id', c.id,
      'name', c.name,
      'invite_code', case when m.role = 'owner' then c.invite_code else null end,
      'role', m.role,
      'created_at', c.created_at,
      'members', (
        select coalesce(jsonb_agg(jsonb_build_object(
          'user_id', p.id,
          'display_name', coalesce(nullif(p.display_name, ''), nullif(p.nickname, ''), 'Family World member'),
          'nickname', p.nickname,
          'avatar_url', p.avatar_url,
          'role', cm.role,
          'joined_at', cm.joined_at
        ) order by case when cm.role = 'owner' then 0 else 1 end, cm.joined_at), '[]'::jsonb)
        from public.family_circle_members cm
        join public.profiles p on p.id = cm.user_id and p.membership_status = 'active'
        where cm.circle_id = c.id
      ),
      'today_completions', (
        select coalesce(jsonb_agg(jsonb_build_object('task_key', x.task_key, 'count', x.total)), '[]'::jsonb)
        from (
          select fc.task_key, count(*)::integer as total
          from public.family_mission_completions fc
          join public.family_circle_members active_member
            on active_member.circle_id = fc.circle_id and active_member.user_id = fc.user_id
          join public.profiles active_profile
            on active_profile.id = active_member.user_id and active_profile.membership_status = 'active'
          where fc.circle_id = c.id and fc.completed_on = current_date
          group by fc.task_key
        ) x
      ),
      'my_done', (
        select coalesce(jsonb_agg(fc.task_key), '[]'::jsonb)
        from public.family_mission_completions fc
        where fc.circle_id = c.id and fc.user_id = v_uid and fc.completed_on = current_date
      ),
      'total_completions', (
        select count(*)::integer
        from public.family_mission_completions fc
        join public.family_circle_members active_member
          on active_member.circle_id = fc.circle_id and active_member.user_id = fc.user_id
        join public.profiles active_profile
          on active_profile.id = active_member.user_id and active_profile.membership_status = 'active'
        where fc.circle_id = c.id
      )
    )
  )
  into v_result
  from public.family_circle_members m
  join public.family_circles c on c.id = m.circle_id
  join public.profiles caller_profile
    on caller_profile.id = m.user_id and caller_profile.membership_status = 'active'
  where m.user_id = v_uid;

  return coalesce(v_result, jsonb_build_object('circle', null));
end;
$function$;
