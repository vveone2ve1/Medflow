import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/AuthContext'

export default function Payments() {
  const { profile } = useAuth()
  const isSupplier = profile?.role === 'supplier'
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile) load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile])

  async function load() {
    setLoading(true)
    const col = isSupplier ? 'supplier_id' : 'clinic_id'
    const { data, error } = await supabase
      .from('invoices')
      .select('*, orders!inner(id, total_amount, supplier_id, clinic_id, clinic:profiles!orders_clinic_id_fkey(organization_name), supplier:profiles!orders_supplier_id_fkey(organization_name))')
      .eq(`orders.${col}`, profile.id)
      .order('due_date', { ascending: true })
    if (!error) setInvoices(data || [])
    setLoading(false)
  }

  async function markPaid(inv) {
    const update = { status: 'paid', paid_at: new Date().toISOString() }
    // No return-window hold in effect for this order -> release the
    // supplier payout as soon as the clinic's payment is confirmed.
    // If it's already 'held_for_return_window', leave it — that gets
    // released once the window closes (see the release-payouts function
    // in supabase/functions for how that step should run on a schedule).
    if (inv.payout_status === 'pending') {
      update.payout_status = 'released'
      update.payout_released_at = new Date().toISOString()
    }
    await supabase.from('invoices').update(update).eq('id', inv.id)
    load()
  }

  function statusOf(inv) {
    if (inv.status === 'paid') return 'paid'
    if (inv.due_date && new Date(inv.due_date) < new Date()) return 'overdue'
    return 'pending'
  }

  const PAYOUT_LABEL = {
    pending: 'Awaiting clinic payment',
    held_for_return_window: 'Held — return window open',
    released: 'Released',
  }
  const PAYOUT_CLASS = {
    pending: 'badge-neutral',
    held_for_return_window: 'badge-warn',
    released: 'badge-success',
  }

  return (
    <div className="content">
      <div className="panel">
        <div className="panel-head">
          <h3>Invoices</h3>
          <span className="hint">{invoices.length} total</span>
        </div>

        {loading ? <div>Loading…</div> : invoices.length === 0 ? (
          <div className="empty-state">
            <div className="es-title">No invoices yet</div>
            <div>Invoices are created automatically when an order is placed.</div>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>{isSupplier ? 'Clinic' : 'Supplier'}</th>
                <th>{isSupplier ? 'Your payout' : 'Amount'}</th>
                <th>Due</th>
                <th>Invoice status</th>
                {isSupplier && <th>Payout status</th>}
                {isSupplier && <th></th>}
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => {
                const s = statusOf(inv)
                return (
                  <tr key={inv.id}>
                    <td className="mono">#{inv.order_id.slice(0, 8)}</td>
                    <td>{(isSupplier ? inv.orders?.clinic?.organization_name : inv.orders?.supplier?.organization_name) || '—'}</td>
                    <td className="mono">
                      ${Number(isSupplier ? (inv.supplier_payout_amount ?? inv.amount) : inv.amount).toFixed(2)}
                      {isSupplier && inv.platform_fee_amount > 0 && (
                        <div style={{ fontSize: 11, color: 'var(--ink-faint)' }}>
                          fee: ${Number(inv.platform_fee_amount).toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="mono">{inv.due_date ? new Date(inv.due_date).toLocaleDateString() : '—'}</td>
                    <td>
                      <span className={`badge ${s === 'paid' ? 'badge-success' : s === 'overdue' ? 'badge-danger' : 'badge-warn'}`}>
                        {s}
                      </span>
                    </td>
                    {isSupplier && (
                      <td>
                        <span className={`badge ${PAYOUT_CLASS[inv.payout_status] || 'badge-neutral'}`}>
                          {PAYOUT_LABEL[inv.payout_status] || inv.payout_status}
                        </span>
                      </td>
                    )}
                    {isSupplier && (
                      <td>
                        {s !== 'paid' && <button className="btn btn-ghost" onClick={() => markPaid(inv)}>Mark paid</button>}
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
