create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

create policy categories_public_read on public.categories
  for select using (true);

create index categories_sort_idx on public.categories (sort_order);

insert into public.categories (slug, label, sort_order) values
  ('dresses', 'Vestidos', 1),
  ('tops', 'Blusas', 2),
  ('bottoms', 'Pantalones', 3),
  ('denim', 'Denim', 4),
  ('coats', 'Abrigos', 5),
  ('footwear', 'Calzado', 6),
  ('accessories', 'Accesorios', 7);
