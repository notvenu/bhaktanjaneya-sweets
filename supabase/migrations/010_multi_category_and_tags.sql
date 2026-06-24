/* ===================================================================
   010_multi_category_and_tags.sql
   - Lets a product live in MULTIPLE categories via products.categories[].
     The legacy single `category` column is kept as the "primary" category
     (categories[0]) for backward compatibility / breadcrumbs / default art.
   - Adds a managed `tags` table so merchandising tags (Best Seller, Top
     Picks, Our Picks, …) can be created/edited in the admin and flagged to
     appear on the home page (`featured`).
   =================================================================== */

/* ------------------------- Multiple categories ------------------------- */

alter table products add column if not exists categories text[] default '{}';

-- Backfill: seed the new array from the existing single category so nothing
-- disappears from collection pages. Safe to re-run.
update products
   set categories = array[category]
 where category is not null
   and category <> ''
   and (categories is null or categories = '{}');

/* ------------------------------- Tags --------------------------------- */

create table if not exists tags (
  id text primary key default gen_random_uuid()::text,
  slug text unique not null,
  name text not null,
  -- When true, the tag gets its own carousel on the home page.
  featured boolean default false,
  sort_order integer default 99,
  created_at timestamptz default now()
);

alter table tags enable row level security;

-- The API uses the service-role key; a table created after the earlier blanket
-- grants won't inherit them automatically, so grant explicitly.
grant all on table tags to postgres, service_role;

-- Tags are merchandising metadata — safe for the storefront to read.
drop policy if exists "public read tags" on tags;
create policy "public read tags" on tags for select using (true);

-- Seed the default tag set (no-op if a slug already exists). `featured` marks
-- the ones that surface as a carousel on the home page.
insert into tags (slug, name, featured, sort_order)
values
  ('top-pick',    'Top Picks',   true,  1),
  ('best-seller', 'Best Sellers', true, 2),
  ('our-picks',   'Our Picks',   true,  3),
  ('new',         'New Arrivals', false, 4),
  ('combo',       'Combos & Gifting', false, 5)
on conflict (slug) do nothing;
