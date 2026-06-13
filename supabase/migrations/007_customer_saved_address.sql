-- Default delivery address saved against a customer account.

alter table customers add column if not exists saved_address jsonb;
