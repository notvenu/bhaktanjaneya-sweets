-- Merged migration for Bhaktanjaneya Sweets
-- This file concatenates the existing migrations (001 -> 008) in order.
-- It does not modify any SQL logic.


/* ============================ 001_init.sql ============================ */

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
grant insert on table orders, customers, otps to anon;


/* ============================ 002_supabase_only_schema.sql ============================ */

-- Bring earlier Supabase installs in line with the app's runtime data shapes.

alter table products alter column id type text using id::text;
alter table categories alter column id type text using id::text;
alter table offers alter column id type text using id::text;
alter table customers alter column id type text using id::text;
alter table admins alter column id type text using id::text;
alter table otps alter column id type text using id::text;
alter table orders alter column id type text using id::text;

alter table products alter column id set default gen_random_uuid()::text;
alter table categories alter column id set default gen_random_uuid()::text;
alter table offers alter column id set default gen_random_uuid()::text;
alter table customers alter column id set default gen_random_uuid()::text;
alter table admins alter column id set default gen_random_uuid()::text;
alter table otps alter column id set default gen_random_uuid()::text;
alter table orders alter column id set default gen_random_uuid()::text;

alter table products drop column if exists price;
alter table products drop column if exists currency;
alter table products drop column if exists metadata;
alter table products add column if not exists category_label text;
alter table products add column if not exists images text[] default '{}';
alter table products add column if not exists variants jsonb default '[]'::jsonb;
alter table products add column if not exists rating numeric default 0;
alter table products add column if not exists review_count integer default 0;
alter table products add column if not exists badges text[] default '{}';

alter table categories add column if not exists image text;

alter table offers add column if not exists code text;
alter table offers add column if not exists type text;
alter table offers add column if not exists value integer default 0;
alter table offers add column if not exists min_subtotal integer;
alter table offers add constraint offers_code_unique unique (code);


/* ============================ 003_grants.sql ============================ */

-- Ensure API routes using the service role key can read/write all tables.

grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on all tables in schema public to postgres, service_role;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;
grant insert on table orders, customers, otps to anon;


/* ============================ 004_category_images_storage.sql ============================ */

-- Public bucket for category circle images uploaded from the admin panel.

insert into storage.buckets (id, name, public)
values ('category-images', 'category-images', true)
on conflict (id) do update set public = true;

drop policy if exists "public read category images" on storage.objects;
create policy "public read category images"
on storage.objects for select
using (bucket_id = 'category-images');


/* ============================ 005_order_shipping.sql ============================ */

-- Delivery and payment details for checkout orders.

alter table orders add column if not exists customer_email text;
alter table orders add column if not exists shipping_address jsonb;
alter table orders add column if not exists notes text;
alter table orders add column if not exists payment_method text;
alter table orders add column if not exists razorpay_order_id text;
alter table orders add column if not exists razorpay_payment_id text;


/* ============================ 006_order_delivery_tracking.sql ============================ */

-- Courier details added by admins after dispatch.

alter table orders add column if not exists delivery_company text;
alter table orders add column if not exists delivery_tracking_id text;


/* ============================ 007_customer_saved_address.sql ============================ */

-- Default delivery address saved against a customer account.

alter table customers add column if not exists saved_address jsonb;


/* ============================ 008_ordering_and_charges.sql ============================ */

-- 1. Fix RLS Policies (Fixes "Forbidden" error on Checkout)
-- Allow anonymous insertion for the checkout and OTP flows
create policy "Anyone can insert orders" on orders for insert with check (true);
create policy "Anyone can insert otps" on otps for insert with check (true);
create policy "Anyone can insert customers" on customers for insert with check (true);

-- Allow authenticated users to see their own data
create policy "Authenticated users can read their orders" on orders for select using (auth.role() = 'authenticated');
create policy "Authenticated users can read their profile" on customers for select using (auth.role() = 'authenticated');

-- 2. Add GST and Additional Charges to Products (Admin Configuration)
alter table products add column if not exists tax_rate numeric default 0; -- e.g., 5.0 for 5%
alter table products add column if not exists extra_charges integer default 0; -- flat INR amount

-- 3. Add Snapshot Columns to Orders (Persistence)
-- This stores the charges applied at the time of the order
alter table orders add column if not exists tax_amount integer default 0;
alter table orders add column if not exists extra_charges_amount integer default 0;

-- Ensure the products table allows public read access for the storefront to calculate prices
create policy "Public read products" on products for select using (active = true);

comment on column products.tax_rate is 'GST percentage applied to the product variants';



-- Fuzzy ranked product search using Postgres trigram similarity.
-- Adds pg_trgm extension, indexes, and a search function.

create extension if not exists pg_trgm;

-- Trigram indexes for fast similarity.
create index if not exists products_name_trgm_gin on products using gin (name gin_trgm_ops);
create index if not exists products_slug_trgm_gin on products using gin (slug gin_trgm_ops);
create index if not exists products_category_label_trgm_gin on products using gin (category_label gin_trgm_ops);

-- For tags (text[]) we unnest during search; trigram index on tags elements is not directly possible,
-- so we rely on similarity computations over unnested elements.

-- Ranked fuzzy search function.
-- category_filter/tag_filter are optional; when provided they restrict results.
create or replace function search_products_fuzzy(
  query_text text,
  limit_count integer default 24,
  category_filter text default null,
  tag_filter text default null
)
returns setof products
language sql
stable
as $$
  select p.*
  from products p
  where p.active = true
    and (category_filter is null or p.category = category_filter)
    and (tag_filter is null or p.tags @> array[tag_filter])
    and (
      p.name % query_text
      or p.slug % query_text
      or p.category_label % query_text
      or exists (
        select 1 from unnest(coalesce(p.tags, array[]::text[])) t
        where t % query_text
      )
      or coalesce(p.description, '') ilike ('%' || query_text || '%')
    )
  order by
    -- Exact/prefix boost
    case
      when p.name ilike query_text || '%' then 100
      when p.slug ilike query_text || '%' then 80
      when p.category_label ilike query_text || '%' then 60
      else 0
    end desc,

    -- Trigram similarity ranking
    greatest(
      similarity(p.name, query_text),
      similarity(p.slug, query_text),
      similarity(p.category_label, query_text),
      (
        select max(similarity(t, query_text))
        from unnest(coalesce(p.tags, array[]::text[])) t
      )
    ) desc,

    -- Tie-breakers
    p.rating desc,
    p.review_count desc,
    p.name asc
  limit limit_count;
$$;

-- Allow service_role to execute; other roles can read the returned products via existing RLS.
grant execute on function search_products_fuzzy(text, integer, text, text) to service_role;

