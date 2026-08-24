import { useAuth } from '../lib/AuthContext'
import Logo from './Logo'

const CLINIC_NAV = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'catalog', label: 'Catalog' },
  { key: 'inventory', label: 'Inventory' },
  { key: 'orders', label: 'Orders' },
  { key: 'payments', label: 'Invoices' },
  { key: 'compliance', label: 'Compliance' },
]

const SUPPLIER_NAV = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'catalog', label: 'My Products' },
  { key: 'orders', label: 'Incoming Orders' },
  { key: 'payments', label: 'Invoices' },
  { key: 'compliance', label: 'Compliance' },
]

export default function Sidebar({ page, setPage, mobileOpen }) {
  const { profile, signOut } = useAuth()
  const nav = profile?.role === 'supplier' ? SUPPLIER_NAV : CLINIC_NAV

  return (
    <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
      <div className="brand">
        <Logo variant="light" size={30} />
      </div>

      <nav>
        {nav.map((item) => (
          <button
            key={item.key}
            className={`nav-item ${page === item.key ? 'active' : ''}`}
            onClick={() => setPage(item.key)}
          >
            <span className="dot" />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="role-pill">{profile?.role || '—'}</div>
        <div className="org-name">{profile?.organization_name || 'Loading…'}</div>
        <a href="/" style={{ display: 'block', fontSize: 11.5, color: '#9FC6C0', marginBottom: 8 }}>← Back to site</a>
        <button className="signout-btn" onClick={signOut}>Sign out</button>
      </div>
    </aside>
  )
}
