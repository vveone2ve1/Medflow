import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/AuthContext'
import { computeSettlement, TAX_INVOICE_ISSUER, FEE_MODEL } from '../lib/settlement'

const CATEGORIES = ['PPE', 'Diagnostics', 'Pharmaceuticals', 'Instruments', 'Consumables', 'Cold Chain']

export default function Catalog() {
  const { profile } = useAuth()
  const isSupplier = profile?.role === 'supplier'
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [orderTarget, setOrderTarget] = useState(null)
  const [form, setForm] = useState({ name: '', sku: '', category: CATEGORIES[0], unit: 'box', unit_price: '', description: '', requires_cold_chain: false })
  const [qty, setQty] = useState(1)
  const [err, setErr] = useState('')

  useEffect(() => {
    if (profile) load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile])

  async function load() {
    setLoading(true)
    let query = supabase.from('products').select('*, profiles!products_supplier_id_fkey(organization_name)').order('created_at', { ascending: false })
    if (isSupplier) query = query.eq('supplier_id', profile.id)
    const { data, error } = await query
    if (!error) setProducts(data || [])
    setLoading(false)
  }

  async function addProduct(e) {
    e.preventDefault()
    setErr('')
    const { error } = await supabase.from('products').insert({
      supplier_id: profile.id,
      name: form.name,
      sku: form.sku,
      category: form.category,
      unit: form.unit,
      unit_price: parseFloat(form.unit_price),
      description: form.description,
      requires_cold_chain: form.requires_cold_chain,
    })
    if (error) {
      setErr(error.message)
      return
    }
    setShowForm(false)
    setForm({ name: '', sku: '', category: CATEGORIES[0], unit: 'box', unit_price: '', description: '', requires_cold_chain: false })
    load()
  }

  async function placeOrder(e) {
    e.preventDefault()
    setErr('')
    const product = orderTarget
    const goodsAmount = product.unit_price * qty
    const { clinicTotal, platformFee, supplierPayout } = computeSettlement(goodsAmount)

    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        clinic_id: profile.id,
        supplier_id: product.supplier_id,
        status: 'submitted',
        total_amount: clinicTotal,
      })
      .select()
      .single()
    if (orderErr) {
      setErr(orderErr.message)
      return
    }
    // Inserting order_items triggers the DB function that sets accept_by
    // to +24h for cold-chain/short-shelf items or +72h otherwise
    // (see supabase/migration_002_settlement.sql).
    const { error: itemErr } = await supabase.from('order_items').insert({
      order_id: order.id,
      product_id: product.id,
      quantity: qty,
      unit_price: product.unit_price,
    })
    if (itemErr) {
      setErr(itemErr.message)
      return
    }

    await supabase.from('invoices').insert({
      order_id: order.id,
      amount: clinicTotal,
      status: 'pending',
      due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      platform_fee_amount: platformFee,
      supplier_payout_amount: supplierPayout,
      fee_model: FEE_MODEL,
      tax_invoice_issuer: TAX_INVOICE_ISSUER,
    })
    setOrderTarget(null)
    setQty(1)
  }

  return (
    <div className="content">
      <div className="panel">
        <div className="panel-head">
          <h3>{isSupplier ? 'Your Product Listings' : 'Supplier Catalog'}</h3>
          {isSupplier && (
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ New product</button>
          )}
        </div>

        {loading ? (
          <div>Loading…</div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="es-title">{isSupplier ? 'No products listed yet' : 'No products available yet'}</div>
            <div>{isSupplier ? 'Add your first product to appear in clinic catalogs.' : 'Check back once suppliers list products.'}</div>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product</th>
                <th>Category</th>
                {!isSupplier && <th>Supplier</th>}
                <th>Unit price</th>
                <th>Cold chain</th>
                {!isSupplier && <th></th>}
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="mono">{p.sku}</td>
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  {!isSupplier && <td>{p.profiles?.organization_name || '—'}</td>}
                  <td className="mono">${Number(p.unit_price).toFixed(2)} / {p.unit}</td>
                  <td>{p.requires_cold_chain ? <span className="badge badge-warn">Cold chain</span> : <span className="badge badge-neutral">Standard</span>}</td>
                  {!isSupplier && (
                    <td>
                      <button className="btn btn-ghost" onClick={() => setOrderTarget(p)}>Order</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>New product</h3>
            <form onSubmit={addProduct}>
              <div className="field">
                <label>Product name</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="field">
                  <label>SKU</label>
                  <input required value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="mono" />
                </div>
                <div className="field">
                  <label>Unit</label>
                  <input required value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="box, case, vial…" />
                </div>
              </div>
              <div className="form-row">
                <div className="field">
                  <label>Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Unit price (USD)</label>
                  <input required type="number" step="0.01" min="0" value={form.unit_price} onChange={(e) => setForm({ ...form, unit_price: e.target.value })} />
                </div>
              </div>
              <div className="field">
                <label>Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="field" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" style={{ width: 'auto' }} checked={form.requires_cold_chain} onChange={(e) => setForm({ ...form, requires_cold_chain: e.target.checked })} id="cc" />
                <label htmlFor="cc" style={{ margin: 0 }}>Requires cold chain</label>
              </div>
              {err && <div className="error-text">{err}</div>}
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button type="submit" className="btn btn-primary">Save product</button>
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {orderTarget && (
        <div className="modal-backdrop" onClick={() => setOrderTarget(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Order {orderTarget.name}</h3>
            <form onSubmit={placeOrder}>
              <div className="field">
                <label>Quantity ({orderTarget.unit})</label>
                <input type="number" min="1" value={qty} onChange={(e) => setQty(parseInt(e.target.value) || 1)} />
              </div>
              <div style={{ fontSize: 13.5, color: 'var(--ink-muted)', marginBottom: 14 }}>
                {(() => {
                  const { clinicTotal, platformFee } = computeSettlement(orderTarget.unit_price * qty)
                  return (
                    <>
                      {FEE_MODEL === 'passthrough' && (
                        <div>Payment processing fee: <span className="mono">${platformFee.toFixed(2)}</span></div>
                      )}
                      <div>Total: <span className="mono">${clinicTotal.toFixed(2)}</span></div>
                    </>
                  )
                })()}
              </div>
              {err && <div className="error-text">{err}</div>}
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" className="btn btn-primary">Submit order</button>
                <button type="button" className="btn btn-ghost" onClick={() => setOrderTarget(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
