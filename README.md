# MEDFLOW

A medical procurement app: a public marketing site up front, and behind
login, clinics and suppliers each get an account with a shared catalog,
orders (with a "chain of custody" status tracker), inventory, invoices,
and compliance documents. Built with React + Vite + React Router on the
frontend and Supabase (Postgres + Auth) as the backend.

This is a working starting point, not a finished production app — read
"What's simplified" below before you show it to real users.

## What's new in this pass (redesign)

Same data and features as before — this pass changed the *design*, not
the schema or the app logic:

- **New brand system** applying the 2026-08-24 accessibility audit:
  navy (`#0F172A`) for text, `#007A9E` for all interactive teal
  (links/icons/buttons — passes WCAG AA at 4.91:1), and `#0EA5E9` kept
  strictly for decorative fills, never text. See the comment block at
  the top of `src/index.css`.
- **New logo** (`src/components/Logo.jsx`) — an SVG reproduction of the
  navy-to-green infinity mark, in `full` (nav/hero), `mark` (icon-only),
  and `light` (dark sidebar) variants.
- **A real public homepage** (`src/marketing/`) implementing the
  Homepage Design & Architectural Overview brief: hero with compliance
  badges and a static dashboard preview, ranked action cards (Order
  Products as primary, Become a Member as secondary, three tertiary
  cards), and the SELECT → VERIFY → PROCESS → TRACK → DELIVER workflow
  diagram — plus `/products`, `/how-it-works`, `/payment`, `/trust`,
  and `/track` informational pages, all behind one shared nav/footer.
- **Accessibility fixes baked in**: every action card is one linked
  region with a ≥44px target, workflow nodes have icons + `aria-label`
  + 44px hit areas, the language toggle has `aria-label`/`aria-pressed`
  and a visible active state, and teal links get an underline (color is
  never the only differentiator).
- **A working EN/TH toggle** for the marketing site (`src/marketing/LanguageContext.jsx`)
  — covers nav/hero/section copy for now; the authenticated dashboard is
  still English-only.
- **Real routing** via `react-router-dom`: `/` and friends are public;
  `/login` handles sign in/up (and reads `?mode=signup&role=clinic` from
  the homepage CTAs to preselect); `/clinic/*` is the existing
  authenticated shell, unchanged internally, gated by session.

I approximated the logo as scalable SVG shapes rather than tracing your
JPG exactly — if you have the original vector file (AI/SVG/EPS), share
it and it's a straight swap into `Logo.jsx`.

## 1. Create your Supabase project

1. Go to https://supabase.com, sign in, and click **New project**.
2. Once it's provisioned, open **Project Settings → API**. You'll need:
   - **Project URL**
   - **anon public** key

## 2. Set up the database

1. In the Supabase dashboard, open **SQL Editor → New query**.
2. Paste in the entire contents of `supabase/schema.sql` from this project and click **Run**.
   This creates all the tables (profiles, products, inventory, orders, order_items,
   invoices, compliance_documents) and the row-level security policies that keep
   each organization's data private.
3. Run `supabase/migration_002_settlement.sql` next (same SQL Editor). This adds:
   - **Tiered auto-accept windows** — orders auto-inherit a 24h accept-by deadline
     if any item is flagged `requires_cold_chain`, 72h otherwise (see `accept_by`
     on `orders`).
   - **Return-window payout holds** — orders at/above THB 50,000 get a
     `return_window_closes_at` (14 days after delivery) set automatically, and the
     linked invoice's `payout_status` flips to `held_for_return_window` until then.
   - **Fee/settlement breakdown on invoices** — `platform_fee_amount`,
     `supplier_payout_amount`, `fee_model`, `tax_invoice_issuer`, `payout_status`.
   - A `payout_events` audit table.
   The actual commission rate, fee model (embedded vs. passthrough), high-value
   threshold, and tax-invoice-issuer default live in `src/lib/settlement.js` —
   that's the one file to edit as those business terms get finalized.
4. Open **Authentication → Providers** and make sure **Email** is enabled.
   For local testing, go to **Authentication → Settings** and turn off
   "Confirm email" so you can sign up and log in immediately without
   clicking an email link (turn it back on before going live).

## 3. Configure the app

```bash
cd medflow
cp .env.example .env
```

