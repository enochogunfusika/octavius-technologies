-- Octavius Technologies — run this whole file in Supabase → SQL Editor

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  image text,
  created_at timestamptz default now(),
  last_login_at timestamptz default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text not null,
  price numeric(12,2) not null check (price >= 0),
  image_url text,
  stock int not null default 50,
  created_at timestamptz default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_email text not null references users(email),
  full_name text not null,
  phone text not null,
  address text not null,
  city text not null,
  total numeric(12,2) not null,
  status text not null default 'confirmed',
  email_sent boolean not null default false,
  created_at timestamptz default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id),
  product_name text not null,
  quantity int not null check (quantity > 0),
  unit_price numeric(12,2) not null
);

-- Lock the tables down: the app talks to Supabase only from the server
-- with the service role key, which bypasses RLS. Public (anon) access is blocked.
alter table users enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Starter catalogue
insert into products (name, description, category, price) values
  ('Octa Book Pro 14', 'Intel Core i7, 16GB RAM, 512GB SSD, 14" 2.8K display.', 'Laptops', 1250000),
  ('Octa Book Air 13', 'Lightweight everyday laptop. 8GB RAM, 256GB SSD, 12-hour battery.', 'Laptops', 780000),
  ('Nova X5 Smartphone', '6.7" AMOLED, 256GB storage, 50MP triple camera, 5000mAh battery.', 'Phones', 540000),
  ('Pulse Buds ANC', 'Wireless earbuds with active noise cancellation and 30h total battery.', 'Audio', 65000),
  ('Orbit Smartwatch S2', 'Heart rate, sleep tracking, GPS and 7-day battery life.', 'Wearables', 120000),
  ('VoltCore 20,000mAh Power Bank', '65W fast charging, charges a laptop and two phones at once.', 'Accessories', 38000),
  ('KeyFlow Mechanical Keyboard', 'Hot-swappable switches, RGB backlight, wired and Bluetooth.', 'Accessories', 72000),
  ('ViewMax 27" 4K Monitor', 'IPS panel, USB-C 65W power delivery, height-adjustable stand.', 'Displays', 420000);
