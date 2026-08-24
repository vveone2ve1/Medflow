import { ShieldCheck, Split, FileCheck } from 'lucide-react'

export default function Payment() {
  return (
    <div className="mkt-main">
      <div className="content-page">
        <div className="kicker">Payment</div>
        <h1>Payment</h1>
        <p>
          Funds move through a licensed payment partner rather than settling in MEDFLOW's own
          accounts — your payment is held under the partner's regulated structure and released to
          the supplier once the order terms are met.
        </p>
        <div className="domain-list">
          <div className="domain-item">
            <strong><ShieldCheck size={15} style={{ verticalAlign: 'middle', marginRight: 6, color: 'var(--teal-600)' }} />Licensed custody</strong>
            <span>Payments are processed through a regulated payment partner, not held directly by MEDFLOW.</span>
          </div>
          <div className="domain-item">
            <strong><Split size={15} style={{ verticalAlign: 'middle', marginRight: 6, color: 'var(--teal-600)' }} />Transparent split</strong>
            <span>Every invoice shows what the clinic pays and what the supplier receives.</span>
          </div>
          <div className="domain-item">
            <strong><FileCheck size={15} style={{ verticalAlign: 'middle', marginRight: 6, color: 'var(--teal-600)' }} />Tax invoices</strong>
            <span>Issued by the seller of record for every order, in line with local tax requirements.</span>
          </div>
        </div>
        <p style={{ marginTop: 24 }}>
          Higher-value orders may have supplier payout held until the return window closes, to
          protect clinics on larger purchases. Full invoice and payout status are visible in your
          dashboard once you're signed in.
        </p>
      </div>
    </div>
  )
}
