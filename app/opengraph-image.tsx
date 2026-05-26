import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'CoStack dashboard preview'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px',
          background:
            'radial-gradient(circle at top left, rgba(6,182,212,0.22), transparent 35%), linear-gradient(135deg, #050816 0%, #0a0f1e 52%, #111827 100%)',
          color: '#f8fafc',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: 28,
              background: 'rgba(6,182,212,0.14)',
              border: '1px solid rgba(103,232,249,0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 34,
              fontWeight: 800,
              color: '#67e8f9',
            }}
          >
            CS
          </div>
          <div>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.04em' }}>CoStack</div>
            <div style={{ color: '#94a3b8', fontSize: 18 }}>Administrador Invisible de Suscripciones</div>
          </div>
        </div>

        <div style={{ maxWidth: 820 }}>
          <div style={{ fontSize: 58, lineHeight: 1.02, fontWeight: 800, letterSpacing: '-0.05em' }}>
            Pagos compartidos, acceso ciego y métricas persistidas.
          </div>
          <div style={{ marginTop: 22, fontSize: 24, color: '#cbd5e1', lineHeight: 1.35 }}>
            Sprint 4: SEO, observabilidad y pulido visual sobre una base con Prisma y Next.js 16.
          </div>
        </div>

        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          {['Prisma', 'NextAuth', 'PostgreSQL', 'Stripe'].map((item) => (
            <div
              key={item}
              style={{
                padding: '12px 18px',
                borderRadius: 999,
                background: 'rgba(15,23,42,0.7)',
                border: '1px solid rgba(148,163,184,0.18)',
                color: '#e2e8f0',
                fontSize: 18,
                fontWeight: 600,
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  )
}