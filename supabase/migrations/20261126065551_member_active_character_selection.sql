alter table public.profiles
  add column if not exists active_character_id text;

alter table public.profiles
  drop constraint if exists profiles_active_character_id_format;

alter table public.profiles
  add constraint profiles_active_character_id_format
  check (
    active_character_id is null
    or active_character_id ~ '^(starter|fw)-[a-z0-9-]{1,72}$'
  );

revoke update on public.profiles from authenticated;
grant update (display_name, nickname, avatar_url, active_character_id)
  on public.profiles to authenticated;
