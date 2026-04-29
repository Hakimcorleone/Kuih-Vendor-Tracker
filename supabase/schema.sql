-- Kuih Vendor Tracker v2 schema
-- Logic: harga ambil from vendor + harga jual by shop.
-- Sedekah leftovers are unpaid to vendor.

create extension if not exists "pgcrypto";

drop view if exists today_dashboard_summary;
drop view if exists vendor_outstanding_balances;
drop table if exists wallet_transactions;
drop table if exists batch_items;
drop table if exists daily_batches;
drop table if exists products;
drop table if exists vendors;

create table vendors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  default_leftover_action text not null default 'donated_unpaid'
    check (default_leftover_action in ('returned', 'donated_unpaid', 'damaged')),
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table products (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references vendors(id) on delete cascade,
  name text not null,
  cost_price numeric not null default 0,
  selling_price numeric not null default 0,
  unit text not null default 'pcs',
  category text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table daily_batches (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references vendors(id) on delete cascade,
  batch_date date not null,
  status text not null default 'open' check (status in ('open', 'closed')),
  notes text,
  created_at timestamptz not null default now(),
  closed_at timestamptz,
  unique (vendor_id, batch_date)
);

create table batch_items (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references daily_batches(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  quantity_sent integer not null default 0,
  quantity_returned integer not null default 0,
  quantity_sold integer not null default 0,
  quantity_donated integer not null default 0,
  quantity_damaged integer not null default 0,
  cost_price numeric not null default 0,
  selling_price numeric not null default 0,
  gross_sales numeric not null default 0,
  vendor_payout numeric not null default 0,
  shop_profit numeric not null default 0,
  leftover_action text default 'donated_unpaid'
    check (leftover_action in ('returned', 'donated_unpaid', 'damaged')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references vendors(id) on delete cascade,
  batch_id uuid references daily_batches(id) on delete set null,
  transaction_date date not null default current_date,
  type text not null check (type in ('payout_earned', 'payment_made', 'adjustment_add', 'adjustment_deduct')),
  direction text not null check (direction in ('credit', 'debit')),
  description text,
  amount numeric not null default 0,
  payment_method text,
  reference_no text,
  notes text,
  created_at timestamptz not null default now()
);

create or replace view vendor_outstanding_balances as
select
  v.id as vendor_id,
  v.name,
  v.phone,
  coalesce(sum(case when wt.direction = 'credit' then wt.amount when wt.direction = 'debit' then -wt.amount else 0 end), 0) as outstanding_balance
from vendors v
left join wallet_transactions wt on wt.vendor_id = v.id
group by v.id, v.name, v.phone;

create or replace view today_dashboard_summary as
select
  current_date as summary_date,
  coalesce(count(distinct db.vendor_id), 0) as active_vendors_today,
  coalesce(count(bi.id), 0) as product_types_today,
  coalesce(sum(bi.gross_sales), 0) as gross_sales_today,
  coalesce(sum(bi.shop_profit), 0) as shop_profit_today,
  coalesce(sum(bi.vendor_payout), 0) as vendor_payout_today,
  (select coalesce(sum(outstanding_balance), 0) from vendor_outstanding_balances) as total_outstanding_balance
from daily_batches db
left join batch_items bi on bi.batch_id = db.id
where db.batch_date = current_date;

insert into vendors (name, phone, default_leftover_action, notes)
values ('Kak Ani', '0123456789', 'donated_unpaid', 'Sample vendor')
on conflict do nothing;

insert into products (vendor_id, name, cost_price, selling_price, unit, category)
select id, 'Karipap', 0.70, 1.00, 'pcs', 'Kuih'
from vendors where name = 'Kak Ani'
limit 1;
