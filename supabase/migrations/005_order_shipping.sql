-- Delivery and payment details for checkout orders.

alter table orders add column if not exists customer_email text;
alter table orders add column if not exists shipping_address jsonb;
alter table orders add column if not exists notes text;
alter table orders add column if not exists payment_method text;
alter table orders add column if not exists razorpay_order_id text;
alter table orders add column if not exists razorpay_payment_id text;
