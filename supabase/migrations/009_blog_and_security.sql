/* ===================================================================
   009_blog_and_security.sql
   - Adds the `posts` table (admin-managed blog) + seed rows.
   - Locks down the public `anon` role: the storefront and admin both go
     through service-role API routes, so the browser-exposed anon key must
     NOT be able to write (or read) order/customer/OTP data directly.
   =================================================================== */

/* ----------------------------- Blog posts ----------------------------- */

create table if not exists posts (
  id text primary key default gen_random_uuid()::text,
  slug text unique not null,
  title text not null,
  excerpt text,
  author text,
  cover text,
  date date,
  read_minutes integer default 3,
  content text[] default '{}',
  active boolean default true,
  created_at timestamptz default now()
);

alter table posts enable row level security;

-- The API uses the service-role key; it needs full table privileges. (A table
-- created after the earlier blanket grants won't inherit them automatically.)
grant all on table posts to postgres, service_role;

-- Storefront reads published posts; writes happen via the service-role API.
drop policy if exists "public read active posts" on posts;
create policy "public read active posts" on posts for select using (active = true);

-- Seed a few starter posts (no-op if slugs already exist).
insert into posts (slug, title, excerpt, author, cover, date, read_minutes, content, active)
values
  (
    'the-story-behind-bhaktanjaneya-sweets',
    'The Story Behind Bhaktanjaneya Sweets',
    'How a family kitchen and a devotion to purity grew into a sweets brand trusted across Telugu homes.',
    'Bhaktanjaneya Sweets',
    '/images/categories/sweets.svg',
    '2026-05-20',
    4,
    array[
      'Bhaktanjaneya Sweets began the way most good things do — in a home kitchen, with recipes passed down through generations.',
      'Every sweet we make starts with a simple promise: pure ghee, fresh ingredients, and absolutely no artificial flavouring. It is the same promise our family has kept for decades.',
      'Today we bring those same recipes to your doorstep, made fresh in small batches so that every bite tastes the way it should — like home.'
    ],
    true
  ),
  (
    'why-we-make-everything-in-pure-ghee',
    'Why We Make Everything in Pure Ghee',
    'Pure ghee is more than tradition — it is the secret to flavour, aroma, and the melt-in-your-mouth texture you love.',
    'Bhaktanjaneya Sweets',
    '/images/categories/namkeen.svg',
    '2026-05-05',
    3,
    array[
      'Ask anyone who grew up on homemade sweets and they will tell you: nothing replaces the aroma of pure ghee.',
      'We never cut corners with cheaper oils. Pure ghee gives our sweets their richness, our laddus their softness, and our namkeen its unmistakable crunch.',
      'It costs more and takes more care — but it is the difference between a sweet you eat and a sweet you remember.'
    ],
    true
  ),
  (
    'gifting-sweets-for-festivals-and-occasions',
    'Gifting Sweets for Festivals & Occasions',
    'From Diwali hampers to wedding boxes, here is how to choose the perfect sweet gift for every celebration.',
    'Bhaktanjaneya Sweets',
    '/images/categories/sweets.svg',
    '2026-04-18',
    5,
    array[
      'Sweets are at the heart of every Indian celebration. The right box says more than words ever could.',
      'For festivals, our assorted boxes mix classic favourites so there is something for everyone. For weddings and corporate gifting, we offer bulk orders with custom packaging.',
      'Planning a large order? Reach out on WhatsApp and we will help you put together the perfect hamper.'
    ],
    true
  )
on conflict (slug) do nothing;

/* --------------------- Lock down the public anon role --------------------- */
-- The anon key ships to the browser. With the broad grants + permissive
-- insert policies from earlier migrations, anyone could insert OTP rows
-- (and forge logins) or write orders/customers directly, bypassing the API.
-- Revoke all of that; the API uses the service-role key which ignores RLS.

drop policy if exists "Anyone can insert orders" on orders;
drop policy if exists "Anyone can insert otps" on otps;
drop policy if exists "Anyone can insert customers" on customers;
drop policy if exists "Authenticated users can read their orders" on orders;
drop policy if exists "Authenticated users can read their profile" on customers;

revoke insert on table orders, customers, otps from anon;
revoke select, insert, update, delete on all tables in schema public from anon;

-- Re-grant ONLY public, non-sensitive reads (RLS still scopes these to active rows).
grant select on table products, categories, offers, posts to anon;
