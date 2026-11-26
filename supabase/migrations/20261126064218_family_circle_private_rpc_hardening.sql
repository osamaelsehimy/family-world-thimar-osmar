create schema if not exists private;
revoke all on schema private from public,anon;
grant usage on schema private to authenticated;

alter function public.create_family_circle(text) set schema private;
alter function public.join_family_circle(text) set schema private;
alter function public.family_circle_dashboard() set schema private;
alter function public.complete_family_mission(text) set schema private;

grant execute on function private.create_family_circle(text) to authenticated;
grant execute on function private.join_family_circle(text) to authenticated;
grant execute on function private.family_circle_dashboard() to authenticated;
grant execute on function private.complete_family_mission(text) to authenticated;

create or replace function public.create_family_circle(p_name text)
returns jsonb language sql security invoker set search_path = '' as $$ select private.create_family_circle(p_name); $$;
create or replace function public.join_family_circle(p_invite_code text)
returns jsonb language sql security invoker set search_path = '' as $$ select private.join_family_circle(p_invite_code); $$;
create or replace function public.family_circle_dashboard()
returns jsonb language sql security invoker set search_path = '' as $$ select private.family_circle_dashboard(); $$;
create or replace function public.complete_family_mission(p_task_key text)
returns boolean language sql security invoker set search_path = '' as $$ select private.complete_family_mission(p_task_key); $$;

revoke all on function public.create_family_circle(text) from public,anon;
revoke all on function public.join_family_circle(text) from public,anon;
revoke all on function public.family_circle_dashboard() from public,anon;
revoke all on function public.complete_family_mission(text) from public,anon;
grant execute on function public.create_family_circle(text) to authenticated;
grant execute on function public.join_family_circle(text) to authenticated;
grant execute on function public.family_circle_dashboard() to authenticated;
grant execute on function public.complete_family_mission(text) to authenticated;
