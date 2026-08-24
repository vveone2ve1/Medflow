import { Link } from 'react-router-dom'

const CATEGORIES = [
  { name: 'PPE', desc: 'Gloves, masks, gowns, and protective equipment' },
  { name: 'Diagnostics', desc: 'Test kits, reagents, and diagnostic instruments' },
  { name: 'Pharmaceuticals', desc: 'Licensed suppliers, verified batch documentation' },
  { name: 'Instruments', desc: 'Surgical and clinical instruments' },
  { name: 'Consumables', desc: 'Everyday clinical and administrative supplies' },
  { name: 'Cold Chain', desc: 'Temperature-controlled items with shortened accept windows' },
]

export default function Products() {
  return (
    <div className="mkt-main">
      <div className="content-page">
        <div className="kicker">Discovery</div>
        <h1>Products</h1>
        <p>
          MEDFLOW's principle is inform first, recommend second, sell last. Before you commit to
          an order, you can browse verified suppliers by category, compare pricing and lead times,
          and check each product's regulatory documentation — all before a procurement request is
          ever sent.
        </p>
        <div className="domain-list">
          {CATEGORIES.map((c) => (
            <div key={c.name} className="domain-item">
              <strong>{c.name}</strong>
              <span>{c.desc}</span>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 28 }}>
          The full catalog, with live pricing and supplier profiles, is available once you sign in.
        </p>
        <Link to="/login?mode=signup&role=clinic" className="btn btn-primary">Create a clinic account</Link>
      </div>
    </div>
  )
}
