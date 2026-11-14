create table public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  session_key uuid not null unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  game_id text not null check (game_id in ('domino','1024')),
  outcome text not null check (outcome in ('won','lost','draw')),
  score integer not null default 0 check (score >= 0 and score <= 10000000),
  duration_seconds integer not null default 0 check (duration_seconds >= 0 and duration_seconds <= 86400),
  record_source text not null default 'local_practice_self_reported'
    check (record_source = 'local_practice_self_reported'),
  created_at timestamptz not null default now()
);

create index game_sessions_user_created_idx
  on public.game_sessions (user_id, created_at desc);
create index game_sessions_user_game_idx
  on public.game_sessions (user_id, game_id, created_at desc);

alter table public.game_sessions enable row level security;
create policy "Members can read their own game sessions"
on public.game_sessions for select to authenticated
using ((select auth.uid()) = user_id);
create policy "Members can record their own local game sessions"
on public.game_sessions for insert to authenticated
with check ((select auth.uid()) = user_id);

revoke all on table public.game_sessions from anon;
revoke update, delete on table public.game_sessions from authenticated;
grant select, insert on table public.game_sessions to authenticated;

create or replace view public.member_game_stats
with (security_invoker = true)
as
select user_id, game_id,
       count(*)::bigint as games_played,
       count(*) filter (where outcome = 'won')::bigint as wins,
       count(*) filter (where outcome = 'lost')::bigint as losses,
       count(*) filter (where outcome = 'draw')::bigint as draws,
       coalesce(sum(score), 0)::bigint as total_score,
       coalesce(round(avg(duration_seconds)), 0)::bigint as average_duration_seconds,
       max(created_at) as last_played_at
from public.game_sessions
group by user_id, game_id;

revoke all on public.member_game_stats from anon;
grant select on public.member_game_stats to authenticated;

create or replace function public.osmar_game_directory()
returns table (
  member_id uuid,
  member_code text,
  games_played bigint,
  wins bigint,
  losses bigint,
  draws bigint
)
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if auth.uid() is null
    or coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') <> 'osmar_admin' then
    raise exception 'OSMAR administrator access required';
  end if;

  return query
  select p.id, p.member_code,
         count(g.id)::bigint,
         count(g.id) filter (where g.outcome = 'won')::bigint,
         count(g.id) filter (where g.outcome = 'lost')::bigint,
         count(g.id) filter (where g.outcome = 'draw')::bigint
  from public.profiles p
  left join public.game_sessions g on g.user_id = p.id
  group by p.id, p.member_code, p.created_at
  order by count(g.id) desc, p.created_at asc;
end;
$function$;

revoke all on function public.osmar_game_directory() from public;
revoke all on function public.osmar_game_directory() from anon;
grant execute on function public.osmar_game_directory() to authenticated;
