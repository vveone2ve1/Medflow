import { NavLink, Link, Outlet } from 'react-router-dom'
import Logo from '../components/Logo'
import LanguageToggle from './LanguageToggle'
import { useLanguage } from './LanguageContext'

export default function MarketingLayout() {
  const { t } = useLanguage()

  const navLink = ({ isActive }) => `mkt-nav-link ${isActive ? 'active' : ''}`

  return (
    <div>
      <header className="mkt-header">
        <Link to="/" aria-label="MEDFLOW home">
          <Logo variant="full" size={34} />
        </Link>

        <nav className="mkt-nav" aria-label="Main">
          <NavLink to="/products" className={navLink}>{t('navProducts')}</NavLink>
          <NavLink to="/how-it-works" className={navLink}>{t('navHow')}</NavLink>
          <NavLink to="/payment" className={navLink}>{t('navPayment')}</NavLink>
          <NavLink to="/trust" className={navLink}>{t('navTrust')}</NavLink>
          <NavLink to="/track" className={navLink}>{t('navTrack')}</NavLink>
        </nav>

        <div className="mkt-nav-actions">
          <LanguageToggle />
          <Link to="/login" className="btn btn-ghost">{t('login')}</Link>
          <Link to="/login?mode=signup" className="btn btn-primary">{t('becomeMember')}</Link>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="mkt-footer">
        <div className="mkt-footer-grid">
          <div className="mkt-footer-col" style={{ maxWidth: 280 }}>
            <Logo variant="full" size={30} />
            <p style={{ fontSize: 13, color: 'var(--ink-muted)', marginTop: 12, lineHeight: 1.6 }}>
              {t('footerTagline')}
            </p>
          </div>
          <div className="mkt-footer-col">
            <h4>Platform</h4>
            <Link to="/products">{t('navProducts')}</Link>
            <Link to="/how-it-works">{t('navHow')}</Link>
            <Link to="/payment">{t('navPayment')}</Link>
          </div>
          <div className="mkt-footer-col">
            <h4>Trust</h4>
            <Link to="/trust">{t('navTrust')}</Link>
            <Link to="/track">{t('navTrack')}</Link>
          </div>
          <div className="mkt-footer-col">
            <h4>Account</h4>
            <Link to="/login">{t('login')}</Link>
            <Link to="/login?mode=signup">{t('becomeMember')}</Link>
          </div>
        </div>
        <div className="mkt-footer-bottom">
          <span>© {new Date().getFullYear()} MEDFLOW</span>
          <span>ISO 13485 · GDP · HIPAA</span>
        </div>
      </footer>
    </div>
  )
}
