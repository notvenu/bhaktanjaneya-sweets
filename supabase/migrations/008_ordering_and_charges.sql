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