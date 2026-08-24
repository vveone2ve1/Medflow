import { Link } from 'react-router-dom'
import {
  ShoppingCart, UserPlus, Truck, Compass, Handshake,
  ShieldCheck, BadgeCheck, Lock, ArrowRight,
  Search, ClipboardCheck, Settings2, Radar, PackageCheck,
} from 'lucide-react'
import { useLanguage } from './LanguageContext'

const WORKFLOW = [
  { icon: Search, label: 'wfSelect', desc: 'wfSelectDesc' },
  { icon: ClipboardCheck, label: 'wfVerify', desc: 'wfVerifyDesc' },
  { icon: Settings2, label: 'wfProcess', desc: 'wfProcessDesc' },
  { icon: Radar, label: 'wfTrack', desc: 'wfTrackDesc' },
  { icon: PackageCheck, label: 'wfDeliver', desc: 'wfDeliverDesc' },
]

export default function Home() {
  const { t } = useLanguage()

  return (
    <div className="mkt-main">
      {/* ---------------- Hero ---------------- */}
      <section className="hero">
        <div>
          <div className="hero-eyebrow">{t('heroEyebrow')}</div>
          <h1>{t('heroTitle')}</h1>
          <p className="hero-sub">{t('heroSub')}</p>

          <div className="hero-ctas">
            <Link to="/login?mode=signup&role=clinic" className="btn btn-primary" style={{ padding: '11px 20px', fontSize: 14.5 }}>
              {t('heroCtaPrimary')} <ArrowRight size={15} />
            </Link>
            <Link to="/login?mode=signup" className="btn btn-ghost" style={{ padding: '11px 20px', fontSize: 14.5 }}>
              {t('heroCtaSecondary')}
            </Link>
          </div>

          <div className="badge-row">
            <span className="trust-badge"><ShieldCheck size={15} /> {t('trustISO')}</span>
            <span className="trust-badge"><BadgeCheck size={15} /> {t('trustGDP')}</span>
            <span className="trust-badge"><Lock size={15} /> {t('trustHIPAA')}</span>
          </div>
        </div>

        {/* Static, non-interactive dashboard preview — evidences the
            "connected" claim without competing with the real dashboard. */}
        <div className="hero-preview" aria-hidden="true">
          <div className="hero-preview-bar"><span /><span /><span /></div>
          <div className="stat-grid" style={{ marginBottom: 14 }}>
            <div className="stat-card" style={{ padding: '12px 14px' }}>
              <div className="label">Open Orders</div>
              <div className="value" style={{ fontSize: 20 }}>12</div>
            </div>
            <div className="stat-card" style={{ padding: '12px 14px' }}>
              <div className="label">Docs Expiring</div>
              <div className="value" style={{ fontSize: 20, color: 'var(--danger)' }}>2</div>
            </div>
          </div>
          <div className="panel" style={{ margin: 0, padding: 14 }}>
            <div style={{ fontSize: 11.5, fontFamily: 'var(--font-mono)', color: 'var(--ink-faint)', marginBottom: 10 }}>
              ORDER #A1B2C3D4
            </div>
            <div className="stepper">
              {['Submitted', 'Confirmed', 'Dispatched', 'In Transit', 'Delivered'].map((s, i) => (
                <div key={s} className={`step ${i < 3 ? 'done' : i === 3 ? 'current' : ''}`}>
                  <div className="line" />
                  <div className="mark">{i < 3 ? '✓' : i + 1}</div>
                  <div className="st-label">{s}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="hero-preview-caption">{t('heroPreviewCaption')}</div>
        </div>
      </section>

      {/* ---------------- Action cards ---------------- */}
      <section className="section">
        <div className="section-head">
          <div className="kicker">{t('actionsKicker')}</div>
          <h2>{t('actionsTitle')}</h2>
        </div>

        <div className="action-grid">
          <Link to="/login?mode=signup&role=clinic" className="action-card primary">
            <div className="ac-icon"><ShoppingCart size={20} /></div>
            <h3>{t('orderTitle')}</h3>
            <p>{t('orderDesc')}</p>
            <span className="ac-cta">{t('heroCtaPrimary')} <ArrowRight size={13} /></span>
          </Link>

          <Link to="/login?mode=signup" className="action-card secondary">
            <div className="ac-icon"><UserPlus size={20} /></div>
            <h3>{t('memberTitle')}</h3>
            <p>{t('memberDesc')}</p>
            <span className="ac-cta">{t('becomeMember')} <ArrowRight size={13} /></span>
          </Link>

          <Link to="/track" className="action-card tertiary">
            <div className="ac-icon"><Truck size={18} /></div>
            <h3>{t('trackTitle')}</h3>
            <p>{t('trackDesc')}</p>
          </Link>

          <Link to="/how-it-works" className="action-card tertiary">
            <div className="ac-icon"><Compass size={18} /></div>
            <h3>{t('howTitle')}</h3>
            <p>{t('howDesc')}</p>
          </Link>

          <Link to="/login?mode=signup&role=supplier" className="action-card tertiary">
            <div className="ac-icon"><Handshake size={18} /></div>
            <h3>{t('suppliersTitle')}</h3>
            <p>{t('suppliersDesc')}</p>
          </Link>
        </div>
      </section>

      {/* ---------------- Workflow ---------------- */}
      <section className="section">
        <div className="section-head">
          <div className="kicker">{t('workflowKicker')}</div>
          <h2>{t('workflowTitle')}</h2>
        </div>

        <div className="workflow-row">
          {WORKFLOW.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="workflow-node"
              role="button"
              tabIndex={0}
              aria-label={t(label)}
            >
              <div className="wf-line" />
              <div className="wf-mark"><Icon size={22} /></div>
              <div className="wf-label">{t(label)}</div>
              <div className="wf-desc">{t(desc)}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
