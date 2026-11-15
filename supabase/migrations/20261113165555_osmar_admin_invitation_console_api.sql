-- Admin-only invite creation. Raw invite codes are returned once; only SHA-256 hashes are stored.
create or replace function public.osmar_create_invite(
  p_code_type text,
  p_source_label text default null,
  p_max_uses integer default 1,
  p_expires_at timestamptz default null
)
returns table(invite_code text,invite_type text,expires_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_code text;
  v_prefix text;
begin
  if auth.uid() is null
    or coalesce(auth.jwt()->'app_metadata'->>'role','') <> 'osmar_admin' then
    raise exception 'OSMAR administrator access required';
  end if;
  if p_code_type not in ('FAM','TRU','NET','OSM','TEAM') then
    raise exception 'Unsupported invitation type';
  end if;
  if p_max_uses is null or p_max_uses<1 or p_max_uses>500 then
    raise exception 'Invitation use limit must be between 1 and 500';
  end if;
  if p_expires_at is not null and p_expires_at<=now() then
    raise exception 'Expiration must be in the future';
  end if;
  if p_code_type<>'OSM' and not exists(
    select 1 from public.profiles p
    where p.id=auth.uid() and p.membership_status='active'
  ) then
    raise exception 'Only active members may issue member invitations';
  end if;

  v_prefix:=p_code_type;
  v_code:=v_prefix||'-'||upper(encode(extensions.gen_random_bytes(6),'hex'));

  insert into private.invite_codes(code_hash,code_prefix,code_type,created_by,source_label,max_uses,expires_at)
  values(
    encode(extensions.digest(v_code,'sha256'),'hex'),
    v_prefix,p_code_type,auth.uid(),nullif(btrim(p_source_label),''),p_max_uses,p_expires_at
  );

  return query select v_code,p_code_type,p_expires_at;
end;
$function$;

revoke all on function public.osmar_create_invite(text,text,integer,timestamptz) from public,anon;
grant execute on function public.osmar_create_invite(text,text,integer,timestamptz) to authenticated;
