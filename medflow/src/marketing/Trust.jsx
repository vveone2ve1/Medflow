import { ShieldCheck, BadgeCheck, Lock } from 'lucide-react'

const ITEMS = [
  { icon: ShieldCheck, title: 'ISO 13485', desc: 'Quality management standard for medical device supply chains, applied to how suppliers are verified before listing.' },
  { icon: BadgeCheck, title: 'GDP Certified', desc: 'Good Distribution Practice — cold-chain and short-shelf-life items follow stricter handling and shorter acceptance windows.' },
  { icon: Lock, title: 'HIPAA Compliant', desc: 'Data handling practices aligned with HIPAA safeguards for any clinical or patient-adjacent information.' },
]

export default function Trust() {
  return (
    <div className="mkt-main">
      <div className="content-page">
        <div className="kicker">Trust & Compliance</div>
        <h1>Compliance</h1>
        <p>
          Every supplier on MEDFLOW is verified against regulatory documentation before their
          products appear in the catalog, and every clinic's own licenses and certificates are
          tracked with expiry alerts inside the dashboard.
        </p>
        <div className="domain-list">
          {ITEMS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="domain-item">
              <strong><Icon size={15} style={{ verticalAlign: 'middle', marginRight: 6, color: 'var(--teal-600)' }} />{title}</strong>
              <span>{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
