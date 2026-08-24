// Supabase Edge Function: release-payouts
//
// Run this on a schedule (e.g. hourly, via Supabase's built-in Cron —
// Project Settings > Edge Functions > Cron, or an external scheduler
// hitting this URL) to release supplier payouts once:
//   1. the clinic's invoice is paid, and
//   2. either there was no return-window hold, or the hold has expired.
//
// This function only flips DB state and logs an audit event — the
// actual money movement (calling your PSP's payout/transfer API, e.g.
// 2C2P or Opn Payments marketplace disbursement) goes where the
// `// TODO: call PSP payout API` comment is below. Wire that up once
// you've picked a partner (see the payments brief in project notes).

import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, // service role: bypasses RLS, keep this secret server-side only
  )

  const { data: dueInvoices, error } = await supabase
    .from('invoices')
    .select('*, orders!inner(id, supplier_id, return_window_closes_at, status)')
    .eq('status', 'paid')
    .eq('payout_status', 'held_for_return_window')
    .lt('orders.return_window_closes_at', new Date().toISOString())

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  const results = []
  for (const inv of dueInvoices ?? []) {
    // TODO: call PSP payout API here, e.g.
    //   await releaseFundsViaPSP({ supplierId: inv.orders.supplier_id, amount: inv.supplier_payout_amount })
    // Only update payout_status after that call succeeds.

    const { error: updateErr } = await supabase
      .from('invoices')
      .update({ payout_status: 'released', payout_released_at: new Date().toISOString() })
      .eq('id', inv.id)

    if (!updateErr) {
      await supabase.from('payout_events').insert({
        invoice_id: inv.id,
        event_type: 'released',
        amount: inv.supplier_payout_amount,
        note: 'Auto-released: return window closed',
      })
    }

    results.push({ invoice_id: inv.id, ok: !updateErr, error: updateErr?.message })
  }

  return new Response(JSON.stringify({ processed: results.length, results }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
