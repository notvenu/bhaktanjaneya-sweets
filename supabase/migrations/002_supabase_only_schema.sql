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
