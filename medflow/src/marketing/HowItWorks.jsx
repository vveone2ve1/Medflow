const STEPS = [
  ['Discover', 'Browse suppliers and products across every category.'],
  ['Learn', 'Read product documentation, certifications, and specs.'],
  ['Explore', 'Compare options across suppliers side by side.'],
  ['Compare', 'Weigh price, lead time, and compliance history.'],
  ['Request', 'Submit a procurement request for the items you need.'],
  ['Verify', 'Regulatory and compliance checks run on the order.'],
  ['Agree', 'Terms are confirmed between clinic and supplier.'],
  ['Pay', 'Payment is settled through a licensed payment partner.'],
  ['Track', 'Follow the shipment through every stage of transit.'],
  ['Receive', 'Confirm delivery at your clinic.'],
  ['Learn Again', 'Documentation and order history feed future decisions.'],
]

export default function HowItWorks() {
  return (
    <div className="mkt-main">
      <div className="content-page">
        <div className="kicker">Procurement, end to end</div>
        <h1>How MedFlow Works</h1>
        <p>
          Every order moves through the same eleven-step path, whether you're restocking
          consumables or sourcing a new instrument line. Nothing skips the verification or
          agreement steps — even for repeat suppliers.
        </p>
        <ol style={{ padding: 0, listStyle: 'none', marginTop: 24 }}>
          {STEPS.map(([title, desc], i) => (
            <li key={title} style={{ display: 'flex', gap: 16, marginBottom: 18 }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%', background: 'var(--primary-tint)',
                color: 'var(--teal-600)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, flexShrink: 0,
              }}>
                {i + 1}
              </div>
              <div>
                <strong style={{ display: 'block', color: 'var(--navy)', fontSize: 14.5 }}>{title}</strong>
                <span style={{ fontSize: 13.5, color: 'var(--ink-muted)' }}>{desc}</span>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