Edit `.env` and fill in the two values from step 1:

```
VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

## 4. Run it

```bash
npm install
npm run dev
```

Open the URL it prints (usually http://localhost:5173).

- Click **Create account**, pick **Clinic** or **Supplier**, and sign up.
- As a **supplier**, add products in "My Products".
- Sign out, create a second account as a **clinic**, and you'll see that
  supplier's products in the Catalog — click **Order** to place one.
- Sign back in as the supplier to see the order land in "Incoming Orders"
  and advance it through the chain-of-custody stages.
- Invoices are created automatically when an order is placed; the supplier
  can mark them paid from the Invoices page.
- Compliance docs (licenses, certificates, MSDS, etc.) are tracked per
  organization and flagged when they're expiring or expired.

## 5. Deploy

Any static host works since this is a Vite app that talks directly to
Supabase from the browser:

- **Vercel / Netlify**: connect the repo, build command `npm run build`,
  output directory `dist`, and add the two `VITE_SUPABASE_*` env vars in
  the host's dashboard.
- Don't forget to re-enable "Confirm email" (and review the other
  Supabase auth settings) before real users sign up.

## What's simplified (on purpose, so you can extend it)

- **No file uploads yet.** Compliance documents store metadata only. To
  store the actual PDF/image, create a Supabase Storage bucket and wire
  an upload into `src/pages/Compliance.jsx`.
- **No real PSP integration yet.** Invoices are tracked as pending/paid
  records and "Mark paid" is a manual button standing in for a payment
  confirmation webhook. To go live, integrate a licensed Thai PSP's
  **marketplace/split-payment** product (not a plain merchant account —
  ask specifically for that, e.g. 2C2P or Opn Payments) so clinic funds
  settle in the PSP's licensed pass-through account and split
  automatically to platform commission + supplier payout, rather than
  landing in your own bank account first.
- **Payout release on return-window holds is a stub.** The DB tracks
  `payout_status` (`pending` → `held_for_return_window` → `released`)
  and `supabase/functions/release-payouts` is a scheduled Edge Function
  skeleton that finds invoices whose hold has expired — it updates the
  DB but the actual PSP payout call is a `// TODO` inside it. Deploy it
  with `supabase functions deploy release-payouts` and schedule it
  (Supabase Cron or an external scheduler) once your PSP is wired in.
- **One product per order.** Placing an order currently creates a
  single-item order from the Catalog page. Multi-item carts would mean
  building a cart step before checkout.
- **Tax invoice issuance isn't automated.** `invoices.tax_invoice_issuer`
  records who *should* issue it (platform vs. supplier, per
  `src/lib/settlement.js`) but actually generating/sending the Thai tax
  invoice PDF isn't built — get the marketplace-vs-merchant-of-record
  structuring signed off by a Thai tax advisor before building that part.
- **No admin role UI yet**, though the `profiles.role` column already
  supports `admin` if you want to build one.

## Project structure

```
src/
  lib/
    supabaseClient.js   Supabase client setup (reads .env)
    AuthContext.jsx     Auth state, sign up/in/out, loads the user's profile
    settlement.js        Fee model, commission rate, tax-invoice-issuer, thresholds
  components/
    Logo.jsx            SVG brand mark (full / mark / light variants)
    Sidebar.jsx, TopBar.jsx, StatusStepper.jsx
  marketing/
    MarketingLayout.jsx  Shared public nav + footer
    LanguageContext.jsx, LanguageToggle.jsx   EN/TH toggle for the public site
    Home.jsx             Public homepage (hero, action cards, workflow)
    Products.jsx, HowItWorks.jsx, Payment.jsx, Trust.jsx, Track.jsx
  pages/
    AuthScreen.jsx       Login / signup with role picker (behind /login)
    Dashboard.jsx, Catalog.jsx, Inventory.jsx,
    Orders.jsx, Payments.jsx, Compliance.jsx   (behind /clinic/*)
  App.jsx                Route table: public site, /login, /clinic/* shell
supabase/
  schema.sql                    Run first in the Supabase SQL editor
  migration_002_settlement.sql  Run second — auto-accept, return-window holds, fee tracking
  functions/release-payouts/    Scheduled function to release held payouts (PSP call is a TODO)
```
