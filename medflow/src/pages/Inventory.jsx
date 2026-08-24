import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/AuthContext'

export default function Inventory() {
  const { profile } = useAuth()
  const [rows, setRows] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ product_id: '', quantity_on_hand: '', reorder_threshold: '', location: '' })
  const [err, setErr] = useState('')

  useEffect(() => {
    if (profile) load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile])

  async function load() {
    setLoading(true)
    const [{ data: inv }, { data: prods }] = await Promise.all([
      supabase.from('inventory').select('*, products(name, sku, unit)').eq('owner_id', profile.id).order('updated_at', { ascending: false }),
      supabase.from('products').select('id, name, sku, unit'),
    ])
    setRows(inv || [])
    setProducts(prods || [])
    setLoading(false)
  }

  async function addRow(e) {
    e.preventDefault()
    setErr('')
    const { error } = await supabase.from('inventory').insert({
      owner_id: profile.id,
      product_id: form.product_id,
      quantity_on_hand: parseInt(form.quantity_on_hand) || 0,
      reorder_threshold: parseInt(form.reorder_threshold) || 0,
      location: form.location,
    })
    if (error) { setErr(error.message); return }
    setShowForm(false)
    setForm({ product_id: '', quantity_on_hand: '', reorder_threshold: '', location: '' })
    load()
  }

  async function adjust(row, delta) {
    const next = Math.max(0, row.quantity_on_hand + delta)
    await supabase.from('inventory').update({ quantity_on_hand: next, updated_at: new Date().toISOString() }).eq('id', row.id)
    load()
  }

  return (
    <div className="content">
      <div className="panel">
        <div className="panel-head">
          <h3>Inventory on Hand</h3>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Track item</button>
        </div>

        {loading ? <div>Loading…</div> : rows.length === 0 ? (
          <div className="empty-state">
            <div className="es-title">Nothing tracked yet</div>
            <div>Add a product to start tracking stock levels and reorder points.</div>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product</th>
                <th>Location</th>
                <th>On hand</th>
                <th>Reorder at</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const low = r.quantity_on_hand <= r.reorder_threshold
                return (
                  <tr key={r.id}>
                    <td className="mono">{r.products?.sku}</td>
                    <td>{r.products?.name}</td>
                    <td>{r.location || '—'}</td>
                    <td className="mono">{r.quantity_on_hand} {r.products?.unit}</td>
                    <td className="mono">{r.reorder_threshold}</td>
                    <td>{low ? <span className="badge badge-danger">Reorder now</span> : <span className="badge badge-success">In stock</span>}</td>
                    <td style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost" onClick={() => adjust(r, -1)}>−</button>
                      <button className="btn btn-ghost" onClick={() => adjust(r, 1)}>+</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Track inventory item</h3>
            <form onSubmit={addRow}>
              <div className="field">
                <label>Product</label>
                <select required value={form.product_id} onChange={(e) => setForm({ ...form, product_id: e.target.value })}>
                  <option value="">Select a product…</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="field">
                  <label>Quantity on hand</label>
                  <input required type="number" min="0" value={form.quantity_on_hand} onChange={(e) => setForm({ ...form, quantity_on_hand: e.target.value })} />
                </div>
                <div className="field">
                  <label>Reorder threshold</label>
                  <input required type="number" min="0" value={form.reorder_threshold} onChange={(e) => setForm({ ...form, reorder_threshold: e.target.value })} />
                </div>
              </div>
              <div className="field">
                <label>Storage location</label>
                <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Supply room B, Fridge 2" />
              </div>
              {err && <div className="error-text">{err}</div>}
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" className="btn btn-primary">Save</button>
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
