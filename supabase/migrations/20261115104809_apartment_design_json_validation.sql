alter table public.apartment_designs
  drop constraint apartment_designs_cells,
  drop constraint apartment_designs_furniture;
alter table public.apartment_designs
  add constraint apartment_designs_cells check (
    case
      when jsonb_typeof(design_json->'cells') = 'array'
      then jsonb_array_length(design_json->'cells') = 100
      else false
    end
  ),
  add constraint apartment_designs_furniture check (
    case
      when not (design_json ? 'furniture') then true
      when jsonb_typeof(design_json->'furniture') = 'array'
      then jsonb_array_length(design_json->'furniture') <= 100
      else false
    end
  );