-- Family World member profiles and optional avatars
alter table public.profiles
  add column if not exists display_name text,
  add column if not exists nickname text,
  add column if not exists avatar_url text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_display_name_length') then
    alter table public.profiles add constraint profiles_display_name_length
      check (display_name is null or char_length(display_name) between 1 and 60);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'profiles_nickname_length') then
    alter table public.profiles add constraint profiles_nickname_length
      check (nickname is null or char_length(nickname) <= 30);
  end if;
end $$;

-- Keep the permanent membership number immutable from the client.
revoke update on public.profiles from authenticated;
grant update (display_name, nickname, avatar_url) on public.profiles to authenticated;

drop policy if exists "Members can update own public profile fields" on public.profiles;
create policy "Members can update own public profile fields"
on public.profiles for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update
set public = true, file_size_limit = 2097152,
    allowed_mime_types = array['image/jpeg','image/png','image/webp'];

drop policy if exists "Members upload own avatar" on storage.objects;
create policy "Members upload own avatar"
on storage.objects for insert to authenticated
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Members read own avatar object metadata" on storage.objects;
create policy "Members read own avatar object metadata"
on storage.objects for select to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Members update own avatar" on storage.objects;
create policy "Members update own avatar"
on storage.objects for update to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text)
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Members delete own avatar" on storage.objects;
create policy "Members delete own avatar"
on storage.objects for delete to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
