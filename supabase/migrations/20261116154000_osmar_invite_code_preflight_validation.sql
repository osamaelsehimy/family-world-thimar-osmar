create or replace function public.osmar_validate_invite_code(p_code text)
returns table(is_valid boolean, invite_type text, uses_remaining integer)
language sql
security definer
set search_path = ''
as $function$
  select
    exists (
      select 1 from private.invite_codes i
      where i.code_hash = encode(extensions.digest(upper(btrim(coalesce(p_code, ''))), 'sha256'), 'hex')
        and i.revoked_at is null
        and (i.expires_at is null or i.expires_at > now())
        and i.uses_count < i.max_uses
    ) as is_valid,
    (
      select i.code_type from private.invite_codes i
      where i.code_hash = encode(extensions.digest(upper(btrim(coalesce(p_code, ''))), 'sha256'), 'hex')
        and i.revoked_at is null
        and (i.expires_at is null or i.expires_at > now())
        and i.uses_count < i.max_uses
      limit 1
    ) as invite_type,
    (
      select greatest(i.max_uses - i.uses_count, 0) from private.invite_codes i
      where i.code_hash = encode(extensions.digest(upper(btrim(coalesce(p_code, ''))), 'sha256'), 'hex')
        and i.revoked_at is null
        and (i.expires_at is null or i.expires_at > now())
        and i.uses_count < i.max_uses
      limit 1
    ) as uses_remaining;
$function$;

revoke all on function public.osmar_validate_invite_code(text) from public;
grant execute on function public.osmar_validate_invite_code(text) to anon, authenticated;
