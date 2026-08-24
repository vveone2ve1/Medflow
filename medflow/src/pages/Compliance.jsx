import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/AuthContext'

const DOC_TYPES = ['License', 'Certificate of Analysis', 'MSDS', 'FDA Registration', 'Insurance', 'Other']

export default function Compliance() {
  const { profile } = useAuth()
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', doc_type: DOC_TYPES[0], expiry_date: '' })
  const [err, setErr] = useState('')

  useEffect(() => {
    if (profile) load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile])

  async function load() {
    setLoading(true)
    const { data, error } = await supabase
      .from('compliance_documents')
      .select('*')
      .eq('owner_id', profile.id)
      .order('expiry_date', { ascending: true })
    if (!error) setDocs(data || [])
    setLoading(false)
  }

  async function addDoc(e) {
    e.preventDefault()
    setErr('')
    const { error } = await supabase.from('compliance_documents').insert({
      owner_id: profile.id,
      title: form.title,
      doc_type: form.doc_type,
      expiry_date: form.expiry_date || null,
    })
    if (error) { setErr(error.message); return }
    setShowForm(false)
    setForm({ title: '', doc_type: DOC_TYPES[0], expiry_date: '' })
    load()
  }

  function statusOf(doc) {
    if (!doc.expiry_date) return { label: 'On file', cls: 'badge-neutral' }
    const expiry = new Date(doc.expiry_date)
    const now = new Date()
    const soon = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    if (expiry < now) return { label: 'Expired', cls: 'badge-danger' }
    if (expiry < soon) return { label: 'Expiring soon', cls: 'badge-warn' }
    return { label: 'Valid', cls: 'badge-success' }
  }

  return (
    <div className="content">
      <div className="panel">
        <div className="panel-head">
          <h3>Regulatory & Compliance Documents</h3>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Add document</button>
        </div>

        {loading ? <div>Loading…</div> : docs.length === 0 ? (
          <div className="empty-state">
            <div className="es-title">No documents on file</div>
            <div>Track licenses, certificates, and other regulatory paperwork here.</div>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Document</th>
                <th>Type</th>
                <th>Expires</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((d) => {
                const s = statusOf(d)
                return (
                  <tr key={d.id}>
                    <td>{d.title}</td>
                    <td>{d.doc_type}</td>
                    <td className="mono">{d.expiry_date ? new Date(d.expiry_date).toLocaleDateString() : '—'}</td>
                    <td><span className={`badge ${s.cls}`}>{s.label}</span></td>
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
            <h3>Add compliance document</h3>
            <form onSubmit={addDoc}>
              <div className="field">
                <label>Document title</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. State Pharmacy License" />
              </div>
              <div className="field">
                <label>Type</label>
                <select value={form.doc_type} onChange={(e) => setForm({ ...form, doc_type: e.target.value })}>
                  {DOC_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Expiry date (optional)</label>
                <input type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} />
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-faint)', marginBottom: 14 }}>
                File upload isn't wired up in this starter — add a Supabase Storage bucket to store the actual PDF/image if you need one.
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
