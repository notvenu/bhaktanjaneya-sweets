-- Courier details added by admins after dispatch.

alter table orders add column if not exists delivery_company text;
alter table orders add column if not exists delivery_tracking_id text;
