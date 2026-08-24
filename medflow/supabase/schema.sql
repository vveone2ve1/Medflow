-- ============================================================
-- MEDFLOW schema for Supabase
-- Run this once in the Supabase SQL editor (Project > SQL Editor > New query)
-- after creating a new project. Safe to re-run: uses IF NOT EXISTS where possible.
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- profiles ----------
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('clinic', 'supplier', 'admin')),
  organization_name text not null,
  contact_email text,
  created_at timestamptz not null default now()
);

-- ---------- products ----------
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references profiles (id) on delete cascade,
  name text not null,
  sku text not null,
  category text,
  unit text not null default 'unit',
  unit_price numeric(12, 2) not null default 0,
  description text,
  requires_cold_chain boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- inventory ----------
create table if not exists inventory (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles (id) on delete cascade,
  product_id uuid not null references products (id) on delete cascade,
  quantity_on_hand integer not null default 0,
  reorder_threshold integer not null default 0,
  location text,
  updated_at timestamptz not null default now()
);

-- ---------- orders ----------
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references profiles (id) on delete cascade,
  supplier_id uuid not null references profiles (id) on delete cascade,
  status text not null default 'submitted'
    check (status in ('submitted', 'confirmed', 'dispatched', 'in_transit', 'delivered', 'cancelled')),
  total_amount numeric(12, 2) not null default 0,
  timestamps jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- order_items ----------
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  product_id uuid not null references products (id),
  quantity integer not null check (quantity > 0),
  unit_price numeric(12, 2) not null
);

-- ---------- invoices ----------
create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  amount numeric(12, 2) not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'overdue')),
  due_date timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------- compliance_documents ----------
create table if not exists compliance_documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles (id) on delete cascade,
  title text not null,
  doc_type text not null,
  expiry_date date,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table profiles enable row level security;
alter table products enable row level security;
alter table inventory enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table invoices enable row level security;
alter table compliance_documents enable row level security;

drop policy if exists "profiles_select_all" on profiles;
create policy "profiles_select_all" on profiles for select to authenticated using (true);

drop policy if exists "profiles_insert_own" on profiles;
create policy "profiles_insert_own" on profiles for insert to authenticated with check (id = auth.uid());

drop policy if exists "profiles_update_own" on profiles;
create policy "profiles_update_own" on profiles for update to authenticated using (id = auth.uid());

drop policy if exists "products_select_all" on products;
create policy "products_select_all" on products for select to authenticated using (true);

drop policy if exists "products_write_own" on products;
create policy "products_write_own" on products for all to authenticated
  using (supplier_id = auth.uid()) with check (supplier_id = auth.uid());

drop policy if exists "inventory_owner_only" on inventory;
create policy "inventory_owner_only" on inventory for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "orders_parties_select" on orders;
create policy "orders_parties_select" on orders for select to authenticated
  using (clinic_id = auth.uid() or supplier_id = auth.uid());

drop policy if exists "orders_clinic_insert" on orders;
create policy "orders_clinic_insert" on orders for insert to authenticated
  with check (clinic_id = auth.uid());

drop policy if exists "orders_parties_update" on orders;
create policy "orders_parties_update" on orders for update to authenticated
  using (clinic_id = auth.uid() or supplier_id = auth.uid());

drop policy if exists "order_items_parties_select" on order_items;
create policy "order_items_parties_select" on order_items for select to authenticated
  using (exists (
    select 1 from orders o
    where o.id = order_items.order_id
      and (o.clinic_id = auth.uid() or o.supplier_id = auth.uid())
  ));

drop policy if exists "order_items_clinic_insert" on order_items;
create policy "order_items_clinic_insert" on order_items for insert to authenticated
  with check (exists (
    select 1 from orders o where o.id = order_items.order_id and o.clinic_id = auth.uid()
  ));

drop policy if exists "invoices_parties_select" on invoices;
create policy "invoices_parties_select" on invoices for select to authenticated
  using (exists (
    select 1 from orders o
    where o.id = invoices.order_id
      and (o.clinic_id = auth.uid() or o.supplier_id = auth.uid())
  ));

drop policy if exists "invoices_clinic_insert" on invoices;
create policy "invoices_clinic_insert" on invoices for insert to authenticated
  with check (exists (
    select 1 from orders o where o.id = invoices.order_id and o.clinic_id = auth.uid()
  ));

drop policy if exists "invoices_supplier_update" on invoices;
create policy "invoices_supplier_update" on invoices for update to authenticated
  using (exists (
    select 1 from orders o where o.id = invoices.order_id and o.supplier_id = auth.uid()
  ));

drop policy if exists "compliance_owner_only" on compliance_documents;
create policy "compliance_owner_only" on compliance_documents for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
