export default function TopBar({ title, subtitle, onMenuClick, right }) {
  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          className="btn btn-ghost"
          style={{ display: 'none' }}
          onClick={onMenuClick}
          id="mobile-menu-btn"
        >
          ☰
        </button>
        <div>
          <h1>{title}</h1>
          {subtitle && <div className="subtitle">{subtitle}</div>}
        </div>
      </div>
      <div>{right}</div>
    </header>
  )
}
