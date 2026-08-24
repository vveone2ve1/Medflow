// MEDFLOW brand mark: an infinity loop (navy → green) with a white
// cross at the centre join, reproducing the supplied logo as scalable
// SVG rather than a raster image.
//
// variant:
//   'full'  — mark + wordmark, for light backgrounds (nav, hero, auth)
//   'mark'  — icon only, for tight spaces (favicon-style)
//   'light' — mark + wordmark rendered in white, for dark backgrounds (sidebar)

export default function Logo({ variant = 'full', size = 36 }) {
  const gradientId = `mf-grad-${variant}-${size}`

  const Mark = (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="100" y2="0">
          <stop offset="0%" stopColor="#12275C" />
          <stop offset="48%" stopColor="#1B4A7A" />
          <stop offset="52%" stopColor="#137A5C" />
          <stop offset="100%" stopColor="#16A672" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="50" r="24" stroke={`url(#${gradientId})`} strokeWidth="13" />
      <circle cx="68" cy="50" r="24" stroke={`url(#${gradientId})`} strokeWidth="13" />
      <rect x="44" y="38" width="12" height="24" fill={variant === 'light' ? '#0F172A' : '#F8FAFC'} />
      <rect x="38" y="44" width="24" height="12" fill={variant === 'light' ? '#0F172A' : '#F8FAFC'} />
    </svg>
  )

  if (variant === 'mark') return Mark

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.22 }}>
      {Mark}
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: size * 0.5,
          letterSpacing: '-0.01em',
          color: variant === 'light' ? '#fff' : undefined,
        }}
      >
        {variant === 'light' ? (
          'MEDFLOW'
        ) : (
          <>
            <span style={{ color: '#12275C' }}>MED</span>
            <span style={{ color: '#16A672' }}>FLOW</span>
          </>
        )}
      </span>
    </span>
  )
}
