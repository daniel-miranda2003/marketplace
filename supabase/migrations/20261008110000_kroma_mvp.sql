create type user_role as enum ('buyer', 'vendor', 'admin');
create type subscription_status as enum ('free', 'premium');
create type garment_category as enum ('dresses', 'tops', 'bottoms', 'denim', 'coats', 'footwear', 'accessories');
create type chromatic_season as enum ('spring', 'summer', 'autumn', 'winter');
create type payment_status as enum ('pending', 'approved', 'rejected');
create type order_status as enum ('pending_payment', 'paid', 'delivered');
create type settlement_status as enum ('pending', 'settled');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role user_role not null default 'buyer',
  subscription subscription_status not null default 'free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.colorimetry_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  season chromatic_season not null,
  recommended_palette text[] not null default '{}',
  analysis jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.stores (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  slug text not null unique,
  description text,
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores (id) on delete cascade,
  name text not null,
  description text,
  price numeric(10, 2) not null check (price >= 0),
  category garment_category not null,
  sizes text[] not null default '{}',
  image_urls text[] not null default '{}',
  stock integer not null default 0 check (stock >= 0),
  is_sponsored boolean not null default false,
  colorimetry_tag chromatic_season,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.premium_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  receipt_url text not null,
  amount numeric(10, 2) not null check (amount >= 0),
  status payment_status not null default 'pending',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles (id) on delete restrict,
  product_id uuid not null references public.products (id) on delete restrict,
  store_id uuid not null references public.stores (id) on delete restrict,
  quantity integer not null default 1 check (quantity > 0),
  unit_price numeric(10, 2) not null check (unit_price >= 0),
  total_price numeric(10, 2) not null check (total_price >= 0),
  status order_status not null default 'pending_payment',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.vendor_ledger (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores (id) on delete restrict,
  order_id uuid not null unique references public.orders (id) on delete restrict,
  gross_amount numeric(10, 2) not null check (gross_amount >= 0),
  platform_fee numeric(10, 2) not null check (platform_fee >= 0),
  net_amount numeric(10, 2) not null check (net_amount >= 0),
  settlement_status settlement_status not null default 'pending',
  settled_at timestamptz,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger colorimetry_profiles_updated_at
  before update on public.colorimetry_profiles
  for each row execute function public.set_updated_at();

create trigger stores_updated_at
  before update on public.stores
  for each row execute function public.set_updated_at();

create trigger products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.colorimetry_profiles enable row level security;
alter table public.stores enable row level security;
alter table public.products enable row level security;
alter table public.premium_payments enable row level security;
alter table public.orders enable row level security;
alter table public.vendor_ledger enable row level security;

create policy profiles_public_read on public.profiles
  for select using (true);

create policy profiles_owner_update on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

create policy colorimetry_owner_read on public.colorimetry_profiles
  for select using (auth.uid() = user_id);

create policy colorimetry_owner_insert on public.colorimetry_profiles
  for insert with check (auth.uid() = user_id);

create policy colorimetry_owner_update on public.colorimetry_profiles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy stores_public_read on public.stores
  for select using (true);

create policy stores_owner_insert on public.stores
  for insert with check (auth.uid() = owner_id);

create policy stores_owner_update on public.stores
  for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy stores_owner_delete on public.stores
  for delete using (auth.uid() = owner_id);

create policy products_public_read on public.products
  for select using (true);

create policy products_vendor_insert on public.products
  for insert with check (
    exists (
      select 1 from public.stores
      where id = store_id and owner_id = auth.uid()
    )
  );

create policy products_vendor_update on public.products
  for update using (
    exists (
      select 1 from public.stores
      where id = store_id and owner_id = auth.uid()
    )
  );

create policy products_vendor_delete on public.products
  for delete using (
    exists (
      select 1 from public.stores
      where id = store_id and owner_id = auth.uid()
    )
  );

create policy premium_payments_owner_read on public.premium_payments
  for select using (auth.uid() = user_id);

create policy premium_payments_owner_insert on public.premium_payments
  for insert with check (auth.uid() = user_id);

create policy premium_payments_admin_read on public.premium_payments
  for select using (public.is_admin());

create policy premium_payments_admin_update on public.premium_payments
  for update using (public.is_admin());

create policy orders_buyer_read on public.orders
  for select using (auth.uid() = buyer_id);

create policy orders_vendor_read on public.orders
  for select using (
    exists (
      select 1 from public.stores
      where id = store_id and owner_id = auth.uid()
    )
  );

create policy orders_buyer_insert on public.orders
  for insert with check (auth.uid() = buyer_id);

create policy orders_vendor_update on public.orders
  for update using (
    exists (
      select 1 from public.stores
      where id = store_id and owner_id = auth.uid()
    )
  );

create policy orders_admin_read on public.orders
  for select using (public.is_admin());

create policy orders_admin_update on public.orders
  for update using (public.is_admin());

create policy vendor_ledger_vendor_read on public.vendor_ledger
  for select using (
    exists (
      select 1 from public.stores
      where id = store_id and owner_id = auth.uid()
    )
  );

create policy vendor_ledger_admin_read on public.vendor_ledger
  for select using (public.is_admin());

create policy vendor_ledger_admin_update on public.vendor_ledger
  for update using (public.is_admin());

create index stores_owner_id_idx on public.stores (owner_id);
create index products_store_id_idx on public.products (store_id);
create index products_category_active_idx on public.products (category, is_active);
create index products_sponsored_idx on public.products (created_at desc)
  where is_sponsored = true and is_active = true;
create index premium_payments_user_id_idx on public.premium_payments (user_id);
create index premium_payments_status_idx on public.premium_payments (status);
create index orders_buyer_id_idx on public.orders (buyer_id);
create index orders_store_id_idx on public.orders (store_id);
create index vendor_ledger_store_id_idx on public.vendor_ledger (store_id);
