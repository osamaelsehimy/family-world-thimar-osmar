create or replace function public.osmar_record_registration_attempt(
  p_email text, p_code_hint text default null, p_reason text default 'invalid_invite'
) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if p_email is null or length(btrim(p_email)) < 5 or length(p_email) > 254
     or position('@' in btrim(p_email)) < 2
     or position('.' in split_part(btrim(p_email),'@',2)) < 2 then
    return;
  end if;
  insert into private.registration_attempts(email, invite_code_hint, reason)
  values (lower(btrim(p_email)),
    case when p_code_hint is null then null else left(regexp_replace(upper(btrim(p_code_hint)), '[^A-Z0-9-]', '', 'g'), 12) end,
    left(coalesce(nullif(p_reason,''),'invalid_invite'), 40));
end;
$$;
