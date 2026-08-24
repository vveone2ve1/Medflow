import { Fragment, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/AuthContext'
import StatusStepper from '../components/StatusStepper'

const NEXT_STATUS = {
  submitted: 'confirmed',
  confirmed: 'dispatched',
  dispatched: 'in_transit',
  in_transit: 'delivered',
}

const STATUS_LABEL = {
  submitted: 'Submitted',
  confirmed: 'Confirmed',
  dispatched: 'Dispatched',
  in_transit: 'In Transit',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

function formatAcceptBy(acceptBy) {
  if (!acceptBy) return null
  const diffMs = new Date(acceptBy).getTime() - Date.now()
  const hours = Math.round(diffMs / (1000 * 60 * 60))
  if (hours <= 0) return { text: 'Overdue', overdue: true }
  if (hours < 48) return { text: `${hours}h left`, overdue: false }
  return { text: `${Math.round(hours / 24)}d left`, overdue: false }
}

export default function Orders() {
  const { profile } = useAuth()
  const isSupplier = profile?.role === 'supplier'
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    if (profile) load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile])

  async function load() {
    setLoading(true)
    const col = isSupplier ? 'supplier_id' : 'clinic_id'
    const otherSelect = isSupplier ? 'profiles!orders_clinic_id_fkey(organization_name)' : 'profiles!orders_supplier_id_fkey(organization_name)'
    const { data, error } = await supabase
      .from('orders')
      .select(`*, ${otherSelect}, order_items(*, products(name, sku, unit))`)
      .eq(col, profile.id)
      .order('created_at', { ascending: false })
    if (!error) setOrders(data || [])
    setLoading(false)
  }

  async function advance(order) {
    const next = NEXT_STATUS[order.status]
    if (!next) return
    const timestamps = { ...(order.timestamps || {}), [next]: new Date().toISOString() }
    await supabase.from('orders').update({ status: next, timestamps }).eq('id', order.id)
    load()
  }

  async function cancel(order) {
    await supabase.from('orders').update({ status: 'cancelled' }).eq('id', order.id)
    load()
  }

  return (
    <div className="content">
      <div className="panel">
        <div className="panel-head">
          <h3>{isSupplier ? 'Incoming Orders' : 'Your Orders'}</h3>
          <span className="hint">{orders.length} total</span>
        </div>

        {loading ? <div>Loading…</div> : orders.length === 0 ? (
          <div className="empty-state">
            <div className="es-title">No orders yet</div>
            <div>{isSupplier ? 'Orders from clinics will show up here.' : 'Place an order from the Catalog page.'}</div>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>{isSupplier ? 'Clinic' : 'Supplier'}</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Accept by</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <Fragment key={o.id}>
                  <tr style={{ cursor: 'pointer' }} onClick={() => setExpanded(expanded === o.id ? null : o.id)}>
                    <td className="mono">#{o.id.slice(0, 8)}</td>
                    <td>{o.profiles?.organization_name || '—'}</td>
                    <td>{o.order_items?.length || 0}</td>
                    <td className="mono">${Number(o.total_amount).toFixed(2)}</td>
                    <td>
                      <span className={`badge ${o.status === 'delivered' ? 'badge-success' : o.status === 'cancelled' ? 'badge-danger' : 'badge-warn'}`}>
                        {STATUS_LABEL[o.status]}
                      </span>
                    </td>
                    <td>
                      {o.status === 'submitted' && o.accept_by ? (
                        (() => {
                          const a = formatAcceptBy(o.accept_by)
                          return <span className={`badge ${a.overdue ? 'badge-danger' : 'badge-neutral'}`}>{a.text}</span>
                        })()
                      ) : (
                        <span style={{ color: 'var(--ink-faint)' }}>—</span>
                      )}
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      {isSupplier && NEXT_STATUS[o.status] && (
                        <button className="btn btn-ghost" onClick={() => advance(o)}>
                          Mark {STATUS_LABEL[NEXT_STATUS[o.status]]}
                        </button>
                      )}
                      {isSupplier && o.status === 'submitted' && (
                        <button className="btn btn-danger" style={{ marginLeft: 6 }} onClick={() => cancel(o)}>Cancel</button>
                      )}
                    </td>
                  </tr>
                  {expanded === o.id && (
                    <tr>
                      <td colSpan={7} style={{ background: 'var(--panel-sunken)' }}>
                        <div style={{ padding: '12px 6px' }}>
                          <StatusStepper status={o.status} timestamps={o.timestamps || {}} />
                          {o.return_window_closes_at && (
                            <div style={{ marginTop: 10, fontSize: 12.5 }}>
                              <span className="badge badge-warn">Return window</span>{' '}
                              <span style={{ color: 'var(--ink-muted)' }}>
                                open until {new Date(o.return_window_closes_at).toLocaleDateString()} — supplier payout held until then
                              </span>
                            </div>
                          )}
                          <div style={{ marginTop: 14 }}>
                            {(o.order_items || []).map((it) => (
                              <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0' }}>
                                <span>{it.products?.name} <span className="cell-mono">({it.products?.sku})</span></span>
                                <span className="mono">{it.quantity} {it.products?.unit} × ${Number(it.unit_price).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
