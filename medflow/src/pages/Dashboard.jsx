import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/AuthContext'
import StatusStepper from '../components/StatusStepper'

export default function Dashboard() {
  const { profile } = useAuth()
  const isSupplier = profile?.role === 'supplier'
  const [stats, setStats] = useState({ products: 0, openOrders: 0, dueInvoices: 0, expiringDocs: 0 })
  const [recentOrder, setRecentOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile) loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile])

  async function loadData() {
    setLoading(true)
    const ordersCol = isSupplier ? 'supplier_id' : 'clinic_id'

    const [{ count: productCount }, { data: orders }, { data: invoices }, { data: docs }] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase
        .from('orders')
        .select('*')
        .eq(ordersCol, profile.id)
        .order('created_at', { ascending: false }),
      supabase.from('invoices').select('*, orders!inner(*)').eq(`orders.${ordersCol}`, profile.id),
      supabase.from('compliance_documents').select('*').eq('owner_id', profile.id),
    ])

    const openOrders = (orders || []).filter((o) => !['delivered', 'cancelled'].includes(o.status)).length
    const dueInvoices = (invoices || []).filter((i) => i.status !== 'paid').length
    const now = new Date()
    const soon = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    const expiringDocs = (docs || []).filter((d) => d.expiry_date && new Date(d.expiry_date) <= soon).length

    setStats({
      products: productCount || 0,
      openOrders,
      dueInvoices,
      expiringDocs,
    })
    setRecentOrder((orders || [])[0] || null)
    setLoading(false)
  }

  if (loading) return <div className="content">Loading dashboard…</div>

  return (
    <div className="content">
      <div className="stat-grid">
        <div className="stat-card">
          <div className="label">{isSupplier ? 'Listed Products' : 'Catalog Items'}</div>
          <div className="value">{stats.products}</div>
        </div>
        <div className="stat-card">
          <div className="label">Open Orders</div>
          <div className="value">{stats.openOrders}</div>
        </div>
        <div className="stat-card">
          <div className="label">Unpaid Invoices</div>
          <div className="value">{stats.dueInvoices}</div>
        </div>
        <div className="stat-card">
          <div className="label">Docs Expiring &lt;30d</div>
          <div className="value" style={{ color: stats.expiringDocs > 0 ? 'var(--danger)' : 'var(--ink)' }}>
            {stats.expiringDocs}
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h3>Most Recent Order — Chain of Custody</h3>
          {recentOrder && <span className="cell-mono">#{recentOrder.id.slice(0, 8)}</span>}
        </div>
        {recentOrder ? (
          <StatusStepper status={recentOrder.status} timestamps={recentOrder.timestamps || {}} />
        ) : (
          <div className="empty-state">
            <div className="es-title">No orders yet</div>
            <div>{isSupplier ? 'Orders placed by clinics will appear here.' : 'Place an order from the Catalog to see its route here.'}</div>
          </div>
        )}
      </div>
    </div>
  )
}
