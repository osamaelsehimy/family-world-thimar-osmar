revoke all on table public.apartment_designs from anon;
revoke all on table public.apartment_designs from authenticated;
grant select, insert on table public.apartment_designs to authenticated;
grant update (design_json, updated_at) on table public.apartment_designs to authenticated;
