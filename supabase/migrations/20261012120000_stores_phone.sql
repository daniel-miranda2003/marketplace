alter table public.stores
  add column if not exists phone text null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'stores_phone_unique') then
    alter table public.stores add constraint stores_phone_unique unique (phone);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'stores_phone_format') then
    alter table public.stores
      add constraint stores_phone_format check (phone ~ '^[567][0-9]{7}$');
  end if;
end
$$;
