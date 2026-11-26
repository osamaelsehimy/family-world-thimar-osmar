create table if not exists public.family_circles (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 2 and 50),
  owner_id uuid not null references auth.users(id) on delete cascade,
  invite_code text not null unique check (invite_code ~ '^[A-F0-9]{10}$'),
  created_at timestamptz not null default now()
);

create table if not exists public.family_circle_members (
  circle_id uuid not null references public.family_circles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','member')),
  joined_at timestamptz not null default now(),
  primary key (circle_id,user_id),
  unique (user_id)
);

create table if not exists public.family_mission_completions (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.family_circles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  task_key text not null check (task_key in ('home','learn','kind','green')),
  completed_on date not null default current_date,
  created_at timestamptz not null default now(),
  unique (circle_id,user_id,task_key,completed_on)
);

create index if not exists family_circle_members_user_idx on public.family_circle_members(user_id);
create index if not exists family_mission_completions_circle_day_idx on public.family_mission_completions(circle_id,completed_on desc);

alter table public.family_circles enable row level security;
alter table public.family_circle_members enable row level security;
alter table public.family_mission_completions enable row level security;
revoke all on public.family_circles, public.family_circle_members, public.family_mission_completions from anon, authenticated;

create or replace function public.create_family_circle(p_name text)
returns jsonb language plpgsql security definer set search_path = '' as $function$
declare v_uid uuid := auth.uid(); v_circle_id uuid; v_name text := btrim(coalesce(p_name,'')); v_code text;
begin
  if v_uid is null then raise exception 'Authentication required'; end if;
  if char_length(v_name) < 2 or char_length(v_name) > 50 then raise exception 'Family name must be between 2 and 50 characters'; end if;
  if not exists (select 1 from public.profiles p where p.id=v_uid and p.membership_status='active') then raise exception 'An active membership is required'; end if;
  if exists (select 1 from public.family_circle_members m where m.user_id=v_uid) then raise exception 'You already belong to a family circle'; end if;
  v_code := upper(substr(replace(gen_random_uuid()::text,'-',''),1,10));
  insert into public.family_circles(name,owner_id,invite_code) values(v_name,v_uid,v_code) returning id into v_circle_id;
  insert into public.family_circle_members(circle_id,user_id,role) values(v_circle_id,v_uid,'owner');
  return jsonb_build_object('circle_id',v_circle_id,'name',v_name,'invite_code',v_code);
end;
$function$;

create or replace function public.join_family_circle(p_invite_code text)
returns jsonb language plpgsql security definer set search_path = '' as $function$
declare v_uid uuid := auth.uid(); v_circle public.family_circles%rowtype;
begin
  if v_uid is null then raise exception 'Authentication required'; end if;
  if not exists (select 1 from public.profiles p where p.id=v_uid and p.membership_status='active') then raise exception 'An active membership is required'; end if;
  if exists (select 1 from public.family_circle_members m where m.user_id=v_uid) then raise exception 'You already belong to a family circle'; end if;
  select * into v_circle from public.family_circles c where c.invite_code=upper(btrim(coalesce(p_invite_code,'')));
  if not found then raise exception 'Family invitation code not found'; end if;
  insert into public.family_circle_members(circle_id,user_id,role) values(v_circle.id,v_uid,'member');
  return jsonb_build_object('circle_id',v_circle.id,'name',v_circle.name);
end;
$function$;

create or replace function public.family_circle_dashboard()
returns jsonb language plpgsql security definer stable set search_path = '' as $function$
declare v_uid uuid := auth.uid(); v_result jsonb;
begin
  if v_uid is null then raise exception 'Authentication required'; end if;
  select jsonb_build_object('circle',jsonb_build_object(
    'id',c.id,'name',c.name,'invite_code',case when m.role='owner' then c.invite_code else null end,'role',m.role,'created_at',c.created_at,
    'members',(select coalesce(jsonb_agg(jsonb_build_object('user_id',p.id,'display_name',coalesce(nullif(p.display_name,''),nullif(p.nickname,''),'Family World member'),'nickname',p.nickname,'avatar_url',p.avatar_url,'role',cm.role,'joined_at',cm.joined_at) order by case when cm.role='owner' then 0 else 1 end,cm.joined_at),'[]'::jsonb) from public.family_circle_members cm join public.profiles p on p.id=cm.user_id where cm.circle_id=c.id),
    'today_completions',(select coalesce(jsonb_agg(jsonb_build_object('task_key',x.task_key,'count',x.total)),'[]'::jsonb) from (select fc.task_key,count(*)::integer as total from public.family_mission_completions fc where fc.circle_id=c.id and fc.completed_on=current_date group by fc.task_key) x),
    'my_done',(select coalesce(jsonb_agg(fc.task_key),'[]'::jsonb) from public.family_mission_completions fc where fc.circle_id=c.id and fc.user_id=v_uid and fc.completed_on=current_date),
    'total_completions',(select count(*)::integer from public.family_mission_completions fc where fc.circle_id=c.id)
  )) into v_result
  from public.family_circle_members m join public.family_circles c on c.id=m.circle_id where m.user_id=v_uid;
  return coalesce(v_result,jsonb_build_object('circle',null));
end;
$function$;

create or replace function public.complete_family_mission(p_task_key text)
returns boolean language plpgsql security definer set search_path = '' as $function$
declare v_uid uuid := auth.uid(); v_circle_id uuid; v_rows integer;
begin
  if v_uid is null then raise exception 'Authentication required'; end if;
  if p_task_key not in ('home','learn','kind','green') then raise exception 'Unknown family mission'; end if;
  select m.circle_id into v_circle_id from public.family_circle_members m join public.profiles p on p.id=m.user_id and p.membership_status='active' where m.user_id=v_uid;
  if v_circle_id is null then raise exception 'Join a family circle first'; end if;
  insert into public.family_mission_completions(circle_id,user_id,task_key) values(v_circle_id,v_uid,p_task_key)
  on conflict (circle_id,user_id,task_key,completed_on) do nothing;
  get diagnostics v_rows=row_count;
  return v_rows=1;
end;
$function$;

revoke all on function public.create_family_circle(text) from public,anon;
revoke all on function public.join_family_circle(text) from public,anon;
revoke all on function public.family_circle_dashboard() from public,anon;
revoke all on function public.complete_family_mission(text) from public,anon;
grant execute on function public.create_family_circle(text) to authenticated;
grant execute on function public.join_family_circle(text) to authenticated;
grant execute on function public.family_circle_dashboard() to authenticated;
grant execute on function public.complete_family_mission(text) to authenticated;
