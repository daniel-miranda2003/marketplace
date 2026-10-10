alter table public.products
  add column if not exists is_sold boolean not null default false;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'garment_gender') then
    create type public.garment_gender as enum ('men', 'women', 'unisex');
  end if;
end
$$;

alter table public.products
  add column if not exists gender public.garment_gender null;
