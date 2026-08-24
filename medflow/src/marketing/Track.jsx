import { Link } from 'react-router-dom'

export default function Track() {
  return (
    <div className="mkt-main">
      <div className="content-page">
        <div className="kicker">Logistics</div>
        <h1>Track an Order</h1>
        <p>
          Every order carries a chain-of-custody record from submission through delivery —
          submitted, confirmed, dispatched, in transit, delivered — with a timestamp at each stage.
        </p>
        <div className="panel" style={{ margin: '20px 0' }}>
          <div className="stepper">
            {['Submitted', 'Confirmed', 'Dispatched', 'In Transit', 'Delivered'].map((s, i) => (
              <div key={s} className={`step ${i < 2 ? 'done' : i === 2 ? 'current' : ''}`}>
                <div className="line" />
                <div className="mark">{i < 2 ? '✓' : i + 1}</div>
                <div className="st-label">{s}</div>
              </div>
            ))}
          </div>
        </div>
        <p>
          Order tracking is tied to your account, since it shows commercial details between your
          clinic and its suppliers. Sign in to look up a specific order.
        </p>
        <Link to="/login" className="btn btn-primary">Log in to track an order</Link>
      </div>
    </div>
  )
}
