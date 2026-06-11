-- Create core tables for Bhaktanjaneya Sweets

create table products (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  slug text unique not null,
  description text,
  active boolean default true,
  category text,
  category_label text,
  images text[] default '{}',
  variants jsonb default '[]'::jsonb,
  tags text[],
  rating numeric default 0,
  review_count integer default 0,
  badges text[] default '{}',
  created_at timestamptz default now()
);

create table categories (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  slug text unique not null,
  description text,
  image text,
  sort_order integer default 99,
  created_at timestamptz default now()
);

create table offers (
  id text primary key default gen_random_uuid()::text,
  code text unique not null,
  title text not null,
  description text,
  type text not null,
  value integer not null default 0,
  min_subtotal integer,
  active boolean default false,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz default now()
);

create table customers (
  id text primary key default gen_random_uuid()::text,
  phone text unique,
  email text,
  name text,
  created_at timestamptz default now()
);

create table admins (
  id text primary key default gen_random_uuid()::text,
  email text unique not null,
  name text,
  password_hash text not null,
  role text default 'admin',
  created_at timestamptz default now()
);

create table otps (
  id text primary key default gen_random_uuid()::text,
  phone text not null,
  code text not null,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

create table orders (
  id text primary key default gen_random_uuid()::text,
  customer_phone text not null,
  customer_name text,
  items jsonb not null,
  subtotal integer not null,
  discount integer,
  shipping integer,
  total integer not null,
  channel text not null,
  payment_status text not null,
  status text not null,
  created_at timestamptz default now()
);

alter table products enable row level security;
alter table categories enable row level security;
alter table offers enable row level security;
alter table customers enable row level security;
alter table admins enable row level security;
alter table otps enable row level security;
alter table orders enable row level security;

create policy "public read active products" on products for select using (active = true);
create policy "public read categories" on categories for select using (true);
create policy "public read active offers" on offers for select using (active = true);

-- API routes use the service role key; ensure it can read/write all tables.
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on all tables in schema public to postgres, service_role;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;
