-- ============================================================
-- MEDFLOW migration 002: split settlement, tiered auto-accept,
-- and fee/tax-invoice tracking.
-- Run in the Supabase SQL editor AFTER schema.sql.
-- Safe to re-run.
-- ============================================================

-- ---------- products: which SKUs get the short accept window ----------
-- requires_cold_chain already exists and doubles as "short shelf-life" for v1.
-- auto_accept_hours lets a supplier override per-product if needed later;
-- NULL means "use the category default" (72h normal / 24h cold-chain).
alter table products
  add column if not exists auto_accept_hours integer;

-- ---------- orders: acceptance deadline + return window ----------
alter table orders
  add column if not exists accept_by timestamptz,
  add column if not exists return_window_closes_at timestamptz,
  add column if not exists auto_accepted boolean not null default false;

-- Compute the acceptance deadline at insert time based on whether any
-- item in the order requires cold chain / short shelf life.
create or replace function set_order_accept_by()
returns trigger as $$
declare
  short_shelf boolean;
  hours_window integer;
begin
  select bool_or(coalesce(p.requires_cold_chain, false)) into short_shelf
  from order_items oi
  join products p on p.id = oi.product_id
  where oi.order_id = new.id;

  hours_window := case when short_shelf then 24 else 72 end;
  new.accept_by := coalesce(new.created_at, now()) + (hours_window || ' hours')::interval;
  return new;
end;
$$ language plpgsql;

-- Note: order_items are inserted *after* the order row in the current app
-- flow, so accept_by is set/refreshed by an AFTER trigger on order_items
-- instead of on orders directly.
create or replace function refresh_order_accept_by()
returns trigger as $$
declare
  short_shelf boolean;
  hours_window integer;
  order_created timestamptz;
begin
  select bool_or(coalesce(p.requires_cold_chain, false)), o.created_at
    into short_shelf, order_created
  from order_items oi
  join products p on p.id = oi.product_id
  join orders o on o.id = oi.order_id
  where oi.order_id = new.order_id
  group by o.created_at;

  hours_window := case when short_shelf then 24 else 72 end;

  update orders
  set accept_by = order_created + (hours_window || ' hours')::interval
  where id = new.order_id;

  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_refresh_order_accept_by on order_items;
create trigger trg_refresh_order_accept_by
  after insert on order_items
  for each row execute function refresh_order_accept_by();

-- Set return_window_closes_at (14 days after delivery, only for
-- high-value orders) whenever an order is marked delivered.
create or replace function set_return_window()
returns trigger as $$
begin
  if new.status = 'delivered' and old.status is distinct from 'delivered' then
    if new.total_amount >= 50000 then -- THB threshold for "high-value"; adjust as needed
      new.return_window_closes_at := now() + interval '14 days';
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_set_return_window on orders;
create trigger trg_set_return_window
  before update on orders
  for each row execute function set_return_window();

-- ---------- invoices: itemized fee + separate payout tracking ----------
-- amount stays as the total the clinic is invoiced. These new columns
-- break that down and track the supplier side of settlement separately
-- from whether the clinic has paid.
alter table invoices
  add column if not exists platform_fee_amount numeric(12, 2) not null default 0,
  add column if not exists supplier_payout_amount numeric(12, 2),
  add column if not exists fee_model text not null default 'embedded'
    check (fee_model in ('embedded', 'passthrough')),
  add column if not exists tax_invoice_issuer text
    check (tax_invoice_issuer in ('platform', 'supplier')),
  add column if not exists payout_status text not null default 'pending'
    check (payout_status in ('pending', 'held_for_return_window', 'released')),
  add column if not exists payout_released_at timestamptz;

-- Backfill supplier_payout_amount for existing rows (amount minus fee).
update invoices
set supplier_payout_amount = amount - platform_fee_amount
where supplier_payout_amount is null;

-- Whenever the parent order's return_window_closes_at is set/cleared,
-- put the invoice's payout on hold or release it accordingly. Payout
-- still requires the invoice itself to be 'paid' by the clinic first —
-- this trigger only manages the *hold-for-returns* half of the gate.
create or replace function sync_invoice_payout_hold()
returns trigger as $$
begin
  if new.return_window_closes_at is not null and new.status = 'delivered' then
    update invoices
    set payout_status = 'held_for_return_window'
    where order_id = new.id and payout_status = 'pending';
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_sync_invoice_payout_hold on orders;
create trigger trg_sync_invoice_payout_hold
  after update on orders
  for each row execute function sync_invoice_payout_hold();

-- ---------- payout_events: audit trail for settlement actions ----------
-- Separate from invoices so you have a durable log of every hold/release/
-- adjustment, independent of the current-state columns above.
create table if not exists payout_events (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices (id) on delete cascade,
  event_type text not null check (event_type in ('held', 'released', 'adjusted')),
  amount numeric(12, 2),
  note text,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now()
);

alter table payout_events enable row level security;

drop policy if exists "payout_events_parties_select" on payout_events;
create policy "payout_events_parties_select" on payout_events for select to authenticated
  using (exists (
    select 1 from invoices i
    join orders o on o.id = i.order_id
    where i.id = payout_events.invoice_id
      and (o.clinic_id = auth.uid() or o.supplier_id = auth.uid())
  ));

drop policy if exists "payout_events_supplier_insert" on payout_events;
create policy "payout_events_supplier_insert" on payout_events for insert to authenticated
  with check (exists (
    select 1 from invoices i
    join orders o on o.id = i.order_id
    where i.id = payout_events.invoice_id and o.supplier_id = auth.uid()
  ));
